import { HttpResponse, http } from "msw";
import {
  mockMatchedProducts,
  mockForwardResults,
} from "./data/matched-products";
import { productsHandlers } from "../src/mocks/handlers/products";

// Mock API handlers
export const handlers = [
  // Example: Mock GET /api/users
  http.get("/api/users", () => {
    return HttpResponse.json([
      { id: "1", name: "John Doe", email: "john@example.com" },
      { id: "2", name: "Jane Smith", email: "jane@example.com" },
    ]);
  }),

  // Example: Mock POST /api/users
  http.post("/api/users", async ({ request }) => {
    const newUser = (await request.json()) as Record<string, any>;
    return HttpResponse.json({ id: "3", ...newUser }, { status: 201 });
  }),

  // Mock health check
  http.get("/api/health", () => {
    return HttpResponse.json({
      status: "ok",
      timestamp: new Date().toISOString(),
    });
  }),

  // Mock authentication endpoints
  http.post("/api/auth/login", async ({ request }) => {
    const { email, password } = (await request.json()) as {
      email: string;
      password: string;
    };

    if (email === "test@example.com" && password === "password123") {
      return HttpResponse.json({
        user: { id: "1", email: "test@example.com", name: "Test User" },
        token: "mock-jwt-token",
      });
    }

    return HttpResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }),

  // Mock profile endpoint
  http.get("/api/profile", ({ request }) => {
    const authHeader = request.headers.get("authorization");

    if (!authHeader || !authHeader.includes("Bearer mock-jwt-token")) {
      return HttpResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return HttpResponse.json({
      id: "1",
      email: "test@example.com",
      name: "Test User",
      avatar: null,
    });
  }),

  // ============================================
  // DOP API Mocks - Based on dop.yaml
  // ============================================

  // Mock POST /leads - Create a new lead
  http.post("*/v1/leads", async ({ request }) => {
    const body = (await request.json()) as Record<string, any>;

    // Simulate different scenarios based on loan amount
    const loanAmount = body.info?.loan_amount || 0;
    let matchedProducts = [];

    if (loanAmount >= 100000000) {
      // Very high loan amount - return 8 products (including special partner)
      matchedProducts = mockMatchedProducts.slice(0, 8);
    } else if (loanAmount >= 50000000) {
      // High loan amount - return 5 products
      matchedProducts = mockMatchedProducts.slice(0, 5);
    } else if (loanAmount >= 20000000) {
      // Medium loan amount - return 3 products
      matchedProducts = mockMatchedProducts.slice(0, 3);
    } else if (loanAmount >= 10000000) {
      // Low loan amount - return 1 product
      matchedProducts = mockMatchedProducts.slice(0, 1);
    }
    // else return empty array (no matched products)

    return HttpResponse.json({
      id: "770e8400-e29b-41d4-a716-446655440099",
      token: "mock-lead-token-" + Date.now(),
      matched_products: matchedProducts,
    });
  }),

  // Mock POST /leads/{id}/submit-info - Submit lead info
  http.post("*/v1/leads/:id/submit-info", async ({ request, params }) => {
    const body = (await request.json()) as Record<string, any>;
    const leadId = params.id as string;

    // Simulate different scenarios based on income
    const income = body.income || 0;
    let matchedProducts = [];
    let forwardResult = null;

    if (income >= 30000000) {
      // Very high income - return 10 products and forward successfully
      matchedProducts = mockMatchedProducts.slice(0, 10);
      forwardResult = mockForwardResults.forwarded;
    } else if (income >= 20000000) {
      // High income - return 6 products and forward successfully
      matchedProducts = mockMatchedProducts.slice(0, 6);
      forwardResult = mockForwardResults.forwarded;
    } else if (income >= 10000000) {
      // Medium income - return 4 products, forward rejected
      matchedProducts = mockMatchedProducts.slice(0, 4);
      forwardResult = mockForwardResults.rejected;
    } else if (income >= 5000000) {
      // Low income - return 2 products, exhausted
      matchedProducts = mockMatchedProducts.slice(0, 2);
      forwardResult = mockForwardResults.exhausted;
    }

    return HttpResponse.json({
      next_step_id: "880e8400-e29b-41d4-a716-446655440088",
      matched_products: matchedProducts,
      forward_result: forwardResult,
    });
  }),

  // Mock POST /leads/{id}/submit-otp - Submit OTP
  http.post("*/v1/leads/:id/submit-otp", async ({ request, params }) => {
    const body = (await request.json()) as Record<string, any>;
    const otp = body.otp;

    // Simulate OTP validation
    if (otp === "123456" || otp === "000000") {
      // Valid OTP - return products if step has distribution enabled
      const hasDistribution = body.step_id !== undefined;

      return HttpResponse.json({
        token: "mock-otp-verified-token-" + Date.now(),
        matched_products: hasDistribution
          ? mockMatchedProducts.slice(0, 2)
          : [],
      });
    }

    // Invalid OTP
    return HttpResponse.json(
      {
        code: "invalid_argument",
        message: "Mã OTP không chính xác",
      },
      { status: 400 },
    );
  }),

  // Mock POST /leads/{id}/resend-otp - Resend OTP
  http.post("*/v1/leads/:id/resend-otp", async ({ request }) => {
    const body = (await request.json()) as Record<string, any>;

    // Simulate successful OTP resend
    return HttpResponse.json({
      message: "OTP đã được gửi lại thành công",
    });
  }),

  // Mock GET /flows/{tenant} - Get tenant flow (if needed for testing)
  http.get("*/v1/flows/:tenant", ({ params }) => {
    return HttpResponse.json({
      id: "990e8400-e29b-41d4-a716-446655440077",
      name: "Default Onboarding Flow",
      description: "Standard loan application flow",
      flow_status: "active",
      steps: [
        {
          id: "step-001",
          page: "/loan-info",
          use_ekyc: false,
          send_otp: false,
          have_purpose: true,
          required_purpose: true,
          have_phone_number: true,
          required_phone_number: true,
          have_email: true,
          required_email: false,
          have_full_name: false,
          required_full_name: false,
          have_national_id: false,
          required_national_id: false,
          have_second_national_id: false,
          required_second_national_id: false,
          have_gender: false,
          required_gender: false,
          have_location: false,
          required_location: false,
          have_birthday: false,
          required_birthday: false,
          have_income_type: false,
          required_income_type: false,
          have_income: false,
          required_income: false,
          have_having_loan: false,
          required_having_loan: false,
          have_career_status: false,
          required_career_status: false,
          have_career_type: false,
          required_career_type: false,
          have_credit_status: false,
          required_credit_status: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
  }),

  // ============================================
  // Products API Mocks
  // ============================================
  ...productsHandlers,
];
