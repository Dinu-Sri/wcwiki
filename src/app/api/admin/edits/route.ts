import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  if (
    !session?.user ||
    (session.user.role !== "SUPER_ADMIN" && session.user.role !== "APPROVER")
  ) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const edits = await db.editHistory.findMany({
    where: { status: "PENDING" },
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { id: true, name: true, email: true, image: true } },
    },
  });

  return NextResponse.json(edits);
}

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (
    !session?.user ||
    (session.user.role !== "SUPER_ADMIN" && session.user.role !== "APPROVER")
  ) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { editId, action } = await req.json();

  if (!editId || !action) {
    return NextResponse.json(
      { error: "editId and action are required" },
      { status: 400 }
    );
  }

  if (action !== "APPROVED" && action !== "REJECTED") {
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }

  const edit = await db.editHistory.findUnique({ where: { id: editId } });
  if (!edit || edit.status !== "PENDING") {
    return NextResponse.json(
      { error: "Edit not found or already processed" },
      { status: 404 }
    );
  }

  // If approved, apply the change to the entity
  if (action === "APPROVED") {
    const updateData: Record<string, string | null> = {
      [edit.field]: edit.newValue,
    };

    switch (edit.entityType) {
      case "ARTIST":
        await db.artist.update({
          where: { id: edit.entityId },
          data: updateData,
        });
        break;
      case "PAINTING":
        await db.painting.update({
          where: { id: edit.entityId },
          data: updateData,
        });
        break;
      case "ARTICLE":
        await db.article.update({
          where: { id: edit.entityId },
          data: updateData,
        });
        break;
    }
  }

  const updated = await db.editHistory.update({
    where: { id: editId },
    data: {
      status: action,
      reviewedById: session.user.id,
      reviewedAt: new Date(),
    },
  });

  return NextResponse.json(updated);
}
