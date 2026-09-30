import { expect, test } from "@playwright/test";

test("full project renders every block", async ({ page }) => {
  await page.goto("/en/projects/rh-house");
  await expect(page.getByRole("heading", { level: 1, name: "RH House" })).toBeVisible();
  for (const term of ["Location", "Type", "Area", "Scope", "Duration", "Year"]) {
    await expect(page.locator("dt", { hasText: term })).toBeVisible();
  }
  await expect(page.getByRole("heading", { name: "The brief" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "From line to light." })).toBeVisible();
  await expect(page.getByRole("link", { name: "RS House" })).toHaveAttribute(
    "href",
    "/en/projects/rs-house",
  );
});

test("project without gallery or drawing shows no empty sections", async ({ page }) => {
  await page.goto("/id/projects/nn-house");
  await expect(page.getByRole("heading", { level: 1, name: "NN House" })).toBeVisible();
  await expect(page.locator("[data-gallery]")).toHaveCount(0);
  await expect(page.getByRole("heading", { name: "From line to light." })).toHaveCount(0);
  const broken = await page
    .locator("main img")
    .evaluateAll(
      (imgs) =>
        imgs.filter(
          (img) =>
            (img as HTMLImageElement).complete && (img as HTMLImageElement).naturalWidth === 0,
        ).length,
    );
  expect(broken).toBe(0);
  await expect(page.getByRole("link", { name: "RH House" })).toHaveAttribute(
    "href",
    "/id/projects/rh-house",
  );
});
