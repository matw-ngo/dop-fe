/**
 * eKYC Loan Application E2E Tests
 *
 * This test suite covers the critical user journey of completing a loan application
 * with eKYC verification:
 * - Complete loan application flow with eKYC verification
 * - Mobile responsiveness testing
 * - Cross-browser compatibility (Chrome, Firefox, Safari, Edge)
 * - Dark mode testing
 * - Accessibility compliance (screen readers)
 */

import { expect, test } from "@playwright/test";

const LOCALHOST = "http://localhost:3001";

function getLocalizedPath(path: string, locale: string = "vi"): string {
  return `/${locale}${path.startsWith("/") ? path : `/${path}`}`;
}

test.describe.configure({ mode: "parallel" });

test.describe("eKYC Loan Application", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to loan application page
    await page.goto(`${LOCALHOST}${getLocalizedPath("/loan-wizard")}`);

    // Wait for page to load
    await page.waitForLoadState("networkidle");
  });

  test("complete flow with document verification", async ({ page }) => {
    // Step 1: Fill initial loan information
    await page.getByLabel("Loan Amount").fill("50000000");
    await page.getByLabel("Loan Purpose").selectOption("Personal Loan");
    await page.getByLabel("Loan Term").selectOption("12 months");

    // Step 2: Navigate to identity verification step
    await page.getByRole("button", { name: "Next" }).click();

    // Wait for eKYC step to load
    await expect(page.getByText("Identity Verification")).toBeVisible();

    // Step 3: Start eKYC verification
    await page.getByRole("button", { name: "Verify Identity Now" }).click();

    // Mock eKYC verification flow
    // In real test, this would interact with actual eKYC SDK
    await page.waitForSelector('[data-testid="ekyc-modal"]', {
      state: "visible",
    });

    // Simulate document upload
    await page
      .getByLabel("Upload ID Document")
      .setInputFiles("./test-data/sample-id-card.png");

    // Wait for OCR processing
    await page.getByText("Processing document...").waitFor({ state: "hidden" });

    // Simulate liveness check
    await page.getByText("Start Face Verification").click();
    await page.waitForTimeout(2000); // Simulate face capture

    // Wait for verification result
    await page
      .getByText("Verification Successful")
      .waitFor({ state: "visible", timeout: 30000 });

    // Step 4: Verify auto-filled information
    await expect(page.getByLabel("Full Name")).toHaveValue("NGUYEN VAN A");
    await expect(page.getByLabel("Date of Birth")).toHaveValue("15/01/1990");
    await expect(page.getByLabel("ID Number")).toHaveValue("001234567890");
    await expect(page.getByLabel("Address")).toHaveValue(
      "123 Đường ABC, Quận 1, TP.HCM",
    );

    // Step 5: Complete remaining form fields
    await page.getByLabel("Phone Number").fill("0901234567");
    await page.getByLabel("Email").fill("nguyenvana@email.com");
    await page.getByLabel("Monthly Income").fill("15000000");

    // Step 6: Review and submit application
    await page.getByRole("button", { name: "Review Application" }).click();

    // Verify all information is correct on review page
    await expect(page.getByText("Loan Amount: 50,000,000 VND")).toBeVisible();
    await expect(page.getByText("Identity: NGUYEN VAN A")).toBeVisible();
    await expect(page.getByText("ID: 001234567890")).toBeVisible();
    await expect(page.getByText("Verification Status: Verified")).toBeVisible();

    // Step 7: Submit application
    await page.getByRole("button", { name: "Submit Application" }).click();

    // Verify submission success
    await expect(
      page.getByText("Application Submitted Successfully"),
    ).toBeVisible();
    await expect(page.getByText(/Application ID: APP-/)).toBeVisible();

    // Verify email confirmation
    await expect(
      page.getByText(
        "Confirmation email has been sent to nguyenvana@email.com",
      ),
    ).toBeVisible();
  });

  test("handles verification errors gracefully", async ({ page }) => {
    // Navigate to eKYC step
    await page.getByLabel("Loan Amount").fill("10000000");
    await page.getByRole("button", { name: "Next" }).click();

    // Mock verification failure
    await page.route("**/api/ekyc/verify", (route) => {
      route.fulfill({
        status: 400,
        contentType: "application/json",
        body: JSON.stringify({
          error: "Document verification failed",
          code: "VERIFICATION_ERROR",
        }),
      });
    });

    // Start verification
    await page.getByRole("button", { name: "Verify Identity Now" }).click();

    // Upload document
    await page
      .getByLabel("Upload ID Document")
      .setInputFiles("./test-data/invalid-id-card.png");

    // Should show error message
    await expect(page.getByText("Document verification failed")).toBeVisible();
    await expect(page.getByRole("button", { name: "Try Again" })).toBeVisible();

    // User should be able to retry
    await page.getByRole("button", { name: "Try Again" }).click();

    // Should reset and allow new upload
    await expect(page.getByLabel("Upload ID Document")).toBeVisible();
  });

  test("supports multiple verification attempts", async ({ page }) => {
    // Navigate to eKYC step
    await page.getByLabel("Loan Amount").fill("20000000");
    await page.getByRole("button", { name: "Next" }).click();

    // First attempt with low confidence score
    await page.route("**/api/ekyc/verify", (route) => {
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          confidence: 65, // Below threshold
          error: "Low confidence score",
          message: "Please try again with better lighting",
        }),
      });
    });

    // Start verification
    await page.getByRole("button", { name: "Verify Identity Now" }).click();

    // Upload document
    await page
      .getByLabel("Upload ID Document")
      .setInputFiles("./test-data/blurry-id-card.png");

    // Should show low confidence warning
    await expect(page.getByText("Low confidence score: 65%")).toBeVisible();
    await expect(
      page.getByText("Please try again with better lighting"),
    ).toBeVisible();

    // Allow retry up to maximum attempts
    for (let i = 0; i < 3; i++) {
      if (i < 2) {
        await page.getByRole("button", { name: "Try Again" }).click();
        await expect(page.getByLabel("Upload ID Document")).toBeVisible();
      } else {
        // After max retries, should show different message
        await expect(
          page.getByText("Maximum retry attempts reached"),
        ).toBeVisible();
        await expect(
          page.getByText("Please contact customer support"),
        ).toBeVisible();
        break;
      }
    }
  });

  test("validates required fields after eKYC", async ({ page }) => {
    // Navigate to eKYC step and complete verification
    await page.getByLabel("Loan Amount").fill("30000000");
    await page.getByRole("button", { name: "Next" }).click();

    // Mock successful verification
    await page.route("**/api/ekyc/verify", (route) => {
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          personalData: {
            fullName: "TRAN THI B",
            dateOfBirth: "1985-05-20",
            idNumber: "098765432123",
          },
        }),
      });
    });

    await page.getByRole("button", { name: "Verify Identity Now" }).click();
    await page
      .getByLabel("Upload ID Document")
      .setInputFiles("./test-data/sample-id-card.png");

    // Wait for successful verification
    await page
      .getByText("Verification Successful")
      .waitFor({ state: "visible" });

    // Try to proceed without filling additional required fields
    await page.getByRole("button", { name: "Next" }).click();

    // Should show validation errors
    await expect(page.getByText("Phone number is required")).toBeVisible();
    await expect(page.getByText("Email is required")).toBeVisible();
    await expect(page.getByText("Monthly income is required")).toBeVisible();

    // Fill in missing fields
    await page.getByLabel("Phone Number").fill("0912345678");
    await page.getByLabel("Email").fill("tranthib@email.com");
    await page.getByLabel("Monthly Income").fill("20000000");

    // Should now allow proceeding
    await page.getByRole("button", { name: "Next" }).click();
    await expect(page.getByText("Review Application")).toBeVisible();
  });

  test("preserves form data during verification", async ({ page }) => {
    // Fill initial form fields
    await page.getByLabel("Loan Amount").fill("40000000");
    await page.getByLabel("Loan Purpose").selectOption("Business Loan");
    await page.getByLabel("Loan Term").selectOption("24 months");
    await page
      .getByLabel("Additional Information")
      .fill("Need funds for inventory expansion");

    // Navigate to eKYC step
    await page.getByRole("button", { name: "Next" }).click();

    // Complete eKYC verification
    await page.route("**/api/ekyc/verify", (route) => {
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          personalData: {
            fullName: "LE VAN C",
            dateOfBirth: "1992-08-10",
            idNumber: "012345678901",
          },
        }),
      });
    });

    await page.getByRole("button", { name: "Verify Identity Now" }).click();
    await page
      .getByLabel("Upload ID Document")
      .setInputFiles("./test-data/sample-id-card.png");

    // Go back to previous step
    await page.getByRole("button", { name: "Back" }).click();

    // Verify initial data is preserved
    await expect(page.getByLabel("Loan Amount")).toHaveValue("40000000");
    await expect(page.getByLabel("Loan Purpose")).toHaveValue("Business Loan");
    await expect(page.getByLabel("Loan Term")).toHaveValue("24 months");
    await expect(page.getByLabel("Additional Information")).toHaveValue(
      "Need funds for inventory expansion",
    );

    // Navigate forward again
    await page.getByRole("button", { name: "Next" }).click();

    // Verify eKYC data is still there
    await expect(page.getByLabel("Full Name")).toHaveValue("LE VAN C");
    await expect(page.getByLabel("Date of Birth")).toHaveValue("10/08/1992");
    await expect(page.getByLabel("ID Number")).toHaveValue("012345678901");
  });
});

