"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function ReferenceSaveButton({
  referenceId,
  initialSaved,
  initialCount,
  signedIn,
}: {
  referenceId: string;
  initialSaved: boolean;
  initialCount: number;
  signedIn: boolean;
}) {
  const router = useRouter();
  const [saved, setSaved] = useState(initialSaved);
  const [count, setCount] = useState(initialCount);
  const [busy, setBusy] = useState(false);

  async function toggle() {
    if (!signedIn) {
      router.push("/auth/login");
      return;
    }

    setBusy(true);
    try {
      const response = await fetch(`/api/painting-references/${referenceId}/save`, {
        method: saved ? "DELETE" : "POST",
      });
      if (response.ok) {
        setSaved(!saved);
        setCount((current) => Math.max(0, current + (saved ? -1 : 1)));
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={busy}
      className={`w-full rounded-xl px-4 py-2 text-center text-sm font-medium leading-snug transition-colors disabled:opacity-50 ${
        saved
          ? "bg-primary text-white hover:bg-primary/90"
          : "border border-border bg-surface text-foreground hover:bg-accent"
      }`}
    >
      {saved ? "In My Painting Reference List" : "Add to My Painting Reference List"}
      {count > 0 ? ` (${count})` : ""}
    </button>
  );
}
