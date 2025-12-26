/**
 * Loan Form Demo Cases
 *
 * This file contains predefined demo scenarios for the loan application form.
 * These scenarios are designed for customer demonstrations, testing, and validation.
 *
 * Demo scenarios include:
 * - Different job statuses (salaried, self-employed, unemployed)
 * - Various income levels
 * - Different credit histories
 * - Multiple existing loan scenarios
 *
 * Usage:
 * ```typescript
 * import { LOAN_FORM_DEMO_CASES } from "@/configs/forms/loan-form-demo-cases";
 *
 * // Get all demo scenarios
 * const demos = LOAN_FORM_DEMO_CASES;
 *
 * // Get specific demo by ID
 * const salariedDemo = LOAN_FORM_DEMO_CASES["salaried-employee"];
 * ```
 */

/**
 * Demo Case Interface
 *
 * Defines the structure of a demo scenario including:
 * - Metadata (id, name, description)
 * - Expected outcome for demonstration purposes
 * - Complete form data for the scenario
 */
export interface LoanFormDemoCase {
  /** Unique identifier for the demo scenario */
  id: string;

  /** Display name for the demo scenario */
  name: string;

  /** Detailed description of the scenario and what it demonstrates */
  description: string;

  /** Expected outcome/approval status for customer demo purposes */
  expectedOutcome: "approve" | "review" | "reject";

  /** Category of the scenario for organization */
  category: "employment" | "credit" | "income" | "edge-cases";

  /** Complete form data matching the wizardConfig field structure */
  formData: {
    /** Personal Information Fields */
    fullName: string;
    idCard: string;
    city: "hanoi" | "hcm" | "danang";
    vehicleOwnership: "yes" | "no";

    /** Income Information Fields */
    jobStatus: "salaried" | "self_employed" | "unemployed";
    companyName?: string;
    position?: string;
    businessType?: string;
    monthlyIncome?: "<5m" | "5-10m" | "10-20m" | ">20m";

    /** Financial Information Fields */
    existingLoans: "none" | "1" | "2" | "3" | ">3";
    creditHistory: "none" | "group2" | "group3+";
  };

  /** Additional notes about the scenario */
  notes?: string;

  /** Tags for filtering demos (e.g., "high-income", "good-credit", "self-employed") */
  tags: string[];
}

/**
 * Demo Scenario Categories
 *
 * Categorizes demos by what they demonstrate:
 * - employment: Different job status scenarios
 * - credit: Various credit history situations
 * - income: Different income levels
 * - edge-cases: Boundary conditions and special cases
 */
export type DemoCategory = LoanFormDemoCase["category"];

/**
 * Expected Outcome Types
 *
 * For demonstration purposes, each scenario has an expected outcome:
 * - approve: High likelihood of approval
 * - review: Requires additional review
 * - reject: Likely to be rejected
 */
export type ExpectedOutcome = LoanFormDemoCase["expectedOutcome"];

/**
 * Demo Helper Utility
 *
 * Utility functions for working with demo scenarios
 */
export const DemoHelpers = {
  /**
   * Get all demo cases
   */
  getAllDemos: (): LoanFormDemoCase[] => {
    return Object.values(LOAN_FORM_DEMO_CASES);
  },

  /**
   * Get demo case by ID
   */
  getDemoById: (id: string): LoanFormDemoCase | undefined => {
    return LOAN_FORM_DEMO_CASES[id];
  },

  /**
   * Get demos by category
   */
  getDemosByCategory: (category: DemoCategory): LoanFormDemoCase[] => {
    return Object.values(LOAN_FORM_DEMO_CASES).filter(
      (demo) => demo.category === category,
    );
  },

  /**
   * Get demos by expected outcome
   */
  getDemosByOutcome: (outcome: ExpectedOutcome): LoanFormDemoCase[] => {
    return Object.values(LOAN_FORM_DEMO_CASES).filter(
      (demo) => demo.expectedOutcome === outcome,
    );
  },

  /**
   * Search demos by tags
   */
  searchDemosByTags: (tag: string): LoanFormDemoCase[] => {
    return Object.values(LOAN_FORM_DEMO_CASES).filter((demo) =>
      demo.tags.includes(tag),
    );
  },

  /**
   * Search demos by name or description
   */
  searchDemos: (query: string): LoanFormDemoCase[] => {
    const lowerQuery = query.toLowerCase();
    return Object.values(LOAN_FORM_DEMO_CASES).filter(
      (demo) =>
        demo.name.toLowerCase().includes(lowerQuery) ||
        demo.description.toLowerCase().includes(lowerQuery),
    );
  },
};

