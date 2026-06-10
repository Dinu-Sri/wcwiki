import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(req: NextRequest, { params }: RouteParams) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  const { id } = await params;
  const reference = await db.paintingReference.findFirst({
    where: { id, status: "APPROVED" },
    select: { id: true },
  });

  if (!reference) {
    return NextResponse.json({ error: "Reference not found" }, { status: 404 });
  }

  const existing = await db.referenceSave.findUnique({
    where: { userId_referenceId: { userId: session.user.id, referenceId: id } },
  });

  if (!existing) {
    await db.$transaction([
      db.referenceSave.create({
        data: { userId: session.user.id, referenceId: id },
      }),
      db.paintingReference.update({
        where: { id },
        data: { saveCount: { increment: 1 } },
      }),
    ]);
  }

  return NextResponse.json({ saved: true });
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  const { id } = await params;
  const existing = await db.referenceSave.findUnique({
    where: { userId_referenceId: { userId: session.user.id, referenceId: id } },
  });

  if (existing) {
    await db.$transaction([
      db.referenceSave.delete({ where: { id: existing.id } }),
      db.paintingReference.update({
        where: { id },
        data: { saveCount: { decrement: 1 } },
      }),
    ]);
  }

  return NextResponse.json({ saved: false });
}
