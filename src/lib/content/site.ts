import "server-only";
import { siteSchema, type Site } from "@/lib/schemas/site";
import { readJson } from "./load";

export function getSite(): Site {
  return readJson("site.json", siteSchema);
}
