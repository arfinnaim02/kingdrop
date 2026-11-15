import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { enabledPaymentMethods, isStoreOpen } from "../src/lib/store-availability";

function read(path: string) {
  return readFileSync(join(process.cwd(), path), "utf8");
}

describe("KINGDROPP store settings and availability regression", () => {
  it("keeps the seeded store hidden until explicitly made live", () => {
    expect(isStoreOpen({ storeLive: false, maintenanceMode: true })).toBe(false);
    expect(isStoreOpen({ storeLive: true, maintenanceMode: true })).toBe(false);
    expect(isStoreOpen({ storeLive: true, maintenanceMode: false })).toBe(true);
    expect(isStoreOpen({ storeLive: true })).toBe(false);
  });

  it("allows both payment methods to remain disabled during setup", () => {
    expect(enabledPaymentMethods({codEnabled: false, bkashEnabled: false})).toEqual({
      codEnabled: false,
      bkashEnabled: false,
    });
    const api = read("src/app/api/admin/[resource]/route.ts");
    expect(api).not.toContain("At least one payment method must remain enabled");
    expect(api).toContain("db.storeSetting.upsert");
  });

  it("does not silently switch disabled payment or storefront flags on", () => {
    const admin = read("src/components/admin/admin-module.tsx");
    expect(admin).toContain("defaultChecked={general.storeLive === true}");
    expect(admin).toContain("defaultChecked={payments.codEnabled === true}");
    expect(admin).toContain("defaultChecked={payments.bkashEnabled === true}");
    expect(admin).toContain('f.get("maintenanceMode") === "on"');
  });

  it("uses server-derived store settings for the storefront", () => {
    const layout = read("src/app/(store)/layout.tsx");
    expect(layout).toContain("isStoreOpen(general)");
    expect(layout).toContain("db.storeSetting.findMany");
    const publicSettings = read("src/app/api/settings/public/route.ts");
    expect(publicSettings).toContain("enabledPaymentMethods");
    expect(publicSettings).toContain("storeOpen && payments.codEnabled");
  });
});
