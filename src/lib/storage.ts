import path from "path";
import fs from "fs/promises";
import sharp from "sharp";

const UPLOAD_DIR = process.env.UPLOAD_DIR || "./uploads";
const MAX_WIDTH = 1920;
const QUALITY = 75;

export interface UploadResult {
  url: string;
  width: number;
  height: number;
  size: number;
  format: string;
}

/**
 * Compress and save an uploaded image.
 * Converts to WebP with optimized settings for minimal file size.
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

  // Compress with sharp — optimized for lowest file size
  const image = sharp(buffer);
  const metadata = await image.metadata();

  const processed = await image
    .resize({
      width: Math.min(metadata.width || MAX_WIDTH, MAX_WIDTH),
      withoutEnlargement: true,
    })
    .webp({ quality: QUALITY, effort: 6, smartSubsample: true })
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
 * Replace an existing uploaded file with a new optimized version.
 * Keeps the same URL path so all references stay valid.
 */
export async function replaceUpload(
  existingUrl: string,
  buffer: Buffer
): Promise<UploadResult> {
  if (!existingUrl.startsWith("/uploads/")) {
    throw new Error("Invalid upload URL");
  }
  const filePath = path.join(UPLOAD_DIR, existingUrl.replace("/uploads/", ""));
  const dir = path.dirname(filePath);
  await fs.mkdir(dir, { recursive: true });

  const image = sharp(buffer);
  const metadata = await image.metadata();

  const processed = await image
    .resize({
      width: Math.min(metadata.width || MAX_WIDTH, MAX_WIDTH),
      withoutEnlargement: true,
    })
    .webp({ quality: QUALITY, effort: 6, smartSubsample: true })
    .toBuffer({ resolveWithObject: true });

  await fs.writeFile(filePath, processed.data);

  return {
    url: existingUrl,
    width: processed.info.width,
    height: processed.info.height,
    size: processed.info.size,
    format: "webp",
  };
}

/**
 * Get total disk usage of the uploads directory.
 */
export async function getStorageStats(): Promise<{
  totalSize: number;
  fileCount: number;
  bySubfolder: Record<string, { size: number; count: number }>;
}> {
  const bySubfolder: Record<string, { size: number; count: number }> = {};
  let totalSize = 0;
  let fileCount = 0;

  try {
    const entries = await fs.readdir(UPLOAD_DIR, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.isDirectory()) {
        const subPath = path.join(UPLOAD_DIR, entry.name);
        const files = await fs.readdir(subPath);
        let subSize = 0;
        for (const file of files) {
          try {
            const stat = await fs.stat(path.join(subPath, file));
            if (stat.isFile()) {
              subSize += stat.size;
              fileCount++;
            }
          } catch { /* skip */ }
        }
        totalSize += subSize;
        bySubfolder[entry.name] = { size: subSize, count: files.length };
      } else if (entry.isFile()) {
        try {
          const stat = await fs.stat(path.join(UPLOAD_DIR, entry.name));
          totalSize += stat.size;
          fileCount++;
          bySubfolder["root"] = bySubfolder["root"] || { size: 0, count: 0 };
          bySubfolder["root"].size += stat.size;
          bySubfolder["root"].count++;
        } catch { /* skip */ }
      }
    }
  } catch { /* empty directory */ }

  return { totalSize, fileCount, bySubfolder };
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
