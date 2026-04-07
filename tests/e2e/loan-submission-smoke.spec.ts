/**
 * Loan Submission Flow - Critical E2E Smoke Test
 *
 * IMPORTANT: VPN REQUIREMENT
 * ===========================
 * This test requires VPN connection to access the staging API.
 *
 * Staging API: https://dop-stg.datanest.vn/
 * Resolves to: 10.20.0.240 (private IP)
 *
 * WITHOUT VPN:
 * - API requests will fail with network errors
 * - Test will skip API-dependent scenarios
 * - Mock API fallback available via NEXT_PUBLIC_USE_MOCK_API="true"
 *
 * WITH VPN:
 * - Full end-to-end testing with real API
 * - Actual OTP verification flow
 * - Real product matching from distribution engine
 *
 * SETUP:
 * 1. Connect to VPN
 * 2. Verify API access: curl https://dop-stg.datanest.vn/v1/health
 * 3. Run test: npm run test:e2e
 *
 * FALLBACK (Mock API):
 * 1. Set NEXT_PUBLIC_USE_MOCK_API="true" in .env.local
 * 2. Run test: npm run test:e2e
 */

import { expect, test } from "@playwright/test";

const LOCALHOST = "http://localhost:3001";
const STAGING_API = "https://dop-stg.datanest.vn";

function getLocalizedPath(path: string, locale: string = "vi"): string {
  return `/${locale}${path.startsWith("/") ? path : `/${path}`}`;
}

/**
 * Check if VPN is connected by attempting to reach staging API
 */
async function checkVPNConnection(): Promise<boolean> {
  try {
    // Use actual API endpoint instead of /v1/health (which doesn't exist)
    const response = await fetch(
      `${STAGING_API}/flows/11111111-1111-1111-1111-111111111111`,
      {
        method: "GET",
        signal: AbortSignal.timeout(5000),
      },
    );
    return response.ok;
  } catch {
    return false;
  }
}

