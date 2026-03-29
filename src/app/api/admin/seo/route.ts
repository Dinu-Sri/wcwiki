import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

// GET /api/admin/seo — fetch current site settings
export async function GET() {
  const session = await auth();
  if (!session?.user || session.user.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let settings = await db.siteSettings.findUnique({
    where: { id: "default" },
  });

  if (!settings) {
    // Create default settings row
    settings = await db.siteSettings.create({
      data: { id: "default" },
    });
  }

  return NextResponse.json(settings);
}

// PUT /api/admin/seo — update site settings
export async function PUT(req: NextRequest) {
  const session = await auth();
  if (!session?.user || session.user.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();

  // Whitelist allowed fields to prevent injection
  const allowedFields = [
    "siteName",
    "siteDescription",
    "siteUrl",
    "logoUrl",
    "faviconUrl",
    "foundedYear",
    "founderName",
    "socialFacebook",
    "socialInstagram",
    "socialX",
    "socialYoutube",
    "socialPinterest",
    "socialLinkedin",
    "googleSiteVerification",
    "googleAnalyticsId",
    "googleTagManagerId",
    "bingSiteVerification",
    "pinterestVerification",
    "yandexVerification",
    "defaultOgImage",
    "robotsCustomRules",
  ];

  const data: Record<string, unknown> = {};
  for (const field of allowedFields) {
    if (field in body) {
      const value = body[field];
      // Validate types
      if (field === "foundedYear") {
        data[field] = value ? parseInt(value, 10) || null : null;
      } else {
        data[field] = typeof value === "string" ? value.trim() || null : null;
      }
    }
  }

  // Validate GA4 ID format if provided
  if (data.googleAnalyticsId && typeof data.googleAnalyticsId === "string") {
    if (!/^G-[A-Z0-9]+$/i.test(data.googleAnalyticsId)) {
      return NextResponse.json(
        { error: "Invalid GA4 measurement ID format (expected G-XXXXXXX)" },
        { status: 400 }
      );
    }
  }

  // Validate GTM ID format if provided
  if (data.googleTagManagerId && typeof data.googleTagManagerId === "string") {
    if (!/^GTM-[A-Z0-9]+$/i.test(data.googleTagManagerId)) {
      return NextResponse.json(
        { error: "Invalid GTM container ID format (expected GTM-XXXXXXX)" },
        { status: 400 }
      );
    }
  }

  const settings = await db.siteSettings.upsert({
    where: { id: "default" },
    create: { id: "default", ...data },
    update: data,
  });

  return NextResponse.json(settings);
}
