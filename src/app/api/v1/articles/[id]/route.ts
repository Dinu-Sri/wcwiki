import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireApiKey } from "@/lib/api-auth";
import { syncArticle, removeArticle } from "@/lib/search/sync";

// GET /api/v1/articles/[id]
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const result = await requireApiKey(req, "read");
  if (result instanceof NextResponse) return result;

  const { id } = await params;
  const article = await db.article.findFirst({
    where: { OR: [{ id }, { slug: id }] },
    include: { author: { select: { id: true, name: true } } },
  });

  if (!article) {
    return NextResponse.json({ error: "Article not found" }, { status: 404 });
  }

  return NextResponse.json({ data: article });
}

// PATCH /api/v1/articles/[id]
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const result = await requireApiKey(req, "write");
  if (result instanceof NextResponse) return result;

  const { id } = await params;
  const body = await req.json();

  const allowedFields = ["title", "body", "coverImage", "tags", "excerpt", "language", "references", "status"];
  const data: Record<string, unknown> = {};
  for (const field of allowedFields) {
    if (body[field] !== undefined) data[field] = body[field];
  }

  // If status changed to APPROVED, set publishedAt
  if (data.status === "APPROVED") {
    data.publishedAt = new Date();
  }

  const article = await db.article.update({ where: { id }, data });

  try { await syncArticle(article.id); } catch {}

  return NextResponse.json({ data: article });
}

// DELETE /api/v1/articles/[id]
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const result = await requireApiKey(req, "delete");
  if (result instanceof NextResponse) return result;

  const { id } = await params;
  await db.article.delete({ where: { id } });

  try { await removeArticle(id); } catch {}

  return NextResponse.json({ success: true });
}
