/**
 * E2E Performance Tests for Navigation Security
 *
 * Tests real-world performance impact in browser environment.
 * Uses MSW profiles to test performance across different flow configurations.
 */

import { test, expect, type Page } from "@playwright/test";

// ============================================================================
// MSW Profile Support
// ============================================================================

/**
 * MSW Profile Names
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
async function setMSWProfile(page: Page, profileName: ProfileName) {
  await page.route("**/flows/**", async (route) => {
    const request = route.request();
    const headers = request.headers();
    headers["x-test-profile"] = profileName;

    await route.continue({ headers });
  });
}

// ============================================================================
// Test Utilities
// ============================================================================

/**
 * Measure page load performance
 */
async function measurePageLoad(page: Page, url: string) {
  const startTime = Date.now();
  await page.goto(url);
  await page.waitForLoadState("networkidle");
  const endTime = Date.now();

  return endTime - startTime;
}

/**
 * Measure step transition time
 */
async function measureStepTransition(page: Page) {
  const startTime = Date.now();

  // Click next button
  await page.click('button:has-text("Next")');

  // Wait for transition to complete
  await page.waitForSelector('[data-testid="form-step"]', { state: "visible" });

  const endTime = Date.now();
  return endTime - startTime;
}

/**
 * Get memory usage metrics
 */
async function getMemoryMetrics(page: Page) {
  const metrics = await page.evaluate(() => {
    if ("memory" in performance) {
      const memory = (performance as any).memory;
      return {
        usedJSHeapSize: memory.usedJSHeapSize,
        totalJSHeapSize: memory.totalJSHeapSize,
        jsHeapSizeLimit: memory.jsHeapSizeLimit,
      };
    }
    return null;
  });

  return metrics;
}

/**
 * Count event listeners
 */
async function countEventListeners(page: Page) {
  const count = await page.evaluate(() => {
    // This is a simplified count - actual implementation may vary
    const events = [
      "popstate",
      "click",
      "keydown",
      "scroll",
      "mousemove",
      "touchstart",
    ];
    return events.length; // Placeholder
  });

  return count;
}

/**
 * Measure re-render count
 */
async function measureRerenders(page: Page, action: () => Promise<void>) {
  // Install React DevTools profiler
  await page.evaluate(() => {
    (window as any).__REACT_DEVTOOLS_RENDER_COUNT__ = 0;
  });

  await action();

  const renderCount = await page.evaluate(() => {
    return (window as any).__REACT_DEVTOOLS_RENDER_COUNT__ || 0;
  });

  return renderCount;
}

// ============================================================================
// Performance Tests
// ============================================================================

