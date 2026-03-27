const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function seed() {
  // Ensure a system user exists for articles
  let user = await prisma.user.findFirst();
  if (!user) {
    user = await prisma.user.create({
      data: { name: "wcWIKI Team", email: "team@wcwiki.com", role: "ADMIN" },
    });
    console.log("Created system user");
  }

  // Seed artists if none exist
  const artistCount = await prisma.artist.count();
  if (artistCount === 0) {
    const artists = [
      {
        name: "Claude Monet",
        slug: "claude-monet",
        bio: "Oscar-Claude Monet was a French painter and founder of Impressionism.",
        nationality: "French",
        birthYear: 1840,
        deathYear: 1926,
        styles: ["Impressionism", "Plein air"],
      },
      {
        name: "J.M.W. Turner",
        slug: "jmw-turner",
        bio: "Joseph Mallord William Turner was an English Romantic painter, watercolourist and printmaker.",
        nationality: "British",
        birthYear: 1775,
        deathYear: 1851,
        styles: ["Romanticism", "Landscape"],
      },
      {
        name: "Winslow Homer",
        slug: "winslow-homer",
        bio: "Winslow Homer was an American landscape painter and printmaker, best known for his marine subjects.",
        nationality: "American",
        birthYear: 1836,
        deathYear: 1910,
        styles: ["Realism", "Marine art"],
      },
      {
        name: "John Singer Sargent",
        slug: "john-singer-sargent",
        bio: "John Singer Sargent was an American expatriate artist, considered the leading portrait painter of his generation.",
        nationality: "American",
        birthYear: 1856,
        deathYear: 1925,
        styles: ["Impressionism", "Realism", "Portrait"],
      },
      {
        name: "Paul Cézanne",
        slug: "paul-cezanne",
        bio: "Paul Cézanne was a French artist and Post-Impressionist painter whose work laid the foundations of modern art.",
        nationality: "French",
        birthYear: 1839,
        deathYear: 1906,
        styles: ["Post-Impressionism", "Still life"],
      },
      {
        name: "Albrecht Dürer",
        slug: "albrecht-durer",
        bio: "Albrecht Dürer was a German painter, printmaker, and theorist of the German Renaissance, known as a pioneer of watercolor.",
        nationality: "German",
        birthYear: 1471,
        deathYear: 1528,
        styles: ["Renaissance", "Botanical"],
      },
      {
        name: "John James Audubon",
        slug: "john-james-audubon",
        bio: "John James Audubon was an American ornithologist, naturalist, and painter known for his studies and illustrations of birds.",
        nationality: "American",
        birthYear: 1785,
        deathYear: 1851,
        styles: ["Naturalism", "Ornithological"],
      },
      {
        name: "Georgia O'Keeffe",
        slug: "georgia-okeeffe",
        bio: "Georgia O'Keeffe was an American artist best known for her paintings of enlarged flowers and New Mexico landscapes.",
        nationality: "American",
        birthYear: 1887,
        deathYear: 1986,
        styles: ["Modernism", "Precisionism"],
      },
      {
        name: "Emil Nolde",
        slug: "emil-nolde",
        bio: "Emil Nolde was a German-Danish painter and printmaker. He was one of the first Expressionists and a master of watercolor.",
        nationality: "German-Danish",
        birthYear: 1867,
        deathYear: 1956,
        styles: ["Expressionism"],
      },
      {
        name: "Edward Hopper",
        slug: "edward-hopper",
        bio: "Edward Hopper was a prominent American realist painter and printmaker, known for his oil and watercolor paintings.",
        nationality: "American",
        birthYear: 1882,
        deathYear: 1967,
        styles: ["Realism", "American Scene"],
      },
    ];

    for (const a of artists) {
      await prisma.artist.upsert({
        where: { slug: a.slug },
        update: {},
        create: a,
      });
    }
    console.log(`Seeded ${artists.length} artists`);
  } else {
    console.log(`Artists already exist (${artistCount}), skipping`);
  }

  // Seed articles if none exist
  const articleCount = await prisma.article.count();
  if (articleCount === 0) {
    const articles = [
      {
        title: "Wet-on-Wet Technique: A Complete Guide",
        slug: "wet-on-wet-technique-guide",
        body: "<p>The wet-on-wet technique is one of the most fundamental watercolor methods. By applying wet paint to a wet surface, you create beautiful, soft edges and seamless color transitions that are the hallmark of watercolor painting.</p>",
        excerpt:
          "Learn to master the wet-on-wet technique for beautiful watercolor washes and soft edges.",
        tags: ["technique", "beginner", "washes"],
        status: "APPROVED",
        publishedAt: new Date(),
      },
      {
        title: "Understanding Watercolor Pigments and Color Mixing",
        slug: "watercolor-pigments-color-mixing",
        body: "<p>Understanding pigment properties is essential for every watercolor artist. Each pigment has unique characteristics including transparency, granulation, and staining properties that affect how it behaves on paper.</p>",
        excerpt:
          "A deep dive into watercolor pigment properties, transparency, and color mixing theory.",
        tags: ["pigments", "color theory", "materials"],
        status: "APPROVED",
        publishedAt: new Date(),
      },
      {
        title: "Best Watercolor Papers for Beginners and Professionals",
        slug: "best-watercolor-papers",
        body: "<p>The choice of paper dramatically affects your watercolor painting results. From hot press to cold press to rough, each texture offers different advantages for various techniques.</p>",
        excerpt:
          "Compare hot press, cold press, and rough watercolor papers to find your perfect match.",
        tags: ["materials", "paper", "review"],
        status: "APPROVED",
        publishedAt: new Date(),
      },
      {
        title: "Plein Air Watercolor Painting: Tips and Equipment",
        slug: "plein-air-watercolor-tips",
        body: "<p>Painting outdoors with watercolors offers unique challenges and rewards. The changing light, wind, and weather become part of your creative process, pushing you to work quickly and decisively.</p>",
        excerpt:
          "Essential tips, gear recommendations, and techniques for outdoor watercolor painting.",
        tags: ["plein air", "tips", "equipment"],
        status: "APPROVED",
        publishedAt: new Date(),
      },
      {
        title: "The History of Watercolor Painting",
        slug: "history-of-watercolor",
        body: "<p>Watercolor has a rich history spanning centuries across many cultures. From ancient Egyptian papyrus paintings to the great English watercolorists, the medium has evolved into one of the most beloved art forms.</p>",
        excerpt:
          "From ancient manuscripts to modern masters, explore the fascinating history of watercolor art.",
        tags: ["history", "art history"],
        status: "APPROVED",
        publishedAt: new Date(),
      },
    ];

    for (const a of articles) {
      await prisma.article.upsert({
        where: { slug: a.slug },
        update: {},
        create: { ...a, authorId: user.id },
      });
    }
    console.log(`Seeded ${articles.length} articles`);
  } else {
    console.log(`Articles already exist (${articleCount}), skipping`);
  }
}

seed()
  .catch((err) => {
    console.error("Seed error:", err.message);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
