import { setup } from "msw";
import { http, HttpResponse } from "msw";

// ============================================================================
// MSW Handlers for DynamicLoanForm Tests (Node/Vitest only)
// ============================================================================

const flowHandlers = [
  // Standard flow response
  http.get("/flows/:tenant", ({ params }) => {
    const { tenant } = params;

    if (tenant === "error-tenant") {
      return HttpResponse.json({ error: "Flow not found" }, { status: 404 });
    }

    if (tenant === "server-error-tenant") {
      return HttpResponse.json(
        { error: "Internal Server Error" },
        { status: 500 },
      );
    }

    return HttpResponse.json({
      id: `flow-${tenant}`,
      name: `Flow for ${tenant}`,
      status: "Active",
      steps: [
        {
          id: "step-1",
          page: "/",
          useEkyc: false,
          sendOtp: false,
          fields: {
            purpose: { visible: true, required: true },
            phoneNumber: { visible: true, required: false },
            email: { visible: true, required: true },
            fullName: { visible: true, required: true },
            nationalId: { visible: true, required: true },
            secondNationalId: { visible: false, required: false },
            gender: { visible: true, required: true },
            location: { visible: true, required: true },
            birthday: { visible: true, required: true },
            incomeType: { visible: false, required: false },
            income: { visible: true, required: true },
            havingLoan: { visible: false, required: false },
            careerStatus: { visible: false, required: false },
            careerType: { visible: false, required: false },
            creditStatus: { visible: false, required: false },
          },
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
  }),
];

const leadHandlers = [
  // Successful lead creation
  http.post("/leads", async ({ request }) => {
    const body = await request.json();

    // Validate required fields
    if (!body.flowId || !body.tenant || !body.info) {
      return HttpResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    return HttpResponse.json({
      id: `lead-${Date.now()}`,
      token: `token-${Date.now()}`,
      status: "pending",
    });
  }),
];

// ============================================================================
// MSW Setup for Node/Vitest only
// ============================================================================

export const handlers = [...flowHandlers, ...leadHandlers];

// Setup MSW for Node tests (Vitest) - setupWorker is for browser only
export const server = setup(...handlers);

// ============================================================================
// Test Utilities
// ============================================================================

/**
 * Wait for a condition to be true with timeout
 */
export async function waitForCondition(
  condition: () => boolean,
  timeout = 1000,
  interval = 50,
): Promise<void> {
  const startTime = Date.now();

  while (!condition()) {
    if (Date.now() - startTime > timeout) {
      throw new Error("Timeout waiting for condition");
    }
    await new Promise((resolve) => setTimeout(resolve, interval));
  }
}

/**
 * Generate test data for different flow configurations
 */
export const testFlows = {
  minimal: {
    id: "flow-minimal",
    name: "Minimal Flow",
    steps: [
      {
        id: "step-1",
        page: "/",
        fields: {
          purpose: { visible: true, required: true },
          phoneNumber: { visible: false, required: false },
          email: { visible: false, required: false },
          fullName: { visible: false, required: false },
          nationalId: { visible: false, required: false },
          secondNationalId: { visible: false, required: false },
          gender: { visible: false, required: false },
          location: { visible: false, required: false },
          birthday: { visible: false, required: false },
          incomeType: { visible: false, required: false },
          income: { visible: false, required: false },
          havingLoan: { visible: false, required: false },
          careerStatus: { visible: false, required: false },
          careerType: { visible: false, required: false },
          creditStatus: { visible: false, required: false },
        },
      },
    ],
  },
  standard: {
    id: "flow-standard",
    name: "Standard Flow",
    steps: [
      {
        id: "step-1",
        page: "/",
        fields: {
          purpose: { visible: true, required: true },
          phoneNumber: { visible: true, required: false },
          email: { visible: true, required: true },
          fullName: { visible: true, required: true },
          nationalId: { visible: true, required: true },
          secondNationalId: { visible: false, required: false },
          gender: { visible: true, required: true },
          location: { visible: true, required: true },
          birthday: { visible: true, required: true },
          incomeType: { visible: false, required: false },
          income: { visible: true, required: true },
          havingLoan: { visible: false, required: false },
          careerStatus: { visible: false, required: false },
          careerType: { visible: false, required: false },
          creditStatus: { visible: false, required: false },
        },
      },
    ],
  },
  full: {
    id: "flow-full",
    name: "Full Flow",
    steps: [
      {
        id: "step-1",
        page: "/",
        fields: {
          purpose: { visible: true, required: true },
          phoneNumber: { visible: true, required: true },
          email: { visible: true, required: true },
          fullName: { visible: true, required: true },
          nationalId: { visible: true, required: true },
          secondNationalId: { visible: true, required: true },
          gender: { visible: true, required: true },
          location: { visible: true, required: true },
          birthday: { visible: true, required: true },
          incomeType: { visible: true, required: true },
          income: { visible: true, required: true },
          havingLoan: { visible: true, required: true },
          careerStatus: { visible: true, required: true },
          careerType: { visible: true, required: true },
          creditStatus: { visible: true, required: true },
        },
      },
    ],
  },
};

/**
 * Expected field labels for each flow type
 */
export const expectedFieldLabels = {
  minimal: ["Số tiền vay", "Thời hạn vay", "Mục đích vay"],
  standard: [
    "Số tiền vay",
    "Thời hạn vay",
    "Mục đích vay",
    "Họ và tên",
    "Căn cước công dân",
    "Email",
    "Giới tính",
    "Tỉnh/Thành phố",
    "Ngày sinh",
    "Mức thu nhập hàng tháng",
  ],
  full: [
    "Số tiền vay",
    "Thời hạn vay",
    "Mục đích vay",
    "Họ và tên",
    "Căn cước công dân",
    "Email",
    "Giới tính",
    "Tỉnh/Thành phố",
    "Ngày sinh",
    "Mức thu nhập hàng tháng",
    "Tình trạng việc làm",
    "Loại nghề nghiệp",
  ],
};

/**
 * Validation error messages
 */
export const validationMessages = {
  purposeRequired: /vui lòng chọn mục đích vay/i,
  emailInvalid: /email không hợp lệ/i,
  nationalIdInvalid: /cccd phải có 12 số/i,
  nameRequired: /vui lòng nhập họ tên/i,
  nameTooShort: /họ tên phải có ít nhất 2 ký tự/i,
  phoneRequired: /vui lòng nhập số điện thoại/i,
  phoneInvalid: /số điện thoại không hợp lệ/i,
  termsRequired: /bạn phải đồng ý với điều khoản/i,
};
