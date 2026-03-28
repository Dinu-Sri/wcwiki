import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

// GET /api/editor-application — Get own application status
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const application = await db.editorApplication.findFirst({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      status: true,
      message: true,
      reviewNote: true,
      createdAt: true,
      reviewedAt: true,
    },
  });

  return NextResponse.json({ application });
}

// POST /api/editor-application — Submit an application
export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Only USERs can apply
  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: {
      role: true,
      name: true,
      bio: true,
      country: true,
      image: true,
      specializations: true,
      mediaInterests: true,
    },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  if (user.role !== "USER") {
    return NextResponse.json(
      { error: "Only users with USER role can apply for editor" },
      { status: 400 }
    );
  }

  // Check profile completeness
  const missing: string[] = [];
  if (!user.name) missing.push("Display name");
  if (!user.bio) missing.push("Bio");
  if (!user.country) missing.push("Country");
  if (!user.specializations?.length) missing.push("Specializations");

  if (missing.length > 0) {
    return NextResponse.json(
      {
        error: "Profile incomplete",
        missing,
        message: `Please complete your profile before applying. Missing: ${missing.join(", ")}`,
      },
      { status: 400 }
    );
  }

  // Check for existing pending application
  const existing = await db.editorApplication.findFirst({
    where: { userId: session.user.id, status: "PENDING" },
  });

  if (existing) {
    return NextResponse.json(
      { error: "You already have a pending application" },
      { status: 409 }
    );
  }

  const body = await request.json();

  const application = await db.editorApplication.create({
    data: {
      userId: session.user.id,
      message: body.message || "",
    },
    select: {
      id: true,
      status: true,
      message: true,
      createdAt: true,
    },
  });

  return NextResponse.json(application, { status: 201 });
}
