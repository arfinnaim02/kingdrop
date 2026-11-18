-- KINGDROPP additive schema reconciliation.
-- Review against the production branch and take a Neon restore point before deploying.
-- Do NOT use migrate reset or db push --force-reset.
-- This migration tolerates fields created by earlier emergency SQL fixes.
-- No tables, columns, rows or existing passwords are dropped.

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname='OAuthProvider' AND typnamespace='public'::regnamespace) THEN
    CREATE TYPE "public"."OAuthProvider" AS ENUM ('GOOGLE','FACEBOOK');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname='SizeChartUnit' AND typnamespace='public'::regnamespace) THEN
    CREATE TYPE "public"."SizeChartUnit" AS ENUM ('IN','CM','NONE');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname='NotificationChannel' AND typnamespace='public'::regnamespace) THEN
    CREATE TYPE "public"."NotificationChannel" AS ENUM ('EMAIL','SMS');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname='NotificationStatus' AND typnamespace='public'::regnamespace) THEN
    CREATE TYPE "public"."NotificationStatus" AS ENUM ('PENDING','PROCESSING','SENT','FAILED','SKIPPED');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname='NotificationEvent' AND typnamespace='public'::regnamespace) THEN
    CREATE TYPE "public"."NotificationEvent" AS ENUM (
      'ACCOUNT_CREATED','PASSWORD_RESET','ORDER_PLACED','ORDER_CONFIRMED',
      'ORDER_READY_TO_SHIP','ORDER_SHIPPED','ORDER_DELIVERED','ORDER_CANCELLED',
      'ORDER_FAILED_DELIVERY','PAYMENT_SUCCEEDED','PAYMENT_FAILED',
      'RETURN_REQUESTED','RETURN_APPROVED','RETURN_COMPLETED'
    );
  END IF;
END $$;

ALTER TABLE "public"."User" ALTER COLUMN "passwordHash" DROP NOT NULL;

-- PasswordResetToken.tokenHash in the original migration is now mapped to
-- database column "token" by Prisma's @map("token"). Preserve hashed values.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='PasswordResetToken' AND column_name='tokenHash'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='PasswordResetToken' AND column_name='token'
  ) THEN
    ALTER TABLE "public"."PasswordResetToken" RENAME COLUMN "tokenHash" TO "token";
  ELSIF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='PasswordResetToken' AND column_name='tokenHash'
  ) AND EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='PasswordResetToken' AND column_name='token'
  ) THEN
    RAISE EXCEPTION 'PasswordResetToken has both tokenHash and token; manual reconciliation required';
  END IF;
END $$;
ALTER TABLE "public"."PasswordResetToken" ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE "public"."Product" ADD COLUMN IF NOT EXISTS "sizeChartId" TEXT;
ALTER TABLE "public"."Product" ALTER COLUMN "brand" SET DEFAULT 'KINGDROPP';
ALTER TABLE "public"."ProductImage" ADD COLUMN IF NOT EXISTS "publicId" TEXT;
ALTER TABLE "public"."ProductVariant" ADD COLUMN IF NOT EXISTS "colorHex" TEXT;
ALTER TABLE "public"."Order" ADD COLUMN IF NOT EXISTS "telegramChatId" TEXT;
ALTER TABLE "public"."Order" ADD COLUMN IF NOT EXISTS "telegramMessageId" INTEGER;
ALTER TABLE "public"."CourierShipment" ADD COLUMN IF NOT EXISTS "codAmount" DECIMAL(12,2);
ALTER TABLE "public"."CourierShipment" ADD COLUMN IF NOT EXISTS "lastSyncedAt" TIMESTAMP(3);
ALTER TABLE "public"."CourierShipment" ADD COLUMN IF NOT EXISTS "trackingUrl" TEXT;
ALTER TABLE "public"."HomepageSection" ADD COLUMN IF NOT EXISTS "imagePublicId" TEXT;
ALTER TABLE "public"."HomepageSection" ADD COLUMN IF NOT EXISTS "mobileImage" TEXT;
ALTER TABLE "public"."HomepageSection" ADD COLUMN IF NOT EXISTS "mobileImagePublicId" TEXT;
ALTER TABLE "public"."HeroSlide" ADD COLUMN IF NOT EXISTS "imagePublicId" TEXT;
ALTER TABLE "public"."HeroSlide" ADD COLUMN IF NOT EXISTS "mobileImage" TEXT;
ALTER TABLE "public"."HeroSlide" ADD COLUMN IF NOT EXISTS "mobileImagePublicId" TEXT;
ALTER TABLE "public"."HeroSlide" ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "public"."HeroSlide" ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3);
ALTER TABLE "public"."StoreSetting" ALTER COLUMN "updatedAt" SET DEFAULT CURRENT_TIMESTAMP;

