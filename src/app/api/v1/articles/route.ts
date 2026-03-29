import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireApiKey, ApiKeyUser } from "@/lib/api-auth";
import { generateSlug } from "@/lib/slug";
import { syncArticle, syncSuggestions } from "@/lib/search/sync";

// GET /api/v1/articles — List articles
export async function GET(req: NextRequest) {
  const result = await requireApiKey(req, "read");
  if (result instanceof NextResponse) return result;

  const { searchParams } = new URL(req.url);
  const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 100);
  const offset = parseInt(searchParams.get("offset") || "0");
  const search = searchParams.get("search");
  const status = searchParams.get("status");

  const where: Record<string, unknown> = {};
  if (search) {
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { tags: { has: search } },
    ];
  }
  if (status) where.status = status;

  const [articles, total] = await Promise.all([
    db.article.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: offset,
      take: limit,
      include: { author: { select: { id: true, name: true } } },
    }),
    db.article.count({ where }),
  ]);

  return NextResponse.json({ data: articles, total, limit, offset });
}

// POST /api/v1/articles — Create article
export async function POST(req: NextRequest) {
  const result = await requireApiKey(req, "write");
  if (result instanceof NextResponse) return result;
  const apiUser = result as ApiKeyUser;

  const body = await req.json();
  const { title, body: articleBody, coverImage, tags, excerpt, language, references, status: articleStatus } = body;

  if (!title || typeof title !== "string") {
    return NextResponse.json({ error: "title is required" }, { status: 400 });
  }
  if (!articleBody || typeof articleBody !== "string") {
    return NextResponse.json({ error: "body is required" }, { status: 400 });
  }

  const slug = await generateSlug(title, "article");

  const article = await db.article.create({
    data: {
      title,
      slug,
      body: articleBody,
      coverImage: coverImage || null,
      authorId: apiUser.id,
      status: articleStatus === "APPROVED" ? "APPROVED" : "DRAFT",
      language: language || "en",
      tags: Array.isArray(tags) ? tags : [],
      excerpt: excerpt || null,
      references: references || "[]",
      publishedAt: articleStatus === "APPROVED" ? new Date() : null,
    },
  });

  try { await syncArticle(article.id); await syncSuggestions(); } catch {}

  return NextResponse.json({ data: article }, { status: 201 });
}