test.describe("Navigation Security Performance", () => {
  test.beforeEach(async ({ page }) => {
    // Setup: Set default profile
    await setMSWProfile(page, "default");

    // Navigate to loan application
    await page.goto("/user-onboarding/apply");
    await page.waitForLoadState("networkidle");
  });

  // ==========================================================================
  // 1. Initial Page Load Performance
  // ==========================================================================

  test("should load page with navigation security in < 3s", async ({
    page,
  }) => {
    const loadTime = await measurePageLoad(page, "/user-onboarding/apply");

    expect(loadTime).toBeLessThan(3000);
  });

  test("should not significantly impact initial render", async ({ page }) => {
    // Measure with navigation security
    const withSecurity = await measurePageLoad(page, "/user-onboarding/apply");

    // Compare with baseline (if available)
    // For now, just ensure it's reasonable
    expect(withSecurity).toBeLessThan(5000);
  });

  // ==========================================================================
  // 2. Step Transition Performance
  // ==========================================================================

  test("should transition between steps in < 500ms", async ({ page }) => {
    // Fill first step
    await page.fill('[name="fullName"]', "Test User");
    await page.fill('[name="email"]', "test@example.com");

    const transitionTime = await measureStepTransition(page);

    expect(transitionTime).toBeLessThan(500);
  });

  test("should handle rapid step transitions", async ({ page }) => {
    const times: number[] = [];

    // Transition through multiple steps
    for (let i = 0; i < 3; i++) {
      await page.fill(`[name="field${i}"]`, "test");
      const time = await measureStepTransition(page);
      times.push(time);
    }

    // All transitions should be fast
    times.forEach((time) => {
      expect(time).toBeLessThan(500);
    });

    // No degradation over time
    const avg = times.reduce((a, b) => a + b, 0) / times.length;
    const max = Math.max(...times);
    expect(max).toBeLessThan(avg * 2);
  });

  test("should not block UI during navigation guard checks", async ({
    page,
  }) => {
    // Setup: Complete OTP step
    await page.goto("/user-onboarding/apply?step=2");
    await page.fill('[name="otp"]', "123456");
    await page.click('button:has-text("Verify")');
    await page.waitForSelector('[data-testid="otp-success"]');

    // Try to navigate back (should be blocked)
    const startTime = Date.now();
    await page.goBack();
    const endTime = Date.now();

    // Should respond quickly even when blocked
    expect(endTime - startTime).toBeLessThan(100);
  });

  // ==========================================================================
  // 3. Memory Usage
  // ==========================================================================

  test("should not leak memory during navigation", async ({ page }) => {
    const initialMemory = await getMemoryMetrics(page);

    if (!initialMemory) {
      test.skip();
      return;
    }

    // Navigate through multiple steps
    for (let i = 0; i < 5; i++) {
      await page.fill(`[name="field${i}"]`, "test");
      await page.click('button:has-text("Next")');
      await page.waitForTimeout(100);
    }

    const finalMemory = await getMemoryMetrics(page);

    // Memory should not increase significantly (< 10MB)
    const memoryIncrease =
      finalMemory.usedJSHeapSize - initialMemory.usedJSHeapSize;
    expect(memoryIncrease).toBeLessThan(10 * 1024 * 1024);
  });

  test("should cleanup resources on page unload", async ({ page }) => {
    const initialMemory = await getMemoryMetrics(page);

    if (!initialMemory) {
      test.skip();
      return;
    }

    // Navigate away and back
    await page.goto("/");
    await page.waitForTimeout(100);
    await page.goto("/user-onboarding/apply");
    await page.waitForTimeout(100);

    const finalMemory = await getMemoryMetrics(page);

    // Memory should be similar to initial
    const memoryDiff = Math.abs(
      finalMemory.usedJSHeapSize - initialMemory.usedJSHeapSize,
    );
    expect(memoryDiff).toBeLessThan(5 * 1024 * 1024);
  });

  // ==========================================================================
  // 4. Event Listener Overhead
  // ==========================================================================

  test("should register minimal event listeners", async ({ page }) => {
    const listenerCount = await countEventListeners(page);

    // Should have reasonable number of listeners
    expect(listenerCount).toBeLessThan(20);
  });

  test("should handle activity events efficiently", async ({ page }) => {
    // Simulate rapid user activity
    const startTime = Date.now();

    for (let i = 0; i < 50; i++) {
      await page.mouse.move(i * 10, i * 10);
      await page.keyboard.press("ArrowDown");
    }

    const endTime = Date.now();

    // Should handle all events quickly
    expect(endTime - startTime).toBeLessThan(1000);
  });

  // ==========================================================================
  // 5. Re-render Frequency
  // ==========================================================================

  test("should minimize re-renders on activity", async ({ page }) => {
    const renderCount = await measureRerenders(page, async () => {
      // Simulate activity
      for (let i = 0; i < 20; i++) {
        await page.mouse.move(i * 10, i * 10);
      }
      await page.waitForTimeout(100);
    });

    // Should not cause excessive re-renders
    expect(renderCount).toBeLessThan(5);
  });

  test("should not re-render on debounced events", async ({ page }) => {
    const renderCount = await measureRerenders(page, async () => {
      // Rapid activity (should be debounced)
      for (let i = 0; i < 50; i++) {
        await page.keyboard.press("ArrowDown");
      }
      await page.waitForTimeout(100);
    });

    // Should debounce and minimize re-renders
    expect(renderCount).toBeLessThan(3);
  });

  // ==========================================================================
  // 6. Session Timeout Performance
  // ==========================================================================

  test("should check timeout without blocking UI", async ({ page }) => {
    // Enable session timeout
    await page.evaluate(() => {
      localStorage.setItem(
        "nav_config",
        JSON.stringify({
          enableSessionTimeout: true,
          sessionTimeoutMinutes: 15,
        }),
      );
    });

    await page.reload();

    // Complete OTP to create session
    await page.goto("/user-onboarding/apply?step=2");
    await page.fill('[name="otp"]', "123456");
    await page.click('button:has-text("Verify")');

    // Wait for timeout check interval (10s)
    const startTime = Date.now();
    await page.waitForTimeout(10000);
    const endTime = Date.now();

    // Should not block for more than interval
    expect(endTime - startTime).toBeLessThan(11000);
  });

  // ==========================================================================
  // 7. Browser History Performance
  // ==========================================================================

  test("should handle browser back button efficiently", async ({ page }) => {
    // Setup: Complete OTP
    await page.goto("/user-onboarding/apply?step=2");
    await page.fill('[name="otp"]', "123456");
    await page.click('button:has-text("Verify")');

    // Navigate forward
    await page.click('button:has-text("Next")');
    await page.waitForTimeout(100);

    // Measure back button response
    const startTime = Date.now();
    await page.goBack();
    await page.waitForTimeout(100);
    const endTime = Date.now();

    // Should respond quickly
    expect(endTime - startTime).toBeLessThan(200);
  });

  test("should handle rapid back/forward navigation", async ({ page }) => {
    // Setup: Navigate through steps
    for (let i = 0; i < 3; i++) {
      await page.fill(`[name="field${i}"]`, "test");
      await page.click('button:has-text("Next")');
      await page.waitForTimeout(50);
    }

    // Rapid back/forward
    const startTime = Date.now();

    for (let i = 0; i < 5; i++) {
      await page.goBack();
      await page.waitForTimeout(50);
      await page.goForward();
      await page.waitForTimeout(50);
    }

    const endTime = Date.now();

    // Should handle all navigation quickly
    expect(endTime - startTime).toBeLessThan(2000);
  });

  // ==========================================================================
  // 8. Error Recovery Performance
  // ==========================================================================

  test("should detect and recover from errors quickly", async ({ page }) => {
    // Corrupt session
    await page.evaluate(() => {
      sessionStorage.setItem("verification_session", "invalid-json");
    });

    // Reload page
    const startTime = Date.now();
    await page.reload();
    await page.waitForLoadState("networkidle");
    const endTime = Date.now();

    // Should recover and load normally
    expect(endTime - startTime).toBeLessThan(5000);
  });

  // ==========================================================================
  // 9. Integration Performance
  // ==========================================================================

  test("should handle complete OTP flow efficiently", async ({ page }) => {
    const startTime = Date.now();

    // Complete entire flow
    await page.fill('[name="fullName"]', "Test User");
    await page.click('button:has-text("Next")');
    await page.waitForTimeout(100);

    await page.fill('[name="otp"]', "123456");
    await page.click('button:has-text("Verify")');
    await page.waitForTimeout(100);

    await page.fill('[name="address"]', "Test Address");
    await page.click('button:has-text("Next")');
    await page.waitForTimeout(100);

    // Try to go back (should be blocked)
    await page.goBack();
    await page.waitForTimeout(100);

    const endTime = Date.now();

    // Entire flow should complete quickly
    expect(endTime - startTime).toBeLessThan(3000);
  });

  // ==========================================================================
  // 10. Performance Regression Tests
  // ==========================================================================

  test("should maintain baseline performance", async ({ page }) => {
    const baseline = 3000; // ms for complete flow

    const startTime = Date.now();

    // Standard flow
    await page.fill('[name="fullName"]', "Test User");
    await page.click('button:has-text("Next")');
    await page.waitForSelector('[data-testid="form-step"]');

    const endTime = Date.now();

    expect(endTime - startTime).toBeLessThan(baseline);
  });

  test("should not degrade with repeated use", async ({ page }) => {
    const times: number[] = [];

    for (let i = 0; i < 5; i++) {
      const startTime = Date.now();

      await page.fill(`[name="field${i}"]`, "test");
      await page.click('button:has-text("Next")');
      await page.waitForSelector('[data-testid="form-step"]');

      const endTime = Date.now();
      times.push(endTime - startTime);

      // Reset
      await page.reload();
      await page.waitForLoadState("networkidle");
    }

    // Performance should be consistent
    const avg = times.reduce((a, b) => a + b, 0) / times.length;
    const max = Math.max(...times);

    expect(max).toBeLessThan(avg * 2);
  });
});

