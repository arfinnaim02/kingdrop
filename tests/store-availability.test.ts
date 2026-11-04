import { describe, expect, it } from "vitest";
import { enabledPaymentMethods, isStoreOpen } from "../src/lib/store-availability";

describe("store launch guard", () => {
  it("does not open the store with missing or malformed settings", () => {
    expect(isStoreOpen(undefined)).toBe(false);
    expect(isStoreOpen({})).toBe(false);
    expect(isStoreOpen({ storeLive: true })).toBe(false);
    expect(isStoreOpen({ maintenanceMode: false })).toBe(false);
    expect(isStoreOpen({ storeLive: "true", maintenanceMode: false })).toBe(false);
    expect(isStoreOpen({ storeLive: true, maintenanceMode: true })).toBe(false);
  });

  it("opens only with explicit live and non-maintenance flags", () => {
    expect(isStoreOpen({ storeLive: true, maintenanceMode: false })).toBe(true);
  });
});

describe("payment availability guard", () => {
  it("disables payments when settings are missing, invalid or partial", () => {
    expect(enabledPaymentMethods(undefined)).toEqual({ codEnabled: false, bkashEnabled: false });
    expect(enabledPaymentMethods({})).toEqual({ codEnabled: false, bkashEnabled: false });
    expect(enabledPaymentMethods({ codEnabled: "true" })).toEqual({ codEnabled: false, bkashEnabled: false });
  });

  it("enables only explicitly true payment methods", () => {
    expect(enabledPaymentMethods({ codEnabled: true, bkashEnabled: false })).toEqual({
      codEnabled: true, bkashEnabled: false,
    });
    expect(enabledPaymentMethods({ codEnabled: false, bkashEnabled: true })).toEqual({
      codEnabled: false, bkashEnabled: true,
    });
  });
});
