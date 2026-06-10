import { Metadata } from "next";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { PaintingReferenceUploadForm } from "@/components/references/PaintingReferenceUploadForm";

export const dynamic = "force-dynamic";

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://wcwiki.org";

export const metadata: Metadata = {
  title: "Donate Painting References",
  description:
    "Submit your original reference photos for watercolor artists. Approved images are published as painting references with CC BY 4.0 attribution.",
  alternates: {
    canonical: `${baseUrl}/painting-references/upload`,
  },
};

export default async function PaintingReferenceUploadPage() {
  const session = await auth();
  const categories = await db.referenceCategory.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true, slug: true },
  });

  return (
    <>
      <Header />
      <main className="flex-1 max-w-3xl mx-auto w-full px-3 sm:px-4 py-6 sm:py-8">
        <nav className="text-xs text-muted mb-4 sm:mb-6 flex items-center gap-1.5">
          <Link href="/" className="hover:text-primary transition-colors">
            Home
          </Link>
          <span>&gt;</span>
          <Link
            href="/painting-references"
            className="hover:text-primary transition-colors"
          >
            Painting References
          </Link>
          <span>&gt;</span>
          <span className="text-foreground">Donate</span>
        </nav>

        <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
          Donate Painting References
        </h1>
        <p className="text-sm sm:text-base text-muted mb-8">
          Share original photos that watercolor artists can paint from. Submissions are reviewed before publishing.
        </p>

        {!session?.user ? (
          <div className="rounded-xl border border-border bg-surface p-6">
            <h2 className="text-lg font-semibold text-foreground">
              Sign in to submit references
            </h2>
            <p className="mt-2 text-sm text-muted">
              Registered users can submit up to 10 images at a time.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link
                href="/auth/login"
                className="rounded-xl bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90"
              >
                Log In
              </Link>
              <Link
                href="/auth/register"
                className="rounded-xl border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-accent"
              >
                Create Account
              </Link>
            </div>
          </div>
        ) : (
          <PaintingReferenceUploadForm
            categories={categories}
            defaultAttributionName={session.user.name || session.user.email || ""}
          />
        )}
      </main>
      <Footer />
    </>
  );
}
