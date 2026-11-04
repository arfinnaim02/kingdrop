import type { MetadataRoute } from "next";
import { getPublicSiteUrl } from "@/lib/brand";

export default function robots(): MetadataRoute.Robots {
  const base = getPublicSiteUrl();

  // Do not publish a sitemap or index a site until its own URL is set.
  if (!base) {
    return { rules: [{ userAgent: "*", disallow: "/" }] };
  }

  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/admin/", "/account/"] }],
    sitemap: `${base}/sitemap.xml`,
  };
}
