import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { Prisma } from "@prisma/client";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (
    !session?.user ||
    !["EDITOR", "APPROVER", "SUPER_ADMIN"].includes(session.user.role as string)
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const subfolder = searchParams.get("subfolder");
  const search = searchParams.get("search");
  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = parseInt(searchParams.get("limit") || "24", 10);
  const sortBy = searchParams.get("sort") || "date"; // date | size | name
  const sortDir = searchParams.get("dir") || "desc"; // asc | desc

  const where: Prisma.MediaWhereInput = {};
  if (subfolder) where.subfolder = subfolder;
  if (search) {
    where.OR = [
      { filename: { contains: search, mode: "insensitive" } },
      { alt: { contains: search, mode: "insensitive" } },
    ];
  }

  const orderMap: Record<string, Prisma.MediaOrderByWithRelationInput> = {
    date: { createdAt: sortDir as Prisma.SortOrder },
    size: { size: sortDir as Prisma.SortOrder },
    name: { filename: sortDir as Prisma.SortOrder },
  };
  const orderBy = orderMap[sortBy] || orderMap.date;

  const [items, total, totalSize] = await Promise.all([
    db.media.findMany({
      where,
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
      include: {
        uploadedBy: { select: { id: true, name: true } },
      },
    }),
    db.media.count({ where }),
    db.media.aggregate({ _sum: { size: true } }),
  ]);

  return NextResponse.json({
    items,
    total,
    page,
    pages: Math.ceil(total / limit),
    totalStorageSize: totalSize._sum.size || 0,
  });
}
