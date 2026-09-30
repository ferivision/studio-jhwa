import { describe, expect, it } from "vitest";
import { alternatesFor, buildMetadata } from "@/lib/seo/metadata";

describe("metadata", () => {
  it("builds canonical and hreflang alternates", () => {
    expect(alternatesFor("/projects")).toEqual({
      en: "/en/projects",
      id: "/id/projects",
      "x-default": "/en/projects",
    });
    const meta = buildMetadata({ lang: "id", path: "/projects", title: "T", description: "D" });
    expect(meta.alternates?.canonical).toBe("/id/projects");
    expect(meta.openGraph).toMatchObject({ locale: "id_ID", url: "/id/projects", title: "T" });
    expect(meta.twitter).toMatchObject({ card: "summary_large_image" });
  });
});
