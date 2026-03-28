import path from "path";
import fs from "fs/promises";
import sharp from "sharp";

const UPLOAD_DIR = process.env.UPLOAD_DIR || "./uploads";
const MAX_WIDTH = 2000;
const QUALITY = 80;

export interface UploadResult {
  url: string;
  width: number;
  height: number;
  size: number;
  format: string;
}

/**
 * Compress and save an uploaded image.
 * Currently stores locally; can be swapped to R2/S3 later.
 */
export async function uploadImage(
  buffer: Buffer,
  filename: string,
  subfolder: string = "general"
): Promise<UploadResult> {
  // Ensure upload directory exists
  const dir = path.join(UPLOAD_DIR, subfolder);
  await fs.mkdir(dir, { recursive: true });

  // Generate safe filename
  const timestamp = Date.now();
  const safeName = filename
    .replace(/[^a-zA-Z0-9.-]/g, "_")
    .replace(/\.[^.]+$/, "");
  const outputName = `${safeName}_${timestamp}.webp`;
  const outputPath = path.join(dir, outputName);

  // Compress with sharp
  const image = sharp(buffer);
  const metadata = await image.metadata();

  const processed = await image
    .resize({
      width: Math.min(metadata.width || MAX_WIDTH, MAX_WIDTH),
      withoutEnlargement: true,
    })
    .webp({ quality: QUALITY })
    .toBuffer({ resolveWithObject: true });

  await fs.writeFile(outputPath, processed.data);

  const url = `/uploads/${subfolder}/${outputName}`;

  return {
    url,
    width: processed.info.width,
    height: processed.info.height,
    size: processed.info.size,
    format: "webp",
  };
}

/**
 * Delete an uploaded file by URL path.
 */
export async function deleteUpload(url: string): Promise<void> {
  if (!url.startsWith("/uploads/")) return;
  const filePath = path.join(UPLOAD_DIR, url.replace("/uploads/", ""));
  try {
    await fs.unlink(filePath);
  } catch {
    // File may not exist
  }
}