test.describe("Mobile Responsiveness", () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 }); // iPhone X dimensions
    await page.goto(`${LOCALHOST}${getLocalizedPath("/loan-wizard")}`);
  });

  test("eKYC flow works on mobile devices", async ({ page }) => {
    // Mobile-specific UI elements should be present
    await expect(page.getByRole("button", { name: "Menu" })).toBeVisible();
    await expect(page.locator(".mobile-header")).toBeVisible();

    // Navigate to eKYC step
    await page.getByLabel("Loan Amount").fill("25000000");
    await page.getByRole("button", { name: "Next" }).click();

    // eKYC modal should adapt to mobile screen
    await page.getByRole("button", { name: "Verify Identity Now" }).click();
    await expect(page.locator('[data-testid="ekyc-modal"]')).toHaveClass(
      /mobile/,
    );

    // Camera capture should use mobile camera API
    await page.getByLabel("Upload ID Document").click();
    await expect(page.getByText("Choose from Camera or Gallery")).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Take Photo" }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Choose from Gallery" }),
    ).toBeVisible();

    // Test touch interactions
    const uploadButton = page.getByRole("button", { name: "Take Photo" });
    await uploadButton.tap();
    await expect(
      page.getByText("Position document within frame"),
    ).toBeVisible();
  });

  test("mobile form keyboard behavior", async ({ page }) => {
    // Navigate to eKYC step
    await page.getByLabel("Loan Amount").fill("10000000");
    await page.getByRole("button", { name: "Next" }).click();

    // Test keyboard behavior on mobile
    const phoneInput = page.getByLabel("Phone Number");
    await phoneInput.tap();
    await expect(page.locator(".mobile-keyboard-numeric")).toBeVisible();

    const emailInput = page.getByLabel("Email");
    await emailInput.tap();
    await expect(page.locator(".mobile-keyboard-email")).toBeVisible();
  });
});

