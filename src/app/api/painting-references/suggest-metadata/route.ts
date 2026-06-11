import { createHash } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";
import { auth } from "@/lib/auth";
import { REFERENCE_CATEGORIES, REFERENCE_COUNTRIES } from "@/lib/reference-taxonomy";

export const runtime = "nodejs";

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"];
const DEFAULT_MODEL = "gpt-5.4-mini";
const FALLBACK_MODELS = ["gpt-4.1-mini", "gpt-4o-mini"];
const DEFAULT_DAILY_LIMIT = 10;
const CACHE_TTL_MS = 1000 * 60 * 60 * 24;
const MAX_CACHE_ITEMS = 250;

type MetadataSuggestion = {
  title: string;
  description: string;
  category: string;
  country: string;
  city: string;
  tags: string[];
};

type CachedSuggestion = {
  createdAt: number;
  data: MetadataSuggestion;
};

type OpenAIProviderError = {
  status: number;
  message: string;
  code?: string;
};

const suggestionCache = new Map<string, CachedSuggestion>();
const userUsage = new Map<string, { day: string; count: number }>();

function cleanText(value: unknown, maxLength: number) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

function cleanTags(value: unknown) {
  if (!Array.isArray(value)) return [];
  return value
    .map((tag) => cleanText(tag, 36).toLowerCase())
    .filter(Boolean)
    .filter((tag, index, arr) => arr.indexOf(tag) === index)
    .slice(0, 10);
}

function pruneCache() {
  const now = Date.now();
  for (const [key, value] of suggestionCache.entries()) {
    if (now - value.createdAt > CACHE_TTL_MS) {
      suggestionCache.delete(key);
    }
  }

  while (suggestionCache.size > MAX_CACHE_ITEMS) {
    const oldestKey = suggestionCache.keys().next().value;
    if (!oldestKey) break;
    suggestionCache.delete(oldestKey);
  }
}

function getDailyLimit() {
  const value = Number.parseInt(
    process.env.OPENAI_METADATA_DAILY_LIMIT || String(DEFAULT_DAILY_LIMIT),
    10
  );
  return Number.isFinite(value) && value > 0 ? value : DEFAULT_DAILY_LIMIT;
}

function reserveSuggestionUse(userId: string) {
  const day = new Date().toISOString().slice(0, 10);
  const current = userUsage.get(userId);
  const limit = getDailyLimit();

  if (!current || current.day !== day) {
    userUsage.set(userId, { day, count: 1 });
    return true;
  }

  if (current.count >= limit) {
    return false;
  }

  current.count += 1;
  return true;
}

function getModelCandidates() {
  const configured = process.env.OPENAI_VISION_MODEL || DEFAULT_MODEL;
  return [configured, ...FALLBACK_MODELS].filter(
    (model, index, arr) => model && arr.indexOf(model) === index
  );
}

function parseProviderError(status: number, body: string): OpenAIProviderError {
  try {
    const parsed = JSON.parse(body) as {
      error?: { message?: string; code?: string; type?: string };
    };
    return {
      status,
      message: parsed.error?.message || "OpenAI request failed.",
      code: parsed.error?.code || parsed.error?.type,
    };
  } catch {
    return {
      status,
      message: body.slice(0, 240) || "OpenAI request failed.",
    };
  }
}

function shouldTryFallback(error: OpenAIProviderError) {
  const message = error.message.toLowerCase();
  const code = (error.code || "").toLowerCase();
  return (
    error.status === 400 ||
    error.status === 404 ||
    code.includes("model") ||
    message.includes("model") ||
    message.includes("unsupported")
  );
}

function extractOpenAIText(payload: unknown) {
  if (!payload || typeof payload !== "object") return "";
  const maybePayload = payload as {
    output_text?: unknown;
    output?: Array<{ content?: Array<{ type?: string; text?: unknown }> }>;
  };

  if (typeof maybePayload.output_text === "string") {
    return maybePayload.output_text;
  }

  for (const item of maybePayload.output || []) {
    for (const content of item.content || []) {
      if (content.type === "output_text" && typeof content.text === "string") {
        return content.text;
      }
    }
  }

  return "";
}

function sanitizeSuggestion(value: unknown): MetadataSuggestion {
  const parsed = value && typeof value === "object" ? value as Record<string, unknown> : {};
  const category = cleanText(parsed.category, 80);
  const country = cleanText(parsed.country, 80);

  return {
    title: cleanText(parsed.title, 90) || "Painting reference photo",
    description: cleanText(parsed.description, 900),
    category: REFERENCE_CATEGORIES.includes(category as typeof REFERENCE_CATEGORIES[number])
      ? category
      : "",
    country: REFERENCE_COUNTRIES.includes(country as typeof REFERENCE_COUNTRIES[number])
      ? country
      : "",
    city: cleanText(parsed.city, 80),
    tags: cleanTags(parsed.tags),
  };
}

