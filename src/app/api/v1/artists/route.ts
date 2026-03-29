import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireApiKey, ApiKeyUser } from "@/lib/api-auth";
import { generateSlug } from "@/lib/slug";
import { syncArtist, syncSuggestions } from "@/lib/search/sync";

// GET /api/v1/artists — List artists
export async function GET(req: NextRequest) {
  const result = await requireApiKey(req, "read");
  if (result instanceof NextResponse) return result;

  const { searchParams } = new URL(req.url);
  const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 100);
  const offset = parseInt(searchParams.get("offset") || "0");
  const search = searchParams.get("search");

  const where: Record<string, unknown> = {};
  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { nationality: { contains: search, mode: "insensitive" } },
    ];
  }

  const [artists, total] = await Promise.all([
    db.artist.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: offset,
      take: limit,
    }),
    db.artist.count({ where }),
  ]);

  return NextResponse.json({ data: artists, total, limit, offset });
}

// POST /api/v1/artists — Create artist
export async function POST(req: NextRequest) {
  const result = await requireApiKey(req, "write");
  if (result instanceof NextResponse) return result;
  const apiUser = result as ApiKeyUser;

  const body = await req.json();
  const { name, bio, nationality, birthYear, deathYear, styles, image, website, socialLinks, references } = body;

  if (!name || typeof name !== "string") {
    return NextResponse.json({ error: "name is required" }, { status: 400 });
  }

  const slug = await generateSlug(name, "artist");

  const artist = await db.artist.create({
    data: {
      name,
      slug,
      bio: bio || null,
      nationality: nationality || null,
      birthYear: birthYear || null,
      deathYear: deathYear || null,
      styles: Array.isArray(styles) ? styles : [],
      image: image || null,
      website: website || null,
      socialLinks: socialLinks || null,
      references: references || "[]",
    },
  });

  // Sync to MeiliSearch
  try { await syncArtist(artist.id); await syncSuggestions(); } catch {}

  return NextResponse.json({ data: artist }, { status: 201 });
}
