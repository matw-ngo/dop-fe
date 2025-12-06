/**
 * Tracking types for financial tools
 * Based on the existing tracking implementation but adapted for the new architecture
 */

export enum EventType {
  // Tool-specific events
  TOOL_SAVINGS_PAGE_VIEW = "tool_savings_page_view",
  TOOL_SAVINGS_FILTER_CHANGE = "tool_savings_filter_change",
  TOOL_SAVINGS_CALCULATE = "tool_savings_calculate",
  TOOL_SAVINGS_SORT_CHANGE = "tool_savings_sort_change",
  TOOL_SAVINGS_CLICK_OPEN_ACCOUNT = "tool_savings_click_open_account",

  TOOL_LOAN_PAGE_VIEW = "tool_loan_page_view",
  TOOL_LOAN_INPUT_AMOUNT = "tool_loan_input_amount",
  TOOL_LOAN_INPUT_PERIOD = "tool_loan_input_period",
  TOOL_LOAN_INPUT_RATE = "tool_loan_input_rate",
  TOOL_LOAN_CALCULATE = "tool_loan_calculate",
  TOOL_LOAN_FORM_SUBMIT = "tool_loan_form_submit",

  TOOL_SALARY_PAGE_VIEW = "tool_salary_page_view",
  TOOL_SALARY_GROSS_TO_NET_VIEW = "tool_salary_gross_to_net_view",
  TOOL_SALARY_NET_TO_GROSS_VIEW = "tool_salary_net_to_gross_view",
  TOOL_SALARY_INPUT_AMOUNT = "tool_salary_input_amount",
  TOOL_SALARY_INPUT_DEPENDENTS = "tool_salary_input_dependents",
  TOOL_SALARY_SELECT_REGION = "tool_salary_select_region",
  TOOL_SALARY_CALCULATE = "tool_salary_calculate",

  // Generic events
  PAGE_VIEW = "page_view",
  FILTER_CHANGE = "filter_change",
  CALCULATION_PERFORMED = "calculation_performed",
  FORM_SUBMIT = "form_submit",
  FORM_FIELD_CHANGE = "form_field_change",
}

export interface TrackingEvent {
  /** Unique session identifier */
  sessionId: string;
  /** Unique device identifier */
  deviceId: string;
  /** Event type from EventType enum */
  event: EventType;
  /** Additional event data */
  data: Record<string, string | number | boolean>;
  /** Service identifier */
  service: string;
  /** Timestamp of the event */
  timestamp?: number;
}

export interface TrackingSession {
  /** Unique session identifier */
  sessionId: string;
  /** Unique device identifier */
  deviceId: string;
  /** Session start timestamp */
  startTime: number;
  /** Session end timestamp */
  endTime?: number;
  /** Active time in seconds */
  activeTime: number;
  /** Source of the session (referral, direct, etc.) */
  source: string;
  /** Number of page views in this session */
  pageViews: number;
  /** Service identifier */
  service: string;
}

export interface TrackingConfig {
  /** Base URL for tracking API */
  apiBaseUrl: string;
  /** Service identifier */
  serviceName: string;
  /** Whether tracking is enabled */
  enabled: boolean;
  /** Privacy settings */
  privacy: {
    /** Whether to respect Do Not Track */
    respectDNT: boolean;
    /** Whether user has consented to tracking */
    hasConsent: boolean;
    /** Types of events that can be tracked */
    allowedEvents: EventType[];
  };
}

export interface DeviceInfo {
  /** Device fingerprint */
  fingerprint: string;
  /** User agent */
  userAgent: string;
  /** Screen resolution */
  screenResolution: string;
  /** Browser language */
  language: string;
  /** Timezone */
  timezone: string;
}
