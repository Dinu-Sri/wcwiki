"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ReferencesEditor, type Reference } from "@/components/editor/ReferencesEditor";

interface ArtistData {
  id: string;
  name: string;
  slug: string;
  bio: string | null;
  nationality: string | null;
  birthYear: number | null;
  deathYear: number | null;
  styles: string[];
  website: string | null;
  socialLinks: Record<string, string> | null;
}

export default function EditArtistPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [artist, setArtist] = useState<ArtistData | null>(null);
  const [form, setForm] = useState<Record<string, string>>({});
  const [socialLinks, setSocialLinks] = useState({
    instagram: "",
    youtube: "",
    x: "",
    facebook: "",
    pinterest: "",
    behance: "",
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [slug, setSlug] = useState<string>("");
  const [references, setReferences] = useState<Reference[]>([]);

  useEffect(() => {
    params.then((p) => setSlug(p.slug));
  }, [params]);

  useEffect(() => {
    if (!slug) return;
    fetch(`/api/entity?type=artist&slug=${encodeURIComponent(slug)}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) {
          setLoading(false);
          return;
        }
        setArtist(data);
        setForm({
          bio: data.bio || "",
          nationality: data.nationality || "",
          birthYear: data.birthYear?.toString() || "",
          deathYear: data.deathYear?.toString() || "",
          styles: (data.styles || []).join(", "),
          website: data.website || "",
        });
        if (data.socialLinks) {
          setSocialLinks({
            instagram: data.socialLinks.instagram || "",
            youtube: data.socialLinks.youtube || "",
            x: data.socialLinks.x || "",
            facebook: data.socialLinks.facebook || "",
            pinterest: data.socialLinks.pinterest || "",
            behance: data.socialLinks.behance || "",
          });
        }
        setReferences((data.references ?? []) as Reference[]);
        setLoading(false);
      });
  }, [slug]);

  if (status === "loading" || loading) {
    return (
      <>
        <Header />
        <main className="min-h-screen flex items-center justify-center text-muted">
          Loading...
        </main>
        <Footer />
      </>
    );
  }

  if (!session?.user || !["EDITOR", "APPROVER", "SUPER_ADMIN"].includes(session.user.role as string)) {
    return (
      <>
        <Header />
        <main className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-xl font-bold text-foreground mb-2">Access Denied</h1>
            <p className="text-muted">You need EDITOR role or above to edit content.</p>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  if (!artist) {
    return (
      <>
        <Header />
        <main className="min-h-screen flex items-center justify-center text-muted">
          Artist not found.
        </main>
        <Footer />
      </>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);

    const edits = [];

    if (form.bio !== (artist.bio || "")) {
      edits.push({ field: "bio", oldValue: artist.bio, newValue: form.bio || null });
    }
    if (form.nationality !== (artist.nationality || "")) {
      edits.push({ field: "nationality", oldValue: artist.nationality, newValue: form.nationality || null });
    }
    if (form.website !== (artist.website || "")) {
      edits.push({ field: "website", oldValue: artist.website, newValue: form.website || null });
    }
    const oldSocial = JSON.stringify(artist.socialLinks || {});
    const newSocial = JSON.stringify(socialLinks);
    if (oldSocial !== newSocial) {
      edits.push({ field: "socialLinks", oldValue: oldSocial, newValue: newSocial });
    }
    const oldRefs = JSON.stringify((artist as unknown as { references?: Reference[] }).references ?? []);
    const newRefs = JSON.stringify(references);
    if (oldRefs !== newRefs) {
      edits.push({ field: "references", oldValue: oldRefs, newValue: newRefs });
    }

    if (edits.length === 0) {
      setMessage({ type: "error", text: "No changes detected." });
      setSubmitting(false);
      return;
    }

    const res = await fetch("/api/edits", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        entityType: "ARTIST",
        entityId: artist.id,
        edits,
      }),
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
          {/* Breadcrumbs */}
          <nav className="flex items-center gap-1.5 text-xs text-muted mb-6">
            <a href="/" className="hover:text-foreground">Home</a>
            <span>/</span>
            <a href="/artists" className="hover:text-foreground">Artists</a>
            <span>/</span>
            <a href={`/artists/${artist.slug}`} className="hover:text-foreground">{artist.name}</a>
            <span>/</span>
            <span className="text-foreground">Edit</span>
          </nav>

          <h1 className="text-2xl font-bold text-foreground mb-1">
            Edit: {artist.name}
          </h1>
          <p className="text-sm text-muted mb-6">
            {session.user.role === "EDITOR"
              ? "Your changes will be submitted for review by an approver."
              : "Your changes will be applied immediately."}
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
            {/* Bio */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Biography
              </label>
              <textarea
                value={form.bio}
                onChange={(e) => setForm({ ...form, bio: e.target.value })}
                rows={8}
                className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-1 focus:ring-primary resize-y"
                placeholder="Artist biography..."
              />
            </div>

            {/* Nationality */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Nationality
              </label>
              <input
                type="text"
                value={form.nationality}
                onChange={(e) => setForm({ ...form, nationality: e.target.value })}
                className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="e.g., British"
              />
            </div>

            {/* Website */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Website
              </label>
              <input
                type="url"
                value={form.website}
                onChange={(e) => setForm({ ...form, website: e.target.value })}
                className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="https://..."
              />
            </div>

            {/* Social Links */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Social Links
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {Object.entries(socialLinks).map(([key, value]) => (
                  <div key={key}>
                    <label className="text-xs text-muted capitalize mb-1 block">
                      {key === "x" ? "X (Twitter)" : key}
                    </label>
                    <input
                      type="url"
                      value={value}
                      onChange={(e) =>
                        setSocialLinks((prev) => ({
                          ...prev,
                          [key]: e.target.value,
                        }))
                      }
                      className="w-full bg-surface border border-border rounded-xl px-4 py-2 text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-1 focus:ring-primary"
                      placeholder={`https://${key === "x" ? "x" : key}.com/…`}
                    />
                  </div>
                ))}
              </div>
            </div>

            <ReferencesEditor references={references} onChange={setReferences} />

            {/* Actions */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2.5 bg-primary text-white text-sm font-medium rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                {submitting ? "Submitting..." : "Submit Changes"}
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
      <Footer />
    </>
  );
}
