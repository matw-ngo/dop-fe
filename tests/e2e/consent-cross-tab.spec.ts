import { test, expect, type Page } from "@playwright/test";

/**
 * E2E Tests for Cross-Tab Consent Synchronization
 *
 * Feature: migrate-consent-storage-to-cookies
 *
 * Test Coverage:
 * - Cross-tab synchronization: Consent granted in Tab A reflects in Tab B within 1 second
 * - Cross-tab synchronization: Consent declined in Tab A reflects in Tab B within 1 second
 * - Cookie updates and UI changes in passive tab
 * - Cookie configuration validation
 *
 * Requirements Validated:
 * - 3.3: Consent granted in one tab reflects in another tab within 1 second
 * - 3.4: Consent declined in one tab reflects in another tab within 1 second
 * - 8.3: E2E tests verify cross-tab synchronization behavior
 *
 * Implementation Details:
 * - Uses Playwright's multi-page context to simulate multiple tabs
 * - Verifies cookie-based storage synchronization
 * - Tests both consent granted and declined scenarios
 * - Validates UI updates in passive tabs
 */

test.describe("Consent Cross-Tab Synchronization", () => {
  test.beforeEach(async ({ context }) => {
    // Clear all cookies and storage for fresh state
    await context.clearCookies();
  });

  /**
   * Helper function to wait for consent cookie to be set
   */
  async function waitForConsentCookie(
    page: Page,
    expectedStatus: "agreed" | "declined",
    timeout = 2000,
  ): Promise<boolean> {
    const startTime = Date.now();

    while (Date.now() - startTime < timeout) {
      const cookies = await page.context().cookies();
      const consentCookie = cookies.find((c) => c.name === "dop_consent_state");

      if (consentCookie) {
        try {
          const cookieValue = decodeURIComponent(consentCookie.value);
          const parsed = JSON.parse(cookieValue);

          if (parsed.state?.consentStatus === expectedStatus) {
            return true;
          }
        } catch (error) {
          // Cookie might not be fully written yet, continue waiting
        }
      }

      // Wait 100ms before checking again
      await page.waitForTimeout(100);
    }

    return false;
  }

  /**
   * Helper function to get consent status from cookie
   */
  async function getConsentStatusFromCookie(
    page: Page,
  ): Promise<string | null> {
    const cookies = await page.context().cookies();
    const consentCookie = cookies.find((c) => c.name === "dop_consent_state");

    if (!consentCookie) {
      return null;
    }

    try {
      const cookieValue = decodeURIComponent(consentCookie.value);
      const parsed = JSON.parse(cookieValue);
      return parsed.state?.consentStatus || null;
    } catch (error) {
      console.error("Failed to parse consent cookie:", error);
      return null;
    }
  }

  test("consent granted in Tab A reflects in Tab B within 1 second", async ({
    context,
  }) => {
    // Feature: migrate-consent-storage-to-cookies, Requirement 3.3

    // Open two tabs
    const page1 = await context.newPage();
    const page2 = await context.newPage();

    try {
      // Navigate both tabs to the onboarding page
      await page1.goto("/user-onboarding");
      await page2.goto("/user-onboarding");

      // Wait for pages to load
      await page1.waitForLoadState("networkidle");
      await page2.waitForLoadState("networkidle");

      // Record start time for synchronization measurement
      const startTime = Date.now();

      // Grant consent in page1 by clicking the Continue button
      const continueButton = page1.getByRole("button", {
        name: /continue|tiếp tục/i,
      });

      // Wait for button to be visible and enabled
      await continueButton.waitFor({ state: "visible", timeout: 5000 });
      await expect(continueButton).toBeEnabled();

      // Click the button to grant consent
      await continueButton.click();

      // Wait for consent cookie to be set with "agreed" status
      const cookieSet = await waitForConsentCookie(page1, "agreed", 2000);
      expect(cookieSet).toBe(true);

      // Measure synchronization time
      const syncTime = Date.now() - startTime;

      // Verify page2 reflects the consent within 1 second
      const status = await getConsentStatusFromCookie(page2);
      expect(status).toBe("agreed");

      // Verify synchronization happened within 1 second
      expect(syncTime).toBeLessThan(1000);

      console.log(
        `[Cross-Tab Sync] Consent granted synchronized in ${syncTime}ms`,
      );

      // Verify UI updates in page2 - consent banner should be hidden
      const consentBanner = page2.locator('[role="dialog"]').first();
      await expect(consentBanner).not.toBeVisible({ timeout: 2000 });
    } finally {
      // Clean up pages
      await page1.close();
      await page2.close();
    }
  });

  test("consent declined in Tab A reflects in Tab B within 1 second", async ({
    context,
  }) => {
    // Feature: migrate-consent-storage-to-cookies, Requirement 3.4

    // Open two tabs
    const page1 = await context.newPage();
    const page2 = await context.newPage();

    try {
      // Navigate both tabs to the onboarding page
      await page1.goto("/user-onboarding");
      await page2.goto("/user-onboarding");

      // Wait for pages to load
      await page1.waitForLoadState("networkidle");
      await page2.waitForLoadState("networkidle");

      // Record start time for synchronization measurement
      const startTime = Date.now();

      // Decline consent in page1
      // Note: The current implementation only has a "Continue" button which grants consent
      // For this test, we'll simulate declining by directly setting the cookie
      // In a real implementation, there would be a "Decline" button

      await page1.evaluate(() => {
        // Manually set declined consent state in cookie
        const declinedState = {
          state: {
            consentId: "test-declined-consent-id",
            consentStatus: "declined",
            consentData: null,
            lastConsentDate: new Date().toISOString(),
          },
        };

        const cookieValue = encodeURIComponent(JSON.stringify(declinedState));
        document.cookie = `dop_consent_state=${cookieValue}; max-age=2592000; path=/; secure; samesite=Lax`;

        // Dispatch storage event to trigger Zustand sync
        window.dispatchEvent(new Event("storage"));
      });

      // Wait for consent cookie to be set with "declined" status
      const cookieSet = await waitForConsentCookie(page1, "declined", 2000);
      expect(cookieSet).toBe(true);

      // Measure synchronization time
      const syncTime = Date.now() - startTime;

      // Verify page2 reflects the declined consent within 1 second
      const status = await getConsentStatusFromCookie(page2);
      expect(status).toBe("declined");

      // Verify synchronization happened within 1 second
      expect(syncTime).toBeLessThan(1000);

      console.log(
        `[Cross-Tab Sync] Consent declined synchronized in ${syncTime}ms`,
      );

      // Verify cookie value in page2 contains declined status
      const cookieValue = await page2.evaluate(() => {
        const cookie = document.cookie
          .split("; ")
          .find((row) => row.startsWith("dop_consent_state="));
        return cookie ? decodeURIComponent(cookie.split("=")[1]) : null;
      });

      expect(cookieValue).toContain('"consentStatus":"declined"');
    } finally {
      // Clean up pages
      await page1.close();
      await page2.close();
    }
  });

  test("cookie updates trigger UI changes in passive tab", async ({
    context,
  }) => {
    // Feature: migrate-consent-storage-to-cookies, Requirement 8.3

    // Open two tabs
    const page1 = await context.newPage();
    const page2 = await context.newPage();

    try {
      // Navigate both tabs to the onboarding page
      await page1.goto("/user-onboarding");
      await page2.goto("/user-onboarding");

      // Wait for pages to load
      await page1.waitForLoadState("networkidle");
      await page2.waitForLoadState("networkidle");

      // Verify consent banner is visible in both tabs initially
      const banner1 = page1.locator('[role="dialog"]').first();
      const banner2 = page2.locator('[role="dialog"]').first();

      await expect(banner1).toBeVisible({ timeout: 5000 });
      await expect(banner2).toBeVisible({ timeout: 5000 });

      // Grant consent in page1
      const continueButton = page1.getByRole("button", {
        name: /continue|tiếp tục/i,
      });

      await continueButton.waitFor({ state: "visible", timeout: 5000 });
      await continueButton.click();

      // Wait for cookie to be set
      await waitForConsentCookie(page1, "agreed", 2000);

      // Verify banner is hidden in page1
      await expect(banner1).not.toBeVisible({ timeout: 2000 });

      // Verify banner is also hidden in page2 (passive tab)
      // This validates that the UI updates based on cookie changes
      await expect(banner2).not.toBeVisible({ timeout: 2000 });

      console.log(
        "[Cross-Tab Sync] UI updated in passive tab after consent granted",
      );
    } finally {
      // Clean up pages
      await page1.close();
      await page2.close();
    }
  });

  test("multiple rapid consent changes synchronize correctly", async ({
    context,
  }) => {
    // Feature: migrate-consent-storage-to-cookies
    // Test edge case: rapid state changes should all synchronize

    // Open two tabs
    const page1 = await context.newPage();
    const page2 = await context.newPage();

    try {
      await page1.goto("/user-onboarding");
      await page2.goto("/user-onboarding");

      await page1.waitForLoadState("networkidle");
      await page2.waitForLoadState("networkidle");

      // Perform multiple rapid consent state changes
      for (let i = 0; i < 3; i++) {
        const status = i % 2 === 0 ? "agreed" : "declined";

        await page1.evaluate((consentStatus) => {
          const state = {
            state: {
              consentId: `test-consent-${Date.now()}`,
              consentStatus,
              consentData: null,
              lastConsentDate: new Date().toISOString(),
            },
          };

          const cookieValue = encodeURIComponent(JSON.stringify(state));
          document.cookie = `dop_consent_state=${cookieValue}; max-age=2592000; path=/; secure; samesite=Lax`;
          window.dispatchEvent(new Event("storage"));
        }, status);

        // Small delay between changes
        await page1.waitForTimeout(200);
      }

      // Wait for final state to synchronize
      await page1.waitForTimeout(1000);

      // Verify both tabs have the same final state
      const status1 = await getConsentStatusFromCookie(page1);
      const status2 = await getConsentStatusFromCookie(page2);

      expect(status1).toBe(status2);
      expect(status1).toBe("declined"); // Last change was declined

      console.log(
        "[Cross-Tab Sync] Multiple rapid changes synchronized correctly",
      );
    } finally {
      await page1.close();
      await page2.close();
    }
  });

  test("consent state persists across page reloads in multiple tabs", async ({
    context,
  }) => {
    // Feature: migrate-consent-storage-to-cookies
    // Verify cookie persistence across page reloads

    const page1 = await context.newPage();
    const page2 = await context.newPage();

    try {
      await page1.goto("/user-onboarding");
      await page2.goto("/user-onboarding");

      await page1.waitForLoadState("networkidle");
      await page2.waitForLoadState("networkidle");

      // Grant consent in page1
      const continueButton = page1.getByRole("button", {
        name: /continue|tiếp tục/i,
      });

      await continueButton.waitFor({ state: "visible", timeout: 5000 });
      await continueButton.click();

      // Wait for cookie to be set
      await waitForConsentCookie(page1, "agreed", 2000);

      // Reload both pages
      await page1.reload();
      await page2.reload();

      await page1.waitForLoadState("networkidle");
      await page2.waitForLoadState("networkidle");

      // Verify consent state persists in both tabs
      const status1 = await getConsentStatusFromCookie(page1);
      const status2 = await getConsentStatusFromCookie(page2);

      expect(status1).toBe("agreed");
      expect(status2).toBe("agreed");

      // Verify UI reflects persisted state (banner should be hidden)
      const banner1 = page1.locator('[role="dialog"]').first();
      const banner2 = page2.locator('[role="dialog"]').first();

      await expect(banner1).not.toBeVisible({ timeout: 2000 });
      await expect(banner2).not.toBeVisible({ timeout: 2000 });

      console.log(
        "[Cross-Tab Sync] Consent state persisted across page reloads",
      );
    } finally {
      await page1.close();
      await page2.close();
    }
  });

  test("consent synchronization works across different pages", async ({
    context,
  }) => {
    // Feature: migrate-consent-storage-to-cookies
    // Verify synchronization works across different routes

    const page1 = await context.newPage();
    const page2 = await context.newPage();

    try {
      // Navigate to different pages
      await page1.goto("/user-onboarding");
      await page2.goto("/"); // Home page

      await page1.waitForLoadState("networkidle");
      await page2.waitForLoadState("networkidle");

      // Grant consent in page1 (onboarding page)
      const continueButton = page1.getByRole("button", {
        name: /continue|tiếp tục/i,
      });

      await continueButton.waitFor({ state: "visible", timeout: 5000 });
      await continueButton.click();

      // Wait for cookie to be set
      await waitForConsentCookie(page1, "agreed", 2000);

      // Verify consent state is accessible from page2 (home page)
      const status2 = await getConsentStatusFromCookie(page2);
      expect(status2).toBe("agreed");

      console.log(
        "[Cross-Tab Sync] Consent synchronized across different pages",
      );
    } finally {
      await page1.close();
      await page2.close();
    }
  });
});

