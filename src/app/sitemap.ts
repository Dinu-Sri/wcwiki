import type { MetadataRoute } from "next";
import { db } from "@/lib/db";

const locales = ["en", "zh", "ja", "ko", "es", "fr", "ru", "tr", "ta", "si"] as const;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://wcwiki.com";

  // Helper to build alternates for i18n
  function buildAlternates(path: string) {
    const languages: Record<string, string> = {};
    for (const locale of locales) {
      languages[locale] =
        locale === "en" ? `${baseUrl}${path}` : `${baseUrl}/${locale}${path}`;
    }
    languages["x-default"] = `${baseUrl}${path}`;
    return { languages };
  }

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
      alternates: buildAlternates("/"),
    },
    {
      url: `${baseUrl}/artists`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
      alternates: buildAlternates("/artists"),
    },
    {
      url: `${baseUrl}/paintings`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
      alternates: buildAlternates("/paintings"),
    },
    {
      url: `${baseUrl}/articles`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
      alternates: buildAlternates("/articles"),
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.4,
    },
  ];

  try {
  // Artist pages
  const artists = await db.artist.findMany({
    select: { slug: true, updatedAt: true },
  });
  const artistPages: MetadataRoute.Sitemap = artists.map((artist) => ({
    url: `${baseUrl}/artists/${artist.slug}`,
    lastModified: artist.updatedAt,
    changeFrequency: "weekly" as const,
    priority: 0.8,
    alternates: buildAlternates(`/artists/${artist.slug}`),
  }));

  // Painting pages
  const paintings = await db.painting.findMany({
    select: { slug: true, updatedAt: true },
  });
  const paintingPages: MetadataRoute.Sitemap = paintings.map((painting) => ({
    url: `${baseUrl}/paintings/${painting.slug}`,
    lastModified: painting.updatedAt,
    changeFrequency: "weekly" as const,
    priority: 0.8,
    alternates: buildAlternates(`/paintings/${painting.slug}`),
  }));

  // Approved article pages
  const articles = await db.article.findMany({
    where: { status: "APPROVED" },
    select: { slug: true, updatedAt: true },
  });
  const articlePages: MetadataRoute.Sitemap = articles.map((article) => ({
    url: `${baseUrl}/articles/${article.slug}`,
    lastModified: article.updatedAt,
    changeFrequency: "weekly" as const,
    priority: 0.7,
    alternates: buildAlternates(`/articles/${article.slug}`),
  }));

  return [...staticPages, ...artistPages, ...paintingPages, ...articlePages];
  } catch {
    // DB not available at build time — return static pages only
    return staticPages;
  }
}
