import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { meili, INDEXES } from "@/lib/search/client";

// GET /api/search/suggest — Content-aware suggestions + trending
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim().toLowerCase() || "";
  const limit = Math.min(parseInt(searchParams.get("limit") || "8"), 20);

  // If user is typing, query MeiliSearch suggestions index
  if (q.length >= 1) {
    try {
      const results = await meili.index(INDEXES.SUGGESTIONS).search(q, {
        limit,
        attributesToHighlight: ["text"],
        highlightPreTag: "<mark>",
        highlightPostTag: "</mark>",
        matchingStrategy: "frequency",
      });

      return NextResponse.json({
        suggestions: results.hits.map((hit) => ({
          text: hit.text as string,
          type: hit.type as string,
          sourceSlug: (hit.sourceSlug as string) || null,
          highlighted: (hit._formatted?.text as string) || (hit.text as string),
        })),
      });
    } catch {
      // Fallback to Prisma if MeiliSearch is unavailable
      const popular = await db.searchQuery.groupBy({
        by: ["query"],
        where: {
          query: { startsWith: q },
          createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
        },
        _count: { query: true },
        orderBy: { _count: { query: "desc" } },
        take: limit,
      });

      return NextResponse.json({
        suggestions: popular.map((p) => ({
          text: p.query,
          type: "query",
          sourceSlug: null,
          highlighted: p.query,
        })),
      });
    }
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
