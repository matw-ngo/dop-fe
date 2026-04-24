import { test, expect } from "@playwright/test";

/**
 * VIDEO – Loan Application Happy Path
 *
 * File-level `test.use({ video: "on" })` ghi lại toàn bộ quá trình chạy test.
 * Video được lưu tại: test-results/<test-name>/video.webm
 *
 * Viewport: iPhone 14 (390 × 844) — tiêu chuẩn thiết bị phổ biến nhất
 * Locale: vi (Vietnamese)
 *
 * Flow:
 *   1. Homepage /vi
 *   2. Chuyển sang trang danh sách sản phẩm vay
 *   3. Bấm đăng ký sản phẩm → mở form
 *   4. Điền tất cả các trường hiển thị
 *   5. Nhấn Tiếp tục
 *   6. Kiểm tra không có lỗi UI / raw i18n key
 */

// ✅ Top-level use() — hợp lệ với Playwright
test.use({
  viewport: { width: 390, height: 844 },
  video: "on",
  screenshot: "on",
});

test("VIDEO: Toàn bộ flow đăng ký vay – vi locale (iPhone 14)", async ({
  page,
}) => {
  // ── Bước 1: Trang chủ ────────────────────────────────────────────────────
  await page.goto("/vi", { waitUntil: "networkidle" });
  await page.screenshot({ path: "test-results/video-01-homepage.png" });

  // Kiểm tra không tràn ngang
  const homepageOverflow = await page.evaluate(
    () =>
      document.documentElement.scrollWidth >
      document.documentElement.clientWidth,
  );
  expect(homepageOverflow).toBeFalsy();

  // ── Bước 2: Danh sách sản phẩm vay ───────────────────────────────────────
  await page.goto("/vi/products?category=loan", { waitUntil: "networkidle" });
  await page.screenshot({
    path: "test-results/video-02-product-list.png",
  });

  const productOverflow = await page.evaluate(
    () =>
      document.documentElement.scrollWidth >
      document.documentElement.clientWidth,
  );
  expect(productOverflow).toBeFalsy();

  // Kiểm tra srcset (Retina images)
  const hasSrcset = await page.evaluate(() =>
    Array.from(document.querySelectorAll("img")).some(
      (img) => img.srcset !== "",
    ),
  );
  expect(hasSrcset).toBeTruthy();

  // ── Bước 3: Mở form đăng ký ───────────────────────────────────────────────
  const applyBtn = page
    .getByRole("button", { name: /đăng ký|vay ngay|apply/i })
    .first();

  if (await applyBtn.isVisible()) {
    await applyBtn.click();
  } else {
    // Fallback: vào trang chi tiết sản phẩm
    const productCard = page.locator("a[href*='/products/']").first();
    if (await productCard.isVisible()) {
      await productCard.click();
      await page.waitForLoadState("networkidle");
      await page
        .getByRole("button", { name: /đăng ký|vay ngay/i })
        .first()
        .click()
        .catch(() => {});
    }
  }

  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(800);
  await page.screenshot({ path: "test-results/video-03-form-opened.png" });

  // ── Bước 4: Kiểm tra không có raw i18n key ────────────────────────────────
  const rawKeyPattern = /forms\.[a-z_-]+\.[a-z_]+\.label/i;
  const allLabels = await page
    .locator("label, [class*='label']")
    .allTextContents();
  const badLabels = allLabels.filter((l) => rawKeyPattern.test(l));
  expect(
    badLabels,
    `⚠️ Raw i18n keys tìm thấy trong labels: ${badLabels.join(", ")}`,
  ).toHaveLength(0);

  // ── Bước 5: Điền các trường ───────────────────────────────────────────────

  // Số điện thoại
  const phoneInput = page
    .locator('input[name="phone_number"], input[type="tel"]')
    .first();
  if (await phoneInput.isVisible()) {
    await phoneInput.click();
    await phoneInput.fill("0901234567");
    await page.screenshot({ path: "test-results/video-04-phone.png" });
  }

  // Họ và tên
  const nameInput = page
    .locator(
      'input[name="fullName"], input[placeholder*="tên" i], input[placeholder*="họ" i]',
    )
    .first();
  if (await nameInput.isVisible()) {
    await nameInput.click();
    await nameInput.fill("Nguyễn Văn Test");
  }

  // CCCD
  const idInput = page.locator('input[name="nationalId"]').first();
  if (await idInput.isVisible()) {
    await idInput.click();
    await idInput.fill("123456789012");
  }

  // Email
  const emailInput = page
    .locator('input[name="email"], input[type="email"]')
    .first();
  if (await emailInput.isVisible()) {
    await emailInput.click();
    await emailInput.fill("test@example.com");
  }

  // Các combobox / select — chọn option đầu tiên
  const comboboxes = page.locator('[role="combobox"]');
  const comboCount = await comboboxes.count();
  for (let i = 0; i < Math.min(comboCount, 6); i++) {
    const cb = comboboxes.nth(i);
    if (!(await cb.isVisible())) continue;
    await cb.click();
    await page.waitForTimeout(300);
    const firstOption = page.locator('[role="option"]').first();
    if (await firstOption.isVisible({ timeout: 2000 })) {
      await firstOption.click();
      await page.waitForTimeout(200);
    } else {
      await page.keyboard.press("Escape");
    }
  }

  await page.screenshot({ path: "test-results/video-05-form-filled.png" });

  // ── Bước 6: Kiểm tra nút Tiếp tục đạt 44px ───────────────────────────────
  const continueBtn = page
    .getByRole("button", { name: /tiếp tục|hoàn tất/i })
    .first();
  if (await continueBtn.isVisible()) {
    const box = await continueBtn.boundingBox();
    expect(box?.height).toBeGreaterThanOrEqual(44);

    // ── Bước 7: Nhấn Tiếp tục ────────────────────────────────────────────────
    await continueBtn.click();
    await page.waitForTimeout(2000);
    await page.screenshot({
      path: "test-results/video-06-after-continue.png",
    });
  }

  // ── Bước 8: Không có error boundary ───────────────────────────────────────
  await expect(
    page.locator("text=Something went wrong").first(),
  ).not.toBeVisible();

  // ── Bước 9: overscroll-behavior trên trang form ───────────────────────────
  const overscroll = await page.evaluate(
    () => window.getComputedStyle(document.body).overscrollBehaviorY,
  );
  expect(overscroll).toBe("none");

  await page.screenshot({ path: "test-results/video-07-final.png" });
});
