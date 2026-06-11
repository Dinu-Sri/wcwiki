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
    <div className="rounded-xl border border-primary/20 bg-primary/5 p-5 shadow-sm">
      <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-primary">
        Attribution
      </p>
      <p className="break-words text-base font-medium leading-relaxed text-foreground">
        {text}
      </p>
      <button
        type="button"
        onClick={copy}
        className="mt-4 rounded-lg border border-primary/30 bg-surface px-4 py-2 text-sm font-medium text-foreground hover:bg-accent"
      >
        {copied ? "Copied" : "Copy Attribution"}
      </button>
    </div>
  );
}
