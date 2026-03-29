import { db } from "@/lib/db";
import { EntityType } from "@prisma/client";

/**
 * Fetch approved translations for an entity in a given locale.
 * Returns a map of field → translated value.
 * Only returns APPROVED translations.
 */
export async function getTranslations(
  entityType: EntityType,
  entityId: string,
  locale: string
): Promise<Record<string, string>> {
  if (locale === "en") return {}; // No translations needed for default locale

  const translations = await db.translation.findMany({
    where: {
      entityType,
      entityId,
      locale,
      status: "APPROVED",
    },
  });

  const map: Record<string, string> = {};
  for (const t of translations) {
    map[t.field] = t.value;
  }
  return map;
}

/**
 * Apply translations to an object, returning a new object with
 * translated values overriding originals where available.
 */
export function applyTranslations<T extends Record<string, unknown>>(
  original: T,
  translations: Record<string, string>
): T {
  if (Object.keys(translations).length === 0) return original;

  const result = { ...original };
  for (const [field, value] of Object.entries(translations)) {
    if (field in result) {
      (result as Record<string, unknown>)[field] = value;
    }
  }
  return result;
}