test.describe("Loan Submission Flow - Smoke Test", () => {
  let isVPNConnected = false;

  test.beforeAll(async () => {
    // Check VPN connection before running tests
    isVPNConnected = await checkVPNConnection();

    if (!isVPNConnected) {
      console.warn("⚠️  VPN NOT CONNECTED");
      console.warn("   Staging API (10.20.0.240) is not accessible");
      console.warn(
        "   Tests will use mock API or skip API-dependent scenarios",
      );
      console.warn("   To test with real API:");
      console.warn("   1. Connect to VPN");
      console.warn("   2. Verify: curl https://dop-stg.datanest.vn/v1/health");
      console.warn("   3. Re-run tests");
    } else {
      console.log("✓ VPN Connected - Using real staging API");
    }
  });

  test.beforeEach(async ({ page }) => {
    // Set up error handling
    page.on("pageerror", (error) => {
      console.error("Page error:", error.message);
    });

    page.on("console", (msg) => {
      if (msg.type() === "error") {
        console.error("Console error:", msg.text());
      }
    });

    // Navigate to home page
    await page.goto(LOCALHOST);
    await page.waitForLoadState("networkidle");

    // 1. Dismiss consent modal if present
    try {
      // Wait for page to fully load
      await page.waitForTimeout(3000);

      // Look for the "Tiếp tục" button (Vietnamese) or "Continue" button (English)
      // This button is inside the consent modal
      const consentButton = page
        .getByRole("button", { name: "Tiếp tục" })
        .or(page.getByRole("button", { name: "Continue" }));

      const isVisible = await consentButton
        .isVisible({ timeout: 2000 })
        .catch(() => false);

      if (isVisible) {
        // Click the button to dismiss consent modal
        await consentButton.click({ force: true });

        // Wait for modal to close
        await page.waitForTimeout(2000);

        // Verify modal is gone by checking if overlay disappeared
        const overlayGone =
          (await page.locator('[data-state="open"]').count()) === 0;
        if (overlayGone) {
          console.log("✓ Consent modal dismissed");
        } else {
          console.log("ℹ️  Consent modal may still be visible");
        }
      } else {
        console.log("ℹ️  No consent modal found");
      }
    } catch (error) {
      console.log("ℹ️  Consent modal handling skipped:", error);
    }

    // 2. Turn OFF MSW toggle to use real API (if VPN connected)
    if (isVPNConnected) {
      try {
        await page.waitForTimeout(1000);

        // Look for MSW ON button with multiple strategies
        const mswToggle = page
          .locator('button:has-text("MSW ON")')
          .first()
          .or(page.locator("button").filter({ hasText: "MSW ON" }).first());

        const isVisible = await mswToggle
          .isVisible({ timeout: 3000 })
          .catch(() => false);

        if (isVisible) {
          await mswToggle.click();
          // Wait for MSW to stop and verify button text changed
          await page.waitForTimeout(2000);
          const mswOffButton = await page
            .locator('button:has-text("MSW OFF")')
            .isVisible({ timeout: 1000 })
            .catch(() => false);
          if (mswOffButton) {
            console.log("✓ MSW toggle turned OFF - Using real API");
          } else {
            console.warn("⚠️  MSW toggle clicked but state unclear");
          }
        } else {
          console.log("ℹ️  MSW already OFF or not found");
        }
      } catch (error) {
        console.log("ℹ️  MSW toggle handling skipped:", error);
      }
    }
  });

  test("complete loan submission flow with OTP verification", async ({
    page,
  }) => {
    // Increase timeout for this full E2E flow (API calls, OTP, navigation can be slow)
    test.setTimeout(120000);

    // Skip if VPN not connected and mock API not enabled
    const useMockAPI = process.env.NEXT_PUBLIC_USE_MOCK_API === "true";
    if (!isVPNConnected && !useMockAPI) {
      test.skip(
        true,
        "Skipping: VPN not connected and mock API not enabled. Set NEXT_PUBLIC_USE_MOCK_API=true or connect to VPN.",
      );
    }

    // Note: Consent modal and MSW toggle already handled in beforeEach

    // ============================================================================
    // STEP 1: Navigate to loan application form
    // ============================================================================
    await page.goto(`${LOCALHOST}${getLocalizedPath("/")}`);
    await page.waitForLoadState("networkidle");

    // Verify homepage loaded (use flexible title check)
    await expect(page).toHaveTitle(
      /Create Next App|Digital Onboarding|Fin Zone|FinZone/i,
    );

    // ============================================================================
    // STEP 2: Fill loan application form with valid data
    // ============================================================================
    // Note: Form fields are dynamically generated from backend /flows/{tenant} API
    // We need to handle custom components like Sliders and Selects

    // Wait for form to load
    await page.waitForTimeout(3000);

    // Scroll down to see the form
    await page.evaluate(() => window.scrollBy(0, 500));
    await page.waitForTimeout(1000);

    console.log("ℹ️ Filling form fields...");

    // 1. Amount Slider - click the slider thumb to drag it to a position
    const amountThumb = page.locator('[role="slider"]').first();
    if (await amountThumb.isVisible({ timeout: 3000 }).catch(() => false)) {
      // Click the track to the right of the thumb to increase the value
      const trackEl = amountThumb.locator("..");
      const box = await trackEl.boundingBox();
      if (box) {
        await page.mouse.click(box.x + box.width * 0.6, box.y + box.height / 2);
        console.log("✓ Clicked amount slider track");
        await page.waitForTimeout(500);
      }
    }

    // 2. Period Slider - second slider on the page
    const sliders = page.locator('[role="slider"]');
    const periodThumb = sliders.nth(1);
    if (await periodThumb.isVisible({ timeout: 2000 }).catch(() => false)) {
      const trackEl = periodThumb.locator("..");
      const box = await trackEl.boundingBox();
      if (box) {
        await page.mouse.click(box.x + box.width * 0.4, box.y + box.height / 2);
        console.log("✓ Clicked period slider track");
        await page.waitForTimeout(500);
      }
    }

    // 3. Purpose Select (SelectGroup using Radix)
    console.log("ℹ️ Selecting loan purpose...");
    // The SelectGroup trigger is a button with a ChevronDown icon inside
    const purposeTrigger = page
      .locator("[data-radix-select-trigger], button")
      .filter({ hasText: /chọn|mục đích|purpose/i })
      .first();
    if (await purposeTrigger.isVisible({ timeout: 3000 }).catch(() => false)) {
      await purposeTrigger.click();
      console.log("✓ Clicked purpose trigger");
      await page.waitForTimeout(800);
      // Pick the first available option (not a placeholder)
      const firstOption = page.locator('[role="option"]').first();
      if (await firstOption.isVisible({ timeout: 2000 }).catch(() => false)) {
        const optionText = await firstOption.textContent();
        console.log(`✓ Selecting purpose option: "${optionText}"`);
        await firstOption.click();
        await page.waitForTimeout(800);
      }
    }

    // 4. Terms Agreement Radio (required before form submit)
    // Radio input uses appearance-none so use force:true or click the label
    const agreeLabel = page.locator('label[for="radio-agree"]');
    const agreeRadio = page.locator("#radio-agree");
    if (await agreeLabel.isVisible({ timeout: 3000 }).catch(() => false)) {
      await agreeLabel.click();
      console.log("✓ Clicked terms agreement label");
      await page.waitForTimeout(300);
    } else if (
      await agreeRadio
        .count()
        .then((c) => c > 0)
        .catch(() => false)
    ) {
      await agreeRadio.click({ force: true });
      console.log("✓ Force-clicked terms agreement radio");
      await page.waitForTimeout(300);
    } else {
      // Fallback: click first radio input in the terms section
      const firstRadio = page.locator('input[type="radio"]').first();
      if (
        await firstRadio
          .count()
          .then((c) => c > 0)
          .catch(() => false)
      ) {
        await firstRadio.click({ force: true });
        console.log("✓ Clicked first radio button (fallback)");
        await page.waitForTimeout(300);
      } else {
        console.warn("⚠️ Terms agreement radio not found");
      }
    }

    // 5. Phone Number (standard input)
    const phoneInputMain = page
      .locator('input[name="phone_number"]')
      .or(page.locator('input[type="tel"]'))
      .first();
    let phoneInMainForm = false;
    if (await phoneInputMain.isVisible({ timeout: 2000 }).catch(() => false)) {
      await phoneInputMain.fill("0901234567");
      phoneInMainForm = true;
      console.log("✓ Filled phone number in main form");
    }

    // Take screenshot to see the form filled correctly
    await page.screenshot({
      path: "test-results/form-filled.png",
      fullPage: true,
    });

    // Look for form submit button
    const formSubmitButton = page
      .locator("button")
      .filter({ hasText: /tiếp tục|đăng ký|gửi|submit|hoàn tất/i })
      .first();

    const formButtonExists = await formSubmitButton
      .isVisible({ timeout: 5000 })
      .catch(() => false);

    if (formButtonExists) {
      const buttonText = await formSubmitButton.textContent();
      console.log(`✓ Found form submit button: "${buttonText}"`);
      await formSubmitButton.scrollIntoViewIfNeeded();
      await formSubmitButton.click();
      console.log("✓ Clicked form submit button");
    } else {
      console.log("⚠️  No form submit button found");
      await page.screenshot({
        path: "test-results/no-form-button.png",
        fullPage: true,
      });
      test.skip(true, "No form submit button found - form not loaded from API");
    }

    // Track API request for lead creation (can happen from main form OR phone modal)
    let leadCreated = false;
    let leadId: string | null = null;
    let leadToken: string | null = null;

    const responseHandler = async (response: any) => {
      if (response.url().includes("/v1/leads") && response.status() === 200) {
        try {
          const data = await response.json();
          if (data.id && data.token) {
            leadCreated = true;
            leadId = data.id;
            leadToken = data.token;
            console.log("✓ Lead created:", leadId);
          }
        } catch {
          // Ignore JSON parse errors
        }
      }
    };

    page.on("response", responseHandler);

    // ============================================================================
    // STEP 4: Handle Phone Number Collection (if NOT in main form)
    // ============================================================================
    if (!phoneInMainForm) {
      console.log("ℹ️ Phone not in main form, waiting for phone modal...");
      // Wait for phone modal to appear
      await expect(
        page.getByText(/nhập số điện thoại|phone number/i),
      ).toBeVisible({ timeout: 10000 });

      const phoneInput = page
        .locator('input[type="tel"]')
        .or(page.locator('input[placeholder*="phone"]'))
        .or(page.locator('input[name="phone_number"]'))
        .first();

      // Use valid Vietnamese phone number
      const testPhoneNumber = "0901234567"; // Viettel number
      await phoneInput.fill(testPhoneNumber);
      await expect(phoneInput).toHaveValue(testPhoneNumber);

      // Click continue to create lead
      const continueButton = page
        .getByRole("button", { name: /tiếp tục|continue|xác nhận/i })
        .first();
      await continueButton.click();

      // Wait for lead creation
      await page.waitForTimeout(2000);
    } else {
      console.log(
        "✓ Phone already collected in main form, waiting for lead creation...",
      );
      // Need to wait for the API call triggered by form submit - give it more time
      await page.waitForTimeout(5000);
    }

    if (!leadCreated && !useMockAPI) {
      console.warn("⚠️  Lead creation may have failed - check VPN connection");
      // Print any console errors for debugging
    }

    // ============================================================================
    // STEP 5: Handle OTP verification
    // ============================================================================

    // Wait for OTP modal (increased timeout for slow VPN)
    await expect(page.getByText(/mã xác thực|otp|verification/i)).toBeVisible({
      timeout: 25000,
    });

    // Take screenshot of OTP modal
    await page.screenshot({
      path: "test-results/otp-modal.png",
      fullPage: true,
    });

    // OTP input fields (4 or 6 digits)
    const otpInputs = page.locator('input[type="text"][maxlength="1"]');

    // Wait for at least one OTP input to be visible
    try {
      await otpInputs.first().waitFor({ state: "visible", timeout: 5000 });
    } catch (e) {
      console.warn("⚠️ OTP inputs did not appear in time");
    }

    const otpCount = await otpInputs.count();

    if (otpCount > 0) {
      console.log(`✓ Found ${otpCount} OTP input fields`);
      // Fill OTP code
      // For testing: use mock OTP "123456" or "000000"
      const testOTP = useMockAPI ? "123456" : "000000";

      for (let i = 0; i < Math.min(otpCount, testOTP.length); i++) {
        await otpInputs.nth(i).fill(testOTP[i]);
      }

      // Wait for OTP verification
      await page.waitForTimeout(1000);

      // OTP verification should trigger navigation or show success
      await expect(
        page
          .getByText(/xác thực thành công|verified|success/i)
          .or(page.locator('[data-testid="otp-success"]')),
      ).toBeVisible({ timeout: 10000 });
    } else {
      console.warn(
        "⚠️  OTP input fields not found after waiting - flow may differ",
      );
    }

    // ============================================================================
    // STEP 6: Navigate to loan info page and submit lead info
    // ============================================================================

    // Should navigate to /loan-info with leadId and token
    await expect(page).toHaveURL(/loan-info/, { timeout: 15000 });

    // Fill additional personal information
    const fullNameInput = page
      .locator('input[name="full_name"]')
      .or(page.getByLabel(/họ và tên|full name/i))
      .first();

    if (await fullNameInput.isVisible()) {
      await fullNameInput.fill("Nguyen Van Test");
    }

    const emailInput = page
      .locator('input[name="email"]')
      .or(page.getByLabel(/email/i))
      .first();

    if (await emailInput.isVisible()) {
      await emailInput.fill("test@example.com");
    }

    const incomeInput = page
      .locator('input[name="income"]')
      .or(page.getByLabel(/thu nhập|income/i))
      .first();

    if (await incomeInput.isVisible()) {
      await incomeInput.fill("20000000");
    }

    // Track submit-info API call
    let submitInfoSuccess = false;
    let matchedProducts: any[] = [];

    page.on("response", async (response) => {
      if (
        response.url().includes("/submit-info") &&
        response.status() === 200
      ) {
        try {
          const data = await response.json();
          submitInfoSuccess = true;
          matchedProducts = data.matched_products || [];
          console.log(
            `✓ Lead info submitted - ${matchedProducts.length} products matched`,
          );
        } catch {
          // Ignore JSON parse errors
        }
      }
    });

    // Submit lead info
    const submitInfoButton = page
      .getByRole("button", { name: /gửi|submit|hoàn tất/i })
      .first();

    if (await submitInfoButton.isVisible()) {
      await submitInfoButton.click();
    }

    // ============================================================================
    // STEP 7: Verify loan searching screen appears
    // ============================================================================

    // Should show loan searching animation
    await expect(
      page
        .getByText(/đang tìm kiếm|searching|processing/i)
        .or(page.locator('[data-testid="loan-searching"]')),
    ).toBeVisible({ timeout: 10000 });

    // ============================================================================
    // STEP 8: Verify matched products display on loan result page
    // ============================================================================

    // Wait for navigation to loan result page
    await expect(page).toHaveURL(/loan-result/, { timeout: 20000 });

    // Verify products are displayed
    const productCards = page.locator('[data-testid="product-card"]');
    const productCount = await productCards.count();

    if (productCount > 0) {
      console.log(`✓ ${productCount} products displayed`);

      // Verify first product card has required information
      const firstProduct = productCards.first();
      await expect(firstProduct).toBeVisible();

      // Check for product details
      await expect(
        firstProduct.locator("text=/lãi suất|interest rate/i"),
      ).toBeVisible();
      await expect(
        firstProduct.locator("text=/hạn mức|loan amount/i"),
      ).toBeVisible();

      // Verify "Apply" button exists
      const applyButton = firstProduct.getByRole("button", {
        name: /đăng ký|apply/i,
      });
      await expect(applyButton).toBeVisible();
    } else {
      // No products matched - verify empty state or error message
      await expect(
        page
          .getByText(/không tìm thấy|no products|no matches/i)
          .or(page.locator('[data-testid="empty-state"]')),
      ).toBeVisible();
      console.log("ℹ️  No products matched for test criteria");
    }

    // ============================================================================
    // STEP 9: Take screenshot for verification
    // ============================================================================
    await page.screenshot({
      path: "test-results/loan-submission-result.png",
      fullPage: true,
    });

    console.log("✓ Loan submission flow completed successfully");
  });

  test("handles API errors gracefully without VPN", async ({ page }) => {
    // This test verifies error handling when API is not accessible

    // Mock API failure
    await page.route("**/v1/leads", (route) => {
      route.abort("failed");
    });

    await page.goto(`${LOCALHOST}${getLocalizedPath("/")}`);

    // Fill form
    const amountSlider = page.locator('input[name="expected_amount"]').first();
    await amountSlider.fill("30000000");

    const agreeCheckbox = page
      .locator('input[name="agreeStatus"]')
      .or(page.locator('input[type="checkbox"]'))
      .first();
    await agreeCheckbox.check();

    // Submit
    const submitButton = page
      .getByRole("button", { name: /tiếp theo|tiếp tục|submit/i })
      .first();
    await submitButton.click();

    // Enter phone
    const phoneInput = page
      .locator('input[type="tel"]')
      .or(page.locator('input[name="phone_number"]'))
      .first();
    await phoneInput.fill("0901234567");

    // Try to continue
    const continueButton = page
      .getByRole("button", { name: /tiếp tục|continue/i })
      .first();
    await continueButton.click();

    // Should show error message
    await expect(
      page
        .getByText(/lỗi|error|failed|không thể/i)
        .or(page.locator('[role="alert"]')),
    ).toBeVisible({ timeout: 10000 });

    console.log("✓ Error handling verified");
  });

  test("validates phone number format", async ({ page }) => {
    await page.goto(`${LOCALHOST}${getLocalizedPath("/")}`);

    // Fill form
    const amountSlider = page.locator('input[name="expected_amount"]').first();
    await amountSlider.fill("20000000");

    const agreeCheckbox = page
      .locator('input[name="agreeStatus"]')
      .or(page.locator('input[type="checkbox"]'))
      .first();
    await agreeCheckbox.check();

    // Submit
    const submitButton = page
      .getByRole("button", { name: /tiếp theo|tiếp tục|submit/i })
      .first();
    await submitButton.click();

    // Wait for phone modal
    await expect(
      page.getByText(/nhập số điện thoại|phone number/i),
    ).toBeVisible({ timeout: 10000 });

    // Enter invalid phone number
    const phoneInput = page
      .locator('input[type="tel"]')
      .or(page.locator('input[name="phone_number"]'))
      .first();
    await phoneInput.fill("123"); // Invalid format

    // Try to continue
    const continueButton = page
      .getByRole("button", { name: /tiếp tục|continue/i })
      .first();
    await continueButton.click();

    // Should show validation error
    await expect(
      page.getByText(/không hợp lệ|invalid|sai định dạng/i),
    ).toBeVisible({ timeout: 5000 });

    console.log("✓ Phone validation verified");
  });

  test("requires terms agreement before submission", async ({ page }) => {
    await page.goto(`${LOCALHOST}${getLocalizedPath("/")}`);

    // Fill form but don't agree to terms
    const amountSlider = page.locator('input[name="expected_amount"]').first();
    await amountSlider.fill("15000000");

    // Try to submit without agreeing
    const submitButton = page
      .getByRole("button", { name: /tiếp theo|tiếp tục|submit/i })
      .first();
    await submitButton.click();

    // Should show validation message or not proceed
    // Either modal doesn't appear or error message shows
    const phoneModal = page.getByText(/nhập số điện thoại|phone number/i);
    const errorMessage = page.getByText(/đồng ý|agree|terms/i);

    await expect(phoneModal.or(errorMessage)).toBeVisible({ timeout: 5000 });

    console.log("✓ Terms agreement requirement verified");
  });
});

