import { Metadata } from "next";
import Link from "next/link";
import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import {
  generateBreadcrumbSchema,
  generateCollectionPageSchema,
  generateItemListSchema,
} from "@/lib/schema";

export const dynamic = "force-dynamic";

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://wcwiki.org";

export const metadata: Metadata = {
  title: "Painting References for Watercolor Artists",
  description:
    "Browse approved painting reference photos for watercolor artists. Find landscapes, flowers, portraits, skies, textures, and more with contributor attribution.",
  alternates: {
    canonical: `${baseUrl}/painting-references`,
  },
  openGraph: {
    title: "Painting References for Watercolor Artists",
    description:
      "Approved painting reference photos for watercolor artists, published with clear contributor attribution.",
    url: `${baseUrl}/painting-references`,
    type: "website",
  },
};

function getParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] || "" : value || "";
}

export default async function PaintingReferencesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const q = getParam(params.q).trim();
  const category = getParam(params.category).trim();
  const sort = getParam(params.sort).trim();

  const where: Prisma.PaintingReferenceWhereInput = { status: "APPROVED" };
  if (category) where.category = { slug: category };
  if (q) {
    where.OR = [
      { title: { contains: q, mode: "insensitive" } },
      { description: { contains: q, mode: "insensitive" } },
      { tags: { has: q.toLowerCase() } },
    ];
  }

  const orderBy:
    | Prisma.PaintingReferenceOrderByWithRelationInput
    | Prisma.PaintingReferenceOrderByWithRelationInput[] =
    sort === "title"
      ? { title: "asc" }
      : sort === "popular"
        ? [{ saveCount: "desc" }, { createdAt: "desc" }]
        : { createdAt: "desc" };

  const [references, categories] = await Promise.all([
    db.paintingReference.findMany({
      where,
      orderBy,
      take: 80,
      include: {
        category: { select: { name: true, slug: true } },
        submittedBy: { select: { name: true, image: true } },
      },
    }),
    db.referenceCategory.findMany({
      where: { references: { some: { status: "APPROVED" } } },
      orderBy: { name: "asc" },
      include: {
        _count: {
          select: { references: { where: { status: "APPROVED" } } },
        },
      },
    }),
  ]);

  const itemEntries = references.map((reference) => ({
    url: `/painting-references/${reference.slug}`,
    name: reference.title,
    image: reference.thumbnailUrl,
  }));
  const itemListLd = generateItemListSchema(
    itemEntries,
    baseUrl,
    "Painting References"
  );
  const collectionLd = generateCollectionPageSchema({
    name: "Painting References",
    description:
      "Approved painting reference photos for watercolor artists.",
    url: `${baseUrl}/painting-references`,
    baseUrl,
    items: itemEntries,
  });
  const breadcrumbLd = generateBreadcrumbSchema(baseUrl, [
    { name: "Home", url: "/" },
    { name: "Painting References", url: "/painting-references" },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />
      <Header />
      <main className="flex-1 max-w-6xl mx-auto w-full px-3 sm:px-4 py-6 sm:py-8">
        <nav className="text-xs text-muted mb-4 sm:mb-6 flex items-center gap-1.5">
          <Link href="/" className="hover:text-primary transition-colors">
            Home
          </Link>
          <span>&gt;</span>
          <span className="text-foreground">Painting References</span>
        </nav>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
              Painting References
            </h1>
            <p className="text-sm sm:text-base text-muted max-w-2xl">
              Approved reference photos for watercolor artists, shared by the community with clear attribution.
            </p>
          </div>
          <Link
            href="/painting-references/upload"
            className="inline-flex w-fit items-center rounded-xl bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90"
          >
            Donate Painting References
          </Link>
        </div>

        <form className="mb-5 grid gap-3 sm:grid-cols-[1fr_auto_auto]" action="/painting-references">
          <input
            type="search"
            name="q"
            defaultValue={q}
            placeholder="Search clouds, flowers, lakes..."
            className="rounded-xl border border-border bg-card px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
          {category && <input type="hidden" name="category" value={category} />}
          <select
            name="sort"
            defaultValue={sort}
            className="rounded-xl border border-border bg-card px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="">Newest</option>
            <option value="popular">Most saved</option>
            <option value="title">Title</option>
          </select>
          <button
            type="submit"
            className="rounded-xl border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-accent"
          >
            Search
          </button>
        </form>

        {categories.length > 0 && (
          <div className="mb-6 flex flex-wrap gap-2">
            <Link
              href={q || sort ? `/painting-references?${new URLSearchParams({ ...(q ? { q } : {}), ...(sort ? { sort } : {}) })}` : "/painting-references"}
              className={`rounded-full px-3 py-1 text-xs font-medium border ${
                category
                  ? "border-border text-muted hover:bg-accent"
                  : "border-primary bg-primary/10 text-primary"
              }`}
            >
              All
            </Link>
            {categories.map((item) => {
              const query = new URLSearchParams({
                category: item.slug,
                ...(q ? { q } : {}),
                ...(sort ? { sort } : {}),
              });
              return (
                <Link
                  key={item.id}
                  href={`/painting-references?${query}`}
                  className={`rounded-full px-3 py-1 text-xs font-medium border ${
                    category === item.slug
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border text-muted hover:bg-accent"
                  }`}
                >
                  {item.name} ({item._count.references})
                </Link>
              );
            })}
          </div>
        )}

        {references.length === 0 ? (
          <div className="rounded-xl border border-border bg-surface px-6 py-12 text-center">
            <h2 className="text-lg font-semibold text-foreground">
              No painting references yet
            </h2>
            <p className="mt-2 text-sm text-muted">
              Approved images will appear here after review.
            </p>
            <Link
              href="/painting-references/upload"
              className="mt-4 inline-flex rounded-xl bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90"
            >
              Submit the First Reference
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {references.map((reference) => (
              <Link
                key={reference.id}
                href={`/painting-references/${reference.slug}`}
                className="group overflow-hidden rounded-xl border border-border bg-card transition-all duration-200 hover:border-primary/30 hover:shadow-lg"
              >
                <div className="aspect-[4/3] bg-accent overflow-hidden">
                  <img
                    src={reference.thumbnailUrl}
                    alt={reference.title}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
                <div className="px-2.5 py-2.5">
                  <h2 className="truncate text-xs font-medium text-foreground">
                    {reference.title}
                  </h2>
                  <p className="mt-0.5 truncate text-[11px] text-muted">
                    {reference.category?.name || "Painting reference"}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