/**
 * Demo Scenarios Collection
 *
 * All available demo scenarios organized by their unique IDs
 *
 * Scenarios include:
 * 1. salaried-employee: Full-time employee with good credit
 * 2. self-employed-business: Self-employed business owner
 * 3. unemployed-no-income: Unemployed applicant
 * 4. multiple-loans-good-credit: Applicant with multiple existing loans but good credit
 * 5. bad-credit-history: Applicant with bad credit history
 *
 * @see LoanFormDemoCase for the structure of each scenario
 */
export const LOAN_FORM_DEMO_CASES: Record<string, LoanFormDemoCase> = {
  /**
   * Scenario 1: Salaried Employee
   *
   * Demonstrates:
   * - Full-time employee (Đi làm hưởng lương)
   * - Company name and position fields (conditional)
   * - High income level
   * - Good credit history
   * - No existing loans
   * - High approval likelihood
   */
  "salaried-employee": {
    id: "salaried-employee",
    name: "Nhân viên văn phòng - Thu nhập tốt",
    description:
      "Nhân viên làm việc tại công ty lớn, thu nhập cao, lịch sử tín dụng tốt, không có khoản vay nào",
    expectedOutcome: "approve",
    category: "employment",
    tags: ["high-income", "good-credit", "salaried", "ideal-candidate"],
    formData: {
      fullName: "Nguyễn Văn An",
      idCard: "001234567890",
      city: "hanoi",
      vehicleOwnership: "yes",
      jobStatus: "salaried",
      companyName: "Tập đoàn Công nghiệp - Viễn thông Quân đội (Viettel)",
      position: "Quản lý kinh doanh",
      monthlyIncome: ">20m",
      existingLoans: "none",
      creditHistory: "none",
    },
    notes:
      "Ứng viên lý tưởng: Thu nhập cao (>20 triệu), làm việc tại công ty lớn, không có nợ, lịch sử tín dụng sạch",
  },

  /**
   * Scenario 2: Self-Employed Business Owner
   *
   * Demonstrates:
   * - Self-employed/business owner (Kinh doanh/Lao động tự do)
   * - Business type field instead of company/position (conditional)
   * - Medium-high income
   * - Good credit history
   * - One existing loan
   * - Good approval likelihood
   */
  "self-employed-business": {
    id: "self-employed-business",
    name: "Chủ doanh nghiệp - Kinh doanh ổn định",
    description:
      "Chủ doanh nghiệp nhỏ, hoạt động ổn định, có 1 khoản vay hiện tại nhưng trả đúng hạn, lịch sử tín dụng tốt",
    expectedOutcome: "approve",
    category: "employment",
    tags: ["self-employed", "good-credit", "business-owner", "existing-loan"],
    formData: {
      fullName: "Trần Thị Mai",
      idCard: "002345678901",
      city: "hcm",
      vehicleOwnership: "yes",
      jobStatus: "self_employed",
      businessType: "Bán lẻ thời trang và phụ kiện",
      monthlyIncome: "10-20m",
      existingLoans: "1",
      creditHistory: "none",
    },
    notes:
      "Kinh doanh ổn định, có 1 khoản vay nhưng trả đúng hạn, lịch sử tín dụng tốt",
  },

  /**
   * Scenario 3: Unemployed - No Income
   *
   * Demonstrates:
   * - Unemployed status (Không có việc làm)
   * - No income fields shown (jobStatus = "unemployed")
   * - No vehicle ownership
   * - Good credit history
   * - No existing loans
   * - High rejection likelihood
   */
  "unemployed-no-income": {
    id: "unemployed-no-income",
    name: "Không có việc làm - Đang tìm kiếm",
    description:
      "Hiện tại không có việc làm, không có thu nhập, lịch sử tín dụng sạch, không có khoản vay nào",
    expectedOutcome: "reject",
    category: "employment",
    tags: ["unemployed", "no-income", "edge-cases", "low-probability"],
    formData: {
      fullName: "Lê Văn Bình",
      idCard: "003456789012",
      city: "danang",
      vehicleOwnership: "no",
      jobStatus: "unemployed",
      existingLoans: "none",
      creditHistory: "none",
    },
    notes:
      "Không có việc làm, không có thu nhập - khả năng bị từ chối cao dù lịch sử tín dụng tốt",
  },

  /**
   * Scenario 4: Multiple Existing Loans - Good Credit
   *
   * Demonstrates:
   * - Salaried employee
   * - High income
   * - Multiple existing loans (3 loans)
   * - Good credit history (paying on time)
   * - Medium approval likelihood (depends on debt-to-income ratio)
   */
  "multiple-loans-good-credit": {
    id: "multiple-loans-good-credit",
    name: "Nhiều khoản vay - Trả đúng hạn",
    description:
      "Làm việc tại công ty lớn, thu nhập cao, đang có 3 khoản vay nhưng đều trả đúng hạn, lịch sử tín dụng tốt",
    expectedOutcome: "review",
    category: "credit",
    tags: ["high-income", "good-credit", "multiple-loans", "review-needed"],
    formData: {
      fullName: "Phạm Văn Cường",
      idCard: "004567890123",
      city: "hanoi",
      vehicleOwnership: "yes",
      jobStatus: "salaried",
      companyName: "Ngân hàng Ngoại thương Việt Nam (Vietcombank)",
      position: "Chuyên viên phân tích tài chính",
      monthlyIncome: ">20m",
      existingLoans: "3",
      creditHistory: "none",
    },
    notes:
      "Thu nhập cao nhưng đang có 3 khoản vay - cần xem xét tỷ lệ nợ trên thu nhập (DTI)",
  },

  /**
   * Scenario 5: Bad Credit History
   *
   * Demonstrates:
   * - Salaried employee
   * - Medium income
   * - No existing loans
   * - Bad credit history (group 3+)
   * - High rejection likelihood
   */
  "bad-credit-history": {
    id: "bad-credit-history",
    name: "Lịch sử tín dụng xấu - Nhóm 3+",
    description:
      "Nhân viên văn phòng, thu nhập trung bình, không có khoản vay hiện tại nhưng có lịch sử nợ xấu nhóm 3 trở lên",
    expectedOutcome: "reject",
    category: "credit",
    tags: ["bad-credit", "nợ-xấu", "high-risk", "edge-cases"],
    formData: {
      fullName: "Hoàng Thị Dung",
      idCard: "005678901234",
      city: "hcm",
      vehicleOwnership: "no",
      jobStatus: "salaried",
      companyName: "Công ty Cổ phần Dệt may Việt Thắng",
      position: "Nhân viên kinh doanh",
      monthlyIncome: "10-20m",
      existingLoans: "none",
      creditHistory: "group3+",
    },
    notes:
      "Có nợ xấu nhóm 3+ - khả năng bị từ chối cao ngay cả khi có thu nhập và không có khoản vay hiện tại",
  },

  /**
   * Bonus Scenario: Self-Employed - Low Income
   *
   * Demonstrates:
   * - Self-employed with business
   * - Low income (< 5 million)
   * - No existing loans
   * - Good credit history
   * - Medium rejection likelihood
   */
  "self-employed-low-income": {
    id: "self-employed-low-income",
    name: "Kinh doanh tự do - Thu nhập thấp",
    description:
      "Kinh doanh tự do, thu nhập thấp (<5 triệu), không có khoản vay, lịch sử tín dụng tốt",
    expectedOutcome: "review",
    category: "income",
    tags: ["self-employed", "low-income", "business-owner", "marginal"],
    formData: {
      fullName: "Đỗ Văn Em",
      idCard: "006789012345",
      city: "danang",
      vehicleOwnership: "no",
      jobStatus: "self_employed",
      businessType: "Bán hàng online",
      monthlyIncome: "<5m",
      existingLoans: "none",
      creditHistory: "none",
    },
    notes:
      "Thu nhập thấp (<5 triệu) dù làm kinh doanh - cần xem xét kỹ khả năng trả nợ",
  },

  /**
   * Bonus Scenario: Salaried - Debt in Group 2
   *
   * Demonstrates:
   * - Salaried employee
   * - Medium income
   * - No existing loans
   * - Debt in group 2 (late payment)
   * - Medium-high rejection likelihood
   */
  "salaried-group2-debt": {
    id: "salaried-group2-debt",
    name: "Nhân viên - Nợ chậm trả nhóm 2",
    description:
      "Nhân viên văn phòng, thu nhập trung bình, không có khoản vay hiện tại nhưng đang có nợ chậm trả nhóm 2",
    expectedOutcome: "review",
    category: "credit",
    tags: ["salaried", "medium-income", "group2-debt", "risk-factor"],
    formData: {
      fullName: "Nguyễn Thị Phương",
      idCard: "007890123456",
      city: "hanoi",
      vehicleOwnership: "no",
      jobStatus: "salaried",
      companyName: "Tổng Công ty Bưu điện Việt Nam (VNPost)",
      position: "Nhân viên bưu tá",
      monthlyIncome: "5-10m",
      existingLoans: "none",
      creditHistory: "group2",
    },
    notes: "Đang có nợ chậm trả nhóm 2 - cần xem xét kỹ vì có rủi ro cao",
  },
};
