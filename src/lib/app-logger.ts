import { createHash } from "crypto";
import fs from "fs/promises";
import path from "path";

export type AppLogLevel = "debug" | "info" | "warn" | "error";

export type AppLogEntry = {
  time: string;
  level: AppLogLevel;
  source: string;
  message: string;
  userHash?: string;
  metadata?: unknown;
};

type LogInput = {
  level: AppLogLevel;
  source: string;
  message: string;
  userId?: string | null;
  metadata?: unknown;
};

type ReadLogsOptions = {
  limit?: number;
  level?: AppLogLevel;
  source?: string;
};

const LOG_FILE_PREFIX = "app-";
const LOG_FILE_SUFFIX = ".jsonl";
const MAX_METADATA_LENGTH = 4000;
const MAX_LOG_FILES_TO_READ = 14;

function getLogDir() {
  return process.env.APP_LOG_DIR || path.join(process.env.UPLOAD_DIR || "./uploads", "logs");
}

function getLogFilePath(date = new Date()) {
  return path.join(getLogDir(), `${LOG_FILE_PREFIX}${date.toISOString().slice(0, 10)}${LOG_FILE_SUFFIX}`);
}

function hashUserId(userId: string) {
  return createHash("sha256").update(userId).digest("hex").slice(0, 16);
}

function redactString(value: string) {
  let redacted = value;
  if (process.env.OPENAI_API_KEY) {
    redacted = redacted.split(process.env.OPENAI_API_KEY).join("[redacted-openai-key]");
  }
  return redacted
    .replace(/sk-[A-Za-z0-9_-]{12,}/g, "[redacted-openai-key]")
    .replace(/Bearer\s+[A-Za-z0-9._-]+/gi, "Bearer [redacted]");
}

function redactValue(value: unknown, depth = 0): unknown {
  if (depth > 4) return "[max-depth]";
  if (value instanceof Error) {
    return {
      name: value.name,
      message: redactString(value.message),
      stack: value.stack ? redactString(value.stack).slice(0, 1200) : undefined,
    };
  }
  if (typeof value === "string") return redactString(value);
  if (typeof value === "number" || typeof value === "boolean" || value === null) return value;
  if (Array.isArray(value)) return value.slice(0, 30).map((item) => redactValue(item, depth + 1));
  if (typeof value !== "object") return String(value);

  const output: Record<string, unknown> = {};
  for (const [key, item] of Object.entries(value as Record<string, unknown>).slice(0, 40)) {
    if (/authorization|password|secret|token|api[_-]?key/i.test(key)) {
      output[key] = "[redacted]";
    } else {
      output[key] = redactValue(item, depth + 1);
    }
  }
  return output;
}

function compactMetadata(metadata: unknown) {
  if (metadata === undefined) return undefined;
  const redacted = redactValue(metadata);
  const serialized = JSON.stringify(redacted);
  if (serialized.length <= MAX_METADATA_LENGTH) return redacted;
  return {
    truncated: true,
    preview: serialized.slice(0, MAX_METADATA_LENGTH),
  };
}

export async function logAppEvent(input: LogInput) {
  try {
    const entry: AppLogEntry = {
      time: new Date().toISOString(),
      level: input.level,
      source: input.source.slice(0, 120),
      message: redactString(input.message).slice(0, 500),
      userHash: input.userId ? hashUserId(input.userId) : undefined,
      metadata: compactMetadata(input.metadata),
    };

    await fs.mkdir(getLogDir(), { recursive: true });
    await fs.appendFile(getLogFilePath(), `${JSON.stringify(entry)}\n`, "utf8");
  } catch {
    // Logging must never break the user-facing request.
  }
}

export async function readAppLogs(options: ReadLogsOptions = {}) {
  const limit = Math.min(Math.max(options.limit || 100, 1), 500);
  const source = options.source?.trim().toLowerCase();
  const level = options.level;
  const logs: AppLogEntry[] = [];

  let files: string[] = [];
  try {
    files = (await fs.readdir(getLogDir()))
      .filter((file) => file.startsWith(LOG_FILE_PREFIX) && file.endsWith(LOG_FILE_SUFFIX))
      .sort()
      .reverse()
      .slice(0, MAX_LOG_FILES_TO_READ);
  } catch {
    return [];
  }

  for (const file of files) {
    const raw = await fs.readFile(path.join(getLogDir(), file), "utf8");
    const lines = raw.split("\n").filter(Boolean).reverse();

    for (const line of lines) {
      try {
        const entry = JSON.parse(line) as AppLogEntry;
        if (level && entry.level !== level) continue;
        if (source && !entry.source.toLowerCase().includes(source)) continue;
        logs.push(entry);
        if (logs.length >= limit) return logs;
      } catch {
        // Skip malformed partial lines.
      }
    }
  }

  return logs;
}
