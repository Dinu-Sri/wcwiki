"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

interface EditItem {
  id: string;
  entityType: string;
  field: string;
  status: string;
  createdAt: string;
  entityId: string;
}

interface SuggestionItem {
  id: string;
  type: string;
  topic: string | null;
  status: string;
  createdAt: string;
  entityType: string | null;
  entityId: string | null;
  targetLocale: string | null;
  details: string | null;
  requestedBy?: { name: string | null } | null;
}

interface ApplicationStatus {
  id: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  createdAt: string;
  reviewedAt: string | null;
}

interface ProfileCompleteness {
  score: number;
  missing: string[];
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [edits, setEdits] = useState<EditItem[]>([]);
  const [suggestions, setSuggestions] = useState<SuggestionItem[]>([]);
  const [openSuggestions, setOpenSuggestions] = useState<SuggestionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [application, setApplication] = useState<ApplicationStatus | null>(null);
  const [completeness, setCompleteness] = useState<ProfileCompleteness | null>(null);
  const [applyMessage, setApplyMessage] = useState("");
  const [applying, setApplying] = useState(false);
  const [applyError, setApplyError] = useState<string | null>(null);
  const [claiming, setClaiming] = useState<string | null>(null);

  const fetchDashboard = useCallback(async () => {
    try {
      const [editsRes, appRes, profileRes, suggestRes] = await Promise.all([
        fetch("/api/my-edits"),
        fetch("/api/editor-application"),
        fetch("/api/profile"),
        fetch("/api/suggestions?mine=true"),
      ]);

      if (editsRes.ok) {
        const data = await editsRes.json();
        setEdits(data.edits || []);
      }
      if (appRes.ok) {
        const data = await appRes.json();
        setApplication(data.application || null);
      }
      if (profileRes.ok) {
        const data = await profileRes.json();
        setCompleteness(data.completeness || null);
      }
      if (suggestRes.ok) {
        const data = await suggestRes.json();
        setSuggestions(data.data || []);
      }

      // Fetch open suggestions for EDITOR+ users
      const queueRes = await fetch("/api/suggestions?status=OPEN");
      if (queueRes.ok) {
        const data = await queueRes.json();
        setOpenSuggestions(data.data || []);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
      return;
    }
    if (status === "authenticated") {
      fetchDashboard();
    }
  }, [status, router, fetchDashboard]);

  if (status === "loading" || loading) {
    return (
      <>
        <Header />
        <main className="min-h-screen flex items-center justify-center text-muted">
          Loading...
        </main>
        <Footer />
      </>
    );
  }

  if (!session?.user) return null;

  const handleApply = async () => {
    setApplying(true);
    setApplyError(null);
    try {
      const res = await fetch("/api/editor-application", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: applyMessage }),
      });
      const data = await res.json();
      if (res.ok) {
        setApplication(data);
        setApplyMessage("");
      } else {
        setApplyError(data.message || data.error);
      }
    } catch {
      setApplyError("Network error");
    } finally {
      setApplying(false);
    }
  };

  const pending = edits.filter((e) => e.status === "PENDING");
  const approved = edits.filter((e) => e.status === "APPROVED");
  const rejected = edits.filter((e) => e.status === "REJECTED");

  const statusBadge = (s: string) => {
    switch (s) {
      case "APPROVED":
        return "bg-green-50 text-green-700 border border-green-200";
      case "REJECTED":
        return "bg-red-50 text-red-700 border border-red-200";
      default:
        return "bg-yellow-50 text-yellow-700 border border-yellow-200";
    }
  };

  const ROLE_LEVEL: Record<string, number> = { USER: 0, EDITOR: 1, APPROVER: 2, SUPER_ADMIN: 3 };
  const userLevel = ROLE_LEVEL[session.user.role as string] || 0;

  const handleClaim = async (id: string) => {
    setClaiming(id);
    try {
      const res = await fetch(`/api/suggestions/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "claim" }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.redirectUrl) {
          router.push(data.redirectUrl);
          return;
        }
        fetchDashboard();
      }
    } finally {
      setClaiming(null);
    }
  };

  const typeLabel = (t: string) =>
    t === "NEW_ARTICLE" ? "New Article" : t === "TRANSLATE_ARTICLE" ? "Translate Article" : "Translate Artist";

  return (
    <>
      <Header />
      <main className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto px-3 sm:px-4 py-8">
          <h1 className="text-2xl font-bold text-foreground mb-1">
            My Dashboard
          </h1>
          <p className="text-sm text-muted mb-8">
            Welcome, {session.user.name || session.user.email}
          </p>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            <div className="bg-surface border border-border rounded-xl p-4">
              <p className="text-xs text-muted uppercase tracking-wider">
                Total Edits
              </p>
              <p className="text-2xl font-bold text-foreground mt-1">
                {edits.length}
              </p>
            </div>
            <div className="bg-surface border border-border rounded-xl p-4">
              <p className="text-xs text-muted uppercase tracking-wider">
                Pending
              </p>
              <p className="text-2xl font-bold text-yellow-600 mt-1">
                {pending.length}
              </p>
            </div>
            <div className="bg-surface border border-border rounded-xl p-4">
              <p className="text-xs text-muted uppercase tracking-wider">
                Approved
              </p>
              <p className="text-2xl font-bold text-green-600 mt-1">
                {approved.length}
              </p>
            </div>
            <div className="bg-surface border border-border rounded-xl p-4">
              <p className="text-xs text-muted uppercase tracking-wider">
                Rejected
              </p>
              <p className="text-2xl font-bold text-red-600 mt-1">
                {rejected.length}
              </p>
            </div>
          </div>

          {/* Role info */}
          <div className="bg-surface border border-border rounded-xl p-4 mb-8">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">
                  Your Role
                </p>
                <p className="text-xs text-muted mt-0.5">
                  {session.user.role === "EDITOR"
                    ? "Your edits are submitted for review before publishing."
                    : session.user.role === "APPROVER" ||
                        session.user.role === "SUPER_ADMIN"
                      ? "Your edits are applied immediately."
                      : "You can browse content. Request an upgrade to start editing."}
                </p>
              </div>
              <span className="px-3 py-1 text-xs font-medium bg-primary/10 text-primary rounded-full">
                {session.user.role}
              </span>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-foreground mb-3">
              Quick Actions
            </h2>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/profile/edit"
                className="px-4 py-2 text-sm bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors"
              >
                Edit Profile
              </Link>
              <Link
                href="/artists"
                className="px-4 py-2 text-sm bg-surface border border-border rounded-xl hover:bg-accent transition-colors"
              >
                Browse Artists
              </Link>
              <Link
                href="/paintings"
                className="px-4 py-2 text-sm bg-surface border border-border rounded-xl hover:bg-accent transition-colors"
              >
                Browse Paintings
              </Link>
              <Link
                href="/articles"
                className="px-4 py-2 text-sm bg-surface border border-border rounded-xl hover:bg-accent transition-colors"
              >
                Browse Articles
              </Link>
              {["APPROVER", "SUPER_ADMIN"].includes(
                session.user.role as string
              ) && (
                <Link
                  href="/admin"
                  className="px-4 py-2 text-sm bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors"
                >
                  Admin Panel
                </Link>
              )}
            </div>
          </div>

          {/* Profile Completeness */}
          {completeness && completeness.score < 100 && (
            <div className="bg-surface border border-border rounded-xl p-4 mb-8">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="font-medium">Profile Completeness</span>
                <span className="text-primary font-semibold">{completeness.score}%</span>
              </div>
              <div className="h-2 bg-accent rounded-full overflow-hidden mb-2">
                <div
                  className="h-full bg-primary rounded-full transition-all"
                  style={{ width: `${completeness.score}%` }}
                />
              </div>
              {completeness.missing.length > 0 && (
                <p className="text-xs text-muted">
                  Missing: {completeness.missing.join(", ")}.{" "}
                  <Link href="/profile/edit" className="text-primary hover:underline">
                    Complete your profile
                  </Link>
                </p>
              )}
            </div>
          )}

          {/* Apply for Editor (USER role only) */}
          {session.user.role === "USER" && (
            <div className="bg-surface border border-border rounded-xl p-4 mb-8">
              <h2 className="text-sm font-semibold mb-2">Become an Editor</h2>
              {application?.status === "PENDING" ? (
                <p className="text-sm text-yellow-700 bg-yellow-50 border border-yellow-200 rounded-lg px-3 py-2">
                  Your application is pending review. Applied{" "}
                  {new Date(application.createdAt).toLocaleDateString()}.
                </p>
              ) : application?.status === "REJECTED" ? (
                <div>
                  <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2 mb-2">
                    Your application was not approved.{" "}
                    {application.reviewedAt &&
                      `(${new Date(application.reviewedAt).toLocaleDateString()})`}
                  </p>
                  <p className="text-xs text-muted">
                    You can apply again after improving your profile.
                  </p>
                </div>
              ) : (
                <div>
                  <p className="text-xs text-muted mb-3">
                    Editors can submit edits to articles, artist pages, and paintings.
                    Complete your profile before applying.
                  </p>
                  <textarea
                    value={applyMessage}
                    onChange={(e) => setApplyMessage(e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-card text-sm mb-2 focus:ring-2 focus:ring-primary/20"
                    placeholder="Why do you want to be an editor? (optional)"
                  />
                  {applyError && (
                    <p className="text-xs text-red-600 mb-2">{applyError}</p>
                  )}
                  <button
                    onClick={handleApply}
                    disabled={applying}
                    className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
                  >
                    {applying ? "Submitting…" : "Apply for Editor Role"}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Suggestion Queue — EDITOR+ can see and claim open suggestions */}
          {userLevel >= 1 && openSuggestions.length > 0 && (
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-foreground mb-1">
                Suggestion Queue
              </h2>
              <p className="text-xs text-muted mb-3">
                Open suggestions from users. Claim one to start working on it.
              </p>
              <div className="bg-surface border border-border rounded-xl overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-left text-muted">
                      <th className="px-4 py-3">Type</th>
                      <th className="px-4 py-3">Topic / Entity</th>
                      <th className="px-4 py-3">Requested By</th>
                      <th className="px-4 py-3">Date</th>
                      <th className="px-4 py-3"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {openSuggestions.map((s) => (
                      <tr key={s.id} className="border-b border-border last:border-0">
                        <td className="px-4 py-3 text-xs">{typeLabel(s.type)}</td>
                        <td className="px-4 py-3">
                          <div className="text-foreground text-sm">
                            {s.topic || `${s.entityType?.toLowerCase()} \u2192 ${s.targetLocale}`}
                          </div>
                          {s.details && (
                            <div className="text-xs text-muted mt-0.5 line-clamp-1">{s.details}</div>
                          )}
                        </td>
                        <td className="px-4 py-3 text-muted text-xs">
                          {s.requestedBy?.name || "Unknown"}
                        </td>
                        <td className="px-4 py-3 text-muted text-xs">
                          {new Date(s.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => handleClaim(s.id)}
                            disabled={claiming === s.id}
                            className="px-3 py-1.5 text-xs bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-colors"
                          >
                            {claiming === s.id ? "Claiming…" : "Claim & Edit"}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* My Suggestions */}
          {suggestions.length > 0 && (
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-foreground mb-3">
                My Suggestions
              </h2>
              <div className="bg-surface border border-border rounded-xl overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-left text-muted">
                      <th className="px-4 py-3">Type</th>
                      <th className="px-4 py-3">Topic</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {suggestions.map((s) => (
                      <tr key={s.id} className="border-b border-border last:border-0">
                        <td className="px-4 py-3 text-foreground text-xs">
                          {s.type === "NEW_ARTICLE" ? "New Article" : s.type === "TRANSLATE_ARTICLE" ? "Translate Article" : "Translate Artist"}
                        </td>
                        <td className="px-4 py-3 text-foreground">
                          {s.topic || `${s.entityType?.toLowerCase()} \u2192 ${s.targetLocale}`}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-block px-2 py-0.5 text-xs rounded-full font-medium ${
                            s.status === "PUBLISHED" ? "bg-green-50 text-green-700 border border-green-200" :
                            s.status === "REJECTED" ? "bg-red-50 text-red-700 border border-red-200" :
                            s.status === "OPEN" ? "bg-blue-50 text-blue-700 border border-blue-200" :
                            "bg-yellow-50 text-yellow-700 border border-yellow-200"
                          }`}>
                            {s.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-muted">
                          {new Date(s.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Recent Edits */}
          <h2 className="text-lg font-semibold text-foreground mb-3">
            My Recent Edits
          </h2>

          {edits.length === 0 ? (
            <div className="bg-surface border border-border rounded-xl p-8 text-center">
              <p className="text-muted text-sm">
                You haven&apos;t made any edits yet.
              </p>
              <p className="text-muted text-xs mt-1">
                Find an artist or painting page and click &quot;Edit this
                page&quot; to get started.
              </p>
            </div>
          ) : (
            <div className="bg-surface border border-border rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-muted">
                    <th className="px-4 py-3">Type</th>
                    <th className="px-4 py-3">Field</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {edits.slice(0, 20).map((edit) => (
                    <tr
                      key={edit.id}
                      className="border-b border-border last:border-0"
                    >
                      <td className="px-4 py-3 text-foreground capitalize">
                        {edit.entityType.toLowerCase()}
                      </td>
                      <td className="px-4 py-3 text-muted">{edit.field}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-block px-2 py-0.5 text-xs rounded-full font-medium ${statusBadge(edit.status)}`}
                        >
                          {edit.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-muted">
                        {new Date(edit.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
