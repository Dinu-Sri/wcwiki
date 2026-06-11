-- AlterTable
ALTER TABLE "PaintingReference"
ADD COLUMN "shortCode" TEXT,
ADD COLUMN "country" TEXT,
ADD COLUMN "city" TEXT,
ADD COLUMN "takenAt" TIMESTAMP(3);

-- CreateIndex
CREATE UNIQUE INDEX "PaintingReference_shortCode_key" ON "PaintingReference"("shortCode");