CREATE TABLE IF NOT EXISTS "public"."SizeChart" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "nameKey" TEXT NOT NULL,
  "unit" "public"."SizeChartUnit" NOT NULL DEFAULT 'IN',
  "note" TEXT,
  "columns" JSONB NOT NULL,
  "rows" JSONB NOT NULL,
  "active" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "SizeChart_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "public"."ShopHeroSlide" (
  "id" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "subtitle" TEXT,
  "image" TEXT NOT NULL,
  "imagePublicId" TEXT,
  "mobileImage" TEXT,
  "mobileImagePublicId" TEXT,
  "ctaLabel" TEXT,
  "ctaLink" TEXT,
  "enabled" BOOLEAN NOT NULL DEFAULT true,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ShopHeroSlide_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "public"."OAuthAccount" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "provider" "public"."OAuthProvider" NOT NULL,
  "providerAccountId" TEXT NOT NULL,
  "email" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "OAuthAccount_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "public"."NotificationDelivery" (
  "id" TEXT NOT NULL,
  "event" "public"."NotificationEvent" NOT NULL,
  "channel" "public"."NotificationChannel" NOT NULL,
  "status" "public"."NotificationStatus" NOT NULL DEFAULT 'PENDING',
  "recipient" TEXT NOT NULL,
  "subject" TEXT,
  "orderId" TEXT,
  "userId" TEXT,
  "idempotencyKey" TEXT NOT NULL,
  "provider" TEXT,
  "providerMessageId" TEXT,
  "payload" JSONB,
  "attempts" INTEGER NOT NULL DEFAULT 0,
  "maxAttempts" INTEGER NOT NULL DEFAULT 3,
  "lastError" TEXT,
  "lastAttemptAt" TIMESTAMP(3),
  "nextAttemptAt" TIMESTAMP(3),
  "sentAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "NotificationDelivery_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "public"."CourierTrackingEvent" (
  "id" TEXT NOT NULL,
  "shipmentId" TEXT NOT NULL,
  "status" TEXT,
  "message" TEXT NOT NULL,
  "source" TEXT NOT NULL DEFAULT 'API',
  "externalAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "CourierTrackingEvent_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "SizeChart_nameKey_key" ON "public"."SizeChart"("nameKey");
CREATE INDEX IF NOT EXISTS "SizeChart_active_name_idx" ON "public"."SizeChart"("active","name");
CREATE INDEX IF NOT EXISTS "Product_sizeChartId_idx" ON "public"."Product"("sizeChartId");
CREATE INDEX IF NOT EXISTS "ShopHeroSlide_enabled_sortOrder_idx" ON "public"."ShopHeroSlide"("enabled","sortOrder");
CREATE INDEX IF NOT EXISTS "ShopHeroSlide_sortOrder_idx" ON "public"."ShopHeroSlide"("sortOrder");
CREATE INDEX IF NOT EXISTS "HeroSlide_sectionId_sortOrder_idx" ON "public"."HeroSlide"("sectionId","sortOrder");
CREATE INDEX IF NOT EXISTS "PasswordResetToken_userId_idx" ON "public"."PasswordResetToken"("userId");
CREATE INDEX IF NOT EXISTS "PasswordResetToken_expiresAt_idx" ON "public"."PasswordResetToken"("expiresAt");
CREATE UNIQUE INDEX IF NOT EXISTS "PasswordResetToken_token_key" ON "public"."PasswordResetToken"("token");
CREATE INDEX IF NOT EXISTS "OAuthAccount_userId_idx" ON "public"."OAuthAccount"("userId");
CREATE INDEX IF NOT EXISTS "OAuthAccount_email_idx" ON "public"."OAuthAccount"("email");
CREATE UNIQUE INDEX IF NOT EXISTS "OAuthAccount_provider_providerAccountId_key" ON "public"."OAuthAccount"("provider","providerAccountId");
CREATE UNIQUE INDEX IF NOT EXISTS "NotificationDelivery_idempotencyKey_key" ON "public"."NotificationDelivery"("idempotencyKey");
CREATE INDEX IF NOT EXISTS "NotificationDelivery_status_nextAttemptAt_idx" ON "public"."NotificationDelivery"("status","nextAttemptAt");
CREATE INDEX IF NOT EXISTS "NotificationDelivery_event_createdAt_idx" ON "public"."NotificationDelivery"("event","createdAt");
CREATE INDEX IF NOT EXISTS "NotificationDelivery_channel_status_idx" ON "public"."NotificationDelivery"("channel","status");
CREATE INDEX IF NOT EXISTS "NotificationDelivery_orderId_createdAt_idx" ON "public"."NotificationDelivery"("orderId","createdAt");
CREATE INDEX IF NOT EXISTS "NotificationDelivery_userId_createdAt_idx" ON "public"."NotificationDelivery"("userId","createdAt");
CREATE INDEX IF NOT EXISTS "NotificationDelivery_providerMessageId_idx" ON "public"."NotificationDelivery"("providerMessageId");
CREATE INDEX IF NOT EXISTS "CourierTrackingEvent_shipmentId_createdAt_idx" ON "public"."CourierTrackingEvent"("shipmentId","createdAt");
CREATE UNIQUE INDEX IF NOT EXISTS "CourierShipment_trackingId_key" ON "public"."CourierShipment"("trackingId");
CREATE INDEX IF NOT EXISTS "CourierShipment_provider_status_idx" ON "public"."CourierShipment"("provider","status");
CREATE INDEX IF NOT EXISTS "CourierShipment_trackingId_idx" ON "public"."CourierShipment"("trackingId");

-- Add missing relations without duplicating existing constraints.
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='Product_sizeChartId_fkey' AND conrelid='public."Product"'::regclass) THEN
    ALTER TABLE "public"."Product" ADD CONSTRAINT "Product_sizeChartId_fkey" FOREIGN KEY ("sizeChartId") REFERENCES "public"."SizeChart"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='OAuthAccount_userId_fkey' AND conrelid='public."OAuthAccount"'::regclass) THEN
    ALTER TABLE "public"."OAuthAccount" ADD CONSTRAINT "OAuthAccount_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='NotificationDelivery_orderId_fkey' AND conrelid='public."NotificationDelivery"'::regclass) THEN
    ALTER TABLE "public"."NotificationDelivery" ADD CONSTRAINT "NotificationDelivery_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "public"."Order"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='NotificationDelivery_userId_fkey' AND conrelid='public."NotificationDelivery"'::regclass) THEN
    ALTER TABLE "public"."NotificationDelivery" ADD CONSTRAINT "NotificationDelivery_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='CourierTrackingEvent_shipmentId_fkey' AND conrelid='public."CourierTrackingEvent"'::regclass) THEN
    ALTER TABLE "public"."CourierTrackingEvent" ADD CONSTRAINT "CourierTrackingEvent_shipmentId_fkey" FOREIGN KEY ("shipmentId") REFERENCES "public"."CourierShipment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

-- Keep the legacy PasswordResetToken indexes in place; no destructive
-- index drops are required for runtime compatibility.
