import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { generateSlug } from "@/lib/slug";
import { syncArticle, syncSuggestions } from "@/lib/search/sync";

// POST /api/articles/create — Create article (EDITOR+ can access)
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const allowedRoles = ["EDITOR", "APPROVER", "SUPER_ADMIN"];
  if (!allowedRoles.includes(session.user.role as string)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const { title, body: articleBody, excerpt, tags, references, suggestionId } = body;

  if (!title || typeof title !== "string") {
    return NextResponse.json({ error: "Title is required" }, { status: 400 });
  }
  if (!articleBody || typeof articleBody !== "string") {
    return NextResponse.json({ error: "Body is required" }, { status: 400 });
  }

  const isApprover =
    session.user.role === "APPROVER" || session.user.role === "SUPER_ADMIN";
  const articleStatus = isApprover ? "APPROVED" : "PENDING";

  const slug = await generateSlug(title, "article");

  const article = await db.article.create({
    data: {
      title,
      slug,
      body: articleBody,
      excerpt: excerpt || null,
      tags: Array.isArray(tags) ? tags : [],
      references: references ? (typeof references === "string" ? JSON.parse(references) : references) : [],
      authorId: session.user.id,
      status: articleStatus,
      language: "en",
      publishedAt: isApprover ? new Date() : null,
    },
  });

  // Sync to MeiliSearch (only indexes APPROVED articles)
  try {
    await syncArticle(article.id);
    await syncSuggestions();
  } catch (err) {
    console.error("Failed to sync new article to MeiliSearch:", err);
  }

  // If created from a suggestion, update the suggestion
  if (suggestionId) {
    try {
      const updateData: Record<string, unknown> = {
        publishedEntityType: "ARTICLE" as const,
        publishedEntityId: article.id,
      };

      // If approver, mark suggestion as PUBLISHED immediately
      if (isApprover) {
        updateData.status = "PUBLISHED";
        updateData.publishedAt = new Date();
      } else {
        // Editor: mark as IN_PROGRESS (article created but pending approval)
        updateData.status = "IN_PROGRESS";
      }

      await db.suggestion.update({
        where: { id: suggestionId },
        data: updateData,
      });

      // Notify the suggestion requester
      if (isApprover) {
        const suggestion = await db.suggestion.findUnique({
          where: { id: suggestionId },
          select: { requestedById: true, topic: true },
        });
        if (suggestion) {
          await db.notification.create({
            data: {
              userId: suggestion.requestedById,
              type: "SUGGESTION_PUBLISHED",
              message: `Your suggestion "${suggestion.topic}" has been published!`,
              link: `/articles/${slug}`,
              suggestionId,
            },
          });
        }
      }
    } catch (err) {
      console.error("Failed to update suggestion:", err);
    }
  }

  return NextResponse.json({ data: article }, { status: 201 });
}
