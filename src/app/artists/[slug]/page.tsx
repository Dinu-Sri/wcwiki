import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const artist = await db.artist.findUnique({ where: { slug } });
  if (!artist) return { title: "Artist Not Found" };

  const lifespan =
    artist.birthYear && artist.deathYear
      ? `(${artist.birthYear}–${artist.deathYear})`
      : artist.birthYear
        ? `(b. ${artist.birthYear})`
        : "";

  return {
    title: `${artist.name} ${lifespan}`,
    description:
      artist.bio?.slice(0, 160) ||
      `Explore watercolor works by ${artist.name}.`,
    openGraph: {
      title: artist.name,
      description: artist.bio?.slice(0, 160) || undefined,
      images: artist.image ? [artist.image] : undefined,
    },
  };
}

export default async function ArtistPage({ params }: Props) {
  const { slug } = await params;

  const artist = await db.artist.findUnique({
    where: { slug },
    include: {
      paintings: {
        orderBy: { year: "asc" },
      },
    },
  });

  if (!artist) notFound();

  const lifespan =
    artist.birthYear && artist.deathYear
      ? `${artist.birthYear}–${artist.deathYear}`
      : artist.birthYear
        ? `b. ${artist.birthYear}`
        : null;

  const subtitle = [artist.nationality, lifespan].filter(Boolean).join(" · ");

  // Related artists: same nationality or overlapping styles
  const relatedArtists = await db.artist.findMany({
    where: {
      id: { not: artist.id },
      OR: [
        artist.nationality ? { nationality: artist.nationality } : {},
        { styles: { hasSome: artist.styles } },
      ].filter((c) => Object.keys(c).length > 0),
    },
    take: 4,
  });

  // JSON-LD structured data
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: artist.name,
    ...(artist.nationality && { nationality: artist.nationality }),
    ...(artist.birthYear && {
      birthDate: String(artist.birthYear),
    }),
    ...(artist.deathYear && {
      deathDate: String(artist.deathYear),
    }),
    ...(artist.bio && { description: artist.bio }),
    ...(artist.image && { image: artist.image }),
    ...(artist.website && { url: artist.website }),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Header />
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-8">
        {/* Breadcrumb */}
        <nav className="text-xs text-muted mb-6 flex items-center gap-1.5">
          <Link href="/" className="hover:text-primary transition-colors">
            Home
          </Link>
          <span>›</span>
          <Link
            href="/artists"
            className="hover:text-primary transition-colors"
          >
            Artists
          </Link>
          <span>›</span>
          <span className="text-foreground">{artist.name}</span>
        </nav>

        {/* Hero */}
        <div className="flex flex-col sm:flex-row gap-6 mb-10">
          {artist.image && (
            <div className="shrink-0">
              <img
                src={artist.image}
                alt={artist.name}
                className="w-32 h-32 sm:w-40 sm:h-40 rounded-2xl object-cover shadow-md"
              />
            </div>
          )}
          <div className="flex-1">
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">
              {artist.name}
            </h1>
            {subtitle && (
              <p className="text-muted text-lg mb-3">{subtitle}</p>
            )}

            {/* Styles */}
            {artist.styles.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {artist.styles.map((style) => (
                  <span
                    key={style}
                    className="px-3 py-1 text-xs font-medium bg-primary-light text-primary rounded-full"
                  >
                    {style}
                  </span>
                ))}
              </div>
            )}

            {/* Links */}
            <div className="flex items-center gap-3">
              {artist.website && (
                <a
                  href={artist.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary hover:underline"
                >
                  Website ↗
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Bio */}
        {artist.bio && (
          <section className="mb-10">
            <h2 className="text-xl font-semibold text-foreground mb-3">
              Biography
            </h2>
            <p className="text-muted leading-relaxed whitespace-pre-line">
              {artist.bio}
            </p>
          </section>
        )}

        {/* Paintings Gallery */}
        {artist.paintings.length > 0 && (
          <section className="mb-10">
            <h2 className="text-xl font-semibold text-foreground mb-4">
              Paintings{" "}
              <span className="text-muted font-normal text-base">
                ({artist.paintings.length})
              </span>
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {artist.paintings.map((painting) => {
                const thumb =
                  painting.images.length > 0 ? painting.images[0] : null;
                return (
                  <Link
                    key={painting.id}
                    href={`/paintings/${painting.slug}`}
                    className="group block rounded-xl overflow-hidden bg-card hover:shadow-lg transition-all duration-200"
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
                      {painting.year && (
                        <p className="text-xs text-muted">{painting.year}</p>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        {/* Related Artists */}
        {relatedArtists.length > 0 && (
          <section className="mb-10">
            <h2 className="text-xl font-semibold text-foreground mb-4">
              Related Artists
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {relatedArtists.map((ra) => {
                const ls =
                  ra.birthYear && ra.deathYear
                    ? `${ra.birthYear}–${ra.deathYear}`
                    : ra.birthYear
                      ? `b. ${ra.birthYear}`
                      : null;
                const sub = [ra.nationality, ls].filter(Boolean).join(" · ");
                return (
                  <Link
                    key={ra.id}
                    href={`/artists/${ra.slug}`}
                    className="group flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-card hover:shadow-sm transition-all"
                  >
                    {ra.image ? (
                      <img
                        src={ra.image}
                        alt={ra.name}
                        className="w-10 h-10 rounded-full object-cover shrink-0"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-accent shrink-0 flex items-center justify-center text-muted text-sm font-medium">
                        {ra.name.charAt(0)}
                      </div>
                    )}
                    <div>
                      <h3 className="text-sm font-medium text-primary group-hover:underline">
                        {ra.name}
                      </h3>
                      {sub && (
                        <p className="text-xs text-muted">{sub}</p>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}
      </main>
      <Footer />
    </>
  );
}
