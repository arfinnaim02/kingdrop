-- CreateEnum
CREATE TYPE "public"."OAuthProvider" AS ENUM ('GOOGLE', 'FACEBOOK');

-- CreateEnum
CREATE TYPE "public"."SizeChartUnit" AS ENUM ('IN', 'CM', 'NONE');

-- CreateEnum
CREATE TYPE "public"."NotificationChannel" AS ENUM ('EMAIL', 'SMS');

-- CreateEnum
CREATE TYPE "public"."NotificationStatus" AS ENUM ('PENDING', 'PROCESSING', 'SENT', 'FAILED', 'SKIPPED');

-- CreateEnum
CREATE TYPE "public"."NotificationEvent" AS ENUM ('ACCOUNT_CREATED', 'PASSWORD_RESET', 'ORDER_PLACED', 'ORDER_CONFIRMED', 'ORDER_READY_TO_SHIP', 'ORDER_SHIPPED', 'ORDER_DELIVERED', 'ORDER_CANCELLED', 'ORDER_FAILED_DELIVERY', 'PAYMENT_SUCCEEDED', 'PAYMENT_FAILED', 'RETURN_REQUESTED', 'RETURN_APPROVED', 'RETURN_COMPLETED');

-- DropIndex
DROP INDEX "public"."PasswordResetToken_tokenHash_key";

-- DropIndex
DROP INDEX "public"."PasswordResetToken_userId_expiresAt_idx";

-- AlterTable
ALTER TABLE "public"."CourierShipment" ADD COLUMN     "codAmount" DECIMAL(12,2),
ADD COLUMN     "lastSyncedAt" TIMESTAMP(3),
ADD COLUMN     "trackingUrl" TEXT;

-- AlterTable
ALTER TABLE "public"."HeroSlide" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "public"."Order" ADD COLUMN     "telegramChatId" TEXT,
ADD COLUMN     "telegramMessageId" INTEGER;

-- AlterTable
ALTER TABLE "public"."PasswordResetToken" DROP COLUMN "tokenHash",
ADD COLUMN     "token" TEXT NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "public"."Product" ALTER COLUMN "brand" SET DEFAULT 'GameOn Garb';

-- AlterTable
ALTER TABLE "public"."ProductImage" ADD COLUMN     "publicId" TEXT;

-- AlterTable
ALTER TABLE "public"."ProductVariant" ADD COLUMN     "colorHex" TEXT;

-- AlterTable
ALTER TABLE "public"."StoreSetting" ALTER COLUMN "updatedAt" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "public"."User" ALTER COLUMN "passwordHash" DROP NOT NULL;

-- CreateTable
CREATE TABLE "public"."OAuthAccount" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "provider" "public"."OAuthProvider" NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "email" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OAuthAccount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."SizeChart" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "nameKey" TEXT NOT NULL,
    "unit" "public"."SizeChartUnit" NOT NULL DEFAULT 'IN',
    "note" TEXT,
    "columns" JSONB NOT NULL,
    "rows" JSONB NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SizeChart_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ShopHeroSlide" (
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

-- CreateTable
CREATE TABLE "public"."NotificationDelivery" (
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
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NotificationDelivery_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."CourierTrackingEvent" (
    "id" TEXT NOT NULL,
    "shipmentId" TEXT NOT NULL,
    "status" TEXT,
    "message" TEXT NOT NULL,
    "source" TEXT NOT NULL DEFAULT 'API',
    "externalAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CourierTrackingEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "OAuthAccount_userId_idx" ON "public"."OAuthAccount"("userId");

-- CreateIndex
CREATE INDEX "OAuthAccount_email_idx" ON "public"."OAuthAccount"("email");

-- CreateIndex
CREATE UNIQUE INDEX "OAuthAccount_provider_providerAccountId_key" ON "public"."OAuthAccount"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "SizeChart_nameKey_key" ON "public"."SizeChart"("nameKey");

-- CreateIndex
CREATE INDEX "SizeChart_active_name_idx" ON "public"."SizeChart"("active", "name");

-- CreateIndex
CREATE INDEX "ShopHeroSlide_enabled_sortOrder_idx" ON "public"."ShopHeroSlide"("enabled", "sortOrder");

-- CreateIndex
CREATE INDEX "ShopHeroSlide_sortOrder_idx" ON "public"."ShopHeroSlide"("sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "NotificationDelivery_idempotencyKey_key" ON "public"."NotificationDelivery"("idempotencyKey");

-- CreateIndex
CREATE INDEX "NotificationDelivery_status_nextAttemptAt_idx" ON "public"."NotificationDelivery"("status", "nextAttemptAt");

-- CreateIndex
CREATE INDEX "NotificationDelivery_event_createdAt_idx" ON "public"."NotificationDelivery"("event", "createdAt");

-- CreateIndex
CREATE INDEX "NotificationDelivery_channel_status_idx" ON "public"."NotificationDelivery"("channel", "status");

-- CreateIndex
CREATE INDEX "NotificationDelivery_orderId_createdAt_idx" ON "public"."NotificationDelivery"("orderId", "createdAt");

-- CreateIndex
CREATE INDEX "NotificationDelivery_userId_createdAt_idx" ON "public"."NotificationDelivery"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "NotificationDelivery_providerMessageId_idx" ON "public"."NotificationDelivery"("providerMessageId");

-- CreateIndex
CREATE INDEX "CourierTrackingEvent_shipmentId_createdAt_idx" ON "public"."CourierTrackingEvent"("shipmentId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "CourierShipment_trackingId_key" ON "public"."CourierShipment"("trackingId");

-- CreateIndex
CREATE INDEX "CourierShipment_provider_status_idx" ON "public"."CourierShipment"("provider", "status");

-- CreateIndex
CREATE INDEX "CourierShipment_trackingId_idx" ON "public"."CourierShipment"("trackingId");

-- CreateIndex
CREATE INDEX "HeroSlide_sectionId_sortOrder_idx" ON "public"."HeroSlide"("sectionId", "sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "PasswordResetToken_token_key" ON "public"."PasswordResetToken"("token");

-- CreateIndex
CREATE INDEX "PasswordResetToken_userId_idx" ON "public"."PasswordResetToken"("userId");

-- CreateIndex
CREATE INDEX "PasswordResetToken_expiresAt_idx" ON "public"."PasswordResetToken"("expiresAt");

-- CreateIndex
CREATE INDEX "Product_sizeChartId_idx" ON "public"."Product"("sizeChartId");

-- AddForeignKey
ALTER TABLE "public"."OAuthAccount" ADD CONSTRAINT "OAuthAccount_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Product" ADD CONSTRAINT "Product_sizeChartId_fkey" FOREIGN KEY ("sizeChartId") REFERENCES "public"."SizeChart"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."NotificationDelivery" ADD CONSTRAINT "NotificationDelivery_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "public"."Order"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."NotificationDelivery" ADD CONSTRAINT "NotificationDelivery_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CourierTrackingEvent" ADD CONSTRAINT "CourierTrackingEvent_shipmentId_fkey" FOREIGN KEY ("shipmentId") REFERENCES "public"."CourierShipment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
