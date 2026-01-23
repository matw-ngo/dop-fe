/**
 * MSW Handlers for Consent Service API
 *
 * Mock handlers for consent API endpoints based on src/lib/api/v1/consent.d.ts
 * These handlers support testing scenarios including success, error, and edge cases.
 */

import { http } from "msw";

const BASE_URL = "/consent/v1";

/**
 * Generate a mock consent object
 */
const createMockConsent = (overrides?: Record<string, unknown>) => ({
  id: "550e8400-e29b-41d4-a716-446655440000",
  controller_id: "660e8400-e29b-41d4-a716-446655440001",
  processor_id: "770e8400-e29b-41d4-a716-446655440002",
  lead_id: "880e8400-e29b-41d4-a716-446655440003",
  consent_version_id: "990e8400-e29b-41d4-a716-446655440004",
  source: "web",
  action: "grant",
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  ...overrides,
});

/**
 * Generate a mock consent list response
 */
const createMockConsentList = (count: number = 5) => ({
  consents: Array.from({ length: count }, (_, i) =>
    createMockConsent({
      id: `550e8400-e29b-41d4-a716-44665544000${i}`,
      action: ["grant", "revoke", "update"][i % 3],
    }),
  ),
  pagination: {
    page: 1,
    page_size: 10,
    total_count: count,
  },
});

/**
 * Generate error response
 */
const createErrorResponse = (code: string, message: string) => ({
  code,
  message,
});

