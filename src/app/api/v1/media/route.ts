import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireApiKey } from "@/lib/api-auth";

// GET /api/v1/media — List media
export async function GET(req: NextRequest) {
  const result = await requireApiKey(req, "read");
  if (result instanceof NextResponse) return result;

  const { searchParams } = new URL(req.url);
  const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 100);
  const offset = parseInt(searchParams.get("offset") || "0");
  const subfolder = searchParams.get("subfolder");

  const where: Record<string, unknown> = {};
  if (subfolder) where.subfolder = subfolder;

  const [items, total] = await Promise.all([
    db.media.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: offset,
      take: limit,
    }),
    db.media.count({ where }),
  ]);

  return NextResponse.json({ data: items, total, limit, offset });
}
