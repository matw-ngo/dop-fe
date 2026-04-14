/**
 * Special Partner Configurations
 *
 * Define custom behavior for specific financial institution partners
 * that require special handling in the loan result display.
 */

import type { components } from "@/lib/api/v1/dop";

type MatchedProduct = components["schemas"]["matched_product"];

export interface SpecialPartnerConfig {
  /** Theme color variant for visual distinction */
  theme: "blue" | "green" | "gold" | "purple" | "default";
  /** Custom message key for i18n (optional) */
  customMessageKey?: string;
  /** Whether to hide loan details (amount, period, etc.) */
  hideDetails?: boolean;
  /** Custom CTA text key for i18n (optional) */
  customCtaKey?: string;
  /** Priority order in list (lower = higher priority) */
  priority?: number;
  /** Custom badge text key for i18n (optional) */
  badgeKey?: string;
}

/**
 * Registry of special partner configurations
 *
 * Add new partners here as needed without modifying component code.
 */
export const SPECIAL_PARTNER_CONFIGS: Record<string, SpecialPartnerConfig> = {
  CATHAYBANK: {
    theme: "blue",
    customMessageKey: "specialPartner.cathaybank.message",
    hideDetails: false,
    customCtaKey: "actions.registerCathay",
    priority: 1,
    badgeKey: "specialPartner.badgePremium",
  },
  // Example: Add more special partners as needed
  // VPBank: {
  //   theme: "green",
  //   customMessageKey: "specialPartner.vpbank.message",
  // },
};

/**
 * Check if a partner has special configuration
 */
export function isSpecialPartner(partnerCode: string): boolean {
  return partnerCode.toUpperCase() in SPECIAL_PARTNER_CONFIGS;
}

/**
 * Get special configuration for a partner
 */
export function getSpecialPartnerConfig(
  partnerCode: string,
): SpecialPartnerConfig | undefined {
  return SPECIAL_PARTNER_CONFIGS[partnerCode.toUpperCase()];
}

/**
 * Sort products with special partners first (by priority)
 */
export function sortProductsByPriority(
  products: MatchedProduct[],
): MatchedProduct[] {
  return [...products].sort((a, b) => {
    const configA = getSpecialPartnerConfig(a.partner_code);
    const configB = getSpecialPartnerConfig(b.partner_code);
    const priorityA = configA?.priority ?? Number.MAX_SAFE_INTEGER;
    const priorityB = configB?.priority ?? Number.MAX_SAFE_INTEGER;
    return priorityA - priorityB;
  });
}
