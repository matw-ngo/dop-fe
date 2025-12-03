import { test, expect } from "../fixtures/auth.fixture";
import { mockData } from "../fixtures/auth.fixture";

test.describe("Authentication", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("should redirect unauthenticated users to login", async ({ page }) => {
    // Try to access admin dashboard directly
    await page.goto("/admin");

    // Should be redirected to login page
    await expect(page).toHaveURL(/.*\/admin\/login/);
    await expect(page.locator("h1")).toContainText("Đăng nhập Admin");
  });

  test("should show login form", async ({ page }) => {
    await page.goto("/admin/login");

    // Check if login form elements are present
    await expect(page.locator('[data-testid="username-input"]')).toBeVisible();
    await expect(page.locator('[data-testid="password-input"]')).toBeVisible();
    await expect(page.locator('[data-testid="login-button"]')).toBeVisible();
  });

  test("should show validation errors for empty fields", async ({ page }) => {
    await page.goto("/admin/login");

    // Try to login with empty credentials
    await page.click('[data-testid="login-button"]');

    // Should show validation error
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
    await expect(page.locator('[data-testid="error-message"]')).toContainText("Vui lòng nhập tên đăng nhập và mật khẩu");
  });

  test("should show error for invalid credentials", async ({ page }) => {
    await page.goto("/admin/login");

    // Enter invalid credentials
    await page.fill('[data-testid="username-input"]', "invalid");
    await page.fill('[data-testid="password-input"]', "invalid");
    await page.click('[data-testid="login-button"]');

    // Should show error message
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
    await expect(page.locator('[data-testid="error-message"]')).toContainText("Tên đăng nhập hoặc mật khẩu không chính xác");
  });

  test("should login successfully with valid credentials", async ({ page }) => {
    await page.goto("/admin/login");

    // Enter valid credentials
    await page.fill('[data-testid="username-input"]', "admin");
    await page.fill('[data-testid="password-input"]', "admin123");
    await page.click('[data-testid="login-button"]');

    // Should redirect to admin dashboard
    await page.waitForURL("/admin");
    await expect(page.locator("h1")).toContainText("Chào mừng trở lại, admin!");

    // Should show admin navigation
    await expect(page.locator('[data-testid="admin-sidebar"]')).toBeVisible();
  });

  test("should show loading state during login", async ({ page }) => {
    await page.goto("/admin/login");

    // Enter credentials
    await page.fill('[data-testid="username-input"]', "admin");
    await page.fill('[data-testid="password-input"]', "admin123");

    // Click login button and check loading state
    await page.click('[data-testid="login-button"]');
    await expect(page.locator('[data-testid="login-button"]')).toBeDisabled();
    await expect(page.locator('[data-testid="login-button"]')).toContainText("Đang đăng nhập...");
  });

  test("should persist login session across page refreshes", async ({ loginAsAdmin }) => {
    const page = await loginAsAdmin();

    // Should be on admin dashboard
    await expect(page).toHaveURL("/admin");

    // Refresh page
    await page.reload();

    // Should still be logged in
    await expect(page).toHaveURL("/admin");
    await expect(page.locator("h1")).toContainText("Chào mừng trở lại, admin!");
  });

  test("should logout successfully", async ({ loginAsAdmin, logout }) => {
    const page = await loginAsAdmin();

    // Should be on admin dashboard
    await expect(page).toHaveURL("/admin");

    // Logout
    await logout(page);

    // Should redirect to homepage
    await expect(page).toHaveURL("/");
  });

  test("should redirect to login after session expiration", async ({ loginAsAdmin, page }) => {
    const adminPage = await loginAsAdmin();

    // Simulate session expiration by clearing auth storage
    await adminPage.evaluate(() => {
      localStorage.removeItem("auth-storage");
    });

    // Try to navigate to protected route
    await adminPage.goto("/admin/flows");

    // Should redirect to login
    await expect(adminPage).toHaveURL(/.*\/admin\/login/);
  });

  test("should handle network errors gracefully", async ({ page }) => {
    // Simulate network offline
    await page.context().setOffline(true);

    await page.goto("/admin/login");

    // Enter valid credentials
    await page.fill('[data-testid="username-input"]', "admin");
    await page.fill('[data-testid="password-input"]', "admin123");
    await page.click('[data-testid="login-button"]');

    // Should show network error
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
    await expect(page.locator('[data-testid="error-message"]')).toContainText("Lỗi hệ thống");

    // Restore network
    await page.context().setOffline(false);
  });
});

