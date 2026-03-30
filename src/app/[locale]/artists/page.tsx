import { Metadata } from "next";
import Link from "next/link";
import { db } from "@/lib/db";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import {
  generateItemListSchema,
  generateBreadcrumbSchema,
} from "@/lib/schema";

export const dynamic = "force-dynamic";

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://wcwiki.com";

export const metadata: Metadata = {
  title: "Watercolor Artists Directory",
  description:
    "Browse watercolor artists from around the world — from classic masters to contemporary creators. Explore biographies, paintings, and art styles.",
  alternates: {
    canonical: `${baseUrl}/artists`,
  },
  openGraph: {
    title: "Watercolor Artists Directory",
    description: "Browse watercolor artists from around the world — from classic masters to contemporary creators.",
    url: `${baseUrl}/artists`,
    type: "website",
  },
};

export default async function ArtistsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  const artists = await db.artist.findMany({
    orderBy: { name: "asc" },
    include: {
      _count: { select: { paintings: true } },
    },
  });

  // Overlay translations for non-English locales
  if (locale && locale !== "en" && artists.length > 0) {
    const translations = await db.translation.findMany({
      where: {
        entityType: "ARTIST",
        entityId: { in: artists.map((a) => a.id) },
        locale,
        field: { in: ["name", "bio"] },
        status: "APPROVED",
      },
    });
    const byEntity = new Map<string, Record<string, string>>();
    for (const t of translations) {
      if (!byEntity.has(t.entityId)) byEntity.set(t.entityId, {});
      byEntity.get(t.entityId)![t.field] = t.value;
    }
    for (const artist of artists) {
      const overrides = byEntity.get(artist.id);
      if (overrides) {
        if (overrides.name) (artist as Record<string, unknown>).name = overrides.name;
        if (overrides.bio) (artist as Record<string, unknown>).bio = overrides.bio;
      }
    }
  }

  const itemListLd = generateItemListSchema(
    artists.map((a) => ({
      url: `/artists/${a.slug}`,
      name: a.name,
      image: a.image,
    })),
    baseUrl,
    "Watercolor Artists"
  );
  const breadcrumbLd = generateBreadcrumbSchema(baseUrl, [
    { name: "Home", url: "/" },
    { name: "Artists", url: "/artists" },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />
      <Header />
      <main className="flex-1 max-w-5xl mx-auto w-full px-3 sm:px-4 py-6 sm:py-8">
        {/* Breadcrumb */}
        <nav className="text-xs text-muted mb-4 sm:mb-6 flex items-center gap-1.5">
          <Link href="/" className="hover:text-primary transition-colors">
            Home
          </Link>
          <span>›</span>
          <span className="text-foreground">Artists</span>
        </nav>

        <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
          Watercolor Artists
        </h1>
        <p className="text-sm sm:text-base text-muted mb-6 sm:mb-8">
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
