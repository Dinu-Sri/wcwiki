"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { RichEditor } from "@/components/editor/RichEditor";
import { ReferencesEditor, type Reference } from "@/components/editor/ReferencesEditor";

interface SuggestionData {
  id: string;
  topic: string | null;
  details: string | null;
}

export default function NewArticlePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const suggestionId = searchParams.get("suggestion");

  const [suggestion, setSuggestion] = useState<SuggestionData | null>(null);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [tagsInput, setTagsInput] = useState("");
  const [references, setReferences] = useState<Reference[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Load suggestion data if provided
  useEffect(() => {
    if (!suggestionId) return;
    fetch(`/api/suggestions/${suggestionId}`)
      .then((r) => {
        if (r.ok) return r.json();
        return null;
      })
      .then((data) => {
        if (data?.data || data) {
          const s = data.data || data;
          setSuggestion(s);
          if (s.topic) setTitle(s.topic);
          if (s.details) setExcerpt(s.details);
        }
      })
      .catch(() => {});
  }, [suggestionId]);

  if (status === "loading") {
    return (
      <main className="min-h-screen flex items-center justify-center text-muted">
        Loading...
      </main>
    );
  }

  if (
    !session?.user ||
    (session.user.role !== "SUPER_ADMIN" && session.user.role !== "APPROVER")
  ) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-xl font-bold text-foreground mb-2">Access Denied</h1>
          <p className="text-muted">You need APPROVER role or above to create articles.</p>
        </div>
      </main>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !body.trim()) {
      setMessage({ type: "error", text: "Title and body are required." });
      return;
    }

    setSubmitting(true);
    setMessage(null);

    const tags = tagsInput
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    const res = await fetch("/api/admin/articles", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: title.trim(),
        body,
        excerpt: excerpt.trim() || null,
        tags,
        references: JSON.stringify(references),
        suggestionId: suggestionId || undefined,
      }),
    });

    const data = await res.json();
    setSubmitting(false);

    if (res.ok) {
      setMessage({ type: "success", text: "Article published successfully! Redirecting..." });
      setTimeout(() => {
        router.push(`/articles/${data.data.slug}`);
      }, 1500);
    } else {
      setMessage({ type: "error", text: data.error || "Failed to create article." });
    }
  };

  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-4 py-10">
        <nav className="flex items-center gap-1.5 text-xs text-muted mb-6">
          <a href="/admin" className="hover:text-foreground">Admin</a>
          <span>/</span>
          <a href="/admin/content" className="hover:text-foreground">Content</a>
          <span>/</span>
          <span className="text-foreground">New Article</span>
        </nav>

        <h1 className="text-2xl font-bold text-foreground mb-1">Create New Article</h1>
        {suggestion && (
          <p className="text-sm text-muted mb-1">
            Based on suggestion: &ldquo;{suggestion.topic}&rdquo;
          </p>
        )}
        <p className="text-sm text-muted mb-6">
          Article will be published immediately as APPROVED.
        </p>

        {message && (
          <div
            className={`mb-6 px-4 py-3 rounded-lg text-sm ${
              message.type === "success"
                ? "bg-green-50 border border-green-200 text-green-800"
                : "bg-red-50 border border-red-200 text-red-800"
            }`}
          >
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-1 focus:ring-primary"
              placeholder="Article title"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Excerpt</label>
            <textarea
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              rows={3}
              className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-1 focus:ring-primary resize-y"
              placeholder="Short summary of the article..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Body *</label>
            <RichEditor
              content={body}
              onChange={(html) => setBody(html)}
              placeholder="Write your article content here..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Tags</label>
            <input
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-1 focus:ring-primary"
              placeholder="watercolor, technique, tutorial (comma-separated)"
            />
          </div>

          <ReferencesEditor references={references} onChange={setReferences} />

          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 bg-primary text-white text-sm font-medium rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {submitting ? "Publishing..." : "Publish Article"}
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-2.5 border border-border text-sm text-foreground rounded-xl hover:bg-accent transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
