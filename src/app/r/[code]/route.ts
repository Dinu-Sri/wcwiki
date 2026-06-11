import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

interface RouteParams {
  params: Promise<{ code: string }>;
}

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest, { params }: RouteParams) {
  const { code } = await params;
  const safeCode = code.trim();

  if (!/^[A-Za-z0-9]{4,16}$/.test(safeCode)) {
    return NextResponse.redirect(new URL("/painting-references", req.url), 308);
  }

  const reference = await db.paintingReference.findFirst({
    where: {
      status: "APPROVED",
      OR: [
        { shortCode: safeCode },
        { id: { startsWith: safeCode } },
      ],
    },
    select: { slug: true },
  });

  if (!reference) {
    return NextResponse.redirect(new URL("/painting-references", req.url), 308);
  }

  return NextResponse.redirect(
    new URL(`/painting-references/${reference.slug}`, req.url),
    308
  );
}
