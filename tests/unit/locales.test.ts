import { describe, expect, it } from "vitest";
import { defaultLocale, isLocale, locales } from "@/lib/i18n/locales";

describe("locales", () => {
  it("supports exactly en and id with en as default", () => {
    expect(locales).toEqual(["en", "id"]);
    expect(defaultLocale).toBe("en");
  });
  it("rejects unknown locales", () => {
    expect(isLocale("id")).toBe(true);
    expect(isLocale("fr")).toBe(false);
    expect(isLocale("")).toBe(false);
  });
});
