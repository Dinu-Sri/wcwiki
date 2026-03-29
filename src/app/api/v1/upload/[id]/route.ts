import { NextRequest, NextResponse } from "next/server";
import { requireApiKey } from "@/lib/api-auth";
import { deleteUpload } from "@/lib/storage";
import { db } from "@/lib/db";

// DELETE /api/v1/upload/[id] — Delete a media record and its file
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const result = await requireApiKey(req, "write");
  if (result instanceof NextResponse) return result;

  const { id } = await params;

  const media = await db.media.findUnique({ where: { id } });
  if (!media) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Delete file from storage
  await deleteUpload(media.url);

  // Delete DB record
  await db.media.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
