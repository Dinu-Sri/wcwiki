import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireApiKey } from "@/lib/api-auth";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/v1/translations/[id] — Get single translation
export async function GET(req: NextRequest, { params }: RouteParams) {
  const result = await requireApiKey(req, "read");
  if (result instanceof NextResponse) return result;

  const { id } = await params;

  const translation = await db.translation.findUnique({
    where: { id },
    include: {
      translatedBy: { select: { id: true, name: true } },
      reviewedBy: { select: { id: true, name: true } },
    },
  });

  if (!translation) {
    return NextResponse.json({ error: "Translation not found" }, { status: 404 });
  }

  return NextResponse.json({ data: translation });
}

// PATCH /api/v1/translations/[id] — Update translation
export async function PATCH(req: NextRequest, { params }: RouteParams) {
  const result = await requireApiKey(req, "write");
  if (result instanceof NextResponse) return result;

  const { id } = await params;
  const body = await req.json();
  const { value, status } = body as { value?: string; status?: string };

  const existing = await db.translation.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Translation not found" }, { status: 404 });
  }

  const updateData: Record<string, unknown> = {};
  if (typeof value === "string") updateData.value = value;
  if (status && ["MACHINE", "IN_REVIEW", "APPROVED", "REJECTED"].includes(status)) {
    updateData.status = status;
    if (status === "APPROVED" || status === "REJECTED") {
      updateData.reviewedAt = new Date();
    }
  }

  if (Object.keys(updateData).length === 0) {
    return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
  }

  const updated = await db.translation.update({
    where: { id },
    data: updateData,
  });

  return NextResponse.json({ data: updated });
}

// DELETE /api/v1/translations/[id] — Delete translation
export async function DELETE(req: NextRequest, { params }: RouteParams) {
  const result = await requireApiKey(req, "delete");
  if (result instanceof NextResponse) return result;

  const { id } = await params;

  const existing = await db.translation.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Translation not found" }, { status: 404 });
  }

  await db.translation.delete({ where: { id } });

  return NextResponse.json({ data: { deleted: true } });
}
