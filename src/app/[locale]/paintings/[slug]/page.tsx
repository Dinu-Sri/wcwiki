import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { EditHistoryButton } from "@/components/EditHistoryButton";
import { PaintingLightbox } from "@/components/gallery/PaintingLightbox";
import {
  generateVisualArtworkSchema,
  generateBreadcrumbSchema,
} from "@/lib/schema";
import { TranslatePanel } from "@/components/TranslatePanel";
import { getTranslations } from "@/lib/translations";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ locale: string; slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const painting = await db.painting.findUnique({
    where: { slug },
    include: { artist: true },
  });
  if (!painting) return { title: "Painting Not Found" };

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://wcwiki.com";
  const title = painting.metaTitle || `${painting.title} by ${painting.artist.name}`;
  const description =
    painting.metaDescription ||
    painting.description?.slice(0, 160) ||
    `"${painting.title}" — a watercolor painting by ${painting.artist.name}.`;

  const ogImage = painting.ogImage ||
    (painting.images.length > 0 ? painting.images[0] : null) ||
    `${baseUrl}/api/og?type=painting&title=${encodeURIComponent(painting.title)}&subtitle=${encodeURIComponent(painting.artist.name)}`;

  return {
    title,
    description,
    alternates: {
      canonical: `${baseUrl}/paintings/${slug}`,
    },
    openGraph: {
      type: "article",
      title: `${painting.title} by ${painting.artist.name}`,
      description,
      url: `${baseUrl}/paintings/${slug}`,
      images: [{ url: ogImage, width: 1200, height: 630, alt: painting.title }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${painting.title} by ${painting.artist.name}`,
      description,
      images: [ogImage],
    },
  };
}

export default async function PaintingPage({ params }: Props) {
  const { locale, slug } = await params;

  const painting = await db.painting.findUnique({
    where: { slug },
    include: { artist: true },
  });

  if (!painting) notFound();

  // Fetch approved translations for this locale
  const tr = await getTranslations("PAINTING", painting.id, locale);
  const displayTitle = tr.title || painting.title;
  const displayDescription = tr.description || painting.description;

  // Related paintings by same artist
  const relatedByArtist = await db.painting.findMany({
    where: {
      artistId: painting.artistId,
      id: { not: painting.id },
    },
    take: 6,
    orderBy: { year: "asc" },
  });

  // Related paintings by shared tags
  const relatedByTag =
    painting.tags.length > 0
      ? await db.painting.findMany({
          where: {
            id: { not: painting.id },
            artistId: { not: painting.artistId },
            tags: { hasSome: painting.tags },
          },
          include: { artist: true },
          take: 4,
        })
      : [];

  const details = [
    painting.medium && { label: "Medium", value: painting.medium },
    painting.surface && { label: "Surface", value: painting.surface },
    painting.width &&
      painting.height && {
        label: "Dimensions",
        value: `${painting.width} × ${painting.height} cm`,
      },
    painting.year && { label: "Year", value: String(painting.year) },
  ].filter(Boolean) as { label: string; value: string }[];

  // JSON-LD structured data
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://wcwiki.com";
  const jsonLd = generateVisualArtworkSchema(painting, baseUrl, "wcWIKI");
  const breadcrumbLd = generateBreadcrumbSchema(baseUrl, [
    { name: "Home", url: "/" },
    { name: "Paintings", url: "/paintings" },
    { name: painting.title, url: `/paintings/${painting.slug}` },
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
        <nav className="text-xs text-muted mb-4 sm:mb-6 flex items-center gap-1.5 min-w-0">
          <Link href="/" className="shrink-0 hover:text-primary transition-colors">
            Home
          </Link>
          <span className="shrink-0">›</span>
          <Link
            href="/paintings"
            className="shrink-0 hover:text-primary transition-colors"
          >
            Paintings
          </Link>
          <span className="shrink-0">›</span>
          <span className="text-foreground truncate">{displayTitle}</span>
        </nav>

        {/* Edit Actions */}
        <div className="flex items-center gap-3 mb-6">
          <Link
            href={`/edit/painting/${painting.slug}`}
            className="text-xs text-primary hover:underline"
          >
            Edit this page
          </Link>
          <EditHistoryButton entityType="PAINTING" entityId={painting.id} />
          <TranslatePanel
            entityType="PAINTING"
            entityId={painting.id}
            fields={[
              { key: "title", label: "Title" },
              { key: "description", label: "Description", multiline: true },
            ]}
            originalValues={{
              title: painting.title,
              description: painting.description || "",
            }}
          />
        </div>

        {/* Main image + lightbox */}
        {painting.images.length > 0 && (
          <PaintingLightbox images={painting.images} title={painting.title} />
        )}

        {/* Title + Artist */}
        <div className="mb-6">
          <h1 className="text-2xl sm:text-4xl font-bold text-foreground mb-2">
            {displayTitle}
          </h1>
          <p className="text-lg text-muted">
            by{" "}
            <Link
              href={`/artists/${painting.artist.slug}`}
              className="text-primary hover:underline"
            >
              {painting.artist.name}
            </Link>
            {painting.year && (
              <span className="ml-2">· {painting.year}</span>
            )}
          </p>
        </div>

        {/* Tags */}
        {painting.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {painting.tags.map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 text-xs font-medium bg-accent text-muted rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Details grid */}
        {details.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8 p-4 bg-surface rounded-xl">
            {details.map((d) => (
              <div key={d.label}>
                <div className="text-xs text-muted uppercase tracking-wider mb-0.5">
                  {d.label}
                </div>
                <div className="text-sm font-medium text-foreground">
                  {d.value}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Description */}
        {displayDescription && (
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-foreground mb-3">
              About This Work
            </h2>
            <p className="text-muted leading-relaxed whitespace-pre-line">
              {displayDescription}
            </p>
          </section>
        )}

        {/* Attribution banner */}
        <div className="mb-10 p-4 bg-warm-light border border-warm/20 rounded-xl text-sm text-muted">
          <p>
            Listed for educational purposes only. All rights belong to the
            respective artist.
          </p>
          {painting.sourceUrl && (
            <a
              href={painting.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline mt-1 inline-block"
            >
              View original source ↗
            </a>
          )}
          {painting.attribution && (
            <p className="mt-1">{painting.attribution}</p>
          )}
        </div>

        {/* More by this artist */}
        {relatedByArtist.length > 0 && (
          <section className="mb-10">
            <h2 className="text-xl font-semibold text-foreground mb-4">
              More by {painting.artist.name}
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {relatedByArtist.map((rp) => {
                const thumb = rp.images.length > 0 ? rp.images[0] : null;
                return (
                  <Link
                    key={rp.id}
                    href={`/paintings/${rp.slug}`}
                    className="group block rounded-xl overflow-hidden bg-card hover:shadow-lg transition-all duration-200"
                  >
                    <div className="aspect-square bg-accent overflow-hidden">
                      {thumb ? (
                        <img
                          src={thumb}
                          alt={rp.title}
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
                        {rp.title}
                      </h3>
                      {rp.year && (
                        <p className="text-xs text-muted">{rp.year}</p>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        {/* Related paintings by tag */}
        {relatedByTag.length > 0 && (
          <section className="mb-10">
            <h2 className="text-xl font-semibold text-foreground mb-4">
              Related Paintings
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {relatedByTag.map((rp) => {
                const thumb = rp.images.length > 0 ? rp.images[0] : null;
                return (
                  <Link
                    key={rp.id}
                    href={`/paintings/${rp.slug}`}
                    className="group block rounded-xl overflow-hidden bg-card hover:shadow-lg transition-all duration-200"
                  >
                    <div className="aspect-square bg-accent overflow-hidden">
                      {thumb ? (
                        <img
                          src={thumb}
                          alt={rp.title}
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
                        {rp.title}
                      </h3>
                      <p className="text-xs text-muted truncate">
                        {rp.artist.name}
                      </p>
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
