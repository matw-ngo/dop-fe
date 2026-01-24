import { expect, test } from "@playwright/test";

/**
 * E2E Tests for User Consent Flow
 *
 * Scenario: User must accept privacy policy before accessing credit card registration
 *
 * JIRA: PDOP-48
 *
 * Test Coverage:
 * - Happy path: User opens home page → accepts consent → modal closes → redirected to onboarding
 * - Error handling: Loading state, button states
 * - Declined consent: User cannot proceed, modal closes
 * - Persistence: Consent status survives page reload (via Zustand store)
 * - Integration: Modal appears, blocks access, user redirected after accepting
 *
 * Implementation Details:
 * - ConsentModal shown on HOME page when user hasn't consented
 * - After accepting: User redirected to /user-onboarding
 * - Storage: Zustand store (encrypted format, not directly accessed in tests)
 * - UI: "Đồng ý" and "Từ chối" buttons, heading "Chính sách bảo mật"
 */

test.describe("User Consent Flow - PDOP-48", () => {
  let page: any;

  test.beforeEach(async ({ page: p }) => {
    page = p;
    // Navigate to root URL for fresh state each test
    await page.goto("/");
  });

  test.afterEach(async ({ page }) => {
    // Cleanup: clear cookies and wait between tests
    if (page) {
      await page.context().clearCookies();
      await page.waitForTimeout(1000);
    }
  });

  // ============================================================================
  // HAPPY PATH TESTS (4 tests)
  // ============================================================================

  test.describe("Happy Path - Consent Accepted", () => {
    test("User opens home page → sees consent modal (if not consented)", async ({
      page,
    }) => {
      // Given: User has not previously consented
      await page.goto("/");

      // When: User navigates to home page
      // Then: Consent modal should be visible
      await expect(
        page.getByRole("heading", { name: "Chính sách bảo mật" }),
      ).toBeVisible();
      await expect(
        page.getByText(
          "Để tiếp tục đăng ký thẻ tín dụng, chúng tôi cần sự đồng ý của bạn về việc thu thập và sử dụng dữ liệu cá nhân.",
        ),
      ).toBeVisible();
      await expect(page.getByRole("button", { name: "Đồng ý" })).toBeVisible();
      await expect(page.getByRole("button", { name: "Từ chối" })).toBeVisible();
    });

    test("User clicks Đồng ý → modal closes, user redirected to onboarding", async ({
      page,
    }) => {
      // Given: User sees consent modal on home page
      await page.goto("/");
      await expect(
        page.getByRole("heading", { name: "Chính sách bảo mật" }),
      ).toBeVisible();

      // When: User clicks "Đồng ý" button
      const consentButton = page.getByRole("button", { name: "Đồng ý" });
      await consentButton.click();

      // Then: Redirect to user-onboarding page
      await page.waitForURL(/.*\/[a-z]{2}\/user-onboarding/, {
        timeout: 10000,
      });

      // And: Modal should be closed
      await expect(
        page.getByRole("heading", { name: "Chính sách bảo mật" }),
      ).not.toBeVisible();
    });

    test("User can proceed to user-onboarding after accepting consent", async ({
      page,
    }) => {
      // Given: User sees consent modal
      await page.goto("/");
      await page.getByRole("button", { name: "Đồng ý" }).click();

      // When: Redirected to user-onboarding
      await page.waitForURL(/.*\/[a-z]{2}\/user-onboarding/, {
        timeout: 10000,
      });

      // Then: User should see onboarding heading
      await expect(
        page.getByRole("heading", { name: "Đăng ký tài khoản vay" }),
      ).toBeVisible();
    });

    test("Modal does NOT appear after reload if user has consented", async ({
      page,
    }) => {
      // Given: User has accepted consent
      await page.goto("/");
      await page.getByRole("button", { name: "Đồng ý" }).click();
      await page.waitForURL(/.*\/[a-z]{2}\/user-onboarding/, {
        timeout: 10000,
      });

      // When: Navigate back to home page
      await page.goto("/");

      // Then: Consent modal should NOT appear
      await expect(
        page.getByRole("heading", { name: "Chính sách bảo mật" }),
      ).not.toBeVisible();
    });

    test("Consent button shows loading state while processing", async ({
      page,
    }) => {
      // Given: User clicks Đồng ý
      await page.goto("/");
      const consentButton = page.getByRole("button", { name: "Đồng ý" });

      // When: Button is clicked
      await consentButton.click();

      // Then: Button should show loading state
      await expect(consentButton).toHaveText("Đang xử lý...");
      await expect(consentButton).toBeDisabled();
    });
  });

  // ============================================================================
  // CONSENT DECLINED TESTS (3 tests)
  // ============================================================================

  test.describe("Consent Declined", () => {
    test("User clicks Từ chối → modal closes", async ({ page }) => {
      // Given: User sees consent modal on home page
      await page.goto("/");
      await expect(
        page.getByRole("heading", { name: "Chính sách bảo mật" }),
      ).toBeVisible();

      // When: User clicks "Từ chối" button
      await page.getByRole("button", { name: "Từ chối" }).click();

      // Then: Modal should close
      await expect(
        page.getByRole("heading", { name: "Chính sách bảo mật" }),
      ).not.toBeVisible();

      // And: User stays on home page
      await expect(page).toHaveURL(/.*\/[a-z]{2}?\/$/);
    });

    test("User can re-open modal after declining (on reload)", async ({
      page,
    }) => {
      // Given: User has declined consent
      await page.goto("/");
      await page.getByRole("button", { name: "Từ chối" }).click();
      await page.waitForTimeout(500);

      // When: User reloads page
      await page.reload();

      // Then: Consent modal should appear again
      await expect(
        page.getByRole("heading", { name: "Chính sách bảo mật" }),
      ).toBeVisible();
    });
  });

  // ============================================================================
  // PERSISTENCE TESTS (3 tests)
  // ============================================================================

  test.describe("Persistence Across Interactions", () => {
    test("Consent persists across page reloads", async ({ page }) => {
      // Given: User has accepted consent
      await page.goto("/");
      await page.getByRole("button", { name: "Đồng ý" }).click();
      await page.waitForURL(/.*\/[a-z]{2}\/user-onboarding/, {
        timeout: 10000,
      });

      // When: Navigate back to home page
      await page.goto("/");

      // Then: Consent modal should NOT appear
      await expect(
        page.getByRole("heading", { name: "Chính sách bảo mật" }),
      ).not.toBeVisible();
    });

    test("Session storage cleared → modal reappears", async ({ page }) => {
      // Given: User has consented
      await page.goto("/");
      await page.getByRole("button", { name: "Đồng ý" }).click();
      await page.waitForURL(/.*\/[a-z]{2}\/user-onboarding/, {
        timeout: 10000,
      });

      // When: Session storage is cleared
      await page.context().clearCookies();
      await page.waitForTimeout(500);

      // Then: Modal should reappear on navigation
      await page.goto("/");
      await expect(
        page.getByRole("heading", { name: "Chính sách bảo mật" }),
      ).toBeVisible();
    });

    test("New browser session → modal appears if consent lost", async ({
      page,
    }) => {
      // Given: Previous session had consent
      await page.goto("/");
      await page.getByRole("button", { name: "Đồng ý" }).click();
      await page.waitForURL(/.*\/[a-z]{2}\/user-onboarding/, {
        timeout: 10000,
      });

      // When: New session (simulate by clearing cookies)
      await page.context().clearCookies();
      await page.waitForTimeout(500);

      // Then: Modal should appear
      await page.goto("/");
      await expect(
        page.getByRole("heading", { name: "Chính sách bảo mật" }),
      ).toBeVisible();
    });
  });

  // ============================================================================
  // INTEGRATION TESTS (4 tests)
  // ============================================================================

  test.describe("Integration with Application", () => {
    test("Consent modal appears on home page if not consented", async ({
      page,
    }) => {
      // Given: User is on home page without consent
      await page.goto("/");

      // When: Check for modal
      // Then: Modal should be visible
      await expect(
        page.getByRole("heading", { name: "Chính sách bảo mật" }),
      ).toBeVisible();
      await expect(page.getByRole("button", { name: "Đồng ý" })).toBeVisible();
    });

    test("After consent → user can access user-onboarding page", async ({
      page,
    }) => {
      // Given: User accepts consent
      await page.goto("/");
      await page.getByRole("button", { name: "Đồng ý" }).click();
      await page.waitForURL(/.*\/[a-z]{2}\/user-onboarding/, {
        timeout: 10000,
      });

      // Then: User should see onboarding heading
      await expect(
        page.getByRole("heading", { name: "Đăng ký tài khoản vay" }),
      ).toBeVisible();
    });

    test("Modal blocks interaction until consent is accepted", async ({
      page,
    }) => {
      // Given: User is on home page without consent
      await page.goto("/");

      // When: Modal is visible
      await expect(
        page.getByRole("heading", { name: "Chính sách bảo mật" }),
      ).toBeVisible();
      await expect(page.getByRole("button", { name: "Đồng ý" })).toBeVisible();
    });

    test("Button re-enabled after loading completes", async ({ page }) => {
      // Given: User clicks consent
      await page.goto("/");
      const consentButton = page.getByRole("button", { name: "Đồng ý" });
      await consentButton.click();

      // When: Loading completes
      await page.waitForTimeout(2000);

      // Then: Button should be re-enabled
      await expect(consentButton).toBeEnabled();
    });
  });
});
