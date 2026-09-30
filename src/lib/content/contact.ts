import { isPlaceholder } from "@/lib/schemas/common";
import type { Site } from "@/lib/schemas/site";

export function whatsappHref(site: Site): string | null {
  const number = site.contact.whatsapp;
  return isPlaceholder(number) ? null : `https://wa.me/${number}`;
}

export function emailHref(site: Site): string | null {
  const email = site.contact.email;
  return isPlaceholder(email) ? null : `mailto:${email}`;
}

export type PrimaryContact = { kind: "whatsapp" | "instagram"; href: string };

/** The main CTA target: WhatsApp when real, else Instagram, else nothing. */
export function primaryContact(site: Site): PrimaryContact | null {
  const wa = whatsappHref(site);
  if (wa) return { kind: "whatsapp", href: wa };
  const instagram = site.socials.find((s) => s.platform === "instagram");
  return instagram ? { kind: "instagram", href: instagram.url } : null;
}
