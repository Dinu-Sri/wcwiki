import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { EntityType } from "@prisma/client";

// Translatable fields per entity type
const TRANSLATABLE_FIELDS: Record<string, string[]> = {
  ARTIST: ["name", "bio"],
  PAINTING: ["title", "description"],
  ARTICLE: ["title", "excerpt", "body"],
};

// GET /api/translations?entityType=ARTICLE&entityId=xxx&locale=si
// Fetch existing translations for an entity
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const entityType = searchParams.get("entityType") as EntityType | null;
  const entityId = searchParams.get("entityId");
  const locale = searchParams.get("locale");

  if (!entityType || !entityId || !locale) {
    return NextResponse.json(
      { error: "Missing required params: entityType, entityId, locale" },
      { status: 400 }
    );
  }

  const translations = await db.translation.findMany({
    where: { entityType, entityId, locale },
  });

  // Build a field → value map
  const map: Record<string, { value: string; status: string; machineSource: string | null }> = {};
  for (const t of translations) {
    map[t.field] = { value: t.value, status: t.status, machineSource: t.machineSource };
  }

  return NextResponse.json({ translations: map });
}

// POST /api/translations — submit a manual or machine translation
export async function POST(req: NextRequest) {
  const session = await auth();
  if (
    !session?.user ||
    !["SUPER_ADMIN", "APPROVER", "EDITOR"].includes(session.user.role)
  ) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const { entityType, entityId, locale, translations, useMachine } = body as {
    entityType: string;
    entityId: string;
    locale: string;
    translations?: Record<string, string>; // field → value (manual)
    useMachine?: boolean;
  };

  if (!entityType || !entityId || !locale) {
    return NextResponse.json(
      { error: "Missing required fields: entityType, entityId, locale" },
      { status: 400 }
    );
  }

  if (!Object.values(EntityType).includes(entityType as EntityType)) {
    return NextResponse.json({ error: "Invalid entityType" }, { status: 400 });
  }

  if (!/^[a-z]{2}$/.test(locale)) {
    return NextResponse.json({ error: "Invalid locale" }, { status: 400 });
  }

  const allowedFields = TRANSLATABLE_FIELDS[entityType];
  if (!allowedFields) {
    return NextResponse.json({ error: "Unknown entity type" }, { status: 400 });
  }

  // ── Machine translation path ──
  if (useMachine) {
    // Fetch original content from DB
    const original = await fetchOriginalContent(entityType as EntityType, entityId);
    if (!original) {
      return NextResponse.json({ error: "Entity not found" }, { status: 404 });
    }

    const results: Record<string, string> = {};

    for (const field of allowedFields) {
      const text = original[field];
      if (!text || text.trim().length === 0) continue;

      try {
        const translated = await machineTranslate(text, "en", locale);
        results[field] = translated;

        // Save to DB
        await db.translation.upsert({
          where: {
            entityType_entityId_locale_field: {
              entityType: entityType as EntityType,
              entityId,
              locale,
              field,
            },
          },
          update: {
            value: translated,
            status: "MACHINE",
            machineSource: "google",
            translatedById: null,
            reviewedById: null,
            reviewedAt: null,
          },
          create: {
            entityType: entityType as EntityType,
            entityId,
            locale,
            field,
            value: translated,
            status: "MACHINE",
            machineSource: "google",
          },
        });
      } catch (e) {
        console.error(`Machine translate failed for ${field}:`, e);
        results[field] = `[Translation failed]`;
      }
    }

    return NextResponse.json({ translations: results, source: "machine" });
  }

  // ── Manual translation path ──
  if (!translations || Object.keys(translations).length === 0) {
    return NextResponse.json(
      { error: "Provide translations object or set useMachine: true" },
      { status: 400 }
    );
  }

  const saved: Record<string, string> = {};

  for (const [field, value] of Object.entries(translations)) {
    if (!allowedFields.includes(field)) continue;
    if (typeof value !== "string") continue;

    await db.translation.upsert({
      where: {
        entityType_entityId_locale_field: {
          entityType: entityType as EntityType,
          entityId,
          locale,
          field,
        },
      },
      update: {
        value,
        status: "IN_REVIEW",
        translatedById: session.user.id,
        machineSource: null,
        reviewedById: null,
        reviewedAt: null,
      },
      create: {
        entityType: entityType as EntityType,
        entityId,
        locale,
        field,
        value,
        status: "IN_REVIEW",
        translatedById: session.user.id,
      },
    });

    saved[field] = value;
  }

  return NextResponse.json({ translations: saved, source: "manual" });
}

// ── Helpers ──

async function fetchOriginalContent(
  entityType: EntityType,
  entityId: string
): Promise<Record<string, string> | null> {
  switch (entityType) {
    case "ARTIST": {
      const a = await db.artist.findUnique({ where: { id: entityId } });
      if (!a) return null;
      return { name: a.name, bio: a.bio || "" };
    }
    case "PAINTING": {
      const p = await db.painting.findUnique({ where: { id: entityId } });
      if (!p) return null;
      return { title: p.title, description: p.description || "" };
    }
    case "ARTICLE": {
      const ar = await db.article.findUnique({ where: { id: entityId } });
      if (!ar) return null;
      return { title: ar.title, excerpt: ar.excerpt || "", body: ar.body };
    }
    default:
      return null;
  }
}

/**
 * Machine translation using Google Translate free API.
 * For production, replace with Google Cloud Translation API or DeepL.
 */
async function machineTranslate(
  text: string,
  sourceLang: string,
  targetLang: string
): Promise<string> {
  // Use Google Cloud Translation API if key is available
  const apiKey = process.env.GOOGLE_TRANSLATE_API_KEY;

  if (apiKey) {
    const url = `https://translation.googleapis.com/language/translate/v2`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        q: text,
        source: sourceLang,
        target: targetLang,
        format: "text",
        key: apiKey,
      }),
    });

    if (!res.ok) {
      throw new Error(`Google Translate API error: ${res.status}`);
    }

    const data = await res.json();
    return data.data.translations[0].translatedText;
  }

  // Fallback: free Google Translate endpoint (rate-limited, not for production)
  const encodedText = encodeURIComponent(text.slice(0, 5000));
  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sourceLang}&tl=${targetLang}&dt=t&q=${encodedText}`;

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Translation request failed: ${res.status}`);
  }

  const data = await res.json();

  // Response is nested array: [[["translated","original",...],...],...]
  if (!Array.isArray(data) || !Array.isArray(data[0])) {
    throw new Error("Unexpected translation response format");
  }

  return data[0].map((segment: string[]) => segment[0]).join("");
}
