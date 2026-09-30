import { expect, test } from "@playwright/test";

const BASE = "http://localhost:3100";
const routes = [
  "/en",
  "/id",
  "/en/projects",
  "/id/projects",
  "/en/projects/rh-house",
  "/id/projects/rh-house",
];

for (const route of routes) {
  test(`${route} has title, canonical, hreflang and JSON-LD`, async ({ page }) => {
    await page.goto(route);
    expect((await page.title()).length).toBeGreaterThan(10);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", `${BASE}${route}`);
    const path = route.replace(/^\/(en|id)/, "");
    for (const [hreflang, href] of [
      ["en", `/en${path}`],
      ["id", `/id${path}`],
      ["x-default", `/en${path}`],
    ] as const) {
      await expect(page.locator(`link[rel="alternate"][hreflang="${hreflang}"]`)).toHaveAttribute(
        "href",
        `${BASE}${href}`,
      );
    }
    for (const sel of [
      'meta[name="description"]',
      'meta[property="og:description"]',
      'meta[name="twitter:description"]',
    ]) {
      const content = (await page.locator(sel).getAttribute("content")) ?? "";
      expect(content.length, sel).toBeGreaterThan(10);
      expect(content, sel).not.toMatch(/\[[^\]]+\]/);
    }
    const blocks = await page.locator('script[type="application/ld+json"]').allTextContents();
    const types = blocks.map((b) => (JSON.parse(b) as { "@type": string })["@type"]);
    expect(types).toContain("HomeAndConstructionBusiness");
    if (route.includes("/projects/")) expect(types).toContain("BreadcrumbList");
    expect(blocks.join("")).not.toMatch(/\[[^\]"{}[]+\]/);
  });
}

test("id home title uses local search terms", async ({ page }) => {
  await page.goto("/id");
  await expect(page).toHaveTitle(/Jasa Desain Interior Surabaya/);
});

test("sitemap lists every localized URL", async ({ request }) => {
  const xml = await (await request.get("/sitemap.xml")).text();
  expect(xml.match(/<url>/g)).toHaveLength(14);
  expect(xml).toContain('hreflang="x-default"');
});