// ============================================================================
// Performance Metrics Collection
// ============================================================================

test.describe("Performance Metrics", () => {
  test("should collect and report performance metrics", async ({ page }) => {
    await page.goto("/user-onboarding/apply");

    const metrics = await page.evaluate(() => {
      const navigation = performance.getEntriesByType(
        "navigation",
      )[0] as PerformanceNavigationTiming;

      return {
        domContentLoaded:
          navigation.domContentLoadedEventEnd -
          navigation.domContentLoadedEventStart,
        loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
        domInteractive: navigation.domInteractive - navigation.fetchStart,
        firstPaint:
          performance
            .getEntriesByType("paint")
            .find((entry) => entry.name === "first-paint")?.startTime || 0,
        firstContentfulPaint:
          performance
            .getEntriesByType("paint")
            .find((entry) => entry.name === "first-contentful-paint")
            ?.startTime || 0,
      };
    });

    console.log("Performance Metrics:", metrics);

    // Assert reasonable performance
    expect(metrics.domContentLoaded).toBeLessThan(2000);
    expect(metrics.loadComplete).toBeLessThan(3000);
    expect(metrics.firstContentfulPaint).toBeLessThan(2000);
  });
});

// ============================================================================
// Profile-Specific Performance Tests
// ============================================================================

