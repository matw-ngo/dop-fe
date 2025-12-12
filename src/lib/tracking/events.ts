import type { TrackingEvent, EventType } from "./types";
import { DEFAULT_TRACKING_CONFIG, TRACKING_ENDPOINTS } from "./config";
import { filterSensitiveData, isEventAllowed } from "./privacy";
import { getSessionId, getDeviceId, updateLastActivity } from "./session";

/**
 * Event tracking utilities for financial tools
 */

/**
 * Send tracking event to analytics endpoint
 */
const sendTrackingEvent = async (event: TrackingEvent): Promise<void> => {
  try {
    // In a real implementation, you would send this to your analytics API
    // For now, we'll just log it for debugging
    if (process.env.NODE_ENV === "development") {
      console.log("Tracking event:", event);
    }

    // Example API call (commented out for now):
    /*
    await fetch(`${DEFAULT_TRACKING_CONFIG.apiBaseUrl}${TRACKING_ENDPOINTS.EVENT}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(event),
    });
    */
  } catch (error) {
    console.error("Failed to send tracking event:", error);
  }
};

/**
 * Track an event with privacy checks
 */
export const trackEvent = async (
  eventType: EventType,
  data: Record<string, any> = {},
): Promise<void> => {
  // Check if tracking is enabled
  if (!DEFAULT_TRACKING_CONFIG.enabled) {
    return;
  }

  // Check if event type is allowed
  if (
    !isEventAllowed(eventType, DEFAULT_TRACKING_CONFIG.privacy.allowedEvents)
  ) {
    return;
  }

  // Get session information
  const sessionId = getSessionId();
  if (!sessionId) {
    // No active session, don't track
    return;
  }

  // Update last activity
  updateLastActivity();

  // Filter sensitive data
  const filteredData = filterSensitiveData(data);

  // Create tracking event
  const event: TrackingEvent = {
    sessionId,
    deviceId: getDeviceId(),
    event: eventType,
    data: filteredData,
    service: DEFAULT_TRACKING_CONFIG.serviceName,
    timestamp: Date.now(),
  };

  // Send event
  await sendTrackingEvent(event);
};

/**
 * Tool-specific tracking functions
 */

/**
 * Track savings calculator events
 */
export const trackSavingsCalculator = {
  pageView: async (data?: { source?: string }) => {
    await trackEvent("tool_savings_page_view", data);
  },

  filterChange: async (filters: {
    amount?: number;
    period?: number;
    type?: string;
  }) => {
    await trackEvent("tool_savings_filter_change", {
      hasAmount: !!filters.amount,
      hasPeriod: !!filters.period,
      hasType: !!filters.type,
      type: filters.type,
    });
  },

  calculate: async (params: {
    amount: number;
    period: number;
    type: string;
  }) => {
    await trackEvent("tool_savings_calculate", {
      amountRange: getAmountRange(params.amount),
      periodRange: getPeriodRange(params.period),
      type: params.type,
    });
  },

  sortChange: async (sortBy: string) => {
    await trackEvent("tool_savings_sort_change", { sortBy });
  },

  clickOpenAccount: async (bankName: string) => {
    await trackEvent("tool_savings_click_open_account", { bankName });
  },
};

/**
 * Track loan calculator events
 */
export const trackLoanCalculator = {
  pageView: async () => {
    await trackEvent("tool_loan_page_view");
  },

  inputAmount: async (amount: number) => {
    await trackEvent("tool_loan_input_amount", {
      amountRange: getAmountRange(amount),
    });
  },

  inputPeriod: async (period: number) => {
    await trackEvent("tool_loan_input_period", {
      periodRange: getPeriodRange(period),
    });
  },

  inputRate: async (rate: number) => {
    await trackEvent("tool_loan_input_rate", {
      rateRange: getRateRange(rate),
    });
  },

  calculate: async (params: {
    amount: number;
    period: number;
    rate: number;
  }) => {
    await trackEvent("tool_loan_calculate", {
      amountRange: getAmountRange(params.amount),
      periodRange: getPeriodRange(params.period),
      rateRange: getRateRange(params.rate),
    });
  },

  formSubmit: async (params: {
    amount: number;
    period: number;
    rate: number;
    monthlyPayment?: number;
  }) => {
    await trackEvent("tool_loan_form_submit", {
      amountRange: getAmountRange(params.amount),
      periodRange: getPeriodRange(params.period),
      rateRange: getRateRange(params.rate),
      hasMonthlyPayment: !!params.monthlyPayment,
    });
  },
};

