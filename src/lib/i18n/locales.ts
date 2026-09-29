import type { Localized } from "@/lib/schemas/common";

export const locales = ["en", "id"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "en";

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}

export function localizedPath(lang: Locale, path = ""): string {
  return `/${lang}${path}`;
}

/** "/en/projects/x" → "/id/projects/x". Paths without a known locale go to the target root. */
export function swapLocale(pathname: string, target: Locale): string {
  const [, first = "", ...rest] = pathname.split("/");
  if (!isLocale(first)) return `/${target}`;
  return ["", target, ...rest].join("/");
}

export function pick(value: Localized, lang: Locale): string {
  return value[lang];
}
