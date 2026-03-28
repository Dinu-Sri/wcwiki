import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireApiKey } from "@/lib/api-auth";
import { syncPainting, removePainting } from "@/lib/search/sync";

// GET /api/v1/paintings/[id]
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const result = await requireApiKey(req, "read");
  if (result instanceof NextResponse) return result;

  const { id } = await params;
  const painting = await db.painting.findFirst({
    where: { OR: [{ id }, { slug: id }] },
    include: { artist: { select: { id: true, name: true, slug: true } } },
  });

  if (!painting) {
    return NextResponse.json({ error: "Painting not found" }, { status: 404 });
  }

  return NextResponse.json({ data: painting });
}

// PATCH /api/v1/paintings/[id]
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const result = await requireApiKey(req, "write");
  if (result instanceof NextResponse) return result;

  const { id } = await params;
  const body = await req.json();

  const allowedFields = ["title", "description", "medium", "surface", "width", "height", "year", "tags", "images", "sourceUrl", "attribution"];
  const data: Record<string, unknown> = {};
  for (const field of allowedFields) {
    if (body[field] !== undefined) data[field] = body[field];
  }

  const painting = await db.painting.update({ where: { id }, data });

  try { await syncPainting(painting.id); } catch {}

  return NextResponse.json({ data: painting });
}

// DELETE /api/v1/paintings/[id]
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const result = await requireApiKey(req, "delete");
  if (result instanceof NextResponse) return result;

  const { id } = await params;
  await db.painting.delete({ where: { id } });

  try { await removePainting(id); } catch {}

  return NextResponse.json({ success: true });
}
