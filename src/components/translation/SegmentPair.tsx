"use client";

import { useState, useRef, useEffect } from "react";

interface SegmentPairProps {
  index: number;
  segmentKey: string;
  originalHtml: string;
  translatedValue: string;
  status: string | null;
  onTranslationChange: (key: string, value: string) => void;
  onTranslateSegment: (key: string) => void;
  translatingKey: string | null;
}

export function SegmentPair({
  index,
  segmentKey,
  originalHtml,
  translatedValue,
  status,
  onTranslationChange,
  onTranslateSegment,
  translatingKey,
}: SegmentPairProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [focused, setFocused] = useState(false);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = textareaRef.current.scrollHeight + "px";
    }
  }, [translatedValue]);

  const isTranslating = translatingKey === segmentKey;

  const statusColors: Record<string, string> = {
    MACHINE: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
    IN_REVIEW: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300",
    APPROVED: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
    REJECTED: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
  };

  return (
    <div
      className={`grid grid-cols-1 lg:grid-cols-2 gap-3 lg:gap-4 p-3 sm:p-4 rounded-xl border transition-all ${
        focused
          ? "border-primary/40 bg-primary/5 shadow-sm"
          : "border-border/60 bg-card hover:border-border"
      }`}
    >
      {/* Original (left) */}
      <div className="min-w-0">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-[10px] font-mono text-muted bg-accent px-1.5 py-0.5 rounded">
            #{index + 1}
          </span>
          <span className="text-[10px] text-muted uppercase tracking-wide">Original</span>
        </div>
        <div
          className="text-sm text-muted leading-relaxed prose prose-sm max-w-none
            [&_p]:mb-2 [&_h1]:text-lg [&_h1]:font-bold [&_h2]:text-base [&_h2]:font-semibold
            [&_h3]:text-sm [&_h3]:font-medium [&_ul]:list-disc [&_ul]:pl-4 [&_ol]:list-decimal [&_ol]:pl-4
            [&_li]:mb-1 [&_blockquote]:border-l-2 [&_blockquote]:border-border [&_blockquote]:pl-3 [&_blockquote]:italic"
          dangerouslySetInnerHTML={{ __html: originalHtml }}
        />
      </div>

      {/* Translation (right) */}
      <div className="min-w-0">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-muted uppercase tracking-wide">Translation</span>
            {status && (
              <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${statusColors[status] || ""}`}>
                {status.replace("_", " ")}
              </span>
            )}
          </div>
          <button
            onClick={() => onTranslateSegment(segmentKey)}
            disabled={isTranslating}
            className="flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-medium
              bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400
              dark:hover:bg-blue-900/30 disabled:opacity-50 transition-colors"
            title="Auto-translate this segment"
          >
            {isTranslating ? (
              <svg className="w-3 h-3 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-25" />
                <path d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" fill="currentColor" className="opacity-75" />
              </svg>
            ) : (
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            )}
            {isTranslating ? "..." : "AI"}
          </button>
        </div>
        <textarea
          ref={textareaRef}
          value={translatedValue}
          onChange={(e) => onTranslationChange(segmentKey, e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className="w-full min-h-[60px] px-3 py-2 rounded-lg border border-border/60 bg-background
            text-sm leading-relaxed resize-none focus:outline-none focus:ring-2 focus:ring-primary/30
            focus:border-primary/40 placeholder:text-muted/50 transition-all"
          placeholder="Enter translation..."
          rows={1}
        />
      </div>
    </div>
  );
}
