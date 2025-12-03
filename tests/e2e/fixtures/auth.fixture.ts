import { test as base, expect, Page } from "@playwright/test";

// Define custom fixture types
interface AuthFixtures {
  authenticatedPage: Page;
  adminPage: Page;
  userPage: Page;
  loginAsAdmin: () => Promise<Page>;
  loginAsUser: () => Promise<Page>;
  logout: (page: Page) => Promise<void>;
}

// Extend base test with our custom fixtures
export const test = base.extend<AuthFixtures>({
  authenticatedPage: async ({ page }, use) => {
    // Log in as admin by default
    await page.goto("/admin/login");
    await page.fill('[data-testid="username-input"]', "admin");
    await page.fill('[data-testid="password-input"]', "admin123");
    await page.click('[data-testid="login-button"]');

    // Wait for navigation to admin dashboard
    await page.waitForURL("/admin");

    await use(page);
  },

  adminPage: async ({ page }, use) => {
    await page.goto("/admin/login");
    await page.fill('[data-testid="username-input"]', "admin");
    await page.fill('[data-testid="password-input"]', "admin123");
    await page.click('[data-testid="login-button"]');

    await page.waitForURL("/admin");

    await use(page);
  },

  userPage: async ({ page }, use) => {
    // First register a user or use existing test user
    await page.goto("/login");
    await page.fill('[data-testid="email-input"]', "test@example.com");
    await page.fill('[data-testid="password-input"]', "password123");
    await page.click('[data-testid="login-button"]');

    await page.waitForURL("/");

    await use(page);
  },

  loginAsAdmin: async ({ page }, use) => {
    const login = async () => {
      await page.goto("/admin/login");
      await page.fill('[data-testid="username-input"]', "admin");
      await page.fill('[data-testid="password-input"]', "admin123");
      await page.click('[data-testid="login-button"]');
      await page.waitForURL("/admin");
      return page;
    };

    await use(login);
  },

  loginAsUser: async ({ page }, use) => {
    const login = async () => {
      await page.goto("/login");
      await page.fill('[data-testid="email-input"]', "test@example.com");
      await page.fill('[data-testid="password-input"]', "password123");
      await page.click('[data-testid="login-button"]');
      await page.waitForURL("/");
      return page;
    };

    await use(login);
  },

  logout: async ({ page }, use) => {
    const logout = async (pageToLogout: Page) => {
      // Click logout button or menu item
      await pageToLogout.click('[data-testid="logout-button"]');
      await pageToLogout.waitForURL("/");
    };

    await use(logout);
  },
});

// Export expect for use in tests
export { expect };

// Helper functions for common test operations
export async function fillLoanApplicationForm(page: Page, data: any) {
  await page.fill('[data-testid="full-name-input"]', data.fullName);
  await page.fill('[data-testid="email-input"]', data.email);
  await page.fill('[data-testid="phone-input"]', data.phoneNumber);
  await page.fill('[data-testid="date-of-birth-input"]', data.dateOfBirth);
  await page.selectOption('[data-testid="gender-select"]', data.gender);
  await page.fill('[data-testid="national-id-input"]', data.nationalId);
  await page.fill('[data-testid="address-input"]', data.address);
  await page.fill('[data-testid="income-input"]', data.income.toString());
  await page.selectOption('[data-testid="income-type-select"]', data.incomeType);
  await page.selectOption('[data-testid="career-status-select"]', data.careerStatus);
  await page.selectOption('[data-testid="career-type-select"]', data.careerType);
}

export async function verifyOTP(page: Page, otpCode: string) {
  for (let i = 0; i < otpCode.length; i++) {
    await page.fill(`[data-testid="otp-input-${i}"]`, otpCode[i]);
  }
  await page.click('[data-testid="verify-otp-button"]');
}

export async function completeEKYC(page: Page) {
  // Wait for eKYC dialog to open
  await page.waitForSelector('[data-testid="ekyc-dialog"]');

  // Click start eKYC button
  await page.click('[data-testid="start-ekyc-button"]');

  // Wait for eKYC to complete (this might need adjustment based on actual flow)
  await page.waitForSelector('[data-testid="ekyc-success"]', { timeout: 30000 });

  // Click continue button
  await page.click('[data-testid="ekyc-continue-button"]');
}

export const mockData = {
  loanApplication: {
    fullName: "Nguyễn Văn A",
    email: "nguyenvana@example.com",
    phoneNumber: "0901234567",
    dateOfBirth: "1990-01-01",
    gender: "male",
    nationalId: "123456789",
    address: "123 Đường ABC, Quận 1, TP.HCM",
    income: 15000000,
    incomeType: "salary",
    careerStatus: "employed",
    careerType: "office",
  },
  creditCard: {
    bankName: "Vietcombank",
    cardName: "VCB Visa Classic",
    annualFee: 440000,
    interestRate: 25.9,
    requirements: "Thu nhập hàng tháng từ 6 triệu",
    benefits: "Miễn phí chuyển tiền, tích điểm thưởng",
  },
  insurance: {
    productName: "Bảo hiểm nhân thọ",
    provider: "Bảo Việt",
    coverage: 500000000,
    premium: 200000,
    duration: "1 năm",
  },
};