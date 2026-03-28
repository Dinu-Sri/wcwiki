import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// POST /api/admin/search-analytics/auto-aggregate
// Called by cron/scheduler with x-cron-secret header
// Aggregates yesterday's search data by query + day + country + category
export async function POST(req: NextRequest) {
  const secret = req.headers.get("x-cron-secret");
  if (!secret || secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Aggregate yesterday's data (full day, not partial)
  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  yesterday.setHours(0, 0, 0, 0);

  const todayStart = new Date(now);
  todayStart.setHours(0, 0, 0, 0);

  const rawQueries = await db.searchQuery.findMany({
    where: {
      createdAt: {
        gte: yesterday,
        lt: todayStart,
      },
    },
    select: { query: true, category: true, results: true, country: true },
  });

  if (rawQueries.length === 0) {
    return NextResponse.json({ success: true, aggregated: 0, message: "No data for yesterday" });
  }

  // Group by query + day + country + category
  const groups = new Map<string, { count: number; totalResults: number }>();

  for (const sq of rawQueries) {
    const key = `${sq.query}|daily|${yesterday.toISOString()}|${sq.country || ""}|${sq.category || "all"}`;
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

  return NextResponse.json({
    success: true,
    aggregated: upserted,
    date: yesterday.toISOString().split("T")[0],
    rawQueries: rawQueries.length,
  });
}
