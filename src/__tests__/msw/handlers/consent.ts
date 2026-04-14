/**
 * MSW Handlers for Consent Service API
 *
 * Mock handlers for consent API endpoints based on src/lib/api/v1/consent.d.ts
 * These handlers support testing scenarios including success, error, and edge cases.
 */

import { http } from "msw";
import { mswStore } from "../../../mocks/store";

const BASE_URL = "*/consent";

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
    const _search = url.searchParams.get("search");
    const _action = url.searchParams.get("action");
    const _page = url.searchParams.get("page");
    const pageSize = url.searchParams.get("page_size");

    const scenario = request.headers.get("x-test-scenario") || "success";

    switch (scenario) {
      case "empty":
        return mswJson({
          consents: [],
          pagination: { page: 1, page_size: 10, total_count: 0 },
        });

      case "not_found":
        return mswJson(
          createErrorResponse(
            "not_found",
            "No consents found matching criteria",
          ),
          { status: 404 },
        );
      default: {
        const count = parseInt(pageSize || "10", 10);
        const storeData = mswStore.getMockData();
        let consents = storeData.consents;

        // Apply filtering based on query params
        if (_search) {
          consents = consents.filter((c) =>
            JSON.stringify(c).toLowerCase().includes(_search.toLowerCase()),
          );
        }

        const sessionId = url.searchParams.get("session_id");
        if (sessionId) {
          consents = consents.filter((c) => c.session_id === sessionId);
        }

        if (_action) {
          consents = consents.filter((c) => c.action === _action);
        }

        // We DO NOT seed default data that trips up session-based checks.
        // If they want to test the consent flow, they should start clean and create a real consent.
        return mswJson({
          consents: consents.slice(0, count),
          pagination: {
            page: 1,
            page_size: count,
            total_count: consents.length,
          },
        });
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
        return mswJson(
          createErrorResponse("invalid_argument", "Missing required fields"),
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
      default: {
        const body = await request.json();
        const newConsent = createMockConsent(
          body && typeof body === "object" ? body : {},
        );
        mswStore.updateMockData((data) => ({
          ...data,
          consents: [newConsent, ...data.consents],
        }));
        return mswJson(newConsent, { status: 201 });
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
        return mswJson(
          createErrorResponse("not_found", `Consent ${id} not found`),
          { status: 404 },
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
      default: {
        const storeData = mswStore.getMockData();
        const consent = storeData.consents.find((c) => c.id === id);
        return mswJson(consent || createMockConsent({ id: id as string }));
      }
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
      case "validation_error":
        return mswJson(
          createErrorResponse("invalid_argument", "Missing consent_id"),
          { status: 400 },
        );

      case "not_found":
        return mswJson(createErrorResponse("not_found", "Consent not found"), {
          status: 404,
        });
      default: {
        let deletedConsent: Record<string, unknown> | undefined;
        mswStore.updateMockData((data) => {
          deletedConsent =
            data.consents.find((c) => c.id === id) ||
            createMockConsent({ id: id as string });
          return {
            ...data,
            consents: data.consents.filter((c) => c.id !== id),
          };
        });
        return mswJson(deletedConsent);
      }
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
        return mswJson(
          createErrorResponse("invalid_argument", "Invalid update data"),
          { status: 400 },
        );

      case "not_found":
        return mswJson(
          createErrorResponse("not_found", `Consent ${id} not found`),
          { status: 404 },
        );
      default: {
        const body = await request.json();
        let updatedConsent: Record<string, unknown> | undefined;
        mswStore.updateMockData((data) => {
          const existing =
            data.consents.find((c) => c.id === id) ||
            createMockConsent({ id: id as string });
          updatedConsent = {
            ...existing,
            ...(body && typeof body === "object" ? body : {}),
            updated_at: new Date().toISOString(),
          };

          let exists = false;
          const nextConsents = data.consents.map((c) => {
            if (c.id === id) {
              exists = true;
              return updatedConsent;
            }
            return c;
          });

          if (!exists) {
            nextConsents.push(updatedConsent);
          }

          return {
            ...data,
            consents: nextConsents,
          };
        });
        return mswJson(updatedConsent);
      }
    }
  }),

  /**
   * GET /consent-version - Search consent versions
   */
  http.get(`${BASE_URL}/consent-version`, ({ request }) => {
    const url = new URL(request.url);
    const consentPurposeId = url.searchParams.get("consent_purpose_id");
    const scenario = request.headers.get("x-test-scenario") || "success";

    console.log("[MSW] Consent Version Request:", {
      consentPurposeId,
      scenario,
    });

    if (scenario === "empty") {
      return mswJson({
        consent_versions: [],
        pagination: { page: 1, page_size: 10, total_count: 0 },
      });
    }

    const storeData = mswStore.getMockData();

    // Filter versions by purpose id if provided
    let versions = storeData.consentVersions;
    if (consentPurposeId) {
      versions = versions.filter(
        (v) => v.consent_purpose_id === consentPurposeId,
      );
    }

    return mswJson({
      consent_versions: versions,
      pagination: { page: 1, page_size: 10, total_count: versions.length },
    });
  }),

  /**
   * POST /consent-version - Create consent version
   */
  http.post(`${BASE_URL}/consent-version`, async ({ request }) => {
    const scenario = request.headers.get("x-test-scenario") || "success";

    if (scenario === "unauthorized") {
      return mswJson(
        createErrorResponse("unauthenticated", "Authentication required"),
        { status: 401 },
      );
    }

    const body = await request.json();
    const newVersion = {
      id: `version-${Date.now()}`,
      ...(typeof body === "object" && body !== null ? body : {}),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    mswStore.updateMockData((data) => ({
      ...data,
      consentVersions: [newVersion, ...data.consentVersions],
    }));

    return mswJson(newVersion, { status: 201 });
  }),

  /**
   * GET /consent-log - Search consent logs
   */
  http.get(`${BASE_URL}/consent-log`, ({ request }) => {
    const scenario = request.headers.get("x-test-scenario") || "success";

    if (scenario === "empty") {
      return mswJson({
        consent_logs: [],
        pagination: { page: 1, page_size: 10, total_count: 0 },
      });
    }

    const storeData = mswStore.getMockData();
    const logs = storeData.consentLogs;

    return mswJson({
      consent_logs: logs,
      pagination: { page: 1, page_size: 10, total_count: logs.length },
    });
  }),

  /**
   * POST /consent-log - Create consent log
   */
  http.post(`${BASE_URL}/consent-log`, async ({ request }) => {
    const scenario = request.headers.get("x-test-scenario") || "success";

    switch (scenario) {
      case "validation_error":
        return mswJson(
          createErrorResponse("invalid_argument", "Missing required fields"),
          { status: 400 },
        );
      default: {
        const body = await request.json();
        const newLog = {
          id: `log-${Date.now()}`,
          ...(body && typeof body === "object" ? body : {}),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        mswStore.updateMockData((data) => ({
          ...data,
          consentLogs: [newLog, ...data.consentLogs],
        }));

        return mswJson(newLog, { status: 201 });
      }
    }
  }),

  /**
   * GET /consent-purpose - Search consent purposes
   */
  http.get(`${BASE_URL}/consent-purpose`, ({ request }) => {
    const scenario = request.headers.get("x-test-scenario") || "success";

    if (scenario === "empty") {
      return mswJson({
        purposes: [],
        pagination: { page: 1, page_size: 10, total_count: 0 },
      });
    }

    const storeData = mswStore.getMockData();
    const purposes = storeData.consentPurposes;

    return mswJson({
      purposes: purposes,
      pagination: { page: 1, page_size: 10, total_count: purposes.length },
    });
  }),

  /**
   * GET /consent-purpose/{id} - Get consent purpose by ID
   */
  http.get(`${BASE_URL}/consent-purpose/:id`, ({ params, request }) => {
    const { id } = params;
    const scenario = request.headers.get("x-test-scenario") || "success";

    switch (scenario) {
      case "not_found":
        return mswJson(
          createErrorResponse("not_found", `Consent Purpose ${id} not found`),
          { status: 404 },
        );
      default: {
        const storeData = mswStore.getMockData();
        const purpose = storeData.consentPurposes.find((p) => p.id === id);

        return mswJson(
          purpose || {
            id: id as string,
            tenant_id: "00000000-0000-0000-0000-000000000000",
            name: "Default Purpose",
            controller_id: "770e8400-e29b-41d4-a716-446655440007",
            purpose: "Default Purpose Description",
            retention_days: 365,
            latest_version_id: `version-${Date.now()}`,
            latest_version: 1,
            latest_content: "This is a fallback mock consent purpose content.",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        );
      }
    }
  }),

  /**
   * GET /data-category - Search all available data categories
   */
  http.get(`${BASE_URL}/data-category`, ({ request }) => {
    const url = new URL(request.url);
    const scenario = request.headers.get("x-test-scenario") || "success";
    const page = parseInt(url.searchParams.get("page") || "1", 10);
    const pageSize = parseInt(url.searchParams.get("page_size") || "10", 10);

    if (scenario === "empty") {
      return mswJson({
        categories: [],
        pagination: { page, page_size: pageSize, total_count: 0 },
      });
    }

    const storeData = mswStore.getMockData();
    let categories = storeData.dataCategories;

    // Apply pagination
    const startIndex = (page - 1) * pageSize;
    const paginatedCategories = categories.slice(
      startIndex,
      startIndex + pageSize,
    );

    return mswJson({
      categories: paginatedCategories,
      pagination: {
        page,
        page_size: pageSize,
        total_count: categories.length,
      },
    });
  }),

  /**
   * GET /consent-data-category - Search consent data categories (linked to a consent)
   */
  http.get(`${BASE_URL}/consent-data-category`, ({ request }) => {
    const url = new URL(request.url);
    const scenario = request.headers.get("x-test-scenario") || "success";
    const page = parseInt(url.searchParams.get("page") || "1", 10);
    const pageSize = parseInt(url.searchParams.get("page_size") || "10", 10);
    const consentPurposeId = url.searchParams.get("consent_purpose_id");

    if (scenario === "empty") {
      return mswJson({
        consent_data_categories: [],
        pagination: { page, page_size: pageSize, total_count: 0 },
      });
    }

    const storeData = mswStore.getMockData();
    let categories = storeData.consentDataCategories;

    // Filter by consent_purpose_id if provided
    if (consentPurposeId) {
      // Mock implementation: return mock data categories for this purpose
      categories = categories.filter(
        (cat) => cat.consent_purpose_id === consentPurposeId,
      );
    }

    // Apply pagination
    const startIndex = (page - 1) * pageSize;
    const paginatedCategories = categories.slice(
      startIndex,
      startIndex + pageSize,
    );

    return mswJson({
      consent_data_categories: paginatedCategories,
      pagination: {
        page,
        page_size: pageSize,
        total_count: categories.length,
      },
    });
  }),

  /**
   * POST /consent-data-category - Create consent data category
   * Link a data category to a consent record
   */
  http.post(`${BASE_URL}/consent-data-category`, async ({ request }) => {
    const scenario = request.headers.get("x-test-scenario") || "success";
    const body = await request.json();

    const _bodyHasConsentId =
      typeof body === "object" && body !== null && "consent_id" in body;
    const _bodyHasDataCategoryId =
      typeof body === "object" && body !== null && "data_category_id" in body;

    switch (scenario) {
      case "validation_error":
        return mswJson(
          createErrorResponse(
            "invalid_argument",
            "Missing consent_id or data_category_id",
          ),
          { status: 400 },
        );

      case "not_found":
        return mswJson(createErrorResponse("not_found", "Consent not found"), {
          status: 404,
        });
      default: {
        const newCategory = {
          id: `cat-${Date.now()}`,
          consent_id:
            body && typeof body === "object" && body.consent_id
              ? body.consent_id
              : "consent_id",
          data_category_id:
            body && typeof body === "object" && body.data_category_id
              ? body.data_category_id
              : "data_category_id",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        mswStore.updateMockData((data) => ({
          ...data,
          consentDataCategories: [newCategory, ...data.consentDataCategories],
        }));

        return mswJson(newCategory, { status: 201 });
      }
    }
  }),
];

export default consentHandlers;
