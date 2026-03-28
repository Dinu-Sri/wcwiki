import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { meili, INDEXES } from "@/lib/search/client";

type Suggestion = { text: string; highlighted: string; count?: number };

// ─── Quality Rules ─────────────────────────────────────────────────────────
// See docs/SEARCH-RULES.md for full documentation
const MIN_QUERY_LENGTH = 3;       // Ignore queries shorter than 3 chars
const MIN_QUERY_COUNT = 2;        // DB queries need ≥2 occurrences to appear as suggestions
const DB_WINDOW_DAYS = 90;        // Look back 90 days for popular queries
const TRENDING_WINDOW_DAYS = 7;   // Look back 7 days for trending
const TRENDING_MIN_COUNT = 1;     // Minimum searches to appear in trending
// ────────────────────────────────────────────────────────────────────────────

// Check if a query looks like a real search (not a partial keystroke)
function isQualityQuery(q: string): boolean {
  if (q.length < MIN_QUERY_LENGTH) return false;
  // Reject strings that are just repeated chars (e.g. "aaa", "ttt")
  if (/^(.)\1+$/.test(q)) return false;
  return true;
}

// GET /api/search/suggest — Google-style keyword/phrase suggestions
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim() || "";
  const limit = Math.min(parseInt(searchParams.get("limit") || "8"), 20);

  if (q.length >= 1) {
    const ql = q.toLowerCase();
    const seen = new Set<string>();
    const items: Suggestion[] = [];

    const add = (text: string) => {
      const key = text.toLowerCase().trim();
      // Skip empty, duplicates, or exact match of what user already typed
      if (!key || seen.has(key) || key === ql) return;
      seen.add(key);
      items.push({ text: text.trim(), highlighted: text.trim() });
    };

    // Run MeiliSearch + DB in parallel for speed
    const [meiliResults, dbResults] = await Promise.all([
      // 1. MeiliSearch: extract keyword phrases from real content (always high quality)
      (async () => {
        try {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const opts: any = { limit: 5, matchingStrategy: "frequency" };
          const [artists, paintings, articles] = await Promise.all([
            meili.index(INDEXES.ARTISTS).search(q, opts).catch(() => ({ hits: [] as any[] })),
            meili.index(INDEXES.PAINTINGS).search(q, opts).catch(() => ({ hits: [] as any[] })),
            meili.index(INDEXES.ARTICLES).search(q, opts).catch(() => ({ hits: [] as any[] })),
          ]);
          const phrases: string[] = [];
          for (const h of artists.hits) phrases.push(h.name);
          for (const h of paintings.hits) phrases.push(h.title);
          for (const h of articles.hits) {
            phrases.push(h.title);
            if (Array.isArray(h.tags)) {
              for (const tag of h.tags) {
                if (typeof tag === "string" && tag.toLowerCase().includes(ql)) {
                  phrases.push(tag);
                }
              }
            }
          }
          return phrases;
        } catch (err) {
          console.error("[suggest] MeiliSearch error:", err);
          return [];
        }
      })(),

      // 2. DB: popular COMPLETED queries (must pass quality filter)
      (async () => {
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
          return popular
            .filter((p) => isQualityQuery(p.query) && p._count.query >= MIN_QUERY_COUNT)
            .map((p) => p.query);
        } catch (err) {
          console.error("[suggest] DB error:", err);
          return [];
        }
      })(),
    ]);

    // Merge: content-derived phrases first (high relevance), then popular queries
    for (const phrase of meiliResults) add(phrase);
    for (const query of dbResults) add(query);

    return NextResponse.json({ suggestions: items.slice(0, limit) });
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