/**
 * Track salary calculator events
 */
export const trackSalaryCalculator = {
  pageView: async () => {
    await trackEvent("tool_salary_page_view");
  },

  grossToNetView: async () => {
    await trackEvent("tool_salary_gross_to_net_view");
  },

  netToGrossView: async () => {
    await trackEvent("tool_salary_net_to_gross_view");
  },

  inputAmount: async (amount: number, type: "gross" | "net") => {
    await trackEvent("tool_salary_input_amount", {
      amountRange: getAmountRange(amount),
      type,
    });
  },

  inputDependents: async (dependents: number) => {
    await trackEvent("tool_salary_input_dependents", {
      dependentsRange:
        dependents === 0 ? "none" : dependents <= 2 ? "few" : "many",
    });
  },

  selectRegion: async (region: string) => {
    await trackEvent("tool_salary_select_region", { region });
  },

  calculate: async (params: {
    amount: number;
    type: "gross" | "net";
    dependents?: number;
    region?: string;
  }) => {
    await trackEvent("tool_salary_calculate", {
      amountRange: getAmountRange(params.amount),
      type: params.type,
      hasDependents: !!params.dependents,
      hasRegion: !!params.region,
    });
  },
};

/**
 * Helper functions to categorize numeric values
 */
function getAmountRange(amount: number): string {
  if (amount < 1000000) return "under-1m";
  if (amount < 10000000) return "1m-10m";
  if (amount < 100000000) return "10m-100m";
  if (amount < 1000000000) return "100m-1b";
  return "over-1b";
}

function getPeriodRange(period: number): string {
  if (period < 6) return "under-6m";
  if (period < 12) return "6m-12m";
  if (period < 36) return "1y-3y";
  if (period < 60) return "3y-5y";
  return "over-5y";
}

function getRateRange(rate: number): string {
  if (rate < 5) return "under-5%";
  if (rate < 10) return "5-10%";
  if (rate < 15) return "10-15%";
  if (rate < 20) return "15-20%";
  return "over-20%";
}

/**
 * Generic tracking functions
 */
export const trackGeneric = {
  pageView: async (page: string, data?: Record<string, any>) => {
    await trackEvent("page_view", { page, ...data });
  },

  filterChange: async (filterName: string, value: any) => {
    await trackEvent("filter_change", { filterName, value });
  },

  calculationPerformed: async (
    calculatorType: string,
    params: Record<string, any>,
  ) => {
    await trackEvent("calculation_performed", { calculatorType, ...params });
  },

  formSubmit: async (formName: string, data: Record<string, any>) => {
    await trackEvent("form_submit", { formName, ...filterSensitiveData(data) });
  },

  formFieldChange: async (fieldName: string, value: any) => {
    await trackEvent("form_field_change", { fieldName, hasValue: !!value });
  },
};

/**
 * Track loan application events
 */
export const trackLoanApplication = {
  pageView: async () => {
    await trackEvent("lending_page_view");
  },

  inputExpectedAmount: async (amount: number) => {
    await trackEvent("lending_page_input_expected_amount", {
      amountRange: getAmountRange(amount),
    });
  },

  inputPurpose: async (purpose: string) => {
    await trackEvent("lending_page_input_purpose", { purpose });
  },

  inputPhoneNumber: async (phoneNumber: string) => {
    await trackEvent("lending_page_input_phone_number", {
      hasPhone: !!phoneNumber,
    });
  },

  phoneNumberValid: async (phoneNumber: string, telco: string) => {
    await trackEvent("lending_page_input_phone_number_valid", {
      telco,
    });
  },

  formSubmit: async (data: {
    amount: number;
    purpose: string;
    phoneNumber: string;
  }) => {
    await trackEvent("lending_page_form_submit", {
      amountRange: getAmountRange(data.amount),
      purpose: data.purpose,
      telco: data.phoneNumber,
    });
  },
};
