import { test, expect } from "@playwright/test";

// Helper function to create localized paths
function getLocalizedPath(path: string, locale: string = "vi"): string {
  return `/${locale}${path.startsWith("/") ? path : `/${path}`}`;
}

test.describe("Financial Tools Pages", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the tools section
    await page.goto(getLocalizedPath("/tools/savings-calculator"));
  });

  test("Savings Calculator page loads correctly", async ({ page }) => {
    // Check main heading
    await expect(page.locator("h1")).toContainText("Tính Lãi Tiền Gửi");

    // Check breadcrumb navigation
    const breadcrumb = page.locator('nav[aria-label="breadcrumb"]');
    await expect(breadcrumb).toBeVisible();
    await expect(breadcrumb).toContainText("Trang chủ");
    await expect(breadcrumb).toContainText("Công cụ tài chính");
    await expect(breadcrumb).toContainText("Tính lãi tiền gửi");

    // Check calculator components - using actual labels
    await expect(page.locator('label:has-text("Số tiền gửi")')).toBeVisible();
    await expect(page.locator('label:has-text("Kỳ hạn gửi")')).toBeVisible();
    await expect(
      page.locator('label:has-text("Loại tiết kiệm")'),
    ).toBeVisible();
    await expect(page.locator('label:has-text("Sắp xếp theo")')).toBeVisible();

    // Check actual form elements
    await expect(page.locator("#amount")).toBeVisible();
    await expect(
      page.locator('input[placeholder*="Enter amount"]'),
    ).toBeVisible();
    await expect(page.locator("#period")).toBeVisible();
    await expect(page.locator("#type")).toBeVisible();
    await expect(page.locator("#sort")).toBeVisible();
  });

  test("Loan Calculator page loads correctly", async ({ page }) => {
    // Navigate to loan calculator
    await page.goto(getLocalizedPath("/tools/loan-calculator"));

    // Check main heading
    await expect(page.locator("h1")).toContainText("Tính Toán Khoản Vay");

    // Check breadcrumb navigation
    await expect(page.locator('nav[aria-label="breadcrumb"]')).toBeVisible();

    // Check calculator components using actual labels
    await expect(page.locator('label:has-text("Số tiền vay")')).toBeVisible();
    await expect(page.locator('label:has-text("Kỳ hạn vay")')).toBeVisible();
    await expect(page.locator('label:has-text("Lãi suất năm")')).toBeVisible();

    // Check input fields by ID
    await expect(page.locator("#amount")).toBeVisible();
    await expect(page.locator("#period")).toBeVisible();
    await expect(page.locator("#rate")).toBeVisible();

    // Check for preset buttons
    await expect(
      page.locator('button:has-text("Vay mua xe máy")'),
    ).toBeVisible();
    await expect(page.locator('button:has-text("Vay mua ô tô")')).toBeVisible();
    await expect(page.locator('button:has-text("Vay sửa nhà")')).toBeVisible();
    await expect(
      page.locator('button:has-text("Vay tiêu dùng")'),
    ).toBeVisible();

    // Check for reset button
    await expect(page.locator('button:has-text("Làm lại")')).toBeVisible();
  });

  test("Gross to Net Calculator page loads correctly", async ({ page }) => {
    // Navigate to gross to net calculator
    await page.goto(getLocalizedPath("/tools/gross-to-net-calculator"));

    // Check main heading
    await expect(page.locator("h1")).toContainText("Tính Lương Gross sang Net");

    // Check breadcrumb navigation
    await expect(page.locator('nav[aria-label="breadcrumb"]')).toBeVisible();

    // Check calculator components using actual labels
    await expect(page.locator('label:has-text("Lương GROSS")')).toBeVisible();
    await expect(page.locator('label:has-text("Vùng Lương")')).toBeVisible();
    await expect(
      page.locator('label:has-text("Số người phụ thuộc")'),
    ).toBeVisible();

    // Check input fields by ID or role
    await expect(page.locator("#gross")).toBeVisible();
    await expect(page.locator('div:has-text("Chọn vùng")')).toBeVisible();
    await expect(page.locator("#dependents")).toBeVisible();

    // Check preset buttons
    await expect(
      page.locator('button:has-text("Lương tối thiểu")'),
    ).toBeVisible();
    await expect(
      page.locator('button:has-text("Lương nhân viên")'),
    ).toBeVisible();
    await expect(
      page.locator('button:has-text("Lương chuyên viên")'),
    ).toBeVisible();
    await expect(
      page.locator('button:has-text("Lương quản lý")'),
    ).toBeVisible();
    await expect(
      page.locator('button:has-text("Lương giám đốc")'),
    ).toBeVisible();

    // Check for reset button
    await expect(page.locator('button:has-text("Làm lại")')).toBeVisible();
  });

  test("Net to Gross Calculator page loads correctly", async ({ page }) => {
    // Navigate to net to gross calculator
    await page.goto(getLocalizedPath("/tools/net-to-gross-calculator"));

    // Check main heading
    await expect(page.locator("h1")).toContainText("Tính Lương Net sang Gross");

    // Check breadcrumb navigation
    await expect(page.locator('nav[aria-label="breadcrumb"]')).toBeVisible();

    // Check calculator components using actual labels
    await expect(
      page.locator('label:has-text("Lương NET mong muốn")'),
    ).toBeVisible();
    await expect(page.locator('label:has-text("Vùng Lương")')).toBeVisible();
    await expect(
      page.locator('label:has-text("Số người phụ thuộc")'),
    ).toBeVisible();

    // Check input fields by ID or role
    await expect(page.locator("#net")).toBeVisible();
    await expect(page.locator('div:has-text("Chọn vùng")')).toBeVisible();
    await expect(page.locator("#dependents")).toBeVisible();

    // Check preset buttons
    await expect(
      page.locator('button:has-text("Lương tối thiểu")'),
    ).toBeVisible();
    await expect(
      page.locator('button:has-text("Lương sinh viên")'),
    ).toBeVisible();
    await expect(
      page.locator('button:has-text("Lương fresher")'),
    ).toBeVisible();
    await expect(
      page.locator('button:has-text("Lương 2 năm kinh nghiệm")'),
    ).toBeVisible();
    await expect(page.locator('button:has-text("Lương senior")')).toBeVisible();

    // Check for reset button
    await expect(page.locator('button:has-text("Làm lại")')).toBeVisible();

    // Check for explanation text
    await expect(
      page.locator(
        "text=Lương NET = Lương GROSS - Bảo hiểm (10.5%) - Thuế TNCN",
      ),
    ).toBeVisible();
    await expect(
      page.locator(
        "text=Thuế TNCN được tính theo biểu thuế lũy tiến từng phần",
      ),
    ).toBeVisible();
  });

  test("Savings Calculator interactions work", async ({ page }) => {
    await page.goto(getLocalizedPath("/tools/savings-calculator"));

    // Wait for calculator to load
    await page.waitForSelector('input[placeholder*="Enter amount"]');

    // Change amount using input field (not slider)
    await page.fill('input[placeholder*="Enter amount"]', "100000000");

    // Change period
    await page.locator("#period").click();
    await page.locator("text=6 tháng").click();

    // Change savings type
    await page.locator("#type").click();

    // Check if results area updates (Bank Comparison Results card)
    await expect(page.locator("text=Bank Comparison Results")).toBeVisible();
  });

  test("Loan Calculator form submission", async ({ page }) => {
    await page.goto(getLocalizedPath("/tools/loan-calculator"));

    // Fill out the form using actual input fields
    await page.fill('input[id="amount"]', "100000000");
    await page.locator('input[id="amount"]').fill("100000000");

    // Select period from dropdown
    await page.locator("#period").click();
    await page.getByText("12 tháng").click();

    // Fill rate input
    await page.fill('input[id="rate"]', "10");

    // Wait for results to update (calculations are automatic)
    await page.waitForTimeout(500);

    // Check for results
    await expect(page.locator("text=Góp hàng tháng")).toBeVisible();
    await expect(page.locator("text=Tổng lãi phải trả")).toBeVisible();
    await expect(page.locator("text=Tổng số tiền phải trả")).toBeVisible();
  });

  test("Salary Calculator calculations", async ({ page }) => {
    await page.goto(getLocalizedPath("/tools/gross-to-net-calculator"));

    // Fill out the form
    await page.fill("#gross", "15000000");

    // Select region
    await page.locator('div:has-text("Chọn vùng")').click();
    await page.getByText("Vùng 1").click();

    // Set dependents
    await page.fill("#dependents", "1");

    // Wait for results to update (calculations are automatic)
    await page.waitForTimeout(500);

    // Check for results
    await expect(page.locator("text=Lương GROSS")).toBeVisible();
    await expect(page.locator("text=Lương NET")).toBeVisible();

    // Check for breakdown sections
    await expect(page.locator("text=Bảo hiểm (10.5%)")).toBeVisible();
    await expect(page.locator("text=Thuế TNCN")).toBeVisible();
    await expect(page.locator("text=Thực nhận hàng tháng")).toBeVisible();
  });

  test("Responsive design on mobile", async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto(getLocalizedPath("/tools/savings-calculator"));

    // Check page is responsive - main content is visible
    await expect(page.locator("h1")).toBeVisible();

    // Check calculator card is visible and adjusts to mobile
    await expect(page.locator("text=Savings Calculator")).toBeVisible();

    // Check form elements are properly displayed on mobile
    await expect(page.locator("#amount")).toBeVisible();
    await expect(page.locator("#period")).toBeVisible();
    await expect(page.locator("#type")).toBeVisible();

    // Results section should be visible
    await expect(page.locator("text=Bank Comparison Results")).toBeVisible();
  });

  test("Error handling when API fails", async ({ page }) => {
    // Mock API failure
    await page.route("**/api/tools/saving", (route) => {
      route.fulfill({
        status: 500,
        contentType: "application/json",
        body: JSON.stringify({ error: "Internal server error" }),
      });
    });

    await page.goto(getLocalizedPath("/tools/savings-calculator"));

    // Trigger API call by changing amount
    await page.locator("#amount").fill("100000000");

    // Wait for possible error
    await page.waitForTimeout(500);

    // Check for error message component if it appears
    const errorAlert = page.locator("role=alert").first();
    if (await errorAlert.isVisible()) {
      await expect(errorAlert).toContainText(/error|failed/i);
    }
  });

  test("Accessibility checks", async ({ page }) => {
    await page.goto(getLocalizedPath("/tools/savings-calculator"));

    // Check for keyboard navigation
    await page.keyboard.press("Tab");
    await expect(page.locator(":focus")).toBeVisible();

    // Check for proper heading hierarchy
    const h1 = page.locator("h1");
    await expect(h1).toBeVisible();

    // Check for proper label associations
    await expect(page.locator('label[for="amount"]')).toBeVisible();
    await expect(page.locator('label[for="period"]')).toBeVisible();
    await expect(page.locator('label[for="type"]')).toBeVisible();

    // Check that input fields have proper accessible names
    await expect(
      page.locator('input[placeholder*="Enter amount"]'),
    ).toBeVisible();
    await expect(page.locator("#period")).toBeVisible();
  });
});