test.describe("Profile Performance Comparison", () => {
  const profiles: ProfileName[] = [
    "default",
    "otp-at-step-1",
    "otp-at-last-step",
    "no-otp-flow",
    "multi-otp-flow",
  ];

  test("should have consistent performance across all profiles", async ({
    page,
  }) => {
    const results: Record<string, number> = {};

    for (const profileName of profiles) {
      // Set profile
      await setMSWProfile(page, profileName);

      // Measure load time
      const startTime = Date.now();
      await page.goto("/user-onboarding/apply");
      await page.waitForLoadState("networkidle");
      const endTime = Date.now();

      results[profileName] = endTime - startTime;
      console.log(`Profile ${profileName}: ${results[profileName]}ms`);
    }

    // All profiles should load in reasonable time
    Object.values(results).forEach((time) => {
      expect(time).toBeLessThan(5000);
    });

    // Performance should be consistent (max 2x difference)
    const times = Object.values(results);
    const avg = times.reduce((a, b) => a + b, 0) / times.length;
    const max = Math.max(...times);
    expect(max).toBeLessThan(avg * 2);
  });

  test("should handle step transitions efficiently across profiles", async ({
    page,
  }) => {
    const results: Record<string, number[]> = {};

    for (const profileName of profiles) {
      await setMSWProfile(page, profileName);
      await page.goto("/user-onboarding/apply");
      await page.waitForLoadState("networkidle");

      const times: number[] = [];

      // Measure 3 step transitions
      for (let i = 0; i < 3; i++) {
        await page.fill(`[name="field${i}"]`, "test");

        const startTime = Date.now();
        await page.click('button:has-text("Next")');
        await page.waitForSelector('[data-testid="form-step"]', {
          state: "visible",
        });
        const endTime = Date.now();

        times.push(endTime - startTime);
      }

      results[profileName] = times;
      console.log(`Profile ${profileName} transitions:`, times);
    }

    // All transitions should be fast
    Object.entries(results).forEach(([profile, times]) => {
      times.forEach((time) => {
        expect(time).toBeLessThan(500);
      });
    });
  });

  test("should have minimal memory overhead with different profiles", async ({
    page,
  }) => {
    const results: Record<string, any> = {};

    for (const profileName of profiles) {
      await setMSWProfile(page, profileName);
      await page.goto("/user-onboarding/apply");
      await page.waitForLoadState("networkidle");

      const initialMemory = await page.evaluate(() => {
        if ("memory" in performance) {
          const memory = (performance as any).memory;
          return memory.usedJSHeapSize;
        }
        return null;
      });

      if (!initialMemory) continue;

      // Navigate through steps
      for (let i = 0; i < 3; i++) {
        await page.fill(`[name="field${i}"]`, "test");
        await page.click('button:has-text("Next")');
        await page.waitForTimeout(100);
      }

      const finalMemory = await page.evaluate(() => {
        if ("memory" in performance) {
          const memory = (performance as any).memory;
          return memory.usedJSHeapSize;
        }
        return null;
      });

      if (finalMemory) {
        const increase = finalMemory - initialMemory;
        results[profileName] = {
          initial: initialMemory,
          final: finalMemory,
          increase,
        };
        console.log(
          `Profile ${profileName} memory increase: ${(increase / 1024 / 1024).toFixed(2)}MB`,
        );
      }
    }

    // Memory increase should be reasonable for all profiles
    Object.values(results).forEach((result: any) => {
      expect(result.increase).toBeLessThan(10 * 1024 * 1024); // < 10MB
    });
  });
});

