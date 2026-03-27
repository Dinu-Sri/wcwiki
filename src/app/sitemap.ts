import type { MetadataRoute } from "next";
import { db } from "@/lib/db";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://wcwiki.com";

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
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
  }));

  return [...staticPages, ...artistPages, ...paintingPages, ...articlePages];
  } catch {
    // DB not available at build time — return static pages only
    return staticPages;
  }
}
