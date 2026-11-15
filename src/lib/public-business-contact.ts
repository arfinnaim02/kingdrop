/**
 * Publish business contacts only after KINGDROPP explicitly confirms them.
 * Unset or unverified values never inherit another storefront's data.
 * This module does not query the database or access external services.
 */
function safeValue(value: string | undefined): string | null {
  const clean = value?.trim();
  if (!clean || /game[\s_+%-]*on[\s_+%-]*garb|gameongarb|gog[-_]/i.test(clean)) return null;
  return clean;
}

function safeUrl(value: string | undefined): string | null {
  const clean = safeValue(value);
  if (!clean) return null;
  try {
    const url = new URL(clean);
    return url.protocol === "https:" && !url.username && !url.password
      ? url.toString()
      : null;
  } catch {
    return null;
  }
}

export type PublicBusinessContacts = {
  email: string | null;
  phone: string | null;
  address: string | null;
  mapUrl: string | null;
  whatsappUrl: string | null;
  socials: { label: string; href: string }[];
};

export function getPublicBusinessContacts(): PublicBusinessContacts {
  const empty: PublicBusinessContacts = {
    email: null, phone: null, address: null, mapUrl: null,
    whatsappUrl: null, socials: [],
  };
  if (process.env.KINGDROPP_CONTACTS_VERIFIED !== "true") return empty;

  const email = safeValue(process.env.KINGDROPP_CONTACT_EMAIL);
  const phone = safeValue(process.env.KINGDROPP_CONTACT_PHONE);
  const address = safeValue(process.env.KINGDROPP_CONTACT_ADDRESS);
  const socials = ([
    ["Facebook", process.env.KINGDROPP_FACEBOOK_URL],
    ["Instagram", process.env.KINGDROPP_INSTAGRAM_URL],
    ["YouTube", process.env.KINGDROPP_YOUTUBE_URL],
    ["TikTok", process.env.KINGDROPP_TIKTOK_URL],
  ] as const).flatMap(([label, value]) => {
    const href = safeUrl(value);
    return href ? [{ label: String(label), href }] : [];
  });

  return {
    email: email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : null,
    phone: phone && /^\+?[\d\s()-]{7,20}$/.test(phone) ? phone : null,
    address,
    mapUrl: safeUrl(process.env.KINGDROPP_MAP_URL),
    whatsappUrl: safeUrl(process.env.KINGDROPP_WHATSAPP_URL),
    socials,
  };
}
