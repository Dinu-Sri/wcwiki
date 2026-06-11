import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { type AppLogLevel, readAppLogs } from "@/lib/app-logger";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const LOG_LEVELS = new Set<AppLogLevel>(["debug", "info", "warn", "error"]);

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user || session.user.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const limit = Number.parseInt(req.nextUrl.searchParams.get("limit") || "100", 10);
  const requestedLevel = req.nextUrl.searchParams.get("level") as AppLogLevel | null;
  const level = requestedLevel && LOG_LEVELS.has(requestedLevel) ? requestedLevel : undefined;
  const source = req.nextUrl.searchParams.get("source") || undefined;

  const logs = await readAppLogs({ limit, level, source });
  return NextResponse.json({ data: logs });
}
