"use client";

import { useState, useEffect, useCallback } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts";

interface TopQuery {
  query: string;
  count: number;
}

interface DailyVolume {
  periodAt: string;
  count: number;
  query: string;
}

interface CountryData {
  country: string;
  count: number;
}

interface CategoryData {
  category: string;
  count: number;
}

interface QueryDetail {
  query: string;
  period: { days: number; since: string };
  totalInPeriod: number;
  lifetimeTotal: number;
  firstSeen: string | null;
  lastSeen: string | null;
  dailyVolume: { date: string; count: number; avgResults: number }[];
  categoryBreakdown: CategoryData[];
  relatedQueries: TopQuery[];
}

interface AnalyticsData {
  topQueries: TopQuery[];
  totalSearches: number;
  uniqueQueries: number;
  searchesPerDay: number;
  searchGrowth: number | null;
  uniqueGrowth: number | null;
  zeroResultQueries: TopQuery[];
  dailyVolume: DailyVolume[];
  topCountries: CountryData[];
  categoryBreakdown: CategoryData[];
}

const PIE_COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];

function GrowthBadge({ value }: { value: number | null }) {
  if (value === null) return <span className="text-xs text-muted">N/A</span>;
  const isPositive = value >= 0;
  return (
    <span className={`inline-flex items-center gap-0.5 text-xs font-medium ${isPositive ? "text-green-600" : "text-red-500"}`}>
      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d={isPositive ? "M5 10l7-7m0 0l7 7m-7-7v18" : "M19 14l-7 7m0 0l-7-7m7 7V3"} />
      </svg>
      {Math.abs(value)}%
    </span>
  );
}

