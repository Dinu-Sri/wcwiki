import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

// GET /api/admin/applications — List applications
export async function GET(request: NextRequest) {
  const session = await auth();
  if (
    !session?.user ||
    !["APPROVER", "SUPER_ADMIN"].includes(session.user.role as string)
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status") || "PENDING";

  const applications = await db.editorApplication.findMany({
    where: status === "all" ? {} : { status: status as "PENDING" | "APPROVED" | "REJECTED" },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          bio: true,
          country: true,
          specializations: true,
          mediaInterests: true,
          yearsOfExperience: true,
          createdAt: true,
        },
      },
      reviewedBy: {
        select: { name: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(applications);
}

// PATCH /api/admin/applications — Approve or reject
export async function PATCH(request: NextRequest) {
  const session = await auth();
  if (
    !session?.user ||
    !["APPROVER", "SUPER_ADMIN"].includes(session.user.role as string)
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { id, action, reviewNote } = body;

  if (!id || !["approve", "reject"].includes(action)) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const application = await db.editorApplication.findUnique({
    where: { id },
    include: { user: { select: { id: true, role: true } } },
  });

  if (!application) {
    return NextResponse.json({ error: "Application not found" }, { status: 404 });
  }

  if (application.status !== "PENDING") {
    return NextResponse.json(
      { error: "Application already reviewed" },
      { status: 400 }
    );
  }

  const newStatus = action === "approve" ? "APPROVED" : "REJECTED";

  // Update application
  const updated = await db.editorApplication.update({
    where: { id },
    data: {
      status: newStatus,
      reviewedById: session.user.id,
      reviewNote: reviewNote || null,
      reviewedAt: new Date(),
    },
  });

  // If approved, upgrade user role to EDITOR
  if (newStatus === "APPROVED") {
    await db.user.update({
      where: { id: application.userId },
      data: { role: "EDITOR" },
    });
  }

  return NextResponse.json(updated);
}
