-- Add a private edit token to each profile without changing existing public slugs.
ALTER TABLE "Profile" ADD COLUMN "ownerToken" TEXT;

UPDATE "Profile"
SET "ownerToken" = md5(random()::text || clock_timestamp()::text || "id")
WHERE "ownerToken" IS NULL;

ALTER TABLE "Profile" ALTER COLUMN "ownerToken" SET NOT NULL;

CREATE UNIQUE INDEX "Profile_ownerToken_key" ON "Profile"("ownerToken");

-- Products belong to exactly one profile so each public shop is isolated by profileId.
CREATE TABLE "Product" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "price" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'FCFA',
    "imageUrl" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "Product_profileId_idx" ON "Product"("profileId");
CREATE INDEX "Product_isActive_idx" ON "Product"("isActive");
CREATE INDEX "Product_createdAt_idx" ON "Product"("createdAt");

ALTER TABLE "Product" ADD CONSTRAINT "Product_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
