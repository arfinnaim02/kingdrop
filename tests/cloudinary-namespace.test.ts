import { describe, expect, it } from "vitest";
import { isKingdroppManagedPublicId } from "../src/lib/cloudinary-namespace";

describe("KINGDROPP Cloudinary cleanup namespace", () => {
  it("accepts only new KINGDROPP-owned paths", () => {
    expect(isKingdroppManagedPublicId("kingdropp/products/shirt-123")).toBe(true);
    expect(isKingdroppManagedPublicId("kingdropp/homepage/hero/desktop/image")).toBe(true);
  });

  it("refuses legacy, unrelated and untrusted public IDs", () => {
    for (const value of [
      null, undefined, "", "kingdropp/", "game-on-garb/products/old",
      "kingdropp/../game-on-garb/image", "some-other-store/hero", "brand/image",
    ]) {
      expect(isKingdroppManagedPublicId(value)).toBe(false);
    }
  });
});
