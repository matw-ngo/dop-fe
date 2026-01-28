import { DEFAULT_TRACKING_CONFIG } from "./config";
import { filterSensitiveData, isEventAllowed } from "./privacy";
import { getDeviceId, getSessionId, updateLastActivity } from "./session";
import { EventType, TrackingEvent } from "./types";

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
    await trackEvent(EventType.TOOL_SAVINGS_PAGE_VIEW, data);
  },

  filterChange: async (filters: {
    amount?: number;
    period?: number;
    type?: string;
  }) => {
    await trackEvent(EventType.TOOL_SAVINGS_FILTER_CHANGE, {
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
    await trackEvent(EventType.TOOL_SAVINGS_CALCULATE, {
      amountRange: getAmountRange(params.amount),
      periodRange: getPeriodRange(params.period),
      type: params.type,
    });
  },

  sortChange: async (sortBy: string) => {
    await trackEvent(EventType.TOOL_SAVINGS_SORT_CHANGE, { sortBy });
  },

  clickOpenAccount: async (bankName: string) => {
    await trackEvent(EventType.TOOL_SAVINGS_CLICK_OPEN_ACCOUNT, { bankName });
  },
};

/**
 * Track loan calculator events
 */
export const trackLoanCalculator = {
  pageView: async () => {
    await trackEvent(EventType.TOOL_LOAN_PAGE_VIEW);
  },

  inputAmount: async (amount: number) => {
    await trackEvent(EventType.TOOL_LOAN_INPUT_AMOUNT, {
      amountRange: getAmountRange(amount),
    });
  },

  inputPeriod: async (period: number) => {
    await trackEvent(EventType.TOOL_LOAN_INPUT_PERIOD, {
      periodRange: getPeriodRange(period),
    });
  },

  inputRate: async (rate: number) => {
    await trackEvent(EventType.TOOL_LOAN_INPUT_RATE, {
      rateRange: getRateRange(rate),
    });
  },

  calculate: async (params: {
    amount: number;
    period: number;
    rate: number;
  }) => {
    await trackEvent(EventType.TOOL_LOAN_CALCULATE, {
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
    await trackEvent(EventType.TOOL_LOAN_FORM_SUBMIT, {
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
    await trackEvent(EventType.TOOL_SALARY_PAGE_VIEW);
  },

  grossToNetView: async () => {
    await trackEvent(EventType.TOOL_SALARY_GROSS_TO_NET_VIEW);
  },

  netToGrossView: async () => {
    await trackEvent(EventType.TOOL_SALARY_NET_TO_GROSS_VIEW);
  },

  inputAmount: async (amount: number, type: "gross" | "net") => {
    await trackEvent(EventType.TOOL_SALARY_INPUT_AMOUNT, {
      amountRange: getAmountRange(amount),
      type,
    });
  },

  inputDependents: async (dependents: number) => {
    await trackEvent(EventType.TOOL_SALARY_INPUT_DEPENDENTS, {
      dependentsRange:
        dependents === 0 ? "none" : dependents <= 2 ? "few" : "many",
    });
  },

  selectRegion: async (region: string) => {
    await trackEvent(EventType.TOOL_SALARY_SELECT_REGION, { region });
  },

  calculate: async (params: {
    amount: number;
    type: "gross" | "net";
    dependents?: number;
    region?: string;
  }) => {
    await trackEvent(EventType.TOOL_SALARY_CALCULATE, {
      amountRange: getAmountRange(params.amount),
      type: params.type,
      hasDependents: !!params.dependents,
      hasRegion: !!params.region,
    });
  },

  formSubmit: async (data?: TrackingEvent) => {
    await trackEvent(EventType.TOOL_SALARY_FORM_SUBMIT, data);
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
    await trackEvent(EventType.PAGE_VIEW, { page, ...data });
  },

  filterChange: async (filterName: string, value: any) => {
    await trackEvent(EventType.FILTER_CHANGE, { filterName, value });
  },

  calculationPerformed: async (
    calculatorType: string,
    params: Record<string, any>,
  ) => {
    await trackEvent(EventType.CALCULATION_PERFORMED, {
      calculatorType,
      ...params,
    });
  },

  formSubmit: async (formName: string, data: Record<string, any>) => {
    await trackEvent(EventType.FORM_SUBMIT, {
      formName,
      ...filterSensitiveData(data),
    });
  },

  formFieldChange: async (fieldName: string, value: any) => {
    await trackEvent(EventType.FORM_FIELD_CHANGE, {
      fieldName,
      hasValue: !!value,
    });
  },
};

/**
 * Track loan application events
 */
export const trackLoanApplication = {
  pageView: async () => {
    await trackEvent(EventType.LENDING_PAGE_VIEW);
  },

  inputExpectedAmount: async (amount: number) => {
    await trackEvent(EventType.LENDING_PAGE_INPUT_EXPECTED_AMOUNT, {
      amountRange: getAmountRange(amount),
    });
  },

  inputPurpose: async (purpose: string) => {
    await trackEvent(EventType.LENDING_PAGE_INPUT_PURPOSE, { purpose });
  },

  inputPhoneNumber: async (phoneNumber: string) => {
    await trackEvent(EventType.LENDING_PAGE_INPUT_PHONE_NUMBER, {
      hasPhone: !!phoneNumber,
    });
  },

  phoneNumberValid: async (_phoneNumber: string, telco: string) => {
    await trackEvent(EventType.LENDING_PAGE_INPUT_PHONE_NUMBER_VALID, {
      telco,
    });
  },

  formSubmit: async (data: {
    amount: number;
    purpose: string;
    phoneNumber: string;
  }) => {
    await trackEvent(EventType.LENDING_PAGE_FORM_SUBMIT, {
      amountRange: getAmountRange(data.amount),
      purpose: data.purpose,
      telco: data.phoneNumber,
    });
  },
};
