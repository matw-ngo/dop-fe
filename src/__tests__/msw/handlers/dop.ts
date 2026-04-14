/**
 * MSW Handlers for DOP Service API
 *
 * Mock handlers for DOP backend API endpoints based on src/lib/api/v1/dop.d.ts
 * These handlers support testing scenarios including success, error, and edge cases.
 *
 * Profile Support:
 * - Use 'x-test-profile' header to select a specific test profile
 * - Use 'x-test-scenario' header to trigger error scenarios
 *
 * Available Profiles:
 * - default: Finzone flow - OTP at step 1 (/index), submit info at step 2 (/submit-info)
 * - otp-at-step-1: OTP at first step
 * - otp-at-step-3: OTP at step 3 (explicit)
 * - otp-at-last-step: OTP at final step
 * - no-otp-flow: No OTP verification
 * - multi-otp-flow: Multiple OTP steps
 * - with-ekyc: Flow with eKYC verification
 *
 * Real API Data Sources:
 * - Flow config: GET /flows/11111111-1111-1111-1111-111111111111
 * - Lead creation: POST /leads
 * - Lead status: GET /leads/{id}
 * - Submit info: POST /leads/{id}/submit-info
 */

import { http } from "msw";
import { mswStore } from "../../../mocks/store";
import { mockMatchedProducts } from "../../../../mocks/data/matched-products";
import { getProfileFromRequest } from "../profiles";

const BASE_URL = "*";

const getScenarioFromRequestOrStorage = (request: Request): string => {
  const headerScenario = request.headers.get("x-test-scenario");
  if (headerScenario) return headerScenario;

  // Fallback to localStorage for manual testing in browser
  if (typeof window !== "undefined") {
    const storageScenario = localStorage.getItem("msw_test_scenario");
    if (storageScenario) return storageScenario;
  }

  return "success";
};

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
 * Generate a mock lead response based on real API:
 * {"id":"019d672f-48e1-7408-9b2f-330e5fcd2bd5","token":"eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9..."}
 */
