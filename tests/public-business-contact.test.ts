import { afterEach, describe, expect, it, vi } from "vitest";
import { getPublicBusinessContacts } from "../src/lib/public-business-contact";

afterEach(() => vi.unstubAllEnvs());

describe("KINGDROPP verified contact publication", () => {
  it("hides all contacts without explicit verification", () => {
    vi.stubEnv("KINGDROPP_CONTACTS_VERIFIED", "false");
    vi.stubEnv("KINGDROPP_CONTACT_EMAIL", "support@kingdropp.example");
    expect(getPublicBusinessContacts()).toEqual({
      email: null,
      phone: null,
      address: null,
      mapUrl: null,
      whatsappUrl: null,
      socials: [],
    });
  });

  it("rejects inherited brand contact and social destinations", () => {
    vi.stubEnv("KINGDROPP_CONTACTS_VERIFIED", "true");
    vi.stubEnv("KINGDROPP_CONTACT_EMAIL", "gameongarb@gmail.com");
    vi.stubEnv("KINGDROPP_CONTACT_ADDRESS", "Game On Garb, Dhaka");
    vi.stubEnv("KINGDROPP_MAP_URL", "https://maps.example.com/gameongarb");
    vi.stubEnv("KINGDROPP_FACEBOOK_URL", "https://facebook.com/GameOnGarb");
    const contacts = getPublicBusinessContacts();
    expect(contacts.email).toBeNull();
    expect(contacts.address).toBeNull();
    expect(contacts.mapUrl).toBeNull();
    expect(contacts.socials).toEqual([]);
  });

  it("publishes only well-formed, verified KINGDROPP channels", () => {
    vi.stubEnv("KINGDROPP_CONTACTS_VERIFIED", "true");
    vi.stubEnv("KINGDROPP_CONTACT_EMAIL", "support@kingdropp.example");
    vi.stubEnv("KINGDROPP_CONTACT_PHONE", "+880 1700 000000");
    vi.stubEnv("KINGDROPP_FACEBOOK_URL", "http://facebook.com/kingdropp");
    vi.stubEnv("KINGDROPP_INSTAGRAM_URL", "https://instagram.com/kingdropp");
    const contacts = getPublicBusinessContacts();
    expect(contacts.email).toBe("support@kingdropp.example");
    expect(contacts.phone).toBe("+880 1700 000000");
    expect(contacts.socials).toEqual([
      { label: "Instagram", href: "https://instagram.com/kingdropp" },
    ]);
  });
});
