import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

interface RouteParams {
  params: Promise<{ id: string }>;
}

function isApprover(role?: string | null) {
  return role === "SUPER_ADMIN" || role === "APPROVER";
}

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  const session = await auth();
  if (!session?.user?.id || !isApprover(session.user.role as string)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const body = await req.json();
  const action = typeof body.action === "string" ? body.action : "";

  const reference = await db.paintingReference.findUnique({ where: { id } });
  if (!reference) {
    return NextResponse.json({ error: "Reference not found" }, { status: 404 });
  }

  if (action === "approve") {
    const updated = await db.paintingReference.update({
      where: { id },
      data: {
        status: "APPROVED",
        rejectionReason: null,
        reviewedById: session.user.id,
        reviewedAt: new Date(),
      },
    });

    return NextResponse.json({ data: updated });
  }

  if (action === "reject") {
    const reason =
      typeof body.reason === "string" && body.reason.trim()
        ? body.reason.trim().slice(0, 1000)
        : "This reference was not approved.";

    const updated = await db.paintingReference.update({
      where: { id },
      data: {
        status: "REJECTED",
        rejectionReason: reason,
        reviewedById: session.user.id,
        reviewedAt: new Date(),
      },
    });

    return NextResponse.json({ data: updated });
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}
