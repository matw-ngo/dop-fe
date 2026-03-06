/**
 * Flow Page Constants
 *
 * Defines the logical page identifiers used in flow steps.
 * These are NOT physical routes, but logical step identifiers.
 *
 * @example
 * // API response
 * { "page": "/index", "send_otp": false }
 *
 * // Component usage
 * <DynamicLoanForm page={FLOW_PAGES.INDEX} />
 */

export const FLOW_PAGES = {
  /** Homepage / Initial step */
  INDEX: "/index",

  /** Loan information submission step */
  SUBMIT_INFO: "/submit-info",

  /** Personal information step */
  PERSONAL_INFO: "/personal-info",

  /** eKYC verification step */
  EKYC: "/ekyc",

  /** Financial information step */
  FINANCIAL_INFO: "/financial-info",

  /** Consent step */
  CONSENT: "/consent",
} as const;

/**
 * Type-safe flow page values
 */
export type FlowPage = (typeof FLOW_PAGES)[keyof typeof FLOW_PAGES];

/**
 * Check if a string is a valid flow page
 */
export function isValidFlowPage(page: string): page is FlowPage {
  return Object.values(FLOW_PAGES).includes(page as FlowPage);
}

/**
 * Get all valid flow pages
 */
export function getValidFlowPages(): FlowPage[] {
  return Object.values(FLOW_PAGES);
}

/**
 * Normalize page value (ensure leading slash)
 */
export function normalizePageValue(value: string): string {
  return value.startsWith("/") ? value : `/${value}`;
}
