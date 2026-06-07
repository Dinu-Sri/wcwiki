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
            data.deletedOld ? ` — cleaned up ${data.deletedOld} old backup(s)` : ""
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
            Manage automated database backups, trigger manual backups, and
            download backup files.
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

      {/* Message */}
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
          label="Storage Path"
          value={status?.backupDir || "/opt/backups/wcwiki"}
          sub="on VPS host"
          ok={true}
        />
      </div>

      {/* Backup Files List */}
      <div className="bg-surface border border-border rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-border">
          <h2 className="font-semibold text-foreground text-sm">
            Backup Files
          </h2>
        </div>

        {files.length === 0 ? (
          <div className="p-8 text-center text-sm text-muted">
            No backup files found. Run your first backup using the button above
            or set up the cron job on your VPS.
          </div>
        ) : (
          <div className="divide-y divide-border">
            {files.map((file) => (
              <div
                key={file.name}
                className="flex items-center justify-between px-4 py-3 hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  {/* Icon */}
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

      {/* Cron Setup Info */}
      <div className="bg-surface border border-border rounded-xl p-4">
        <h3 className="font-semibold text-foreground text-sm mb-2">
          Automated Backups (Cron)
        </h3>
        <p className="text-xs text-muted mb-3">
          Add this cron job on your VPS to run daily backups at 3 AM UTC:
        </p>
        <code className="block bg-background border border-border rounded-lg p-3 text-xs font-mono text-foreground">
          0 3 * * * /opt/wcwiki/scripts/backup-db.sh &gt;&gt;
          /var/log/wcwiki-backup.log 2&gt;&amp;1
        </code>
        <p className="text-xs text-muted mt-3">
          Setup: <code className="text-foreground">crontab -e</code> →
          paste the line above →
          <code className="text-foreground"> crontab -l</code> to verify
        </p>
      </div>
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
