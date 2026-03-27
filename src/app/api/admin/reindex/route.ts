import { NextResponse } from "next/server";
import { reindexAll } from "@/lib/search/sync";

export async function POST() {
  // TODO: Add admin auth check via NextAuth session
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
