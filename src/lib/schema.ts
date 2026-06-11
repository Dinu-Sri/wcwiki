// Centralized JSON-LD structured data generation for SEO
// All schema.org markup is generated from here for consistency

interface SiteSettingsForSchema {
  siteName: string;
  siteDescription?: string | null;
  siteUrl: string;
  logoUrl?: string | null;
  foundedYear?: number | null;
  founderName?: string | null;
  socialFacebook?: string | null;
  socialInstagram?: string | null;
  socialX?: string | null;
  socialYoutube?: string | null;
  socialPinterest?: string | null;
  socialLinkedin?: string | null;
}

// ─── Organization Schema (Knowledge Panel) ─────────────────────────────

function getCanonicalBaseUrl() {
  return process.env.NEXT_PUBLIC_BASE_URL || "https://wcwiki.org";
}

function toAbsoluteUrl(url: string | null | undefined, baseUrl: string) {
  if (!url) return undefined;
  return url.startsWith("http") ? url : `${baseUrl}${url.startsWith("/") ? url : `/${url}`}`;
}

export function generateOrganizationSchema(settings: SiteSettingsForSchema) {
  const siteUrl = getCanonicalBaseUrl();
  const sameAs = [
    settings.socialFacebook,
    settings.socialInstagram,
    settings.socialX,
    settings.socialYoutube,
    settings.socialPinterest,
    settings.socialLinkedin,
  ].filter(Boolean);

  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: settings.siteName,
    url: siteUrl,
    ...(settings.logoUrl && {
      logo: {
        "@type": "ImageObject",
        url: toAbsoluteUrl(settings.logoUrl, siteUrl),
      },
    }),
    ...(settings.siteDescription && {
      description: settings.siteDescription,
    }),
    ...(settings.foundedYear && {
      foundingDate: String(settings.foundedYear),
    }),
    ...(settings.founderName && {
      founder: {
        "@type": "Person",
        name: settings.founderName,
      },
    }),
    ...(sameAs.length > 0 && { sameAs }),
  };
}

// ─── WebSite Schema with SearchAction (Sitelinks Search Box) ───────────

export function generateWebSiteSchema(settings: SiteSettingsForSchema) {
  const siteUrl = getCanonicalBaseUrl();
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: settings.siteName,
    url: siteUrl,
    ...(settings.siteDescription && {
      description: settings.siteDescription,
    }),
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${siteUrl}/search?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

// ─── BreadcrumbList Schema ─────────────────────────────────────────────

interface BreadcrumbItem {
  name: string;
  url: string;
}

export function generateBreadcrumbSchema(
  baseUrl: string,
  items: BreadcrumbItem[]
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url.startsWith("http") ? item.url : `${baseUrl}${item.url}`,
    })),
  };
}

// ─── Person Schema (Artist Pages) ──────────────────────────────────────

interface ArtistForSchema {
  name: string;
  slug: string;
  bio?: string | null;
  nationality?: string | null;
  birthYear?: number | null;
  deathYear?: number | null;
  image?: string | null;
  website?: string | null;
  styles: string[];
  socialLinks?: Record<string, string> | null;
}

export function generatePersonSchema(
  artist: ArtistForSchema,
  baseUrl: string
) {
  const socialLinks = artist.socialLinks || {};
  const sameAs = [
    socialLinks.instagram,
    socialLinks.youtube,
    socialLinks.x,
    socialLinks.facebook,
    socialLinks.pinterest,
    socialLinks.behance,
    artist.website,
  ].filter(Boolean);

  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: artist.name,
    url: `${baseUrl}/artists/${artist.slug}`,
    ...(artist.nationality && {
      nationality: {
        "@type": "Country",
        name: artist.nationality,
      },
    }),
    ...(artist.birthYear && { birthDate: String(artist.birthYear) }),
    ...(artist.deathYear && { deathDate: String(artist.deathYear) }),
    ...(artist.bio && { description: artist.bio }),
    ...(artist.image && { image: toAbsoluteUrl(artist.image, baseUrl) }),
    jobTitle: "Watercolor Artist",
    ...(artist.styles.length > 0 && { knowsAbout: artist.styles }),
    ...(sameAs.length > 0 && { sameAs }),
  };
}

// ─── VisualArtwork Schema (Painting Pages) ─────────────────────────────

interface PaintingForSchema {
  title: string;
  slug: string;
  description?: string | null;
  medium?: string | null;
  surface?: string | null;
  width?: number | null;
  height?: number | null;
  year?: number | null;
  images: string[];
  artist: {
    name: string;
    slug: string;
  };
}

export function generateVisualArtworkSchema(
  painting: PaintingForSchema,
  baseUrl: string,
  publisherName: string
) {
  return {
    "@context": "https://schema.org",
    "@type": "VisualArtwork",
    name: painting.title,
    url: `${baseUrl}/paintings/${painting.slug}`,
    creator: {
      "@type": "Person",
      name: painting.artist.name,
      url: `${baseUrl}/artists/${painting.artist.slug}`,
    },
    ...(painting.description && { description: painting.description }),
    ...(painting.medium && { artMedium: painting.medium }),
    ...(painting.surface && { artworkSurface: painting.surface }),
    artform: "Painting",
    ...(painting.year && { dateCreated: String(painting.year) }),
    ...(painting.images.length > 0 && {
      image: toAbsoluteUrl(painting.images[0], baseUrl),
      thumbnailUrl: toAbsoluteUrl(painting.images[0], baseUrl),
    }),
    ...(painting.width &&
      painting.height && {
        width: { "@type": "Distance", name: `${painting.width} cm` },
        height: { "@type": "Distance", name: `${painting.height} cm` },
      }),
    isPartOf: {
      "@type": "WebSite",
      name: publisherName,
      url: baseUrl,
    },
  };
}

