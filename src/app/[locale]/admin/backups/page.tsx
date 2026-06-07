"use client";

import { useState, useEffect, useCallback } from "react";

interface BackupStatus {
  lastBackup: string | null;
  lastFile: string | null;
  lastSize: string | null;
  totalBackups: number;
  retentionDays: number;
  backupDir: string;
  success: boolean;
  error?: string;
}

interface BackupFile {
  name: string;
  size: number;
  sizeFormatted: string;
  createdAt: string;
}

type HealthLevel = "healthy" | "warning" | "critical" | "pending";

export default function AdminBackupsPage() {
  const [status, setStatus] = useState<BackupStatus | null>(null);
  const [files, setFiles] = useState<BackupFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [backingUp, setBackingUp] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/backups");
      const data = await res.json();
      if (res.ok) {
        setStatus(data.status);
        setFiles(data.files || []);
      } else {
        setMessage({ type: "error", text: data.error || "Failed to load" });
      }
    } catch {
      setMessage({ type: "error", text: "Failed to connect" });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    // Auto-refresh every 60 seconds
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const triggerBackup = async () => {
    setBackingUp(true);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/backups", { method: "POST" });
      const data = await res.json();
      if (res.ok && data.success) {
        setMessage({
          type: "success",
          text: `Backup created: ${data.file} (${data.size})${
            data.deletedOld
              ? ` — cleaned up ${data.deletedOld} old backup(s)`
              : ""
          }`,
        });
        await fetchData();
      } else {
        setMessage({
          type: "error",
          text: data.error || "Backup failed",
        });
      }
    } catch {
      setMessage({ type: "error", text: "Backup request failed" });
    } finally {
      setBackingUp(false);
    }
  };

  const downloadBackup = (fileName: string) => {
    const link = document.createElement("a");
    link.href = `/api/admin/backups/download?file=${encodeURIComponent(fileName)}`;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const timeAgo = (iso: string) => {
    const diff = Date.now() - new Date(iso).getTime();
    const hrs = Math.floor(diff / 3600000);
    const mins = Math.floor((diff % 3600000) / 60000);
    if (hrs >= 24) {
      const days = Math.floor(hrs / 24);
      return `${days}d ${hrs % 24}h ago`;
    }
    if (hrs > 0) return `${hrs}h ${mins}m ago`;
    if (mins > 0) return `${mins}m ago`;
    return "just now";
  };

  // ── Health analysis ──────────────────────────────────────────────────────

  const computeHealth = (): {
    level: HealthLevel;
    title: string;
    detail: string;
    cronDetected: boolean;
    hoursSinceLast: number | null;
    hoursUntilNext: number | null;
  } => {
    // No backups at all
    if (!status?.lastBackup || files.length === 0) {
      return {
        level: "critical",
        title: "No Backups Yet",
        detail:
          "The backup system has never run. Click 'Backup Now' to create your first backup, then set up the cron job for daily automation.",
        cronDetected: false,
        hoursSinceLast: null,
        hoursUntilNext: null,
      };
    }

    const lastTime = new Date(status.lastBackup).getTime();
    const hoursSince = (Date.now() - lastTime) / 3600000;

    // Last backup failed
    if (!status.success) {
      return {
        level: "critical",
        title: "Last Backup Failed",
        detail: `The last backup attempt failed: ${status.error || "Unknown error"}. Check server logs and try again.`,
        cronDetected: false,
        hoursSinceLast: hoursSince,
        hoursUntilNext: null,
      };
    }

    // Detect cron: check if backups happen at consistent ~24h intervals
    let cronDetected = false;
    if (files.length >= 3) {
      const timestamps = files
        .slice(0, 4)
        .map((f) => new Date(f.createdAt).getTime())
        .sort((a, b) => b - a);
      const intervals: number[] = [];
      for (let i = 0; i < timestamps.length - 1; i++) {
        intervals.push((timestamps[i] - timestamps[i + 1]) / 3600000);
      }
      // If most intervals are 22–26h, cron is likely active
      cronDetected =
        intervals.filter((h) => h >= 22 && h <= 26).length >=
        Math.ceil(intervals.length * 0.6);
    }

    // Recent backup (within 26 hours)
    if (hoursSince <= 26) {
      const nextExpected = new Date(lastTime + 24 * 3600000);
      const hoursUntil = (nextExpected.getTime() - Date.now()) / 3600000;

      return {
        level: "healthy",
        title: cronDetected
          ? "System Healthy — Cron Active"
          : "System Healthy — Manual Mode",
        detail: cronDetected
          ? `Automatic daily backups are running. Next backup expected in ~${Math.round(hoursUntil)} hours.`
          : `Backup is recent, but automatic cron schedule not detected. Next manual backup recommended within ${Math.round(26 - hoursSince)} hours.`,
        cronDetected,
        hoursSinceLast: hoursSince,
        hoursUntilNext: Math.max(0, hoursUntil),
      };
    }

    // Stale backup (> 26 hours)
    return {
      level: "warning",
      title: cronDetected
        ? "Missed Backup Window"
        : "Backup Stale — Cron Not Detected",
      detail: cronDetected
        ? `Last backup was ${Math.round(hoursSince)} hours ago. The cron job may have failed — check /var/log/wcwiki-backup.log on the VPS.`
        : `Last backup was ${Math.round(hoursSince)} hours ago and no automatic schedule detected. Set up cron or run manual backup now.`,
      cronDetected,
      hoursSinceLast: hoursSince,
      hoursUntilNext: null,
    };
  };

  const health = computeHealth();

  const healthColors: Record<HealthLevel, string> = {
    healthy:
      "bg-green-50 border-green-200 text-green-800 dark:bg-green-950 dark:border-green-800 dark:text-green-200",
    warning:
      "bg-amber-50 border-amber-200 text-amber-800 dark:bg-amber-950 dark:border-amber-800 dark:text-amber-200",
    critical:
      "bg-red-50 border-red-200 text-red-800 dark:bg-red-950 dark:border-red-800 dark:text-red-200",
    pending:
      "bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-950 dark:border-blue-800 dark:text-blue-200",
  };

  const healthEmoji: Record<HealthLevel, string> = {
    healthy: "🟢",
    warning: "🟡",
    critical: "🔴",
    pending: "🔵",
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-foreground">Database Backups</h1>
        <div className="bg-surface border border-border rounded-xl p-8 text-center text-muted">
          Loading...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Database Backups
          </h1>
          <p className="text-sm text-muted mt-1">
            Monitor backup health, trigger manual backups, and download backup
            files. This page auto-refreshes every 60 seconds.
          </p>
        </div>
        <button
          onClick={triggerBackup}
          disabled={backingUp}
          className="px-4 py-2 rounded-lg bg-foreground text-background font-medium text-sm disabled:opacity-50 hover:opacity-90 transition-opacity"
        >
          {backingUp ? "Backing up..." : "Backup Now"}
        </button>
      </div>

      {/* ── System Health Banner ─────────────────────────────────── */}
      <div className={`border rounded-xl p-5 ${healthColors[health.level]}`}>
        <div className="flex items-start gap-3">
          <span className="text-2xl shrink-0">{healthEmoji[health.level]}</span>
          <div className="min-w-0">
            <h2 className="font-bold text-base">{health.title}</h2>
            <p className="text-sm mt-0.5 opacity-90">{health.detail}</p>
            <div className="flex flex-wrap gap-4 mt-3 text-xs opacity-80">
              {health.hoursSinceLast !== null && (
                <span>
                  Last backup:{" "}
                  <strong>{timeAgo(status!.lastBackup!)}</strong>
                </span>
              )}
              {health.hoursUntilNext !== null && health.hoursUntilNext > 0 && (
                <span>
                  Next expected:{" "}
                  <strong>~{Math.round(health.hoursUntilNext)}h from now</strong>
                </span>
              )}
              <span>
                Files on disk: <strong>{files.length}</strong>
              </span>
              <span>
                Cron:{" "}
                <strong>
                  {health.cronDetected ? "✅ Detected" : "⚠️ Not detected"}
                </strong>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Action messages */}
      {message && (
        <div
          className={`p-4 rounded-lg text-sm ${
            message.type === "success"
              ? "bg-green-50 border border-green-200 text-green-800 dark:bg-green-950 dark:border-green-800 dark:text-green-200"
              : "bg-red-50 border border-red-200 text-red-800 dark:bg-red-950 dark:border-red-800 dark:text-red-200"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatusCard
          label="Last Backup"
          value={
            status?.lastBackup ? formatDate(status.lastBackup) : "Never"
          }
          sub={
            status?.lastFile
              ? `${status.lastFile} (${status.lastSize})`
              : undefined
          }
          ok={status?.success === true}
        />
        <StatusCard
          label="Total Backups"
          value={String(status?.totalBackups ?? 0)}
          sub="files on disk"
          ok={true}
        />
        <StatusCard
          label="Retention"
          value={`${status?.retentionDays ?? 14} days`}
          sub="auto-cleanup policy"
          ok={true}
        />
        <StatusCard
          label="Storage Location"
          value={status?.backupDir || "/opt/backups/wcwiki"}
          sub={files.length > 0 ? "directory OK" : "checking..."}
          ok={files.length > 0}
        />
      </div>

      {/* Backup Files List */}
      <div className="bg-surface border border-border rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-border flex items-center justify-between">
          <h2 className="font-semibold text-foreground text-sm">
            Backup Files
          </h2>
          {files.length > 0 && (
            <span className="text-xs text-muted">
              {files.length} file{files.length !== 1 ? "s" : ""} · newest first
            </span>
          )}
        </div>

        {files.length === 0 ? (
          <div className="p-8 text-center text-sm text-muted space-y-2">
            <p>No backup files found.</p>
            <p>
              Click{" "}
              <strong className="text-foreground">Backup Now</strong> above to
              create your first backup — no SSH required.
            </p>
            <p className="text-xs">
              The backup directory is auto-created at{" "}
              <code className="text-foreground">
                {status?.backupDir || "/opt/backups/wcwiki"}
              </code>
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {files.map((file) => (
              <div
                key={file.name}
                className="flex items-center justify-between px-4 py-3 hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <svg
                    className="w-5 h-5 text-muted shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
                    />
                  </svg>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {file.name}
                    </p>
                    <p className="text-xs text-muted">
                      {formatDate(file.createdAt)} · {file.sizeFormatted}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => downloadBackup(file.name)}
                  className="ml-4 px-3 py-1.5 text-xs font-medium rounded-lg border border-border text-foreground hover:bg-accent transition-colors shrink-0"
                >
                  Download
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Cron Setup — only show if cron not detected */}
      {!health.cronDetected && (
        <div className="bg-surface border border-border rounded-xl p-4">
          <h3 className="font-semibold text-foreground text-sm mb-2">
            Set Up Automated Daily Backups
          </h3>
          <p className="text-xs text-muted mb-3">
            Without cron, you must click &quot;Backup Now&quot; manually. To
            enable automatic daily backups at 3 AM UTC, run this ONCE on your
            VPS via SSH:
          </p>
          <ol className="text-xs text-muted space-y-1 mb-3 list-decimal list-inside">
            <li>
              <code className="text-foreground">ssh user@your-vps</code>
            </li>
            <li>
              <code className="text-foreground">crontab -e</code>
            </li>
            <li>
              Paste the line below, save, and exit
            </li>
            <li>
              Verify: <code className="text-foreground">crontab -l</code>
            </li>
          </ol>
          <code className="block bg-background border border-border rounded-lg p-3 text-xs font-mono text-foreground break-all">
            0 3 * * * /opt/wcwiki/scripts/backup-db.sh &gt;&gt;
            /var/log/wcwiki-backup.log 2&gt;&amp;1
          </code>
          <p className="text-xs text-muted mt-3">
            After setup, this page will auto-detect the cron schedule and show
            &quot;🟢 System Healthy — Cron Active&quot; once 3+ daily backups
            are recorded.
          </p>
        </div>
      )}

      {/* Cron Active — show confirmation */}
      {health.cronDetected && (
        <div className="bg-surface border border-border rounded-xl p-4">
          <h3 className="font-semibold text-foreground text-sm mb-2">
            ✅ Cron Job Active
          </h3>
          <p className="text-xs text-muted">
            Automatic daily backups are detected and running. Backups occur at
            ~3 AM UTC daily. Old backups are auto-cleaned after{" "}
            {status?.retentionDays ?? 14} days. No action needed — this system
            is self-maintaining.
          </p>
        </div>
      )}
    </div>
  );
}

// ─── Status Card Component ─────────────────────────────────────────────────

function StatusCard({
  label,
  value,
  sub,
  ok,
}: {
  label: string;
  value: string;
  sub?: string;
  ok: boolean;
}) {
  return (
    <div className="bg-surface border border-border rounded-xl p-4">
      <p className="text-xs text-muted uppercase tracking-wider">{label}</p>
      <div className="flex items-center gap-2 mt-1">
        <p className="text-lg font-bold text-foreground">{value}</p>
        {label === "Last Backup" && (
          <span
            className={`w-2 h-2 rounded-full ${
              ok ? "bg-green-500" : "bg-red-500"
            }`}
            title={ok ? "Success" : "Failed"}
          />
        )}
      </div>
      {sub && <p className="text-xs text-muted mt-0.5 truncate">{sub}</p>}
    </div>
  );
}
