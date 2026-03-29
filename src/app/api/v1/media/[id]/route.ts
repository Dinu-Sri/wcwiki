import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireApiKey } from "@/lib/api-auth";
import { deleteUpload } from "@/lib/storage";

// DELETE /api/v1/media/[id] — Delete media file and record
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const result = await requireApiKey(req, "delete");
  if (result instanceof NextResponse) return result;

  const { id } = await params;

  const media = await db.media.findUnique({ where: { id } });
  if (!media) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Delete file from storage
  try {
    await deleteUpload(media.url);
  } catch (err) {
    console.error("Failed to delete file from storage:", err);
  }

  // Delete DB record
  await db.media.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
