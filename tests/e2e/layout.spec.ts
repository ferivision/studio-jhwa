import { expect, test } from "@playwright/test";

test("skip link moves focus to main content", async ({ page }) => {
  await page.goto("/en/projects");
  await page.keyboard.press("Tab");
  const skip = page.getByRole("link", { name: "Skip to content" });
  await expect(skip).toBeFocused();
  await skip.press("Enter");
  await expect(page).toHaveURL(/#main$/);
  await expect(page.locator("main#main")).toBeFocused();
});

// Task 9 moves this to /en/projects/rh-house and /id/projects/rh-house.
test("language switch keeps the current path", async ({ page, isMobile }) => {
  await page.goto("/en/projects");
  if (isMobile) await page.getByRole("button", { name: "Open menu" }).click();
  await page
    .getByRole("link", { name: /Bahasa Indonesia/ })
    .first()
    .click();
  await expect(page).toHaveURL(/\/id\/projects$/);
  await expect(page.locator("html")).toHaveAttribute("lang", "id");
});

test("footer shows contact data from site.json", async ({ page }) => {
  await page.goto("/en");
  const contact = page.locator("#contact");
  await expect(contact.getByRole("link", { name: "@studio.jhwa" })).toHaveAttribute(
    "rel",
    "noopener noreferrer",
  );
});

test.describe("mobile menu", () => {
  test.skip(({ isMobile }) => !isMobile, "mobile only");

  test("opens, traps focus, closes on Escape and restores focus", async ({ page }) => {
    await page.goto("/en/projects");
    const toggle = page.getByRole("button", { name: "Open menu" });
    await expect(toggle).toHaveAttribute("aria-expanded", "false");
    await toggle.click();
    const dialog = page.getByRole("dialog", { name: "Menu" });
    await expect(dialog).toBeVisible();
    await expect(page.getByRole("button", { name: "Close menu" })).toHaveAttribute(
      "aria-expanded",
      "true",
    );
    for (let i = 0; i < 12; i++) {
      await page.keyboard.press("Tab");
      expect(await dialog.evaluate((el) => el.contains(document.activeElement))).toBe(true);
    }
    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
    await expect(toggle).toBeFocused();
  });
});
