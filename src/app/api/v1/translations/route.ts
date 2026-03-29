import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireApiKey, ApiKeyUser } from "@/lib/api-auth";
import { EntityType } from "@prisma/client";

const TRANSLATABLE_FIELDS: Record<string, string[]> = {
  ARTIST: ["name", "bio"],
  PAINTING: ["title", "description"],
  ARTICLE: ["title", "excerpt", "body"],
};

// GET /api/v1/translations — List translations
export async function GET(req: NextRequest) {
  const result = await requireApiKey(req, "read");
  if (result instanceof NextResponse) return result;

  const { searchParams } = new URL(req.url);
  const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 100);
  const offset = parseInt(searchParams.get("offset") || "0");
  const entityType = searchParams.get("entityType") as EntityType | null;
  const entityId = searchParams.get("entityId");
  const locale = searchParams.get("locale");
  const status = searchParams.get("status");

  const where: Record<string, unknown> = {};
  if (entityType) where.entityType = entityType;
  if (entityId) where.entityId = entityId;
  if (locale) where.locale = locale;
  if (status) where.status = status;

  const [translations, total] = await Promise.all([
    db.translation.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      skip: offset,
      take: limit,
    }),
    db.translation.count({ where }),
  ]);

  return NextResponse.json({ data: translations, total, limit, offset });
}

// POST /api/v1/translations — Create/update translations
export async function POST(req: NextRequest) {
  const result = await requireApiKey(req, "write");
  if (result instanceof NextResponse) return result;
  const apiUser = result as ApiKeyUser;

  const body = await req.json();
  const { entityType, entityId, locale, translations, useMachine } = body as {
    entityType: string;
    entityId: string;
    locale: string;
    translations?: Record<string, string>;
    useMachine?: boolean;
  };

  if (!entityType || !entityId || !locale) {
    return NextResponse.json(
      { error: "entityType, entityId, and locale are required" },
      { status: 400 }
    );
  }

  if (!Object.values(EntityType).includes(entityType as EntityType)) {
    return NextResponse.json({ error: "Invalid entityType. Must be ARTIST, PAINTING, or ARTICLE" }, { status: 400 });
  }

  if (!/^[a-z]{2}$/.test(locale)) {
    return NextResponse.json({ error: "Invalid locale format" }, { status: 400 });
  }

  const allowedFields = TRANSLATABLE_FIELDS[entityType];
  if (!allowedFields) {
    return NextResponse.json({ error: "Unknown entity type" }, { status: 400 });
  }

  // Machine translation via direct call
  if (useMachine) {
    const original = await fetchOriginal(entityType as EntityType, entityId);
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
        await db.translation.upsert({
          where: {
            entityType_entityId_locale_field: {
              entityType: entityType as EntityType, entityId, locale, field,
            },
          },
          update: { value: translated, status: "MACHINE", machineSource: "google", translatedById: null, reviewedById: null, reviewedAt: null },
          create: { entityType: entityType as EntityType, entityId, locale, field, value: translated, status: "MACHINE", machineSource: "google" },
        });
      } catch (e) {
        console.error(`Machine translate failed for ${field}:`, e);
        results[field] = "[Translation failed]";
      }
    }

    return NextResponse.json({ data: results, source: "machine" }, { status: 201 });
  }

  // Manual translation
  if (!translations || Object.keys(translations).length === 0) {
    return NextResponse.json(
      { error: "Provide translations object or set useMachine: true" },
      { status: 400 }
    );
  }

  const saved: Record<string, string> = {};
  for (const [field, value] of Object.entries(translations)) {
    const isSegmentKey = /^body_\d+$/.test(field);
    if (!allowedFields.includes(field) && !isSegmentKey) continue;
    if (typeof value !== "string") continue;

    await db.translation.upsert({
      where: {
        entityType_entityId_locale_field: {
          entityType: entityType as EntityType, entityId, locale, field,
        },
      },
      update: { value, status: "IN_REVIEW", translatedById: apiUser.id, machineSource: null, reviewedById: null, reviewedAt: null },
      create: { entityType: entityType as EntityType, entityId, locale, field, value, status: "IN_REVIEW", translatedById: apiUser.id },
    });
    saved[field] = value;
  }

  return NextResponse.json({ data: saved, source: "manual" }, { status: 201 });
}

// ── Helpers ──

async function fetchOriginal(
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

async function machineTranslate(
  text: string,
  sourceLang: string,
  targetLang: string
): Promise<string> {
  const apiKey = process.env.GOOGLE_TRANSLATE_API_KEY;

  if (apiKey) {
    const url = `https://translation.googleapis.com/language/translate/v2`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ q: text, source: sourceLang, target: targetLang, format: "text", key: apiKey }),
    });
    if (!res.ok) throw new Error(`Google Translate API error: ${res.status}`);
    const data = await res.json();
    return data.data.translations[0].translatedText;
  }

  const encodedText = encodeURIComponent(text.slice(0, 5000));
  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sourceLang}&tl=${targetLang}&dt=t&q=${encodedText}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Translation request failed: ${res.status}`);
  const data = await res.json();
  if (!Array.isArray(data) || !Array.isArray(data[0])) {
    throw new Error("Unexpected translation response format");
  }
  return data[0].map((segment: string[]) => segment[0]).join("");
}
