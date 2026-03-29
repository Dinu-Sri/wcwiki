import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { reindexAll } from "@/lib/search/sync";

export async function POST() {
  const session = await auth();
  if (!session?.user || session.user.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    await reindexAll();
    return NextResponse.json({ success: true, message: "Reindex started" });
  } catch (error) {
    console.error("Reindex failed:", error);
    return NextResponse.json(
      { success: false, message: "Reindex failed" },
      { status: 500 }
    );
  }
}
