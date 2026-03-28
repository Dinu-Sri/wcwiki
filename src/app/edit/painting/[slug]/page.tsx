"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

interface PaintingData {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  medium: string | null;
  surface: string | null;
  year: number | null;
  tags: string[];
  artist: { name: string; slug: string };
}

export default function EditPaintingPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [painting, setPainting] = useState<PaintingData | null>(null);
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
    fetch(`/api/entity?type=painting&slug=${encodeURIComponent(slug)}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) { setLoading(false); return; }
        setPainting(data);
        setForm({
          description: data.description || "",
          medium: data.medium || "",
          surface: data.surface || "",
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

  if (!painting) {
    return (<><Header /><main className="min-h-screen flex items-center justify-center text-muted">Painting not found.</main><Footer /></>);
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);

    const edits = [];
    if (form.description !== (painting.description || "")) {
      edits.push({ field: "description", oldValue: painting.description, newValue: form.description || null });
    }
    if (form.medium !== (painting.medium || "")) {
      edits.push({ field: "medium", oldValue: painting.medium, newValue: form.medium || null });
    }
    if (form.surface !== (painting.surface || "")) {
      edits.push({ field: "surface", oldValue: painting.surface, newValue: form.surface || null });
    }

    if (edits.length === 0) {
      setMessage({ type: "error", text: "No changes detected." });
      setSubmitting(false);
      return;
    }

    const res = await fetch("/api/edits", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ entityType: "PAINTING", entityId: painting.id, edits }),
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
            <a href="/paintings" className="hover:text-foreground">Paintings</a>
            <span>/</span>
            <a href={`/paintings/${painting.slug}`} className="hover:text-foreground">{painting.title}</a>
            <span>/</span>
            <span className="text-foreground">Edit</span>
          </nav>

          <h1 className="text-2xl font-bold text-foreground mb-1">Edit: {painting.title}</h1>
          <p className="text-sm text-muted mb-6">
            by {painting.artist.name} &middot;{" "}
            {session.user.role === "EDITOR"
              ? "Changes submitted for review."
              : "Changes applied immediately."}
          </p>

          {message && (
            <div className={`mb-6 px-4 py-3 rounded-lg text-sm ${message.type === "success" ? "bg-green-50 border border-green-200 text-green-800" : "bg-red-50 border border-red-200 text-red-800"}`}>
              {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Description</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={6}
                className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-1 focus:ring-primary resize-y"
                placeholder="Painting description..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Medium</label>
                <input
                  type="text"
                  value={form.medium}
                  onChange={(e) => setForm({ ...form, medium: e.target.value })}
                  className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-1 focus:ring-primary"
                  placeholder="e.g., Watercolor"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Surface</label>
                <input
                  type="text"
                  value={form.surface}
                  onChange={(e) => setForm({ ...form, surface: e.target.value })}
                  className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-1 focus:ring-primary"
                  placeholder="e.g., Paper"
                />
              </div>
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
