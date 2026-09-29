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
