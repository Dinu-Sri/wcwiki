#!/usr/bin/env node
// In-container backup scheduler — runs as a background process alongside the server.
// Triggers a daily pg_dump + gzip backup at ~3 AM UTC.
// No host access, no SSH, no cron required. Managed entirely via Portainer redeploy.

const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const BACKUP_DIR = process.env.BACKUP_DIR || "/opt/backups/wcwiki";
const RETENTION_DAYS = parseInt(process.env.BACKUP_RETENTION_DAYS || "14", 10);
const STATUS_FILE = path.join(BACKUP_DIR, "backup-status.json");

if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

function msUntilNextBackup() {
  // Target: 3:10 AM UTC daily
  const now = new Date();
  const target = new Date(now);
  target.setUTCHours(3, 10, 0, 0);
  if (target <= now) {
    target.setUTCDate(target.getUTCDate() + 1);
  }
  return target.getTime() - now.getTime();
}

function runBackup() {
  const timestamp = new Date()
    .toISOString()
    .replace(/[-:]/g, "")
    .replace(/\..+/, "")
    .replace("T", "-");
  const fileName = `wcwiki-${timestamp}.sql.gz`;
  const filePath = path.join(BACKUP_DIR, fileName);

  try {
    // Parse DATABASE_URL
    const dbUrl = new URL(process.env.DATABASE_URL);
    const host = dbUrl.hostname;
    const port = dbUrl.port || "5432";
    const user = dbUrl.username;
    const pass = dbUrl.password;
    const dbName = dbUrl.pathname.replace("/", "");

    console.log(`[backup-scheduler] Starting backup: ${fileName}`);

    // pg_dump + gzip directly (app container has network access to postgres)
    execSync(
      `PGPASSWORD="${pass}" pg_dump -h ${host} -p ${port} -U ${user} -d ${dbName} | gzip > "${filePath}"`,
      { timeout: 300000, stdio: "pipe" }
    );

    // Get file size
    const stats = fs.statSync(filePath);
    const sizeMB = (stats.size / (1024 * 1024)).toFixed(1);

    // Clean up old backups
    const files = fs
      .readdirSync(BACKUP_DIR)
      .filter((f) => f.endsWith(".sql.gz") && f.startsWith("wcwiki-"));
    const cutoff = Date.now() - RETENTION_DAYS * 24 * 60 * 60 * 1000;

    let deleted = 0;
    for (const f of files) {
      const fp = path.join(BACKUP_DIR, f);
      if (fs.statSync(fp).mtimeMs < cutoff) {
        fs.unlinkSync(fp);
        deleted++;
      }
    }

    const remaining = files.length - deleted;

    // Write status
    fs.writeFileSync(
      STATUS_FILE,
      JSON.stringify(
        {
          lastBackup: new Date().toISOString(),
          lastFile: fileName,
          lastSize: `${sizeMB} MB`,
          totalBackups: remaining,
          retentionDays: RETENTION_DAYS,
          backupDir: BACKUP_DIR,
          success: true,
        },
        null,
        2
      )
    );

    console.log(
      `[backup-scheduler] Done: ${fileName} (${sizeMB} MB), ${remaining} backups kept` +
        (deleted > 0 ? `, cleaned ${deleted} old` : "")
    );
  } catch (err) {
    console.error(`[backup-scheduler] FAILED: ${err.message}`);

    // Write failure status
    try {
      fs.writeFileSync(
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
            error: err.message,
          },
          null,
          2
        )
      );
    } catch {
      // ignore status write failure
    }
  }
}

function scheduleNext() {
  const ms = msUntilNextBackup();
  const hours = Math.round((ms / 3600000) * 10) / 10;
  console.log(`[backup-scheduler] Next backup in ${hours}h (at ~03:10 UTC)`);

  setTimeout(() => {
    runBackup();
    scheduleNext();
  }, ms);
}

// Wait for server to be ready, then start scheduling
setTimeout(() => {
  console.log("[backup-scheduler] Backup scheduler started");
  scheduleNext();
}, 30000); // 30s delay for server startup

console.log("[backup-scheduler] Initializing...");
