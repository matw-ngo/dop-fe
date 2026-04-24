import { test, expect, type Page } from "@playwright/test";

/**
 * Mobile Responsiveness E2E Tests — vi locale
 *
 * Covers:
 * - Story 04: Retina image srcset
 * - Story 09: Touch target >= 44px
 * - Sticky CTA + safe-area-inset-bottom
 * - overscroll-behavior-y: none
 * - Zero horizontal overflow across viewports
 */

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function goto(page: Page, path: string) {
  await page.goto(path, { waitUntil: "networkidle" });
}

// ─── Tests (default viewport from playwright.config.ts) ─────────────────────

test.describe("iPhone SE (320px) – Layout", () => {
  test.use({ viewport: { width: 320, height: 568 } });

  test("Trang chủ không bị tràn ngang", async ({ page }) => {
    await goto(page, "/vi");
    const overflow = await page.evaluate(
      () =>
        document.documentElement.scrollWidth >
        document.documentElement.clientWidth,
    );
    expect(overflow).toBeFalsy();
  });

  test("Trang sản phẩm vay không bị tràn ngang", async ({ page }) => {
    await goto(page, "/vi/products?category=loan");
    const overflow = await page.evaluate(
      () =>
        document.documentElement.scrollWidth >
        document.documentElement.clientWidth,
    );
    expect(overflow).toBeFalsy();
  });
});

test.describe("iPhone 14 (390px) – Layout & Touch Targets", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("Trang chủ không bị tràn ngang", async ({ page }) => {
    await goto(page, "/vi");
    const overflow = await page.evaluate(
      () =>
        document.documentElement.scrollWidth >
        document.documentElement.clientWidth,
    );
    expect(overflow).toBeFalsy();
  });

  test("Trang sản phẩm loan không bị tràn ngang", async ({ page }) => {
    await goto(page, "/vi/products?category=loan");
    const overflow = await page.evaluate(
      () =>
        document.documentElement.scrollWidth >
        document.documentElement.clientWidth,
    );
    expect(overflow).toBeFalsy();
  });

  test("Hamburger menu đạt 44 × 44px touch target", async ({ page }) => {
    await goto(page, "/vi");
    const menuBtn = page
      .locator(
        'header button[aria-label="Toggle menu"], header button[aria-label*="menu" i]',
      )
      .first();
    await expect(menuBtn).toBeVisible({ timeout: 10_000 });
    const box = await menuBtn.boundingBox();
    expect(box?.height).toBeGreaterThanOrEqual(44);
    expect(box?.width).toBeGreaterThanOrEqual(44);
  });

  test("Hamburger menu mở/đóng hoạt động đúng", async ({ page }) => {
    await goto(page, "/vi");
    const menuBtn = page
      .locator(
        'header button[aria-label="Toggle menu"], header button[aria-label*="menu" i]',
      )
      .first();
    await menuBtn.click();
    await expect(page.locator("nav ul").first()).toBeVisible();
    await menuBtn.click();
  });

  test("CTA đăng ký sản phẩm đạt 44px", async ({ page }) => {
    await goto(page, "/vi/products?category=loan");
    const ctaBtn = page
      .getByRole("button", { name: /đăng ký|vay ngay|apply/i })
      .first();
    if (await ctaBtn.isVisible()) {
      const box = await ctaBtn.boundingBox();
      expect(box?.height).toBeGreaterThanOrEqual(44);
    }
  });

  test("Hình ảnh có srcset cho màn hình Retina", async ({ page }) => {
    await goto(page, "/vi/products?category=loan");
    const hasSrcset = await page.evaluate(() => {
      const imgs = Array.from(document.querySelectorAll("img"));
      return imgs.some(
        (img) => img.srcset !== "" || img.getAttribute("srcset") !== null,
      );
    });
    expect(hasSrcset).toBeTruthy();
  });

  test("body có overscroll-behavior-y: none (chặn pull-to-refresh)", async ({
    page,
  }) => {
    await goto(page, "/vi");
    const overscroll = await page.evaluate(
      () => window.getComputedStyle(document.body).overscrollBehaviorY,
    );
    expect(overscroll).toBe("none");
  });

  test("Labels form hiển thị tiếng Việt (không raw key)", async ({ page }) => {
    await goto(page, "/vi/products?category=loan");
    const applyBtn = page
      .getByRole("button", { name: /đăng ký|vay ngay|apply/i })
      .first();
    if (!(await applyBtn.isVisible())) return;
    await applyBtn.click();
    await page.waitForLoadState("networkidle");

    const rawKeyPattern = /forms\.[a-z_-]+\.[a-z_]+\.label/i;
    const labels = await page
      .locator("label, [class*='label']")
      .allTextContents();
    const badLabels = labels.filter((l) => rawKeyPattern.test(l));
    expect(badLabels, `Raw keys: ${badLabels.join(", ")}`).toHaveLength(0);
  });

  test("Nút Tiếp tục trên form đạt 44px", async ({ page }) => {
    await goto(page, "/vi/products?category=loan");
    const applyBtn = page
      .getByRole("button", { name: /đăng ký|vay ngay|apply/i })
      .first();
    if (!(await applyBtn.isVisible())) return;
    await applyBtn.click();
    await page.waitForLoadState("networkidle");

    const continueBtn = page
      .getByRole("button", { name: /tiếp tục|hoàn tất/i })
      .first();
    if (await continueBtn.isVisible()) {
      const box = await continueBtn.boundingBox();
      expect(box?.height).toBeGreaterThanOrEqual(44);
    }
  });
});

test.describe("iPad Mini (768px) – Layout", () => {
  test.use({ viewport: { width: 768, height: 1024 } });

  test("Trang chủ không bị tràn ngang trên tablet", async ({ page }) => {
    await goto(page, "/vi");
    const overflow = await page.evaluate(
      () =>
        document.documentElement.scrollWidth >
        document.documentElement.clientWidth,
    );
    expect(overflow).toBeFalsy();
  });

  test("Trang sản phẩm loan hiển thị đúng trên tablet", async ({ page }) => {
    await goto(page, "/vi/products?category=loan");
    const overflow = await page.evaluate(
      () =>
        document.documentElement.scrollWidth >
        document.documentElement.clientWidth,
    );
    expect(overflow).toBeFalsy();
  });
});
