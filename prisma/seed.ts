import { PrismaClient } from "@prisma/client";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const prisma = new PrismaClient();

async function main() {
  console.log("🎨 Seeding wcWIKI database...\n");

  // ─── Create Admin User ─────────────────────────────────────────────────
  const admin = await prisma.user.upsert({
    where: { email: "admin@wcwiki.com" },
    update: {},
    create: {
      email: "admin@wcwiki.com",
      name: "wcWIKI Admin",
      role: "SUPER_ADMIN",
    },
  });
  console.log(`✓ Admin user: ${admin.email}`);

  // ─── Create Artists ─────────────────────────────────────────────────────
  const artistsData = [
    {
      name: "John Singer Sargent",
      bio: "An American expatriate artist, considered the leading portrait painter of his generation. Sargent created roughly 900 oil paintings and more than 2,000 watercolors.",
      nationality: "American",
      birthYear: 1856,
      deathYear: 1925,
      styles: ["Impressionism", "Realism", "Watercolor"],
    },
    {
      name: "Winslow Homer",
      bio: "An American landscape painter and printmaker, best known for his marine subjects. He is considered one of the foremost painters in 19th-century America and a preeminent figure in American art.",
      nationality: "American",
      birthYear: 1836,
      deathYear: 1910,
      styles: ["Realism", "Naturalism", "Watercolor"],
    },
    {
      name: "J.M.W. Turner",
      bio: "Joseph Mallord William Turner was an English Romantic painter, printmaker and watercolourist. He is known for his expressive colourisation, imaginative landscapes and turbulent marine paintings.",
      nationality: "British",
      birthYear: 1775,
      deathYear: 1851,
      styles: ["Romanticism", "Landscape", "Watercolor"],
    },
    {
      name: "Albrecht Dürer",
      bio: "A German painter, printmaker, and theorist of the German Renaissance. Dürer is considered one of the greatest creators of watercolor paintings in history.",
      nationality: "German",
      birthYear: 1471,
      deathYear: 1528,
      styles: ["Renaissance", "Watercolor", "Printmaking"],
    },
    {
      name: "Paul Cézanne",
      bio: "A French artist and Post-Impressionist painter whose work laid the foundations of the transition from the 19th-century to early 20th-century art. His watercolors are renowned for their luminosity.",
      nationality: "French",
      birthYear: 1839,
      deathYear: 1906,
      styles: ["Post-Impressionism", "Watercolor"],
    },
  ];

  const artists = [];
  for (const data of artistsData) {
    const artist = await prisma.artist.upsert({
      where: { slug: slugify(data.name) },
      update: {},
      create: {
        ...data,
        slug: slugify(data.name),
      },
    });
    artists.push(artist);
    console.log(`✓ Artist: ${artist.name}`);
  }

  // ─── Create Paintings ───────────────────────────────────────────────────
  const paintingsData = [
    {
      title: "Gondoliers' Siesta",
      artistIndex: 0, // Sargent
      medium: "Watercolor",
      surface: "Paper",
      year: 1904,
      tags: ["landscape", "Venice", "watercolor"],
      description:
        "A luminous watercolor depicting gondoliers resting in Venice, showcasing Sargent's mastery of light and water.",
    },
    {
      title: "The Blue Boat",
      artistIndex: 1, // Homer
      medium: "Watercolor",
      surface: "Paper",
      year: 1892,
      tags: ["marine", "boat", "watercolor"],
      description:
        "One of Homer's most celebrated watercolors, depicting a blue rowing boat with children on Prout's Neck.",
    },
    {
      title: "The Blue Rigi, Sunrise",
      artistIndex: 2, // Turner
      medium: "Watercolor",
      surface: "Paper",
      year: 1842,
      tags: ["landscape", "mountain", "sunrise", "watercolor"],
      description:
        "A watercolor of Lake Lucerne with Mount Rigi at sunrise, exemplifying Turner's mastery of atmospheric effects.",
    },
    {
      title: "Young Hare",
      artistIndex: 3, // Dürer
      medium: "Watercolor & Gouache",
      surface: "Paper",
      year: 1502,
      tags: ["animal", "nature", "watercolor", "renaissance"],
      description:
        "One of the most famous works of natural observation in art history, depicting a hare with remarkable detail.",
    },
    {
      title: "Mont Sainte-Victoire",
      artistIndex: 4, // Cézanne
      medium: "Watercolor & Graphite",
      surface: "Paper",
      year: 1904,
      tags: ["landscape", "mountain", "watercolor", "post-impressionism"],
      description:
        "Part of Cézanne's iconic series of the Provençal mountain, rendered with translucent watercolor washes.",
    },
  ];

  for (const data of paintingsData) {
    const { artistIndex, ...paintingData } = data;
    const painting = await prisma.painting.upsert({
      where: { slug: slugify(data.title) },
      update: {},
      create: {
        ...paintingData,
        slug: slugify(data.title),
        artistId: artists[artistIndex].id,
      },
    });
    console.log(`✓ Painting: ${painting.title}`);
  }

  // ─── Create Tags ────────────────────────────────────────────────────────
  const tagsData = [
    { name: "Watercolor", category: "MEDIUM" as const },
    { name: "Gouache", category: "MEDIUM" as const },
    { name: "Ink Wash", category: "MEDIUM" as const },
    { name: "Landscape", category: "SUBJECT" as const },
    { name: "Portrait", category: "SUBJECT" as const },
    { name: "Still Life", category: "SUBJECT" as const },
    { name: "Marine", category: "SUBJECT" as const },
    { name: "Botanical", category: "SUBJECT" as const },
    { name: "Wet-on-Wet", category: "TECHNIQUE" as const },
    { name: "Dry Brush", category: "TECHNIQUE" as const },
    { name: "Glazing", category: "TECHNIQUE" as const },
    { name: "Impressionism", category: "STYLE" as const },
    { name: "Realism", category: "STYLE" as const },
    { name: "Abstract", category: "STYLE" as const },
  ];

  for (const data of tagsData) {
    await prisma.tag.upsert({
      where: { slug: slugify(data.name) },
      update: {},
      create: {
        ...data,
        slug: slugify(data.name),
      },
    });
  }
  console.log(`✓ Tags: ${tagsData.length} created`);

  // ─── Create Sample Article ──────────────────────────────────────────────
  const article = await prisma.article.upsert({
    where: { slug: "introduction-to-watercolor-painting" },
    update: {},
    create: {
      title: "Introduction to Watercolor Painting",
      slug: "introduction-to-watercolor-painting",
      body: `<h2>What is Watercolor?</h2>
<p>Watercolor painting is a painting method in which the paints are made of pigments suspended in a water-based solution. Watercolor refers to both the medium and the resulting artwork.</p>
<h2>Brief History</h2>
<p>Watercolor painting is extremely old, dating perhaps to the cave paintings of paleolithic Europe, and has been used for manuscript illustration since at least Egyptian times. Major breakthroughs in watercolor came during the English school of the 18th and 19th centuries.</p>
<h2>Basic Techniques</h2>
<p>The most common watercolor techniques include wet-on-wet, wet-on-dry, dry brush, glazing, and lifting. Each technique produces different effects and textures.</p>`,
      authorId: admin.id,
      status: "APPROVED",
      language: "en",
      tags: ["beginner", "techniques", "history"],
      excerpt:
        "A comprehensive introduction to watercolor painting, covering its history, basic techniques, and what makes it unique among painting mediums.",
      publishedAt: new Date(),
    },
  });
  console.log(`✓ Article: ${article.title}`);

  console.log("\n🎨 Seed complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
