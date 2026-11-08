import { expect, test } from "@playwright/test";

test("home page shows the value proposition and auth entry points", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Reliable local help");
  await expect(page.getByRole("link", { name: "Post a job" })).toBeVisible();
});

test("a client can sign in and see their jobs", async ({ page }) => {
  await page.goto("/login");
  await page.getByLabel("Phone number").fill("0911000001");
  await page.getByLabel("Password").fill("password123");
  await page.getByRole("button", { name: "Sign in" }).click();

  await expect(page).toHaveURL(/\/client\/jobs$/);
  await expect(page.getByRole("heading", { name: "My jobs" })).toBeVisible();
  await expect(page.getByText("Fix leaking kitchen sink")).toBeVisible();
});

test("an invalid sign-in stays on the login page", async ({ page }) => {
  await page.goto("/login");
  await page.getByLabel("Phone number").fill("0911000001");
  await page.getByLabel("Password").fill("not-the-password");
  await page.getByRole("button", { name: "Sign in" }).click();

  await expect(page).toHaveURL(/\/login/);
  await expect(page.getByText("Phone number or password is incorrect")).toBeVisible();
});

test("the demo offer link renders the five-minute offer card", async ({ page }) => {
  await page.goto("/o/demo-offer-token");
  await expect(page.getByText("Job offer")).toBeVisible();
  await expect(page.getByText("Repair a wardrobe door")).toBeVisible();
  await expect(page.getByRole("button", { name: "Accept job" })).toBeVisible();
  await expect(page.getByRole("timer")).toBeVisible();
});

test("workers are redirected to sign in for protected pages", async ({ page }) => {
  await page.goto("/worker");
  await expect(page).toHaveURL(/\/login\?next=%2Fworker/);
});
