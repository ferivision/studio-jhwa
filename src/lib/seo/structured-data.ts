import type { Locale } from "@/lib/i18n/locales";
import { isPlaceholder } from "@/lib/schemas/common";
import type { Site } from "@/lib/schemas/site";

type Json = string | number | boolean | null | Json[] | { [key: string]: Json };

/** Removes placeholder strings; drops arrays/objects that end up empty (or only "@type"). */
export function withoutPlaceholders<T>(value: T): T | undefined {
  if (typeof value === "string") return isPlaceholder(value) ? undefined : value;
  if (Array.isArray(value)) {
    const items = value.map((v) => withoutPlaceholders(v)).filter((v) => v !== undefined);
    return (items.length ? items : undefined) as T | undefined;
  }
  if (value && typeof value === "object") {
    const entries = Object.entries(value)
      .map(([k, v]) => [k, withoutPlaceholders(v)] as const)
      .filter(([, v]) => v !== undefined);
    const meaningful = entries.filter(([k]) => k !== "@type" && k !== "@context");
    return (meaningful.length ? Object.fromEntries(entries) : undefined) as T | undefined;
  }
  return value;
}

export function serializeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

export function businessJsonLd(
  site: Site,
  lang: Locale,
  baseUrl: string,
  image: string,
): Record<string, Json> {
  const { contact, address } = site;
  const data = {
    "@context": "https://schema.org",
    "@type": "HomeAndConstructionBusiness",
    "@id": `${baseUrl}/#business`,
    name: site.name,
    legalName: site.legalName,
    slogan: site.tagline,
    description: site.description[lang],
    url: `${baseUrl}/${lang}`,
    image,
    telephone: isPlaceholder(contact.whatsapp) ? undefined : `+${contact.whatsapp}`,
    email: contact.email,
    address: {
      "@type": "PostalAddress",
      streetAddress: address.street,
      addressLocality: address.city,
      addressRegion: address.region,
      postalCode: address.postalCode,
      addressCountry: address.country,
    },
    geo: address.geo
      ? { "@type": "GeoCoordinates", latitude: address.geo.lat, longitude: address.geo.lng }
      : undefined,
    areaServed: site.serviceAreas.map((name) => ({ "@type": "City", name })),
    sameAs: site.socials.map((s) => s.url),
    openingHoursSpecification: site.businessHours.map((h) => ({
      "@type": "OpeningHoursSpecification",
      dayOfWeek: h.days,
      opens: h.opens,
      closes: h.closes,
    })),
  };
  return withoutPlaceholders(JSON.parse(JSON.stringify(data)) as Record<string, Json>) ?? {};
}

export function breadcrumbJsonLd(items: { name: string; url: string }[]): Record<string, Json> {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}
