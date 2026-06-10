import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://wcwiki.org";

  const [artists, paintings, articles, references] = await Promise.all([
    db.artist.findMany({
      select: { slug: true, name: true, nationality: true, birthYear: true, deathYear: true },
      orderBy: { name: "asc" },
    }),
    db.painting.findMany({
      select: { slug: true, title: true, year: true, artist: { select: { name: true } } },
      orderBy: { title: "asc" },
    }),
    db.article.findMany({
      where: { status: "APPROVED" },
      select: { slug: true, title: true },
      orderBy: { title: "asc" },
    }),
    db.paintingReference.findMany({
      where: { status: "APPROVED" },
      select: { slug: true, title: true, category: { select: { name: true } }, tags: true },
      orderBy: { title: "asc" },
    }),
  ]);

  const lines: string[] = [
    `# wcWIKI — Watercolor Art Encyclopedia`,
    `# ${baseUrl}`,
    ``,
    `> wcWIKI is a multilingual open encyclopedia dedicated to watercolor art.`,
    `> It covers artists, paintings, techniques, and articles across 10 languages.`,
    `> Content is community-edited and freely available for research and learning.`,
    ``,
    `## Important Pages`,
    ``,
    `- Home: ${baseUrl}/`,
    `- Artists index: ${baseUrl}/artists`,
    `- Paintings index: ${baseUrl}/paintings`,
    `- Articles index: ${baseUrl}/articles`,
    `- Painting references index: ${baseUrl}/painting-references`,
    `- Search: ${baseUrl}/search`,
    `- About: ${baseUrl}/about`,
    ``,
    `## Artists (${artists.length} total)`,
    ``,
    ...artists.map((a) => {
      const years =
        a.birthYear && a.deathYear
          ? ` (${a.birthYear}–${a.deathYear})`
          : a.birthYear
          ? ` (b. ${a.birthYear})`
          : "";
      const nat = a.nationality ? `, ${a.nationality}` : "";
      return `- [${a.name}${years}${nat}](${baseUrl}/artists/${a.slug})`;
    }),
    ``,
    `## Paintings (${paintings.length} total)`,
    ``,
    ...paintings.map(
      (p) =>
        `- [${p.title}${p.year ? ` (${p.year})` : ""}${p.artist ? ` by ${p.artist.name}` : ""}](${baseUrl}/paintings/${p.slug})`
    ),
    ``,
    `## Articles (${articles.length} total)`,
    ``,
    ...articles.map((a) => `- [${a.title}](${baseUrl}/articles/${a.slug})`),
    ``,
    `## Painting References (${references.length} total)`,
    ``,
    ...references.map((r) => {
      const category = r.category?.name ? `, ${r.category.name}` : "";
      const tags = r.tags.length > 0 ? `, tags: ${r.tags.join(", ")}` : "";
      return `- [${r.title}${category}${tags}](${baseUrl}/painting-references/${r.slug})`;
    }),
    ``,
    `## Languages`,
    ``,
    `English, Chinese (zh), Japanese (ja), Korean (ko), Spanish (es),`,
    `French (fr), Russian (ru), Turkish (tr), Tamil (ta), Sinhala (si)`,
    ``,
    `## Usage`,
    ``,
    `This file is provided for AI language models and crawlers.`,
    `All content is available under the site's terms of service.`,
    `API access is available at ${baseUrl}/api — see docs for details.`,
  ];

  return new NextResponse(lines.join("\n"), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
    },
  });
}
