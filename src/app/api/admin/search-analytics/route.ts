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
    select: { query: true, results: true, country: true, createdAt: true },
  });

  // Group by query + day + country
  const groups = new Map<string, { count: number; totalResults: number }>();

  for (const sq of rawQueries) {
    const day = new Date(sq.createdAt);
    day.setHours(0, 0, 0, 0);
    const key = `${sq.query}|daily|${day.toISOString()}|${sq.country || ""}`;

    const existing = groups.get(key) || { count: 0, totalResults: 0 };
    existing.count++;
    existing.totalResults += sq.results;
    groups.set(key, existing);
  }

  // Upsert aggregates
  let upserted = 0;
  for (const [key, val] of groups) {
    const [query, period, periodAt, country] = key.split("|");
    const countryVal = country || "";
    await db.searchAggregate.upsert({
      where: {
        query_period_periodAt_country: {
          query,
          period,
          periodAt: new Date(periodAt),
          country: countryVal,
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
      },
    });
    upserted++;
  }

  return NextResponse.json({ success: true, aggregated: upserted });
}

// GET /api/admin/search-analytics/aggregate — Get analytics data
export async function GET() {
  const session = await auth();
  if (
    !session?.user ||
    !["APPROVER", "SUPER_ADMIN"].includes(session.user.role as string)
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const [
    topQueries,
    totalSearches,
    zeroResultQueries,
    dailyVolume,
    topCountries,
  ] = await Promise.all([
    // Top queries (last 30 days)
    db.searchQuery.groupBy({
      by: ["query"],
      where: { createdAt: { gte: thirtyDaysAgo } },
      _count: { query: true },
      orderBy: { _count: { query: "desc" } },
      take: 20,
    }),

    // Total searches
    db.searchQuery.count({
      where: { createdAt: { gte: thirtyDaysAgo } },
    }),

    // Zero-result queries
    db.searchQuery.groupBy({
      by: ["query"],
      where: { createdAt: { gte: thirtyDaysAgo }, results: 0 },
      _count: { query: true },
      orderBy: { _count: { query: "desc" } },
      take: 20,
    }),

    // Daily volume (last 30 days)
    db.searchAggregate.findMany({
      where: { period: "daily", periodAt: { gte: thirtyDaysAgo } },
      orderBy: { periodAt: "asc" },
    }),

    // Top countries
    db.searchQuery.groupBy({
      by: ["country"],
      where: {
        createdAt: { gte: thirtyDaysAgo },
        country: { not: null },
      },
      _count: { country: true },
      orderBy: { _count: { country: "desc" } },
      take: 15,
    }),
  ]);

  return NextResponse.json({
    topQueries: topQueries.map((q) => ({ query: q.query, count: q._count.query })),
    totalSearches,
    zeroResultQueries: zeroResultQueries.map((q) => ({ query: q.query, count: q._count.query })),
    dailyVolume,
    topCountries: topCountries.map((c) => ({ country: c.country, count: c._count.country })),
  });
}
