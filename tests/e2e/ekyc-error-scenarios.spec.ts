/**
 * eKYC Error Scenarios E2E Tests
 *
 * This test suite covers various error scenarios in the eKYC flow:
 * - Network failures during verification
 * - Invalid document scenarios
 * - Timeout handling
 * - Provider unavailability
 * - Browser/device errors
 * - Security error scenarios
 */

import { expect, test } from "@playwright/test";

test.describe("eKYC Error Scenarios", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/loan-application");
    await page.getByLabel("Loan Amount").fill("50000000");
    await page.getByRole("button", { name: "Next" }).click();
  });

  test("handles network timeout during verification", async ({ page }) => {
    // Mock network timeout
    await page.route("**/api/ekyc/verify", (route) => {
      // Don't respond to simulate timeout
      setTimeout(() => {
        route.fulfill({
          status: 408,
          contentType: "application/json",
          body: JSON.stringify({
            error: "Request timeout",
            code: "TIMEOUT_ERROR",
          }),
        });
      }, 31000); // 31 seconds
    });

    await page.getByRole("button", { name: "Verify Identity Now" }).click();

    // Should show timeout message after 30 seconds
    await expect(page.getByText("Request timed out")).toBeVisible({
      timeout: 35000,
    });
    await expect(
      page.getByText("Please check your connection and try again"),
    ).toBeVisible();

    // Should provide retry option
    await expect(page.getByRole("button", { name: "Try Again" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Cancel" })).toBeVisible();
  });

  test("handles network connection loss", async ({ page }) => {
    // Start verification normally
    await page.getByRole("button", { name: "Verify Identity Now" }).click();

    // Simulate connection loss after modal opens
    await page
      .locator('[data-testid="ekyc-modal"]')
      .waitFor({ state: "visible" });

    // Go offline
    await page.context().setOffline(true);

    // Try to upload document
    await page.getByLabel("Upload ID Document").click();

    // Should show offline error
    await expect(page.getByText("No internet connection")).toBeVisible();
    await expect(
      page.getByText("Please check your network connection"),
    ).toBeVisible();

    // Should disable upload functionality
    await expect(page.getByLabel("Upload ID Document")).toBeDisabled();

    // Go back online
    await page.context().setOffline(false);

    // Should re-enable functionality
    await expect(page.getByLabel("Upload ID Document")).toBeEnabled();
    await expect(page.getByText("Connection restored")).toBeVisible();
  });

  test("handles invalid document formats", async ({ page }) => {
    // Mock API to reject invalid formats
    await page.route("**/api/ekyc/upload", (route) => {
      const request = route.request();
      const contentType = request.headers()["content-type"];

      if (contentType && !contentType.includes("image/")) {
        route.fulfill({
          status: 400,
          contentType: "application/json",
          body: JSON.stringify({
            error: "Invalid file format",
            code: "INVALID_FORMAT",
            message: "Please upload a valid image file (JPG, PNG)",
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

    await page.getByRole("button", { name: "Verify Identity Now" }).click();

    // Try to upload non-image file
    await page
      .getByLabel("Upload ID Document")
      .setInputFiles("test-data/document.pdf");

    // Should show format error
    await expect(page.getByText("Invalid file format")).toBeVisible();
    await expect(
      page.getByText("Please upload a valid image file (JPG, PNG)"),
    ).toBeVisible();

    // Try to upload oversized file
    await page.route("**/api/ekyc/upload", (route) => {
      route.fulfill({
        status: 413,
        contentType: "application/json",
        body: JSON.stringify({
          error: "File too large",
          code: "FILE_TOO_LARGE",
          message: "Maximum file size is 10MB",
        }),
      });
    });

    // Create a large buffer to simulate large file
    const largeBuffer = Buffer.alloc(15 * 1024 * 1024); // 15MB
    await page.getByLabel("Upload ID Document").setInputFiles({
      name: "large-image.jpg",
      mimeType: "image/jpeg",
      buffer: largeBuffer,
    });

    // Should show size error
    await expect(page.getByText("File too large")).toBeVisible();
    await expect(page.getByText("Maximum file size is 10MB")).toBeVisible();
  });

  test("handles document quality issues", async ({ page }) => {
    // Mock API to return quality issues
    await page.route("**/api/ekyc/verify", (route) => {
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: false,
          error: "Document quality too low",
          code: "LOW_QUALITY",
          issues: [
            "Image is too blurry",
            "Document edges not visible",
            "Poor lighting conditions",
            "Glare detected on document",
          ],
          suggestions: [
            "Ensure good lighting",
            "Place document on flat surface",
            "Avoid camera shake",
            "Reduce glare",
          ],
        }),
      });
    });

    await page.getByRole("button", { name: "Verify Identity Now" }).click();
    await page
      .getByLabel("Upload ID Document")
      .setInputFiles("./test-data/blurry-id-card.jpg");

    // Should show quality issues
    await expect(page.getByText("Document quality too low")).toBeVisible();
    await expect(page.getByText("Image is too blurry")).toBeVisible();
    await expect(page.getByText("Poor lighting conditions")).toBeVisible();

    // Should show suggestions
    await expect(page.getByText("Ensure good lighting")).toBeVisible();
    await expect(
      page.getByText("Place document on flat surface"),
    ).toBeVisible();

    // Should provide option to retake photo
    await expect(
      page.getByRole("button", { name: "Retake Photo" }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Continue Anyway" }),
    ).toBeVisible();
  });

  test("handles provider service unavailability", async ({ page }) => {
    // Mock provider to be unavailable
    await page.route("**/api/ekyc/verify", (route) => {
      route.fulfill({
        status: 503,
        contentType: "application/json",
        body: JSON.stringify({
          error: "Service temporarily unavailable",
          code: "SERVICE_UNAVAILABLE",
          message: "eKYC service is under maintenance",
          estimatedRecovery: "2024-01-16T10:00:00Z",
        }),
      });
    });

    await page.getByRole("button", { name: "Verify Identity Now" }).click();

    // Should show service unavailable message
    await expect(
      page.getByText("Service temporarily unavailable"),
    ).toBeVisible();
    await expect(
      page.getByText("eKYC service is under maintenance"),
    ).toBeVisible();

    // Should show estimated recovery time
    await expect(page.getByText(/Expected recovery:/)).toBeVisible();

    // Should provide alternative options
    await expect(
      page.getByText("Alternative verification options:"),
    ).toBeVisible();
    await expect(page.getByText("Visit nearest branch")).toBeVisible();
    await expect(page.getByText("Schedule callback")).toBeVisible();
    await expect(
      page.getByText("Continue with manual verification"),
    ).toBeVisible();
  });

  test("handles camera permissions denied", async ({ page }) => {
    // Mock camera permission denied
    await page.context().grantPermissions([], { origin: page.url() });

    await page.getByRole("button", { name: "Verify Identity Now" }).click();

    // Try to use camera for live capture
    await page.getByRole("button", { name: "Use Camera" }).click();

    // Should show permission denied message
    await expect(page.getByText("Camera access denied")).toBeVisible();
    await expect(
      page.getByText("Please allow camera access to continue"),
    ).toBeVisible();

    // Should provide instructions to enable permissions
    await expect(page.getByText("To enable camera access:")).toBeVisible();
    await expect(
      page.getByText("1. Click the camera icon in your browser"),
    ).toBeVisible();
    await expect(
      page.getByText('2. Select "Allow" when prompted'),
    ).toBeVisible();

    // Should provide alternative upload option
    await expect(
      page.getByRole("button", { name: "Upload File Instead" }),
    ).toBeVisible();
  });

  test("handles browser compatibility issues", async ({ page }) => {
    // Mock browser compatibility check failure
    await page.addInitScript(() => {
      Object.defineProperty(navigator, "userAgent", {
        value: "Mozilla/5.0 (Windows NT 6.1; Trident/7.0; rv:11.0) like Gecko",
        writable: true,
      });
    });

    await page.route("**/api/browser-check", (route) => {
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          compatible: false,
          issues: [
            "Browser version is outdated",
            "WebRTC not supported",
            "Canvas API not available",
          ],
          recommendations: [
            "Update your browser to the latest version",
            "Try Chrome, Firefox, or Safari",
            "Enable JavaScript in browser settings",
          ],
        }),
      });
    });

    await page.getByRole("button", { name: "Verify Identity Now" }).click();

    // Should show compatibility warning
    await expect(
      page.getByText("Browser compatibility issues detected"),
    ).toBeVisible();
    await expect(page.getByText("Browser version is outdated")).toBeVisible();

    // Should show recommendations
    await expect(
      page.getByText("Update your browser to the latest version"),
    ).toBeVisible();
    await expect(
      page.getByText("Try Chrome, Firefox, or Safari"),
    ).toBeVisible();

    // Should provide option to proceed anyway
    await expect(
      page.getByRole("button", { name: "Proceed Anyway" }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Update Browser" }),
    ).toBeVisible();
  });

  test("handles session timeout during verification", async ({ page }) => {
    // Start verification
    await page.getByRole("button", { name: "Verify Identity Now" }).click();

    // Mock session expiry after 5 minutes
    await page.route("**/api/ekyc/status", (route) => {
      route.fulfill({
        status: 401,
        contentType: "application/json",
        body: JSON.stringify({
          error: "Session expired",
          code: "SESSION_EXPIRED",
          message: "Your verification session has expired due to inactivity",
        }),
      });
    });

    // Wait for session to expire (simulate 5 minutes)
    await page.waitForTimeout(100); // Shortened for test

    // Trigger status check
    await page.locator('[data-testid="check-status"]').click();

    // Should show session expired message
    await expect(page.getByText("Session expired")).toBeVisible();
    await expect(
      page.getByText("Your verification session has expired due to inactivity"),
    ).toBeVisible();

    // Should offer to restart
    await expect(
      page.getByRole("button", { name: "Start New Verification" }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Continue Current Session" }),
    ).toBeDisabled();
  });

  test("handles concurrent verification attempts", async ({ page }) => {
    // Start verification
    await page.getByRole("button", { name: "Verify Identity Now" }).click();

    // Try to start another verification while one is active
    await page.goto("/loan-application");
    await page.getByLabel("Loan Amount").fill("60000000");
    await page.getByRole("button", { name: "Next" }).click();

    // Should show warning about active verification
    await expect(
      page.getByText("Verification already in progress"),
    ).toBeVisible();
    await expect(
      page.getByText("You have an active verification session"),
    ).toBeVisible();

    // Should provide options
    await expect(
      page.getByRole("button", { name: "Continue Current Verification" }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Start New Verification" }),
    ).toBeVisible();

    // Try to start new anyway
    await page.getByRole("button", { name: "Start New Verification" }).click();

    // Should show confirmation dialog
    await expect(
      page.getByText("This will cancel your current verification"),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Yes, Cancel and Start New" }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "No, Continue Current" }),
    ).toBeVisible();
  });

  test("handles security error scenarios", async ({ page }) => {
    // Mock security check failure
    await page.route("**/api/ekyc/security-check", (route) => {
      route.fulfill({
        status: 403,
        contentType: "application/json",
        body: JSON.stringify({
          error: "Security check failed",
          code: "SECURITY_ERROR",
          reasons: [
            "Suspicious activity detected",
            "Multiple verification attempts from same IP",
            "Geolocation mismatch",
          ],
          actions: [
            "Please complete additional verification",
            "Contact support if issue persists",
          ],
        }),
      });
    });

    await page.getByRole("button", { name: "Verify Identity Now" }).click();

    // Should show security error
    await expect(page.getByText("Security check failed")).toBeVisible();
    await expect(page.getByText("Suspicious activity detected")).toBeVisible();

    // Should show required actions
    await expect(
      page.getByText("Please complete additional verification"),
    ).toBeVisible();

    // Might require CAPTCHA
    await expect(
      page.locator('[data-testid="captcha-container"]'),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Verify and Continue" }),
    ).toBeVisible();
  });

  test("handles storage quota exceeded", async ({ page }) => {
    // Mock storage quota error
    await page.addInitScript(() => {
      const originalSetItem = localStorage.setItem;
      localStorage.setItem = function (key, value) {
        if (key.startsWith("ekyc_")) {
          throw new DOMException("QuotaExceededError", "Quota exceeded");
        }
        return originalSetItem.call(this, key, value);
      };
    });

    await page.getByRole("button", { name: "Verify Identity Now" }).click();

    // Try to save verification data
    await page.locator('[data-testid="save-verification"]').click();

    // Should show storage error
    await expect(page.getByText("Storage quota exceeded")).toBeVisible();
    await expect(
      page.getByText("Unable to save verification data"),
    ).toBeVisible();

    // Should provide options
    await expect(page.getByText("Options:")).toBeVisible();
    await expect(page.getByText("Clear browser cache")).toBeVisible();
    await expect(page.getByText("Continue without saving")).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Clear Cache and Retry" }),
    ).toBeVisible();
  });

  test("handles unexpected server errors", async ({ page }) => {
    // Mock 500 server error
    await page.route("**/api/ekyc/verify", (route) => {
      route.fulfill({
        status: 500,
        contentType: "application/json",
        body: JSON.stringify({
          error: "Internal server error",
          code: "INTERNAL_ERROR",
          requestId: "req_123456789",
          timestamp: "2024-01-15T10:00:00Z",
        }),
      });
    });

    await page.getByRole("button", { name: "Verify Identity Now" }).click();

    // Should show friendly error message
    await expect(page.getByText("Something went wrong")).toBeVisible();
    await expect(
      page.getByText("We encountered an unexpected error"),
    ).toBeVisible();

    // Should show reference ID for support
    await expect(page.getByText(/Reference ID: req_/)).toBeVisible();

    // Should provide support options
    await expect(
      page.getByRole("button", { name: "Contact Support" }),
    ).toBeVisible();
    await expect(page.getByRole("button", { name: "Try Again" })).toBeVisible();

    // Test support contact
    await page.getByRole("button", { name: "Contact Support" }).click();
    await expect(page.getByText("Support Chat")).toBeVisible();
    await expect(page.getByText("Email: support@ekyc.com")).toBeVisible();
    await expect(page.getByText("Phone: 1900-1234")).toBeVisible();
  });
});
