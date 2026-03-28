import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireApiKey } from "@/lib/api-auth";
import { syncArtist, removeArtist } from "@/lib/search/sync";

// GET /api/v1/artists/[id] — Get single artist
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const result = await requireApiKey(req, "read");
  if (result instanceof NextResponse) return result;

  const { id } = await params;
  const artist = await db.artist.findFirst({
    where: { OR: [{ id }, { slug: id }] },
    include: { paintings: { select: { id: true, title: true, slug: true } } },
  });

  if (!artist) {
    return NextResponse.json({ error: "Artist not found" }, { status: 404 });
  }

  return NextResponse.json({ data: artist });
}

// PATCH /api/v1/artists/[id] — Update artist
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const result = await requireApiKey(req, "write");
  if (result instanceof NextResponse) return result;

  const { id } = await params;
  const body = await req.json();

  const allowedFields = ["name", "bio", "nationality", "birthYear", "deathYear", "styles", "image", "website", "socialLinks", "references"];
  const data: Record<string, unknown> = {};
  for (const field of allowedFields) {
    if (body[field] !== undefined) data[field] = body[field];
  }

  const artist = await db.artist.update({ where: { id }, data });

  try { await syncArtist(artist.id); } catch {}

  return NextResponse.json({ data: artist });
}

// DELETE /api/v1/artists/[id] — Delete artist
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const result = await requireApiKey(req, "delete");
  if (result instanceof NextResponse) return result;

  const { id } = await params;
  await db.artist.delete({ where: { id } });

  try { await removeArtist(id); } catch {}

  return NextResponse.json({ success: true });
}
