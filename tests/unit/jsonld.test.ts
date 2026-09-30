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

  it("maps day codes to schema.org day names", () => {
    const site = {
      ...getSite(),
      businessHours: [
        { days: ["Mo", "Tu", "Su"] as ("Mo" | "Tu" | "Su")[], opens: "09:00", closes: "17:00" },
      ],
    };
    const data = businessJsonLd(site, "en", "https://e.com", "https://e.com/i.jpg");
    expect(data.openingHoursSpecification).toEqual([
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Sunday"],
        opens: "09:00",
        closes: "17:00",
      },
    ]);
  });

  it("drops opening hours unless days, opens and closes are all real", () => {
    const partial = {
      ...getSite(),
      businessHours: [
        { days: ["Mo"] as "Mo"[], opens: "09:00", closes: "[PLACEHOLDER]" },
        { days: "[PLACEHOLDER]", opens: "09:00", closes: "17:00" },
      ],
    };
    const data = businessJsonLd(partial, "en", "https://e.com", "https://e.com/i.jpg");
    expect(data).not.toHaveProperty("openingHoursSpecification");
  });
});
