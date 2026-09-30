import { expect, test } from "@playwright/test";

test("filter buttons toggle aria-pressed and filter the list", async ({ page }) => {
  await page.goto("/en/projects");
  const group = page.getByRole("group", { name: "Filter projects" });
  const all = group.getByRole("button", { name: "All" });
  const bedroom = group.getByRole("button", { name: "Bedroom" });
  const rows = page.locator("[data-project-row]");

  await expect(all).toHaveAttribute("aria-pressed", "true");
  await expect(rows).toHaveCount(5);

  await bedroom.click();
  await expect(bedroom).toHaveAttribute("aria-pressed", "true");
  await expect(all).toHaveAttribute("aria-pressed", "false");
  await expect(rows).toHaveCount(2);
  await expect(page.getByText("2 projects shown")).toBeAttached();

  await group.getByRole("button", { name: "Kids room" }).click();
  await expect(rows).toHaveCount(1);
});

test("rows link to project detail pages", async ({ page }) => {
  await page.goto("/id/projects");
  await expect(page.locator("[data-project-row]").first()).toHaveAttribute(
    "href",
    "/id/projects/rh-house",
  );
});

test("filter works with the keyboard", async ({ page }) => {
  await page.goto("/en/projects");
  const house = page.getByRole("button", { name: "House" });
  await house.focus();
  await page.keyboard.press("Enter");
  await expect(house).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator("[data-project-row]")).toHaveCount(2);
});
