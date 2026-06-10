import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { generateSlug } from "@/lib/slug";
import { uploadReferenceImage } from "@/lib/storage";

const MAX_FILES = 10;
const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"];

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

  if (mine && !session?.user?.id) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
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

    const titleBase = cleanText(formData.get("title"), 100);
    const description = cleanText(formData.get("description"), 1200) || null;
    const tags = parseTags(cleanText(formData.get("tags"), 400));
    const category = await resolveCategory(cleanText(formData.get("category"), 80));
    const attributionName =
      cleanText(formData.get("attributionName"), 120) ||
      session.user.name ||
      session.user.email ||
      "wcWIKI contributor";
    const attributionUrl = normalizeUrl(cleanText(formData.get("attributionUrl"), 300));

    const created = [];

    for (const [index, file] of files.entries()) {
      const buffer = Buffer.from(await file.arrayBuffer());
      const uploaded = await uploadReferenceImage(buffer, file.name);
      const fallbackTitle = titleFromFilename(file.name);
      const title =
        files.length === 1
          ? titleBase || fallbackTitle
          : `${titleBase || fallbackTitle} ${index + 1}`;
      const slug = await generateSlug(title, "paintingReference");

      const reference = await db.paintingReference.create({
        data: {
          title,
          slug,
          description,
          categoryId: category?.id || null,
          tags,
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
    return NextResponse.json({ error: "Upload failed." }, { status: 500 });
  }
}
