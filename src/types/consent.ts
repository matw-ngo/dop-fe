/**
 * Consent Type Definitions
 *
 * Scalable consent system supporting multiple consent purposes
 * Currently: Data Privacy (cookies, tracking)
 * Future: GTM, Analytics, Marketing, etc.
 */

export type ConsentPurposeType =
  | "data_privacy" // Current: Cookie & data collection consent
  | "gtm" // Future: Google Tag Manager consent
  | "analytics" // Future: Analytics tracking consent
  | "marketing" // Future: Marketing communications consent
  | "third_party"; // Future: Third-party data sharing consent

export interface ConsentPurposeConfig {
  id: string;
  type: ConsentPurposeType;
  name: string;
  description: string;
  required: boolean; // If true, user must consent to continue
  defaultValue?: boolean; // Default consent state
}

/**
 * Consent UI Variants
 * Different UI presentations for different consent types
 */
export type ConsentUIVariant =
  | "bottom-banner" // Current: Bottom banner with horizontal layout
  | "modal-centered" // Future: Centered modal for detailed consent
  | "inline-checkbox" // Future: Inline checkbox for simple consent
  | "toggle-switch"; // Future: Toggle switch for settings page

export interface ConsentModalConfig {
  variant: ConsentUIVariant;
  showRejectButton?: boolean;
  showDetailsLink?: boolean;
  position?: "bottom" | "center" | "top";
}

/**
 * Consent State Management
 */
export interface ConsentState {
  purposeId: string;
  purposeType: ConsentPurposeType;
  granted: boolean;
  timestamp: string;
  version: string | number;
}

/**
 * Consent Context for Multi-Purpose Support
 */
export interface ConsentContext {
  purposes: ConsentPurposeConfig[];
  states: Record<string, ConsentState>;
  updateConsent: (purposeId: string, granted: boolean) => Promise<void>;
  revokeConsent: (purposeId: string) => Promise<void>;
  hasConsent: (purposeType: ConsentPurposeType) => boolean;
}

/**
 * Predefined Consent Purposes
 * Add new purposes here as needed
 */
export const CONSENT_PURPOSES: Record<
  ConsentPurposeType,
  Omit<ConsentPurposeConfig, "id">
> = {
  data_privacy: {
    type: "data_privacy",
    name: "Data Privacy & Cookies",
    description: "Cookie collection and data processing consent",
    required: true,
    defaultValue: false,
  },
  gtm: {
    type: "gtm",
    name: "Google Tag Manager",
    description: "Google Tag Manager tracking consent",
    required: false,
    defaultValue: false,
  },
  analytics: {
    type: "analytics",
    name: "Analytics",
    description: "Website analytics and performance tracking",
    required: false,
    defaultValue: false,
  },
  marketing: {
    type: "marketing",
    name: "Marketing Communications",
    description: "Marketing emails and promotional content",
    required: false,
    defaultValue: false,
  },
  third_party: {
    type: "third_party",
    name: "Third-Party Data Sharing",
    description: "Sharing data with third-party partners",
    required: false,
    defaultValue: false,
  },
};
