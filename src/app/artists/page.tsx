import { Metadata } from "next";
import Link from "next/link";
import { db } from "@/lib/db";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Artists",
  description:
    "Browse watercolor artists from around the world — from classic masters to contemporary creators.",
};

export default async function ArtistsPage() {
  const artists = await db.artist.findMany({
    orderBy: { name: "asc" },
    include: {
      _count: { select: { paintings: true } },
    },
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
          <span className="text-foreground">Artists</span>
        </nav>

        <h1 className="text-3xl font-bold text-foreground mb-2">
          Watercolor Artists
        </h1>
        <p className="text-muted mb-8">
          {artists.length} artists in the collection
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {artists.map((artist) => {
            const lifespan =
              artist.birthYear && artist.deathYear
                ? `${artist.birthYear}–${artist.deathYear}`
                : artist.birthYear
                  ? `b. ${artist.birthYear}`
                  : null;

            return (
              <Link
                key={artist.id}
                href={`/artists/${artist.slug}`}
                className="group flex gap-4 p-4 rounded-xl bg-card border border-border hover:border-primary/30 hover:shadow-md transition-all duration-200"
              >
                {artist.image ? (
                  <img
                    src={artist.image}
                    alt={artist.name}
                    className="w-16 h-16 rounded-xl object-cover shrink-0"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-xl bg-accent shrink-0 flex items-center justify-center text-muted text-xl font-medium">
                    {artist.name.charAt(0)}
                  </div>
                )}
                <div className="min-w-0">
                  <h2 className="font-medium text-foreground group-hover:text-primary transition-colors truncate">
                    {artist.name}
                  </h2>
                  <p className="text-xs text-muted mt-0.5">
                    {[artist.nationality, lifespan].filter(Boolean).join(" · ")}
                  </p>
                  {artist.styles.length > 0 && (
                    <p className="text-xs text-muted mt-1 truncate">
                      {artist.styles.join(", ")}
                    </p>
                  )}
                  <p className="text-xs text-muted mt-1">
                    {artist._count.paintings} painting
                    {artist._count.paintings !== 1 ? "s" : ""}
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