// ─── Article Schema (Article Pages) ────────────────────────────────────

interface ArticleForSchema {
  title: string;
  slug: string;
  excerpt?: string | null;
  body: string;
  coverImage?: string | null;
  publishedAt?: Date | null;
  updatedAt: Date;
  author: {
    name?: string | null;
  };
}

export function generateArticleSchema(
  article: ArticleForSchema,
  baseUrl: string,
  publisher: { name: string; logoUrl?: string | null }
) {
  // Estimate word count from body (strip HTML tags)
  const plainText = article.body.replace(/<[^>]*>/g, "");
  const wordCount = plainText
    .split(/\s+/)
    .filter((w) => w.length > 0).length;

  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    url: `${baseUrl}/articles/${article.slug}`,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${baseUrl}/articles/${article.slug}`,
    },
    ...(article.excerpt && { description: article.excerpt }),
    ...(article.publishedAt && {
      datePublished: article.publishedAt.toISOString(),
    }),
    dateModified: article.updatedAt.toISOString(),
    author: {
      "@type": "Person",
      name: article.author.name || "wcWIKI Contributor",
    },
    publisher: {
      "@type": "Organization",
      name: publisher.name,
      ...(publisher.logoUrl && {
        logo: {
          "@type": "ImageObject",
          url: toAbsoluteUrl(publisher.logoUrl, baseUrl),
        },
      }),
    },
    ...(article.coverImage && { image: toAbsoluteUrl(article.coverImage, baseUrl) }),
    wordCount,
    inLanguage: "en",
  };
}

// ─── ItemList Schema (Browse Pages) ────────────────────────────────────

interface ItemListEntry {
  url: string;
  name: string;
  image?: string | null;
}

export function generateItemListSchema(
  items: ItemListEntry[],
  baseUrl: string,
  listName: string
) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: listName,
    numberOfItems: items.length,
    itemListElement: items.slice(0, 100).map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: item.url.startsWith("http") ? item.url : `${baseUrl}${item.url}`,
      name: item.name,
      ...(item.image && { image: toAbsoluteUrl(item.image, baseUrl) }),
    })),
  };
}

// ─── Helper: Get SiteSettings with fallback defaults ───────────────────

// --- Painting Reference Schema ----------------------------------------------

interface PaintingReferenceForSchema {
  id?: string;
  title: string;
  slug: string;
  shortCode?: string | null;
  description?: string | null;
  previewUrl: string;
  thumbnailUrl: string;
  width?: number | null;
  height?: number | null;
  tags: string[];
  attributionName?: string | null;
  attributionUrl?: string | null;
  createdAt: Date;
  updatedAt: Date;
  category?: {
    name: string;
  } | null;
}

export function generatePaintingReferenceImageSchema(
  reference: PaintingReferenceForSchema,
  baseUrl: string
) {
  const pageUrl = `${baseUrl}/painting-references/${reference.slug}`;
  const attributionUrl =
    reference.shortCode || reference.id
      ? `${baseUrl}/r/${reference.shortCode || reference.id?.slice(0, 7)}`
      : pageUrl;
  const creatorName = reference.attributionName || "wcWIKI contributor";

  return {
    "@context": "https://schema.org",
    "@type": "ImageObject",
    name: reference.title,
    url: pageUrl,
    contentUrl: toAbsoluteUrl(reference.previewUrl, baseUrl),
    thumbnailUrl: toAbsoluteUrl(reference.thumbnailUrl, baseUrl),
    license: "https://creativecommons.org/licenses/by/4.0/",
    acquireLicensePage: pageUrl,
    creditText: `Reference by Watercolor Wikipedia via ${attributionUrl} - CC BY 4.0`,
    creator: {
      "@type": "Person",
      name: creatorName,
      ...(reference.attributionUrl && { url: reference.attributionUrl }),
    },
    copyrightNotice: `Copyright ${creatorName}. Licensed under CC BY 4.0.`,
    datePublished: reference.createdAt.toISOString(),
    dateModified: reference.updatedAt.toISOString(),
    ...(reference.description && { description: reference.description }),
    ...(reference.width && { width: reference.width }),
    ...(reference.height && { height: reference.height }),
    ...(reference.tags.length > 0 && { keywords: reference.tags.join(", ") }),
    ...(reference.category && { about: reference.category.name }),
    isPartOf: {
      "@type": "CollectionPage",
      name: "Painting References",
      url: `${baseUrl}/painting-references`,
    },
  };
}

export function generateCollectionPageSchema({
  name,
  description,
  url,
  baseUrl,
  items,
}: {
  name: string;
  description: string;
  url: string;
  baseUrl: string;
  items: ItemListEntry[];
}) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name,
    description,
    url,
    mainEntity: generateItemListSchema(items, baseUrl, name),
  };
}

const defaultSettings: SiteSettingsForSchema = {
  siteName: "wcWIKI",
  siteDescription:
    "Search and discover watercolor artists, paintings, and articles. A community-driven encyclopedia for watercolor art worldwide.",
  siteUrl: getCanonicalBaseUrl(),
  foundedYear: 2025,
};

export async function getSiteSettings(): Promise<SiteSettingsForSchema & Record<string, unknown>> {
  try {
    const { db } = await import("@/lib/db");
    const settings = await db.siteSettings.findUnique({
      where: { id: "default" },
    });
    if (settings) return { ...settings, siteUrl: getCanonicalBaseUrl() };
  } catch {
    // DB not available or table not yet created
  }
  return defaultSettings as SiteSettingsForSchema & Record<string, unknown>;
}
