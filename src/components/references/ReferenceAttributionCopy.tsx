"use client";

import { useState } from "react";

export function ReferenceAttributionCopy({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted">
        Attribution
      </p>
      <p className="break-words text-sm text-foreground">{text}</p>
      <button
        type="button"
        onClick={copy}
        className="mt-3 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-foreground hover:bg-accent"
      >
        {copied ? "Copied" : "Copy Attribution"}
      </button>
    </div>
  );
}
