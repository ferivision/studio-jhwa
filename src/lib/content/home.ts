import "server-only";
import { homeSchema, type Home } from "@/lib/schemas/home";
import { readJson } from "./load";

export function getHome(): Home {
  return readJson("home.json", homeSchema);
}
