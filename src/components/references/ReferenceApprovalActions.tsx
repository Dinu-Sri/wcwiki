"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function ReferenceApprovalActions({ referenceId }: { referenceId: string }) {
  const router = useRouter();
  const [rejecting, setRejecting] = useState(false);
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState<"approve" | "reject" | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function submit(action: "approve" | "reject") {
    setBusy(action);
    setError(null);
    try {
      const response = await fetch(`/api/admin/painting-references/${referenceId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, reason }),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error || "Review failed.");
        return;
      }
      router.refresh();
    } catch {
      setError("Network error.");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="space-y-2">
      {error && <p className="text-xs text-red-600">{error}</p>}
      {rejecting && (
        <textarea
          value={reason}
          onChange={(event) => setReason(event.target.value)}
          rows={2}
          placeholder="Reason for rejection"
          className="w-full rounded-lg border border-border bg-card px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
      )}
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => submit("approve")}
          disabled={busy !== null}
          className="rounded-lg bg-green-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-green-700 disabled:opacity-50"
        >
          {busy === "approve" ? "Approving..." : "Approve"}
        </button>
        {rejecting ? (
          <button
            type="button"
            onClick={() => submit("reject")}
            disabled={busy !== null}
            className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700 disabled:opacity-50"
          >
            {busy === "reject" ? "Rejecting..." : "Confirm Reject"}
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setRejecting(true)}
            disabled={busy !== null}
            className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-foreground hover:bg-accent disabled:opacity-50"
          >
            Reject
          </button>
        )}
      </div>
    </div>
  );
}
