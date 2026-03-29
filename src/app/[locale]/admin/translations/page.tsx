"use client";

import { useState, useEffect, useCallback } from "react";

interface Translation {
  id: string;
  entityType: string;
  entityId: string;
  locale: string;
  field: string;
  value: string;
  status: string;
  machineSource: string | null;
  translatedById: string | null;
  reviewedById: string | null;
  reviewedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

const ENTITY_TYPES = ["ARTIST", "PAINTING", "ARTICLE"];
const STATUSES = ["MACHINE", "IN_REVIEW", "APPROVED", "REJECTED"];
const LOCALES = [{ code: "si", name: "Sinhala (සිංහල)" }];

const statusColors: Record<string, string> = {
  MACHINE: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  IN_REVIEW: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
  APPROVED: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
  REJECTED: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
};

export default function TranslationsPage() {
  const [translations, setTranslations] = useState<Translation[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Filters
  const [filterType, setFilterType] = useState("");
  const [filterLocale, setFilterLocale] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  // Edit modal
  const [editing, setEditing] = useState<Translation | null>(null);
  const [editValue, setEditValue] = useState("");
  const [editStatus, setEditStatus] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchTranslations = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    params.set("page", page.toString());
    if (filterType) params.set("entityType", filterType);
    if (filterLocale) params.set("locale", filterLocale);
    if (filterStatus) params.set("status", filterStatus);

    try {
      const res = await fetch(`/api/admin/translations?${params}`);
      if (res.ok) {
        const data = await res.json();
        setTranslations(data.translations);
        setTotal(data.total);
        setTotalPages(data.totalPages);
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [page, filterType, filterLocale, filterStatus]);

  useEffect(() => {
    fetchTranslations();
  }, [fetchTranslations]);

  const handleReview = async (id: string, status: string, value?: string) => {
    setSaving(true);
    try {
      const body: Record<string, string> = { id, status };
      if (value !== undefined) body.value = value;

      const res = await fetch("/api/admin/translations", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        fetchTranslations();
        setEditing(null);
      }
    } catch {
      // silent
    } finally {
      setSaving(false);
    }
  };

  const openEdit = (t: Translation) => {
    setEditing(t);
    setEditValue(t.value);
    setEditStatus(t.status);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Translations</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage content translations — review machine translations and approve edits
          </p>
        </div>
        <span className="text-sm text-muted-foreground">{total} total</span>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <select
          value={filterType}
          onChange={(e) => { setFilterType(e.target.value); setPage(1); }}
          className="px-3 py-2 rounded-lg border bg-background text-sm"
        >
          <option value="">All Types</option>
          {ENTITY_TYPES.map((t) => (
            <option key={t} value={t}>{t.charAt(0) + t.slice(1).toLowerCase()}</option>
          ))}
        </select>

        <select
          value={filterLocale}
          onChange={(e) => { setFilterLocale(e.target.value); setPage(1); }}
          className="px-3 py-2 rounded-lg border bg-background text-sm"
        >
          <option value="">All Languages</option>
          {LOCALES.map((l) => (
            <option key={l.code} value={l.code}>{l.name}</option>
          ))}
        </select>

        <select
          value={filterStatus}
          onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }}
          className="px-3 py-2 rounded-lg border bg-background text-sm"
        >
          <option value="">All Statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>{s.replace("_", " ")}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="bg-card border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="text-left px-4 py-3 font-medium">Type</th>
                <th className="text-left px-4 py-3 font-medium">Field</th>
                <th className="text-left px-4 py-3 font-medium">Language</th>
                <th className="text-left px-4 py-3 font-medium">Translation</th>
                <th className="text-left px-4 py-3 font-medium">Status</th>
                <th className="text-left px-4 py-3 font-medium">Source</th>
                <th className="text-left px-4 py-3 font-medium">Updated</th>
                <th className="text-right px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-muted-foreground">
                    Loading...
                  </td>
                </tr>
              ) : translations.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-muted-foreground">
                    No translations found
                  </td>
                </tr>
              ) : (
                translations.map((t) => (
                  <tr key={t.id} className="border-b last:border-0 hover:bg-muted/30">
                    <td className="px-4 py-3">
                      <span className="font-mono text-xs">{t.entityType}</span>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs">{t.field}</td>
                    <td className="px-4 py-3">
                      {LOCALES.find((l) => l.code === t.locale)?.name || t.locale}
                    </td>
                    <td className="px-4 py-3 max-w-xs truncate" title={t.value}>
                      {t.value.slice(0, 80)}{t.value.length > 80 ? "…" : ""}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[t.status]}`}>
                        {t.status.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {t.machineSource || "Human"}
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {new Date(t.updatedAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => openEdit(t)}
                          className="px-2 py-1 text-xs bg-primary/10 text-primary rounded hover:bg-primary/20"
                        >
                          Edit
                        </button>
                        {t.status !== "APPROVED" && (
                          <button
                            onClick={() => handleReview(t.id, "APPROVED")}
                            className="px-2 py-1 text-xs bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 rounded hover:opacity-80"
                          >
                            Approve
                          </button>
                        )}
                        {t.status !== "REJECTED" && (
                          <button
                            onClick={() => handleReview(t.id, "REJECTED")}
                            className="px-2 py-1 text-xs bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300 rounded hover:opacity-80"
                          >
                            Reject
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t">
            <span className="text-sm text-muted-foreground">
              Page {page} of {totalPages}
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="px-3 py-1 text-sm rounded border hover:bg-muted disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="px-3 py-1 text-sm rounded border hover:bg-muted disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editing && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-xl shadow-xl w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <div className="p-6 border-b">
              <h2 className="text-lg font-semibold">Edit Translation</h2>
              <p className="text-sm text-muted-foreground mt-1">
                {editing.entityType} → {editing.field} ({editing.locale})
              </p>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Translation</label>
                <textarea
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  rows={6}
                  className="w-full px-3 py-2 rounded-lg border bg-background text-sm resize-y"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Status</label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value)}
                  className="px-3 py-2 rounded-lg border bg-background text-sm"
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>{s.replace("_", " ")}</option>
                  ))}
                </select>
              </div>

              <div className="text-xs text-muted-foreground space-y-1">
                <p>Entity ID: <span className="font-mono">{editing.entityId}</span></p>
                <p>Source: {editing.machineSource || "Human"}</p>
                <p>Last updated: {new Date(editing.updatedAt).toLocaleString()}</p>
              </div>
            </div>

            <div className="p-6 border-t flex justify-end gap-3">
              <button
                onClick={() => setEditing(null)}
                className="px-4 py-2 text-sm rounded-lg border hover:bg-muted"
              >
                Cancel
              </button>
              <button
                onClick={() => handleReview(editing.id, editStatus, editValue)}
                disabled={saving}
                className="px-4 py-2 text-sm rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
