import { db } from "@/lib/db";

/**
 * Generate a URL-safe slug from a string.
 * Ensures uniqueness in the specified model table.
 */
export async function generateSlug(
  text: string,
  model: "artist" | "painting" | "article"
): Promise<string> {
  const base = text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);

  let slug = base || "untitled";
  let counter = 0;

  while (true) {
    const candidate = counter === 0 ? slug : `${slug}-${counter}`;

    let exists: unknown = null;
    if (model === "artist") {
      exists = await db.artist.findUnique({ where: { slug: candidate } });
    } else if (model === "painting") {
      exists = await db.painting.findUnique({ where: { slug: candidate } });
    } else {
      exists = await db.article.findUnique({ where: { slug: candidate } });
    }

    if (!exists) return candidate;
    counter++;
  }
}
