export const MOCK_CONSENT_ID = "consent-123e4567";
export const MOCK_CONTROLLER_ID = "dop-system";
export const MOCK_PROCESSOR_ID = "dop-system";
export const MOCK_CONSENT_VERSION_ID = "v1";
export const MOCK_SOURCE = "credit_card_loan_application";
export const MOCK_LEAD_ID = "lead-987f6543";

export const MOCK_DATA_CATEGORY_PERSONAL = "cat-personal-data";
export const MOCK_DATA_CATEGORY_FINANCIAL = "cat-financial-data";
export const MOCK_DATA_CATEGORY_CONTACT = "cat-contact-data";

export const VALID_CONSENT_CREATE_REQUEST = {
  controller_id: MOCK_CONTROLLER_ID,
  processor_id: MOCK_PROCESSOR_ID,
  lead_id: MOCK_LEAD_ID,
  consent_version_id: MOCK_CONSENT_VERSION_ID,
  source: MOCK_SOURCE,
  action: "grant",
};

export const VALID_CONSENT_DATA_CATEGORY_REQUEST = {
  consent_id: MOCK_CONSENT_ID,
  data_category_id: MOCK_DATA_CATEGORY_PERSONAL,
};

export const VALID_CONSENT_LOG_REQUEST = {
  consent_id: MOCK_CONSENT_ID,
  action: "grant",
  action_by: "user@example.com",
  source: MOCK_SOURCE,
};

export const MOCK_CONSENT_RESPONSE = {
  id: MOCK_CONSENT_ID,
  controller_id: MOCK_CONTROLLER_ID,
  processor_id: MOCK_PROCESSOR_ID,
  lead_id: MOCK_LEAD_ID,
  consent_version_id: MOCK_CONSENT_VERSION_ID,
  source: MOCK_SOURCE,
  action: "grant",
  created_at: new Date("2025-01-24T00:00:00Z").toISOString(),
  updated_at: new Date("2025-01-24T00:00:00Z").toISOString(),
};

export const MOCK_CONSENT_DATA_CATEGORY_RESPONSE = {
  id: "data-cat-1",
  consent_id: MOCK_CONSENT_ID,
  data_category_id: MOCK_DATA_CATEGORY_PERSONAL,
  created_at: new Date("2025-01-24T00:00:00Z").toISOString(),
};

export const MOCK_CONSENT_LOG_RESPONSE = {
  id: "log-1",
  consent_id: MOCK_CONSENT_ID,
  action: "grant",
  action_by: "user@example.com",
  source: MOCK_SOURCE,
  created_at: new Date("2025-01-24T00:00:00Z").toISOString(),
};

export const MULTIPLE_CONSENT_DATA_CATEGORIES = [
  {
    consent_id: MOCK_CONSENT_ID,
    data_category_id: MOCK_DATA_CATEGORY_PERSONAL,
  },
  {
    consent_id: MOCK_CONSENT_ID,
    data_category_id: MOCK_DATA_CATEGORY_FINANCIAL,
  },
  {
    consent_id: MOCK_CONSENT_ID,
    data_category_id: MOCK_DATA_CATEGORY_CONTACT,
  },
];

export function createErrorResponse(
  statusCode: number,
  message: string,
): Response {
  return new Response(JSON.stringify({ error: message }), {
    status: statusCode,
    headers: {
      "Content-Type": "application/json",
    },
  });
}

export const CONSENT_TEST_SCENARIOS = {
  HAPPY_PATH: {
    consentRequest: VALID_CONSENT_CREATE_REQUEST,
    consentResponse: MOCK_CONSENT_RESPONSE,
    dataCategories: MULTIPLE_CONSENT_DATA_CATEGORIES,
    expectedStatus: 200,
  },

  TIMEOUT: {
    statusCode: 504,
    message: "Gateway Timeout",
  },

  UNAVAILABLE: {
    statusCode: 503,
    message: "Service Unavailable",
  },

  UNAUTHORIZED: {
    statusCode: 401,
    message: "Unauthorized",
  },

  FORBIDDEN: {
    statusCode: 403,
    message: "Forbidden",
  },

  NOT_FOUND: {
    statusCode: 404,
    message: "Not Found",
  },

  INTERNAL_ERROR: {
    statusCode: 500,
    message: "Internal Server Error",
  },
} as const;

export type ConsentTestScenario = keyof typeof CONSENT_TEST_SCENARIOS;
