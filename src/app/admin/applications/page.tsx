"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";

interface Application {
  id: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  message: string | null;
  reviewNote: string | null;
  createdAt: string;
  reviewedAt: string | null;
  user: {
    id: string;
    name: string | null;
    email: string | null;
    image: string | null;
    bio: string | null;
    country: string | null;
    specializations: string[];
    mediaInterests: string[];
    yearsOfExperience: number | null;
    createdAt: string;
  };
  reviewedBy: { name: string | null } | null;
}

type FilterStatus = "PENDING" | "APPROVED" | "REJECTED" | "all";

export default function AdminApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterStatus>("PENDING");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [reviewNote, setReviewNote] = useState("");
  const [processing, setProcessing] = useState<string | null>(null);

  const fetchApplications = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/admin/applications?status=${filter}`
      );
      if (res.ok) {
        setApplications(await res.json());
      }
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  const handleAction = async (id: string, action: "approve" | "reject") => {
    setProcessing(id);
    try {
      const res = await fetch("/api/admin/applications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, action, reviewNote }),
      });
      if (res.ok) {
        setReviewNote("");
        setExpandedId(null);
        fetchApplications();
      }
    } finally {
      setProcessing(null);
    }
  };

  const STATUS_BADGES: Record<string, string> = {
    PENDING: "bg-yellow-100 text-yellow-800",
    APPROVED: "bg-green-100 text-green-800",
    REJECTED: "bg-red-100 text-red-800",
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Editor Applications</h1>
        <p className="text-muted text-sm mt-1">
          Review and manage editor role applications
        </p>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 bg-accent/50 rounded-lg p-1 w-fit">
        {(["PENDING", "APPROVED", "REJECTED", "all"] as FilterStatus[]).map(
          (s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                filter === s
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted hover:text-foreground"
              }`}
            >
              {s === "all" ? "All" : s.charAt(0) + s.slice(1).toLowerCase()}
            </button>
          )
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-32">
          <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
        </div>
      ) : applications.length === 0 ? (
        <div className="text-center py-12 text-muted">
          No {filter === "all" ? "" : filter.toLowerCase()} applications found.
        </div>
      ) : (
        <div className="space-y-4">
          {applications.map((app) => (
            <div
              key={app.id}
              className="bg-card rounded-xl border border-border overflow-hidden"
            >
              {/* Header */}
              <div className="p-4 flex items-start gap-4">
                <div className="relative w-12 h-12 rounded-full overflow-hidden bg-accent shrink-0">
                  {app.user.image ? (
                    <Image
                      src={app.user.image}
                      alt={app.user.name || "User"}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-lg text-muted">
                      {app.user.name?.[0]?.toUpperCase() || "?"}
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <a
                      href={`/profile/${app.user.id}`}
                      className="font-semibold text-primary hover:underline"
                    >
                      {app.user.name || "Unnamed User"}
                    </a>
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_BADGES[app.status]}`}
                    >
                      {app.status}
                    </span>
                  </div>
                  <p className="text-sm text-muted mt-0.5">
                    {app.user.email} · {app.user.country || "No country"} ·
                    Applied{" "}
                    {new Date(app.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>

                  {/* Quick profile info */}
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {app.user.specializations.map((s) => (
                      <span
                        key={s}
                        className="px-2 py-0.5 rounded-full text-[11px] bg-primary/10 text-primary"
                      >
                        {s}
                      </span>
                    ))}
                    {app.user.yearsOfExperience != null && (
                      <span className="px-2 py-0.5 rounded-full text-[11px] bg-accent text-muted">
                        {app.user.yearsOfExperience}y exp
                      </span>
                    )}
                  </div>
                </div>

                {/* Expand button */}
                <button
                  onClick={() =>
                    setExpandedId(expandedId === app.id ? null : app.id)
                  }
                  className="text-muted hover:text-foreground p-1 transition-colors"
                >
                  <svg
                    className={`w-5 h-5 transition-transform ${expandedId === app.id ? "rotate-180" : ""}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>
              </div>

              {/* Expanded details */}
              {expandedId === app.id && (
                <div className="border-t border-border px-4 py-4 space-y-4">
                  {/* Bio */}
                  {app.user.bio && (
                    <div>
                      <h3 className="text-xs font-semibold text-muted uppercase mb-1">
                        Bio
                      </h3>
                      <p className="text-sm text-foreground whitespace-pre-line">
                        {app.user.bio}
                      </p>
                    </div>
                  )}

                  {/* Application message */}
                  {app.message && (
                    <div>
                      <h3 className="text-xs font-semibold text-muted uppercase mb-1">
                        Application Message
                      </h3>
                      <p className="text-sm text-foreground whitespace-pre-line bg-accent/50 rounded-lg p-3">
                        {app.message}
                      </p>
                    </div>
                  )}

                  {/* Review note (for already reviewed) */}
                  {app.reviewNote && (
                    <div>
                      <h3 className="text-xs font-semibold text-muted uppercase mb-1">
                        Review Note
                      </h3>
                      <p className="text-sm text-foreground">
                        {app.reviewNote}
                        {app.reviewedBy?.name && (
                          <span className="text-muted">
                            {" "}
                            — {app.reviewedBy.name}
                          </span>
                        )}
                      </p>
                    </div>
                  )}

                  {/* Actions for pending */}
                  {app.status === "PENDING" && (
                    <div className="space-y-3">
                      <textarea
                        value={reviewNote}
                        onChange={(e) => setReviewNote(e.target.value)}
                        rows={2}
                        className="w-full px-3 py-2 rounded-lg border border-border bg-card text-sm focus:ring-2 focus:ring-primary/20"
                        placeholder="Optional review note…"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleAction(app.id, "approve")}
                          disabled={processing === app.id}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50 transition-colors"
                        >
                          {processing === app.id ? "…" : "Approve"}
                        </button>
                        <button
                          onClick={() => handleAction(app.id, "reject")}
                          disabled={processing === app.id}
                          className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-50 transition-colors"
                        >
                          {processing === app.id ? "…" : "Reject"}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
