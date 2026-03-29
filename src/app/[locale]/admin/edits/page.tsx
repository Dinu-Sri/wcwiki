"use client";

import { useEffect, useState } from "react";

interface Edit {
  id: string;
  entityType: string;
  entityId: string;
  field: string;
  oldValue: string | null;
  newValue: string | null;
  status: string;
  createdAt: string;
  user: {
    id: string;
    name: string | null;
    email: string | null;
    image: string | null;
  };
}

export default function AdminEditsPage() {
  const [edits, setEdits] = useState<Edit[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/edits")
      .then((r) => r.json())
      .then((data) => {
        setEdits(data);
        setLoading(false);
      });
  }, []);

  const handleAction = async (editId: string, action: "APPROVED" | "REJECTED") => {
    setProcessing(editId);
    const res = await fetch("/api/admin/edits", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ editId, action }),
    });

    if (res.ok) {
      setEdits((prev) => prev.filter((e) => e.id !== editId));
    }
    setProcessing(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-muted">
        Loading pending edits...
      </div>
    );
  }

  if (edits.length === 0) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-foreground mb-6">
          Pending Edits
        </h1>
        <div className="bg-surface border border-border rounded-xl p-8 text-center text-muted">
          No pending edits to review.
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground mb-6">
        Pending Edits ({edits.length})
      </h1>

      <div className="space-y-3">
        {edits.map((edit) => (
          <div
            key={edit.id}
            className="bg-surface border border-border rounded-xl p-4"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="inline-block px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded-full bg-accent text-foreground">
                    {edit.entityType}
                  </span>
                  <span className="text-sm font-medium text-foreground">
                    {edit.field}
                  </span>
                </div>
                <p className="text-xs text-muted">
                  by{" "}
                  <a
                    href={`/profile/${edit.user.id}`}
                    className="text-primary hover:underline"
                  >
                    {edit.user.name || edit.user.email}
                  </a>{" "}
                  &middot;{" "}
                  {new Date(edit.createdAt).toLocaleString()}
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() =>
                    setExpanded(expanded === edit.id ? null : edit.id)
                  }
                  className="px-3 py-1.5 text-xs border border-border rounded-lg text-foreground hover:bg-accent transition-colors"
                >
                  {expanded === edit.id ? "Collapse" : "View Diff"}
                </button>
                <button
                  onClick={() => handleAction(edit.id, "APPROVED")}
                  disabled={processing === edit.id}
                  className="px-3 py-1.5 text-xs rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                  Approve
                </button>
                <button
                  onClick={() => handleAction(edit.id, "REJECTED")}
                  disabled={processing === edit.id}
                  className="px-3 py-1.5 text-xs rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  Reject
                </button>
              </div>
            </div>

            {expanded === edit.id && (
              <div className="mt-4 grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs font-semibold text-muted mb-1">
                    Old value
                  </p>
                  <pre className="text-xs bg-red-950/20 border border-red-900/30 rounded-lg p-3 whitespace-pre-wrap text-foreground max-h-60 overflow-y-auto">
                    {edit.oldValue || "(empty)"}
                  </pre>
                </div>
                <div>
                  <p className="text-xs font-semibold text-muted mb-1">
                    New value
                  </p>
                  <pre className="text-xs bg-green-950/20 border border-green-900/30 rounded-lg p-3 whitespace-pre-wrap text-foreground max-h-60 overflow-y-auto">
                    {edit.newValue || "(empty)"}
                  </pre>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