function buildPrompt() {
  return [
    "Create concise metadata for a watercolor painting reference photo.",
    "Focus on what helps artists find and paint from the image: subject, composition, light direction, dominant colors, season or atmosphere, and useful painting notes.",
    "Do not identify private people. Do not invent a location. Pick a country or city only when it is visually obvious; otherwise return an empty string.",
    `Choose one category from this exact list or return an empty string: ${REFERENCE_CATEGORIES.join(", ")}.`,
    `Choose one country from this exact list or return an empty string: ${REFERENCE_COUNTRIES.join(", ")}.`,
    "Use natural title case for the title. Keep tags lower-case, search-friendly, and useful for watercolor artists.",
  ].join("\n");
}

async function requestOpenAIMetadata({
  apiKey,
  optimized,
  schema,
}: {
  apiKey: string;
  optimized: Buffer;
  schema: Record<string, unknown>;
}) {
  let lastError: OpenAIProviderError | null = null;

  for (const model of getModelCandidates()) {
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        input: [
          {
            role: "user",
            content: [
              { type: "input_text", text: buildPrompt() },
              {
                type: "input_image",
                image_url: `data:image/webp;base64,${optimized.toString("base64")}`,
                detail: "low",
              },
            ],
          },
        ],
        max_output_tokens: 700,
        text: {
          format: {
            type: "json_schema",
            name: "painting_reference_metadata",
            strict: true,
            schema,
          },
        },
      }),
    });

    if (response.ok) {
      return {
        model,
        payload: await response.json(),
      };
    }

    const body = await response.text();
    const providerError = parseProviderError(response.status, body);
    lastError = providerError;
    console.error(`OpenAI metadata suggestion failed with ${model}:`, providerError);

    if (!shouldTryFallback(providerError)) {
      break;
    }
  }

  throw new Error(lastError?.message || "OpenAI request failed.");
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "AI suggestions are not configured yet." },
      { status: 503 }
    );
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Select an image first." }, { status: 400 });
    }
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "Only JPEG, PNG, WebP, and AVIF images are supported." },
        { status: 400 }
      );
    }
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: "Image is larger than 10MB." }, { status: 400 });
    }

    const sourceBuffer = Buffer.from(await file.arrayBuffer());
    const optimized = await sharp(sourceBuffer)
      .rotate()
      .resize({
        width: 1024,
        height: 1024,
        fit: "inside",
        withoutEnlargement: true,
      })
      .webp({ quality: 72, effort: 4, smartSubsample: true })
      .toBuffer();

    const hash = createHash("sha256").update(optimized).digest("hex");
    pruneCache();
    const cached = suggestionCache.get(hash);
    if (cached) {
      return NextResponse.json({ data: cached.data, cached: true });
    }

    if (!reserveSuggestionUse(session.user.id)) {
      return NextResponse.json(
        { error: "Daily AI suggestion limit reached. Try again tomorrow." },
        { status: 429 }
      );
    }

    const schema = {
      type: "object",
      additionalProperties: false,
      required: ["title", "description", "category", "country", "city", "tags"],
      properties: {
        title: { type: "string", maxLength: 90 },
        description: { type: "string", maxLength: 900 },
        category: { type: "string", enum: ["", ...REFERENCE_CATEGORIES] },
        country: { type: "string", enum: ["", ...REFERENCE_COUNTRIES] },
        city: { type: "string", maxLength: 80 },
        tags: {
          type: "array",
          minItems: 4,
          maxItems: 10,
          items: { type: "string", maxLength: 36 },
        },
      },
    };

    const { model, payload } = await requestOpenAIMetadata({ apiKey, optimized, schema });
    const outputText = extractOpenAIText(payload);
    if (!outputText) {
      console.error("OpenAI metadata suggestion returned no output text:", payload);
      return NextResponse.json(
        { error: "AI returned an empty response. Please try again." },
        { status: 502 }
      );
    }

    const suggestion = sanitizeSuggestion(JSON.parse(outputText));
    suggestionCache.set(hash, { createdAt: Date.now(), data: suggestion });

    return NextResponse.json({ data: suggestion, cached: false, model });
  } catch (error) {
    console.error("Painting reference AI suggestion failed:", error);
    const message = error instanceof Error ? error.message : "AI suggestion failed.";
    return NextResponse.json(
      { error: `AI suggestion failed: ${message}` },
      { status: 500 }
    );
  }
}
