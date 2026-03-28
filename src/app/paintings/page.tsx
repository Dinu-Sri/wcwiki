import { Metadata } from "next";
import Link from "next/link";
import { db } from "@/lib/db";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Paintings",
  description:
    "Browse watercolor paintings — from classic masterworks to contemporary watercolor art.",
};

export default async function PaintingsPage() {
  const paintings = await db.painting.findMany({
    orderBy: { title: "asc" },
    include: { artist: true },
  });

  return (
    <>
      <Header />
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-8">
        {/* Breadcrumb */}
        <nav className="text-xs text-muted mb-6 flex items-center gap-1.5">
          <Link href="/" className="hover:text-primary transition-colors">
            Home
          </Link>
          <span>›</span>
          <span className="text-foreground">Paintings</span>
        </nav>

        <h1 className="text-3xl font-bold text-foreground mb-2">
          Watercolor Paintings
        </h1>
        <p className="text-muted mb-8">
          {paintings.length} paintings in the collection
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {paintings.map((painting) => {
            const thumb =
              painting.images.length > 0 ? painting.images[0] : null;
            return (
              <Link
                key={painting.id}
                href={`/paintings/${painting.slug}`}
                className="group block rounded-xl overflow-hidden bg-card border border-border hover:border-primary/30 hover:shadow-lg transition-all duration-200"
              >
                <div className="aspect-square bg-accent overflow-hidden">
                  {thumb ? (
                    <img
                      src={thumb}
                      alt={painting.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-warm-light to-accent">
                      <svg
                        className="w-10 h-10 text-warm/30"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1}
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                  )}
                </div>
                <div className="px-2 py-2">
                  <h3 className="text-xs font-medium text-foreground truncate">
                    {painting.title}
                  </h3>
                  <p className="text-xs text-muted truncate">
                    {painting.artist.name}
                    {painting.year ? ` · ${painting.year}` : ""}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </main>
      <Footer />
    </>
  );
}
