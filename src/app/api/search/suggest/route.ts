import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET /api/search/suggest — Popular/trending search terms
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim().toLowerCase() || "";
  const limit = Math.min(parseInt(searchParams.get("limit") || "8"), 20);

  // If user is typing, return matching popular terms
  if (q.length >= 1) {
    const popular = await db.searchQuery.groupBy({
      by: ["query"],
      where: {
        query: { startsWith: q },
        createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }, // last 30 days
      },
      _count: { query: true },
      orderBy: { _count: { query: "desc" } },
      take: limit,
    });

    return NextResponse.json({
      suggestions: popular.map((p) => ({
        query: p.query,
        count: p._count.query,
      })),
    });
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
      query: t.query,
      count: t._count.query,
    })),
    trending: true,
  });
}
