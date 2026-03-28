"use client";

import { useState } from "react";

export interface Reference {
  title: string;
  url?: string;
  author?: string;
  publishedDate?: string;
  accessDate?: string;
  note?: string;
}

interface Props {
  references: Reference[];
  onChange: (refs: Reference[]) => void;
}

const emptyRef: Reference = { title: "", url: "", author: "", publishedDate: "", accessDate: "", note: "" };

export function ReferencesEditor({ references, onChange }: Props) {
  const [editing, setEditing] = useState<number | null>(null);
  const [draft, setDraft] = useState<Reference>(emptyRef);

  const startAdd = () => {
    setDraft(emptyRef);
    setEditing(-1);
  };

  const startEdit = (idx: number) => {
    setDraft({ ...emptyRef, ...references[idx] });
    setEditing(idx);
  };

  const save = () => {
    if (!draft.title.trim()) return;
    const cleaned: Reference = { title: draft.title.trim() };
    if (draft.url?.trim()) cleaned.url = draft.url.trim();
    if (draft.author?.trim()) cleaned.author = draft.author.trim();
    if (draft.publishedDate?.trim()) cleaned.publishedDate = draft.publishedDate.trim();
    if (draft.accessDate?.trim()) cleaned.accessDate = draft.accessDate.trim();
    if (draft.note?.trim()) cleaned.note = draft.note.trim();

    if (editing === -1) {
      onChange([...references, cleaned]);
    } else if (editing !== null) {
      const updated = [...references];
      updated[editing] = cleaned;
      onChange(updated);
    }
    setEditing(null);
    setDraft(emptyRef);
  };

  const remove = (idx: number) => {
    onChange(references.filter((_, i) => i !== idx));
    if (editing === idx) {
      setEditing(null);
      setDraft(emptyRef);
    }
  };

  const cancel = () => {
    setEditing(null);
    setDraft(emptyRef);
  };

  return (
    <div>
      <label className="block text-sm font-medium text-foreground mb-1.5">References</label>

      {references.length > 0 && (
        <ol className="list-decimal list-inside space-y-2 mb-3">
          {references.map((ref, idx) => (
            <li
              key={idx}
              className="text-sm text-muted bg-surface border border-border rounded-lg px-3 py-2 flex items-start justify-between gap-2"
            >
              <div className="flex-1 min-w-0">
                <span className="text-foreground font-medium">{ref.title}</span>
                {ref.author && <span> — {ref.author}</span>}
                {ref.url && (
                  <a
                    href={ref.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-1 text-primary hover:underline text-xs"
                  >
                    [link]
                  </a>
                )}
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button type="button" onClick={() => startEdit(idx)} className="text-xs text-primary hover:underline">
                  Edit
                </button>
                <button type="button" onClick={() => remove(idx)} className="text-xs text-red-600 hover:underline">
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ol>
      )}

      {editing !== null ? (
        <div className="bg-surface border border-border rounded-xl p-3 space-y-2">
          <input
            type="text"
            value={draft.title}
            onChange={(e) => setDraft({ ...draft, title: e.target.value })}
            placeholder="Title *"
            className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-1 focus:ring-primary"
          />
          <input
            type="url"
            value={draft.url || ""}
            onChange={(e) => setDraft({ ...draft, url: e.target.value })}
            placeholder="URL"
            className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-1 focus:ring-primary"
          />
          <div className="grid grid-cols-2 gap-2">
            <input
              type="text"
              value={draft.author || ""}
              onChange={(e) => setDraft({ ...draft, author: e.target.value })}
              placeholder="Author"
              className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-1 focus:ring-primary"
            />
            <input
              type="text"
              value={draft.publishedDate || ""}
              onChange={(e) => setDraft({ ...draft, publishedDate: e.target.value })}
              placeholder="Published date"
              className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          <input
            type="text"
            value={draft.note || ""}
            onChange={(e) => setDraft({ ...draft, note: e.target.value })}
            placeholder="Note (optional)"
            className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-1 focus:ring-primary"
          />
          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={save}
              className="px-4 py-1.5 bg-primary text-white text-xs font-medium rounded-lg hover:bg-primary/90"
            >
              {editing === -1 ? "Add" : "Update"}
            </button>
            <button
              type="button"
              onClick={cancel}
              className="px-4 py-1.5 border border-border text-xs text-foreground rounded-lg hover:bg-accent"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button type="button" onClick={startAdd} className="text-sm text-primary hover:underline flex items-center gap-1">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add reference
        </button>
      )}
    </div>
  );
}
