import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { EntityType, TranslationStatus } from "@prisma/client";

// GET /api/admin/translations — list translations with filtering
export async function GET(req: NextRequest) {
  const session = await auth();
  if (
    !session?.user ||
    !["SUPER_ADMIN", "APPROVER"].includes(session.user.role)
  ) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const entityType = searchParams.get("entityType") as EntityType | null;
  const locale = searchParams.get("locale");
  const status = searchParams.get("status") as TranslationStatus | null;
  const entityId = searchParams.get("entityId");
  const page = parseInt(searchParams.get("page") || "1");
  const limit = Math.min(parseInt(searchParams.get("limit") || "50"), 100);

  const where: Record<string, unknown> = {};
  if (entityType && Object.values(EntityType).includes(entityType)) {
    where.entityType = entityType;
  }
  if (locale) where.locale = locale;
  if (status && Object.values(TranslationStatus).includes(status)) {
    where.status = status;
  }
  if (entityId) where.entityId = entityId;

  const [translations, total] = await Promise.all([
    db.translation.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    db.translation.count({ where }),
  ]);

  return NextResponse.json({
    translations,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  });
}

// POST /api/admin/translations — create or update a translation
export async function POST(req: NextRequest) {
  const session = await auth();
  if (
    !session?.user ||
    !["SUPER_ADMIN", "APPROVER", "EDITOR"].includes(session.user.role)
  ) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const { entityType, entityId, locale, field, value, machineSource } = body;

  // Validate required fields
  if (!entityType || !entityId || !locale || !field || value === undefined) {
    return NextResponse.json(
      { error: "Missing required fields: entityType, entityId, locale, field, value" },
      { status: 400 }
    );
  }

  // Validate entityType
  if (!Object.values(EntityType).includes(entityType)) {
    return NextResponse.json(
      { error: "Invalid entityType" },
      { status: 400 }
    );
  }

  // Validate locale format (2-letter code)
  if (!/^[a-z]{2}$/.test(locale)) {
    return NextResponse.json(
      { error: "Invalid locale format" },
      { status: 400 }
    );
  }

  // Validate field name (alphanumeric + underscores only)
  if (!/^[a-zA-Z_]+$/.test(field)) {
    return NextResponse.json(
      { error: "Invalid field name" },
      { status: 400 }
    );
  }

  const translation = await db.translation.upsert({
    where: {
      entityType_entityId_locale_field: {
        entityType,
        entityId,
        locale,
        field,
      },
    },
    update: {
      value,
      status: machineSource ? "MACHINE" : "IN_REVIEW",
      translatedById: machineSource ? null : session.user.id,
      machineSource: machineSource || null,
      reviewedById: null,
      reviewedAt: null,
    },
    create: {
      entityType,
      entityId,
      locale,
      field,
      value,
      status: machineSource ? "MACHINE" : "IN_REVIEW",
      translatedById: machineSource ? null : session.user.id,
      machineSource: machineSource || null,
    },
  });

  return NextResponse.json(translation);
}

// PUT /api/admin/translations — review/approve/reject a translation
export async function PUT(req: NextRequest) {
  const session = await auth();
  if (
    !session?.user ||
    !["SUPER_ADMIN", "APPROVER"].includes(session.user.role)
  ) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const { id, status, value } = body;

  if (!id || !status) {
    return NextResponse.json(
      { error: "Missing required fields: id, status" },
      { status: 400 }
    );
  }

  if (!Object.values(TranslationStatus).includes(status)) {
    return NextResponse.json(
      { error: "Invalid status" },
      { status: 400 }
    );
  }

  const updateData: Record<string, unknown> = {
    status,
    reviewedById: session.user.id,
    reviewedAt: new Date(),
  };

  // Allow updating value during review
  if (value !== undefined) {
    updateData.value = value;
  }

  const translation = await db.translation.update({
    where: { id },
    data: updateData,
  });

  return NextResponse.json(translation);
}
