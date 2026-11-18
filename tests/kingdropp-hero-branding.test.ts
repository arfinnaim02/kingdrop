import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const read = (file: string) => readFileSync(join(process.cwd(), file), "utf8");

describe("KINGDROPP homepage hero and storefront identity", () => {
  it("starts the homepage with admin-controlled hero sections, not a static intro", () => {
    const home = read("src/app/(store)/page.tsx");
    expect(home).not.toContain('className="kingdropp-editorial-intro"');
    expect(home).toContain("db.homepageSection.findMany");
    expect(home).toContain("section.slides");
  });

  it("renders each hero slide's admin-managed title, subtitle and CTA", () => {
    const hero = read("src/components/home/hero-slider.tsx");
    expect(hero).toContain("activeSlide.title");
    expect(hero).toContain("activeSlide.subtitle");
    expect(hero).toContain("activeSlide.ctaLabel");
    expect(hero).toContain("activeSlide.ctaLink");
    expect(hero).toContain('className="premium-hero-cta"');
  });

  it("uses KINGDROPP cart, wishlist, search and tracking identifiers", () => {
    const files = [
      "src/components/shared/store-provider.tsx",
      "src/components/layout/store-header.tsx",
      "src/components/layout/store-shell.tsx",
      "src/components/cart/cart-drawer.tsx",
      "src/components/layout/header-search.tsx",
      "src/lib/tracking.ts",
      "src/components/tracking/tracking-scripts.tsx",
      "src/components/tracking/purchase-tracker.tsx",
    ];
    for (const file of files) {
      expect(read(file)).not.toMatch(/gog[-_]|__GOG/i);
    }
    expect(read("src/components/shared/store-provider.tsx")).toContain('"kingdropp-cart"');
  });

  it("keeps legacy store names out of storefront placeholder artwork", () => {
    for (const file of [
      "public/images/campaigns/hero.svg",
      "public/images/products/cap.svg",
      "public/images/products/jersey.svg",
      "public/images/products/tshirt.svg",
    ]) {
      expect(read(file)).not.toMatch(/GameOn Garb|GAME ON|>GOG</i);
    }
  });
});
