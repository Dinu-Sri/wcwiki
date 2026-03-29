import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { SuggestionType, EntityType } from "@prisma/client";

const ROLE_LEVEL: Record<string, number> = { USER: 0, EDITOR: 1, APPROVER: 2, SUPER_ADMIN: 3 };

// POST /api/suggestions — Create a suggestion (any logged-in user)
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  const body = await req.json();
  const { type, topic, details, entityType, entityId, targetLocale, language } = body as {
    type: string;
    topic?: string;
    details?: string;
    entityType?: string;
    entityId?: string;
    targetLocale?: string;
    language?: string;
  };

  // Validate type
  if (!type || !["NEW_ARTICLE", "TRANSLATE_ARTICLE", "TRANSLATE_ARTIST"].includes(type)) {
    return NextResponse.json({ error: "Invalid suggestion type" }, { status: 400 });
  }

  // Validate type-specific fields
  if (type === "NEW_ARTICLE") {
    if (!topic?.trim()) {
      return NextResponse.json({ error: "Topic is required for article suggestions" }, { status: 400 });
    }
  } else {
    // Translation request
    if (!entityType || !entityId || !targetLocale) {
      return NextResponse.json({ error: "Entity type, entity ID, and target locale are required for translation requests" }, { status: 400 });
    }
    if (!["ARTICLE", "ARTIST"].includes(entityType)) {
      return NextResponse.json({ error: "Invalid entity type" }, { status: 400 });
    }
  }

  const suggestion = await db.suggestion.create({
    data: {
      type: type as SuggestionType,
      topic: topic?.trim() || null,
      details: details?.trim() || null,
      language: language || null,
      entityType: entityType ? (entityType as EntityType) : null,
      entityId: entityId || null,
      targetLocale: targetLocale || null,
      requestedById: session.user.id,
    },
  });

  return NextResponse.json({ data: suggestion }, { status: 201 });
}

// GET /api/suggestions — List suggestions
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  const { searchParams } = req.nextUrl;
  const mine = searchParams.get("mine") === "true";
  const status = searchParams.get("status");
  const type = searchParams.get("type");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = {};

  if (mine) {
    where.requestedById = session.user.id;
  } else {
    // Non-mine: only EDITOR+ can see all suggestions
    const level = ROLE_LEVEL[session.user.role as string] || 0;
    if (level < 1) {
      return NextResponse.json({ error: "Editor access required" }, { status: 403 });
    }
  }

  if (status) where.status = status;
  if (type) where.type = type;

  const suggestions = await db.suggestion.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 100,
    include: {
      requestedBy: { select: { id: true, name: true, image: true } },
      claimedBy: { select: { id: true, name: true } },
    },
  });

  return NextResponse.json({ data: suggestions });
}
