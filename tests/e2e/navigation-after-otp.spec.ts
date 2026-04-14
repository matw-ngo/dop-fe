/**
 * Navigation After OTP E2E Tests
 *
 * End-to-end tests for browser navigation security after OTP verification.
 * Tests real browser behavior including history API, back button, and page refresh.
 *
 * Uses MSW profiles to test different OTP positions and flow configurations.
 *
 * Test Scenarios:
 * 1. Complete OTP verification flow
 * 2. Browser back button blocked after OTP
 * 3. Forward navigation allowed between post-OTP steps
 * 4. Session persists across page refresh
 * 5. Session timeout with activity tracking
 * 6. Form completion clears session
 * 7. Navigation notifications displayed
 * 8. Manual session reset on errors
 * 9. Different OTP positions (using profiles)
 * 10. Multi-OTP flow
 * 11. No-OTP flow
 */

import { expect, test } from "@playwright/test";

const LOCALHOST = "http://localhost:3001";

/**
 * MSW Profile Names
 * These correspond to profiles in src/__tests__/msw/profiles/
 */
type ProfileName =
  | "default"
  | "otp-at-step-1"
  | "otp-at-step-3"
  | "otp-at-last-step"
  | "no-otp-flow"
  | "multi-otp-flow"
  | "with-ekyc";

/**
 * Set MSW profile for the test
 */
async function setMSWProfile(page: any, profileName: ProfileName) {
  await page.route("**/flows/**", async (route: any) => {
    const request = route.request();
    const headers = request.headers();
    headers["x-test-profile"] = profileName;

    await route.continue({ headers });
  });
}

function getLocalizedPath(path: string, locale: string = "vi"): string {
  return `/${locale}${path.startsWith("/") ? path : `/${path}`}`;
}

test.describe.configure({ mode: "parallel" });

