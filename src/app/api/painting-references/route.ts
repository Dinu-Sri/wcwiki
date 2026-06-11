import { NextRequest, NextResponse } from "next/server";
import { randomInt } from "crypto";
import { auth } from "@/lib/auth";
import { logAppEvent } from "@/lib/app-logger";
import { db } from "@/lib/db";
import { generateSlug } from "@/lib/slug";
import { uploadReferenceImage } from "@/lib/storage";
import { REFERENCE_CATEGORIES, REFERENCE_COUNTRIES } from "@/lib/reference-taxonomy";

const MAX_FILES = 10;
const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"];

type ReferenceUploadMetadata = {
  titleBase: string;
  description: string | null;
  tags: string[];
  categoryName: string;
  country: string | null;
  city: string | null;
  takenAt: Date | null;
};

function cleanText(value: FormDataEntryValue | null, maxLength = 500) {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, maxLength);
}

function titleFromFilename(filename: string) {
  return filename
    .replace(/\.[^.]+$/, "")
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 90) || "Painting Reference";
}

function parseTags(value: string) {
  return value
    .split(/[,\n]/)
    .map((tag) => tag.trim().toLowerCase())
    .filter(Boolean)
    .filter((tag, index, arr) => arr.indexOf(tag) === index)
    .slice(0, 12);
}

function normalizeUrl(value: string) {
  if (!value) return null;
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:"
      ? url.toString()
      : null;
  } catch {
    return null;
  }
}

function parseDate(value: string) {
  if (!value) return null;
  const date = new Date(`${value}T00:00:00.000Z`);
  return Number.isNaN(date.getTime()) ? null : date;
}

function cleanIndexedText(formData: FormData, name: string, index: number, maxLength = 500) {
  return (
    cleanText(formData.get(`${name}_${index}`), maxLength) ||
    cleanText(formData.get(name), maxLength)
  );
}

async function generateReferenceShortCode() {
  const chars = "23456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";

  for (let attempt = 0; attempt < 12; attempt++) {
    let code = "";
    for (let index = 0; index < 5; index++) {
      code += chars[randomInt(chars.length)];
    }
    const existing = await db.paintingReference.findFirst({
      where: { shortCode: code },
      select: { id: true },
    });
    if (!existing) return code;
  }

  throw new Error("Could not create a unique reference short code");
}

async function resolveCategory(name: string) {
  const cleaned = name.trim().slice(0, 80);
  if (!cleaned) return null;

  const existing = await db.referenceCategory.findFirst({
    where: { name: { equals: cleaned, mode: "insensitive" } },
  });
  if (existing) return existing;

  const slug = await generateSlug(cleaned, "referenceCategory");
  return db.referenceCategory.create({
    data: {
      name: cleaned,
      slug,
    },
  });
}

