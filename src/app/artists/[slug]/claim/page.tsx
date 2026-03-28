"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

export default function ClaimArtistPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [slug, setSlug] = useState("");
  const [artist, setArtist] = useState<{
    id: string;
    name: string;
    slug: string;
    deathYear: number | null;
    connectedUserId: string | null;
  } | null>(null);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    params.then((p) => setSlug(p.slug));
  }, [params]);

  useEffect(() => {
    if (!slug) return;
    fetch(`/api/entity?type=artist&slug=${encodeURIComponent(slug)}`)
      .then((r) => r.json())
      .then((data) => {
        if (!data.error) setArtist(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
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

  if (status === "unauthenticated") {
    return (
      <>
        <Header />
        <main className="min-h-screen flex items-center justify-center">
          <div className="text-center max-w-md">
            <h1 className="text-xl font-bold mb-2">Sign In Required</h1>
            <p className="text-muted text-sm mb-4">
              You need to sign in before you can claim an artist page.
            </p>
            <button
              onClick={() => router.push("/auth/login")}
              className="px-4 py-2 bg-primary text-white rounded-lg text-sm"
            >
              Sign In
            </button>
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

  // Can't claim deceased artists
  if (artist.deathYear) {
    return (
      <>
        <Header />
        <main className="min-h-screen flex items-center justify-center">
          <div className="text-center max-w-md">
            <h1 className="text-xl font-bold mb-2">Cannot Claim This Page</h1>
            <p className="text-muted text-sm">
              This artist page is for a historical figure and cannot be claimed.
            </p>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  // Already claimed
  if (artist.connectedUserId) {
    return (
      <>
        <Header />
        <main className="min-h-screen flex items-center justify-center">
          <div className="text-center max-w-md">
            <h1 className="text-xl font-bold mb-2">Already Verified</h1>
            <p className="text-muted text-sm">
              This artist page has already been claimed and verified.
            </p>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) {
      setError("Please provide a message explaining why you are this artist.");
      return;
    }
    setSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/artist-claims", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ artistId: artist.id, message }),
      });
      const data = await res.json();
      if (res.ok) {
        setSubmitted(true);
      } else {
        setError(data.error || "Failed to submit claim.");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <>
        <Header />
        <main className="min-h-screen flex items-center justify-center">
          <div className="text-center max-w-md">
            <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-xl font-bold mb-2">Claim Submitted</h1>
            <p className="text-muted text-sm mb-4">
              Your claim for <strong>{artist.name}</strong>&apos;s page has been submitted.
              Our team will review it and get back to you.
            </p>
            <button
              onClick={() => router.push(`/artists/${artist.slug}`)}
              className="px-4 py-2 bg-primary text-white rounded-lg text-sm"
            >
              Back to Artist Page
            </button>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-background">
        <div className="max-w-lg mx-auto px-4 py-10">
          <nav className="flex items-center gap-1.5 text-xs text-muted mb-6">
            <a href="/" className="hover:text-foreground">Home</a>
            <span>/</span>
            <a href="/artists" className="hover:text-foreground">Artists</a>
            <span>/</span>
            <a href={`/artists/${artist.slug}`} className="hover:text-foreground">{artist.name}</a>
            <span>/</span>
            <span className="text-foreground">Claim</span>
          </nav>

          <h1 className="text-2xl font-bold mb-2">Claim: {artist.name}</h1>
          <p className="text-sm text-muted mb-6">
            If you are <strong>{artist.name}</strong>, you can claim this page to get a
            verified badge and manage your artist profile.
          </p>

          {error && (
            <div className="mb-4 px-4 py-3 rounded-lg text-sm bg-red-50 text-red-800 border border-red-200">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium mb-1.5">
                Verification Message *
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={5}
                className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-1 focus:ring-primary resize-y"
                placeholder="Please explain how you can prove you are this artist. Include links to your official website, social media, or other verification..."
              />
              <p className="text-xs text-muted mt-1.5">
                Our team will verify your identity before approving the claim.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2.5 bg-primary text-white text-sm font-medium rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                {submitting ? "Submitting..." : "Submit Claim"}
              </button>
              <button
                type="button"
                onClick={() => router.push(`/artists/${artist.slug}`)}
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
