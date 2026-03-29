import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { LightboxGallery } from "@/components/gallery/LightboxGallery";
import { EditHistoryButton } from "@/components/EditHistoryButton";
import { ReferencesSection } from "@/components/ReferencesSection";
import {
  generatePersonSchema,
  generateBreadcrumbSchema,
} from "@/lib/schema";
import { getTranslations } from "@/lib/translations";
import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ locale: string; slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const artist = await db.artist.findUnique({ where: { slug } });
  if (!artist) return { title: "Artist Not Found" };

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://wcwiki.com";

  const lifespan =
    artist.birthYear && artist.deathYear
      ? `(${artist.birthYear}–${artist.deathYear})`
      : artist.birthYear
        ? `(b. ${artist.birthYear})`
        : "";

  const title = artist.metaTitle || `${artist.name} ${lifespan}`.trim();
  const description =
    artist.metaDescription ||
    artist.bio?.slice(0, 160) ||
    `Explore watercolor works by ${artist.name}. Discover paintings, biography, and art styles.`;

  const ogImageUrl = artist.ogImage || artist.image
    ? artist.ogImage || artist.image!
    : `${baseUrl}/api/og?type=artist&title=${encodeURIComponent(artist.name)}&subtitle=${encodeURIComponent(artist.nationality || "")}`;

  const nameParts = artist.name.split(" ");
  const firstName = nameParts[0];
  const lastName = nameParts.slice(1).join(" ");

  return {
    title,
    description,
    alternates: {
      canonical: `${baseUrl}/artists/${slug}`,
    },
    openGraph: {
      type: "profile",
      title: artist.name,
      description,
      url: `${baseUrl}/artists/${slug}`,
      images: [{ url: ogImageUrl, width: 1200, height: 630, alt: artist.name }],
      firstName,
      lastName,
    },
    twitter: {
      card: "summary_large_image",
      title: artist.name,
      description,
      images: [ogImageUrl],
    },
  };
}

export default async function ArtistPage({ params }: Props) {
  const { locale, slug } = await params;
  const session = await auth();
  const canTranslate = session?.user && ["SUPER_ADMIN", "APPROVER", "EDITOR"].includes(session.user.role);

  const artist = await db.artist.findUnique({
    where: { slug },
    include: {
      paintings: {
        orderBy: { year: "asc" },
      },
    },
  });

  if (!artist) notFound();

  // Fetch approved translations for this locale
  const tr = await getTranslations("ARTIST", artist.id, locale);
  const displayName = tr.name || artist.name;
  const displayBio = tr.bio || artist.bio;

  const socialLinks = (artist.socialLinks || {}) as Record<string, string>;
  const isVerified = !!artist.connectedUserId;
  const isClaimable = !artist.deathYear && !artist.connectedUserId;

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
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://wcwiki.com";
  const jsonLd = generatePersonSchema(
    { ...artist, socialLinks: socialLinks as Record<string, string> },
    baseUrl
  );
  const breadcrumbLd = generateBreadcrumbSchema(baseUrl, [
    { name: "Home", url: "/" },
    { name: "Artists", url: "/artists" },
    { name: artist.name, url: `/artists/${artist.slug}` },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />
      <Header />
      <main className="flex-1 max-w-5xl mx-auto w-full px-3 sm:px-4 py-6 sm:py-8">
        {/* Breadcrumb */}
        <nav className="text-xs text-muted mb-4 sm:mb-6 flex items-center gap-1.5 overflow-x-auto">
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
          <span className="text-foreground">{displayName}</span>
        </nav>

        {/* Edit Actions */}
        <div className="flex items-center gap-3 mb-6">
          <Link
            href={`/edit/artist/${artist.slug}`}
            className="text-xs text-primary hover:underline"
          >
            Edit this page
          </Link>
          <EditHistoryButton entityType="ARTIST" entityId={artist.id} />
          {canTranslate && (
            <Link
              href={`/translate/artist/${artist.slug}`}
              className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
              </svg>
              Translate
            </Link>
          )}
        </div>

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
            <div className="flex items-center gap-2 mb-2">
              <h1 className="text-3xl sm:text-4xl font-bold text-foreground">
                {displayName}
              </h1>
              {isVerified && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-700 text-xs font-medium rounded-full border border-blue-200">
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                  </svg>
                  Verified
                </span>
              )}
            </div>
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

            {/* Links & Social */}
            <div className="flex items-center gap-3 flex-wrap">
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
              {socialLinks.instagram && (
                <a href={socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="text-muted hover:text-pink-600 transition-colors" title="Instagram">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
                </a>
              )}
              {socialLinks.youtube && (
                <a href={socialLinks.youtube} target="_blank" rel="noopener noreferrer" className="text-muted hover:text-red-600 transition-colors" title="YouTube">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                </a>
              )}
              {socialLinks.x && (
                <a href={socialLinks.x} target="_blank" rel="noopener noreferrer" className="text-muted hover:text-foreground transition-colors" title="X (Twitter)">
                  <svg className="w-4.5 h-4.5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                </a>
              )}
              {socialLinks.facebook && (
                <a href={socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="text-muted hover:text-blue-600 transition-colors" title="Facebook">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                </a>
              )}

              {/* Claim button for contemporary living artists */}
              {isClaimable && (
                <Link
                  href={`/artists/${artist.slug}/claim`}
                  className="ml-auto text-xs px-3 py-1.5 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors"
                >
                  Are you this artist? Claim this page
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Bio */}
        {displayBio && (
          <section className="mb-10">
            <h2 className="text-xl font-semibold text-foreground mb-3">
              Biography
            </h2>
            <p className="text-muted leading-relaxed whitespace-pre-line">
              {displayBio}
            </p>
          </section>
        )}

        {/* Paintings Gallery — Lightbox */}
        {artist.paintings.length > 0 && (
          <section className="mb-10">
            <h2 className="text-xl font-semibold text-foreground mb-4">
              Paintings{" "}
              <span className="text-muted font-normal text-base">
                ({artist.paintings.length})
              </span>
            </h2>
            <LightboxGallery
              items={artist.paintings
                .filter((p) => p.images.length > 0)
                .map((p) => ({
                  src: p.images[0],
                  title: p.title,
                  subtitle: p.year ? String(p.year) : undefined,
                  href: `/paintings/${p.slug}`,
                }))}
            />
          </section>
        )}

        {/* References */}
        <ReferencesSection references={(artist.references as { title: string; url?: string; author?: string; publishedDate?: string; accessDate?: string; note?: string }[]) ?? []} />

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
