import { expect, test } from "@playwright/test";

test("root redirects to /en", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveURL(/\/en$/);
});

for (const lang of ["en", "id"] as const) {
  test(`/${lang} sets <html lang>`, async ({ page }) => {
    await page.goto(`/${lang}`);
    await expect(page.locator("html")).toHaveAttribute("lang", lang);
  });
}

test("unknown locale returns 404", async ({ request }) => {
  expect((await request.get("/fr")).status()).toBe(404);
});

// Enabled in Task 9, when the project detail route exists.
test.fixme("unknown project slug returns 404", async ({ request }) => {
  expect((await request.get("/en/projects/does-not-exist")).status()).toBe(404);
});
