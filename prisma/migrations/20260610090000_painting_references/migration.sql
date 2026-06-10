-- CreateEnum
CREATE TYPE "ReferenceStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateTable
CREATE TABLE "ReferenceCategory" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "imageUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ReferenceCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PaintingReference" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "categoryId" TEXT,
    "tags" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    "previewUrl" TEXT NOT NULL,
    "thumbnailUrl" TEXT NOT NULL,
    "fullImageUrl" TEXT,
    "width" INTEGER,
    "height" INTEGER,
    "size" INTEGER,
    "format" TEXT,
    "license" TEXT NOT NULL DEFAULT 'CC_BY_4_0',
    "attributionName" TEXT,
    "attributionUrl" TEXT,
    "status" "ReferenceStatus" NOT NULL DEFAULT 'PENDING',
    "rejectionReason" TEXT,
    "submittedById" TEXT NOT NULL,
    "reviewedById" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "downloadCount" INTEGER NOT NULL DEFAULT 0,
    "saveCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PaintingReference_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReferenceSave" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "referenceId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReferenceSave_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ReferenceCategory_slug_key" ON "ReferenceCategory"("slug");

-- CreateIndex
CREATE INDEX "ReferenceCategory_name_idx" ON "ReferenceCategory"("name");

-- CreateIndex
CREATE UNIQUE INDEX "PaintingReference_slug_key" ON "PaintingReference"("slug");

-- CreateIndex
CREATE INDEX "PaintingReference_status_idx" ON "PaintingReference"("status");

-- CreateIndex
CREATE INDEX "PaintingReference_categoryId_idx" ON "PaintingReference"("categoryId");

-- CreateIndex
CREATE INDEX "PaintingReference_submittedById_idx" ON "PaintingReference"("submittedById");

-- CreateIndex
CREATE INDEX "PaintingReference_createdAt_idx" ON "PaintingReference"("createdAt");

-- CreateIndex
CREATE INDEX "PaintingReference_status_createdAt_idx" ON "PaintingReference"("status", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "ReferenceSave_userId_referenceId_key" ON "ReferenceSave"("userId", "referenceId");

-- CreateIndex
CREATE INDEX "ReferenceSave_userId_idx" ON "ReferenceSave"("userId");

-- CreateIndex
CREATE INDEX "ReferenceSave_referenceId_idx" ON "ReferenceSave"("referenceId");

-- AddForeignKey
ALTER TABLE "PaintingReference" ADD CONSTRAINT "PaintingReference_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "ReferenceCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaintingReference" ADD CONSTRAINT "PaintingReference_submittedById_fkey" FOREIGN KEY ("submittedById") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaintingReference" ADD CONSTRAINT "PaintingReference_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReferenceSave" ADD CONSTRAINT "ReferenceSave_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReferenceSave" ADD CONSTRAINT "ReferenceSave_referenceId_fkey" FOREIGN KEY ("referenceId") REFERENCES "PaintingReference"("id") ON DELETE CASCADE ON UPDATE CASCADE;