const createMockLeadResponse = (overrides?: Record<string, unknown>) => ({
  id: `019d67${Math.random().toString(36).substring(2, 6)}-${Date.now().toString(36).substring(2, 6)}-${Math.random().toString(36).substring(2, 8)}`,
  token: `eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.${btoa(
    JSON.stringify({
      iss: "smartdop",
      sub: "authentication",
      exp: Math.floor(Date.now() / 1000) + 86400,
      nbf: Math.floor(Date.now() / 1000),
      iat: Math.floor(Date.now() / 1000),
      uid: overrides?.id || "019d672f-48e1-7408-9b2f-330e5fcd2bd5",
    }),
  ).replace(/=/g, "")}.${Math.random().toString(36).substring(2, 100)}`,
  matched_products: mockMatchedProducts.slice(0, 6),
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
   *
   * Supports profile selection via 'x-test-profile' header
   */
  http.get(`${BASE_URL}/flows/:tenant`, ({ params, request }) => {
    const { tenant } = params;
    const scenario = getScenarioFromRequestOrStorage(request);

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
      default: {
        // Get profile from request header
        const profile = getProfileFromRequest(request);
        const flowConfig = {
          ...profile.flowConfig,
          id: profile.flowConfig.id || (tenant as string),
        };
        return mswJson(flowConfig);
      }
    }
  }),

  /**
   * POST /leads - Create a new lead
   */
  http.post(`${BASE_URL}/leads`, async ({ request }) => {
    const scenario = getScenarioFromRequestOrStorage(request);

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
   * GET /leads/{id} - Get lead status for polling
   *
   * Supports test scenarios for polling:
   * - pending: Still processing (returns 200 with pending status)
   * - distributed: Successfully matched
   * - failed: Distribution failed
   * - no_match: No matching products
   */
  http.get(`${BASE_URL}/leads/:id`, ({ params, request }) => {
    const { id } = params;
    const scenario = getScenarioFromRequestOrStorage(request);

    // Get current lead from mock store to check state
    const mockData = mswStore.getMockData();
    const lead = mockData.leads.find((l) => l.id === id);

    switch (scenario) {
      case "pending":
        return mswJson({
          id,
          distribution_status: "pending",
          is_forwarded: false,
          submitted_at: lead?.submitted_at || new Date().toISOString(),
        });

      case "distributed":
        return mswJson({
          id,
          distribution_status: "distributed",
          is_forwarded: true,
          partner_id: "partner-001",
          partner_name: "VPBank",
          submitted_at: lead?.submitted_at || new Date().toISOString(),
        });

      case "failed":
        return mswJson({
          id,
          distribution_status: "failed",
          is_forwarded: false,
          submitted_at: lead?.submitted_at || new Date().toISOString(),
        });

      case "no_match":
        return mswJson({
          id,
          distribution_status: "no_match",
          is_forwarded: false,
          submitted_at: lead?.submitted_at || new Date().toISOString(),
        });

      default:
        // Return distributed by default for smoke test
        return mswJson({
          id,
          distribution_status: "distributed",
          is_forwarded: true,
          partner_id: "partner-001",
          partner_name: "VPBank",
          submitted_at: lead?.submitted_at || new Date().toISOString(),
        });
    }
  }),

  /**
   * POST /leads/{id}/submit-info - Submit lead info
   */
  http.post(
    `${BASE_URL}/leads/:id/submit-info`,
    async ({ params, request }) => {
      const { id } = params;
      const scenario = getScenarioFromRequestOrStorage(request);

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
          const body = (await request.json()) as Record<string, unknown>;

          mswStore.updateMockData((data) => {
            const existing = data.leads.find((l) => l.id === id) || { id };
            const updated = {
              ...existing,
              ...body,
              submitted_at: new Date().toISOString(),
              distribution_status: "pending", // Start as pending for polling
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

          // Return proper SubmitLeadInfoResponseBody matching API schema exactly
          return mswJson({
            next_step_id: body.step_id as string | undefined,
            matched_products: mockMatchedProducts.slice(0, 3).map((p) => ({
              product_id: p.product_id,
              product_name: p.product_name,
              product_type: p.product_type,
              partner_id: p.partner_id,
              partner_name: p.partner_name || "VPBank",
              partner_code: p.partner_code,
            })),
            forward_result: {
              status: "forwarded",
              partner_id: "partner-001",
              partner_name: "VPBank",
              partner_lead_id: `lead-${Date.now()}`,
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
    const scenario = getScenarioFromRequestOrStorage(request);

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
    const scenario = getScenarioFromRequestOrStorage(request);

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
    const scenario = getScenarioFromRequestOrStorage(request);

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
    const scenario = getScenarioFromRequestOrStorage(request);

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

  http.get(`${BASE_URL}/locations/provinces`, () => {
    return mswJson({
      data: [
        {
          id: "550e8400-e29b-41d4-a716-446655440001",
          code: "01",
          name: "Hà Nội",
          name_en: "Ha Noi",
          full_name: "Thành phố Hà Nội",
          full_name_en: "Ha Noi City",
          code_name: "ha_noi",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: "550e8400-e29b-41d4-a716-446655440002",
          code: "02",
          name: "Hồ Chí Minh",
          name_en: "Ho Chi Minh",
          full_name: "Thành phố Hồ Chí Minh",
          full_name_en: "Ho Chi Minh City",
          code_name: "ho_chi_minh",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: "550e8400-e29b-41d4-a716-446655440003",
          code: "03",
          name: "Đà Nẵng",
          name_en: "Da Nang",
          full_name: "Thành phố Đà Nẵng",
          full_name_en: "Da Nang City",
          code_name: "da_nang",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: "550e8400-e29b-41d4-a716-446655440004",
          code: "04",
          name: "Hải Phòng",
          name_en: "Hai Phong",
          full_name: "Thành phố Hải Phòng",
          full_name_en: "Hai Phong City",
          code_name: "hai_phong",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: "550e8400-e29b-41d4-a716-446655440005",
          code: "05",
          name: "Cần Thơ",
          name_en: "Can Tho",
          full_name: "Thành phố Cần Thơ",
          full_name_en: "Can Tho City",
          code_name: "can_tho",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: "550e8400-e29b-41d4-a716-446655440006",
          code: "06",
          name: "An Giang",
          name_en: "An Giang",
          full_name: "Tỉnh An Giang",
          full_name_en: "An Giang Province",
          code_name: "an_giang",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: "550e8400-e29b-41d4-a716-446655440007",
          code: "07",
          name: "Bà Rịa - Vũng Tàu",
          name_en: "Ba Ria - Vung Tau",
          full_name: "Tỉnh Bà Rịa - Vũng Tàu",
          full_name_en: "Ba Ria - Vung Tau Province",
          code_name: "ba_ria_vung_tau",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: "550e8400-e29b-41d4-a716-446655440008",
          code: "08",
          name: "Bắc Giang",
          name_en: "Bac Giang",
          full_name: "Tỉnh Bắc Giang",
          full_name_en: "Bac Giang Province",
          code_name: "bac_giang",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: "550e8400-e29b-41d4-a716-446655440009",
          code: "09",
          name: "Bắc Kạn",
          name_en: "Bac Kan",
          full_name: "Tỉnh Bắc Kạn",
          full_name_en: "Bac Kan Province",
          code_name: "bac_kan",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: "550e8400-e29b-41d4-a716-446655440010",
          code: "10",
          name: "Bạc Liêu",
          name_en: "Bac Lieu",
          full_name: "Tỉnh Bạc Liêu",
          full_name_en: "Bac Lieu Province",
          code_name: "bac_lieu",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ],
    });
  }),
];

export default dopHandlers;
