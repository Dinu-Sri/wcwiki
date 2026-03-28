import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

// POST /api/admin/search-analytics/aggregate — Run aggregation
export async function POST() {
  const session = await auth();
  if (!session?.user || session.user.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Aggregate daily for the last 24 hours
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const periodStart = new Date(since);
  periodStart.setMinutes(0, 0, 0);

  const rawQueries = await db.searchQuery.findMany({
    where: { createdAt: { gte: since } },
    select: { query: true, category: true, results: true, country: true, createdAt: true },
  });

  // Group by query + day + country + category
  const groups = new Map<string, { count: number; totalResults: number }>();

  for (const sq of rawQueries) {
    const day = new Date(sq.createdAt);
    day.setHours(0, 0, 0, 0);
    const key = `${sq.query}|daily|${day.toISOString()}|${sq.country || ""}|${sq.category || "all"}`;

    const existing = groups.get(key) || { count: 0, totalResults: 0 };
    existing.count++;
    existing.totalResults += sq.results;
    groups.set(key, existing);
  }

  // Upsert aggregates
  let upserted = 0;
  for (const [key, val] of groups) {
    const [query, period, periodAt, country, category] = key.split("|");
    const countryVal = country || "";
    await db.searchAggregate.upsert({
      where: {
        query_period_periodAt_country_category: {
          query,
          period,
          periodAt: new Date(periodAt),
          country: countryVal,
          category: category || "all",
        },
      },
      update: {
        count: val.count,
        results: Math.round(val.totalResults / val.count),
      },
      create: {
        query,
        period,
        periodAt: new Date(periodAt),
        count: val.count,
        results: Math.round(val.totalResults / val.count),
        country: countryVal || null,
        category: category || "all",
      },
    });
    upserted++;
  }

  return NextResponse.json({ success: true, aggregated: upserted });
}

// GET /api/admin/search-analytics/aggregate — Get analytics data
export async function GET(req: Request) {
  const session = await auth();
  if (
    !session?.user ||
    !["APPROVER", "SUPER_ADMIN"].includes(session.user.role as string)
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const days = Math.min(parseInt(searchParams.get("days") || "30"), 365);
  const countryFilter = searchParams.get("country") || "";

  const sinceDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  const previousPeriodStart = new Date(Date.now() - days * 2 * 24 * 60 * 60 * 1000);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const countryWhere: Record<string, any> = countryFilter
    ? { country: countryFilter }
    : {};

  const [
    topQueries,
    totalSearches,
    previousPeriodSearches,
    uniqueQueries,
    previousUniqueQueries,
    zeroResultQueries,
    dailyVolume,
    topCountries,
    categoryBreakdown,
  ] = await Promise.all([
    // Top queries (50 now)
    db.searchQuery.groupBy({
      by: ["query"],
      where: { createdAt: { gte: sinceDate }, ...countryWhere },
      _count: { query: true },
      orderBy: { _count: { query: "desc" } },
      take: 50,
    }),

    // Total searches (current period)
    db.searchQuery.count({
      where: { createdAt: { gte: sinceDate }, ...countryWhere },
    }),

    // Total searches (previous period for growth comparison)
    db.searchQuery.count({
      where: {
        createdAt: { gte: previousPeriodStart, lt: sinceDate },
        ...countryWhere,
      },
    }),

    // Unique queries count (current period)
    db.searchQuery.groupBy({
      by: ["query"],
      where: { createdAt: { gte: sinceDate }, ...countryWhere },
    }),

    // Unique queries count (previous period)
    db.searchQuery.groupBy({
      by: ["query"],
      where: {
        createdAt: { gte: previousPeriodStart, lt: sinceDate },
        ...countryWhere,
      },
    }),

    // Zero-result queries
    db.searchQuery.groupBy({
      by: ["query"],
      where: { createdAt: { gte: sinceDate }, results: 0, ...countryWhere },
      _count: { query: true },
      orderBy: { _count: { query: "desc" } },
      take: 20,
    }),

    // Daily volume from aggregates
    db.searchAggregate.findMany({
      where: {
        period: "daily",
        periodAt: { gte: sinceDate },
        ...(countryFilter ? { country: countryFilter } : {}),
      },
      orderBy: { periodAt: "asc" },
    }),

    // Top countries
    db.searchQuery.groupBy({
      by: ["country"],
      where: {
        createdAt: { gte: sinceDate },
        country: { not: null },
      },
      _count: { country: true },
      orderBy: { _count: { country: "desc" } },
      take: 15,
    }),

    // Category breakdown
    db.searchQuery.groupBy({
      by: ["category"],
      where: { createdAt: { gte: sinceDate }, ...countryWhere },
      _count: { category: true },
      orderBy: { _count: { category: "desc" } },
    }),
  ]);

  const uniqueCount = uniqueQueries.length;
  const previousUniqueCount = previousUniqueQueries.length;
  const searchGrowth = previousPeriodSearches > 0
    ? Math.round(((totalSearches - previousPeriodSearches) / previousPeriodSearches) * 100)
    : null;
  const uniqueGrowth = previousUniqueCount > 0
    ? Math.round(((uniqueCount - previousUniqueCount) / previousUniqueCount) * 100)
    : null;

  return NextResponse.json({
    topQueries: topQueries.map((q) => ({ query: q.query, count: q._count.query })),
    totalSearches,
    uniqueQueries: uniqueCount,
    searchesPerDay: days > 0 ? Math.round(totalSearches / days) : 0,
    searchGrowth,
    uniqueGrowth,
    zeroResultQueries: zeroResultQueries.map((q) => ({ query: q.query, count: q._count.query })),
    dailyVolume,
    topCountries: topCountries.map((c) => ({ country: c.country, count: c._count.country })),
    categoryBreakdown: categoryBreakdown.map((c) => ({
      category: c.category,
      count: c._count.category,
    })),
  });
}
