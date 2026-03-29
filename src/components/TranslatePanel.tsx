"use client";

import { useState, useEffect, useCallback } from "react";

interface TranslatePanelProps {
  entityType: "ARTIST" | "PAINTING" | "ARTICLE";
  entityId: string;
  fields: { key: string; label: string; multiline?: boolean }[];
  originalValues: Record<string, string>;
}

const LOCALES = [{ code: "si", name: "Sinhala (සිංහල)" }];

type TranslationEntry = { value: string; status: string; machineSource: string | null };

export function TranslatePanel({
  entityType,
  entityId,
  fields,
  originalValues,
}: TranslatePanelProps) {
  const [open, setOpen] = useState(false);
  const [locale, setLocale] = useState("si");
  const [existing, setExisting] = useState<Record<string, TranslationEntry>>({});
  const [values, setValues] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [translating, setTranslating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const fetchExisting = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/translations?entityType=${entityType}&entityId=${entityId}&locale=${locale}`
      );
      if (res.ok) {
        const data = await res.json();
        setExisting(data.translations);
        // Pre-fill form with existing values
        const vals: Record<string, string> = {};
        for (const f of fields) {
          vals[f.key] = data.translations[f.key]?.value || "";
        }
        setValues(vals);
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [entityType, entityId, locale, fields]);

  useEffect(() => {
    if (open) fetchExisting();
  }, [open, locale, fetchExisting]);

  const handleMachineTranslate = async () => {
    setTranslating(true);
    setMessage("");
    try {
      const res = await fetch("/api/translations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          entityType,
          entityId,
          locale,
          useMachine: true,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        const newValues: Record<string, string> = { ...values };
        for (const [key, val] of Object.entries(data.translations as Record<string, string>)) {
          newValues[key] = val;
        }
        setValues(newValues);
        // Update existing status
        const newExisting: Record<string, TranslationEntry> = { ...existing };
        for (const key of Object.keys(data.translations)) {
          newExisting[key] = {
            value: data.translations[key],
            status: "MACHINE",
            machineSource: "google",
          };
        }
        setExisting(newExisting);
        setMessage("Machine translation complete — review and edit before approving");
      } else {
        const err = await res.json();
        setMessage(err.error || "Translation failed");
      }
    } catch {
      setMessage("Translation request failed");
    } finally {
      setTranslating(false);
    }
  };

  const handleSaveManual = async () => {
    setSaving(true);
    setMessage("");
    // Only send non-empty values
    const toSave: Record<string, string> = {};
    for (const [key, val] of Object.entries(values)) {
      if (val.trim()) toSave[key] = val;
    }
    if (Object.keys(toSave).length === 0) {
      setMessage("Nothing to save");
      setSaving(false);
      return;
    }
    try {
      const res = await fetch("/api/translations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          entityType,
          entityId,
          locale,
          translations: toSave,
        }),
      });
      if (res.ok) {
        setMessage("Translations saved — pending review");
        fetchExisting();
      } else {
        const err = await res.json();
        setMessage(err.error || "Save failed");
      }
    } catch {
      setMessage("Save failed");
    } finally {
      setSaving(false);
    }
  };

  const statusBadge = (status: string) => {
    const colors: Record<string, string> = {
      MACHINE: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
      IN_REVIEW: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300",
      APPROVED: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
      REJECTED: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
    };
    return (
      <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${colors[status] || ""}`}>
        {status.replace("_", " ")}
      </span>
    );
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors"
        title="Translate this content"
      >
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
        </svg>
        Translate
      </button>
    );
  }

  return (
    <div className="border rounded-xl bg-card p-4 sm:p-5 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold flex items-center gap-2">
          <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
          </svg>
          Translate Content
        </h3>
        <button onClick={() => setOpen(false)} className="text-muted-foreground hover:text-foreground text-sm">✕</button>
      </div>

      {/* Language selector + Machine translate button */}
      <div className="flex flex-wrap items-center gap-3">
        <select
          value={locale}
          onChange={(e) => setLocale(e.target.value)}
          className="px-3 py-1.5 rounded-lg border bg-background text-sm"
        >
          {LOCALES.map((l) => (
            <option key={l.code} value={l.code}>{l.name}</option>
          ))}
        </select>

        <button
          onClick={handleMachineTranslate}
          disabled={translating}
          className="px-3 py-1.5 text-xs rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 flex items-center gap-1.5"
        >
          {translating ? (
            <>
              <svg className="w-3 h-3 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Translating...
            </>
          ) : (
            <>
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Auto-translate (Google)
            </>
          )}
        </button>
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading...</p>
      ) : (
        <>
          {/* Translation fields */}
          <div className="space-y-4">
            {fields.map((f) => (
              <div key={f.key}>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    {f.label}
                  </label>
                  {existing[f.key] && statusBadge(existing[f.key].status)}
                </div>

                {/* Original text (collapsed) */}
                <details className="mb-2">
                  <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground">
                    Show original (English)
                  </summary>
                  <div className="mt-1 p-2 bg-muted/50 rounded text-xs text-muted-foreground max-h-32 overflow-y-auto whitespace-pre-wrap">
                    {originalValues[f.key]?.slice(0, 2000) || "(empty)"}
                  </div>
                </details>

                {/* Translation input */}
                {f.multiline ? (
                  <textarea
                    value={values[f.key] || ""}
                    onChange={(e) => setValues({ ...values, [f.key]: e.target.value })}
                    rows={f.key === "body" ? 12 : 4}
                    className="w-full px-3 py-2 rounded-lg border bg-background text-sm resize-y"
                    placeholder={`${f.label} in ${LOCALES.find((l) => l.code === locale)?.name || locale}...`}
                  />
                ) : (
                  <input
                    type="text"
                    value={values[f.key] || ""}
                    onChange={(e) => setValues({ ...values, [f.key]: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border bg-background text-sm"
                    placeholder={`${f.label} in ${LOCALES.find((l) => l.code === locale)?.name || locale}...`}
                  />
                )}
              </div>
            ))}
          </div>

          {/* Save button */}
          <div className="flex items-center justify-between pt-2 border-t">
            {message && (
              <p className="text-xs text-muted-foreground">{message}</p>
            )}
            <button
              onClick={handleSaveManual}
              disabled={saving}
              className="ml-auto px-4 py-1.5 text-sm rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save translations"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
