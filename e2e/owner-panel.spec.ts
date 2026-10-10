import { expect, test, type Page } from "@playwright/test";
import { E2E_OWNER } from "./test-owner";

const PHOTO = {
  name: "ply.png",
  mimeType: "image/png",
  buffer: Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
    "base64",
  ),
};
const NEW_PASSWORD = "green door 42 lamp";

function loginError(page: Page) {
  return page.getByRole("alert").filter({ hasText: "Incorrect username or password" });
}

async function logIn(page: Page, password: string) {
  await page.goto("/admin/login");
  await page.getByLabel(/Username/).fill(E2E_OWNER.username);
  await page.getByLabel(/Password/).fill(password);
  await page.getByRole("button", { name: "Log in" }).click();
}

async function clickAndSave(page: Page, click: () => Promise<void>) {
  await page.waitForLoadState("domcontentloaded");
  const saved = page.waitForResponse((response) => response.request().method() === "POST" && response.ok());
  await click();
  await saved;
}

function productRow(page: Page, name: string) {
  return page.getByRole("listitem").filter({ has: page.getByRole("heading", { name, exact: true }) });
}

async function choose(page: Page, menu: string, option: string) {
  await page.getByRole("button", { name: new RegExp(`^${menu}:`) }).click();
  await page.getByRole("option", { name: option, exact: true }).click();
}

async function expectPublicPage(page: Page, path: string, check: (page: Page) => Promise<void>) {
  await expect(async () => {
    await page.goto(path);
    await check(page);
  }).toPass({ timeout: 30_000 });
}

test("clears the navigation loader after browser back", async ({ page }) => {
  await logIn(page, E2E_OWNER.password);
  await expect(page).toHaveURL(/\/admin$/);

  await page.getByRole("navigation", { name: "Owner panel" }).getByRole("link", { name: "Products" }).click();
  await expect(page).toHaveURL(/\/admin\/products$/);
  await expect(page.getByText("Loading page...", { exact: true })).toHaveCount(0);

  await page.goBack();
  await expect(page).toHaveURL(/\/admin$/);
  await expect(page.getByText("Loading page...", { exact: true })).toHaveCount(0);
});

