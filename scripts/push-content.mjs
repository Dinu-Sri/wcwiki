const BASE = "http://109.199.125.98:3001/api/v1";
const KEY = "wk_0a4e2905b0baf320278acd36a8b9f35e2f0493aa";
const headers = { Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" };

async function post(endpoint, data) {
  const r = await fetch(`${BASE}/${endpoint}`, { method: "POST", headers, body: JSON.stringify(data) });
  const text = await r.text();
  if (!r.ok) { console.log(`  ERROR ${r.status}: ${text.substring(0, 200)}`); return null; }
  try { return JSON.parse(text); } catch { return { ok: true }; }
}

async function patch(endpoint, slug, data) {
  const r = await fetch(`${BASE}/${endpoint}/${slug}`, { method: "PATCH", headers, body: JSON.stringify(data) });
  const text = await r.text();
  if (!r.ok) { console.log(`  ERROR ${r.status}: ${text}`); return null; }
  try { return JSON.parse(text); } catch { return { ok: true }; }
}

async function main() {
  console.log("\n=== UPDATING EXISTING ARTISTS ===");

  await patch("artists", "claude-monet", {
    bio: "Oscar-Claude Monet (1840-1926) was a French painter and founder of Impressionism. While primarily known for oil paintings, Monet was also an accomplished watercolorist, using the medium for preparatory studies and en plein air sketches. His garden at Giverny became a living canvas, inspiring his iconic Water Lilies series comprising approximately 250 paintings. Monet's revolutionary approach to capturing fleeting effects of light and atmosphere fundamentally changed the course of modern art, influencing generations of painters worldwide.",
    website: "https://en.wikipedia.org/wiki/Claude_Monet",
    socialLinks: { wikipedia: "https://en.wikipedia.org/wiki/Claude_Monet" },
    references: [{ title: "Musee d'Orsay Collection", url: "https://www.musee-orsay.fr" }, { title: "Metropolitan Museum of Art", url: "https://www.metmuseum.org" }]
  });
  console.log("  Updated: Claude Monet");

  await patch("artists", "jmw-turner", {
    bio: "Joseph Mallord William Turner (1775-1851) was an English Romantic painter, printmaker, and watercolourist. Known as 'the painter of light', Turner is regarded as having elevated watercolor painting to rival oil painting in status and prestige. His innovative techniques included scratching, blotting, and using wet washes to create atmospheric effects that were decades ahead of their time. Turner bequeathed over 550 oil paintings and 2,000 watercolors to the British nation, forming the magnificent Turner Bequest at Tate Britain. His influence on the Impressionists and modern art cannot be overstated.",
    website: "https://en.wikipedia.org/wiki/J._M._W._Turner",
    socialLinks: { wikipedia: "https://en.wikipedia.org/wiki/J._M._W._Turner" },
    references: [{ title: "Tate Britain - Turner Collection", url: "https://www.tate.org.uk" }, { title: "National Gallery London", url: "https://www.nationalgallery.org.uk" }]
  });
  console.log("  Updated: J.M.W. Turner");

  await patch("artists", "winslow-homer", {
    bio: "Winslow Homer (1836-1910) was an American landscape painter and printmaker, best known for his marine subjects and luminous watercolors. Largely self-taught, Homer began his career as a commercial illustrator before turning to watercolor painting during trips to Gloucester, Massachusetts, England, and later the Bahamas and Bermuda. His transparent watercolors of Caribbean seas and the rugged Maine coastline are considered among the finest ever produced by an American artist. Homer's ability to capture the raw power and sublime beauty of the ocean through confident, spontaneous brushwork remains unmatched in the medium.",
    website: "https://en.wikipedia.org/wiki/Winslow_Homer",
    socialLinks: { wikipedia: "https://en.wikipedia.org/wiki/Winslow_Homer" },
    references: [{ title: "Metropolitan Museum of Art", url: "https://www.metmuseum.org" }, { title: "National Gallery of Art", url: "https://www.nga.gov" }]
  });
  console.log("  Updated: Winslow Homer");

  // Update existing paintings with dimensions
  const paintingUpdates = [
    ["water-lilies-monet", { surface: "Paper", width: 65.0, height: 50.0 }],
    ["impression-sunrise", { surface: "Canvas", width: 48.0, height: 63.0 }],
    ["fighting-temeraire", { surface: "Canvas", width: 91.0, height: 122.0 }],
    ["rain-steam-speed", { surface: "Canvas", width: 91.0, height: 122.0 }],
    ["blue-rigi-sunrise", { surface: "Paper", width: 29.7, height: 45.0 }],
    ["breezing-up", { surface: "Canvas", width: 61.5, height: 97.0 }],
    ["the-gulf-stream", { surface: "Canvas", width: 71.4, height: 124.8 }],
    ["sloop-nassau", { surface: "Paper", width: 38.4, height: 54.0 }],
  ];
  for (const [slug, data] of paintingUpdates) {
    await patch("paintings", slug, data);
  }
  console.log("  Updated existing paintings with dimensions");

  // ============================================================
  // NEW ARTISTS
  // ============================================================
  console.log("\n=== CREATING NEW ARTISTS ===");

  const newArtists = [
    {
      name: "John Singer Sargent",
      bio: "John Singer Sargent (1856-1925) was an American expatriate artist, considered the leading portrait painter of his generation for his evocative, technically brilliant oil portraits. However, Sargent himself regarded his watercolors as his finest work. He created roughly 900 oil paintings and more than 2,000 watercolors, many painted during travels through Italy, the Alps, and the Middle East. His watercolor technique was bold and direct -- he worked quickly, using large brushes loaded with pigment, letting colors merge wet-into-wet, and leaving white paper for highlights. The Brooklyn Museum and Museum of Fine Arts in Boston hold the largest collections of his watercolors.",
      nationality: "American", birthYear: 1856, deathYear: 1925,
      styles: ["Impressionism", "Realism", "Watercolor", "Portrait"],
      website: "https://en.wikipedia.org/wiki/John_Singer_Sargent",
      socialLinks: { wikipedia: "https://en.wikipedia.org/wiki/John_Singer_Sargent" },
      references: [{ title: "Brooklyn Museum", url: "https://www.brooklynmuseum.org" }, { title: "MFA Boston", url: "https://www.mfa.org" }]
    },
    {
      name: "Albrecht Durer",
      bio: "Albrecht Durer (1471-1528) was a German painter, printmaker, and theorist of the Northern Renaissance. Durer is considered one of the greatest watercolorists in history, pioneering the medium centuries before it gained widespread artistic acceptance. His nature studies, including the legendary 'Young Hare' and 'Great Piece of Turf,' demonstrate astonishing observational skill and technical mastery. Durer's topographical watercolors painted during his journeys across the Alps are among the first pure landscape paintings in Western art.",
      nationality: "German", birthYear: 1471, deathYear: 1528,
      styles: ["Renaissance", "Watercolor", "Printmaking", "Botanical"],
      website: "https://en.wikipedia.org/wiki/Albrecht_D%C3%BCrer",
      socialLinks: { wikipedia: "https://en.wikipedia.org/wiki/Albrecht_D%C3%BCrer" },
      references: [{ title: "Albertina Museum Vienna", url: "https://www.albertina.at" }]
    },
    {
      name: "Paul Cezanne",
      bio: "Paul Cezanne (1839-1906) was a French Post-Impressionist painter whose watercolors represent some of the most innovative work in the medium's history. Unlike traditional watercolorists who built up layers of color, Cezanne used isolated patches of transparent wash alongside areas of bare white paper, creating a luminous mosaic effect that influenced Cubism and modern abstraction. His watercolor studies of Mont Sainte-Victoire, still lifes, and bathers demonstrate a revolutionary approach where the unfinished quality itself became the aesthetic.",
      nationality: "French", birthYear: 1839, deathYear: 1906,
      styles: ["Post-Impressionism", "Watercolor", "Modernism"],
      website: "https://en.wikipedia.org/wiki/Paul_C%C3%A9zanne",
      socialLinks: { wikipedia: "https://en.wikipedia.org/wiki/Paul_C%C3%A9zanne" },
      references: [{ title: "Philadelphia Museum of Art", url: "https://www.philamuseum.org" }]
    },
    {
      name: "Georgia O'Keeffe",
      bio: "Georgia Totto O'Keeffe (1887-1986) was an American modernist artist, known as the 'Mother of American Modernism.' While famous for her large-scale flower paintings and New Mexico landscapes in oil, O'Keeffe was also a gifted watercolorist, particularly in her early career. Her abstract watercolors from 1916-1918, created under the influence of Arthur Wesley Dow's compositional theories, are considered groundbreaking works that helped establish American modernism.",
      nationality: "American", birthYear: 1887, deathYear: 1986,
      styles: ["Modernism", "Watercolor", "Abstract", "Botanical"],
      website: "https://en.wikipedia.org/wiki/Georgia_O%27Keeffe",
      socialLinks: { wikipedia: "https://en.wikipedia.org/wiki/Georgia_O%27Keeffe" },
      references: [{ title: "Georgia O'Keeffe Museum", url: "https://www.okeeffemuseum.org" }]
    },
    {
      name: "Paul Klee",
      bio: "Paul Klee (1879-1940) was a Swiss-born German artist whose highly individual style was influenced by Expressionism, Cubism, and Surrealism. Klee was one of the most prolific watercolorists of the 20th century. His 1914 trip to Tunisia proved transformative -- upon encountering the intense North African light, he famously declared 'Color and I are one. I am a painter.' Klee's watercolors combine geometric abstraction with whimsical, childlike imagery, exploring the boundaries between figuration and pure color.",
      nationality: "Swiss-German", birthYear: 1879, deathYear: 1940,
      styles: ["Expressionism", "Abstraction", "Watercolor", "Surrealism"],
      website: "https://en.wikipedia.org/wiki/Paul_Klee",
      socialLinks: { wikipedia: "https://en.wikipedia.org/wiki/Paul_Klee" },
      references: [{ title: "Zentrum Paul Klee", url: "https://www.zpk.org" }]
    },
    {
      name: "Emil Nolde",
      bio: "Emil Nolde (1867-1956) was a German-Danish painter and printmaker, one of the first Expressionists and a pioneer in the use of watercolor for emotional expression. Nolde's watercolors are characterized by bold, saturated colors applied in sweeping washes, often depicting flowers, seascapes, and dramatic skies. He developed a unique technique of painting on damp Japanese paper, allowing colors to bleed and merge in unpredictable ways. During WWII, when banned from painting, he secretly created hundreds of small watercolors he called his 'Unpainted Pictures.'",
      nationality: "German-Danish", birthYear: 1867, deathYear: 1956,
      styles: ["Expressionism", "Watercolor", "Landscape", "Botanical"],
      website: "https://en.wikipedia.org/wiki/Emil_Nolde",
      socialLinks: { wikipedia: "https://en.wikipedia.org/wiki/Emil_Nolde" },
      references: [{ title: "Nolde Stiftung Seebull", url: "https://www.nolde-stiftung.de" }]
    },
    {
      name: "John James Audubon",
      bio: "John James Audubon (1785-1851) was a French-American ornithologist, naturalist, and painter noted for his extensive studies documenting American birds. His masterwork, 'The Birds of America' (1827-1838), contains 435 life-size hand-colored prints made from his watercolor paintings -- one of the finest ornithological works ever completed. Audubon pioneered the practice of painting birds in dynamic, life-size poses within their natural habitats.",
      nationality: "French-American", birthYear: 1785, deathYear: 1851,
      styles: ["Naturalism", "Watercolor", "Scientific Illustration", "Ornithological Art"],
      website: "https://en.wikipedia.org/wiki/John_James_Audubon",
      socialLinks: { wikipedia: "https://en.wikipedia.org/wiki/John_James_Audubon" },
      references: [{ title: "Audubon Society", url: "https://www.audubon.org" }]
    },
    {
      name: "Beatrix Potter",
      bio: "Helen Beatrix Potter (1866-1943) was an English writer, illustrator, natural scientist, and conservationist best known for her children's books featuring animals such as Peter Rabbit. Potter was an exceptionally skilled watercolorist whose detailed botanical and fungal studies are held in the collections of the Victoria and Albert Museum. Her picture book watercolors combine scientific accuracy with gentle narrative charm.",
      nationality: "British", birthYear: 1866, deathYear: 1943,
      styles: ["Illustration", "Watercolor", "Botanical", "Children's Art"],
      website: "https://en.wikipedia.org/wiki/Beatrix_Potter",
      socialLinks: { wikipedia: "https://en.wikipedia.org/wiki/Beatrix_Potter" },
      references: [{ title: "Victoria and Albert Museum", url: "https://www.vam.ac.uk" }]
    },
    {
      name: "Edward Hopper",
      bio: "Edward Hopper (1882-1967) was an American realist painter known for his iconic depictions of modern American life. While his oil paintings like 'Nighthawks' are more famous, Hopper was a masterful watercolorist who used the medium throughout his career. His watercolors of New England architecture, lighthouses, and coastal scenes are luminous, precise studies of light, shadow, and solitude. His watercolors, many held by the Whitney Museum, reveal a more spontaneous and intimate side of the artist.",
      nationality: "American", birthYear: 1882, deathYear: 1967,
      styles: ["Realism", "Watercolor", "American Scene"],
      website: "https://en.wikipedia.org/wiki/Edward_Hopper",
      socialLinks: { wikipedia: "https://en.wikipedia.org/wiki/Edward_Hopper" },
      references: [{ title: "Whitney Museum", url: "https://whitney.org" }]
    },
    {
      name: "John Sell Cotman",
      bio: "John Sell Cotman (1782-1842) was an English marine and landscape painter. Along with John Crome, he was the leading artist of the Norwich School. Cotman's watercolors are celebrated for their bold simplification of natural forms into flat, interlocking shapes of subtle color -- an approach remarkably modern for its time. His masterwork 'Greta Bridge' (c.1805) is considered one of the finest watercolors ever produced.",
      nationality: "British", birthYear: 1782, deathYear: 1842,
      styles: ["Romanticism", "Watercolor", "Landscape", "Norwich School"],
      website: "https://en.wikipedia.org/wiki/John_Sell_Cotman",
      socialLinks: { wikipedia: "https://en.wikipedia.org/wiki/John_Sell_Cotman" },
      references: [{ title: "Norwich Castle Museum", url: "https://www.museums.norfolk.gov.uk" }]
    },
    {
      name: "Thomas Girtin",
      bio: "Thomas Girtin (1775-1802) was an English painter and etcher who, despite dying at just 27, revolutionized watercolor art. Along with J.M.W. Turner, Girtin elevated watercolor from a tinting medium to a serious art form. Turner himself reportedly said, 'If Tom Girtin had lived, I should have starved.' Girtin was among the first to abandon the traditional practice of laying watercolor over a pencil outline, instead working directly with the brush.",
      nationality: "British", birthYear: 1775, deathYear: 1802,
      styles: ["Romanticism", "Watercolor", "Landscape", "Topographical"],
      website: "https://en.wikipedia.org/wiki/Thomas_Girtin",
      socialLinks: { wikipedia: "https://en.wikipedia.org/wiki/Thomas_Girtin" },
      references: [{ title: "Tate Collection", url: "https://www.tate.org.uk" }]
    },
    {
      name: "William Blake",
      bio: "William Blake (1757-1827) was an English poet, painter, and printmaker who created a unique fusion of poetry and visual art. Blake developed an innovative relief etching technique and used watercolor to hand-color his illuminated books. His large-scale watercolor illustrations for Dante's Divine Comedy and the Book of Job are among the most visionary works in Western art. Blake's intense, spiritually charged watercolors combine meticulous craftsmanship with wild, prophetic imagination.",
      nationality: "British", birthYear: 1757, deathYear: 1827,
      styles: ["Romanticism", "Watercolor", "Visionary Art", "Illustration"],
      website: "https://en.wikipedia.org/wiki/William_Blake",
      socialLinks: { wikipedia: "https://en.wikipedia.org/wiki/William_Blake" },
      references: [{ title: "Tate Collection", url: "https://www.tate.org.uk" }]
    },
    {
      name: "Andrew Wyeth",
      bio: "Andrew Newell Wyeth (1917-2009) was an American visual artist, primarily a realist painter working in tempera and watercolor. His watercolors of the Pennsylvania and Maine landscapes capture the stark beauty of rural America with haunting precision. Wyeth's 'dry brush' watercolor technique produced works of extraordinary textural richness. His Helga Pictures -- a secret series of 247 paintings of neighbor Helga Testorf -- caused a sensation when revealed in 1986.",
      nationality: "American", birthYear: 1917, deathYear: 2009,
      styles: ["Realism", "Watercolor", "Tempera", "American Regionalism"],
      website: "https://en.wikipedia.org/wiki/Andrew_Wyeth",
      socialLinks: { wikipedia: "https://en.wikipedia.org/wiki/Andrew_Wyeth" },
      references: [{ title: "Brandywine River Museum", url: "https://www.brandywine.org" }]
    },
    {
      name: "Wassily Kandinsky",
      bio: "Wassily Kandinsky (1866-1944) was a Russian painter and art theorist generally credited as a pioneer of pure abstraction in Western art. Kandinsky's watercolors played a crucial role in the development of abstract art -- his 'First Abstract Watercolor' (1910) is often cited as one of the earliest purely non-representational works. At the Bauhaus, alongside Paul Klee, Kandinsky produced countless watercolors exploring the spiritual dimensions of abstract composition.",
      nationality: "Russian-French", birthYear: 1866, deathYear: 1944,
      styles: ["Abstract Art", "Expressionism", "Watercolor", "Bauhaus"],
      website: "https://en.wikipedia.org/wiki/Wassily_Kandinsky",
      socialLinks: { wikipedia: "https://en.wikipedia.org/wiki/Wassily_Kandinsky" },
      references: [{ title: "Guggenheim Museum", url: "https://www.guggenheim.org" }]
    },
    {
      name: "Elizabeth Murray",
      bio: "Dame Elizabeth Murray (1871-1946) was a British watercolor painter celebrated for her vibrant depictions of Mediterranean and tropical landscapes. Working extensively in Tenerife, Morocco, and the South of France, Murray captured dazzling light and vivid colors with an Impressionist sensibility. Her watercolors are characterized by bold brushwork and rich pigmentation that set her apart from the more restrained English watercolor tradition.",
      nationality: "British", birthYear: 1871, deathYear: 1946,
      styles: ["Impressionism", "Watercolor", "Landscape", "Travel Art"],
      website: "https://en.wikipedia.org/wiki/Elizabeth_Murray_(artist)",
      socialLinks: { wikipedia: "https://en.wikipedia.org/wiki/Elizabeth_Murray_(artist)" },
      references: [{ title: "Royal Watercolour Society", url: "https://royalwatercoloursociety.co.uk" }]
    }
  ];

  const artistIds = {};
  for (const a of newArtists) {
    process.stdout.write(`  Creating: ${a.name}...`);
    const result = await post("artists", a);
    if (result) {
      artistIds[a.name] = result.id;
      console.log(` OK [${result.slug}]`);
    } else {
      console.log(" FAILED");
    }
  }

  // Get all artist IDs including existing ones
  const allR = await fetch(`${BASE}/artists?limit=100`, { headers });
  const allArtists = (await allR.json()).data;
  for (const a of allArtists) { artistIds[a.name] = a.id; }
  console.log(`\nTotal artist IDs: ${Object.keys(artistIds).length}`);

  // ============================================================
  // NEW PAINTINGS
  // ============================================================
  console.log("\n=== CREATING NEW PAINTINGS ===");

  const paintings = [
    // Sargent
    { title: "Gondoliers' Siesta", artistName: "John Singer Sargent", medium: "Watercolor on paper", surface: "Paper", year: 1904, width: 35.6, height: 50.8, description: "A luminous watercolor depicting gondoliers resting beneath the shade of their vessels in Venice. Sargent captures the interplay of dappled light on water and the relaxed poses of the boatmen with his characteristic bravura brushwork.", tags: ["watercolor", "venice", "gondola", "impressionism"] },
    { title: "The Simplon Pass: Reading", artistName: "John Singer Sargent", medium: "Watercolor on paper", surface: "Paper", year: 1911, width: 40.0, height: 53.0, description: "Painted during one of Sargent's Alpine summers, this intimate watercolor shows a figure reading amid the dramatic landscape of the Simplon Pass. The contrast between the quiet domestic activity and the vast mountain scenery exemplifies Sargent's ability to find the personal within the monumental.", tags: ["watercolor", "landscape", "alps", "mountains"] },
    { title: "Muddy Alligators", artistName: "John Singer Sargent", medium: "Watercolor on paper", surface: "Paper", year: 1917, width: 34.3, height: 53.0, description: "One of Sargent's most celebrated watercolors, depicting a tangle of alligators basking in mud at a Florida zoo. The sinuous bodies are rendered with bold blue-gray washes, demonstrating Sargent's ability to find beauty in unexpected subjects.", tags: ["watercolor", "animals", "florida", "wildlife"] },
    { title: "In a Levantine Port", artistName: "John Singer Sargent", medium: "Watercolor on paper", surface: "Paper", year: 1905, width: 31.1, height: 45.7, description: "A vibrant watercolor capturing the bustle and color of an Eastern Mediterranean harbor. Sargent's quick, confident brushwork evokes the atmosphere of the Levant with remarkable economy.", tags: ["watercolor", "marine", "harbor", "travel"] },

    // Durer
    { title: "Young Hare", artistName: "Albrecht Durer", medium: "Watercolor and gouache", surface: "Paper", year: 1502, width: 25.1, height: 22.6, description: "One of the most famous works of natural observation in art history. Every strand of fur is individually rendered, yet the overall impression is one of a living, breathing creature. The reflection of a window in the hare's eye adds a touchingly intimate detail. Now housed in the Albertina museum, Vienna.", tags: ["watercolor", "animal", "nature", "renaissance", "masterwork"] },
    { title: "Great Piece of Turf", artistName: "Albrecht Durer", medium: "Watercolor and gouache", surface: "Paper", year: 1503, width: 40.3, height: 31.1, description: "A groundbreaking nature study depicting a small patch of wild grass and plants at close range. Durer renders dandelions, plantain, yarrow, and various grasses with botanical precision, creating a work that is simultaneously a scientific study and a meditation on natural beauty.", tags: ["watercolor", "botanical", "nature", "renaissance"] },
    { title: "Wing of a Blue Roller", artistName: "Albrecht Durer", medium: "Watercolor and gouache on vellum", surface: "Vellum", year: 1512, width: 19.6, height: 20.0, description: "An exquisitely detailed study of a European roller's wing, displaying the iridescent blue, turquoise, and brown feathers with breathtaking accuracy.", tags: ["watercolor", "bird", "feather", "nature study"] },
    { title: "View of Innsbruck", artistName: "Albrecht Durer", medium: "Watercolor on paper", surface: "Paper", year: 1495, width: 12.7, height: 18.7, description: "Painted during Durer's first journey to Italy, this view of Innsbruck from the north is one of the earliest topographical watercolors in Western art.", tags: ["watercolor", "landscape", "city", "alps", "topographical"] },

    // Cezanne
    { title: "Mont Sainte-Victoire", artistName: "Paul Cezanne", medium: "Watercolor and graphite", surface: "Paper", year: 1904, width: 36.0, height: 55.0, description: "Part of Cezanne's iconic series depicting the Provencal mountain. This watercolor demonstrates his revolutionary technique of building form through isolated patches of transparent color with areas of bare white paper.", tags: ["watercolor", "landscape", "mountain", "post-impressionism"] },
    { title: "Still Life with Apples", artistName: "Paul Cezanne", medium: "Watercolor on paper", surface: "Paper", year: 1900, width: 28.0, height: 48.0, description: "Apples rendered through overlapping translucent washes. The white paper showing through creates a sensation of light emanating from within the fruit.", tags: ["watercolor", "still life", "fruit", "post-impressionism"] },

    // O'Keeffe
    { title: "Blue and Green Music", artistName: "Georgia O'Keeffe", medium: "Watercolor on paper", surface: "Paper", year: 1919, width: 60.0, height: 48.0, description: "An early abstract watercolor translating musical sensations into flowing forms of blue and green. Smooth, undulating waves of cool color move across the paper in rhythmic patterns.", tags: ["watercolor", "abstract", "music", "modernism"] },
    { title: "Canyon with Crows", artistName: "Georgia O'Keeffe", medium: "Watercolor on paper", surface: "Paper", year: 1917, width: 22.8, height: 30.5, description: "Painted during O'Keeffe's years teaching in Canyon, Texas. Dark birds wheel against an orange and red sky, their forms reduced to essential silhouettes.", tags: ["watercolor", "landscape", "canyon", "birds", "southwest"] },

    // Klee
    { title: "Red Balloon", artistName: "Paul Klee", medium: "Watercolor and oil on muslin", surface: "Muslin", year: 1922, width: 31.7, height: 31.1, description: "One of Klee's most beloved works, depicting a red balloon floating above a dreamlike cityscape of geometric buildings. Created during his Bauhaus years.", tags: ["watercolor", "abstract", "bauhaus", "cityscape"] },
    { title: "Highway and Byways", artistName: "Paul Klee", medium: "Watercolor on paper", surface: "Paper", year: 1929, width: 83.7, height: 67.5, description: "Inspired by a journey to Egypt, this painting reduces the Nile landscape to a network of colored strips and geometric shapes converging toward a central vanishing point.", tags: ["watercolor", "abstract", "egypt", "bauhaus", "landscape"] },

    // Nolde
    { title: "Red Poppies", artistName: "Emil Nolde", medium: "Watercolor on Japanese paper", surface: "Japanese Paper", year: 1920, width: 34.0, height: 48.0, description: "Brilliant red poppies against a blue-green background. Painted on absorbent Japanese paper, the pigments bleed at the edges creating organic transitions that give the flowers almost supernatural intensity.", tags: ["watercolor", "flowers", "expressionism", "botanical"] },
    { title: "Sea with Light Clouds", artistName: "Emil Nolde", medium: "Watercolor on Japanese paper", surface: "Japanese Paper", year: 1935, width: 35.0, height: 50.0, description: "Bands of intense blue, gray, and golden yellow capture the vast North Sea sky and restless sea with elemental power.", tags: ["watercolor", "seascape", "expressionism", "clouds", "marine"] },

    // Audubon
    { title: "American Flamingo", artistName: "John James Audubon", medium: "Watercolor, graphite, and gouache", surface: "Paper", year: 1838, width: 100.0, height: 66.0, description: "Plate 431 of 'The Birds of America,' depicting a life-size American Flamingo bending its elegant neck to feed. The flamingo's sinuous pose fills the entire sheet.", tags: ["watercolor", "bird", "flamingo", "ornithology", "scientific illustration"] },
    { title: "Snowy Owl", artistName: "John James Audubon", medium: "Watercolor, pastel, and graphite", surface: "Paper", year: 1831, width: 96.5, height: 63.5, description: "A stunning depiction of a Snowy Owl perched on a snowy bluff, painted for 'The Birds of America.' The owl's piercing yellow eyes and mottled white plumage are rendered with extraordinary detail.", tags: ["watercolor", "bird", "owl", "ornithology", "winter"] },

    // Potter
    { title: "Peter Rabbit in Mr. McGregor's Garden", artistName: "Beatrix Potter", medium: "Watercolor and ink", surface: "Paper", year: 1902, width: 11.4, height: 9.0, description: "One of the original watercolor illustrations for 'The Tale of Peter Rabbit,' showing the mischievous young rabbit helping himself to Mr. McGregor's lettuces.", tags: ["watercolor", "illustration", "children", "rabbit", "literary"] },

    // Hopper
    { title: "Lighthouse at Two Lights", artistName: "Edward Hopper", medium: "Watercolor on paper", surface: "Paper", year: 1929, width: 35.2, height: 50.8, description: "A crisp, sunlit watercolor depicting the Cape Elizabeth Light in Maine. Hopper renders the white lighthouse against a deep blue sky, balancing architectural solidity with luminous atmosphere.", tags: ["watercolor", "lighthouse", "maine", "architecture"] },
    { title: "Roofs of Washington Square", artistName: "Edward Hopper", medium: "Watercolor on paper", surface: "Paper", year: 1926, width: 35.0, height: 50.8, description: "Looking from his studio window, Hopper painted this aerial view of rooftops, water tanks, and chimneys bathed in late afternoon light.", tags: ["watercolor", "cityscape", "new york", "rooftops", "urban"] },

    // Cotman
    { title: "Greta Bridge", artistName: "John Sell Cotman", medium: "Watercolor on paper", surface: "Paper", year: 1805, width: 23.0, height: 33.0, description: "Widely considered one of the greatest watercolors ever painted. Cotman reduces the scene to bold, interlocking planes of muted color, creating an almost abstract composition that feels remarkably modern.", tags: ["watercolor", "bridge", "landscape", "yorkshire", "masterwork"] },

    // Girtin
    { title: "The White House at Chelsea", artistName: "Thomas Girtin", medium: "Watercolor on paper", surface: "Paper", year: 1800, width: 29.8, height: 51.4, description: "One of the most celebrated watercolors in British art, depicting the Thames at Chelsea on a gray evening. The white house provides a single luminous accent against muted tones of water and sky.", tags: ["watercolor", "thames", "london", "landscape", "masterwork"] },

    // Blake
    { title: "The Ancient of Days", artistName: "William Blake", medium: "Watercolor, ink, and relief etching", surface: "Paper", year: 1794, width: 23.3, height: 16.8, description: "Blake's iconic frontispiece to 'Europe a Prophecy,' depicting Urizen kneeling within a sun-like orb and reaching down with a golden compass to measure the void.", tags: ["watercolor", "mythology", "visionary", "masterwork"] },
    { title: "The Great Red Dragon", artistName: "William Blake", medium: "Watercolor, ink, and graphite", surface: "Paper", year: 1805, width: 43.7, height: 34.8, description: "A monumental watercolor from Blake's series illustrating the Book of Revelation. The massive red dragon spreads its wings over a cowering woman bathed in golden light.", tags: ["watercolor", "mythology", "biblical", "dragon", "visionary"] },

    // Wyeth
    { title: "Winter Fields", artistName: "Andrew Wyeth", medium: "Watercolor and dry brush", surface: "Paper", year: 1942, width: 43.5, height: 107.3, description: "A panoramic watercolor showing a dead crow in frost-covered stubble fields near Chadds Ford, Pennsylvania. Wyeth's dry brush technique renders each frozen blade of grass with extraordinary precision.", tags: ["watercolor", "landscape", "winter", "pennsylvania", "dry brush"] },

    // Kandinsky
    { title: "First Abstract Watercolor", artistName: "Wassily Kandinsky", medium: "Watercolor, ink, and graphite", surface: "Paper", year: 1910, width: 49.6, height: 64.8, description: "Often cited as the first purely abstract artwork in Western art history, this watercolor features swirling patches of vibrant color dancing across the paper without any representational reference.", tags: ["watercolor", "abstract", "expressionism", "pioneering", "art history"] },

    // Additional Turner
    { title: "Venice: San Giorgio Maggiore at Sunset", artistName: "J.M.W. Turner", medium: "Watercolor on paper", surface: "Paper", year: 1840, width: 24.4, height: 30.4, description: "A sublime watercolor depicting San Giorgio Maggiore silhouetted against a blazing sunset. Turner dissolves architecture, water, and sky into pure luminous color.", tags: ["watercolor", "venice", "sunset", "atmospheric"] },
    { title: "Norham Castle, Sunrise", artistName: "J.M.W. Turner", medium: "Watercolor on paper", surface: "Paper", year: 1845, width: 30.5, height: 40.5, description: "One of Turner's most ethereal late watercolors. The castle is barely distinguishable from the surrounding atmosphere -- a ghostly blue form emerging from luminous yellow and pink washes.", tags: ["watercolor", "castle", "sunrise", "atmospheric", "masterwork"] },

    // Additional Homer
    { title: "After the Hurricane, Bahamas", artistName: "Winslow Homer", medium: "Watercolor on paper", surface: "Paper", year: 1899, width: 38.1, height: 54.6, description: "A dramatic watercolor depicting the aftermath of a Caribbean hurricane. A wrecked boat lies on the shore while a lone figure surveys the damage.", tags: ["watercolor", "bahamas", "hurricane", "marine", "tropical"] },
    { title: "Palm Trees, Nassau", artistName: "Winslow Homer", medium: "Watercolor on paper", surface: "Paper", year: 1898, width: 38.7, height: 54.9, description: "Palm trees silhouetted against a luminous Caribbean sky. Homer captures tropical light with extraordinary economy.", tags: ["watercolor", "palms", "bahamas", "tropical", "landscape"] },

    // Additional Monet
    { title: "Haystacks at Sunset", artistName: "Claude Monet", medium: "Watercolor on paper", surface: "Paper", year: 1891, width: 30.0, height: 42.0, description: "A watercolor study from Monet's famous Haystacks series. The golden haystacks glow with warm light against a purple-blue landscape.", tags: ["watercolor", "haystacks", "sunset", "impressionism", "study"] },
  ];

  for (const p of paintings) {
    const { artistName, ...data } = p;
    data.artistId = artistIds[artistName];
    if (!data.artistId) { console.log(`  SKIP: ${p.title} - no artist ID for ${artistName}`); continue; }
    process.stdout.write(`  Creating: ${p.title}...`);
    const result = await post("paintings", data);
    if (result) { console.log(` OK`); } else { console.log(` FAILED`); }
  }

  // ============================================================
  // NEW ARTICLES
  // ============================================================
  console.log("\n=== CREATING NEW ARTICLES ===");

  const articles = [
    {
      title: "The Evolution of Watercolor: From Ancient Pigments to Modern Masters",
      body: `<h2>Origins in Cave and Manuscript Art</h2><p>Watercolor painting is one of humanity's oldest art forms. The earliest examples date back to Paleolithic cave paintings where mineral pigments were mixed with water and applied to stone walls. Ancient Egyptian artists used water-based paints on papyrus scrolls, and medieval monks created exquisite illuminated manuscripts using watercolor and gold leaf on vellum.</p><h2>The English Watercolor School</h2><p>The 18th and 19th centuries saw watercolor elevated to a major art form, primarily through the English Watercolor School. Artists like Paul Sandby, J.M.W. Turner, Thomas Girtin, and John Sell Cotman transformed what had been a medium for tinting drawings into a vehicle for serious artistic expression. Turner, in particular, pushed the boundaries of watercolor to achieve effects of light and atmosphere that rivaled oil painting.</p><h2>American Watercolor Tradition</h2><p>In America, watercolor found enthusiastic practitioners in Winslow Homer, John Singer Sargent, and Edward Hopper. Homer's Caribbean watercolors are considered among the finest examples of the medium, while Sargent's spontaneous, light-filled studies challenged the notion that watercolor was merely a secondary medium.</p><h2>Modern and Contemporary Watercolor</h2><p>The 20th century brought radical experimentation. Paul Klee and Wassily Kandinsky used watercolor to explore abstraction, while Andrew Wyeth's hyperrealistic dry brush technique demonstrated the medium's range. Today, watercolor enjoys a global renaissance, with contemporary artists pushing boundaries through mixed media, digital integration, and monumental scale.</p>`,
      tags: ["history", "art history", "evolution", "watercolor movement"],
      excerpt: "Trace the journey of watercolor painting from prehistoric cave art through the English masters to today's contemporary innovations.",
      status: "APPROVED", language: "en",
      references: [{ title: "Metropolitan Museum of Art", url: "https://www.metmuseum.org" }]
    },
    {
      title: "Essential Watercolor Techniques Every Artist Should Master",
      body: `<h2>Flat Wash</h2><p>The flat wash is the foundation of watercolor painting. Load your brush with a consistent mixture of paint and water, tilt your paper slightly, and draw the brush across in overlapping horizontal strokes. Practice until perfectly uniform.</p><h2>Graded Wash</h2><p>A graded wash transitions from dark to light across the paper. Begin with full-strength mixture and progressively add more water with each stroke. Essential for skies and reflections.</p><h2>Wet-on-Wet</h2><p>Apply wet paint to already-wet paper for soft, diffused edges and beautiful color blending. The degree of wetness controls the effect. Turner and Nolde were masters of this technique.</p><h2>Wet-on-Dry</h2><p>Applying paint to dry paper produces crisp, defined edges. This is the technique for adding detail, texture, and hard edges to your painting.</p><h2>Dry Brush</h2><p>Using a brush with very little water and dragging it across textured paper creates a broken, sparkly effect. Andrew Wyeth elevated dry brush to an art form.</p><h2>Lifting</h2><p>Watercolor can be partially removed while wet or after drying. Lifting creates highlights, corrects mistakes, and produces soft, luminous effects.</p><h2>Glazing</h2><p>Layering thin, transparent washes over completely dry previous layers creates rich, complex colors with luminous depth. Patience is essential.</p><h2>Negative Painting</h2><p>Instead of painting a shape, paint the space around it. This technique builds complex, layered compositions where lighter shapes emerge from darker backgrounds.</p>`,
      tags: ["techniques", "tutorial", "beginner", "intermediate", "washes"],
      excerpt: "Master eight fundamental watercolor techniques: flat wash, graded wash, wet-on-wet, wet-on-dry, dry brush, lifting, glazing, and negative painting.",
      status: "APPROVED", language: "en", references: []
    },
    {
      title: "Choosing the Right Watercolor Brushes: A Comprehensive Guide",
      body: `<h2>Natural vs. Synthetic Brushes</h2><p>Natural hair brushes, particularly Kolinsky sable, are the gold standard for watercolor. They hold extraordinary amounts of water, maintain a perfect point, and have unmatched spring. Modern synthetics like Escoda Versatil and Princeton Neptune offer excellent performance at lower cost.</p><h2>Essential Brush Shapes</h2><p><strong>Round brushes</strong> are the workhorse -- fine lines from the tip, broad strokes from the belly. <strong>Flat brushes</strong> create even washes and sharp edges. <strong>Mop brushes</strong> hold large volumes for broad washes. <strong>Rigger brushes</strong> paint thin, continuous lines.</p><h2>Building Your Collection</h2><p>Start with just three brushes: a large round (size 12-14), a medium round (size 8), and a small round (size 4). Quality matters more than quantity.</p><h2>Brush Care</h2><p>Rinse thoroughly after each session, reshape tips, and store upright or flat. Never leave brushes standing in water. With proper care, a quality sable brush can last decades.</p>`,
      tags: ["brushes", "materials", "equipment", "buying guide", "beginner"],
      excerpt: "A complete guide to watercolor brushes: natural vs. synthetic, essential shapes, building your collection, and proper brush care.",
      status: "APPROVED", language: "en", references: []
    },
    {
      title: "Understanding Color Theory for Watercolor Artists",
      body: `<h2>The Color Wheel and Primary Colors</h2><p>In watercolor, understanding color theory is essential because you cannot add white to lighten -- you must preserve the white of the paper. Build your palette around warm and cool versions of each primary: warm red (Cadmium Red) and cool red (Alizarin Crimson), warm blue (Ultramarine) and cool blue (Phthalo Blue), warm yellow (Cadmium Yellow) and cool yellow (Lemon Yellow).</p><h2>Color Mixing</h2><p>Mixing two primaries that lean toward each other produces vibrant secondaries. Mixing primaries that lean apart produces muted, grayed tones -- invaluable for natural subjects.</p><h2>Color Temperature</h2><p>Warm colors advance visually, cool colors recede. Use temperature contrast to create depth: warm foregrounds against cool backgrounds.</p><h2>Transparency and Granulation</h2><p>Transparent pigments allow underlying layers to glow through, perfect for glazing. Granulating pigments settle into the paper's texture, creating beautiful speckled effects ideal for natural subjects.</p><h2>Limited Palettes</h2><p>Many masters work with surprisingly limited palettes. Ultramarine Blue, Burnt Sienna, and Yellow Ochre alone can produce a full range of landscape colors with automatic color harmony.</p>`,
      tags: ["color theory", "pigments", "mixing", "palette", "technique"],
      excerpt: "Master watercolor color theory: the color wheel, warm and cool primaries, strategic mixing, color temperature, and building effective limited palettes.",
      status: "APPROVED", language: "en", references: []
    },
    {
      title: "J.M.W. Turner: The Greatest Watercolorist Who Ever Lived?",
      body: `<h2>Early Genius</h2><p>Joseph Mallord William Turner entered the Royal Academy Schools at just 14 and exhibited his first watercolor there at 15. Even these early works showed extraordinary sensitivity to atmosphere and light.</p><h2>Revolutionary Technique</h2><p>Turner constantly experimented with watercolor technique. He scratched into wet paint with his thumbnail, blotted with rags and bread, scraped highlights with a knife, and even used spit to create texture. His methods were so unorthodox that fellow artists would gather to watch him work at the Royal Academy varnishing days.</p><h2>The Turner Bequest</h2><p>When Turner died in 1851, he left the nation an extraordinary legacy: 300 oil paintings, 30,000 works on paper (including nearly 2,000 finished watercolors), and 300 sketchbooks. This collection, the Turner Bequest, is housed primarily in the Clore Gallery at Tate Britain.</p><h2>Legacy and Influence</h2><p>Turner's late watercolors anticipated Impressionism by decades. Monet and Pissarro both studied his work during visits to London. The annual Turner Prize, Britain's most prestigious contemporary art award, bears his name.</p>`,
      tags: ["turner", "biography", "art history", "english watercolor", "romanticism"],
      excerpt: "Explore the life, revolutionary techniques, and lasting legacy of J.M.W. Turner, often considered the greatest watercolor painter in history.",
      status: "APPROVED", language: "en",
      references: [{ title: "Tate Britain", url: "https://www.tate.org.uk" }]
    },
    {
      title: "Watercolor Paper: The Foundation of Great Painting",
      body: `<h2>Why Paper Matters</h2><p>In watercolor, the paper is an active participant in the creative process. Its texture affects brush marks, its absorbency controls paint flow, and its whiteness provides the characteristic luminosity.</p><h2>Texture: Hot Press, Cold Press, and Rough</h2><p><strong>Hot Press</strong> has a smooth surface, ideal for detailed work and botanical illustration. <strong>Cold Press</strong> is the most popular, with moderate tooth that grabs paint well. <strong>Rough</strong> creates a sparkle effect, excellent for landscapes and seascapes.</p><h2>Weight and Composition</h2><p>Common weights are 140lb (300gsm) and 300lb (640gsm). Lighter papers buckle when wet and must be stretched. 100% cotton (rag) paper is considered the best -- it absorbs evenly, allows extensive reworking, and is extremely durable.</p><h2>Recommended Papers</h2><p>Beginners: Canson XL or Strathmore 400 Series. Intermediate: Arches 140lb Cold Press, the industry standard. Advanced: Fabriano Artistico, Saunders Waterford, or handmade papers from Khadi.</p>`,
      tags: ["paper", "materials", "surface", "buying guide", "beginner"],
      excerpt: "Everything you need to know about watercolor paper: textures, weights, cotton vs. wood pulp, and the best papers for every skill level.",
      status: "APPROVED", language: "en", references: []
    },
    {
      title: "John Singer Sargent: The Watercolor Revolutionary",
      body: `<h2>From Society Portraits to Sunlit Watercolors</h2><p>John Singer Sargent was the most sought-after portrait painter of the Gilded Age. But by his early fifties, weary of portraiture, Sargent turned to watercolor -- a medium he considered his finest work, and many critics today agree.</p><h2>Technique and Method</h2><p>Sargent's watercolor technique was breathtakingly direct. He worked with large brushes loaded with rich pigment, making bold strokes with no preliminary drawing. He exploited white paper for highlights, let colors merge wet-into-wet, and often completed a watercolor in a single sitting.</p><h2>Subject Matter</h2><p>His watercolors range widely: Venetian canals, Alpine streams, Middle Eastern architecture, Florida alligators, friends lounging in gardens. Whatever the subject, Sargent found beauty in the play of light and shadow.</p><h2>Collections and Legacy</h2><p>The Brooklyn Museum and the Museum of Fine Arts, Boston hold over 90 Sargent watercolors each -- treasures of their collections demonstrating that Sargent the watercolorist surpassed even Sargent the portraitist.</p>`,
      tags: ["sargent", "biography", "art history", "american watercolor"],
      excerpt: "How John Singer Sargent, the greatest portrait painter of the Gilded Age, found his truest artistic voice in watercolor.",
      status: "APPROVED", language: "en",
      references: [{ title: "Brooklyn Museum", url: "https://www.brooklynmuseum.org" }]
    },
    {
      title: "Painting Skies in Watercolor: Techniques and Tips",
      body: `<h2>Why Skies Matter</h2><p>The sky often occupies half or more of a landscape painting, making it the most important element to master. John Constable called the sky 'the key note, the standard of scale, and the chief organ of sentiment.'</p><h2>Clear Blue Skies</h2><p>A clear sky graduates from deep blue at the zenith to paler, warmer tones near the horizon. Use a graded wash with Cobalt or Ultramarine Blue, gradually adding water downward. Add a touch of Raw Sienna near the horizon for warmth.</p><h2>Cloud Techniques</h2><p>For soft cumulus clouds, wet the paper, lay in blue sky around the cloud shapes, then lift out soft edges. For storm clouds, work wet-on-wet with Payne's Gray, Ultramarine, and Burnt Sienna.</p><h2>Sunset and Sunrise Skies</h2><p>Layer transparent washes: blues and violets at zenith, through pinks and oranges to yellows near the horizon. Let each band merge while wet. Subtlety is key -- the most beautiful watercolor sunsets use surprisingly muted tones.</p><h2>Common Mistakes</h2><p>Overworking (causing blooms), using opaque pigments, making the sky too uniform, and painting cotton-ball clouds. Paint skies boldly and quickly, and accept happy accidents.</p>`,
      tags: ["skies", "clouds", "landscape", "technique", "tutorial"],
      excerpt: "Master watercolor sky painting: clear skies, cumulus clouds, storms, and luminous sunsets.",
      status: "APPROVED", language: "en", references: []
    },
    {
      title: "Winslow Homer's Caribbean Watercolors: A Turning Point in American Art",
      body: `<h2>Escape to the Tropics</h2><p>In winter 1884-85, Winslow Homer made his first trip to the Bahamas and Cuba, a journey that transformed his art. After painting the gray Maine coastline, Homer encountered crystalline Caribbean waters and brilliant tropical light.</p><h2>Technical Mastery</h2><p>Homer's Caribbean watercolors represent American watercolor painting at its peak. Working rapidly in intense heat, he used large brushes to lay down sweeping transparent washes and left broad areas of white paper for dazzling sunlight. Each stroke was placed with absolute confidence.</p><h2>Themes and Subjects</h2><p>Homer painted palm trees, coral reefs, sponge fishermen, conchs on beaches, sharks, and tropical storms. His depictions of Bahamian people are notably dignified -- painted with quiet strength and respect.</p><h2>Legacy</h2><p>Homer produced approximately 100 Caribbean watercolors between 1884 and 1905. These works, scattered across major American museums, remain a benchmark for all subsequent American watercolor painting.</p>`,
      tags: ["homer", "biography", "caribbean", "american watercolor"],
      excerpt: "How Winslow Homer's Caribbean journeys produced the most technically brilliant watercolors in American art history.",
      status: "APPROVED", language: "en",
      references: [{ title: "Metropolitan Museum of Art", url: "https://www.metmuseum.org" }]
    },
    {
      title: "The Art of Botanical Watercolor Illustration",
      body: `<h2>A Marriage of Science and Art</h2><p>Botanical illustration is one of the oldest applications of watercolor. Since the Renaissance, artists have used watercolor's transparency and precision to document plants scientifically. Albrecht Durer's 'Great Piece of Turf' (1503) established a tradition that continues today at institutions like the Royal Botanic Gardens, Kew.</p><h2>Essential Skills</h2><p>Botanical watercolor requires scientific observation and artistic skill. Artists must understand plant morphology and render specimens with precision, building up transparent layers over a careful pencil drawing, working light to dark.</p><h2>Color Accuracy</h2><p>Achieving accurate color is paramount. Many botanical illustrators work with just 10-12 pigments, mixing every green from blue and yellow rather than using pre-mixed greens, producing more natural results.</p><h2>Modern Botanical Art</h2><p>Contemporary botanical watercolor has evolved beyond pure scientific illustration. Artists like Billy Showell and Anna Mason create large-scale, highly detailed watercolors exhibited alongside traditional fine art.</p>`,
      tags: ["botanical", "illustration", "flowers", "technique", "scientific illustration"],
      excerpt: "Explore botanical watercolor: from Durer's nature studies to contemporary flower painting, with essential techniques for accurate plant portrayal.",
      status: "APPROVED", language: "en",
      references: [{ title: "Royal Botanic Gardens, Kew", url: "https://www.kew.org" }]
    }
  ];

  for (const a of articles) {
    process.stdout.write(`  Creating: ${a.title}...`);
    const result = await post("articles", a);
    if (result) { console.log(` OK`); } else { console.log(` FAILED`); }
  }

  // ============================================================
  // FINAL COUNTS
  // ============================================================
  console.log("\n=== FINAL COUNTS ===");
  const c1 = await (await fetch(`${BASE}/artists?limit=1`, { headers })).json();
  console.log(`Artists: ${c1.total}`);
  const c2 = await (await fetch(`${BASE}/paintings?limit=1`, { headers })).json();
  console.log(`Paintings: ${c2.total}`);
  const c3 = await (await fetch(`${BASE}/articles?limit=1`, { headers })).json();
  console.log(`Articles: ${c3.total}`);
}

main().catch(console.error);
