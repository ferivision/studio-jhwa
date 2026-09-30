import { expect, test } from "@playwright/test";

for (const path of [
  "/en",
  "/id/projects",
  "/en/projects/rh-house",
  "/favicon.svg",
  "/sitemap.xml",
]) {
  test(`${path} sends security headers`, async ({ request }) => {
    const res = await request.get(path);
    const h = res.headers();
    expect(h["content-security-policy"]).toContain("frame-ancestors 'none'");
    expect(h["x-content-type-options"]).toBe("nosniff");
    expect(h["referrer-policy"]).toBe("strict-origin-when-cross-origin");
    expect(h["permissions-policy"]).toBeTruthy();
    expect(h["x-powered-by"]).toBeUndefined();
  });
}

test("pages load with no CSP violations", async ({ page }) => {
  const violations: string[] = [];
  page.on("console", (msg) => {
    if (msg.type() === "error" && /Content Security Policy/i.test(msg.text())) {
      violations.push(msg.text());
    }
  });
  for (const path of ["/en", "/en/projects", "/en/projects/rh-house"]) await page.goto(path);
  expect(violations).toEqual([]);
});

test("external links are opened safely", async ({ page }) => {
  for (const path of ["/en", "/en/projects/rh-house"]) {
    await page.goto(path);
    const unsafe = await page
      .locator('a[target="_blank"]')
      .evaluateAll(
        (links) =>
          links.filter(
            (a) =>
              !/noopener/.test(a.getAttribute("rel") ?? "") ||
              !/noreferrer/.test(a.getAttribute("rel") ?? ""),
          ).length,
      );
    expect(unsafe).toBe(0);
  }
});
