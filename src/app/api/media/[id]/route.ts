import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { deleteUpload, replaceUpload } from "@/lib/storage";

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

const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
];
const MAX_FILE_SIZE = 10 * 1024 * 1024;

// PUT /api/media/[id] — Replace file with a new optimized version (keeps same URL)
export async function PUT(
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

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json(
      { error: "File type not allowed. Use JPEG, PNG, WebP, GIF, or AVIF." },
      { status: 400 }
    );
  }

  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json(
      { error: "File too large. Maximum size is 10MB." },
      { status: 400 }
    );
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const result = await replaceUpload(media.url, buffer);

  const updated = await db.media.update({
    where: { id },
    data: {
      width: result.width,
      height: result.height,
      size: result.size,
      format: result.format,
    },
  });

  return NextResponse.json({
    ...updated,
    width: result.width,
    height: result.height,
    size: result.size,
  });
}
