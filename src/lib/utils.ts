/**
 * Generate a URL-safe slug from a string.
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Truncate text to a max length, ending at a word boundary.
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  const truncated = text.slice(0, maxLength);
  return truncated.slice(0, truncated.lastIndexOf(" ")) + "…";
}

/**
 * Format a year range for display (e.g., "1840–1926" or "b. 1985").
 */
export function formatLifespan(
  birthYear?: number | null,
  deathYear?: number | null
): string {
  if (birthYear && deathYear) return `${birthYear}–${deathYear}`;
  if (birthYear) return `b. ${birthYear}`;
  return "";
}
