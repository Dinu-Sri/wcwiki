import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { canViewProfile } from "@/lib/permissions";

// GET /api/profile/[id] — View another user's profile
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const target = await db.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      image: true,
      role: true,
      bio: true,
      website: true,
      socialLinks: true,
      country: true,
      specializations: true,
      mediaInterests: true,
      watercolorStartYear: true,
      portfolioImages: true,
      isArtist: true,
      artistVerified: true,
      createdAt: true,
    },
  });

  if (!target) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  // Own profile — always allowed
  if (target.id === session.user.id) {
    return NextResponse.json(target);
  }

  // Check role-based visibility
  const viewerRole = session.user.role as string;
  if (!canViewProfile(viewerRole, target.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return NextResponse.json(target);
}
