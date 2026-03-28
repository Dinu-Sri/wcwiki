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

interface AnalyticsData {
  topQueries: TopQuery[];
  totalSearches: number;
  zeroResultQueries: TopQuery[];
  dailyVolume: DailyVolume[];
  topCountries: CountryData[];
}

export default function SearchAnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [aggregating, setAggregating] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/search-analytics");
      if (res.ok) {
        setData(await res.json());
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const runAggregation = async () => {
    setAggregating(true);
    try {
      await fetch("/api/admin/search-analytics", { method: "POST" });
      await fetchData();
    } finally {
      setAggregating(false);
    }
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Search Analytics</h1>
          <p className="text-muted text-sm mt-1">Last 30 days</p>
        </div>
        <button
          onClick={runAggregation}
          disabled={aggregating}
          className="px-4 py-2 bg-primary text-white rounded-lg text-sm hover:bg-primary/90 disabled:opacity-50 transition-colors"
        >
          {aggregating ? "Aggregating…" : "Run Aggregation"}
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-card rounded-xl border border-border p-5">
          <div className="text-3xl font-bold text-primary">
            {data.totalSearches.toLocaleString()}
          </div>
          <div className="text-sm text-muted mt-1">Total Searches</div>
        </div>
        <div className="bg-card rounded-xl border border-border p-5">
          <div className="text-3xl font-bold text-foreground">
            {data.topQueries.length}
          </div>
          <div className="text-sm text-muted mt-1">Unique Queries</div>
        </div>
        <div className="bg-card rounded-xl border border-border p-5">
          <div className="text-3xl font-bold text-red-500">
            {data.zeroResultQueries.length}
          </div>
          <div className="text-sm text-muted mt-1">Zero-Result Queries</div>
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
        {/* Top queries */}
        <div className="bg-card rounded-xl border border-border p-5">
          <h2 className="text-lg font-semibold mb-4">Top Queries</h2>
          {data.topQueries.length === 0 ? (
            <p className="text-muted text-sm">No search data yet.</p>
          ) : (
            <div className="space-y-2">
              {data.topQueries.map((q, i) => (
                <div
                  key={q.query}
                  className="flex items-center gap-3 text-sm"
                >
                  <span className="w-6 text-right text-muted/60 text-xs font-mono">
                    {i + 1}
                  </span>
                  <span className="flex-1 truncate">{q.query}</span>
                  <span className="text-muted text-xs tabular-nums">
                    {q.count}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

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