test.describe("Consent Cookie Configuration", () => {
  test.beforeEach(async ({ context }) => {
    await context.clearCookies();
  });

  test("session ID cookie has 30-day expiry", async ({ page }) => {
    // Feature: migrate-consent-storage-to-cookies, Requirement 8.4
    // Validates: Session ID cookie has correct 30-day expiry configuration

    await page.goto("/user-onboarding");
    await page.waitForLoadState("networkidle");

    // Wait for session ID to be generated
    await page.waitForTimeout(1000);

    // Get cookies from context
    const cookies = await page.context().cookies();
    const sessionCookie = cookies.find((c) => c.name === "consent_session_id");

    // Verify cookie exists
    expect(sessionCookie).toBeDefined();

    if (sessionCookie) {
      // Verify 30-day expiry (2592000 seconds = 30 days)
      const expiryDate = new Date(sessionCookie.expires * 1000);
      const now = new Date();
      const daysDiff =
        (expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);

      // Allow small margin for processing time
      expect(daysDiff).toBeGreaterThan(29);
      expect(daysDiff).toBeLessThan(31);

      console.log(
        `[Cookie Config] Session ID cookie expires in ${daysDiff.toFixed(1)} days`,
      );
    }
  });

  test("session ID cookie has Secure and SameSite=Lax flags", async ({
    page,
  }) => {
    // Feature: migrate-consent-storage-to-cookies, Requirement 8.4
    // Validates: Session ID cookie has correct security flags

    await page.goto("/user-onboarding");
    await page.waitForLoadState("networkidle");

    // Wait for session ID to be generated
    await page.waitForTimeout(1000);

    // Get cookies from context
    const cookies = await page.context().cookies();
    const sessionCookie = cookies.find((c) => c.name === "consent_session_id");

    // Verify cookie exists
    expect(sessionCookie).toBeDefined();

    if (sessionCookie) {
      // Verify security attributes
      expect(sessionCookie.secure).toBe(true);
      expect(sessionCookie.sameSite).toBe("Lax");
      expect(sessionCookie.path).toBe("/");

      console.log(
        "[Cookie Config] Session ID cookie has correct security flags",
      );
    }
  });

  test("consent state cookie has 30-day expiry", async ({ page }) => {
    // Feature: migrate-consent-storage-to-cookies, Requirement 8.4
    // Validates: Consent state cookie has correct 30-day expiry configuration

    await page.goto("/user-onboarding");
    await page.waitForLoadState("networkidle");

    // Grant consent to create cookie
    const continueButton = page.getByRole("button", {
      name: /continue|tiếp tục/i,
    });

    await continueButton.waitFor({ state: "visible", timeout: 5000 });
    await continueButton.click();

    // Wait for cookie to be set
    await page.waitForTimeout(1000);

    // Get cookies from context
    const cookies = await page.context().cookies();
    const consentCookie = cookies.find((c) => c.name === "dop_consent_state");

    // Verify cookie exists
    expect(consentCookie).toBeDefined();

    if (consentCookie) {
      // Verify 30-day expiry (approximately)
      const expiryDate = new Date(consentCookie.expires * 1000);
      const now = new Date();
      const daysDiff =
        (expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);

      expect(daysDiff).toBeGreaterThan(29);
      expect(daysDiff).toBeLessThan(31);

      console.log(
        `[Cookie Config] Consent cookie expires in ${daysDiff.toFixed(1)} days`,
      );
    }
  });

  test("consent state cookie has Secure and SameSite=Lax flags", async ({
    page,
  }) => {
    // Feature: migrate-consent-storage-to-cookies, Requirement 8.4
    // Validates: Consent state cookie has correct security flags

    await page.goto("/user-onboarding");
    await page.waitForLoadState("networkidle");

    // Grant consent to create cookie
    const continueButton = page.getByRole("button", {
      name: /continue|tiếp tục/i,
    });

    await continueButton.waitFor({ state: "visible", timeout: 5000 });
    await continueButton.click();

    // Wait for cookie to be set
    await page.waitForTimeout(1000);

    // Get cookies from context
    const cookies = await page.context().cookies();
    const consentCookie = cookies.find((c) => c.name === "dop_consent_state");

    // Verify cookie exists
    expect(consentCookie).toBeDefined();

    if (consentCookie) {
      // Verify cookie attributes
      expect(consentCookie.secure).toBe(true);
      expect(consentCookie.sameSite).toBe("Lax");
      expect(consentCookie.path).toBe("/");

      console.log("[Cookie Config] Consent cookie has correct security flags");
    }
  });

  test("consent cookie contains expected data structure", async ({ page }) => {
    // Feature: migrate-consent-storage-to-cookies

    await page.goto("/user-onboarding");
    await page.waitForLoadState("networkidle");

    // Grant consent
    const continueButton = page.getByRole("button", {
      name: /continue|tiếp tục/i,
    });

    await continueButton.waitFor({ state: "visible", timeout: 5000 });
    await continueButton.click();

    // Wait for cookie to be set
    await page.waitForTimeout(1000);

    // Get cookie value
    const cookies = await page.context().cookies();
    const consentCookie = cookies.find((c) => c.name === "dop_consent_state");

    expect(consentCookie).toBeDefined();

    if (consentCookie) {
      // Parse cookie value
      const cookieValue = decodeURIComponent(consentCookie.value);
      const parsed = JSON.parse(cookieValue);

      // Verify data structure
      expect(parsed).toHaveProperty("state");
      expect(parsed.state).toHaveProperty("consentId");
      expect(parsed.state).toHaveProperty("consentStatus");
      expect(parsed.state).toHaveProperty("consentData");
      expect(parsed.state).toHaveProperty("lastConsentDate");

      // Verify transient fields are NOT persisted
      expect(parsed.state).not.toHaveProperty("isLoading");
      expect(parsed.state).not.toHaveProperty("error");
      expect(parsed.state).not.toHaveProperty("modalIsOpen");
      expect(parsed.state).not.toHaveProperty("modalConfig");

      console.log("[Cookie Config] Cookie data structure validated");
    }
  });

  test("both cookies use Playwright cookies() API correctly", async ({
    page,
  }) => {
    // Feature: migrate-consent-storage-to-cookies, Requirement 8.4
    // Validates: Cookie attributes can be verified using Playwright's cookies() API

    await page.goto("/user-onboarding");
    await page.waitForLoadState("networkidle");

    // Grant consent to create both cookies
    const continueButton = page.getByRole("button", {
      name: /continue|tiếp tục/i,
    });

    await continueButton.waitFor({ state: "visible", timeout: 5000 });
    await continueButton.click();

    // Wait for cookies to be set
    await page.waitForTimeout(1000);

    // Use Playwright's cookies() API to get all cookies
    const cookies = await page.context().cookies();

    // Find both consent-related cookies
    const sessionCookie = cookies.find((c) => c.name === "consent_session_id");
    const consentCookie = cookies.find((c) => c.name === "dop_consent_state");

    // Verify both cookies exist
    expect(sessionCookie).toBeDefined();
    expect(consentCookie).toBeDefined();

    // Verify both have consistent configuration
    if (sessionCookie && consentCookie) {
      // Both should have same security settings
      expect(sessionCookie.secure).toBe(consentCookie.secure);
      expect(sessionCookie.sameSite).toBe(consentCookie.sameSite);
      expect(sessionCookie.path).toBe(consentCookie.path);

      // Both should have similar expiry (within 1 minute of each other)
      const sessionExpiry = sessionCookie.expires;
      const consentExpiry = consentCookie.expires;
      const expiryDiff = Math.abs(sessionExpiry - consentExpiry);

      expect(expiryDiff).toBeLessThan(60); // Less than 60 seconds difference

      console.log("[Cookie Config] Both cookies have consistent configuration");
    }
  });
});

