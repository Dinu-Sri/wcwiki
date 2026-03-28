import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { validateApiKey } from "@/lib/api-auth";
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

export async function POST(req: NextRequest) {
  // Try session auth first, then API key
  let userId: string | null = null;

  const session = await auth();
  if (
    session?.user &&
    ["EDITOR", "APPROVER", "SUPER_ADMIN"].includes(session.user.role as string)
  ) {
    userId = session.user.id;
  } else {
    // Fallback to API key auth
    const apiUser = await validateApiKey(req);
    if (apiUser && apiUser.permissions.includes("write")) {
      userId = apiUser.id;
    }
  }

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const subfolder = (formData.get("subfolder") as string) || "general";

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate subfolder to prevent path traversal
    if (!/^[a-zA-Z0-9_-]+$/.test(subfolder)) {
      return NextResponse.json(
        { error: "Invalid subfolder name" },
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
    const result = await uploadImage(buffer, file.name, subfolder);

    // Create Media record
    await db.media.create({
      data: {
        url: result.url,
        filename: file.name,
        alt: formData.get("alt") as string || null,
        width: result.width,
        height: result.height,
        size: result.size,
        format: result.format,
        subfolder,
        uploadedById: userId,
      },
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Upload failed" },
      { status: 500 }
    );
  }
}