test.describe("Navigation After OTP - E2E Tests", () => {
  test.beforeEach(async ({ page }) => {
    // Clear storage before each test
    await page.goto(LOCALHOST);
    await page.evaluate(() => {
      sessionStorage.clear();
      localStorage.clear();
    });

    // Set default MSW profile
    await setMSWProfile(page, "default");

    // Navigate to loan application page
    await page.goto(`${LOCALHOST}${getLocalizedPath("/user-onboarding")}`);
    await page.waitForLoadState("networkidle");
  });

  test.describe("Scenario 1: Complete OTP Verification Flow", () => {
    test("should complete full flow with OTP verification and session creation", async ({
      page,
    }) => {
      // Step 1: Fill initial loan information
      await page.getByLabel("Loan Amount").fill("50000000");
      await page.getByLabel("Loan Purpose").selectOption("Personal Loan");

      // Navigate to next step
      await page.getByRole("button", { name: /next|tiếp theo/i }).click();

      // Step 2: Fill personal information
      await page.getByLabel("Full Name").fill("Nguyen Van A");
      await page.getByLabel("Phone Number").fill("0901234567");

      await page.getByRole("button", { name: /next|tiếp theo/i }).click();

      // Step 3: OTP Verification
      await expect(
        page.getByText(/OTP Verification|Xác thực OTP/i),
      ).toBeVisible();

      // Mock OTP API response
      await page.route("**/api/otp/send", (route) => {
        route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            success: true,
            requestId: "otp-request-123",
            message: "OTP sent successfully",
          }),
        });
      });

      await page.route("**/api/otp/verify", (route) => {
        route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            success: true,
            verified: true,
            message: "OTP verified successfully",
          }),
        });
      });

      // Request OTP
      await page.getByRole("button", { name: /send otp|gửi mã/i }).click();

      // Wait for OTP input to appear
      await expect(page.getByLabel(/enter otp|nhập mã/i)).toBeVisible();

      // Enter OTP
      await page.getByLabel(/enter otp|nhập mã/i).fill("123456");

      // Verify OTP
      await page.getByRole("button", { name: /verify|xác thực/i }).click();

      // Wait for verification success
      await expect(page.getByText(/verified|đã xác thực/i)).toBeVisible({
        timeout: 5000,
      });

      // Check that verification session was created in sessionStorage
      const sessionKeys = await page.evaluate(() => {
        return Object.keys(sessionStorage).filter((k) =>
          k.startsWith("dop_verification_"),
        );
      });

      expect(sessionKeys.length).toBeGreaterThan(0);

      // Navigate to next step (post-OTP)
      await page.getByRole("button", { name: /next|tiếp theo/i }).click();

      // Step 4: Should be on post-OTP step
      await expect(page.getByText(/step 4|bước 4/i)).toBeVisible();
    });
  });

  test.describe("Scenario 2: Browser Back Button Blocked After OTP", () => {
    test("should block browser back navigation to pre-OTP steps", async ({
      page,
    }) => {
      // Complete flow up to post-OTP step
      await page.getByLabel("Loan Amount").fill("30000000");
      await page.getByRole("button", { name: /next|tiếp theo/i }).click();

      await page.getByLabel("Full Name").fill("Tran Thi B");
      await page.getByRole("button", { name: /next|tiếp theo/i }).click();

      // Mock OTP verification
      await page.route("**/api/otp/**", (route) => {
        route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({ success: true }),
        });
      });

      // Complete OTP
      await page.getByRole("button", { name: /send otp|gửi mã/i }).click();
      await page.getByLabel(/enter otp|nhập mã/i).fill("123456");
      await page.getByRole("button", { name: /verify|xác thực/i }).click();

      await expect(page.getByText(/verified|đã xác thực/i)).toBeVisible();

      // Navigate to post-OTP step
      await page.getByRole("button", { name: /next|tiếp theo/i }).click();

      // Get current URL
      const postOTPUrl = page.url();

      // Try to use browser back button
      await page.goBack();

      // Wait a moment for any navigation to occur
      await page.waitForTimeout(500);

      // URL should remain the same (navigation blocked)
      expect(page.url()).toBe(postOTPUrl);

      // Should see notification about blocked navigation
      await expect(
        page.getByText(/cannot go back|không thể quay lại/i),
      ).toBeVisible({ timeout: 3000 });
    });

    test("should allow back button within post-OTP steps", async ({ page }) => {
      // Complete flow to step 5 (2 steps after OTP)
      await page.getByLabel("Loan Amount").fill("40000000");
      await page.getByRole("button", { name: /next|tiếp theo/i }).click();

      await page.getByLabel("Full Name").fill("Le Van C");
      await page.getByRole("button", { name: /next|tiếp theo/i }).click();

      // Mock OTP
      await page.route("**/api/otp/**", (route) => {
        route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({ success: true }),
        });
      });

      await page.getByRole("button", { name: /send otp|gửi mã/i }).click();
      await page.getByLabel(/enter otp|nhập mã/i).fill("123456");
      await page.getByRole("button", { name: /verify|xác thực/i }).click();

      // Navigate to step 4
      await page.getByRole("button", { name: /next|tiếp theo/i }).click();
      await expect(page.getByText(/step 4|bước 4/i)).toBeVisible();

      // Navigate to step 5
      await page.getByRole("button", { name: /next|tiếp theo/i }).click();
      await expect(page.getByText(/step 5|bước 5/i)).toBeVisible();

      // Use back button to go to step 4 (should work)
      await page.getByRole("button", { name: /back|quay lại/i }).click();

      // Should be back on step 4
      await expect(page.getByText(/step 4|bước 4/i)).toBeVisible();
    });
  });

  test.describe("Scenario 3: Forward Navigation Allowed", () => {
    test("should allow forward navigation to visited post-OTP steps", async ({
      page,
    }) => {
      // Complete flow to step 5
      await page.getByLabel("Loan Amount").fill("25000000");
      await page.getByRole("button", { name: /next|tiếp theo/i }).click();

      await page.getByLabel("Full Name").fill("Pham Thi D");
      await page.getByRole("button", { name: /next|tiếp theo/i }).click();

      // Mock OTP
      await page.route("**/api/otp/**", (route) => {
        route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({ success: true }),
        });
      });

      await page.getByRole("button", { name: /send otp|gửi mã/i }).click();
      await page.getByLabel(/enter otp|nhập mã/i).fill("123456");
      await page.getByRole("button", { name: /verify|xác thực/i }).click();

      // Navigate through post-OTP steps
      await page.getByRole("button", { name: /next|tiếp theo/i }).click();
      await page.getByRole("button", { name: /next|tiếp theo/i }).click();

      // Go back to step 4
      await page.getByRole("button", { name: /back|quay lại/i }).click();

      // Forward button should be enabled
      const forwardButton = page.getByRole("button", {
        name: /next|tiếp theo/i,
      });
      await expect(forwardButton).toBeEnabled();

      // Click forward
      await forwardButton.click();

      // Should be on step 5
      await expect(page.getByText(/step 5|bước 5/i)).toBeVisible();
    });
  });

  test.describe("Scenario 4: Session Persists Across Page Refresh", () => {
    test("should restore session after page refresh", async ({ page }) => {
      // Complete OTP verification
      await page.getByLabel("Loan Amount").fill("35000000");
      await page.getByRole("button", { name: /next|tiếp theo/i }).click();

      await page.getByLabel("Full Name").fill("Hoang Van E");
      await page.getByRole("button", { name: /next|tiếp theo/i }).click();

      // Mock OTP
      await page.route("**/api/otp/**", (route) => {
        route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({ success: true }),
        });
      });

      await page.getByRole("button", { name: /send otp|gửi mã/i }).click();
      await page.getByLabel(/enter otp|nhập mã/i).fill("123456");
      await page.getByRole("button", { name: /verify|xác thực/i }).click();

      // Navigate to post-OTP step
      await page.getByRole("button", { name: /next|tiếp theo/i }).click();

      // Get session data before refresh
      const sessionBefore = await page.evaluate(() => {
        const keys = Object.keys(sessionStorage).filter((k) =>
          k.startsWith("dop_verification_"),
        );
        return keys.length > 0 ? sessionStorage.getItem(keys[0]) : null;
      });

      expect(sessionBefore).not.toBeNull();

      // Refresh page
      await page.reload();
      await page.waitForLoadState("networkidle");

      // Session should still exist
      const sessionAfter = await page.evaluate(() => {
        const keys = Object.keys(sessionStorage).filter((k) =>
          k.startsWith("dop_verification_"),
        );
        return keys.length > 0 ? sessionStorage.getItem(keys[0]) : null;
      });

      expect(sessionAfter).not.toBeNull();
      expect(sessionAfter).toBe(sessionBefore);

      // Back navigation should still be blocked
      await page.goBack();
      await page.waitForTimeout(500);

      // Should see blocked notification
      await expect(
        page.getByText(/cannot go back|không thể quay lại/i),
      ).toBeVisible({ timeout: 3000 });
    });
  });

  test.describe("Scenario 5: Session Timeout with Activity Tracking", () => {
    test("should expire session after timeout period", async ({ page }) => {
      // Enable session timeout via environment variable
      await page.addInitScript(() => {
        (window as any).NEXT_PUBLIC_NAV_ENABLE_TIMEOUT = "true";
        (window as any).NEXT_PUBLIC_NAV_TIMEOUT_MINUTES = "0.1"; // 6 seconds for testing
      });

      // Complete OTP verification
      await page.getByLabel("Loan Amount").fill("45000000");
      await page.getByRole("button", { name: /next|tiếp theo/i }).click();

      await page.getByLabel("Full Name").fill("Vo Thi F");
      await page.getByRole("button", { name: /next|tiếp theo/i }).click();

      // Mock OTP
      await page.route("**/api/otp/**", (route) => {
        route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({ success: true }),
        });
      });

      await page.getByRole("button", { name: /send otp|gửi mã/i }).click();
      await page.getByLabel(/enter otp|nhập mã/i).fill("123456");
      await page.getByRole("button", { name: /verify|xác thực/i }).click();

      // Navigate to post-OTP step
      await page.getByRole("button", { name: /next|tiếp theo/i }).click();

      // Wait for timeout (6 seconds + buffer)
      await page.waitForTimeout(7000);

      // Should see session expired notification
      await expect(
        page.getByText(/session expired|phiên hết hạn/i),
      ).toBeVisible({ timeout: 3000 });

      // Should be redirected to first step
      await expect(page.getByText(/step 1|bước 1/i)).toBeVisible();
    });

    test("should extend session on user activity", async ({ page }) => {
      // Enable session timeout
      await page.addInitScript(() => {
        (window as any).NEXT_PUBLIC_NAV_ENABLE_TIMEOUT = "true";
        (window as any).NEXT_PUBLIC_NAV_TIMEOUT_MINUTES = "0.1"; // 6 seconds
      });

      // Complete OTP verification
      await page.getByLabel("Loan Amount").fill("55000000");
      await page.getByRole("button", { name: /next|tiếp theo/i }).click();

      await page.getByLabel("Full Name").fill("Dang Van G");
      await page.getByRole("button", { name: /next|tiếp theo/i }).click();

      // Mock OTP
      await page.route("**/api/otp/**", (route) => {
        route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({ success: true }),
        });
      });

      await page.getByRole("button", { name: /send otp|gửi mã/i }).click();
      await page.getByLabel(/enter otp|nhập mã/i).fill("123456");
      await page.getByRole("button", { name: /verify|xác thực/i }).click();

      // Navigate to post-OTP step
      await page.getByRole("button", { name: /next|tiếp theo/i }).click();

      // Wait 3 seconds
      await page.waitForTimeout(3000);

      // Simulate user activity (click on page)
      await page.click("body");

      // Wait another 4 seconds (total 7 seconds, but activity reset timeout)
      await page.waitForTimeout(4000);

      // Session should NOT be expired (activity extended it)
      await expect(
        page.getByText(/session expired|phiên hết hạn/i),
      ).not.toBeVisible();

      // Should still be on post-OTP step
      await expect(page.getByText(/step 4|bước 4/i)).toBeVisible();
    });
  });

  test.describe("Scenario 6: Form Completion Clears Session", () => {
    test("should clear session when form is submitted", async ({ page }) => {
      // Complete entire flow
      await page.getByLabel("Loan Amount").fill("60000000");
      await page.getByRole("button", { name: /next|tiếp theo/i }).click();

      await page.getByLabel("Full Name").fill("Bui Thi H");
      await page.getByRole("button", { name: /next|tiếp theo/i }).click();

      // Mock OTP
      await page.route("**/api/otp/**", (route) => {
        route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({ success: true }),
        });
      });

      await page.getByRole("button", { name: /send otp|gửi mã/i }).click();
      await page.getByLabel(/enter otp|nhập mã/i).fill("123456");
      await page.getByRole("button", { name: /verify|xác thực/i }).click();

      // Navigate through remaining steps
      await page.getByRole("button", { name: /next|tiếp theo/i }).click();
      await page.getByRole("button", { name: /next|tiếp theo/i }).click();

      // Mock form submission
      await page.route("**/api/leads/*/submit-info", (route) => {
        route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            success: true,
            applicationId: "APP-123456",
          }),
        });
      });

      // Submit form
      await page.getByRole("button", { name: /submit|gửi/i }).click();

      // Wait for success message
      await expect(page.getByText(/success|thành công/i)).toBeVisible({
        timeout: 5000,
      });

      // Check that session was cleared
      const sessionKeys = await page.evaluate(() => {
        return Object.keys(sessionStorage).filter((k) =>
          k.startsWith("dop_verification_"),
        );
      });

      expect(sessionKeys.length).toBe(0);
    });
  });

  test.describe("Scenario 7: Navigation Notifications", () => {
    test("should display notification when navigation is blocked", async ({
      page,
    }) => {
      // Complete OTP verification
      await page.getByLabel("Loan Amount").fill("20000000");
      await page.getByRole("button", { name: /next|tiếp theo/i }).click();

      await page.getByLabel("Full Name").fill("Nguyen Van I");
      await page.getByRole("button", { name: /next|tiếp theo/i }).click();

      // Mock OTP
      await page.route("**/api/otp/**", (route) => {
        route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({ success: true }),
        });
      });

      await page.getByRole("button", { name: /send otp|gửi mã/i }).click();
      await page.getByLabel(/enter otp|nhập mã/i).fill("123456");
      await page.getByRole("button", { name: /verify|xác thực/i }).click();

      // Navigate to post-OTP step
      await page.getByRole("button", { name: /next|tiếp theo/i }).click();

      // Try to use back button
      await page.getByRole("button", { name: /back|quay lại/i }).click();

      // Should see toast notification
      await expect(
        page.locator('[role="alert"]', {
          hasText: /navigation blocked|điều hướng bị chặn/i,
        }),
      ).toBeVisible({ timeout: 3000 });

      // Notification should auto-dismiss after 3 seconds
      await expect(
        page.locator('[role="alert"]', {
          hasText: /navigation blocked|điều hướng bị chặn/i,
        }),
      ).not.toBeVisible({ timeout: 5000 });
    });
  });

  test.describe("Scenario 8: Manual Session Reset", () => {
    test("should show reset button on session error", async ({ page }) => {
      // Complete OTP verification
      await page.getByLabel("Loan Amount").fill("15000000");
      await page.getByRole("button", { name: /next|tiếp theo/i }).click();

      await page.getByLabel("Full Name").fill("Tran Van J");
      await page.getByRole("button", { name: /next|tiếp theo/i }).click();

      // Mock OTP
      await page.route("**/api/otp/**", (route) => {
        route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({ success: true }),
        });
      });

      await page.getByRole("button", { name: /send otp|gửi mã/i }).click();
      await page.getByLabel(/enter otp|nhập mã/i).fill("123456");
      await page.getByRole("button", { name: /verify|xác thực/i }).click();

      // Navigate to post-OTP step
      await page.getByRole("button", { name: /next|tiếp theo/i }).click();

      // Corrupt session data in sessionStorage
      await page.evaluate(() => {
        const keys = Object.keys(sessionStorage).filter((k) =>
          k.startsWith("dop_verification_"),
        );
        if (keys.length > 0) {
          sessionStorage.setItem(keys[0], "corrupted-data");
        }
      });

      // Refresh page to trigger error recovery
      await page.reload();
      await page.waitForLoadState("networkidle");

      // Should see error message and reset button
      await expect(page.getByText(/session error|lỗi phiên/i)).toBeVisible({
        timeout: 3000,
      });

      await expect(
        page.getByRole("button", { name: /start over|bắt đầu lại/i }),
      ).toBeVisible();

      // Click reset button
      await page
        .getByRole("button", { name: /start over|bắt đầu lại/i })
        .click();

      // Should be redirected to first step
      await expect(page.getByText(/step 1|bước 1/i)).toBeVisible();

      // Session should be cleared
      const sessionKeys = await page.evaluate(() => {
        return Object.keys(sessionStorage).filter((k) =>
          k.startsWith("dop_verification_"),
        );
      });

      expect(sessionKeys.length).toBe(0);
    });
  });

  test.describe("Mobile Responsiveness", () => {
    test("should work correctly on mobile devices", async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 812 });

      // Complete OTP flow
      await page.getByLabel("Loan Amount").fill("10000000");
      await page.getByRole("button", { name: /next|tiếp theo/i }).click();

      await page.getByLabel("Full Name").fill("Mobile User");
      await page.getByRole("button", { name: /next|tiếp theo/i }).click();

      // Mock OTP
      await page.route("**/api/otp/**", (route) => {
        route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({ success: true }),
        });
      });

      await page.getByRole("button", { name: /send otp|gửi mã/i }).click();
      await page.getByLabel(/enter otp|nhập mã/i).fill("123456");
      await page.getByRole("button", { name: /verify|xác thực/i }).click();

      // Navigate to post-OTP step
      await page.getByRole("button", { name: /next|tiếp theo/i }).click();

      // Try browser back (mobile)
      await page.goBack();
      await page.waitForTimeout(500);

      // Should see notification
      await expect(
        page.getByText(/cannot go back|không thể quay lại/i),
      ).toBeVisible({ timeout: 3000 });
    });
  });

  test.describe("Accessibility", () => {
    test("should be keyboard navigable", async ({ page }) => {
      // Complete OTP flow
      await page.getByLabel("Loan Amount").fill("12000000");
      await page.keyboard.press("Tab");
      await page.keyboard.press("Enter"); // Next button

      await page.getByLabel("Full Name").fill("Keyboard User");
      await page.keyboard.press("Tab");
      await page.keyboard.press("Enter"); // Next button

      // Mock OTP
      await page.route("**/api/otp/**", (route) => {
        route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({ success: true }),
        });
      });

      // Tab to send OTP button
      await page.keyboard.press("Tab");
      await page.keyboard.press("Enter");

      // Enter OTP
      await page.getByLabel(/enter otp|nhập mã/i).fill("123456");
      await page.keyboard.press("Tab");
      await page.keyboard.press("Enter"); // Verify button

      // Navigate to post-OTP step
      await page.keyboard.press("Tab");
      await page.keyboard.press("Enter"); // Next button

      // Try to go back with keyboard
      await page.keyboard.press("Tab");
      await page.keyboard.press("Enter"); // Back button

      // Should see notification
      await expect(
        page.getByText(/cannot go back|không thể quay lại/i),
      ).toBeVisible({ timeout: 3000 });
    });
  });

  // ==========================================================================
  // Profile-Based Tests
  // ==========================================================================

  test.describe("Scenario 9: OTP at Different Positions (Profile Tests)", () => {
    test("should block navigation with OTP at step 1 (otp-at-step-1 profile)", async ({
      page,
    }) => {
      // Set profile for OTP at first step
      await setMSWProfile(page, "otp-at-step-1");
      await page.reload();
      await page.waitForLoadState("networkidle");

      // Step 1 should be OTP step
      await expect(
        page.getByText(/OTP Verification|Xác thực OTP/i),
      ).toBeVisible();

      // Mock OTP
      await page.route("**/api/otp/**", (route) => {
        route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({ success: true }),
        });
      });

      // Complete OTP at step 1
      await page.getByRole("button", { name: /send otp|gửi mã/i }).click();
      await page.getByLabel(/enter otp|nhập mã/i).fill("123456");
      await page.getByRole("button", { name: /verify|xác thực/i }).click();

      await expect(page.getByText(/verified|đã xác thực/i)).toBeVisible();

      // Navigate to step 2
      await page.getByRole("button", { name: /next|tiếp theo/i }).click();

      // Try to go back to step 1 (should be blocked)
      await page.goBack();
      await page.waitForTimeout(500);

      // Should see blocked notification
      await expect(
        page.getByText(/cannot go back|không thể quay lại/i),
      ).toBeVisible({ timeout: 3000 });
    });

    test("should block navigation with OTP at last step (otp-at-last-step profile)", async ({
      page,
    }) => {
      // Set profile for OTP at last step
      await setMSWProfile(page, "otp-at-last-step");
      await page.reload();
      await page.waitForLoadState("networkidle");

      // Navigate through all steps to reach OTP at the end
      for (let i = 0; i < 4; i++) {
        await page.getByRole("button", { name: /next|tiếp theo/i }).click();
        await page.waitForTimeout(200);
      }

      // Last step should be OTP
      await expect(
        page.getByText(/OTP Verification|Xác thực OTP/i),
      ).toBeVisible();

      // Mock OTP
      await page.route("**/api/otp/**", (route) => {
        route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({ success: true }),
        });
      });

      // Complete OTP
      await page.getByRole("button", { name: /send otp|gửi mã/i }).click();
      await page.getByLabel(/enter otp|nhập mã/i).fill("123456");
      await page.getByRole("button", { name: /verify|xác thực/i }).click();

      await expect(page.getByText(/verified|đã xác thực/i)).toBeVisible();

      // Try to go back (should be blocked to all previous steps)
      await page.goBack();
      await page.waitForTimeout(500);

      // Should see blocked notification
      await expect(
        page.getByText(/cannot go back|không thể quay lại/i),
      ).toBeVisible({ timeout: 3000 });
    });

    test("should allow navigation with explicit OTP at step 3 (otp-at-step-3 profile)", async ({
      page,
    }) => {
      // Set profile for OTP at step 3
      await setMSWProfile(page, "otp-at-step-3");
      await page.reload();
      await page.waitForLoadState("networkidle");

      // Navigate to step 3
      await page.getByRole("button", { name: /next|tiếp theo/i }).click();
      await page.waitForTimeout(200);
      await page.getByRole("button", { name: /next|tiếp theo/i }).click();
      await page.waitForTimeout(200);

      // Step 3 should be OTP
      await expect(
        page.getByText(/OTP Verification|Xác thực OTP/i),
      ).toBeVisible();

      // Mock OTP
      await page.route("**/api/otp/**", (route) => {
        route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({ success: true }),
        });
      });

      // Complete OTP
      await page.getByRole("button", { name: /send otp|gửi mã/i }).click();
      await page.getByLabel(/enter otp|nhập mã/i).fill("123456");
      await page.getByRole("button", { name: /verify|xác thực/i }).click();

      // Navigate to step 4
      await page.getByRole("button", { name: /next|tiếp theo/i }).click();

      // Try to go back to step 1 (should be blocked)
      await page.goBack();
      await page.waitForTimeout(500);

      await expect(
        page.getByText(/cannot go back|không thể quay lại/i),
      ).toBeVisible({ timeout: 3000 });
    });
  });

  test.describe("Scenario 10: Multi-OTP Flow (multi-otp-flow profile)", () => {
    test("should handle multiple OTP steps correctly", async ({ page }) => {
      // Set multi-OTP profile
      await setMSWProfile(page, "multi-otp-flow");
      await page.reload();
      await page.waitForLoadState("networkidle");

      // Mock OTP
      await page.route("**/api/otp/**", (route) => {
        route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({ success: true }),
        });
      });

      // Navigate to first OTP step (step 2)
      await page.getByRole("button", { name: /next|tiếp theo/i }).click();

      // Complete first OTP
      await expect(
        page.getByText(/OTP Verification|Xác thực OTP/i),
      ).toBeVisible();
      await page.getByRole("button", { name: /send otp|gửi mã/i }).click();
      await page.getByLabel(/enter otp|nhập mã/i).fill("123456");
      await page.getByRole("button", { name: /verify|xác thực/i }).click();

      // Navigate to step 3
      await page.getByRole("button", { name: /next|tiếp theo/i }).click();

      // Navigate to second OTP step (step 4)
      await page.getByRole("button", { name: /next|tiếp theo/i }).click();

      // Complete second OTP
      await expect(
        page.getByText(/OTP Verification|Xác thực OTP/i),
      ).toBeVisible();
      await page.getByRole("button", { name: /send otp|gửi mã/i }).click();
      await page.getByLabel(/enter otp|nhập mã/i).fill("654321");
      await page.getByRole("button", { name: /verify|xác thực/i }).click();

      // Navigate to step 5
      await page.getByRole("button", { name: /next|tiếp theo/i }).click();

      // Try to go back (should be blocked to all steps before first OTP)
      await page.goBack();
      await page.waitForTimeout(500);

      await expect(
        page.getByText(/cannot go back|không thể quay lại/i),
      ).toBeVisible({ timeout: 3000 });
    });

    test("should block navigation after first OTP in multi-OTP flow", async ({
      page,
    }) => {
      // Set multi-OTP profile
      await setMSWProfile(page, "multi-otp-flow");
      await page.reload();
      await page.waitForLoadState("networkidle");

      // Mock OTP
      await page.route("**/api/otp/**", (route) => {
        route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({ success: true }),
        });
      });

      // Navigate to first OTP step
      await page.getByRole("button", { name: /next|tiếp theo/i }).click();

      // Complete first OTP
      await page.getByRole("button", { name: /send otp|gửi mã/i }).click();
      await page.getByLabel(/enter otp|nhập mã/i).fill("123456");
      await page.getByRole("button", { name: /verify|xác thực/i }).click();

      // Navigate to step 3
      await page.getByRole("button", { name: /next|tiếp theo/i }).click();

      // Try to go back to step 1 (should be blocked)
      const currentUrl = page.url();
      await page.goBack();
      await page.waitForTimeout(500);

      // Should remain on current step
      expect(page.url()).toBe(currentUrl);
    });
  });

  test.describe("Scenario 11: No-OTP Flow (no-otp-flow profile)", () => {
    test("should allow all navigation without OTP", async ({ page }) => {
      // Set no-OTP profile
      await setMSWProfile(page, "no-otp-flow");
      await page.reload();
      await page.waitForLoadState("networkidle");

      // Navigate through all steps
      for (let i = 0; i < 4; i++) {
        await page.getByRole("button", { name: /next|tiếp theo/i }).click();
        await page.waitForTimeout(200);
      }

      // Should be on step 5
      await expect(page.getByText(/step 5|bước 5/i)).toBeVisible();

      // Go back should work (no OTP to block)
      await page.goBack();
      await page.waitForTimeout(200);

      // Should be on step 4
      await expect(page.getByText(/step 4|bước 4/i)).toBeVisible();

      // Continue going back
      await page.goBack();
      await page.waitForTimeout(200);

      // Should be on step 3
      await expect(page.getByText(/step 3|bước 3/i)).toBeVisible();

      // No blocked notification should appear
      await expect(
        page.getByText(/cannot go back|không thể quay lại/i),
      ).not.toBeVisible();
    });

    test("should not create verification session without OTP", async ({
      page,
    }) => {
      // Set no-OTP profile
      await setMSWProfile(page, "no-otp-flow");
      await page.reload();
      await page.waitForLoadState("networkidle");

      // Navigate through steps
      for (let i = 0; i < 3; i++) {
        await page.getByRole("button", { name: /next|tiếp theo/i }).click();
        await page.waitForTimeout(200);
      }

      // Check that no verification session was created
      const sessionKeys = await page.evaluate(() => {
        return Object.keys(sessionStorage).filter((k) =>
          k.startsWith("dop_verification_"),
        );
      });

      expect(sessionKeys.length).toBe(0);
    });
  });

  test.describe("Scenario 12: Profile Comparison", () => {
    test("should demonstrate different blocking behavior across profiles", async ({
      page,
    }) => {
      const profiles: ProfileName[] = [
        "otp-at-step-1",
        "default",
        "otp-at-last-step",
      ];

      for (const profileName of profiles) {
        // Set profile
        await setMSWProfile(page, profileName);
        await page.reload();
        await page.waitForLoadState("networkidle");

        // Mock OTP
        await page.route("**/api/otp/**", (route) => {
          route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify({ success: true }),
          });
        });

        // Navigate to find OTP step and complete it
        let foundOTP = false;
        for (let i = 0; i < 5 && !foundOTP; i++) {
          const hasOTP = await page
            .getByText(/OTP Verification|Xác thực OTP/i)
            .isVisible()
            .catch(() => false);

          if (hasOTP) {
            foundOTP = true;
            await page
              .getByRole("button", { name: /send otp|gửi mã/i })
              .click();
            await page.getByLabel(/enter otp|nhập mã/i).fill("123456");
            await page
              .getByRole("button", { name: /verify|xác thực/i })
              .click();
            await page.waitForTimeout(500);
          } else {
            await page.getByRole("button", { name: /next|tiếp theo/i }).click();
            await page.waitForTimeout(200);
          }
        }

        // Try to go back
        await page.goBack();
        await page.waitForTimeout(500);

        // Should see blocked notification for all profiles with OTP
        await expect(
          page.getByText(/cannot go back|không thể quay lại/i),
        ).toBeVisible({ timeout: 3000 });

        console.log(`✓ Profile ${profileName}: Navigation blocked after OTP`);
      }
    });
  });
});
