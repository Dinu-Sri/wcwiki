"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { SegmentPair } from "@/components/translation/SegmentPair";

interface TranslationEditorProps {
  entityType: "ARTIST" | "PAINTING" | "ARTICLE";
  entityId: string;
  fields: { key: string; label: string; multiline?: boolean }[];
  segments: { key: string; html: string }[] | null;
  originalValues: Record<string, string>;
  existingTranslations: Record<string, Record<string, { value: string; status: string }>>;
  entitySlug: string;
  entityTypeSlug: string;
}

const LOCALES = [{ code: "si", name: "Sinhala", nativeName: "සිංහල" }];

export function TranslationEditor({
  entityType,
  entityId,
  fields,
  segments,
  originalValues,
  existingTranslations,
}: TranslationEditorProps) {
  const [locale, setLocale] = useState("si");
  const [values, setValues] = useState<Record<string, string>>({});
  const [statuses, setStatuses] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [translatingAll, setTranslatingAll] = useState(false);
  const [translatingKey, setTranslatingKey] = useState<string | null>(null);
  const [saveMessage, setSaveMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [autoSaveTimer, setAutoSaveTimer] = useState<NodeJS.Timeout | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const initialLoad = useRef(true);

  // Load existing translations for selected locale
  useEffect(() => {
    const existing = existingTranslations[locale] || {};
    const vals: Record<string, string> = {};
    const stats: Record<string, string> = {};

    // Load field translations
    for (const f of fields) {
      vals[f.key] = existing[f.key]?.value || "";
      if (existing[f.key]?.status) stats[f.key] = existing[f.key].status;
    }

    // Load segment translations
    if (segments) {
      for (const seg of segments) {
        vals[seg.key] = existing[seg.key]?.value || "";
        if (existing[seg.key]?.status) stats[seg.key] = existing[seg.key].status;
      }
    }

    setValues(vals);
    setStatuses(stats);
    setIsDirty(false);
    initialLoad.current = true;
  }, [locale, existingTranslations, fields, segments]);

  // Fetch latest translations from server when locale changes
  useEffect(() => {
    async function fetchLatest() {
      try {
        const res = await fetch(
          `/api/translations?entityType=${entityType}&entityId=${entityId}&locale=${locale}`
        );
        if (res.ok) {
          const data = await res.json();
          const newVals: Record<string, string> = {};
          const newStats: Record<string, string> = {};

          for (const f of fields) {
            newVals[f.key] = data.translations[f.key]?.value || "";
            if (data.translations[f.key]?.status) newStats[f.key] = data.translations[f.key].status;
          }

          if (segments) {
            for (const seg of segments) {
              newVals[seg.key] = data.translations[seg.key]?.value || "";
              if (data.translations[seg.key]?.status) newStats[seg.key] = data.translations[seg.key].status;
            }
          }

          setValues(newVals);
          setStatuses(newStats);
          setIsDirty(false);
        }
      } catch {
        // silent
      }
    }
    fetchLatest();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locale]);

  // Auto-save with debounce
  useEffect(() => {
    if (initialLoad.current) {
      initialLoad.current = false;
      return;
    }
    if (!isDirty) return;

    if (autoSaveTimer) clearTimeout(autoSaveTimer);
    const timer = setTimeout(() => {
      handleSave(true);
    }, 2000);
    setAutoSaveTimer(timer);

    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [values, isDirty]);

  // Keyboard shortcuts
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        handleSave(false);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [values, locale]);

  const handleValueChange = useCallback((key: string, value: string) => {
    setValues((prev) => ({ ...prev, [key]: value }));
    setIsDirty(true);
    setSaveMessage(null);
  }, []);

  const handleSave = async (isAutoSave: boolean) => {
    const toSave: Record<string, string> = {};
    for (const [key, val] of Object.entries(values)) {
      if (val.trim()) toSave[key] = val;
    }
    if (Object.keys(toSave).length === 0) return;

    setSaving(true);
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
        setIsDirty(false);
        // Update statuses to IN_REVIEW
        const newStats = { ...statuses };
        for (const key of Object.keys(toSave)) {
          newStats[key] = "IN_REVIEW";
        }
        setStatuses(newStats);
        setSaveMessage({
          type: "success",
          text: isAutoSave ? "Auto-saved" : "Saved successfully",
        });
        setTimeout(() => setSaveMessage(null), 3000);
      } else {
        const err = await res.json();
        setSaveMessage({ type: "error", text: err.error || "Save failed" });
      }
    } catch {
      setSaveMessage({ type: "error", text: "Save failed" });
    } finally {
      setSaving(false);
    }
  };

  const handleTranslateAll = async () => {
    setTranslatingAll(true);
    setSaveMessage(null);
    try {
      const res = await fetch("/api/translations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          entityType,
          entityId,
          locale,
          useMachine: true,
          segments: segments ? true : false,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        const newVals = { ...values };
        const newStats = { ...statuses };
        for (const [key, val] of Object.entries(data.translations as Record<string, string>)) {
          newVals[key] = val;
          newStats[key] = "MACHINE";
        }
        setValues(newVals);
        setStatuses(newStats);
        setSaveMessage({ type: "success", text: "Machine translation complete — review and edit" });
      } else {
        const err = await res.json();
        setSaveMessage({ type: "error", text: err.error || "Translation failed" });
      }
    } catch {
      setSaveMessage({ type: "error", text: "Translation request failed" });
    } finally {
      setTranslatingAll(false);
    }
  };

  const handleTranslateSegment = async (segmentKey: string) => {
    setTranslatingKey(segmentKey);
    try {
      // Get the original text for this segment
      const originalText = segments
        ? segments.find((s) => s.key === segmentKey)?.html || ""
        : originalValues[segmentKey] || "";

      const res = await fetch("/api/translations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          entityType,
          entityId,
          locale,
          useMachine: true,
          singleField: segmentKey,
          singleFieldText: originalText,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.translations[segmentKey]) {
          setValues((prev) => ({ ...prev, [segmentKey]: data.translations[segmentKey] }));
          setStatuses((prev) => ({ ...prev, [segmentKey]: "MACHINE" }));
        }
      }
    } catch {
      // silent
    } finally {
      setTranslatingKey(null);
    }
  };

  // Calculate progress
  const totalFields = fields.length + (segments?.length || 0);
  const translatedFields = Object.entries(values).filter(
    ([, v]) => v.trim().length > 0
  ).length;
  const progressPercent = totalFields > 0 ? Math.round((translatedFields / totalFields) * 100) : 0;

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
      {/* Controls bar */}
      <div className="flex flex-wrap items-center gap-3 mb-6 p-3 sm:p-4 rounded-xl bg-card border border-border/60">
        {/* Language selector */}
        <select
          value={locale}
          onChange={(e) => setLocale(e.target.value)}
          className="px-3 py-1.5 rounded-lg border bg-background text-sm font-medium"
        >
          {LOCALES.map((l) => (
            <option key={l.code} value={l.code}>
              {l.nativeName} ({l.name})
            </option>
          ))}
        </select>

        {/* Translate All button */}
        <button
          onClick={handleTranslateAll}
          disabled={translatingAll}
          className="px-4 py-1.5 rounded-lg bg-blue-600 text-white text-sm font-medium
            hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2 transition-colors"
        >
          {translatingAll ? (
            <>
              <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-25" />
                <path d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" fill="currentColor" className="opacity-75" />
              </svg>
              Translating...
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Translate All
            </>
          )}
        </button>

        {/* Save button */}
        <button
          onClick={() => handleSave(false)}
          disabled={saving || !isDirty}
          className="px-4 py-1.5 rounded-lg bg-primary text-white text-sm font-medium
            hover:bg-primary-hover disabled:opacity-50 flex items-center gap-2 transition-colors"
        >
          {saving ? "Saving..." : "Save"}
        </button>

        {/* Progress */}
        <div className="flex items-center gap-2 ml-auto">
          <div className="w-32 h-2 bg-accent rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <span className="text-xs text-muted font-medium">
            {translatedFields}/{totalFields}
          </span>
        </div>

        {/* Save message */}
        {saveMessage && (
          <span
            className={`text-xs font-medium ${
              saveMessage.type === "success" ? "text-green-600" : "text-red-600"
            }`}
          >
            {saveMessage.text}
          </span>
        )}
      </div>

      {/* Field translations (non-body fields) */}
      <div className="space-y-3 mb-6">
        {fields.map((field, i) => (
          <div
            key={field.key}
            className="grid grid-cols-1 lg:grid-cols-2 gap-3 lg:gap-4 p-3 sm:p-4 rounded-xl border border-border/60 bg-card"
          >
            {/* Original */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-semibold text-foreground">{field.label}</span>
                <span className="text-[10px] text-muted uppercase tracking-wide">Original</span>
              </div>
              {field.multiline ? (
                <div
                  className="text-sm text-muted leading-relaxed prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: originalValues[field.key] || "" }}
                />
              ) : (
                <p className="text-sm text-foreground font-medium">
                  {originalValues[field.key]}
                </p>
              )}
            </div>

            {/* Translation */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-foreground">{field.label}</span>
                  <span className="text-[10px] text-muted uppercase tracking-wide">Translation</span>
                  {statuses[field.key] && (
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                        {
                          MACHINE: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
                          IN_REVIEW: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300",
                          APPROVED: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
                          REJECTED: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
                        }[statuses[field.key]] || ""
                      }`}
                    >
                      {statuses[field.key].replace("_", " ")}
                    </span>
                  )}
                </div>
                <button
                  onClick={() => handleTranslateSegment(field.key)}
                  disabled={translatingKey === field.key}
                  className="flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-medium
                    bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400
                    disabled:opacity-50 transition-colors"
                >
                  {translatingKey === field.key ? (
                    <svg className="w-3 h-3 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-25" />
                      <path d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" fill="currentColor" className="opacity-75" />
                    </svg>
                  ) : (
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  )}
                  AI
                </button>
              </div>
              {field.multiline ? (
                <textarea
                  value={values[field.key] || ""}
                  onChange={(e) => handleValueChange(field.key, e.target.value)}
                  className="w-full min-h-[80px] px-3 py-2 rounded-lg border border-border/60 bg-background
                    text-sm leading-relaxed resize-y focus:outline-none focus:ring-2 focus:ring-primary/30
                    focus:border-primary/40 placeholder:text-muted/50 transition-all"
                  placeholder={`Enter ${field.label.toLowerCase()} translation...`}
                  rows={3}
                />
              ) : (
                <input
                  type="text"
                  value={values[field.key] || ""}
                  onChange={(e) => handleValueChange(field.key, e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-border/60 bg-background
                    text-sm focus:outline-none focus:ring-2 focus:ring-primary/30
                    focus:border-primary/40 placeholder:text-muted/50 transition-all"
                  placeholder={`Enter ${field.label.toLowerCase()} translation...`}
                />
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Body segments (articles only) */}
      {segments && segments.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-sm font-semibold text-foreground">Body Segments</h2>
            <span className="text-xs text-muted">
              ({segments.length} segment{segments.length !== 1 ? "s" : ""})
            </span>
          </div>
          <div className="space-y-3">
            {segments.map((seg, i) => (
              <SegmentPair
                key={seg.key}
                index={i}
                segmentKey={seg.key}
                originalHtml={seg.html}
                translatedValue={values[seg.key] || ""}
                status={statuses[seg.key] || null}
                onTranslationChange={handleValueChange}
                onTranslateSegment={handleTranslateSegment}
                translatingKey={translatingKey}
              />
            ))}
          </div>
        </div>
      )}

      {/* Keyboard shortcuts hint */}
      <div className="mt-6 text-center text-xs text-muted">
        <kbd className="px-1.5 py-0.5 rounded border bg-accent font-mono text-[10px]">Ctrl+S</kbd>
        {" "}Save
      </div>
    </div>
  );
}
