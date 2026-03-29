import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getStorageStats } from "@/lib/storage";

// GET /api/media/storage — Get storage usage stats
export async function GET(req: NextRequest) {
  const session = await auth();
  if (
    !session?.user ||
    !["APPROVER", "SUPER_ADMIN"].includes(session.user.role as string)
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const stats = await getStorageStats();
  return NextResponse.json(stats);
}
