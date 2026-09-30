import { describe, expect, it } from "vitest";
import { getSite } from "@/lib/content";
import {
  breadcrumbJsonLd,
  businessJsonLd,
  serializeJsonLd,
  withoutPlaceholders,
} from "@/lib/seo/structured-data";

describe("json-ld", () => {
  it("escapes < so a string cannot close the script tag", () => {
    const out = serializeJsonLd({ name: "</script><script>alert(1)</script>" });
    expect(out).not.toContain("<");
    expect(out).toContain("\\u003c/script>");
    expect(JSON.parse(out)).toEqual({ name: "</script><script>alert(1)</script>" });
  });

  it("drops placeholder values and objects left with only @type", () => {
    expect(
      withoutPlaceholders({ a: "[PLACEHOLDER]", b: "ok", c: { "@type": "X", d: "[City]" } }),
    ).toEqual({ b: "ok" });
    expect(withoutPlaceholders(["[x]", "y"])).toEqual(["y"]);
  });

  it("business JSON-LD never publishes placeholders", () => {
    const data = businessJsonLd(
      getSite(),
      "en",
      "https://example.com",
      "https://example.com/images/home/dining.jpg",
    );
    expect(JSON.stringify(data)).not.toMatch(/\[[^\]"{}[]+\]/);
    expect(data).toMatchObject({ "@type": "HomeAndConstructionBusiness", name: "studioJHWA" });
  });

  it("builds a breadcrumb list with positions", () => {
    const data = breadcrumbJsonLd([
      { name: "Home", url: "https://e.com/en" },
      { name: "Projects", url: "https://e.com/en/projects" },
    ]);
    expect(data).toMatchObject({
      "@type": "BreadcrumbList",
      itemListElement: [{ position: 1 }, { position: 2 }],
    });
  });
});
