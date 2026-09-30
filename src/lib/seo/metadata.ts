import type { Metadata } from "next";
import { SITE_NAME } from "@/config/constants";
import { defaultLocale, type Locale } from "@/lib/i18n/locales";

const ogLocale: Record<Locale, string> = { en: "en_US", id: "id_ID" };

export function alternatesFor(path: string): Record<Locale | "x-default", string> {
  return { en: `/en${path}`, id: `/id${path}`, "x-default": `/${defaultLocale}${path}` };
}

type MetadataInput = { lang: Locale; path: string; title: string; description: string };

export function buildMetadata({ lang, path, title, description }: MetadataInput): Metadata {
  const url = `/${lang}${path}`;
  return {
    title,
    description,
    alternates: { canonical: url, languages: alternatesFor(path) },
    openGraph: {
      type: "website",
      siteName: SITE_NAME,
      locale: ogLocale[lang],
      alternateLocale: Object.entries(ogLocale)
        .filter(([l]) => l !== lang)
        .map(([, v]) => v),
      url,
      title,
      description,
    },
    twitter: { card: "summary_large_image", title, description },
  };
}
