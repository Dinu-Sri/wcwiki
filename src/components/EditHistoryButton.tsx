"use client";

import { useState } from "react";

interface EditRecord {
  id: string;
  field: string;
  oldValue: string | null;
  newValue: string | null;
  status: string;
  createdAt: string;
  user: { id: string; name: string | null; image: string | null };
  reviewedBy: { id: string; name: string | null } | null;
}

interface EditHistoryButtonProps {
  entityType: "ARTIST" | "PAINTING" | "ARTICLE";
  entityId: string;
}

export function EditHistoryButton({ entityType, entityId }: EditHistoryButtonProps) {
  const [open, setOpen] = useState(false);
  const [history, setHistory] = useState<EditRecord[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchHistory = async () => {
    setOpen(true);
    setLoading(true);
    const res = await fetch(
      `/api/edits?entityType=${entityType}&entityId=${entityId}`
    );
    const data = await res.json();
    setHistory(data);
    setLoading(false);
  };

  const statusColor = (s: string) => {
    switch (s) {
      case "APPROVED": return "bg-green-50 text-green-700 border border-green-200";
      case "REJECTED": return "bg-red-50 text-red-700 border border-red-200";
      default: return "bg-yellow-50 text-yellow-700 border border-yellow-200";
    }
  };

  return (
    <>
      <button
        onClick={fetchHistory}
        className="text-xs text-muted hover:text-foreground transition-colors underline underline-offset-2"
      >
        View edit history
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        >
          <div
            className="bg-surface border border-border rounded-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <h2 className="text-lg font-bold text-foreground">
                Edit History
              </h2>
              <button
                onClick={() => setOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-accent transition-colors text-muted hover:text-foreground"
              >
                &times;
              </button>
            </div>

            {/* Body */}
            <div className="overflow-y-auto max-h-[calc(80vh-64px)] p-5">
              {loading ? (
                <p className="text-center text-muted py-10">Loading...</p>
              ) : history.length === 0 ? (
                <p className="text-center text-muted py-10">
                  No edit history for this item.
                </p>
              ) : (
                <div className="space-y-3">
                  {history.map((edit) => (
                    <div
                      key={edit.id}
                      className="border border-border rounded-xl p-4"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {edit.user.image ? (
                            <img
                              src={edit.user.image}
                              alt=""
                              className="w-5 h-5 rounded-full"
                            />
                          ) : (
                            <div className="w-5 h-5 rounded-full bg-accent flex items-center justify-center text-[10px] font-bold text-foreground">
                              {(edit.user.name || "?")[0].toUpperCase()}
                            </div>
                          )}
                          <span className="text-sm font-medium text-foreground">
                            {edit.user.name || "Unknown"}
                          </span>
                          <span className="text-xs text-muted">
                            edited <strong>{edit.field}</strong>
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`inline-block px-2 py-0.5 text-[10px] font-semibold uppercase rounded-full ${statusColor(edit.status)}`}
                          >
                            {edit.status}
                          </span>
                          <span className="text-[10px] text-muted">
                            {new Date(edit.createdAt).toLocaleString()}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <p className="text-[10px] font-semibold text-muted mb-1 uppercase tracking-wider">
                            Before
                          </p>
                          <pre className="text-xs bg-red-950/10 border border-red-900/20 rounded-lg p-2 whitespace-pre-wrap text-foreground/80 max-h-32 overflow-y-auto">
                            {edit.oldValue || "(empty)"}
                          </pre>
                        </div>
                        <div>
                          <p className="text-[10px] font-semibold text-muted mb-1 uppercase tracking-wider">
                            After
                          </p>
                          <pre className="text-xs bg-green-950/10 border border-green-900/20 rounded-lg p-2 whitespace-pre-wrap text-foreground/80 max-h-32 overflow-y-auto">
                            {edit.newValue || "(empty)"}
                          </pre>
                        </div>
                      </div>

                      {edit.reviewedBy && (
                        <p className="text-[10px] text-muted mt-2">
                          Reviewed by {edit.reviewedBy.name || "Unknown"}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