export default function SearchAnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [aggregating, setAggregating] = useState(false);
  const [days, setDays] = useState(30);
  const [countryFilter, setCountryFilter] = useState("");
  const [selectedQuery, setSelectedQuery] = useState<string | null>(null);
  const [queryDetail, setQueryDetail] = useState<QueryDetail | null>(null);
  const [queryDetailLoading, setQueryDetailLoading] = useState(false);
  const [queryFilter, setQueryFilter] = useState("");

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ days: String(days) });
      if (countryFilter) params.set("country", countryFilter);
      const res = await fetch(`/api/admin/search-analytics?${params}`);
      if (res.ok) {
        setData(await res.json());
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [days, countryFilter]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const fetchQueryDetail = useCallback(async (q: string) => {
    setQueryDetailLoading(true);
    setSelectedQuery(q);
    try {
      const params = new URLSearchParams({ q, days: String(days) });
      const res = await fetch(`/api/admin/search-analytics/query?${params}`);
      if (res.ok) {
        setQueryDetail(await res.json());
      }
    } catch {
      // ignore
    } finally {
      setQueryDetailLoading(false);
    }
  }, [days]);

  const runAggregation = async () => {
    setAggregating(true);
    try {
      await fetch("/api/admin/search-analytics", { method: "POST" });
      await fetchData();
    } finally {
      setAggregating(false);
    }
  };

  const exportCSV = () => {
    if (!data) return;
    const rows = [["Rank", "Query", "Count"]];
    data.topQueries.forEach((q, i) => {
      rows.push([String(i + 1), `"${q.query}"`, String(q.count)]);
    });
    const csv = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `search-analytics-${days}d-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Aggregate daily volume by date
  const dailyChartData = (() => {
    if (!data?.dailyVolume.length) return [];
    const byDate = new Map<string, number>();
    for (const d of data.dailyVolume) {
      const date = new Date(d.periodAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
      byDate.set(date, (byDate.get(date) || 0) + d.count);
    }
    return Array.from(byDate, ([date, searches]) => ({ date, searches }));
  })();

  const filteredQueries = data?.topQueries.filter(
    (q) => !queryFilter || q.query.includes(queryFilter.toLowerCase())
  ) || [];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-12 text-muted">
        Failed to load analytics data.
      </div>
    );
  }

  const zeroResultRate = data.totalSearches > 0
    ? Math.round((data.zeroResultQueries.reduce((sum, q) => sum + q.count, 0) / data.totalSearches) * 100)
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Search Analytics</h1>
          <p className="text-muted text-sm mt-1">
            Last {days} days{countryFilter ? ` · ${countryFilter}` : ""}
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          {/* Date range filter */}
          <div className="flex rounded-lg border border-border overflow-hidden">
            {[
              { label: "7d", value: 7 },
              { label: "30d", value: 30 },
              { label: "90d", value: 90 },
              { label: "1y", value: 365 },
            ].map((opt) => (
              <button
                key={opt.value}
                onClick={() => setDays(opt.value)}
                className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                  days === opt.value
                    ? "bg-primary text-white"
                    : "bg-card text-muted hover:text-foreground"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {/* Country filter */}
          {data?.topCountries && data.topCountries.length > 0 && (
            <select
              value={countryFilter}
              onChange={(e) => setCountryFilter(e.target.value)}
              className="px-3 py-1.5 text-xs rounded-lg border border-border bg-card text-foreground focus:ring-1 focus:ring-primary"
            >
              <option value="">All countries</option>
              {data.topCountries.map((c) => (
                <option key={c.country} value={c.country}>
                  {c.country} ({c.count})
                </option>
              ))}
            </select>
          )}

          <button
            onClick={exportCSV}
            className="px-4 py-1.5 bg-card border border-border text-foreground rounded-lg text-xs hover:bg-accent transition-colors"
          >
            Export CSV
          </button>

          <button
            onClick={runAggregation}
            disabled={aggregating}
            className="px-4 py-1.5 bg-primary text-white rounded-lg text-xs hover:bg-primary/90 disabled:opacity-50 transition-colors"
          >
            {aggregating ? "Aggregating…" : "Run Aggregation"}
          </button>
        </div>
      </div>

      {/* 6 KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-card rounded-xl border border-border p-4">
          <div className="text-2xl font-bold text-primary">
            {data.totalSearches.toLocaleString()}
          </div>
          <div className="text-xs text-muted mt-1">Total Searches</div>
          <div className="mt-1"><GrowthBadge value={data.searchGrowth} /></div>
        </div>
        <div className="bg-card rounded-xl border border-border p-4">
          <div className="text-2xl font-bold text-foreground">
            {data.uniqueQueries.toLocaleString()}
          </div>
          <div className="text-xs text-muted mt-1">Unique Queries</div>
          <div className="mt-1"><GrowthBadge value={data.uniqueGrowth} /></div>
        </div>
        <div className="bg-card rounded-xl border border-border p-4">
          <div className="text-2xl font-bold text-foreground">
            {data.searchesPerDay.toLocaleString()}
          </div>
          <div className="text-xs text-muted mt-1">Avg / Day</div>
        </div>
        <div className="bg-card rounded-xl border border-border p-4">
          <div className="text-2xl font-bold text-red-500">{zeroResultRate}%</div>
          <div className="text-xs text-muted mt-1">Zero-Result Rate</div>
        </div>
        <div className="bg-card rounded-xl border border-border p-4">
          <div className="text-2xl font-bold text-foreground truncate" title={data.topQueries[0]?.query}>
            {data.topQueries[0]?.query || "—"}
          </div>
          <div className="text-xs text-muted mt-1">Top Query</div>
        </div>
        <div className="bg-card rounded-xl border border-border p-4">
          <div className="text-2xl font-bold">
            {data.searchGrowth !== null ? (
              <span className={data.searchGrowth >= 0 ? "text-green-600" : "text-red-500"}>
                {data.searchGrowth >= 0 ? "↑" : "↓"} {Math.abs(data.searchGrowth)}%
              </span>
            ) : "—"}
          </div>
          <div className="text-xs text-muted mt-1">Search Growth</div>
        </div>
      </div>

      {/* Daily volume chart */}
      {dailyChartData.length > 0 && (
        <div className="bg-card rounded-xl border border-border p-5">
          <h2 className="text-lg font-semibold mb-4">Search Volume</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dailyChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 12 }}
                  stroke="var(--color-muted)"
                />
                <YAxis tick={{ fontSize: 12 }} stroke="var(--color-muted)" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--color-card)",
                    border: "1px solid var(--color-border)",
                    borderRadius: "8px",
                    fontSize: "13px",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="searches"
                  stroke="var(--color-primary)"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top queries — clickable with filter */}
        <div className="bg-card rounded-xl border border-border p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Top Queries</h2>
            <input
              type="text"
              value={queryFilter}
              onChange={(e) => setQueryFilter(e.target.value)}
              placeholder="Filter…"
              className="px-2 py-1 text-xs rounded-lg border border-border bg-background text-foreground w-32 focus:ring-1 focus:ring-primary focus:outline-none"
            />
          </div>
          {filteredQueries.length === 0 ? (
            <p className="text-muted text-sm">No search data yet.</p>
          ) : (
            <div className="space-y-1 max-h-96 overflow-y-auto">
              {filteredQueries.map((q, i) => (
                <button
                  key={q.query}
                  onClick={() => fetchQueryDetail(q.query)}
                  className={`w-full flex items-center gap-3 text-sm px-2 py-1.5 rounded-lg text-left transition-colors ${
                    selectedQuery === q.query
                      ? "bg-primary/10 border-l-2 border-l-primary"
                      : "hover:bg-accent/60"
                  }`}
                >
                  <span className="w-6 text-right text-muted/60 text-xs font-mono shrink-0">
                    {i + 1}
                  </span>
                  <span className="flex-1 truncate">{q.query}</span>
                  <span className="text-muted text-xs tabular-nums shrink-0">
                    {q.count}
                  </span>
                  <svg className="w-3.5 h-3.5 text-muted/40 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Query Detail Panel */}
        <div className="bg-card rounded-xl border border-border p-5">
          {!selectedQuery ? (
            <div className="flex items-center justify-center h-full text-muted text-sm py-12">
              Click a query to see details
            </div>
          ) : queryDetailLoading ? (
            <div className="flex items-center justify-center h-full py-12">
              <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
            </div>
          ) : queryDetail ? (
            <div className="space-y-4">
              <div>
                <h2 className="text-lg font-semibold truncate">&ldquo;{queryDetail.query}&rdquo;</h2>
                <div className="flex gap-4 mt-1 text-xs text-muted">
                  <span>{queryDetail.totalInPeriod} in period</span>
                  <span>{queryDetail.lifetimeTotal} lifetime</span>
                </div>
              </div>

              {/* First/Last seen */}
              <div className="flex gap-4 text-xs">
                <div>
                  <span className="text-muted">First seen: </span>
                  <span className="text-foreground">
                    {queryDetail.firstSeen
                      ? new Date(queryDetail.firstSeen).toLocaleDateString()
                      : "—"}
                  </span>
                </div>
                <div>
                  <span className="text-muted">Last seen: </span>
                  <span className="text-foreground">
                    {queryDetail.lastSeen
                      ? new Date(queryDetail.lastSeen).toLocaleDateString()
                      : "—"}
                  </span>
                </div>
              </div>

              {/* Query volume chart */}
              {queryDetail.dailyVolume.length > 0 && (
                <div className="h-40">
                  <div className="text-xs text-muted mb-1">Volume Over Time</div>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={queryDetail.dailyVolume}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                      <XAxis
                        dataKey="date"
                        tick={{ fontSize: 10 }}
                        stroke="var(--color-muted)"
                        tickFormatter={(d) => new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      />
                      <YAxis tick={{ fontSize: 10 }} stroke="var(--color-muted)" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "var(--color-card)",
                          border: "1px solid var(--color-border)",
                          borderRadius: "8px",
                          fontSize: "12px",
                        }}
                      />
                      <Line type="monotone" dataKey="count" stroke="var(--color-primary)" strokeWidth={2} dot={{ r: 2 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}

              {/* Category breakdown */}
              {queryDetail.categoryBreakdown.length > 0 && (
                <div>
                  <div className="text-xs text-muted mb-2">Category Breakdown</div>
                  <div className="space-y-1">
                    {queryDetail.categoryBreakdown.map((c) => (
                      <div key={c.category} className="flex items-center gap-2 text-sm">
                        <span className="capitalize flex-1">{c.category}</span>
                        <span className="text-muted text-xs tabular-nums">{c.count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Related queries */}
              {queryDetail.relatedQueries.length > 0 && (
                <div>
                  <div className="text-xs text-muted mb-2">Related Queries</div>
                  <div className="flex flex-wrap gap-1.5">
                    {queryDetail.relatedQueries.map((r) => (
                      <button
                        key={r.query}
                        onClick={() => fetchQueryDetail(r.query)}
                        className="px-2 py-0.5 text-xs bg-accent/60 rounded-md hover:bg-accent transition-colors"
                      >
                        {r.query} ({r.count})
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : null}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Zero-result queries */}
        <div className="bg-card rounded-xl border border-border p-5">
          <h2 className="text-lg font-semibold mb-4">Zero-Result Queries</h2>
          {data.zeroResultQueries.length === 0 ? (
            <p className="text-muted text-sm text-center py-4">
              All queries returned results!
            </p>
          ) : (
            <div className="space-y-2">
              {data.zeroResultQueries.map((q, i) => (
                <div
                  key={q.query}
                  className="flex items-center gap-3 text-sm"
                >
                  <span className="w-6 text-right text-muted/60 text-xs font-mono">
                    {i + 1}
                  </span>
                  <span className="flex-1 truncate text-red-600">
                    {q.query}
                  </span>
                  <span className="text-muted text-xs tabular-nums">
                    {q.count}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Category Distribution */}
        {data.categoryBreakdown.length > 0 && (
          <div className="bg-card rounded-xl border border-border p-5">
            <h2 className="text-lg font-semibold mb-4">Category Distribution</h2>
            <div className="h-64 flex items-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.categoryBreakdown}
                    dataKey="count"
                    nameKey="category"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    innerRadius={40}
                    label={({ name, value }) => `${name} (${value})`}
                    labelLine={{ strokeWidth: 1 }}
                  >
                    {data.categoryBreakdown.map((_entry, index) => (
                      <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--color-card)",
                      border: "1px solid var(--color-border)",
                      borderRadius: "8px",
                      fontSize: "13px",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>

      {/* Top countries chart */}
      {data.topCountries.length > 0 && (
        <div className="bg-card rounded-xl border border-border p-5">
          <h2 className="text-lg font-semibold mb-4">
            Searches by Country
          </h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.topCountries} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis type="number" tick={{ fontSize: 12 }} stroke="var(--color-muted)" />
                <YAxis
                  type="category"
                  dataKey="country"
                  tick={{ fontSize: 12 }}
                  stroke="var(--color-muted)"
                  width={50}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--color-card)",
                    border: "1px solid var(--color-border)",
                    borderRadius: "8px",
                    fontSize: "13px",
                  }}
                />
                <Bar dataKey="count" fill="var(--color-primary)" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}
