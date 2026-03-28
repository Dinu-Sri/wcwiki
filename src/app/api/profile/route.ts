import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

const ALLOWED_FIELDS = [
  "name",
  "bio",
  "website",
  "socialLinks",
  "country",
  "specializations",
  "mediaInterests",
  "watercolorStartYear",
  "portfolioImages",
  "image",
] as const;

// GET /api/profile — Get own profile
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
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

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  // Compute profile completeness
  const completeness = computeCompleteness(user);

  return NextResponse.json({ ...user, completeness });
}

// PATCH /api/profile — Update own profile
export async function PATCH(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();

  // Filter to allowed fields only
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data: Record<string, any> = {};
  for (const field of ALLOWED_FIELDS) {
    if (field in body) {
      data[field] = body[field];
    }
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: "No valid fields provided" }, { status: 400 });
  }

  // Validate types
  if (data.specializations && !Array.isArray(data.specializations)) {
    return NextResponse.json({ error: "specializations must be an array" }, { status: 400 });
  }
  if (data.mediaInterests && !Array.isArray(data.mediaInterests)) {
    return NextResponse.json({ error: "mediaInterests must be an array" }, { status: 400 });
  }
  if (data.portfolioImages && !Array.isArray(data.portfolioImages)) {
    return NextResponse.json({ error: "portfolioImages must be an array" }, { status: 400 });
  }
  if (data.watercolorStartYear !== undefined && data.watercolorStartYear !== null) {
    data.watercolorStartYear = parseInt(data.watercolorStartYear, 10);
    if (isNaN(data.watercolorStartYear)) {
      return NextResponse.json({ error: "watercolorStartYear must be a number" }, { status: 400 });
    }
  }

  const updated = await db.user.update({
    where: { id: session.user.id },
    data,
    select: {
      id: true,
      name: true,
      bio: true,
      website: true,
      socialLinks: true,
      country: true,
      specializations: true,
      mediaInterests: true,
      watercolorStartYear: true,
      portfolioImages: true,
      image: true,
    },
  });

  return NextResponse.json(updated);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function computeCompleteness(user: any): { score: number; missing: string[] } {
  const checks = [
    { field: "name", label: "Display name" },
    { field: "bio", label: "Bio" },
    { field: "country", label: "Country" },
    { field: "image", label: "Profile picture" },
    { field: "specializations", label: "Specializations", isArray: true },
    { field: "mediaInterests", label: "Media interests", isArray: true },
  ];

  const missing: string[] = [];
  let filled = 0;

  for (const check of checks) {
    const val = user[check.field];
    const isEmpty = check.isArray ? !val || val.length === 0 : !val;
    if (isEmpty) {
      missing.push(check.label);
    } else {
      filled++;
    }
  }

  return {
    score: Math.round((filled / checks.length) * 100),
    missing,
  };
}