test.describe("Cross-Browser Compatibility", () => {
  const browsers = ["chromium", "firefox", "webkit"] as const;

  browsers.forEach((browserName) => {
    test(`eKYC flow works in ${browserName}`, async ({ page }) => {
      test.skip(browserName === "webkit", "Skip Safari in CI for now");

      await page.goto(`${LOCALHOST}${getLocalizedPath("/loan-wizard")}`);

      // Complete basic flow
      await page.getByLabel("Loan Amount").fill("35000000");
      await page.getByRole("button", { name: "Next" }).click();

      // eKYC verification should work in all browsers
      await page.getByRole("button", { name: "Verify Identity Now" }).click();
      await expect(page.locator('[data-testid="ekyc-modal"]')).toBeVisible();

      // File upload might behave differently across browsers
      const fileInput = page.getByLabel("Upload ID Document");
      await expect(fileInput).toBeVisible();

      // Test browser-specific file handling
      if (browserName === "firefox") {
        // Firefox might show different file dialog
        await expect(page.getByText("Drag and drop file here")).toBeVisible();
      } else if (browserName === "webkit") {
        // Safari might have different styling
        await expect(page.locator(".safari-upload-area")).toBeVisible();
      }
    });
  });
});

test.describe("Dark Mode Testing", () => {
  test("eKYC flow works in dark mode", async ({ page }) => {
    // Enable dark mode
    await page.evaluate(() => {
      localStorage.setItem("theme", "dark");
      document.documentElement.classList.add("dark");
    });

    await page.goto(`${LOCALHOST}${getLocalizedPath("/loan-wizard")}`);

    // Verify dark mode styling
    await expect(page.locator("body")).toHaveClass(/dark/);
    await expect(page.locator(".dark-mode-container")).toBeVisible();

    // Navigate to eKYC step
    await page.getByLabel("Loan Amount").fill("50000000");
    await page.getByRole("button", { name: "Next" }).click();

    // eKYC modal should have dark mode styling
    await page.getByRole("button", { name: "Verify Identity Now" }).click();
    await expect(page.locator('[data-testid="ekyc-modal"]')).toHaveClass(
      /dark/,
    );

    // Verify text contrast in dark mode
    await expect(page.getByText("Identity Verification")).toHaveCSS(
      "color",
      "rgb(255, 255, 255)",
    );
    await expect(page.locator(".dark-input")).toHaveCSS(
      "background-color",
      "rgb(31, 41, 55)",
    );
  });
});