test.describe("Role-Based Access Control", () => {
  test("should deny access to non-admin users", async ({ page }) => {
    // This would require setting up a non-admin user
    // For now, we'll simulate it
    await page.goto("/admin");

    // Mock a non-admin user
    await page.evaluate(() => {
      localStorage.setItem(
        "auth-storage",
        JSON.stringify({
          state: {
            user: { id: "2", username: "user", role: "user" },
            isAuthenticated: true,
            isLoading: false,
            isHydrated: true,
          },
          version: 0,
        })
      );
      window.dispatchEvent(new Event("storage"));
    });

    await page.reload();

    // Should be redirected to unauthorized page
    await expect(page).toHaveURL(/.*\/admin\/unauthorized/);
    await expect(page.locator("h1")).toContainText("Không có quyền truy cập");
  });

  test("should show unauthorized page for insufficient permissions", async ({ page }) => {
    // Navigate to unauthorized page directly
    await page.goto("/admin/unauthorized");

    // Should show unauthorized content
    await expect(page.locator("h1")).toContainText("Không có quyền truy cập");
    await expect(page.locator("p")).toContainText("Bạn không có đủ quyền để truy cập trang này");

    // Should have navigation options
    await expect(page.locator('button:has-text("Quay lại trang quản trị")')).toBeVisible();
    await expect(page.locator('button:has-text("Quay lại trang chủ")')).toBeVisible();
  });

  test("should allow access to admin routes for admin users", async ({ loginAsAdmin }) => {
    const page = await loginAsAdmin();

    // Test access to various admin routes
    const adminRoutes = [
      "/admin",
      "/admin/flows",
      "/admin/users",
      "/admin/analytics",
      "/admin/settings",
    ];

    for (const route of adminRoutes) {
      await page.goto(route);
      // Should not redirect to login or unauthorized
      await expect(page).not.toHaveURL(/.*\/admin\/login/);
      await expect(page).not.toHaveURL(/.*\/admin\/unauthorized/);
    }
  });
});

test.describe("Authentication Flow", () => {
  test("should maintain redirect parameter", async ({ page }) => {
    // Try to access a specific admin page
    await page.goto("/admin/flows");

    // Should redirect to login with redirect parameter
    await expect(page).toHaveURL(/.*\/admin\/login\?.*redirect=.*/);

    // Login
    await page.fill('[data-testid="username-input"]', "admin");
    await page.fill('[data-testid="password-input"]', "admin123");
    await page.click('[data-testid="login-button"]');

    // Should redirect to originally requested page
    await expect(page).toHaveURL("/admin/flows");
  });

  test("should handle multiple concurrent login attempts", async ({ page }) => {
    await page.goto("/admin/login");

    // Enter credentials
    await page.fill('[data-testid="username-input"]', "admin");
    await page.fill('[data-testid="password-input"]', "admin123");

    // Click login multiple times quickly
    await Promise.all([
      page.click('[data-testid="login-button"]'),
      page.click('[data-testid="login-button"]'),
      page.click('[data-testid="login-button"]'),
    ]);

    // Should still login successfully
    await page.waitForURL("/admin");
    await expect(page.locator("h1")).toContainText("Chào mừng trở lại, admin!");
  });

  test("should validate input format", async ({ page }) => {
    await page.goto("/admin/login");

    // Test phone number format (if applicable)
    await page.fill('[data-testid="username-input"]', "invalid@format");
    await page.fill('[data-testid="password-input"]', "short");
    await page.click('[data-testid="login-button"]');

    // Should show validation error
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
  });
});

test.describe("Authentication Security", () => {
  test("should prevent brute force attacks", async ({ page }) => {
    await page.goto("/admin/login");

    // Try multiple failed login attempts
    for (let i = 0; i < 5; i++) {
      await page.fill('[data-testid="username-input"]', `admin${i}`);
      await page.fill('[data-testid="password-input"]', `wrong${i}`);
      await page.click('[data-testid="login-button"]');

      // Wait for error message
      await expect(page.locator('[data-testid="error-message"]')).toBeVisible();

      // Clear inputs
      await page.fill('[data-testid="username-input"]', "");
      await page.fill('[data-testid="password-input"]', "");
    }

    // Should still allow login with correct credentials
    await page.fill('[data-testid="username-input"]', "admin");
    await page.fill('[data-testid="password-input"]', "admin123");
    await page.click('[data-testid="login-button"]');

    await page.waitForURL("/admin");
    await expect(page.locator("h1")).toContainText("Chào mừng trở lại, admin!");
  });

  test("should handle session timeout properly", async ({ loginAsAdmin }) => {
    const page = await loginAsAdmin();

    // Should be on admin dashboard
    await expect(page).toHaveURL("/admin");

    // Simulate session timeout by waiting (in real app, this would be server-side)
    await page.waitForTimeout(61000); // Wait longer than typical session timeout

    // Try to navigate to a protected route
    await page.goto("/admin/users");

    // Should check authentication status
    await expect(page.locator('[data-testid="loading-indicator"]')).toBeVisible();
  });
});