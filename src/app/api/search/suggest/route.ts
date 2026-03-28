import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { meili, INDEXES } from "@/lib/search/client";

type Suggestion = { text: string; type: string; sourceSlug: string | null; highlighted: string; count?: number };

// GET /api/search/suggest — Content-aware suggestions + trending
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim() || "";
  const limit = Math.min(parseInt(searchParams.get("limit") || "8"), 20);

  // If user is typing, query MeiliSearch main indexes + popular past queries
  if (q.length >= 1) {
    const items: Suggestion[] = [];
    const seen = new Set<string>();

    const add = (s: Suggestion) => {
      const key = s.text.toLowerCase();
      if (seen.has(key)) return;
      seen.add(key);
      items.push(s);
    };

    // 1. Query the MAIN MeiliSearch indexes (artists, paintings, articles)
    //    These are the same indexes the search page uses — known to work.
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const searchOpts: any = {
        limit: 3,
        attributesToHighlight: ["name", "title"],
        highlightPreTag: "<mark>",
        highlightPostTag: "</mark>",
        matchingStrategy: "frequency",
      };

      const [artists, paintings, articles] = await Promise.all([
        meili.index(INDEXES.ARTISTS).search(q, searchOpts).catch(() => ({ hits: [] as any[] })),
        meili.index(INDEXES.PAINTINGS).search(q, searchOpts).catch(() => ({ hits: [] as any[] })),
        meili.index(INDEXES.ARTICLES).search(q, searchOpts).catch(() => ({ hits: [] as any[] })),
      ]);

      for (const h of artists.hits) {
        add({ text: h.name as string, type: "artist", sourceSlug: `/artists/${h.slug}`, highlighted: (h._formatted?.name as string) || (h.name as string) });
      }
      for (const h of paintings.hits) {
        add({ text: h.title as string, type: "painting", sourceSlug: `/paintings/${h.slug}`, highlighted: (h._formatted?.title as string) || (h.title as string) });
      }
      for (const h of articles.hits) {
        add({ text: h.title as string, type: "article", sourceSlug: `/articles/${h.slug}`, highlighted: (h._formatted?.title as string) || (h.title as string) });
      }
    } catch (err) {
      console.error("[suggest] MeiliSearch error:", err);
    }

    // 2. Popular past queries from DB (case-insensitive contains)
    try {
      const popular = await db.searchQuery.groupBy({
        by: ["query"],
        where: {
          query: { contains: q, mode: "insensitive" },
          createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
        },
        _count: { query: true },
        orderBy: { _count: { query: "desc" } },
        take: limit,
      });
      for (const p of popular) {
        add({ text: p.query, type: "query", sourceSlug: null, highlighted: p.query });
      }
    } catch (err) {
      console.error("[suggest] DB error:", err);
    }

    return NextResponse.json({ suggestions: items.slice(0, limit) });
  }

  // No input: return overall trending terms (last 7 days)
  const trending = await db.searchQuery.groupBy({
    by: ["query"],
    where: {
      createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
    },
    _count: { query: true },
    orderBy: { _count: { query: "desc" } },
    take: limit,
  });

  return NextResponse.json({
    suggestions: trending.map((t) => ({
      text: t.query,
      type: "trending",
      sourceSlug: null,
      highlighted: t.query,
      count: t._count.query,
    })),
    trending: true,
  });
}
