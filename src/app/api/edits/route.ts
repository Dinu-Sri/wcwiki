import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

// Submit an edit proposal
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Only EDITOR+ can submit edits
  const allowedRoles = ["EDITOR", "APPROVER", "SUPER_ADMIN"];
  if (!allowedRoles.includes(session.user.role as string)) {
    return NextResponse.json(
      { error: "You need EDITOR role or above to submit edits" },
      { status: 403 }
    );
  }

  const { entityType, entityId, edits } = await req.json();

  if (!entityType || !entityId || !edits || !Array.isArray(edits)) {
    return NextResponse.json(
      { error: "entityType, entityId, and edits[] are required" },
      { status: 400 }
    );
  }

  const validTypes = ["ARTIST", "PAINTING", "ARTICLE"];
  if (!validTypes.includes(entityType)) {
    return NextResponse.json({ error: "Invalid entityType" }, { status: 400 });
  }

  // APPROVER and SUPER_ADMIN edits are auto-approved
  const autoApprove =
    session.user.role === "APPROVER" || session.user.role === "SUPER_ADMIN";

  const created = [];

  for (const edit of edits) {
    if (!edit.field) continue;
    // Skip if no actual change
    if (edit.oldValue === edit.newValue) continue;

    const record = await db.editHistory.create({
      data: {
        entityType,
        entityId,
        field: edit.field,
        oldValue: edit.oldValue ?? null,
        newValue: edit.newValue ?? null,
        status: autoApprove ? "APPROVED" : "PENDING",
        userId: session.user.id,
        ...(autoApprove
          ? { reviewedById: session.user.id, reviewedAt: new Date() }
          : {}),
      },
    });

    // If auto-approved, apply immediately
    if (autoApprove) {
      const updateData: Record<string, string | null> = {
        [edit.field]: edit.newValue,
      };

      switch (entityType) {
        case "ARTIST":
          await db.artist.update({
            where: { id: entityId },
            data: updateData,
          });
          break;
        case "PAINTING":
          await db.painting.update({
            where: { id: entityId },
            data: updateData,
          });
          break;
        case "ARTICLE":
          await db.article.update({
            where: { id: entityId },
            data: updateData,
          });
          break;
      }
    }

    created.push(record);
  }

  return NextResponse.json(
    {
      submitted: created.length,
      autoApproved: autoApprove,
      edits: created,
    },
    { status: 201 }
  );
}

// Get edit history for an entity
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const entityType = searchParams.get("entityType");
  const entityId = searchParams.get("entityId");

  if (!entityType || !entityId) {
    return NextResponse.json(
      { error: "entityType and entityId are required" },
      { status: 400 }
    );
  }

  const history = await db.editHistory.findMany({
    where: { entityType: entityType as any, entityId },
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { id: true, name: true, image: true } },
      reviewedBy: { select: { id: true, name: true } },
    },
  });

  return NextResponse.json(history);
}
