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

// Overlay approved translations onto search hits for a given locale
async function overlayTranslations(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  hits: any[],
  entityType: "ARTIST" | "PAINTING" | "ARTICLE",
  locale: string,
  fields: string[] // e.g. ["name", "bio"] or ["title", "excerpt"]
) {
  if (!locale || locale === "en" || hits.length === 0) return hits;

  const entityIds = hits.map((h) => h.id as string);

  const translations = await db.translation.findMany({
    where: {
      entityType,
      entityId: { in: entityIds },
      locale,
      field: { in: fields },
      status: "APPROVED",
    },
  });

  // Group by entityId
  const byEntity = new Map<string, Record<string, string>>();
  for (const t of translations) {
    if (!byEntity.has(t.entityId)) byEntity.set(t.entityId, {});
    byEntity.get(t.entityId)![t.field] = t.value;
  }

  // Overlay onto hits
  return hits.map((hit) => {
    const overrides = byEntity.get(hit.id as string);
    if (!overrides) return hit;
    return { ...hit, ...overrides };
  });
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const query = searchParams.get("q")?.trim() || "";
  const category = searchParams.get("category") || "all";
  const locale = searchParams.get("locale") || "en";
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
    matchingStrategy: "frequency" as const,
  };

  const articleSearchOptions = {
    ...searchOptions,
    attributesToCrop: ["content"],
    cropLength: 30,
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
        .search(query, { ...articleSearchOptions, limit: 5 })
        .catch(() => ({ hits: [], estimatedTotalHits: 0 })),
    ]);

    const estimatedTotal =
        (artists.estimatedTotalHits || 0) +
        (paintings.estimatedTotalHits || 0) +
        (articles.estimatedTotalHits || 0);

    // Log search (fire-and-forget)
    logSearch(query, category, estimatedTotal, request);

    // Overlay translations if non-English locale
    const [translatedArtists, translatedPaintings, translatedArticles] = await Promise.all([
      overlayTranslations(artists.hits, "ARTIST", locale, ["name", "bio"]),
      overlayTranslations(paintings.hits, "PAINTING", locale, ["title", "description"]),
      overlayTranslations(articles.hits, "ARTICLE", locale, ["title", "excerpt"]),
    ]);

    return NextResponse.json({
      artists: translatedArtists,
      paintings: translatedPaintings,
      articles: translatedArticles,
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
    const opts = indexName === INDEXES.ARTICLES ? articleSearchOptions : searchOptions;
    const results = await meili.index(indexName).search(query, opts);

    // Log search (fire-and-forget)
    logSearch(query, category, results.estimatedTotalHits || 0, request);

    // Overlay translations
    const translationFields =
      category === "artists" ? ["name", "bio"] :
      category === "paintings" ? ["title", "description"] :
      ["title", "excerpt"];
    const entityType = category === "artists" ? "ARTIST" : category === "paintings" ? "PAINTING" : "ARTICLE";
    const translatedHits = await overlayTranslations(results.hits, entityType, locale, translationFields);

    return NextResponse.json({
      hits: translatedHits,
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
