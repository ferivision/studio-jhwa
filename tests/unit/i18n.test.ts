import { describe, expect, it } from "vitest";
import { localizedPath, pick, swapLocale } from "@/lib/i18n/locales";
import { format } from "@/lib/i18n/format";

describe("localizedPath", () => {
  it("prefixes the locale", () => {
    expect(localizedPath("en")).toBe("/en");
    expect(localizedPath("id", "/projects")).toBe("/id/projects");
  });
});

describe("swapLocale", () => {
  it("keeps the rest of the path", () => {
    expect(swapLocale("/en/projects/rh-house", "id")).toBe("/id/projects/rh-house");
    expect(swapLocale("/id", "en")).toBe("/en");
  });
  it("falls back to the locale root for paths without a locale", () => {
    expect(swapLocale("/", "id")).toBe("/id");
    expect(swapLocale("/fr/x", "id")).toBe("/id");
  });
});

describe("pick", () => {
  it("returns the value for the locale", () => {
    expect(pick({ en: "House", id: "Rumah" }, "id")).toBe("Rumah");
  });
});

describe("format", () => {
  it("replaces named tokens and leaves unknown ones", () => {
    expect(format("{count} projects", { count: 3 })).toBe("3 projects");
    expect(format("{name} in {city}", { name: "RH" })).toBe("RH in {city}");
  });
});
