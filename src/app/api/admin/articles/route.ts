import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { generateSlug } from "@/lib/slug";
import { syncArticle, syncSuggestions } from "@/lib/search/sync";

// POST /api/admin/articles — Create article (APPROVER+ only)
export async function POST(req: NextRequest) {
  const session = await auth();
  if (
    !session?.user ||
    (session.user.role !== "SUPER_ADMIN" && session.user.role !== "APPROVER")
  ) {
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
      status: "APPROVED",
      language: "en",
      publishedAt: new Date(),
    },
  });

  // Sync to MeiliSearch
  try {
    await syncArticle(article.id);
    await syncSuggestions();
  } catch (err) {
    console.error("Failed to sync new article to MeiliSearch:", err);
  }

  // If created from a suggestion, mark it as published
  if (suggestionId) {
    try {
      await db.suggestion.update({
        where: { id: suggestionId },
        data: {
          status: "PUBLISHED",
          publishedAt: new Date(),
          publishedEntityType: "ARTICLE",
          publishedEntityId: article.id,
        },
      });

      // Notify the suggestion requester
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
    } catch (err) {
      console.error("Failed to update suggestion:", err);
    }
  }

  return NextResponse.json({ data: article }, { status: 201 });
}