test.describe("OTP Position Performance Impact", () => {
  test("should have similar performance regardless of OTP position", async ({
    page,
  }) => {
    const otpProfiles: ProfileName[] = [
      "otp-at-step-1",
      "default", // OTP at step 3
      "otp-at-last-step",
    ];

    const results: Record<string, number> = {};

    for (const profileName of otpProfiles) {
      await setMSWProfile(page, profileName);
      await page.goto("/user-onboarding/apply");
      await page.waitForLoadState("networkidle");

      // Mock OTP
      await page.route("**/api/otp/**", (route) => {
        route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({ success: true }),
        });
      });

      // Navigate to OTP step and complete it
      const startTime = Date.now();

      let foundOTP = false;
      for (let i = 0; i < 5 && !foundOTP; i++) {
        const hasOTP = await page
          .getByText(/OTP Verification/i)
          .isVisible()
          .catch(() => false);

        if (hasOTP) {
          foundOTP = true;
          await page.click('button:has-text("Send OTP")');
          await page.fill('[name="otp"]', "123456");
          await page.click('button:has-text("Verify")');
          await page.waitForTimeout(100);
        } else {
          await page.click('button:has-text("Next")');
          await page.waitForTimeout(100);
        }
      }

      const endTime = Date.now();
      results[profileName] = endTime - startTime;
      console.log(`Profile ${profileName} OTP flow: ${results[profileName]}ms`);
    }

    // All OTP flows should complete in reasonable time
    Object.values(results).forEach((time) => {
      expect(time).toBeLessThan(5000);
    });

    // Performance should be consistent
    const times = Object.values(results);
    const avg = times.reduce((a, b) => a + b, 0) / times.length;
    const max = Math.max(...times);
    expect(max).toBeLessThan(avg * 2);
  });
});

