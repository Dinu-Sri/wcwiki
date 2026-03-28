import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

type Suggestion = { text: string; highlighted: string; count?: number };

// ─── Quality Rules ─────────────────────────────────────────────────────────
// See docs/SEARCH-RULES.md for full documentation
// Auto-suggest uses ONLY past user queries — no content titles, tags, or names.
const MIN_QUERY_LENGTH = 3;       // Ignore queries shorter than 3 chars
const MIN_QUERY_COUNT = 2;        // Queries need ≥2 occurrences to appear as suggestions
const DB_WINDOW_DAYS = 90;        // Look back 90 days for popular queries
const TRENDING_WINDOW_DAYS = 7;   // Look back 7 days for trending
const TRENDING_MIN_COUNT = 1;     // Minimum searches to appear in trending
// ────────────────────────────────────────────────────────────────────────────

// Check if a query looks like a real search (not a partial keystroke)
function isQualityQuery(q: string): boolean {
  if (q.length < MIN_QUERY_LENGTH) return false;
  if (/^(.)\1+$/.test(q)) return false;
  return true;
}

// GET /api/search/suggest — Past-query-only suggestions (Google-style)
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim() || "";
  const limit = Math.min(parseInt(searchParams.get("limit") || "8"), 20);

  if (q.length >= 1) {
    const ql = q.toLowerCase();
    const items: Suggestion[] = [];

    try {
      const popular = await db.searchQuery.groupBy({
        by: ["query"],
        where: {
          query: { contains: q, mode: "insensitive" },
          createdAt: { gte: new Date(Date.now() - DB_WINDOW_DAYS * 24 * 60 * 60 * 1000) },
        },
        _count: { query: true },
        orderBy: { _count: { query: "desc" } },
        take: 30,
      });

      for (const p of popular) {
        if (!isQualityQuery(p.query) || p._count.query < MIN_QUERY_COUNT) continue;
        if (p.query.toLowerCase() === ql) continue; // skip exact match of current input
        items.push({ text: p.query, highlighted: p.query });
        if (items.length >= limit) break;
      }
    } catch (err) {
      console.error("[suggest] DB error:", err);
    }

    return NextResponse.json({ suggestions: items });
  }

  // No input: return overall trending terms (last 7 days), filtered for quality
  const trending = await db.searchQuery.groupBy({
    by: ["query"],
    where: {
      createdAt: { gte: new Date(Date.now() - TRENDING_WINDOW_DAYS * 24 * 60 * 60 * 1000) },
    },
    _count: { query: true },
    orderBy: { _count: { query: "desc" } },
    take: 30, // fetch extra, then filter
  });

  const filtered = trending
    .filter((t) => isQualityQuery(t.query) && t._count.query >= TRENDING_MIN_COUNT)
    .slice(0, limit);

  return NextResponse.json({
    suggestions: filtered.map((t) => ({
      text: t.query,
      highlighted: t.query,
      count: t._count.query,
    })),
    trending: true,
  });
}
