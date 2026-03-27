import { meili, INDEXES } from "./client";
import { db } from "@/lib/db";

// ─── Configure Index Settings ──────────────────────────────────────────────

export async function configureIndexes() {
  // Artists index
  const artists = meili.index(INDEXES.ARTISTS);
  await artists.updateSettings({
    searchableAttributes: ["name", "bio", "nationality", "styles"],
    filterableAttributes: ["nationality", "styles"],
    sortableAttributes: ["name", "createdAt"],
    rankingRules: [
      "words",
      "typo",
      "proximity",
      "attribute",
      "sort",
      "exactness",
    ],
  });

  // Paintings index
  const paintings = meili.index(INDEXES.PAINTINGS);
  await paintings.updateSettings({
    searchableAttributes: [
      "title",
      "artistName",
      "description",
      "tags",
      "medium",
    ],
    filterableAttributes: ["medium", "year", "tags", "artistName", "surface"],
    sortableAttributes: ["title", "year", "createdAt"],
    rankingRules: [
      "words",
      "typo",
      "proximity",
      "attribute",
      "sort",
      "exactness",
    ],
  });

  // Articles index
  const articles = meili.index(INDEXES.ARTICLES);
  await articles.updateSettings({
    searchableAttributes: ["title", "excerpt", "tags", "authorName"],
    filterableAttributes: ["tags", "language", "authorName"],
    sortableAttributes: ["title", "publishedAt", "createdAt"],
    rankingRules: [
      "words",
      "typo",
      "proximity",
      "attribute",
      "sort",
      "exactness",
    ],
  });
}

// ─── Sync Artists ──────────────────────────────────────────────────────────

export async function syncAllArtists() {
  const artists = await db.artist.findMany();
  const documents = artists.map((artist) => ({
    id: artist.id,
    name: artist.name,
    slug: artist.slug,
    bio: artist.bio || "",
    nationality: artist.nationality || "",
    styles: artist.styles,
    image: artist.image || "",
    createdAt: artist.createdAt.toISOString(),
  }));

  await meili.index(INDEXES.ARTISTS).addDocuments(documents);
}

export async function syncArtist(artistId: string) {
  const artist = await db.artist.findUnique({ where: { id: artistId } });
  if (!artist) return;

  await meili.index(INDEXES.ARTISTS).addDocuments([
    {
      id: artist.id,
      name: artist.name,
      slug: artist.slug,
      bio: artist.bio || "",
      nationality: artist.nationality || "",
      styles: artist.styles,
      image: artist.image || "",
      createdAt: artist.createdAt.toISOString(),
    },
  ]);
}

export async function removeArtist(artistId: string) {
  await meili.index(INDEXES.ARTISTS).deleteDocument(artistId);
}

// ─── Sync Paintings ────────────────────────────────────────────────────────

export async function syncAllPaintings() {
  const paintings = await db.painting.findMany({
    include: { artist: { select: { name: true } } },
  });
  const documents = paintings.map((painting) => ({
    id: painting.id,
    title: painting.title,
    slug: painting.slug,
    artistName: painting.artist.name,
    artistId: painting.artistId,
    description: painting.description || "",
    medium: painting.medium || "",
    surface: painting.surface || "",
    year: painting.year,
    tags: painting.tags,
    image: painting.images[0] || "",
    createdAt: painting.createdAt.toISOString(),
  }));

  await meili.index(INDEXES.PAINTINGS).addDocuments(documents);
}

export async function syncPainting(paintingId: string) {
  const painting = await db.painting.findUnique({
    where: { id: paintingId },
    include: { artist: { select: { name: true } } },
  });
  if (!painting) return;

  await meili.index(INDEXES.PAINTINGS).addDocuments([
    {
      id: painting.id,
      title: painting.title,
      slug: painting.slug,
      artistName: painting.artist.name,
      artistId: painting.artistId,
      description: painting.description || "",
      medium: painting.medium || "",
      surface: painting.surface || "",
      year: painting.year,
      tags: painting.tags,
      image: painting.images[0] || "",
      createdAt: painting.createdAt.toISOString(),
    },
  ]);
}

export async function removePainting(paintingId: string) {
  await meili.index(INDEXES.PAINTINGS).deleteDocument(paintingId);
}

// ─── Sync Articles ─────────────────────────────────────────────────────────

export async function syncAllArticles() {
  const articles = await db.article.findMany({
    where: { status: "APPROVED" },
    include: { author: { select: { name: true } } },
  });
  const documents = articles.map((article) => ({
    id: article.id,
    title: article.title,
    slug: article.slug,
    excerpt: article.excerpt || "",
    authorName: article.author.name || "Anonymous",
    tags: article.tags,
    language: article.language,
    publishedAt: article.publishedAt?.toISOString() || "",
    createdAt: article.createdAt.toISOString(),
  }));

  await meili.index(INDEXES.ARTICLES).addDocuments(documents);
}

export async function syncArticle(articleId: string) {
  const article = await db.article.findUnique({
    where: { id: articleId },
    include: { author: { select: { name: true } } },
  });
  if (!article || article.status !== "APPROVED") return;

  await meili.index(INDEXES.ARTICLES).addDocuments([
    {
      id: article.id,
      title: article.title,
      slug: article.slug,
      excerpt: article.excerpt || "",
      authorName: article.author.name || "Anonymous",
      tags: article.tags,
      language: article.language,
      publishedAt: article.publishedAt?.toISOString() || "",
      createdAt: article.createdAt.toISOString(),
    },
  ]);
}

export async function removeArticle(articleId: string) {
  await meili.index(INDEXES.ARTICLES).deleteDocument(articleId);
}

// ─── Full Reindex ──────────────────────────────────────────────────────────

export async function reindexAll() {
  // Clear all indexes
  await Promise.all([
    meili.index(INDEXES.ARTISTS).deleteAllDocuments(),
    meili.index(INDEXES.PAINTINGS).deleteAllDocuments(),
    meili.index(INDEXES.ARTICLES).deleteAllDocuments(),
  ]);

  // Configure and sync
  await configureIndexes();
  await Promise.all([
    syncAllArtists(),
    syncAllPaintings(),
    syncAllArticles(),
  ]);
}