export async function GET(req: NextRequest) {
  const session = await auth();
  const { searchParams } = req.nextUrl;
  const mine = searchParams.get("mine") === "true";
  const saved = searchParams.get("saved") === "true";

  if ((mine || saved) && !session?.user?.id) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  if (saved) {
    const savedReferences = await db.referenceSave.findMany({
      where: { userId: session!.user.id },
      orderBy: { createdAt: "desc" },
      take: 100,
      include: {
        reference: {
          include: {
            category: { select: { id: true, name: true, slug: true } },
            submittedBy: { select: { id: true, name: true, image: true } },
          },
        },
      },
    });

    return NextResponse.json({
      data: savedReferences.map((item) => item.reference),
    });
  }

  const references = await db.paintingReference.findMany({
    where: mine ? { submittedById: session!.user.id } : { status: "APPROVED" },
    orderBy: { createdAt: "desc" },
    take: 100,
    include: {
      category: { select: { id: true, name: true, slug: true } },
      submittedBy: { select: { id: true, name: true, image: true } },
    },
  });

  return NextResponse.json({ data: references });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const files = formData
      .getAll("files")
      .filter((value): value is File => value instanceof File);

    if (files.length === 0) {
      return NextResponse.json({ error: "Select at least one image." }, { status: 400 });
    }
    if (files.length > MAX_FILES) {
      return NextResponse.json({ error: "Upload a maximum of 10 images at a time." }, { status: 400 });
    }
    if (cleanText(formData.get("licenseConfirmed"), 10) !== "true") {
      return NextResponse.json({ error: "License confirmation is required." }, { status: 400 });
    }
    if (cleanText(formData.get("ownershipConfirmed"), 10) !== "true") {
      return NextResponse.json({ error: "Ownership confirmation is required." }, { status: 400 });
    }

    for (const file of files) {
      if (!ALLOWED_TYPES.includes(file.type)) {
        return NextResponse.json(
          { error: "Only JPEG, PNG, WebP, and AVIF images are allowed." },
          { status: 400 }
        );
      }
      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          { error: `${file.name} is larger than 10MB.` },
          { status: 400 }
        );
      }
    }

    const attributionName =
      cleanText(formData.get("attributionName"), 120) ||
      session.user.name ||
      session.user.email ||
      "wcWIKI contributor";
    const attributionUrl = normalizeUrl(cleanText(formData.get("attributionUrl"), 300));
    const fileMetadata: ReferenceUploadMetadata[] = [];
    for (const [index, file] of files.entries()) {
      const categoryName = cleanIndexedText(formData, "category", index, 80);
      if (!REFERENCE_CATEGORIES.includes(categoryName as typeof REFERENCE_CATEGORIES[number])) {
        return NextResponse.json(
          { error: `Choose a valid category for ${file.name}.` },
          { status: 400 }
        );
      }

      const country = cleanIndexedText(formData, "country", index, 80);
      if (country && !REFERENCE_COUNTRIES.includes(country as typeof REFERENCE_COUNTRIES[number])) {
        return NextResponse.json(
          { error: `Choose a valid country for ${file.name}.` },
          { status: 400 }
        );
      }

      fileMetadata.push({
        titleBase: cleanIndexedText(formData, "title", index, 100),
        description: cleanIndexedText(formData, "description", index, 1200) || null,
        tags: parseTags(cleanIndexedText(formData, "tags", index, 400)),
        categoryName,
        country: country || null,
        city: cleanIndexedText(formData, "city", index, 120) || null,
        takenAt: parseDate(cleanIndexedText(formData, "takenAt", index, 20)),
      });
    }

    const created = [];

    for (const [index, file] of files.entries()) {
      const metadata = fileMetadata[index];
      const buffer = Buffer.from(await file.arrayBuffer());
      const uploaded = await uploadReferenceImage(buffer, file.name);
      const fallbackTitle = titleFromFilename(file.name);
      const title = metadata.titleBase || fallbackTitle;
      const slug = await generateSlug(title, "paintingReference");
      const shortCode = await generateReferenceShortCode();
      const category = await resolveCategory(metadata.categoryName);

      const reference = await db.paintingReference.create({
        data: {
          title,
          slug,
          shortCode,
          description: metadata.description,
          categoryId: category?.id || null,
          tags: metadata.tags,
          country: metadata.country,
          city: metadata.city,
          takenAt: metadata.takenAt,
          previewUrl: uploaded.preview.url,
          thumbnailUrl: uploaded.thumbnail.url,
          width: uploaded.preview.width,
          height: uploaded.preview.height,
          size: uploaded.preview.size + uploaded.thumbnail.size,
          format: uploaded.preview.format,
          attributionName,
          attributionUrl,
          submittedById: session.user.id,
        },
        include: {
          category: { select: { id: true, name: true, slug: true } },
        },
      });

      created.push(reference);
    }

    return NextResponse.json({ data: created }, { status: 201 });
  } catch (error) {
    console.error("Painting reference upload failed:", error);
    await logAppEvent({
      level: "error",
      source: "painting-references.upload",
      message: "Painting reference upload failed",
      userId: session.user.id,
      metadata: { error },
    });
    return NextResponse.json({ error: "Upload failed." }, { status: 500 });
  }
}
