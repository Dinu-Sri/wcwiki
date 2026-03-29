import { db } from "@/lib/db";
import { EntityType } from "@prisma/client";
import { joinSegments } from "@/lib/translation-segments";

/**
 * Fetch approved translations for an entity in a given locale.
 * Returns a map of field → translated value.
 * Only returns APPROVED translations.
 * Automatically reassembles body segments (body_0, body_1, ...) into a single `body` field.
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
  const segmentMap: Record<string, string> = {};

  for (const t of translations) {
    if (/^body_\d+$/.test(t.field)) {
      segmentMap[t.field] = t.value;
    } else {
      map[t.field] = t.value;
    }
  }

  // Reassemble body segments into a single body field
  if (Object.keys(segmentMap).length > 0 && !map.body) {
    map.body = joinSegments(segmentMap);
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
