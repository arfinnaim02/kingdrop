/**
 * KINGDROPP public brand identity.
 *
 * Keep provider credentials, physical address, support contacts, and production
 * URLs out of this module until separately verified for KINGDROPP.
 */
export const BRAND = {
  name: "KINGDROPP",
  tagline: "Rule Your Style",
  description: "Premium Men's Fashion",
  packageName: "kingdrop",
  seoTitle: "KINGDROPP | Rule Your Style — Premium Men's Fashion",
  seoDescription:
    "Discover premium men's fashion at KINGDROPP. Explore refined everyday essentials, contemporary fits, and effortless style designed for confidence.",
} as const;

/**
 * There must never be a fallback to the separate Gameon Garb domain.
 * An unset site URL leaves sitemap generation disabled and robots restrictive
 * until the KINGDROPP deployment domain is configured.
 */
export function getPublicSiteUrl(): string | null {
  const value = (
    process.env.APP_URL ??
    process.env.NEXT_PUBLIC_SITE_URL ??
    ""
  ).trim().replace(/\/+$/, "");

  if (!value) return null;

  try {
    const url = new URL(value);
    if (
      !["https:", "http:"].includes(url.protocol) ||
      url.username ||
      url.password
    ) return null;

    if (
      process.env.NODE_ENV === "production" &&
      url.protocol !== "https:"
    ) return null;

    return url.origin + (url.pathname === "/" ? "" : url.pathname);
  } catch {
    return null;
  }
}
