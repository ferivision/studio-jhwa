import { globSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { brandColors } from "@/config/constants";

describe("design tokens", () => {
  const css = readFileSync("src/app/globals.css", "utf8").toLowerCase();
  it("brandColors mirrors the Tailwind theme", () => {
    for (const [name, hex] of Object.entries(brandColors)) {
      expect(css).toContain(`--color-${name}: ${hex.toLowerCase()};`);
    }
  });
  it("components contain no hard-coded hex colors", () => {
    const offenders = globSync("src/components/**/*.tsx").filter((f) =>
      /#[0-9a-fA-F]{3,8}\b/.test(readFileSync(f, "utf8")),
    );
    expect(offenders).toEqual([]);
  });
});
