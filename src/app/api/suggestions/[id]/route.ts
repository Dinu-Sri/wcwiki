import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { syncArticle } from "@/lib/search/sync";

const ROLE_LEVEL: Record<string, number> = { USER: 0, EDITOR: 1, APPROVER: 2, SUPER_ADMIN: 3 };

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/suggestions/[id] — Get suggestion details
export async function GET(req: NextRequest, { params }: RouteParams) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  const { id } = await params;
  const suggestion = await db.suggestion.findUnique({
    where: { id },
    include: {
      requestedBy: { select: { id: true, name: true, image: true } },
      claimedBy: { select: { id: true, name: true } },
    },
  });

  if (!suggestion) {
    return NextResponse.json({ error: "Suggestion not found" }, { status: 404 });
  }

  // Only the requester, claimer or EDITOR+ can view
  const level = ROLE_LEVEL[session.user.role as string] || 0;
  if (suggestion.requestedById !== session.user.id && suggestion.claimedById !== session.user.id && level < 1) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return NextResponse.json({ data: suggestion });
}

// PATCH /api/suggestions/[id] — Update suggestion status
export async function PATCH(req: NextRequest, { params }: RouteParams) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();
  const { action, publishedEntityType, publishedEntityId } = body as {
    action: string;
    publishedEntityType?: string;
    publishedEntityId?: string;
  };

  const suggestion = await db.suggestion.findUnique({ where: { id } });
  if (!suggestion) {
    return NextResponse.json({ error: "Suggestion not found" }, { status: 404 });
  }

  const level = ROLE_LEVEL[session.user.role as string] || 0;

  switch (action) {
    case "claim": {
      if (level < 1) return NextResponse.json({ error: "Editor access required" }, { status: 403 });
      if (suggestion.status !== "OPEN") return NextResponse.json({ error: "Can only claim OPEN suggestions" }, { status: 400 });

      const updated = await db.suggestion.update({
        where: { id },
        data: { status: "CLAIMED", claimedById: session.user.id, claimedAt: new Date() },
      });

      // Notify requester
      await db.notification.create({
        data: {
          userId: suggestion.requestedById,
          type: "SUGGESTION_CLAIMED",
          message: `Your suggestion "${suggestion.topic || "translation request"}" has been claimed by an editor.`,
          link: "/dashboard",
          suggestionId: id,
        },
      });

      // Build redirect URL based on suggestion type
      let redirectUrl = "/dashboard";
      if (suggestion.type === "NEW_ARTICLE") {
        redirectUrl = `/edit/article/new?suggestion=${id}`;
      } else if (suggestion.entityType && suggestion.entityId) {
        // For translation suggestions, look up the entity slug
        const entitySlug = suggestion.entityId;
        if (suggestion.type === "TRANSLATE_ARTICLE") {
          redirectUrl = `/edit/article/${entitySlug}`;
        } else if (suggestion.type === "TRANSLATE_ARTIST") {
          redirectUrl = `/edit/artist/${entitySlug}`;
        }
      }

      return NextResponse.json({ data: updated, redirectUrl });
    }

    case "in_progress": {
      if (level < 1) return NextResponse.json({ error: "Editor access required" }, { status: 403 });
      if (suggestion.claimedById !== session.user.id && level < 2) {
        return NextResponse.json({ error: "Only the claimer or approver can update progress" }, { status: 403 });
      }
      const updated = await db.suggestion.update({
        where: { id },
        data: { status: "IN_PROGRESS" },
      });
      return NextResponse.json({ data: updated });
    }

    case "publish": {
      if (level < 1) return NextResponse.json({ error: "Editor access required" }, { status: 403 });

      const updated = await db.suggestion.update({
        where: { id },
        data: {
          status: "PUBLISHED",
          publishedAt: new Date(),
          publishedEntityType: publishedEntityType as import("@prisma/client").EntityType || null,
          publishedEntityId: publishedEntityId || null,
        },
      });

      // Determine link based on published entity
      let link = "/dashboard";
      if (publishedEntityType && publishedEntityId) {
        const slugRecord = publishedEntityType === "ARTICLE"
          ? await db.article.findUnique({ where: { id: publishedEntityId }, select: { slug: true } })
          : publishedEntityType === "ARTIST"
            ? await db.artist.findUnique({ where: { id: publishedEntityId }, select: { slug: true } })
            : null;
        if (slugRecord) {
          const prefix = publishedEntityType === "ARTICLE" ? "articles" : "artists";
          link = `/${prefix}/${slugRecord.slug}`;
        }
      }

      // Notify requester
      await db.notification.create({
        data: {
          userId: suggestion.requestedById,
          type: "SUGGESTION_PUBLISHED",
          message: `Your suggestion "${suggestion.topic || "translation request"}" has been published!`,
          link,
          suggestionId: id,
        },
      });

      return NextResponse.json({ data: updated });
    }

    case "approve_article": {
      // APPROVER+ only: approve the linked PENDING article and mark suggestion as PUBLISHED
      if (level < 2) return NextResponse.json({ error: "Approver access required" }, { status: 403 });
      if (!suggestion.publishedEntityId) {
        return NextResponse.json({ error: "No article linked to this suggestion" }, { status: 400 });
      }

      // Approve the article
      const article = await db.article.update({
        where: { id: suggestion.publishedEntityId },
        data: {
          status: "APPROVED",
          publishedAt: new Date(),
        },
      });

      // Sync to MeiliSearch
      try {
        await syncArticle(article.id);
      } catch (err) {
        console.error("Failed to sync article to MeiliSearch:", err);
      }

      // Mark suggestion as PUBLISHED
      const updated = await db.suggestion.update({
        where: { id },
        data: {
          status: "PUBLISHED",
          publishedAt: new Date(),
        },
      });

      // Notify requester
      await db.notification.create({
        data: {
          userId: suggestion.requestedById,
          type: "SUGGESTION_PUBLISHED",
          message: `Your suggestion "${suggestion.topic || "translation request"}" has been published!`,
          link: `/articles/${article.slug}`,
          suggestionId: id,
        },
      });

      return NextResponse.json({ data: updated });
    }

    case "reject": {
      if (level < 1) return NextResponse.json({ error: "Editor access required" }, { status: 403 });

      const updated = await db.suggestion.update({
        where: { id },
        data: { status: "REJECTED" },
      });

      await db.notification.create({
        data: {
          userId: suggestion.requestedById,
          type: "SUGGESTION_REJECTED",
          message: `Your suggestion "${suggestion.topic || "translation request"}" was not accepted.`,
          link: "/dashboard",
          suggestionId: id,
        },
      });

      return NextResponse.json({ data: updated });
    }

    case "unclaim": {
      if (suggestion.claimedById !== session.user.id && level < 2) {
        return NextResponse.json({ error: "Only the claimer or approver can unclaim" }, { status: 403 });
      }
      const updated = await db.suggestion.update({
        where: { id },
        data: { status: "OPEN", claimedById: null, claimedAt: null },
      });
      return NextResponse.json({ data: updated });
    }

    default:
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }
}
