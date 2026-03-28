import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

// POST /api/artist-claims — Submit a claim
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { artistId, message } = await req.json();

  if (!artistId || !message?.trim()) {
    return NextResponse.json(
      { error: "artistId and message are required" },
      { status: 400 }
    );
  }

  // Verify the artist exists and is claimable
  const artist = await db.artist.findUnique({
    where: { id: artistId },
    select: { id: true, deathYear: true, connectedUserId: true },
  });

  if (!artist) {
    return NextResponse.json({ error: "Artist not found" }, { status: 404 });
  }

  if (artist.deathYear) {
    return NextResponse.json(
      { error: "Historical artist pages cannot be claimed" },
      { status: 400 }
    );
  }

  if (artist.connectedUserId) {
    return NextResponse.json(
      { error: "This artist page is already claimed" },
      { status: 400 }
    );
  }

  // Check for existing claim by this user
  const existing = await db.artistClaim.findUnique({
    where: { artistId_userId: { artistId, userId: session.user.id } },
  });

  if (existing) {
    return NextResponse.json(
      { error: "You have already submitted a claim for this artist" },
      { status: 400 }
    );
  }

  const claim = await db.artistClaim.create({
    data: {
      artistId,
      userId: session.user.id,
      message: message.trim(),
    },
  });

  return NextResponse.json(claim, { status: 201 });
}

// GET /api/artist-claims — List claims (admin only)
export async function GET() {
  const session = await auth();
  if (
    !session?.user ||
    !["APPROVER", "SUPER_ADMIN"].includes(session.user.role as string)
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const claims = await db.artistClaim.findMany({
    include: {
      artist: { select: { name: true, slug: true } },
      user: { select: { name: true, email: true, image: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(claims);
}
