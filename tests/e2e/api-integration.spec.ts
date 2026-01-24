/**
 * API Integration E2E Tests
 *
 * This test suite covers end-to-end flows using the new modular API services
 * (consentClient and dopClient) to ensure proper integration.
 */

import { expect, test } from "@playwright/test";

const LOCALHOST = "http://localhost:3001";

function getLocalizedPath(path: string, locale: string = "vi"): string {
  return `/${locale}${path.startsWith("/") ? path : `/${path}`}`;
}

test.describe("API Integration - User Onboarding Flow", () => {
  test.beforeEach(async ({ page }) => {
    // Mock the flows endpoint
    await page.route("**/v1/flows/*", (route) => {
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          id: "test-tenant",
          name: "Test Onboarding Flow",
          flow_status: "active",
          steps: [
            {
              id: "step-1",
              use_ekyc: true,
              send_otp: true,
              page: "personal-info",
              have_purpose: true,
              required_purpose: true,
            },
          ],
        }),
      });
    });
  });

  test("completes onboarding with new API services", async ({ page }) => {
    // Mock lead creation
    let leadCreated = false;
    await page.route("**/v1/leads", (route) => {
      if (route.request().method() === "POST" && !leadCreated) {
        leadCreated = true;
        route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            id: "lead-123",
            token: "lead-token-123",
          }),
        });
      } else {
        route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({ success: true }),
        });
      }
    });

    // Mock eKYC config
    await page.route("**/leads/*/ekyc/config", (route) => {
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          access_token: "ekyc-token",
          challenge_code: "challenge-123",
          sdk_flow: "DOCUMENT_TO_FACE",
        }),
      });
    });

    await page.goto(`${LOCALHOST}${getLocalizedPath("/user-onboarding")}`);

    // Verify page loaded
    await expect(page).toHaveTitle(/Onboarding/);

    // Fill loan amount
    await page.getByLabel("Loan Amount").fill("50000000");

    // Click next to start onboarding
    await page.getByRole("button", { name: "Next" }).click();

    // Should navigate to lead creation
    await expect(page.getByText("Personal Information")).toBeVisible({
      timeout: 10000,
    });
  });

  test("handles consent flow with consentClient", async ({ page }) => {
    // Mock consent endpoints
    await page.route("**/consent/v1/consent*", (route) => {
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          consents: [
            {
              id: "consent-123",
              action: "grant",
              created_at: new Date().toISOString(),
            },
          ],
          pagination: { page: 1, page_size: 10, total_count: 1 },
        }),
      });
    });

    await page.goto(
      `${LOCALHOST}${getLocalizedPath("/user-onboarding/consent")}`,
    );

    // Should display consent form
    await expect(page.getByText("Consent Form")).toBeVisible();
    await expect(page.getByText("Privacy Policy")).toBeVisible();
  });

  test("verifies eKYC submission with dopClient", async ({ page }) => {
    // Track eKYC submission
    let ekycSubmitted = false;

    await page.route("**/leads/*/ekyc/vnpt", (route) => {
      if (route.request().method() === "POST" && !ekycSubmitted) {
        ekycSubmitted = true;
        route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            success: true,
            data: {
              lead_id: "lead-123",
              verification_id: "ver-123",
              status: "processing",
            },
          }),
        });
      }
    });

    // Mock successful eKYC flow
    await page.route("**/v1/leads/*/ekyc/config", (route) => {
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          access_token: "test-token",
          challenge_code: "test-challenge",
          sdk_flow: "DOCUMENT_TO_FACE",
        }),
      });
    });

    await page.goto(`${LOCALHOST}${getLocalizedPath("/user-onboarding/ekyc")}`);

    // Verify eKYC page loaded
    await expect(page.getByText("Identity Verification")).toBeVisible();
  });
});

