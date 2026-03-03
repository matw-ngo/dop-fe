/**
 * MSW Handlers for DOP Service API
 *
 * Mock handlers for DOP backend API endpoints based on src/lib/api/v1/dop.d.ts
 * These handlers support testing scenarios including success, error, and edge cases.
 */

import { http } from "msw";
import { mswStore } from "../../../mocks/store";

const BASE_URL = "*";

const mswJson = (body: unknown, init?: ResponseInit): Response => {
  const headers = new Headers(init?.headers);
  headers.set("x-msw-mocked", "true");

  const payload =
    body && typeof body === "object" && !Array.isArray(body)
      ? { __mocked: true, ...(body as Record<string, unknown>) }
      : body;

  return Response.json(payload, { ...init, headers });
};

/**
 * Generate a mock flow detail object
 */
const createMockFlowDetail = (overrides?: Record<string, unknown>) => ({
  id: "110e8400-e29b-41d4-a716-446655440001",
  name: "Default Onboarding Flow",
  description: "Standard user onboarding flow",
  flow_status: "active" as const,
  steps: [
    {
      id: "220e8400-e29b-41d4-a716-446655440002",
      use_ekyc: false,
      send_otp: false,
      page: "/index",
      // No consent_purpose_id for step 1
      have_purpose: false,
      required_purpose: false,
      have_phone_number: false,
      required_phone_number: false,
      have_email: false,
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
      have_credit_status: true,
      required_credit_status: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: "330e8400-e29b-41d4-a716-446655440003",
      use_ekyc: false,
      send_otp: false,
      page: "/submit-info",
      consent_purpose_id: "660e8400-e29b-41d4-a716-446655440006", // Step 2 has consent
      have_purpose: false,
      required_purpose: false,
      have_phone_number: false,
      required_phone_number: false,
      have_email: true,
      required_email: true,
      have_full_name: true,
      required_full_name: true,
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
  ...overrides,
});

/**
 * Generate a mock lead response
 */
const createMockLeadResponse = (overrides?: Record<string, unknown>) => ({
  id: "330e8400-e29b-41d4-a716-446655440003",
  token: `lead-token-${Date.now()}`,
  ...overrides,
});

/**
 * Generate a mock eKYC config
 */
const createMockEkycConfig = (overrides?: Record<string, unknown>) => ({
  access_token: `ekyc-access-token-${Date.now()}`,
  challenge_code: `challenge-${Date.now()}`,
  has_result_screen: true,
  enable_api_liveness_document: true,
  enable_api_liveness_face: true,
  enable_api_masked_face: true,
  enable_api_compare_face: true,
  sdk_flow: "DOCUMENT_TO_FACE" as const,
  list_type_document: [9, 1, 2],
  show_step: true,
  has_qr_scan: true,
  document_type_start: 9,
  double_liveness: false,
  use_method: "BOTH" as const,
  show_tab_result_information: true,
  show_tab_result_validation: true,
  show_tab_result_qrcode: true,
  ...overrides,
});

/**
 * Generate error response
 */
const createErrorResponse = (code: string, message: string) => ({
  code,
  message,
});

export const dopHandlers = [
  /**
   * GET /flows/{tenant} - Get tenant onboarding flow
   */
  http.get(`${BASE_URL}/flows/:tenant`, ({ params, request }) => {
    const { tenant } = params;
    const scenario = request.headers.get("x-test-scenario") || "success";

    switch (scenario) {
      case "not_found":
        return mswJson(
          createErrorResponse(
            "not_found",
            `Flow for tenant ${tenant} not found`,
          ),
          { status: 404 },
        );

      case "inactive":
        return mswJson(
          createErrorResponse("failed_precondition", "Flow is not active"),
          { status: 400 },
        );
      default:
        return mswJson(createMockFlowDetail({ id: tenant as string }));
    }
  }),

  /**
   * POST /leads - Create a new lead
   */
  http.post(`${BASE_URL}/leads`, async ({ request }) => {
    const scenario = request.headers.get("x-test-scenario") || "success";

    switch (scenario) {
      case "validation_error":
        return mswJson(
          createErrorResponse(
            "invalid_argument",
            "Missing required fields: flow_id, tenant",
          ),
          { status: 400 },
        );

      case "unauthorized":
        return mswJson(
          createErrorResponse("unauthenticated", "Authentication required"),
          { status: 401 },
        );

      case "forbidden":
        return mswJson(
          createErrorResponse("permission_denied", "Access denied"),
          { status: 403 },
        );

      case "server_error":
        return mswJson(
          createErrorResponse("internal_error", "Internal server error"),
          { status: 500 },
        );
      default: {
        const body = await request.json();
        const newLead = createMockLeadResponse(
          body && typeof body === "object" ? body : {},
        );

        mswStore.updateMockData((data) => ({
          ...data,
          leads: [newLead, ...data.leads],
        }));

        return mswJson(newLead, { status: 200 });
      }
    }
  }),

  /**
   * POST /leads/{id}/submit-info - Submit lead info
   */
  http.post(
    `${BASE_URL}/leads/:id/submit-info`,
    async ({ params, request }) => {
      const { id } = params;
      const scenario = request.headers.get("x-test-scenario") || "success";

      switch (scenario) {
        case "validation_error":
          return mswJson(
            createErrorResponse("invalid_argument", "Invalid lead info format"),
            { status: 400 },
          );

        case "not_found":
          return mswJson(
            createErrorResponse("not_found", `Lead ${id} not found`),
            { status: 404 },
          );

        case "otp_required":
          return mswJson(
            createErrorResponse(
              "failed_precondition",
              "OTP verification required",
            ),
            { status: 400 },
          );
        default: {
          const body = await request.json();

          mswStore.updateMockData((data) => {
            const existing = data.leads.find((l) => l.id === id) || { id };
            const updated = {
              ...existing,
              ...(body && typeof body === "object" ? body : {}),
            };

            let exists = false;
            const nextLeads = data.leads.map((l) => {
              if (l.id === id) {
                exists = true;
                return updated;
              }
              return l;
            });

            if (!exists) {
              nextLeads.push(updated);
            }

            return { ...data, leads: nextLeads };
          });

          return mswJson({
            success: true,
            message: "Lead info submitted successfully",
            data: {
              lead_id: id,
              ...(body && typeof body === "object" ? body : {}),
            },
          });
        }
      }
    },
  ),

  /**
   * POST /leads/{id}/submit-otp - Submit OTP for lead
   */
  http.post(`${BASE_URL}/leads/:id/submit-otp`, async ({ params, request }) => {
    const { id } = params;
    const scenario = request.headers.get("x-test-scenario") || "success";

    switch (scenario) {
      case "validation_error":
        return mswJson(
          createErrorResponse("invalid_argument", "Invalid OTP format"),
          { status: 400 },
        );

      case "invalid_otp":
        return mswJson(
          createErrorResponse("invalid_argument", "Invalid OTP code"),
          { status: 400 },
        );

      case "expired":
        return mswJson(
          createErrorResponse("deadline_exceeded", "OTP has expired"),
          { status: 400 },
        );

      case "too_many_attempts":
        return mswJson(
          createErrorResponse("resource_exhausted", "Too many OTP attempts"),
          { status: 400 },
        );
      default: {
        const body = await request.json();

        // Update lead verified status
        mswStore.updateMockData((data) => {
          const existing = data.leads.find((l) => l.id === id) || { id };
          const updated = {
            ...existing,
            verified: true,
          };

          let exists = false;
          const nextLeads = data.leads.map((l) => {
            if (l.id === id) {
              exists = true;
              return updated;
            }
            return l;
          });

          if (!exists) {
            nextLeads.push(updated);
          }

          return { ...data, leads: nextLeads };
        });

        return mswJson({
          success: true,
          message: "OTP verified successfully",
          data: {
            lead_id: id,
            token: body && typeof body === "object" ? body.token : null,
            verified: true,
          },
        });
      }
    }
  }),

  /**
   * POST /leads/{id}/resend-otp - Resend OTP for lead
   */
  http.post(`${BASE_URL}/leads/:id/resend-otp`, async ({ params, request }) => {
    const { id } = params;
    const scenario = request.headers.get("x-test-scenario") || "success";

    switch (scenario) {
      case "validation_error":
        return mswJson(
          createErrorResponse("invalid_argument", "Invalid target format"),
          { status: 400 },
        );

      case "too_many_requests":
        return mswJson(
          createErrorResponse(
            "resource_exhausted",
            "OTP resend limit exceeded",
          ),
          { status: 400 },
        );
      default: {
        const body = await request.json();
        const target =
          body && typeof body === "object" && "target" in body
            ? ((body as { target?: string }).target ?? null)
            : null;
        return mswJson({
          success: true,
          message: "OTP resent successfully",
          data: {
            lead_id: id,
            target,
            next_resend_available: new Date(Date.now() + 60000).toISOString(),
          },
        });
      }
    }
  }),

  /**
   * GET /leads/{id}/ekyc/config - Get eKYC config
   */
  http.get(`${BASE_URL}/leads/:id/ekyc/config`, ({ params, request }) => {
    const { id } = params;
    const scenario = request.headers.get("x-test-scenario") || "success";

    switch (scenario) {
      case "not_found":
        return mswJson(
          createErrorResponse("not_found", `Lead ${id} not found`),
          { status: 404 },
        );

      case "ekyc_disabled":
        return mswJson(
          createErrorResponse(
            "failed_precondition",
            "eKYC is not enabled for this lead",
          ),
          { status: 400 },
        );
      default:
        return mswJson(createMockEkycConfig());
    }
  }),

  /**
   * POST /leads/{id}/ekyc/vnpt - Submit eKYC result from VNPT
   */
  http.post(`${BASE_URL}/leads/:id/ekyc/vnpt`, async ({ params, request }) => {
    const { id } = params;
    const scenario = request.headers.get("x-test-scenario") || "success";

    switch (scenario) {
      case "validation_error":
        return mswJson(
          createErrorResponse("invalid_argument", "Invalid eKYC data format"),
          { status: 400 },
        );

      case "processing_error":
        return mswJson(
          createErrorResponse("internal_error", "Error processing eKYC result"),
          { status: 500 },
        );
      default: {
        const _body = await request.json();

        // Update lead ekyc status
        mswStore.updateMockData((data) => {
          const existing = data.leads.find((l) => l.id === id) || { id };
          const updated = {
            ...existing,
            ekyc_status: "processing",
          };

          let exists = false;
          const nextLeads = data.leads.map((l) => {
            if (l.id === id) {
              exists = true;
              return updated;
            }
            return l;
          });

          if (!exists) {
            nextLeads.push(updated);
          }

          return { ...data, leads: nextLeads };
        });

        return mswJson({
          success: true,
          message: "eKYC result submitted successfully",
          data: {
            lead_id: id,
            verification_id: `ver-${Date.now()}`,
            status: "processing",
          },
        });
      }
    }
  }),
];

export default dopHandlers;
