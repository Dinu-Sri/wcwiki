import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const [artists, paintings, articles] = await Promise.all([
      db.artist.count(),
      db.painting.count(),
      db.article.count({ where: { status: "APPROVED" } }),
    ]);

    return NextResponse.json({ artists, paintings, articles });
  } catch {
    return NextResponse.json({ artists: 0, paintings: 0, articles: 0 });
  }
}
