import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { exec } from "child_process";
import { promisify } from "util";
import { readdir, stat, readFile, unlink } from "fs/promises";
import { existsSync, mkdirSync } from "fs";
import path from "path";

const execAsync = promisify(exec);

const BACKUP_DIR =
  process.env.BACKUP_DIR || "/opt/backups/wcwiki";
const STATUS_FILE = path.join(BACKUP_DIR, "backup-status.json");
const RETENTION_DAYS = parseInt(process.env.BACKUP_RETENTION_DAYS || "14", 10);

// Ensure backup directory exists
function ensureBackupDir() {
  if (!existsSync(BACKUP_DIR)) {
    mkdirSync(BACKUP_DIR, { recursive: true });
  }
}

// ─── GET — List backups + status ───────────────────────────────────────────

export async function GET(_req: NextRequest) {
  const session = await auth();
  if (!session?.user || session.user.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  ensureBackupDir();

  // Read status file
  let status: Record<string, unknown> = {
    lastBackup: null,
    lastFile: null,
    lastSize: null,
    totalBackups: 0,
    retentionDays: RETENTION_DAYS,
    backupDir: BACKUP_DIR,
    success: false,
  };

  try {
    const raw = await readFile(STATUS_FILE, "utf-8");
    status = JSON.parse(raw);
  } catch {
    // No status file yet — no backups have run
  }

  // List backup files
  let files: {
    name: string;
    size: number;
    sizeFormatted: string;
    createdAt: string;
  }[] = [];

  try {
    const entries = await readdir(BACKUP_DIR);
    const backupFiles = entries.filter(
      (f) => f.endsWith(".sql.gz") && f.startsWith("wcwiki-")
    );

    files = await Promise.all(
      backupFiles.map(async (name) => {
        const stats = await stat(path.join(BACKUP_DIR, name));
        const sizeMB = (stats.size / (1024 * 1024)).toFixed(1);
        return {
          name,
          size: stats.size,
          sizeFormatted: `${sizeMB} MB`,
          createdAt: stats.birthtime.toISOString(),
        };
      })
    );

    // Sort newest first
    files.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  } catch {
    // Directory might not exist yet
  }

  return NextResponse.json({
    status,
    files,
    config: {
      backupDir: BACKUP_DIR,
      retentionDays: RETENTION_DAYS,
    },
  });
}

// ─── POST — Trigger a new backup ───────────────────────────────────────────

export async function POST(_req: NextRequest) {
  const session = await auth();
  if (!session?.user || session.user.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  ensureBackupDir();

  const timestamp = new Date()
    .toISOString()
    .replace(/[-:]/g, "")
    .replace(/\..+/, "")
    .replace("T", "-");
  const fileName = `wcwiki-${timestamp}.sql.gz`;
  const filePath = path.join(BACKUP_DIR, fileName);

  try {
    // Parse DATABASE_URL to get connection params
    const dbUrl = new URL(process.env.DATABASE_URL!);
    const dbHost = dbUrl.hostname;
    const dbPort = dbUrl.port || "5432";
    const dbUser = dbUrl.username;
    const dbPass = dbUrl.password;
    const dbName = dbUrl.pathname.replace("/", "");

    // Run pg_dump directly (app container has network access to postgres)
    const { stderr } = await execAsync(
      `PGPASSWORD="${dbPass}" pg_dump -h ${dbHost} -p ${dbPort} -U ${dbUser} -d ${dbName} | gzip > "${filePath}"`,
      { timeout: 300000 } // 5 minute timeout
    );

    if (stderr && !stderr.includes("WARNING")) {
      console.error("[backup] pg_dump stderr:", stderr);
    }

    // Get file size
    const stats = await stat(filePath);
    const sizeMB = (stats.size / (1024 * 1024)).toFixed(1);

    // Clean up old backups
    const entries = await readdir(BACKUP_DIR);
    const oldFiles = entries.filter(
      (f) => f.endsWith(".sql.gz") && f.startsWith("wcwiki-")
    );
    const cutoff = Date.now() - RETENTION_DAYS * 24 * 60 * 60 * 1000;

    let deleted = 0;
    for (const oldFile of oldFiles) {
      const oldPath = path.join(BACKUP_DIR, oldFile);
      const oldStats = await stat(oldPath);
      if (oldStats.birthtime.getTime() < cutoff) {
        await unlink(oldPath);
        deleted++;
      }
    }

    // Count remaining
    const remaining = oldFiles.length - deleted;

    // Write status file
    const status = {
      lastBackup: new Date().toISOString(),
      lastFile: fileName,
      lastSize: `${sizeMB} MB`,
      totalBackups: remaining,
      retentionDays: RETENTION_DAYS,
      backupDir: BACKUP_DIR,
      success: true,
    };

    const { writeFile } = await import("fs/promises");
    await writeFile(STATUS_FILE, JSON.stringify(status, null, 2));

    return NextResponse.json({
      success: true,
      file: fileName,
      size: `${sizeMB} MB`,
      deletedOld: deleted,
      totalBackups: remaining,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[backup] Failed:", message);

    // Write failure status
    try {
      const { writeFile } = await import("fs/promises");
      await writeFile(
        STATUS_FILE,
        JSON.stringify(
          {
            lastBackup: new Date().toISOString(),
            lastFile: null,
            lastSize: null,
            totalBackups: 0,
            retentionDays: RETENTION_DAYS,
            backupDir: BACKUP_DIR,
            success: false,
            error: message,
          },
          null,
          2
        )
      );
    } catch {
      // Ignore status write failure
    }

    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
