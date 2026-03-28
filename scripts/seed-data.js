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

  // Seed paintings if none exist
  const paintingCount = await prisma.painting.count();
  if (paintingCount === 0) {
    // Look up artist IDs
    const artistMap = {};
    const allArtists = await prisma.artist.findMany({ select: { id: true, slug: true } });
    for (const a of allArtists) artistMap[a.slug] = a.id;

    const paintings = [
      {
        title: "Water Lilies",
        slug: "water-lilies-monet",
        artistSlug: "claude-monet",
        description: "One of approximately 250 oil and watercolor paintings of Monet's flower garden at Giverny.",
        medium: "Watercolor",
        year: 1906,
        tags: ["impressionism", "flowers", "garden", "series"],
      },
      {
        title: "Impression, Sunrise",
        slug: "impression-sunrise",
        artistSlug: "claude-monet",
        description: "The painting that gave Impressionism its name. A hazy harbor scene at Le Havre.",
        medium: "Oil on canvas",
        year: 1872,
        tags: ["impressionism", "harbor", "sunrise"],
      },
      {
        title: "The Fighting Temeraire",
        slug: "fighting-temeraire",
        artistSlug: "jmw-turner",
        description: "A warship being towed to be broken up, symbolizing the passing of the age of sail.",
        medium: "Oil on canvas",
        year: 1839,
        tags: ["romanticism", "maritime", "ships"],
      },
      {
        title: "Rain, Steam and Speed",
        slug: "rain-steam-speed",
        artistSlug: "jmw-turner",
        description: "A Great Western Railway locomotive crossing the Thames on Maidenhead Railway Bridge in rain.",
        medium: "Oil on canvas",
        year: 1844,
        tags: ["romanticism", "landscape", "train", "weather"],
      },
      {
        title: "The Blue Rigi, Sunrise",
        slug: "blue-rigi-sunrise",
        artistSlug: "jmw-turner",
        description: "A masterful watercolor depicting Lake Lucerne at sunrise with the Rigi mountain in blue haze.",
        medium: "Watercolor",
        year: 1842,
        tags: ["watercolor", "landscape", "mountain", "sunrise"],
      },
      {
        title: "Breezing Up (A Fair Wind)",
        slug: "breezing-up",
        artistSlug: "winslow-homer",
        description: "Boys sailing a catboat in choppy waters, one of Homer's most celebrated works.",
        medium: "Oil on canvas",
        year: 1876,
        tags: ["realism", "marine", "sailing"],
      },
      {
        title: "The Gulf Stream",
        slug: "the-gulf-stream",
        artistSlug: "winslow-homer",
        description: "A lone man on a small dismasted boat surrounded by sharks and an approaching waterspout.",
        medium: "Watercolor & Oil",
        year: 1899,
        tags: ["realism", "marine", "drama"],
      },
      {
        title: "Sloop, Nassau",
        slug: "sloop-nassau",
        artistSlug: "winslow-homer",
        description: "A brilliant watercolor of a sloop in the clear turquoise waters of the Bahamas.",
        medium: "Watercolor",
        year: 1899,
        tags: ["watercolor", "marine", "bahamas"],
      },
      {
        title: "Venetian Canal",
        slug: "venetian-canal-sargent",
        artistSlug: "john-singer-sargent",
        description: "A luminous watercolor capturing the play of light on Venetian architecture and water.",
        medium: "Watercolor",
        year: 1913,
        tags: ["watercolor", "venice", "architecture"],
      },
      {
        title: "Mountain Fire",
        slug: "mountain-fire-sargent",
        artistSlug: "john-singer-sargent",
        description: "A dramatic watercolor landscape showing a mountain scene with brilliant light effects.",
        medium: "Watercolor",
        year: 1903,
        tags: ["watercolor", "landscape", "mountain"],
      },
      {
        title: "Mont Sainte-Victoire",
        slug: "mont-sainte-victoire",
        artistSlug: "paul-cezanne",
        description: "One of many paintings of this mountain, showing Cézanne's approach to form and color.",
        medium: "Watercolor",
        year: 1902,
        tags: ["post-impressionism", "landscape", "mountain"],
      },
      {
        title: "The Large Piece of Turf",
        slug: "large-piece-of-turf",
        artistSlug: "albrecht-durer",
        description: "An extraordinarily detailed watercolor study of a patch of wild plants and grasses.",
        medium: "Watercolor & Gouache",
        year: 1503,
        tags: ["renaissance", "botanical", "nature study"],
      },
      {
        title: "Young Hare",
        slug: "young-hare-durer",
        artistSlug: "albrecht-durer",
        description: "One of the most famous watercolor studies in art history, depicting a hare with astonishing detail.",
        medium: "Watercolor & Gouache",
        year: 1502,
        tags: ["renaissance", "animal study", "masterwork"],
      },
      {
        title: "Carolina Parakeet",
        slug: "carolina-parakeet",
        artistSlug: "john-james-audubon",
        description: "A vibrant watercolor illustration of the now-extinct Carolina parakeet from Birds of America.",
        medium: "Watercolor",
        year: 1833,
        tags: ["ornithological", "birds", "naturalism"],
      },
      {
        title: "Red Canna",
        slug: "red-canna-okeeffe",
        artistSlug: "georgia-okeeffe",
        description: "A bold, close-up watercolor study of a red canna lily, showing O'Keeffe's signature magnified flora.",
        medium: "Watercolor",
        year: 1924,
        tags: ["modernism", "flowers", "close-up"],
      },
      {
        title: "Wildly Dancing Waves",
        slug: "wildly-dancing-waves",
        artistSlug: "emil-nolde",
        description: "An expressive watercolor seascape with dramatic, turbulent waves in vivid blues and greens.",
        medium: "Watercolor",
        year: 1930,
        tags: ["expressionism", "seascape", "waves"],
      },
      {
        title: "The Lighthouse at Two Lights",
        slug: "lighthouse-two-lights",
        artistSlug: "edward-hopper",
        description: "A watercolor of the Cape Elizabeth lighthouse in Maine, showing Hopper's mastery of light and shadow.",
        medium: "Watercolor",
        year: 1929,
        tags: ["realism", "lighthouse", "american scene"],
      },
    ];

    for (const p of paintings) {
      const artistId = artistMap[p.artistSlug];
      if (!artistId) {
        console.log(`Skipping painting "${p.title}" — artist ${p.artistSlug} not found`);
        continue;
      }
      const { artistSlug, ...data } = p;
      await prisma.painting.upsert({
        where: { slug: data.slug },
        update: {},
        create: { ...data, artistId },
      });
    }
    console.log(`Seeded ${paintings.length} paintings`);
  } else {
    console.log(`Paintings already exist (${paintingCount}), skipping`);
  }
}

seed()
  .catch((err) => {
    console.error("Seed error:", err.message);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
