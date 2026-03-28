import { NextRequest, NextResponse } from "next/server";
import { requireApiKey, ApiKeyUser } from "@/lib/api-auth";
import { uploadImage } from "@/lib/storage";
import { db } from "@/lib/db";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
];

// POST /api/v1/upload — Upload media file, returns URL
export async function POST(req: NextRequest) {
  const result = await requireApiKey(req, "write");
  if (result instanceof NextResponse) return result;
  const apiUser = result as ApiKeyUser;

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const subfolder = (formData.get("subfolder") as string) || "general";
    const alt = (formData.get("alt") as string) || null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate subfolder to prevent path traversal
    if (!/^[a-zA-Z0-9_-]+$/.test(subfolder)) {
      return NextResponse.json(
        { error: "Invalid subfolder name. Use alphanumeric, dash, or underscore only." },
        { status: 400 }
      );
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "File type not allowed. Use JPEG, PNG, WebP, GIF, or AVIF." },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "File too large. Maximum size is 10MB." },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const uploadResult = await uploadImage(buffer, file.name, subfolder);

    // Create Media record
    const media = await db.media.create({
      data: {
        url: uploadResult.url,
        filename: file.name,
        alt,
        width: uploadResult.width,
        height: uploadResult.height,
        size: uploadResult.size,
        format: uploadResult.format,
        subfolder,
        uploadedById: apiUser.id,
      },
    });

    return NextResponse.json({
      data: {
        id: media.id,
        url: uploadResult.url,
        width: uploadResult.width,
        height: uploadResult.height,
        size: uploadResult.size,
        format: uploadResult.format,
      },
    }, { status: 201 });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Upload failed" },
      { status: 500 }
    );
  }
}

// GET /api/v1/upload — List uploaded media
export async function GET(req: NextRequest) {
  const result = await requireApiKey(req, "read");
  if (result instanceof NextResponse) return result;

  const { searchParams } = new URL(req.url);
  const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 100);
  const offset = parseInt(searchParams.get("offset") || "0");
  const subfolder = searchParams.get("subfolder");

  const where: Record<string, unknown> = {};
  if (subfolder) where.subfolder = subfolder;

  const [media, total] = await Promise.all([
    db.media.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: offset,
      take: limit,
      select: {
        id: true,
        url: true,
        filename: true,
        alt: true,
        width: true,
        height: true,
        size: true,
        format: true,
        subfolder: true,
        createdAt: true,
      },
    }),
    db.media.count({ where }),
  ]);

  return NextResponse.json({ data: media, total, limit, offset });
}
