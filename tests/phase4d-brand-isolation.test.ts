import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

function source(path: string): string {
  return readFileSync(join(process.cwd(), path), "utf8");
}

const uploadRoutes = [
  "src/app/api/admin/products/upload/route.ts",
  "src/app/api/admin/homepage/hero/upload/route.ts",
  "src/app/api/admin/shop/hero/upload/route.ts",
  "src/app/api/admin/homepage/brand-story/upload/route.ts",
  "src/app/api/admin/homepage/campaign/[type]/upload/route.ts",
  "src/app/api/admin/homepage/category-images/upload/route.ts",
  "src/app/api/admin/homepage/promotion-popup/upload/route.ts",
  "src/app/api/admin/blogs/upload/route.ts",
];

describe("Phase 4D KINGDROPP source brand isolation", () => {
  it("defaults only newly created product brand values to KINGDROPP", () => {
    expect(source("prisma/schema.prisma")).toMatch(
      /brand\s+String\?\s+@default\("KINGDROPP"\)/,
    );
    const migration = source(
      "prisma/migrations/20261115130000_kingdropp_product_brand_default/migration.sql",
    );
    expect(migration).toContain("ALTER COLUMN \"brand\" SET DEFAULT 'KINGDROPP'");
    expect(migration).not.toMatch(/UPDATE\s+"Product"\s+SET/i);
  });

  it("uses KINGDROPP for source-owned product SEO and structured data defaults", () => {
    const productPage = source("src/app/(store)/product/[slug]/page.tsx");
    expect(productPage).toContain('import { BRAND } from "@/lib/brand"');
    expect(productPage).not.toMatch(/GameOn Garb|Game On Garb/);
    expect(productPage).toContain("BRAND.name");
    for (const path of [
      "src/app/api/admin/products/route.ts",
      "src/app/api/admin/products/[id]/route.ts",
      "src/lib/admin-products.ts",
      "src/components/admin/product-manager.tsx",
    ]) expect(source(path)).not.toMatch(/GameOn Garb|Game On Garb/);
  });

  it.each(uploadRoutes)("uses isolated Cloudinary folder paths in %s", (path) => {
    const body = source(path);
    expect(body).toContain("kingdropp/");
    expect(body).not.toContain("game-on-garb/");
  });

  it("removes old brand names from controlled default and preview labels", () => {
    for (const path of [
      "src/app/api/admin/homepage/brand-story/route.ts",
      "src/components/admin/brand-story-manager.tsx",
      "src/components/admin/hero-manager.tsx",
      "src/components/admin/shop-hero-manager.tsx",
      "src/components/shop/shop-hero-slider.tsx",
      "src/components/home/promotion-popup.tsx",
    ]) {
      expect(source(path)).not.toMatch(/GameOn Garb|Game On Garb|Experience the Thrill/i);
    }
  });

  it("uses only KINGDROPP in customer-facing order, search, SEO and email copy", () => {
    for (const path of [
      "src/lib/notifications/events.ts",
      "src/components/layout/header-search.tsx",
      "src/components/cart/cart-drawer.tsx",
      "src/app/(store)/blog/page.tsx",
      "src/app/(store)/blog/[slug]/page.tsx",
      "src/app/(store)/payment/bkash/result/page.tsx",
    ]) expect(source(path)).not.toMatch(/GameOn Garb|Game On Garb|Experience the thrill|www\\.gameongarb\\.com/i);
  });

  it("never uses the old campaign artwork as homepage fallback", () => {
    const homepage = source("src/app/(store)/page.tsx");
    expect(homepage).not.toContain('"/images/campaigns/hero.svg"');
    expect(homepage).toContain('"/images/products/tshirt.svg"');
  });

  it("does not advertise unverified discounts or fixed delivery price as defaults", () => {
    const announcement = source("src/app/api/admin/homepage/announcement-bar/route.ts");
    expect(announcement).not.toContain("Up to 30% discount on selected products");
    expect(announcement).not.toContain("Inside Dhaka delivery ৳80");
  });
});
