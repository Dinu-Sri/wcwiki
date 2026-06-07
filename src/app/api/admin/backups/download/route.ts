import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { readFile, stat } from "fs/promises";
import { existsSync } from "fs";
import path from "path";

const BACKUP_DIR =
  process.env.BACKUP_DIR || "/opt/backups/wcwiki";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user || session.user.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const file = req.nextUrl.searchParams.get("file");
  if (!file) {
    return NextResponse.json({ error: "Missing file parameter" }, { status: 400 });
  }

  // Prevent path traversal
  const sanitized = path.basename(file);
  if (sanitized !== file || !sanitized.endsWith(".sql.gz")) {
    return NextResponse.json({ error: "Invalid filename" }, { status: 400 });
  }

  const filePath = path.join(BACKUP_DIR, sanitized);

  if (!existsSync(filePath)) {
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }

  const fileStats = await stat(filePath);
  const fileBuffer = await readFile(filePath);

  return new NextResponse(fileBuffer, {
    headers: {
      "Content-Type": "application/gzip",
      "Content-Disposition": `attachment; filename="${sanitized}"`,
      "Content-Length": String(fileStats.size),
    },
  });
}
