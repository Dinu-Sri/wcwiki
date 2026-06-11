import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ReferenceAttributionCopy } from "@/components/references/ReferenceAttributionCopy";
import { ReferenceImageLightbox } from "@/components/references/ReferenceImageLightbox";
import { ReferenceSaveButton } from "@/components/references/ReferenceSaveButton";
import {
  generateBreadcrumbSchema,
  generatePaintingReferenceImageSchema,
} from "@/lib/schema";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ locale: string; slug: string }>;
}

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://wcwiki.org";

function absoluteUrl(url: string) {
  return url.startsWith("http") ? url : `${baseUrl}${url}`;
}

async function getReference(slug: string) {
  return db.paintingReference.findFirst({
    where: { slug, status: "APPROVED" },
    include: {
      category: { select: { id: true, name: true, slug: true } },
      submittedBy: { select: { id: true, name: true, image: true } },
    },
  });
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const reference = await getReference(slug);
  if (!reference) return { title: "Painting Reference Not Found" };

  const description =
    reference.description?.slice(0, 160) ||
    `${reference.title} - an approved painting reference photo for watercolor artists.`;
  const image = absoluteUrl(reference.previewUrl);

  return {
    title: `${reference.title} Painting Reference`,
    description,
    alternates: {
      canonical: `${baseUrl}/painting-references/${reference.slug}`,
    },
    openGraph: {
      type: "article",
      title: `${reference.title} Painting Reference`,
      description,
      url: `${baseUrl}/painting-references/${reference.slug}`,
      images: [{ url: image, alt: reference.title }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${reference.title} Painting Reference`,
      description,
      images: [image],
    },
  };
}

export default async function PaintingReferencePage({ params }: Props) {
  const { slug } = await params;
  const session = await auth();
  const reference = await getReference(slug);

  if (!reference) notFound();

  const saved = session?.user?.id
    ? await db.referenceSave.findUnique({
        where: {
          userId_referenceId: {
            userId: session.user.id,
            referenceId: reference.id,
          },
        },
      })
    : null;

  const relatedConditions = [
    ...(reference.categoryId ? [{ categoryId: reference.categoryId }] : []),
    ...(reference.tags.length > 0 ? [{ tags: { hasSome: reference.tags } }] : []),
  ];

  const related = await db.paintingReference.findMany({
    where: {
      id: { not: reference.id },
      status: "APPROVED",
      ...(relatedConditions.length > 0 ? { OR: relatedConditions } : {}),
    },
    include: { category: { select: { name: true, slug: true } } },
    orderBy: { createdAt: "desc" },
    take: 6,
  });

  const shortCode = reference.shortCode || reference.id.slice(0, 7);
  const shortUrl = `${baseUrl}/r/${shortCode}`;
  const downloadUrl = reference.fullImageUrl || reference.previewUrl;
  const attributionText = `Reference by Watercolor Wikipedia via ${shortUrl} - CC BY 4.0`;

  const imageLd = generatePaintingReferenceImageSchema(reference, baseUrl);
  const breadcrumbLd = generateBreadcrumbSchema(baseUrl, [
    { name: "Home", url: "/" },
    { name: "Painting References", url: "/painting-references" },
    { name: reference.title, url: `/painting-references/${reference.slug}` },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(imageLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />
      <Header />
      <main className="flex-1 max-w-6xl mx-auto w-full px-3 sm:px-4 py-6 sm:py-8">
        <nav className="text-xs text-muted mb-4 sm:mb-6 flex items-center gap-1.5 min-w-0">
          <Link href="/" className="shrink-0 hover:text-primary transition-colors">
            Home
          </Link>
          <span className="shrink-0">&gt;</span>
          <Link
            href="/painting-references"
            className="shrink-0 hover:text-primary transition-colors"
          >
            Painting References
          </Link>
          <span className="shrink-0">&gt;</span>
          <span className="truncate text-foreground">{reference.title}</span>
        </nav>

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div>
            <ReferenceImageLightbox src={reference.previewUrl} alt={reference.title} />

            <section className="mt-6">
              <h1 className="text-2xl sm:text-4xl font-bold text-foreground mb-3">
                {reference.title}
              </h1>
              {reference.description && (
                <p className="text-sm sm:text-base text-muted leading-relaxed whitespace-pre-line">
                  {reference.description}
                </p>
              )}
            </section>

            {reference.tags.length > 0 && (
              <div className="mt-5 flex flex-wrap gap-2">
                {reference.tags.map((tag) => (
                  <Link
                    key={tag}
                    href={`/painting-references?q=${encodeURIComponent(tag)}`}
                    className="rounded-full bg-accent px-3 py-1 text-xs font-medium text-muted hover:text-primary"
                  >
                    {tag}
                  </Link>
                ))}
              </div>
            )}
          </div>

          <aside className="space-y-4">
            <div className="rounded-xl border border-border bg-surface p-4">
              <div className="mb-4 flex flex-col gap-3">
                <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                  CC BY 4.0
                </span>
                <ReferenceSaveButton
                  referenceId={reference.id}
                  initialSaved={Boolean(saved)}
                  initialCount={reference.saveCount}
                  signedIn={Boolean(session?.user?.id)}
                />
                <a
                  href={downloadUrl}
                  download
                  className="rounded-xl border border-border bg-card px-4 py-2 text-center text-sm font-medium text-foreground transition-colors hover:bg-accent"
                >
                  Download Painting Reference
                </a>
              </div>
              <dl className="space-y-3 text-sm">
                <div>
                  <dt className="text-xs uppercase tracking-wider text-muted">
                    Contributor
                  </dt>
                  <dd className="mt-1 text-foreground">
                    {reference.attributionUrl ? (
                      <a
                        href={reference.attributionUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        {reference.attributionName || reference.submittedBy.name || "wcWIKI contributor"}
                      </a>
                    ) : (
                      reference.attributionName || reference.submittedBy.name || "wcWIKI contributor"
                    )}
                  </dd>
                </div>
                {reference.category && (
                  <div>
                    <dt className="text-xs uppercase tracking-wider text-muted">
                      Category
                    </dt>
                    <dd className="mt-1">
                      <Link
                        href={`/painting-references?category=${reference.category.slug}`}
                        className="text-primary hover:underline"
                      >
                        {reference.category.name}
                      </Link>
                    </dd>
                  </div>
                )}
                {(reference.country || reference.city || reference.takenAt) && (
                  <div>
                    <dt className="text-xs uppercase tracking-wider text-muted">
                      Location and date
                    </dt>
                    <dd className="mt-1 text-foreground">
                      {[reference.city, reference.country].filter(Boolean).join(", ") || "Location not listed"}
                      {reference.takenAt
                        ? ` - ${reference.takenAt.toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}`
                        : ""}
                    </dd>
                  </div>
                )}
                <div>
                  <dt className="text-xs uppercase tracking-wider text-muted">
                    Image
                  </dt>
                  <dd className="mt-1 text-foreground">
                    {reference.width && reference.height
                      ? `${reference.width} x ${reference.height}px`
                      : "Optimized preview"}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-wider text-muted">
                    License
                  </dt>
                  <dd className="mt-1">
                    <a
                      href="https://creativecommons.org/licenses/by/4.0/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      Creative Commons Attribution 4.0
                    </a>
                  </dd>
                </div>
              </dl>
            </div>

            <ReferenceAttributionCopy text={attributionText} />

            <div className="rounded-xl border border-border bg-warm-light p-4 text-sm leading-relaxed text-muted">
              <p>
                Use this reference under CC BY 4.0. Give attribution and link back to wcWIKI when you share your finished work.
              </p>
              <p className="mt-3 font-medium text-foreground">
                Any painting uploaded from this reference belongs to its respective artist. Unauthorized reuse of artist-uploaded work is prohibited.
              </p>
            </div>
          </aside>
        </div>

        {related.length > 0 && (
          <section className="mt-12">
            <h2 className="text-xl font-semibold text-foreground mb-4">
              Related Painting References
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
              {related.map((item) => (
                <Link
                  key={item.id}
                  href={`/painting-references/${item.slug}`}
                  className="group overflow-hidden rounded-xl border border-border bg-card hover:border-primary/30 hover:shadow-lg"
                >
                  <div className="aspect-[4/3] overflow-hidden bg-accent">
                    <img
                      src={item.thumbnailUrl}
                      alt={item.title}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                  <div className="px-2 py-2">
                    <h3 className="truncate text-xs font-medium text-foreground">
                      {item.title}
                    </h3>
                    <p className="truncate text-[11px] text-muted">
                      {item.category?.name || "Reference"}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>
      <Footer />
    </>
  );
}
