-- Phase 4D changes the default ONLY for newly inserted products.
-- Existing Product.brand values are deliberately preserved for later review.
ALTER TABLE "Product" ALTER COLUMN "brand" SET DEFAULT 'KINGDROPP';
