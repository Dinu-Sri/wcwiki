import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type");
  const slug = searchParams.get("slug");

  if (!type || !slug) {
    return NextResponse.json(
      { error: "type and slug are required" },
      { status: 400 }
    );
  }

  switch (type) {
    case "artist": {
      const artist = await db.artist.findUnique({ where: { slug } });
      if (!artist) return NextResponse.json({ error: "Not found" }, { status: 404 });
      return NextResponse.json(artist);
    }
    case "painting": {
      const painting = await db.painting.findUnique({
        where: { slug },
        include: { artist: { select: { name: true, slug: true } } },
      });
      if (!painting) return NextResponse.json({ error: "Not found" }, { status: 404 });
      return NextResponse.json(painting);
    }
    case "article": {
      const article = await db.article.findUnique({
        where: { slug },
        include: { author: { select: { name: true } } },
      });
      if (!article) return NextResponse.json({ error: "Not found" }, { status: 404 });
      return NextResponse.json(article);
    }
    default:
      return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  }
}
