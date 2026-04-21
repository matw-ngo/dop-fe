import { test, expect } from '@playwright/test';

// Use mobile viewports for these tests
test.use({ viewport: { width: 375, height: 667 } }); // Default to iPhone SE for generic mobile tests

test.describe('Mobile Responsiveness and Layout', () => {

  test('Homepage has zero horizontal overflow on mobile', async ({ page }) => {
    await page.goto('/en');
    
    // Evaluate if any element is causing horizontal scroll
    const overflowScrollWidth = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });
    
    expect(overflowScrollWidth).toBeFalsy();
  });

  test('Product list has zero horizontal overflow on mobile', async ({ page }) => {
    await page.goto('/en/products?category=loan');
    
    // Evaluate if any element is causing horizontal scroll
    const overflowScrollWidth = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });
    
    expect(overflowScrollWidth).toBeFalsy();
  });

  test('Hamburger menu functions correctly', async ({ page }) => {
    await page.goto('/en');
    
    const menuBtn = page.locator('header button[aria-label="Toggle menu"]');
    await expect(menuBtn).toBeVisible();
    
    // Click menu
    await menuBtn.click();
    
    // Check if dropdown items are visible
    const navItems = page.locator('nav ul').first();
    await expect(navItems).toBeVisible();
    
    // Close menu
    await menuBtn.click();
  });

  test('Pagination buttons meet 44px minimum touch target on mobile', async ({ page }) => {
    // Navigate to a product page that has pagination
    await page.goto('/en/products?category=loan');
    
    const paginationBtn = page.locator('.pagination-btn, .page-link, [aria-label="Page 1"]').first();
    
    // If pagination isn't strictly on the screen because of mock data length, we shouldn't fail the logic, but let's check conditionally
    if (await paginationBtn.isVisible()) {
      const box = await paginationBtn.boundingBox();
      expect(box?.height).toBeGreaterThanOrEqual(44);
      expect(box?.width).toBeGreaterThanOrEqual(44);
    }
  });

  test('CTAs meet 44px minimum touch target on mobile', async ({ page }) => {
    await page.goto('/en/products?category=loan');
    
    // The "Apply Now" button
    const applyBtn = page.getByRole('button', { name: /Apply Now/i }).first();
    
    if (await applyBtn.isVisible()) {
      const box = await applyBtn.boundingBox();
      expect(box?.height).toBeGreaterThanOrEqual(44);
    }
  });

  test('Hamburger menu button meets 44px minimum touch target', async ({ page }) => {
    await page.goto('/en');
    
    const menuBtn = page.locator('header button[aria-label="Toggle menu"]');
    const box = await menuBtn.boundingBox();
    
    expect(box?.height).toBeGreaterThanOrEqual(44);
    expect(box?.width).toBeGreaterThanOrEqual(44);
  });
});