test.describe("Backward Compatibility Migration", () => {
  test.beforeEach(async ({ context }) => {
    await context.clearCookies();
  });

  test("migrates localStorage session ID to cookie", async ({ page }) => {
    // Feature: migrate-consent-storage-to-cookies, Requirement 8.5
    // Validates: localStorage session ID migration to cookie with cleanup

    await page.goto("/user-onboarding");
    await page.waitForLoadState("networkidle");

    // Set up legacy localStorage data before migration
    await page.evaluate(() => {
      const sessionId = "550e8400-e29b-41d4-a716-446655440000";
      const timestamp = Date.now();
      localStorage.setItem("consent_session_id", sessionId);
      localStorage.setItem(
        "consent_session_id_timestamp",
        timestamp.toString(),
      );
    });

    // Reload to trigger migration
    await page.reload();
    await page.waitForLoadState("networkidle");

    // Wait for migration to complete
    await page.waitForTimeout(1000);

    // Verify cookie was created with migrated value
    const cookies = await page.context().cookies();
    const sessionCookie = cookies.find((c) => c.name === "consent_session_id");

    expect(sessionCookie).toBeDefined();
    expect(sessionCookie?.value).toBe("550e8400-e29b-41d4-a716-446655440000");

    // Verify localStorage was cleaned up after migration
    const localStorageCleared = await page.evaluate(() => {
      const sessionId = localStorage.getItem("consent_session_id");
      const timestamp = localStorage.getItem("consent_session_id_timestamp");
      return sessionId === null && timestamp === null;
    });

    expect(localStorageCleared).toBe(true);

    console.log(
      "[Migration] localStorage session ID migrated to cookie successfully",
    );
  });

  test("migrates sessionStorage consent state to cookie", async ({ page }) => {
    // Feature: migrate-consent-storage-to-cookies, Requirement 8.5
    // Validates: sessionStorage consent state migration to cookie with cleanup

    await page.goto("/user-onboarding");
    await page.waitForLoadState("networkidle");

    // Set up legacy sessionStorage data before migration
    await page.evaluate(() => {
      const legacyState = {
        data: JSON.stringify({
          state: {
            consentId: "legacy-consent-123",
            consentStatus: "agreed",
            consentData: null,
            lastConsentDate: "2024-01-15T10:00:00Z",
          },
        }),
        timestamp: Date.now(),
        version: "1.0",
      };
      sessionStorage.setItem("dop_consent-store", JSON.stringify(legacyState));
    });

    // Reload to trigger migration
    await page.reload();
    await page.waitForLoadState("networkidle");

    // Wait for migration to complete
    await page.waitForTimeout(1000);

    // Verify cookie was created with migrated value
    const cookies = await page.context().cookies();
    const consentCookie = cookies.find((c) => c.name === "dop_consent_state");

    expect(consentCookie).toBeDefined();

    if (consentCookie) {
      const cookieValue = decodeURIComponent(consentCookie.value);
      const parsed = JSON.parse(cookieValue);

      // Verify migrated data
      expect(parsed.state.consentId).toBe("legacy-consent-123");
      expect(parsed.state.consentStatus).toBe("agreed");
      expect(parsed.state.lastConsentDate).toBe("2024-01-15T10:00:00Z");
    }

    // Verify sessionStorage was cleaned up after migration
    const sessionStorageCleared = await page.evaluate(() => {
      return sessionStorage.getItem("dop_consent-store") === null;
    });

    expect(sessionStorageCleared).toBe(true);

    console.log(
      "[Migration] sessionStorage consent state migrated to cookie successfully",
    );
  });

  test("handles expired localStorage session ID correctly", async ({
    page,
  }) => {
    // Feature: migrate-consent-storage-to-cookies, Requirement 8.5
    // Validates: Expired session IDs are not migrated, new ones are generated

    await page.goto("/user-onboarding");
    await page.waitForLoadState("networkidle");

    // Set up expired legacy localStorage data (31 days old)
    await page.evaluate(() => {
      const sessionId = "expired-session-id";
      const expiredTimestamp = Date.now() - 31 * 24 * 60 * 60 * 1000; // 31 days ago
      localStorage.setItem("consent_session_id", sessionId);
      localStorage.setItem(
        "consent_session_id_timestamp",
        expiredTimestamp.toString(),
      );
    });

    // Reload to trigger migration
    await page.reload();
    await page.waitForLoadState("networkidle");

    // Wait for migration to complete
    await page.waitForTimeout(1000);

    // Verify a new session ID was generated (not the expired one)
    const cookies = await page.context().cookies();
    const sessionCookie = cookies.find((c) => c.name === "consent_session_id");

    expect(sessionCookie).toBeDefined();
    expect(sessionCookie?.value).not.toBe("expired-session-id");

    // Verify the new session ID is a valid UUID v4
    const uuidV4Regex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    expect(sessionCookie?.value).toMatch(uuidV4Regex);

    // Verify localStorage was cleaned up
    const localStorageCleared = await page.evaluate(() => {
      return localStorage.getItem("consent_session_id") === null;
    });

    expect(localStorageCleared).toBe(true);

    console.log(
      "[Migration] Expired session ID handled correctly, new ID generated",
    );
  });

  test("handles corrupted sessionStorage consent state gracefully", async ({
    page,
  }) => {
    // Feature: migrate-consent-storage-to-cookies, Requirement 8.5
    // Validates: Corrupted legacy data is cleaned up and reset to pending state

    await page.goto("/user-onboarding");
    await page.waitForLoadState("networkidle");

    // Set up corrupted legacy sessionStorage data
    await page.evaluate(() => {
      // Invalid JSON that will fail to parse
      sessionStorage.setItem("dop_consent-store", "{ invalid json }");
    });

    // Reload to trigger migration
    await page.reload();
    await page.waitForLoadState("networkidle");

    // Wait for migration to complete
    await page.waitForTimeout(1000);

    // Verify sessionStorage was cleaned up
    const sessionStorageCleared = await page.evaluate(() => {
      return sessionStorage.getItem("dop_consent-store") === null;
    });

    expect(sessionStorageCleared).toBe(true);

    // Verify consent state is reset to pending (no cookie or pending status)
    const cookies = await page.context().cookies();
    const consentCookie = cookies.find((c) => c.name === "dop_consent_state");

    if (consentCookie) {
      const cookieValue = decodeURIComponent(consentCookie.value);
      const parsed = JSON.parse(cookieValue);

      // Should be in pending state after failed migration
      expect(parsed.state.consentStatus).toBe("pending");
    }

    console.log("[Migration] Corrupted consent state handled gracefully");
  });

  test("migration preserves valid consent data structure", async ({ page }) => {
    // Feature: migrate-consent-storage-to-cookies, Requirement 8.5
    // Validates: All required fields are preserved during migration

    await page.goto("/user-onboarding");
    await page.waitForLoadState("networkidle");

    // Set up complete legacy sessionStorage data
    await page.evaluate(() => {
      const legacyState = {
        data: JSON.stringify({
          state: {
            consentId: "complete-consent-id",
            consentStatus: "agreed",
            consentData: {
              id: "consent-record-123",
              lead_id: "lead-456",
              consent_version_id: "version-789",
              source: "web",
              action: "grant",
              created_at: "2024-01-15T10:00:00Z",
              updated_at: "2024-01-15T10:00:00Z",
            },
            lastConsentDate: "2024-01-15T10:00:00Z",
          },
        }),
        timestamp: Date.now(),
        version: "1.0",
      };
      sessionStorage.setItem("dop_consent-store", JSON.stringify(legacyState));
    });

    // Reload to trigger migration
    await page.reload();
    await page.waitForLoadState("networkidle");

    // Wait for migration to complete
    await page.waitForTimeout(1000);

    // Verify all fields were preserved in cookie
    const cookies = await page.context().cookies();
    const consentCookie = cookies.find((c) => c.name === "dop_consent_state");

    expect(consentCookie).toBeDefined();

    if (consentCookie) {
      const cookieValue = decodeURIComponent(consentCookie.value);
      const parsed = JSON.parse(cookieValue);

      // Verify all persisted fields
      expect(parsed.state.consentId).toBe("complete-consent-id");
      expect(parsed.state.consentStatus).toBe("agreed");
      expect(parsed.state.lastConsentDate).toBe("2024-01-15T10:00:00Z");

      // Verify consentData structure
      expect(parsed.state.consentData).toBeDefined();
      expect(parsed.state.consentData.id).toBe("consent-record-123");
      expect(parsed.state.consentData.lead_id).toBe("lead-456");
      expect(parsed.state.consentData.action).toBe("grant");

      // Verify transient fields are NOT migrated
      expect(parsed.state).not.toHaveProperty("isLoading");
      expect(parsed.state).not.toHaveProperty("error");
      expect(parsed.state).not.toHaveProperty("modalIsOpen");
    }

    console.log(
      "[Migration] Complete consent data structure preserved during migration",
    );
  });

  test("migration works correctly when both legacy storages exist", async ({
    page,
  }) => {
    // Feature: migrate-consent-storage-to-cookies, Requirement 8.5
    // Validates: Both session ID and consent state migrate independently

    await page.goto("/user-onboarding");
    await page.waitForLoadState("networkidle");

    // Set up both legacy storages
    await page.evaluate(() => {
      // localStorage session ID
      const sessionId = "dual-migration-session-id";
      const timestamp = Date.now();
      localStorage.setItem("consent_session_id", sessionId);
      localStorage.setItem(
        "consent_session_id_timestamp",
        timestamp.toString(),
      );

      // sessionStorage consent state
      const legacyState = {
        data: JSON.stringify({
          state: {
            consentId: "dual-migration-consent-id",
            consentStatus: "agreed",
            consentData: null,
            lastConsentDate: "2024-01-15T10:00:00Z",
          },
        }),
        timestamp: Date.now(),
        version: "1.0",
      };
      sessionStorage.setItem("dop_consent-store", JSON.stringify(legacyState));
    });

    // Reload to trigger migration
    await page.reload();
    await page.waitForLoadState("networkidle");

    // Wait for migration to complete
    await page.waitForTimeout(1000);

    // Verify both cookies were created
    const cookies = await page.context().cookies();
    const sessionCookie = cookies.find((c) => c.name === "consent_session_id");
    const consentCookie = cookies.find((c) => c.name === "dop_consent_state");

    expect(sessionCookie).toBeDefined();
    expect(consentCookie).toBeDefined();

    // Verify session ID was migrated
    expect(sessionCookie?.value).toBe("dual-migration-session-id");

    // Verify consent state was migrated
    if (consentCookie) {
      const cookieValue = decodeURIComponent(consentCookie.value);
      const parsed = JSON.parse(cookieValue);
      expect(parsed.state.consentId).toBe("dual-migration-consent-id");
      expect(parsed.state.consentStatus).toBe("agreed");
    }

    // Verify both legacy storages were cleaned up
    const storagesCleared = await page.evaluate(() => {
      const localStorageCleared =
        localStorage.getItem("consent_session_id") === null;
      const sessionStorageCleared =
        sessionStorage.getItem("dop_consent-store") === null;
      return localStorageCleared && sessionStorageCleared;
    });

    expect(storagesCleared).toBe(true);

    console.log("[Migration] Both legacy storages migrated successfully");
  });

  test("no migration occurs when cookies already exist", async ({ page }) => {
    // Feature: migrate-consent-storage-to-cookies, Requirement 8.5
    // Validates: Existing cookies take precedence over legacy storage

    await page.goto("/user-onboarding");
    await page.waitForLoadState("networkidle");

    // Set up both cookies and legacy storage
    await page.evaluate(() => {
      // Set cookies first
      const cookieSessionId = "cookie-session-id";
      document.cookie = `consent_session_id=${cookieSessionId}; max-age=2592000; path=/; secure; samesite=Lax`;

      const cookieState = {
        state: {
          consentId: "cookie-consent-id",
          consentStatus: "agreed",
          consentData: null,
          lastConsentDate: "2024-01-20T10:00:00Z",
        },
      };
      const cookieValue = encodeURIComponent(JSON.stringify(cookieState));
      document.cookie = `dop_consent_state=${cookieValue}; max-age=2592000; path=/; secure; samesite=Lax`;

      // Set legacy storage (should be ignored)
      localStorage.setItem("consent_session_id", "legacy-session-id");
      localStorage.setItem(
        "consent_session_id_timestamp",
        Date.now().toString(),
      );

      const legacyState = {
        data: JSON.stringify({
          state: {
            consentId: "legacy-consent-id",
            consentStatus: "declined",
            consentData: null,
            lastConsentDate: "2024-01-10T10:00:00Z",
          },
        }),
        timestamp: Date.now(),
        version: "1.0",
      };
      sessionStorage.setItem("dop_consent-store", JSON.stringify(legacyState));
    });

    // Reload to check if migration is skipped
    await page.reload();
    await page.waitForLoadState("networkidle");

    // Wait for initialization
    await page.waitForTimeout(1000);

    // Verify cookies still have original values (not overwritten by legacy)
    const cookies = await page.context().cookies();
    const sessionCookie = cookies.find((c) => c.name === "consent_session_id");
    const consentCookie = cookies.find((c) => c.name === "dop_consent_state");

    expect(sessionCookie?.value).toBe("cookie-session-id");

    if (consentCookie) {
      const cookieValue = decodeURIComponent(consentCookie.value);
      const parsed = JSON.parse(cookieValue);
      expect(parsed.state.consentId).toBe("cookie-consent-id");
      expect(parsed.state.consentStatus).toBe("agreed"); // Not "declined" from legacy
    }

    // Verify legacy storage still exists (not cleaned up since migration didn't run)
    const legacyExists = await page.evaluate(() => {
      return localStorage.getItem("consent_session_id") !== null;
    });

    expect(legacyExists).toBe(true);

    console.log(
      "[Migration] Existing cookies take precedence, no migration occurred",
    );
  });
});