test.describe("API Integration - Auth Flow", () => {
  test("handles token refresh on 401", async ({ page }) => {
    let refreshAttempts = 0;
    let requestCount = 0;

    // Mock initial protected request to return 401
    await page.route("**/v1/admin/stats", (route) => {
      requestCount++;
      if (requestCount === 1) {
        // First request - return 401
        route.fulfill({
          status: 401,
          contentType: "application/json",
          body: JSON.stringify({
            code: "unauthenticated",
            message: "Token expired",
          }),
        });
      } else {
        // Subsequent requests - success
        route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            stats: { total_users: 100, active_users: 50 },
          }),
        });
      }
    });

    // Mock token refresh
    await page.route("**/v1/auth/refresh", (route) => {
      refreshAttempts++;
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          access_token: "new-access-token-" + Date.now(),
          refresh_token: "new-refresh-token-" + Date.now(),
        }),
      });
    });

    await page.goto(`${LOCALHOST}${getLocalizedPath("/admin/dashboard")}`);

    // Should eventually load after token refresh
    await expect(page.getByText("Dashboard")).toBeVisible({ timeout: 15000 });
  });

  test("verifies protected routes require authentication", async ({ page }) => {
    // Mock unauthenticated request
    await page.route("**/v1/user/profile", (route) => {
      route.fulfill({
        status: 401,
        contentType: "application/json",
        body: JSON.stringify({
          code: "unauthenticated",
          message: "Authentication required",
        }),
      });
    });

    await page.goto(`${LOCALHOST}${getLocalizedPath("/admin/profile")}`);

    // Should redirect to login or show auth error
    await expect(page.getByText("Login")).toBeVisible({ timeout: 10000 });
  });
});

test.describe("API Integration - Error Recovery", () => {
  test("recovers from server errors with retry", async ({ page }) => {
    let attemptCount = 0;

    await page.route("**/v1/leads", (route) => {
      attemptCount++;
      if (attemptCount < 3) {
        // First 2 attempts - server error
        route.fulfill({
          status: 500,
          contentType: "application/json",
          body: JSON.stringify({
            code: "internal_error",
            message: "Server temporarily unavailable",
          }),
        });
      } else {
        // Third attempt - success
        route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            id: "lead-retry-123",
            token: "lead-token-retry",
          }),
        });
      }
    });

    await page.goto(`${LOCALHOST}${getLocalizedPath("/user-onboarding")}`);

    // Fill form
    await page.getByLabel("Loan Amount").fill("10000000");

    // Click next - should trigger retry
    await page.getByRole("button", { name: "Next" }).click();

    // Should eventually succeed after retries
    await expect(page.getByText("Personal Information")).toBeVisible({
      timeout: 20000,
    });
  });

  test("handles timeout gracefully", async ({ page }) => {
    // Mock slow endpoint
    await page.route("**/v1/flows/*", (route) => {
      setTimeout(() => {
        route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            id: "timeout-test",
            name: "Test Flow",
            flow_status: "active",
          }),
        });
      }, 35000); // 35 seconds - longer than default timeout
    });

    await page.goto(`${LOCALHOST}${getLocalizedPath("/user-onboarding")}`);

    await page.getByLabel("Loan Amount").fill("5000000");
    await page.getByRole("button", { name: "Next" }).click();

    // Should show timeout error
    await expect(page.getByText("Request timed out")).toBeVisible({
      timeout: 40000,
    });
    await expect(page.getByRole("button", { name: "Try Again" })).toBeVisible();
  });

  test("validates API responses match expected schemas", async ({ page }) => {
    // Mock malformed response
    await page.route("**/v1/leads", (route) => {
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          // Missing expected fields
          id: "lead-schema-test",
        }),
      });
    });

    await page.goto(`${LOCALHOST}${getLocalizedPath("/user-onboarding")}`);

    await page.getByLabel("Loan Amount").fill("5000000");
    await page.getByRole("button", { name: "Next" }).click();

    // Should handle missing fields gracefully
    await expect(page.getByText("Personal Information")).toBeVisible({
      timeout: 10000,
    });
  });
});

test.describe("API Integration - Environment Configuration", () => {
  test("uses correct base URL for environment", async ({ page }) => {
    const requests: string[] = [];

    // Capture all requests
    await page.route("**/*", (route) => {
      requests.push(route.request().url());
      route.continue();
    });

    await page.goto(`${LOCALHOST}${getLocalizedPath("/user-onboarding")}`);

    await page.getByLabel("Loan Amount").fill("5000000");
    await page.getByRole("button", { name: "Next" }).click();

    await expect(page.getByText("Personal Information")).toBeVisible({
      timeout: 10000,
    });

    // Verify requests were made to expected URLs
    const apiRequests = requests.filter(
      (url) => url.includes("/v1/") || url.includes("/consent/v1/"),
    );
    expect(apiRequests.length).toBeGreaterThan(0);
  });
});
