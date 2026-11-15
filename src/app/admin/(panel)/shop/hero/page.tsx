import type {
  Metadata,
} from "next";

import {
  ShopHeroManager,
} from "@/components/admin/shop-hero-manager";

export const metadata: Metadata = {
  title:
    "Shop Hero | KINGDROPP Admin",
};

export const dynamic =
  "force-dynamic";

export default function ShopHeroPage() {
  return (
    <ShopHeroManager />
  );
}