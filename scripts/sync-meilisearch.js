const { MeiliSearch } = require("meilisearch");
const { PrismaClient } = require("@prisma/client");

const meili = new MeiliSearch({
  host: process.env.MEILISEARCH_HOST || "http://meilisearch:7700",
  apiKey: process.env.MEILISEARCH_API_KEY || "",
});

const prisma = new PrismaClient();

// Wait for Meilisearch to be ready (it may still be starting up)
async function waitForMeilisearch(retries = 10, delay = 2000) {
  for (let i = 0; i < retries; i++) {
    try {
      await meili.health();
      console.log("Meilisearch is ready");
      return;
    } catch {
      console.log(`Waiting for Meilisearch... (${i + 1}/${retries})`);
      await new Promise((r) => setTimeout(r, delay));
    }
  }
  throw new Error("Meilisearch not available after " + retries + " retries");
}

async function sync() {
  await waitForMeilisearch();
  // Sync artists
  const artists = await prisma.artist.findMany();
  if (artists.length > 0) {
    await meili.index("artists").addDocuments(
      artists.map((a) => ({ ...a, id: a.id }))
    );
  } else {
    // Create empty index so searches don't 404
    await meili.createIndex("artists", { primaryKey: "id" });
  }
  console.log(`Indexed ${artists.length} artists`);

  // Sync paintings
  const paintings = await prisma.painting.findMany({
    include: { artist: true },
  });
  if (paintings.length > 0) {
    await meili.index("paintings").addDocuments(
      paintings.map((p) => ({
        ...p,
        artistName: p.artist?.name,
        id: p.id,
      }))
    );
  } else {
    await meili.createIndex("paintings", { primaryKey: "id" });
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
  } else {
    await meili.createIndex("articles", { primaryKey: "id" });
  }
  console.log(`Indexed ${articles.length} articles`);

  console.log("Meilisearch sync complete!");
}

sync()
  .catch((err) => {
    console.error("Meilisearch sync error:", err.message);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
