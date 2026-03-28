import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { deleteUpload } from "@/lib/storage";

// GET /api/media/[id] — Single media item with usage info
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (
    !session?.user ||
    !["EDITOR", "APPROVER", "SUPER_ADMIN"].includes(session.user.role as string)
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const media = await db.media.findUnique({
    where: { id },
    include: { uploadedBy: { select: { id: true, name: true, email: true } } },
  });

  if (!media) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Scan for usage across entities
  const usage: { type: string; id: string; title: string }[] = [];

  // Check Painting.images[]
  const paintings = await db.painting.findMany({
    where: { images: { has: media.url } },
    select: { id: true, title: true },
  });
  for (const p of paintings) {
    usage.push({ type: "painting", id: p.id, title: p.title });
  }

  // Check Artist.image
  const artists = await db.artist.findMany({
    where: { image: media.url },
    select: { id: true, name: true },
  });
  for (const a of artists) {
    usage.push({ type: "artist", id: a.id, title: a.name });
  }

  // Check Article.body (HTML contains URL)
  const articles = await db.article.findMany({
    where: { body: { contains: media.url } },
    select: { id: true, title: true },
  });
  for (const a of articles) {
    usage.push({ type: "article", id: a.id, title: a.title });
  }

  return NextResponse.json({ ...media, usage });
}

// PATCH /api/media/[id] — Update alt text or filename
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (
    !session?.user ||
    !["APPROVER", "SUPER_ADMIN"].includes(session.user.role as string)
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();

  const data: Record<string, string> = {};
  if (typeof body.alt === "string") data.alt = body.alt;
  if (typeof body.filename === "string") data.filename = body.filename;

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: "No fields to update" }, { status: 400 });
  }

  const updated = await db.media.update({ where: { id }, data });
  return NextResponse.json(updated);
}

// DELETE /api/media/[id] — Delete file and record
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (
    !session?.user ||
    !["APPROVER", "SUPER_ADMIN"].includes(session.user.role as string)
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const media = await db.media.findUnique({ where: { id } });
  if (!media) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Delete file from disk
  await deleteUpload(media.url);

  // Delete DB record
  await db.media.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