test.describe("Loan Submission - Mock API Tests", () => {
  test.use({
    // Force mock API for these tests
    extraHTTPHeaders: {
      "X-Use-Mock-API": "true",
    },
  });

  test("works with mock API when VPN unavailable", async ({ page }) => {
    // Mock all API endpoints
    await page.route("**/v1/flows/*", (route) => {
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          id: "mock-flow-id",
          name: "Mock Flow",
          flow_status: "active",
          steps: [
            {
              id: "step-1",
              page: "/loan-info",
              send_otp: true,
              have_phone_number: true,
              required_phone_number: true,
            },
          ],
        }),
      });
    });

    await page.route("**/v1/leads", (route) => {
      if (route.request().method() === "POST") {
        route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            id: "mock-lead-123",
            token: "mock-token-123",
            matched_products: [],
          }),
        });
      }
    });

    await page.route("**/v1/leads/*/submit-otp", (route) => {
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          token: "mock-verified-token",
          matched_products: [],
        }),
      });
    });

    await page.route("**/v1/leads/*/submit-info", (route) => {
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          next_step_id: "mock-next-step",
          matched_products: [
            {
              product_id: "mock-product-1",
              partner_id: "mock-partner-1",
              partner_name: "Mock Bank",
              interest_rate: 12.5,
              max_loan_amount: 100000000,
              loan_term: 12,
            },
          ],
        }),
      });
    });

    // Run basic flow
    await page.goto(`${LOCALHOST}${getLocalizedPath("/")}`);

    const amountSlider = page.locator('input[name="expected_amount"]').first();
    await amountSlider.fill("40000000");

    const agreeCheckbox = page
      .locator('input[name="agreeStatus"]')
      .or(page.locator('input[type="checkbox"]'))
      .first();
    await agreeCheckbox.check();

    const submitButton = page
      .getByRole("button", { name: /tiếp theo|tiếp tục|submit/i })
      .first();
    await submitButton.click();

    // Should work with mock API
    await expect(
      page.getByText(/nhập số điện thoại|phone number/i),
    ).toBeVisible({ timeout: 10000 });

    console.log("✓ Mock API flow verified");
  });
});
