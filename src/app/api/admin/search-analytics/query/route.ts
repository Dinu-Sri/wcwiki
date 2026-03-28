import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

// GET /api/admin/search-analytics/query?q=watercolor&days=90
// Drill-down into a specific search query
export async function GET(req: NextRequest) {
  const session = await auth();
  if (
    !session?.user ||
    !["APPROVER", "SUPER_ADMIN"].includes(session.user.role as string)
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const query = searchParams.get("q")?.trim().toLowerCase();
  const days = Math.min(parseInt(searchParams.get("days") || "90"), 365);

  if (!query) {
    return NextResponse.json({ error: "Missing query parameter" }, { status: 400 });
  }

  const sinceDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  const [
    rawSearches,
    lifetimeCount,
    firstSeen,
    lastSeen,
    relatedQueries,
  ] = await Promise.all([
    // All searches for this query in the period
    db.searchQuery.findMany({
      where: { query, createdAt: { gte: sinceDate } },
      select: { category: true, results: true, createdAt: true },
      orderBy: { createdAt: "asc" },
    }),

    // Total lifetime searches (all time — zero data loss)
    db.searchQuery.count({ where: { query } }),

    // First ever search
    db.searchQuery.findFirst({
      where: { query },
      orderBy: { createdAt: "asc" },
      select: { createdAt: true },
    }),

    // Most recent search
    db.searchQuery.findFirst({
      where: { query },
      orderBy: { createdAt: "desc" },
      select: { createdAt: true },
    }),

    // Related queries (queries containing same words, from same period)
    db.searchQuery.groupBy({
      by: ["query"],
      where: {
        createdAt: { gte: sinceDate },
        query: { contains: query.split(" ")[0] },
        NOT: { query },
      },
      _count: { query: true },
      orderBy: { _count: { query: "desc" } },
      take: 10,
    }),
  ]);

  // Build daily volume
  const dailyMap = new Map<string, { count: number; totalResults: number }>();
  const categoryMap = new Map<string, number>();

  for (const s of rawSearches) {
    // Daily volume
    const day = s.createdAt.toISOString().split("T")[0];
    const existing = dailyMap.get(day) || { count: 0, totalResults: 0 };
    existing.count++;
    existing.totalResults += s.results;
    dailyMap.set(day, existing);

    // Category breakdown
    const cat = s.category || "all";
    categoryMap.set(cat, (categoryMap.get(cat) || 0) + 1);
  }

  const dailyVolume = Array.from(dailyMap, ([date, data]) => ({
    date,
    count: data.count,
    avgResults: data.count > 0 ? Math.round(data.totalResults / data.count) : 0,
  }));

  const categoryBreakdown = Array.from(categoryMap, ([category, count]) => ({
    category,
    count,
  })).sort((a, b) => b.count - a.count);

  return NextResponse.json({
    query,
    period: { days, since: sinceDate.toISOString() },
    totalInPeriod: rawSearches.length,
    lifetimeTotal: lifetimeCount,
    firstSeen: firstSeen?.createdAt?.toISOString() || null,
    lastSeen: lastSeen?.createdAt?.toISOString() || null,
    dailyVolume,
    categoryBreakdown,
    relatedQueries: relatedQueries.map((r) => ({
      query: r.query,
      count: r._count.query,
    })),
  });
}