test.describe("Accessibility Compliance", () => {
  test("eKYC flow is screen reader friendly", async ({ page }) => {
    // Enable accessibility testing
    await page.goto(`${LOCALHOST}${getLocalizedPath("/loan-wizard")}`);

    // Test ARIA labels and roles
    await expect(page.getByRole("main")).toBeVisible();
    await expect(page.getByRole("form")).toBeVisible();

    // Navigate to eKYC step
    await page.getByLabel("Loan Amount").fill("60000000");
    await page.getByRole("button", { name: "Next" }).click();

    // Verify eKYC accessibility
    await expect(
      page.getByRole("button", { name: "Verify Identity Now" }),
    ).toHaveAttribute("aria-describedby");
    await expect(
      page.getByRole("dialog", { name: "Identity Verification" }),
    ).toBeVisible();

    // Test keyboard navigation
    await page.keyboard.press("Tab");
    await expect(
      page.getByRole("button", { name: "Verify Identity Now" }),
    ).toBeFocused();

    // Test focus management in modal
    await page.getByRole("button", { name: "Verify Identity Now" }).click();
    await expect(page.locator('[data-testid="ekyc-modal"]')).toBeVisible();
    await expect(page.getByRole("button", { name: "Close" })).toBeFocused();

    // Test escape key
    await page.keyboard.press("Escape");
    await expect(page.locator('[data-testid="ekyc-modal"]')).not.toBeVisible();
  });

  test("eKYC flow supports high contrast mode", async ({ page }) => {
    // Enable high contrast mode
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.addStyleTag({ content: "filter: contrast(2);" });

    await page.goto(`${LOCALHOST}${getLocalizedPath("/loan-wizard")}`);

    // Navigate to eKYC step
    await page.getByLabel("Loan Amount").fill("45000000");
    await page.getByRole("button", { name: "Next" }).click();

    // Verify high contrast styling
    await page.getByRole("button", { name: "Verify Identity Now" }).click();
    await expect(page.locator('[data-testid="ekyc-modal"]')).toHaveCSS(
      "filter",
      "contrast(2)",
    );
  });

  test("eKYC flow works with reduced motion", async ({ page }) => {
    // Enable reduced motion
    await page.emulateMedia({ reducedMotion: "reduce" });

    await page.goto(`${LOCALHOST}${getLocalizedPath("/loan-wizard")}`);

    // Navigate to eKYC step
    await page.getByLabel("Loan Amount").fill("70000000");
    await page.getByRole("button", { name: "Next" }).click();

    // Verify animations are disabled
    await page.getByRole("button", { name: "Verify Identity Now" }).click();
    await expect(page.locator('[data-testid="ekyc-modal"]')).toHaveCSS(
      "transition",
      "none",
    );
  });
});

test.describe("Performance Testing", () => {
  test("eKYC flow loads within acceptable time limits", async ({ page }) => {
    const startTime = Date.now();

    await page.goto(`${LOCALHOST}${getLocalizedPath("/loan-wizard")}`);
    await page.waitForLoadState("networkidle");

    const pageLoadTime = Date.now() - startTime;
    expect(pageLoadTime).toBeLessThan(3000); // 3 seconds max

    // Test eKYC modal load time
    const modalStartTime = Date.now();

    await page.getByLabel("Loan Amount").fill("80000000");
    await page.getByRole("button", { name: "Next" }).click();
    await page.getByRole("button", { name: "Verify Identity Now" }).click();

    await page
      .locator('[data-testid="ekyc-modal"]')
      .waitFor({ state: "visible" });

    const modalLoadTime = Date.now() - modalStartTime;
    expect(modalLoadTime).toBeLessThan(1000); // 1 second max
  });

  test("eKYC flow handles large image uploads efficiently", async ({
    page,
  }) => {
    await page.goto(`${LOCALHOST}${getLocalizedPath("/loan-wizard")}`);
    await page.getByLabel("Loan Amount").fill("90000000");
    await page.getByRole("button", { name: "Next" }).click();

    // Mock large file upload
    const largeFile = Buffer.alloc(10 * 1024 * 1024); // 10MB file
    await page.route("**/api/ekyc/upload", (route) => {
      // Simulate slow upload
      setTimeout(() => {
        route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({ success: true, uploadId: "upload-123" }),
        });
      }, 2000);
    });

    const uploadStartTime = Date.now();

    await page.getByRole("button", { name: "Verify Identity Now" }).click();
    await page.getByLabel("Upload ID Document").setInputFiles({
      name: "large-image.jpg",
      mimeType: "image/jpeg",
      buffer: largeFile,
    });

    // Should show progress indicator
    await expect(page.getByText("Uploading...")).toBeVisible();
    await expect(page.locator('[data-testid="upload-progress"]')).toBeVisible();

    // Wait for upload to complete
    await page
      .getByText("Upload Complete")
      .waitFor({ state: "visible", timeout: 10000 });

    const uploadTime = Date.now() - uploadStartTime;
    expect(uploadTime).toBeLessThan(5000); // 5 seconds max
  });
});