test("the owner manages a product from login to logout", async ({ page }) => {
  test.setTimeout(240_000);
  const name = `E2E Marine Ply ${Date.now()}`;
  let productPath = "";

  await test.step("the panel needs a login and rejects a wrong password", async () => {
    await page.goto("/admin");
    await expect(page).toHaveURL(/\/admin\/login$/);
    await logIn(page, "wrong-password");
    await expect(loginError(page)).toBeVisible();
  });

  await test.step("the owner logs in", async () => {
    await logIn(page, E2E_OWNER.password);
    await expect(page).toHaveURL(/\/admin$/);
    await expect(page.getByRole("heading", { name: `Namaste, ${E2E_OWNER.username}` })).toBeVisible();
  });

  await test.step("adds a product with a photo", async () => {
    await page.goto("/admin/products/new");
    await page.getByLabel(/Product name/).fill(name);
    await page.getByLabel(/Brand/).fill("Century");
    await choose(page, "Category", "Plywood & Boards");
    await choose(page, "Type", "BWP / Marine Plywood");
    await choose(page, "Price unit", "Sheet");
    await page.getByRole("button", { name: /^Sizes:/ }).click();
    await page.getByRole("option", { name: "8 x 4 ft", exact: true }).click();
    await page.getByRole("option", { name: "18 mm", exact: true }).click();
    await page.getByRole("button", { name: "Done" }).click();
    await expect(page.getByRole("button", { name: "Sizes: 8 x 4 ft, 18 mm" })).toBeVisible();
    await page.getByLabel(/Starting price/).fill("1250");
    await page.getByLabel(/Photo/).setInputFiles(PHOTO);
    await expect(page.getByRole("img", { name: "New photo" })).toBeVisible();
    await page.getByRole("button", { name: "Save product" }).click();
    await expect(page).toHaveURL(/\/admin\/products$/);
    await expect(page.getByText("Loading page...", { exact: true })).toHaveCount(0);
    await expect(productRow(page, name)).toContainText("Century · BWP / Marine Plywood · From ₹1,250 per sheet");

    const href = await page.getByRole("link", { name, exact: true }).getAttribute("href");
    productPath = href!.replace("/admin", "");
  });

  await test.step("the product and its photo show on the website", async () => {
    await expectPublicPage(page, productPath, async (publicPage) => {
      await expect(publicPage.getByRole("heading", { level: 1 })).toHaveText(name);
      await expect(publicPage.getByText("Available in store")).toBeVisible();
      const photo = publicPage.getByRole("img", { name }).first();
      await expect(photo).toBeVisible();
      await expect.poll(() => photo.evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0)).toBe(true);
    });
  });

  await test.step("marks it out of stock with one tap", async () => {
    await page.goto("/admin/products");
    const inStock = page.getByRole("switch", { name: `${name} in stock` });
    await clickAndSave(page, () => inStock.click());
    await expect(inStock).toHaveAttribute("aria-checked", "false");
    await expectPublicPage(page, productPath, async (publicPage) => {
      await expect(publicPage.getByText("Out of stock — ask for availability")).toBeVisible();
    });
    await expectPublicPage(page, "/products/plywood-boards/bwp-marine-plywood", async (publicPage) => {
      await expect(publicPage.getByRole("link", { name, exact: true })).toBeVisible();
    });
    expect((await page.request.get("/products/paints/interior-emulsion")).status()).toBe(200);
  });

  await test.step("puts it on the home page", async () => {
    await page.goto("/admin/products");
    const featured = page.getByRole("switch", { name: `${name} on the home page` });
    await clickAndSave(page, () => featured.click());
    await expect(featured).toHaveAttribute("aria-checked", "true");
    await expectPublicPage(page, "/", async (publicPage) => {
      await expect(publicPage.getByText(name).first()).toBeVisible();
    });
  });

  await test.step("hides it after confirming, then shows it again", async () => {
    await page.goto("/admin/products");
    await page.getByRole("button", { name: `Hide ${name}` }).click();
    const dialog = page.getByRole("dialog", { name: `Hide ${name}?` });
    await clickAndSave(page, () => dialog.getByRole("button", { name: "Hide product" }).click());
    await expect(page.getByRole("button", { name: `Show ${name}` })).toBeVisible();
    await expect(async () => {
      expect((await page.request.get(productPath)).status()).toBe(404);
    }).toPass({ timeout: 15_000 });

    await clickAndSave(page, () => page.getByRole("button", { name: `Show ${name}` }).click());
    await expect(page.getByRole("button", { name: `Hide ${name}` })).toBeVisible();
    await expect(async () => {
      expect((await page.request.get(productPath)).status()).toBe(200);
    }).toPass({ timeout: 15_000 });
  });

  await test.step("edits the brand and price", async () => {
    await page.goto("/admin/products");
    await page.getByRole("link", { name: `Edit ${name}` }).click();
    await page.getByLabel(/Brand/).fill("Greenply");
    await page.getByLabel(/Starting price/).fill("1300");
    await page.getByRole("button", { name: "Save product" }).click();
    await expect(page).toHaveURL(/\/admin\/products$/);
    await expect(page.getByText("Loading page...", { exact: true })).toHaveCount(0);
    await expect(productRow(page, name)).toContainText("Greenply · BWP / Marine Plywood · From ₹1,300 per sheet");
    await expectPublicPage(page, productPath, async (publicPage) => {
      await expect(publicPage.getByRole("main").getByText("Greenply", { exact: true })).toBeVisible();
    });
  });

  await test.step("runs a dated offer, then deletes it after confirming", async () => {
    const offerTitle = `E2E Diwali offer ${Date.now()}`;
    const today = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" }).format(new Date());
    await page.goto("/admin");
    await page.getByRole("navigation", { name: "Owner panel" }).getByRole("link", { name: "Offers" }).click();
    await page.getByRole("link", { name: "Add an offer" }).click();
    await page.getByLabel(/Offer title/).fill(offerTitle);
    await page.getByLabel(/Offer details/).fill("10% off on Royale this week");
    await page.getByLabel(/Start date/).fill(today);
    await page.getByLabel(/End date/).fill(today);
    await page.getByRole("button", { name: "Save offer" }).click();
    await expect(page).toHaveURL(/\/admin\/offers$/);
    await expect(productRow(page, offerTitle)).toContainText("Live");

    await expectPublicPage(page, "/offers", async (publicPage) => {
      await expect(publicPage.getByRole("heading", { name: offerTitle })).toBeVisible();
    });

    await page.goto("/admin/offers");
    await page.getByRole("button", { name: `Delete ${offerTitle}` }).click();
    const dialog = page.getByRole("dialog", { name: `Delete "${offerTitle}"?` });
    await clickAndSave(page, () => dialog.getByRole("button", { name: "Delete offer" }).click());
    await expect(page.getByRole("heading", { name: offerTitle })).toHaveCount(0);
    await expectPublicPage(page, "/offers", async (publicPage) => {
      await expect(publicPage.getByRole("heading", { name: offerTitle })).toHaveCount(0);
    });
  });

  await test.step("hides a type with products after confirming, then shows it again", async () => {
    const typePath = "/products/paints/waterproofing-paint";
    await page.goto("/admin");
    await page.getByRole("navigation", { name: "Owner panel" }).getByRole("link", { name: "Categories" }).click();
    await page.getByRole("link", { name: "Edit Paints" }).click();
    await expect(page.getByRole("heading", { name: "Types in Paints" })).toBeVisible();

    const toggle = page.getByRole("switch", { name: "Waterproofing Paint on the website" });
    await toggle.click();
    const dialog = page.getByRole("dialog", { name: /^Hide Waterproofing Paint and its/ });
    await clickAndSave(page, () => dialog.getByRole("button", { name: "Hide from website" }).click());
    await expect(async () => expect((await page.request.get(typePath)).status()).toBe(404)).toPass({ timeout: 30_000 });

    await page.reload();
    await clickAndSave(page, () => page.getByRole("switch", { name: "Waterproofing Paint on the website" }).click());
    await expect(async () => expect((await page.request.get(typePath)).status()).toBe(200)).toPass({ timeout: 30_000 });
  });

  await test.step("changes the password", async () => {
    await page.goto("/admin");
    await page.getByRole("navigation", { name: "Owner panel" }).getByRole("link", { name: "Password" }).click();
    await page.getByLabel(/Current password/).fill(E2E_OWNER.password);
    await page.getByLabel(/^New password/).fill(NEW_PASSWORD);
    await page.getByLabel(/Type the new password again/).fill(NEW_PASSWORD);
    await page.getByRole("button", { name: "Change password" }).click();
    await expect(page.getByRole("status")).toContainText("Password changed");
  });

  await test.step("logs out, and only the new password works", async () => {
    await page.getByRole("button", { name: "Log out" }).click();
    await expect(page).toHaveURL(/\/admin\/login$/);
    await logIn(page, E2E_OWNER.password);
    await expect(loginError(page)).toBeVisible();
    await logIn(page, NEW_PASSWORD);
    await expect(page).toHaveURL(/\/admin$/);
  });
});
