"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

interface ArticleData {
  id: string;
  title: string;
  slug: string;
  body: string;
  excerpt: string | null;
  tags: string[];
  author: { name: string | null };
}

export default function EditArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [article, setArticle] = useState<ArticleData | null>(null);
  const [form, setForm] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [slug, setSlug] = useState("");

  useEffect(() => {
    params.then((p) => setSlug(p.slug));
  }, [params]);

  useEffect(() => {
    if (!slug) return;
    fetch(`/api/entity?type=article&slug=${encodeURIComponent(slug)}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) { setLoading(false); return; }
        setArticle(data);
        setForm({
          title: data.title || "",
          body: data.body || "",
          excerpt: data.excerpt || "",
          tags: (data.tags || []).join(", "),
        });
        setLoading(false);
      });
  }, [slug]);

  if (status === "loading" || loading) {
    return (<><Header /><main className="min-h-screen flex items-center justify-center text-muted">Loading...</main><Footer /></>);
  }

  if (!session?.user || !["EDITOR", "APPROVER", "SUPER_ADMIN"].includes(session.user.role as string)) {
    return (<><Header /><main className="min-h-screen flex items-center justify-center"><div className="text-center"><h1 className="text-xl font-bold text-foreground mb-2">Access Denied</h1><p className="text-muted">You need EDITOR role or above to edit content.</p></div></main><Footer /></>);
  }

  if (!article) {
    return (<><Header /><main className="min-h-screen flex items-center justify-center text-muted">Article not found.</main><Footer /></>);
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);

    const edits = [];
    if (form.title !== (article.title || "")) {
      edits.push({ field: "title", oldValue: article.title, newValue: form.title });
    }
    if (form.body !== (article.body || "")) {
      edits.push({ field: "body", oldValue: article.body, newValue: form.body });
    }
    if (form.excerpt !== (article.excerpt || "")) {
      edits.push({ field: "excerpt", oldValue: article.excerpt, newValue: form.excerpt || null });
    }

    if (edits.length === 0) {
      setMessage({ type: "error", text: "No changes detected." });
      setSubmitting(false);
      return;
    }

    const res = await fetch("/api/edits", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ entityType: "ARTICLE", entityId: article.id, edits }),
    });
    const data = await res.json();
    setSubmitting(false);

    if (res.ok) {
      setMessage({
        type: "success",
        text: data.autoApproved
          ? `${data.submitted} change(s) applied immediately.`
          : `${data.submitted} change(s) submitted for review.`,
      });
    } else {
      setMessage({ type: "error", text: data.error || "Failed to submit edits." });
    }
  };

  return (
    <>
      <Header />
      <main className="min-h-screen bg-background">
        <div className="max-w-3xl mx-auto px-4 py-10">
          <nav className="flex items-center gap-1.5 text-xs text-muted mb-6">
            <a href="/" className="hover:text-foreground">Home</a>
            <span>/</span>
            <a href="/articles" className="hover:text-foreground">Articles</a>
            <span>/</span>
            <a href={`/articles/${article.slug}`} className="hover:text-foreground">{article.title}</a>
            <span>/</span>
            <span className="text-foreground">Edit</span>
          </nav>

          <h1 className="text-2xl font-bold text-foreground mb-1">Edit: {article.title}</h1>
          <p className="text-sm text-muted mb-6">
            {session.user.role === "EDITOR"
              ? "Changes submitted for review."
              : "Changes applied immediately."}
          </p>

          {message && (
            <div className={`mb-6 px-4 py-3 rounded-lg text-sm ${message.type === "success" ? "bg-green-900/20 border border-green-800/30 text-green-400" : "bg-red-900/20 border border-red-800/30 text-red-400"}`}>
              {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Title</label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Excerpt</label>
              <textarea
                value={form.excerpt}
                onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
                rows={3}
                className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-1 focus:ring-primary resize-y"
                placeholder="Short summary..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Body (HTML)</label>
              <textarea
                value={form.body}
                onChange={(e) => setForm({ ...form, body: e.target.value })}
                rows={16}
                className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-sm text-foreground font-mono placeholder:text-muted focus:outline-none focus:ring-1 focus:ring-primary resize-y"
                placeholder="Article body HTML..."
              />
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button type="submit" disabled={submitting} className="px-6 py-2.5 bg-primary text-white text-sm font-medium rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50">
                {submitting ? "Submitting..." : "Submit Changes"}
              </button>
              <button type="button" onClick={() => router.back()} className="px-6 py-2.5 border border-border text-sm text-foreground rounded-xl hover:bg-accent transition-colors">
                Cancel
              </button>
            </div>
          </form>
        </div>
      </main>
      <Footer />
    </>
  );
}
