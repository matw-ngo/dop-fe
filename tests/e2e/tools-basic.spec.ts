import { test, expect } from "@playwright/test";

test.describe("Financial Tools - Basic Verification", () => {
  test("All tools pages are accessible", async ({ page }) => {
    // Test all tools pages are accessible
    const tools = [
      { path: "/vi/tools/savings-calculator", title: "Tính Lãi Tiền Gửi" },
      { path: "/vi/tools/loan-calculator", title: "Tính Toán Khoản Vay" },
      {
        path: "/vi/tools/gross-to-net-calculator",
        title: "Tính Lương Gross sang Net",
      },
      {
        path: "/vi/tools/net-to-gross-calculator",
        title: "Tính Lương Net sang Gross",
      },
    ];

    for (const tool of tools) {
      await page.goto(tool.path);

      // Check page loads (no 404)
      await expect(page.locator("body")).not.toContainText("404");

      // Check main heading exists
      const h1 = page.locator("h1");
      if (await h1.isVisible()) {
        await expect(h1).toContainText(tool.title);
      }
    }
  });

  test("Savings Calculator - Basic functionality", async ({ page }) => {
    await page.goto("/vi/tools/savings-calculator");

    // Check calculator elements exist
    await expect(page.locator("h1")).toBeVisible();
    await expect(page.locator("text=Savings Calculator")).toBeVisible();

    // Check form elements are present
    await expect(
      page.locator('input[placeholder*="Enter amount"]'),
    ).toBeVisible();

    // Check results area
    await expect(page.locator("text=Bank Comparison Results")).toBeVisible();
  });

  test("Loan Calculator - Basic functionality", async ({ page }) => {
    await page.goto("/vi/tools/loan-calculator");

    // Check calculator elements exist
    await expect(page.locator("h1")).toBeVisible();
    await expect(page.locator("text=Loan Calculator")).toBeVisible();

    // Check form elements are present
    await expect(page.locator("#amount")).toBeVisible();
    await expect(page.locator("#rate")).toBeVisible();

    // Check results area
    await expect(page.locator("text=Góp hàng tháng")).toBeVisible();
  });

  test("Gross to Net Calculator - Basic functionality", async ({ page }) => {
    await page.goto("/vi/tools/gross-to-net-calculator");

    // Check calculator elements exist
    await expect(page.locator("h1")).toBeVisible();
    await expect(page.locator("text=Calculator")).toBeVisible();

    // Check form elements are present
    await expect(page.locator("#gross")).toBeVisible();
    await expect(page.locator("#dependents")).toBeVisible();

    // Check results area
    await expect(page.locator("text=Lương GROSS")).toBeVisible();
    await expect(page.locator("text=Lương NET")).toBeVisible();
  });

  test("Net to Gross Calculator - Basic functionality", async ({ page }) => {
    await page.goto("/vi/tools/net-to-gross-calculator");

    // Check calculator elements exist
    await expect(page.locator("h1")).toBeVisible();
    await expect(page.locator("text=Calculator")).toBeVisible();

    // Check form elements are present
    await expect(page.locator("#net")).toBeVisible();
    await expect(page.locator("#dependents")).toBeVisible();
  });

  test("Interactive elements work", async ({ page }) => {
    await page.goto("/vi/tools/savings-calculator");

    // Wait for page to load
    await page.waitForSelector('input[placeholder*="Enter amount"]');

    // Try to interact with amount input
    await page.fill('input[placeholder*="Enter amount"]', "50000000");

    // Verify input was filled
    const input = page.locator('input[placeholder*="Enter amount"]');
    await expect(input).toHaveValue(/50\.000/);

    // Try to click period selector
    const periodSelector = page.locator("#period");
    if (await periodSelector.isVisible()) {
      await periodSelector.click();
      // Check if dropdown opens
      await expect(page.locator("text=6 tháng")).toBeVisible();
    }
  });
});
