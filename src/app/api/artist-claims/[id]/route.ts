import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

// PATCH /api/artist-claims/[id] — Approve or reject a claim
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (
    !session?.user ||
    !["APPROVER", "SUPER_ADMIN"].includes(session.user.role as string)
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const { status } = await req.json();

  if (!["APPROVED", "REJECTED"].includes(status)) {
    return NextResponse.json(
      { error: "Status must be APPROVED or REJECTED" },
      { status: 400 }
    );
  }

  const claim = await db.artistClaim.findUnique({
    where: { id },
    select: { id: true, artistId: true, userId: true, status: true },
  });

  if (!claim) {
    return NextResponse.json({ error: "Claim not found" }, { status: 404 });
  }

  if (claim.status !== "PENDING") {
    return NextResponse.json(
      { error: "Claim has already been reviewed" },
      { status: 400 }
    );
  }

  // Update claim status
  await db.artistClaim.update({
    where: { id },
    data: { status },
  });

  // If approved, connect the user to the artist
  if (status === "APPROVED") {
    await db.artist.update({
      where: { id: claim.artistId },
      data: { connectedUserId: claim.userId },
    });

    // Also update user flags
    await db.user.update({
      where: { id: claim.userId },
      data: { isArtist: true, artistVerified: true },
    });
  }

  return NextResponse.json({ success: true });
}
