import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireApiKey, ApiKeyUser } from "@/lib/api-auth";
import { generateSlug } from "@/lib/slug";
import { syncPainting } from "@/lib/search/sync";

// GET /api/v1/paintings — List paintings
export async function GET(req: NextRequest) {
  const result = await requireApiKey(req, "read");
  if (result instanceof NextResponse) return result;

  const { searchParams } = new URL(req.url);
  const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 100);
  const offset = parseInt(searchParams.get("offset") || "0");
  const search = searchParams.get("search");
  const artistId = searchParams.get("artistId");

  const where: Record<string, unknown> = {};
  if (search) {
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { medium: { contains: search, mode: "insensitive" } },
    ];
  }
  if (artistId) where.artistId = artistId;

  const [paintings, total] = await Promise.all([
    db.painting.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: offset,
      take: limit,
      include: { artist: { select: { id: true, name: true, slug: true } } },
    }),
    db.painting.count({ where }),
  ]);

  return NextResponse.json({ data: paintings, total, limit, offset });
}

// POST /api/v1/paintings — Create painting
export async function POST(req: NextRequest) {
  const result = await requireApiKey(req, "write");
  if (result instanceof NextResponse) return result;
  const apiUser = result as ApiKeyUser;

  const body = await req.json();
  const { title, artistId, description, medium, surface, width, height, year, tags, images, sourceUrl, attribution } = body;

  if (!title || typeof title !== "string") {
    return NextResponse.json({ error: "title is required" }, { status: 400 });
  }
  if (!artistId || typeof artistId !== "string") {
    return NextResponse.json({ error: "artistId is required" }, { status: 400 });
  }

  // Verify artist exists
  const artist = await db.artist.findUnique({ where: { id: artistId } });
  if (!artist) {
    return NextResponse.json({ error: "Artist not found" }, { status: 404 });
  }

  const slug = await generateSlug(title, "painting");

  const painting = await db.painting.create({
    data: {
      title,
      slug,
      artistId,
      description: description || null,
      medium: medium || null,
      surface: surface || null,
      width: width || null,
      height: height || null,
      year: year || null,
      tags: Array.isArray(tags) ? tags : [],
      images: Array.isArray(images) ? images : [],
      sourceUrl: sourceUrl || null,
      attribution: attribution || null,
    },
  });

  try { await syncPainting(painting.id); } catch {}

  return NextResponse.json({ data: painting }, { status: 201 });
}
