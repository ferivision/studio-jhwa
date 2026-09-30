import { describe, expect, it } from "vitest";
import { emailHref, getSite, primaryContact, whatsappHref } from "@/lib/content";
import type { Site } from "@/lib/schemas/site";

const base = getSite();
const withContact = (whatsapp: string, email: string): Site => ({
  ...base,
  contact: { whatsapp, email },
});

describe("contact links", () => {
  it("returns null for placeholder values instead of broken links", () => {
    const site = withContact("[PLACEHOLDER]", "[PLACEHOLDER]");
    expect(whatsappHref(site)).toBeNull();
    expect(emailHref(site)).toBeNull();
  });
  it("builds wa.me and mailto links for real values", () => {
    const site = withContact("6281200000000", "hello@example.com");
    expect(whatsappHref(site)).toBe("https://wa.me/6281200000000");
    expect(emailHref(site)).toBe("mailto:hello@example.com");
  });
});

describe("primaryContact", () => {
  it("prefers WhatsApp when it is real", () => {
    const site = withContact("6281200000000", "[PLACEHOLDER]");
    expect(primaryContact(site)).toEqual({ kind: "whatsapp", href: "https://wa.me/6281200000000" });
  });
  it("falls back to Instagram while WhatsApp is a placeholder", () => {
    const site = withContact("[PLACEHOLDER]", "[PLACEHOLDER]");
    const ig = site.socials.find((s) => s.platform === "instagram");
    expect(primaryContact(site)).toEqual({ kind: "instagram", href: ig?.url });
  });
  it("returns null when neither channel exists", () => {
    const site = { ...withContact("[PLACEHOLDER]", "[PLACEHOLDER]"), socials: [] };
    expect(primaryContact(site)).toBeNull();
  });
});
