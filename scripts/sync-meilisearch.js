const { MeiliSearch } = require("meilisearch");
const { PrismaClient } = require("@prisma/client");

const meili = new MeiliSearch({
  host: process.env.MEILISEARCH_HOST || "http://meilisearch:7700",
  apiKey: process.env.MEILISEARCH_API_KEY || "",
});

const prisma = new PrismaClient();

const delay = (ms) => new Promise((r) => setTimeout(r, ms));

// Wait for Meilisearch to be ready (it may still be starting up)
async function waitForMeilisearch(retries = 10, wait = 2000) {
  for (let i = 0; i < retries; i++) {
    try {
      await meili.health();
      console.log("Meilisearch is ready");
      return;
    } catch {
      console.log(`Waiting for Meilisearch... (${i + 1}/${retries})`);
      await delay(wait);
    }
  }
  throw new Error("Meilisearch not available after " + retries + " retries");
}

async function sync() {
  await waitForMeilisearch();

  // Delete existing indexes to ensure clean state
  try { await meili.deleteIndex("artists"); } catch {}
  try { await meili.deleteIndex("paintings"); } catch {}
  try { await meili.deleteIndex("articles"); } catch {}
  await delay(2000);

  // Create indexes
  await meili.createIndex("artists", { primaryKey: "id" });
  await meili.createIndex("paintings", { primaryKey: "id" });
  await meili.createIndex("articles", { primaryKey: "id" });
  await delay(2000);

  // Set searchable attributes
  await meili.index("artists").updateSearchableAttributes([
    "name", "nationality", "bio", "styles"
  ]);
  await meili.index("paintings").updateSearchableAttributes([
    "title", "artistName", "medium", "description", "tags"
  ]);
  await meili.index("articles").updateSearchableAttributes([
    "title", "excerpt", "tags", "authorName"
  ]);
  await delay(2000);

  // Sync artists
  const artists = await prisma.artist.findMany();
  if (artists.length > 0) {
    await meili.index("artists").addDocuments(
      artists.map((a) => ({
        id: a.id,
        name: a.name,
        slug: a.slug,
        bio: a.bio,
        nationality: a.nationality,
        birthYear: a.birthYear,
        deathYear: a.deathYear,
        styles: a.styles,
        image: a.image,
      }))
    );
  }
  console.log(`Indexed ${artists.length} artists`);

  // Sync paintings
  const paintings = await prisma.painting.findMany({
    include: { artist: true },
  });
  if (paintings.length > 0) {
    await meili.index("paintings").addDocuments(
      paintings.map((p) => ({
        id: p.id,
        title: p.title,
        slug: p.slug,
        description: p.description,
        medium: p.medium,
        year: p.year,
        tags: p.tags,
        images: p.images,
        artistName: p.artist?.name,
      }))
    );
  }
  console.log(`Indexed ${paintings.length} paintings`);

  // Sync articles
  const articles = await prisma.article.findMany({
    where: { status: "APPROVED" },
    include: { author: true },
  });
  if (articles.length > 0) {
    await meili.index("articles").addDocuments(
      articles.map((a) => ({
        id: a.id,
        title: a.title,
        slug: a.slug,
        excerpt: a.excerpt,
        tags: a.tags,
        authorName: a.author?.name,
        publishedAt: a.publishedAt,
      }))
    );
  }
  console.log(`Indexed ${articles.length} articles`);

  // Wait for indexing to complete
  await delay(3000);
  console.log("Meilisearch sync complete!");
}

sync()
  .catch((err) => {
    console.error("Meilisearch sync error:", err.message);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
