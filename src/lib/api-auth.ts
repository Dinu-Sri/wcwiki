import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";

export interface ApiKeyUser {
  id: string;
  keyId: string;
  permissions: string[];
}

/**
 * Validate an API key from the Authorization header.
 * Returns the API key record or null.
 */
export async function validateApiKey(
  req: NextRequest
): Promise<ApiKeyUser | null> {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;

  const token = authHeader.slice(7);
  if (!token.startsWith("wk_")) return null;

  const prefix = token.slice(0, 11); // "wk_" + first 8 chars

  // Find candidates by prefix
  const candidates = await db.apiKey.findMany({
    where: {
      keyPrefix: prefix,
      enabled: true,
    },
  });

  for (const key of candidates) {
    // Check expiry
    if (key.expiresAt && key.expiresAt < new Date()) continue;

    const valid = await bcrypt.compare(token, key.keyHash);
    if (valid) {
      // Update last used
      await db.apiKey.update({
        where: { id: key.id },
        data: { lastUsedAt: new Date() },
      }).catch(() => {});

      return {
        id: key.userId,
        keyId: key.id,
        permissions: key.permissions,
      };
    }
  }

  return null;
}

/**
 * Middleware helper: require API key with specific permission.
 */
export async function requireApiKey(
  req: NextRequest,
  permission: string
): Promise<ApiKeyUser | NextResponse> {
  const apiUser = await validateApiKey(req);
  if (!apiUser) {
    return NextResponse.json(
      { error: "Invalid or missing API key" },
      { status: 401 }
    );
  }
  if (!apiUser.permissions.includes(permission)) {
    return NextResponse.json(
      { error: `Missing permission: ${permission}` },
      { status: 403 }
    );
  }
  return apiUser;
}
