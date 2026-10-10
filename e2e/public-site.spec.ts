import { expect, test } from "@playwright/test";

const NAV_PAGES = [
  { path: "/", link: "Home" },
  { path: "/products", link: "Products" },
  { path: "/products/paints", link: "Products" },
  { path: "/products/paints/interior-emulsion", link: "Products" },
  { path: "/categories", link: "Products" },
  { path: "/brands", link: "Brands" },
  { path: "/brands/asian-paints", link: "Brands" },
  { path: "/offers", link: "Offers" },
  { path: "/about", link: "About" },
  { path: "/contact", link: "Contact" },
];

for (const { path, link } of NAV_PAGES) {
  test(`${path} loads and highlights ${link} in the navbar`, async ({ page }) => {
    const response = await page.goto(path);
    expect(response?.status()).toBe(200);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    const navbar = page.getByRole("navigation", { name: "Main" });
    await expect(navbar.getByRole("link", { name: link, exact: true })).toHaveAttribute("aria-current", "page");
  });
}

test("a product page shows the product and an unknown one is a 404", async ({ page }) => {
  expect((await page.goto("/products/ap-royale-luxury"))?.status()).toBe(200);
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Royale");

  expect((await page.goto("/products/not-a-real-product"))?.status()).toBe(404);
});

test("old category addresses move permanently to the new categories", async ({ page }) => {
  for (const [from, to] of [
    ["/products/plywood/marine", "/products/plywood-boards/bwp-marine-plywood"],
    ["/products/paints/putty", "/products/paint-preparation/wall-putty"],
    ["/products/hardware", "/products/furniture-hardware"],
    ["/products/plumbing", "/products"],
  ]) {
    const response = await page.request.get(from, { maxRedirects: 0 });
    expect(response.status()).toBe(308);
    expect(new URL(response.headers().location, "http://x").pathname).toBe(to);
  }
});

test("phone and WhatsApp links point at the shop", async ({ page }) => {
  await page.goto("/contact");
  await expect(page.locator('a[href^="tel:"]').first()).toBeVisible();
  await expect(page.locator('a[href*="wa.me"]').first()).toBeAttached();
});

test("the enquiry form asks before discarding what was typed", async ({ page }) => {
  await page.goto("/enquiry");
  await page.getByLabel(/Your name/).fill("Ravi");
  await page.getByRole("navigation", { name: "Main" }).getByRole("link", { name: "Brands", exact: true }).click();

  const dialog = page.getByRole("dialog", { name: "Discard unsaved changes?" });
  await expect(dialog).toBeVisible();
  await dialog.getByRole("button", { name: "Keep editing" }).click();
  await expect(page).toHaveURL(/\/enquiry$/);
  await expect(page.getByLabel(/Your name/)).toHaveValue("Ravi");
});

test("the paint calculator gives an estimate and confirms before opening WhatsApp", async ({ page }) => {
  await page.goto("/paint-calculator/ap-royale-luxury");
  await page.getByLabel("Length (ft)").fill("12");
  await page.getByLabel("Width (ft)").fill("10");
  await page.getByLabel("Height (ft)").fill("10");
  await page.getByRole("button", { name: "Calculate" }).click();

  await expect(page.getByRole("heading", { name: /You need about .* L of/ })).toBeVisible();
  await page.getByRole("button", { name: "Send estimate on WhatsApp" }).click();
  const dialog = page.getByRole("dialog", { name: "Send this estimate on WhatsApp?" });
  await expect(dialog.getByRole("button", { name: "Open WhatsApp" })).toBeVisible();
  await dialog.getByRole("button", { name: "Cancel" }).click();
  await expect(dialog).toBeHidden();
});
