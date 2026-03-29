"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useSession } from "next-auth/react";
import Link from "next/link";

type SuggestionTab = "NEW_ARTICLE" | "TRANSLATE_ARTICLE" | "TRANSLATE_ARTIST";

const TABS: { label: string; value: SuggestionTab }[] = [
  { label: "New Article", value: "NEW_ARTICLE" },
  { label: "Translate Article", value: "TRANSLATE_ARTICLE" },
  { label: "Translate Artist", value: "TRANSLATE_ARTIST" },
];

const LOCALES = [
  { code: "zh", label: "中文 (Chinese)" },
  { code: "ja", label: "日本語 (Japanese)" },
  { code: "ko", label: "한국어 (Korean)" },
  { code: "es", label: "Español (Spanish)" },
  { code: "fr", label: "Français (French)" },
  { code: "ru", label: "Русский (Russian)" },
  { code: "tr", label: "Türkçe (Turkish)" },
  { code: "ta", label: "தமிழ் (Tamil)" },
  { code: "si", label: "සිංහල (Sinhala)" },
];

export function SuggestButton() {
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<SuggestionTab>("NEW_ARTICLE");
  const [topic, setTopic] = useState("");
  const [details, setDetails] = useState("");
  const [entityId, setEntityId] = useState("");
  const [entityType, setEntityType] = useState<"ARTICLE" | "ARTIST">("ARTICLE");
  const [targetLocale, setTargetLocale] = useState("zh");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!session?.user) {
    return (
      <Link
        href="/auth/login"
        className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-muted hover:text-primary hover:bg-accent transition-all"
        title="Sign in to suggest articles"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5.002 5.002 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
          />
        </svg>
        Suggest
      </Link>
    );
  }

  const reset = () => {
    setTopic("");
    setDetails("");
    setEntityId("");
    setError(null);
    setSuccess(false);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setError(null);

    const body: Record<string, string> = { type: tab };
    if (tab === "NEW_ARTICLE") {
      if (!topic.trim()) { setError("Topic is required"); setSubmitting(false); return; }
      body.topic = topic;
      body.details = details;
    } else {
      if (!entityId.trim()) { setError("Please enter the entity slug or ID"); setSubmitting(false); return; }
      body.entityType = tab === "TRANSLATE_ARTICLE" ? "ARTICLE" : "ARTIST";
      body.entityId = entityId;
      body.targetLocale = targetLocale;
      body.details = details;
    }

    try {
      const res = await fetch("/api/suggestions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        setSuccess(true);
        setTimeout(() => { setOpen(false); reset(); }, 1500);
      } else {
        const data = await res.json();
        setError(data.error || "Failed to submit");
      }
    } catch {
      setError("Network error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <button
        onClick={() => { setOpen(true); reset(); }}
        className="p-1.5 rounded-lg text-muted hover:text-primary hover:bg-accent transition-all"
        title="Suggest an article or translation"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5.002 5.002 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
          />
        </svg>
      </button>

      {open && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="relative bg-surface border border-border rounded-2xl shadow-xl w-full max-w-md animate-fade-in-up">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h2 className="text-sm font-semibold text-foreground">Suggest Content</h2>
              <button onClick={() => setOpen(false)} className="p-1 rounded-lg hover:bg-accent text-muted">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-border">
              {TABS.map((t) => (
                <button
                  key={t.value}
                  onClick={() => { setTab(t.value); reset(); }}
                  className={`flex-1 px-3 py-2 text-xs font-medium transition-colors ${
                    tab === t.value ? "text-primary border-b-2 border-primary" : "text-muted hover:text-foreground"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            <div className="p-4 space-y-3">
              {success ? (
                <div className="text-center py-6">
                  <div className="text-green-600 text-lg mb-1">&#10003;</div>
                  <p className="text-sm text-foreground font-medium">Suggestion submitted!</p>
                  <p className="text-xs text-muted mt-1">You&apos;ll be notified when an editor picks it up.</p>
                </div>
              ) : (
                <>
                  {tab === "NEW_ARTICLE" && (
                    <div>
                      <label className="block text-xs text-muted mb-1">Article Topic *</label>
                      <input
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-border bg-card text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                        placeholder="e.g., Wet-on-wet watercolor technique"
                      />
                    </div>
                  )}

                  {(tab === "TRANSLATE_ARTICLE" || tab === "TRANSLATE_ARTIST") && (
                    <>
                      <div>
                        <label className="block text-xs text-muted mb-1">
                          {tab === "TRANSLATE_ARTICLE" ? "Article" : "Artist"} slug or ID *
                        </label>
                        <input
                          value={entityId}
                          onChange={(e) => setEntityId(e.target.value)}
                          className="w-full px-3 py-2 rounded-lg border border-border bg-card text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                          placeholder={tab === "TRANSLATE_ARTICLE" ? "e.g., wet-on-wet-technique" : "e.g., john-singer-sargent"}
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-muted mb-1">Target Language *</label>
                        <select
                          value={targetLocale}
                          onChange={(e) => setTargetLocale(e.target.value)}
                          className="w-full px-3 py-2 rounded-lg border border-border bg-card text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                        >
                          {LOCALES.map((l) => (
                            <option key={l.code} value={l.code}>{l.label}</option>
                          ))}
                        </select>
                      </div>
                    </>
                  )}

                  <div>
                    <label className="block text-xs text-muted mb-1">Details (optional)</label>
                    <textarea
                      value={details}
                      onChange={(e) => setDetails(e.target.value)}
                      rows={2}
                      className="w-full px-3 py-2 rounded-lg border border-border bg-card text-sm focus:ring-2 focus:ring-primary/20 outline-none resize-none"
                      placeholder="Any additional context or notes..."
                    />
                  </div>

                  {error && <p className="text-xs text-red-600">{error}</p>}

                  <button
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="w-full py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
                  >
                    {submitting ? "Submitting…" : "Submit Suggestion"}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
