import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const migration = readFileSync(
  join(process.cwd(), "prisma/migrations/20261118120000_reconcile_admin_models/migration.sql"),
  "utf8",
);

describe("KINGDROPP missing admin schema reconciliation", () => {
  it.each(["SizeChart", "ShopHeroSlide", "OAuthAccount", "NotificationDelivery", "CourierTrackingEvent"])(
    "creates missing %s table safely",
    (table) => {
      expect(migration).toContain(`CREATE TABLE IF NOT EXISTS "public"."${table}"`);
    },
  );
  it.each([
    '"sizeChartId"', '"colorHex"', '"publicId"', '"telegramChatId"',
    '"codAmount"', '"trackingUrl"', '"mobileImagePublicId"', '"createdAt"',
  ])("adds missing nullable or backfilled field %s", (field) => {
    expect(migration).toContain(field);
  });
  it("preserves existing reset tokens and existing orders", () => {
    expect(migration).toContain('RENAME COLUMN "tokenHash" TO "token"');
    expect(migration).not.toMatch(/\bDROP\s+(TABLE|COLUMN)\b/i);
    expect(migration).not.toMatch(/\bDELETE\s+FROM\b/i);
  });
  it("does not restore Game On Garb product brand defaults", () => {
    expect(migration).toContain("SET DEFAULT 'KINGDROPP'");
    expect(migration).not.toContain("SET DEFAULT 'Game On Garb'");
  });
});