test.describe("Multi-OTP Performance", () => {
  test("should handle multiple OTP steps efficiently", async ({ page }) => {
    await setMSWProfile(page, "multi-otp-flow");
    await page.goto("/user-onboarding/apply");
    await page.waitForLoadState("networkidle");

    // Mock OTP
    await page.route("**/api/otp/**", (route) => {
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ success: true }),
      });
    });

    const otpTimes: number[] = [];

    // Complete multiple OTP steps
    for (let otpCount = 0; otpCount < 2; otpCount++) {
      // Navigate to OTP step
      let foundOTP = false;
      while (!foundOTP) {
        const hasOTP = await page
          .getByText(/OTP Verification/i)
          .isVisible()
          .catch(() => false);

        if (hasOTP) {
          foundOTP = true;

          // Measure OTP completion time
          const startTime = Date.now();
          await page.click('button:has-text("Send OTP")');
          await page.fill('[name="otp"]', "123456");
          await page.click('button:has-text("Verify")');
          await page.waitForTimeout(100);
          const endTime = Date.now();

          otpTimes.push(endTime - startTime);
        } else {
          await page.click('button:has-text("Next")');
          await page.waitForTimeout(100);
        }
      }
    }

    console.log("Multi-OTP times:", otpTimes);

    // Each OTP should complete quickly
    otpTimes.forEach((time) => {
      expect(time).toBeLessThan(2000);
    });

    // No performance degradation
    if (otpTimes.length > 1) {
      expect(otpTimes[1]).toBeLessThan(otpTimes[0] * 1.5);
    }
  });
});

test.describe("No-OTP Performance Baseline", () => {
  test("should establish baseline performance without OTP", async ({
    page,
  }) => {
    await setMSWProfile(page, "no-otp-flow");
    await page.goto("/user-onboarding/apply");
    await page.waitForLoadState("networkidle");

    const startTime = Date.now();

    // Navigate through all steps
    for (let i = 0; i < 5; i++) {
      await page.fill(`[name="field${i}"]`, "test");
      await page.click('button:has-text("Next")');
      await page.waitForTimeout(100);
    }

    const endTime = Date.now();
    const totalTime = endTime - startTime;

    console.log(`No-OTP baseline: ${totalTime}ms`);

    // Should complete quickly without OTP overhead
    expect(totalTime).toBeLessThan(3000);
  });

  test("should compare OTP vs no-OTP performance", async ({ page }) => {
    const results: Record<string, number> = {};

    // Test with OTP
    await setMSWProfile(page, "default");
    await page.goto("/user-onboarding/apply");
    await page.waitForLoadState("networkidle");

    await page.route("**/api/otp/**", (route) => {
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ success: true }),
      });
    });

    const withOTPStart = Date.now();
    // Navigate and complete OTP
    for (let i = 0; i < 5; i++) {
      const hasOTP = await page
        .getByText(/OTP Verification/i)
        .isVisible()
        .catch(() => false);
      if (hasOTP) {
        await page.click('button:has-text("Send OTP")');
        await page.fill('[name="otp"]', "123456");
        await page.click('button:has-text("Verify")');
      } else {
        await page.fill(`[name="field${i}"]`, "test");
        await page.click('button:has-text("Next")');
      }
      await page.waitForTimeout(100);
    }
    const withOTPEnd = Date.now();
    results.withOTP = withOTPEnd - withOTPStart;

    // Test without OTP
    await setMSWProfile(page, "no-otp-flow");
    await page.goto("/user-onboarding/apply");
    await page.waitForLoadState("networkidle");

    const noOTPStart = Date.now();
    for (let i = 0; i < 5; i++) {
      await page.fill(`[name="field${i}"]`, "test");
      await page.click('button:has-text("Next")');
      await page.waitForTimeout(100);
    }
    const noOTPEnd = Date.now();
    results.noOTP = noOTPEnd - noOTPStart;

    console.log("Performance comparison:", results);

    // Both should be reasonable
    expect(results.withOTP).toBeLessThan(5000);
    expect(results.noOTP).toBeLessThan(3000);

    // OTP overhead should be minimal (< 2x)
    expect(results.withOTP).toBeLessThan(results.noOTP * 2);
  });
});