export const consentHandlers = [
  /**
   * GET /consent - Search consents
   * Search and filter consents with multiple criteria
   */
  http.get(`${BASE_URL}/consent`, ({ request }) => {
    const url = new URL(request.url);
    const search = url.searchParams.get("search");
    const action = url.searchParams.get("action");
    const page = url.searchParams.get("page");
    const pageSize = url.searchParams.get("page_size");

    const scenario = request.headers.get("x-test-scenario") || "success";

    switch (scenario) {
      case "empty":
        return Response.json({
          consents: [],
          pagination: { page: 1, page_size: 10, total_count: 0 },
        });

      case "not_found":
        return Response.json(
          createErrorResponse(
            "not_found",
            "No consents found matching criteria",
          ),
          { status: 404 },
        );

      case "success":
      default: {
        const count = parseInt(pageSize || "10", 10);
        return Response.json(createMockConsentList(count));
      }
    }
  }),

  /**
   * POST /consent - Create consent
   * Create a new consent record
   */
  http.post(`${BASE_URL}/consent`, async ({ request }) => {
    const scenario = request.headers.get("x-test-scenario") || "success";

    switch (scenario) {
      case "validation_error":
        return Response.json(
          createErrorResponse("invalid_argument", "Missing required fields"),
          { status: 400 },
        );

      case "unauthorized":
        return Response.json(
          createErrorResponse("unauthenticated", "Authentication required"),
          { status: 401 },
        );

      case "forbidden":
        return Response.json(
          createErrorResponse("permission_denied", "Access denied"),
          { status: 403 },
        );

      case "success":
      default: {
        const body = await request.json();
        return Response.json(createMockConsent(body), { status: 201 });
      }
    }
  }),

  /**
   * GET /consent/{id} - Get consent by ID
   * Get a consent by ID
   */
  http.get(`${BASE_URL}/consent/:id`, ({ params, request }) => {
    const { id } = params;
    const scenario = request.headers.get("x-test-scenario") || "success";

    switch (scenario) {
      case "not_found":
        return Response.json(
          createErrorResponse("not_found", `Consent ${id} not found`),
          { status: 404 },
        );

      case "unauthorized":
        return Response.json(
          createErrorResponse("unauthenticated", "Authentication required"),
          { status: 401 },
        );

      case "forbidden":
        return Response.json(
          createErrorResponse("permission_denied", "Access denied"),
          { status: 403 },
        );

      case "success":
      default:
        return Response.json(createMockConsent({ id: id as string }));
    }
  }),

  /**
   * DELETE /consent/{id} - Delete consent
   * Delete a consent by ID
   */
  http.delete(`${BASE_URL}/consent/:id`, ({ params, request }) => {
    const { id } = params;
    const scenario = request.headers.get("x-test-scenario") || "success";

    switch (scenario) {
      case "not_found":
        return Response.json(
          createErrorResponse("not_found", `Consent ${id} not found`),
          { status: 404 },
        );

      case "forbidden":
        return Response.json(
          createErrorResponse("permission_denied", "Cannot delete consent"),
          { status: 403 },
        );

      case "success":
      default:
        return Response.json({
          success: true,
          message: "Consent deleted successfully",
        });
    }
  }),

  /**
   * PATCH /consent/{id} - Update consent
   * Update an existing consent by id
   */
  http.patch(`${BASE_URL}/consent/:id`, async ({ params, request }) => {
    const { id } = params;
    const scenario = request.headers.get("x-test-scenario") || "success";

    switch (scenario) {
      case "validation_error":
        return Response.json(
          createErrorResponse("invalid_argument", "Invalid update data"),
          { status: 400 },
        );

      case "not_found":
        return Response.json(
          createErrorResponse("not_found", `Consent ${id} not found`),
          { status: 404 },
        );

      case "success":
      default: {
        const body = await request.json();
        return Response.json({
          ...createMockConsent({ id: id as string }),
          ...body,
          updated_at: new Date().toISOString(),
        });
      }
    }
  }),

  /**
   * GET /consent-version - Search consent versions
   */
  http.get(`${BASE_URL}/consent-version`, ({ request }) => {
    const scenario = request.headers.get("x-test-scenario") || "success";

    if (scenario === "empty") {
      return Response.json({
        consent_versions: [],
        pagination: { page: 1, page_size: 10, total_count: 0 },
      });
    }

    return Response.json({
      consent_versions: [
        {
          id: "110e8400-e29b-41d4-a716-446655440001",
          consent_purpose_id: "220e8400-e29b-41d4-a716-446655440002",
          version: 1,
          content: "Consent terms and conditions...",
          document_url: "https://example.com/consent/v1.pdf",
          effective_date: "2024-01-01T00:00:00Z",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ],
      pagination: { page: 1, page_size: 10, total_count: 1 },
    });
  }),

  /**
   * POST /consent-version - Create consent version
   */
  http.post(`${BASE_URL}/consent-version`, async ({ request }) => {
    const scenario = request.headers.get("x-test-scenario") || "success";

    if (scenario === "unauthorized") {
      return Response.json(
        createErrorResponse("unauthenticated", "Authentication required"),
        { status: 401 },
      );
    }

    const body = await request.json();
    return Response.json(
      {
        id: "330e8400-e29b-41d4-a716-446655440003",
        ...body,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      { status: 201 },
    );
  }),

  /**
   * GET /consent-log - Search consent logs
   */
  http.get(`${BASE_URL}/consent-log`, ({ request }) => {
    const scenario = request.headers.get("x-test-scenario") || "success";

    if (scenario === "empty") {
      return Response.json({
        consent_logs: [],
        pagination: { page: 1, page_size: 10, total_count: 0 },
      });
    }

    return Response.json({
      consent_logs: [
        {
          id: "440e8400-e29b-41d4-a716-446655440004",
          consent_id: "550e8400-e29b-41d4-a716-446655440000",
          action: "grant",
          action_by: "user1",
          source: "web",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ],
      pagination: { page: 1, page_size: 10, total_count: 1 },
    });
  }),

  /**
   * POST /consent-log - Create consent log
   */
  http.post(`${BASE_URL}/consent-log`, async ({ request }) => {
    const scenario = request.headers.get("x-test-scenario") || "success";

    if (scenario === "validation_error") {
      return Response.json(
        createErrorResponse("invalid_argument", "Missing required fields"),
        { status: 400 },
      );
    }

    const body = await request.json();
    return Response.json(
      {
        id: "550e8400-e29b-41d4-a716-446655440005",
        ...body,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      { status: 201 },
    );
  }),

  /**
   * GET /consent-purpose - Search consent purposes
   */
  http.get(`${BASE_URL}/consent-purpose`, ({ request }) => {
    const scenario = request.headers.get("x-test-scenario") || "success";

    if (scenario === "empty") {
      return Response.json({
        purposes: [],
        pagination: { page: 1, page_size: 10, total_count: 0 },
      });
    }

    return Response.json({
      purposes: [
        {
          id: "660e8400-e29b-41d4-a716-446655440006",
          name: "Analytics",
          controller_id: "770e8400-e29b-41d4-a716-446655440007",
          purpose: "Tracking and analytics",
          retention_days: 365,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ],
      pagination: { page: 1, page_size: 10, total_count: 1 },
    });
  }),

  /**
   * GET /consent-data-category - Search consent data categories
   */
  http.get(`${BASE_URL}/consent-data-category`, ({ request }) => {
    const scenario = request.headers.get("x-test-scenario") || "success";

    if (scenario === "empty") {
      return Response.json({
        consent_data_categories: [],
        pagination: { page: 1, page_size: 10, total_count: 0 },
      });
    }

    return Response.json({
      consent_data_categories: [
        {
          id: "770e8400-e29b-41d4-a716-446655440008",
          consent_id: "880e8400-e29b-41d4-a716-446655440009",
          data_category_id: "990e8400-e29b-41d4-a716-446655440010",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ],
      pagination: { page: 1, page_size: 10, total_count: 1 },
    });
  }),
];

export default consentHandlers;
