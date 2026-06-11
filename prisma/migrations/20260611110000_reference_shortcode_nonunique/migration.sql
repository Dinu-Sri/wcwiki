-- Keep short reference URLs indexed without forcing production db push to accept
-- Prisma's unique-constraint warning on an existing unbaselined database.
DROP INDEX IF EXISTS "PaintingReference_shortCode_key";

CREATE INDEX IF NOT EXISTS "PaintingReference_shortCode_idx"
ON "PaintingReference"("shortCode");
