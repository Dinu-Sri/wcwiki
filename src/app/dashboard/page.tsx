"use client";

import { useEffect, useState } from "react";
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

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [edits, setEdits] = useState<EditItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
      return;
    }
    if (status === "authenticated") {
      fetch("/api/my-edits")
        .then((r) => r.json())
        .then((data) => {
          setEdits(data.edits || []);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [status, router]);

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
