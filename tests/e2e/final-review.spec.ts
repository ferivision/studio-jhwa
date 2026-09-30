import { expect, test } from "@playwright/test";

test("contact CTA does not link to its own section", async ({ page }) => {
  await page.goto("/en");
  // WhatsApp when a real number is set, Instagram while it is a placeholder.
  const cta = page
    .locator("#contact")
    .getByRole("link", { name: /Chat on WhatsApp|Message us on Instagram/ });
  await expect(cta).toBeVisible();
  const href = await cta.getAttribute("href");
  expect(href).not.toBe("#contact");
  expect(href).toMatch(/^https:\/\/(wa\.me\/\d+|(www\.)?instagram\.com\/)/);
  await expect(cta).toHaveAttribute("rel", "noopener noreferrer");
});

test("tap targets are at least 44px tall at 360px", async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 780 });
  await page.goto("/en");
  const targets = [
    page.getByRole("link", { name: "Start a project" }).first(),
    page.getByRole("link", { name: "View all projects" }).first(),
  ];
  await page.goto("/en/projects/rh-house");
  targets.push(page.getByRole("link", { name: "All projects" }).first());
  await page.goto("/en");
  for (const locator of targets.slice(0, 2)) {
    const box = await locator.boundingBox();
    expect(box?.height ?? 0).toBeGreaterThanOrEqual(44);
  }
  await page.goto("/en/projects/rh-house");
  const back = await targets[2]?.boundingBox();
  expect(back?.height ?? 0).toBeGreaterThanOrEqual(44);
});

test("film strip can be paused with the keyboard-accessible toggle", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/en");
  const strip = page.locator("[data-film-strip]");
  await expect(strip).toHaveCSS("animation-play-state", "running");
  await page.locator("label", { hasText: "Pause animation" }).click();
  await expect(page.getByLabel("Pause animation")).toBeChecked();
  await expect(strip).toHaveCSS("animation-play-state", "paused");
});

test("OG and Twitter images 404 for an unknown locale", async ({ request }) => {
  expect((await request.get("/zz/opengraph-image")).status()).toBe(404);
  expect((await request.get("/zz/twitter-image")).status()).toBe(404);
  expect((await request.get("/en/opengraph-image")).status()).toBe(200);
});

test.describe("mobile menu", () => {
  test.skip(({ isMobile }) => !isMobile, "mobile only");

  test("releases the scroll lock when the viewport grows to lg", async ({ page }) => {
    await page.goto("/en/projects");
    await page.getByRole("button", { name: "Open menu" }).click();
    const dialog = page.getByRole("dialog", { name: "Menu" });
    await expect(dialog).toBeVisible();
    await page.setViewportSize({ width: 1180, height: 800 });
    await expect(dialog).toBeHidden();
    expect(await page.evaluate(() => document.body.style.overflow)).not.toBe("hidden");
  });
});
