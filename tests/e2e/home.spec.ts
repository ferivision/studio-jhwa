import { expect, test } from "@playwright/test";

test("home sections appear in the approved order", async ({ page }) => {
  await page.goto("/en");
  const headings = await page.locator("main h1, main h2").allInnerTexts();
  const normalized = headings.map((h) => h.replace(/\s+/g, " ").trim());
  expect(normalized).toEqual([
    "Formed by flow, built on principles.",
    "Selected projects",
    "Rooms we've shaped.",
    "From line to light.",
    "What we do",
    "Built, not just rendered.",
    "Good to know",
  ]);
  await expect(page.locator("main section#rooms")).toHaveAttribute("aria-label", "Explore by room");
});

test("only the hero image is eagerly loaded", async ({ page }) => {
  await page.goto("/en");
  const hero = page.locator("section#top img");
  // Next 16 renders a preloaded image with no `loading` attribute (browser default = eager).
  await expect(hero).not.toHaveAttribute("loading", /.+/);
  const lazy = await page
    .locator("main img:not(section#top img)")
    .evaluateAll((imgs) => imgs.every((img) => img.getAttribute("loading") === "lazy"));
  expect(lazy).toBe(true);
});

test("line-to-light slider responds to the keyboard", async ({ page }) => {
  await page.goto("/en");
  const slider = page.getByRole("slider", { name: "Drag to compare" });
  await slider.focus();
  await expect(slider).toHaveValue("50");
  await page.keyboard.press("ArrowRight");
  await page.keyboard.press("ArrowRight");
  await expect(slider).toHaveValue("52");
});

test.describe("reduced motion", () => {
  test.use({ reducedMotion: "reduce" });
  test("film strip does not animate", async ({ page }) => {
    await page.goto("/en");
    const iterations = await page
      .locator("[data-film-strip]")
      .evaluate((el) => getComputedStyle(el).animationIterationCount);
    expect(iterations).toBe("1");
  });
});

test("every image has a non-empty alt except decorative duplicates", async ({ page }) => {
  for (const lang of ["en", "id"]) {
    await page.goto(`/${lang}`);
    const bad = await page
      .locator("main img")
      .evaluateAll(
        (imgs) =>
          imgs.filter((img) => !img.closest("[aria-hidden='true']") && !img.getAttribute("alt"))
            .length,
      );
    expect(bad).toBe(0);
  }
});
