import "server-only";
import type { Locale } from "@/lib/i18n/locales";
import { dictionarySchema, type Dictionary } from "@/lib/schemas/dictionary";
import { readJson } from "./load";

export function getDictionary(lang: Locale): Dictionary {
  return readJson(`i18n/${lang}.json`, dictionarySchema);
}
