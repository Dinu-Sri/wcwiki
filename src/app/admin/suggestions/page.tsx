"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";

interface Suggestion {
  id: string;
  type: string;
  topic: string | null;
  details: string | null;
  status: string;
  entityType: string | null;
  entityId: string | null;
  targetLocale: string | null;
  createdAt: string;
  requestedBy: { name: string | null; image: string | null } | null;
  claimedBy: { name: string | null; image: string | null } | null;
}

export default function AdminSuggestionsPage() {
  const router = useRouter();
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");
  const [acting, setActing] = useState<string | null>(null);

  const fetchSuggestions = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filter !== "all") params.set("status", filter);
      const res = await fetch(`/api/suggestions?${params}`);
      if (res.ok) {
        const data = await res.json();
        setSuggestions(data.data || []);
      }
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchSuggestions();
  }, [fetchSuggestions]);

  const performAction = async (id: string, action: string) => {
    setActing(id);
    try {
      const res = await fetch(`/api/suggestions/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      if (res.ok) {
        const data = await res.json();
        if (action === "claim" && data.redirectUrl) {
          router.push(data.redirectUrl);
          return;
        }
        fetchSuggestions();
      }
    } finally {
      setActing(null);
    }
  };

  const typeLabel = (t: string) =>
    t === "NEW_ARTICLE" ? "New Article" : t === "TRANSLATE_ARTICLE" ? "Translate Article" : "Translate Artist";

  const statusColor = (s: string) => {
    switch (s) {
      case "OPEN": return "bg-blue-50 text-blue-700 border-blue-200";
      case "CLAIMED": return "bg-yellow-50 text-yellow-700 border-yellow-200";
      case "IN_PROGRESS": return "bg-orange-50 text-orange-700 border-orange-200";
      case "PUBLISHED": return "bg-green-50 text-green-700 border-green-200";
      case "REJECTED": return "bg-red-50 text-red-700 border-red-200";
      default: return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Suggestions</h1>
          <p className="text-sm text-muted mt-1">
            Review and manage article and translation suggestions from users.
          </p>
        </div>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-3 py-2 rounded-lg border border-border bg-surface text-sm"
        >
          <option value="all">All</option>
          <option value="OPEN">Open</option>
          <option value="CLAIMED">Claimed</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="PUBLISHED">Published</option>
          <option value="REJECTED">Rejected</option>
        </select>
      </div>

      {loading ? (
        <p className="text-muted text-sm">Loading...</p>
      ) : suggestions.length === 0 ? (
        <div className="bg-surface border border-border rounded-xl p-8 text-center">
          <p className="text-muted text-sm">No suggestions found.</p>
        </div>
      ) : (
        <div className="bg-surface border border-border rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-muted">
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Topic / Entity</th>
                <th className="px-4 py-3">Requested By</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {suggestions.map((s) => (
                <tr key={s.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3 text-xs">{typeLabel(s.type)}</td>
                  <td className="px-4 py-3">
                    <div className="text-foreground text-sm">
                      {s.topic || `${s.entityType?.toLowerCase()} → ${s.targetLocale}`}
                    </div>
                    {s.details && (
                      <div className="text-xs text-muted mt-0.5 line-clamp-1">{s.details}</div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-muted text-xs">
                    {s.requestedBy?.name || "Unknown"}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-block px-2 py-0.5 text-xs rounded-full font-medium border ${statusColor(s.status)}`}>
                      {s.status}
                    </span>
                    {s.claimedBy && (
                      <span className="block text-[10px] text-muted mt-0.5">
                        by {s.claimedBy.name}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-muted text-xs">
                    {new Date(s.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      {s.status === "OPEN" && (
                        <>
                          <button
                            onClick={() => performAction(s.id, "claim")}
                            disabled={acting === s.id}
                            className="px-2 py-1 text-xs bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50"
                          >
                            Claim
                          </button>
                          <button
                            onClick={() => performAction(s.id, "reject")}
                            disabled={acting === s.id}
                            className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded-lg hover:bg-red-200 disabled:opacity-50"
                          >
                            Reject
                          </button>
                        </>
                      )}
                      {(s.status === "CLAIMED" || s.status === "IN_PROGRESS") && (
                        <>
                          {s.status === "CLAIMED" && (
                            <button
                              onClick={() => performAction(s.id, "in_progress")}
                              disabled={acting === s.id}
                              className="px-2 py-1 text-xs bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 disabled:opacity-50"
                            >
                              Start
                            </button>
                          )}
                          <button
                            onClick={() => performAction(s.id, "publish")}
                            disabled={acting === s.id}
                            className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded-lg hover:bg-green-200 disabled:opacity-50"
                          >
                            Publish
                          </button>
                          <button
                            onClick={() => performAction(s.id, "unclaim")}
                            disabled={acting === s.id}
                            className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50"
                          >
                            Unclaim
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
