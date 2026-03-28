import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";
import crypto from "crypto";

// GET — List all API keys (SUPER_ADMIN only)
export async function GET() {
  const session = await auth();
  if (!session?.user || session.user.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const keys = await db.apiKey.findMany({
    orderBy: { createdAt: "desc" },
    include: { user: { select: { id: true, name: true, email: true } } },
  });

  return NextResponse.json(
    keys.map((k) => ({
      id: k.id,
      name: k.name,
      keyPrefix: k.keyPrefix,
      permissions: k.permissions,
      enabled: k.enabled,
      expiresAt: k.expiresAt,
      lastUsedAt: k.lastUsedAt,
      createdAt: k.createdAt,
      user: k.user,
    }))
  );
}

// POST — Create a new API key (SUPER_ADMIN only)
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user || session.user.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { name, permissions, expiresAt } = body;

  if (!name || typeof name !== "string") {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }

  const validPerms = ["read", "write", "delete"];
  const perms = Array.isArray(permissions)
    ? permissions.filter((p: string) => validPerms.includes(p))
    : ["read"];

  // Generate token: wk_ + 40 random hex chars
  const random = crypto.randomBytes(20).toString("hex");
  const token = `wk_${random}`;
  const keyPrefix = token.slice(0, 11);
  const keyHash = await bcrypt.hash(token, 10);

  const apiKey = await db.apiKey.create({
    data: {
      name,
      keyHash,
      keyPrefix,
      permissions: perms,
      enabled: true,
      expiresAt: expiresAt ? new Date(expiresAt) : null,
      userId: session.user.id,
    },
  });

  // Return the full token ONLY on creation (never shown again)
  return NextResponse.json({
    id: apiKey.id,
    name: apiKey.name,
    token, // Only returned once
    keyPrefix,
    permissions: apiKey.permissions,
    enabled: apiKey.enabled,
    expiresAt: apiKey.expiresAt,
    createdAt: apiKey.createdAt,
  });
}
