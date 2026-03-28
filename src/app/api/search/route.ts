import { NextRequest, NextResponse } from "next/server";
import { meili, INDEXES } from "@/lib/search/client";
import { db } from "@/lib/db";

// Log search query asynchronously (fire-and-forget)
function logSearch(query: string, category: string, results: number, req: NextRequest) {
  const country = req.headers.get("cf-ipcountry") || req.headers.get("x-country") || null;
  const userAgent = req.headers.get("user-agent")?.slice(0, 200) || null;

  db.searchQuery.create({
    data: { query: query.toLowerCase(), category, results, country, userAgent },
  }).catch(() => {});
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const query = searchParams.get("q")?.trim() || "";
  const category = searchParams.get("category") || "all";
  const limit = Math.min(
    parseInt(searchParams.get("limit") || "10", 10),
    50
  );
  const offset = parseInt(searchParams.get("offset") || "0", 10);

  if (!query) {
    return NextResponse.json({ artists: [], paintings: [], articles: [] });
  }

  const searchOptions = {
    limit,
    offset,
    attributesToHighlight: ["*"],
    highlightPreTag: "<mark>",
    highlightPostTag: "</mark>",
  };

  if (category === "all") {
    const [artists, paintings, articles] = await Promise.all([
      meili
        .index(INDEXES.ARTISTS)
        .search(query, { ...searchOptions, limit: 5 })
        .catch(() => ({ hits: [], estimatedTotalHits: 0 })),
      meili
        .index(INDEXES.PAINTINGS)
        .search(query, { ...searchOptions, limit: 5 })
        .catch(() => ({ hits: [], estimatedTotalHits: 0 })),
      meili
        .index(INDEXES.ARTICLES)
        .search(query, { ...searchOptions, limit: 5 })
        .catch(() => ({ hits: [], estimatedTotalHits: 0 })),
    ]);

    const estimatedTotal =
        (artists.estimatedTotalHits || 0) +
        (paintings.estimatedTotalHits || 0) +
        (articles.estimatedTotalHits || 0);

    // Log search (fire-and-forget)
    logSearch(query, category, estimatedTotal, request);

    return NextResponse.json({
      artists: artists.hits,
      paintings: paintings.hits,
      articles: articles.hits,
      estimatedTotal,
    });
  }

  const indexName =
    category === "artists"
      ? INDEXES.ARTISTS
      : category === "paintings"
        ? INDEXES.PAINTINGS
        : INDEXES.ARTICLES;

  try {
    const results = await meili.index(indexName).search(query, searchOptions);

    // Log search (fire-and-forget)
    logSearch(query, category, results.estimatedTotalHits || 0, request);

    return NextResponse.json({
      hits: results.hits,
      estimatedTotal: results.estimatedTotalHits || 0,
      limit,
      offset,
    });
  } catch {
    return NextResponse.json({
      hits: [],
      estimatedTotal: 0,
      limit,
      offset,
    });
  }
}
