/**
 * Formatting Utilities for Loan Result Display
 *
 * Pure functions for formatting loan-related data.
 * No dependencies on React or external state.
 */

/**
 * Format loan period (months) to human-readable string
 * @example formatLoanPeriod(6) -> "6 tháng"
 * @example formatLoanPeriod(36) -> "3 năm"
 * @example formatLoanPeriod(18) -> "1 năm 6 tháng"
 */
export function formatLoanPeriod(
  months: number,
  locale: string = "vi",
): string {
  if (months < 12) {
    return locale === "vi" ? `${months} tháng` : `${months} months`;
  }

  const years = Math.floor(months / 12);
  const remainingMonths = months % 12;

  if (remainingMonths === 0) {
    return locale === "vi"
      ? `${years} năm`
      : `${years} year${years > 1 ? "s" : ""}`;
  }

  return locale === "vi"
    ? `${years} năm ${remainingMonths} tháng`
    : `${years} year${years > 1 ? "s" : ""} ${remainingMonths} month${remainingMonths > 1 ? "s" : ""}`;
}

/**
 * Format currency amount to compact form
 * @example formatAmount(50000000) -> "50 triệu"
 * @example formatAmount(1500000000) -> "1.5 tỷ"
 */
export function formatAmount(amount: number, locale: string = "vi"): string {
  // Handle invalid amounts
  if (!amount || amount <= 0) return "0";

  // Billions
  if (amount >= 1_000_000_000) {
    const billions = amount / 1_000_000_000;
    return locale === "vi"
      ? `${billions.toFixed(billions % 1 === 0 ? 0 : 1)} tỷ`
      : `${billions.toFixed(billions % 1 === 0 ? 0 : 1)}B`;
  }

  // Millions
  if (amount >= 1_000_000) {
    const millions = amount / 1_000_000;
    return locale === "vi"
      ? `${millions.toFixed(millions % 1 === 0 ? 0 : 0)} triệu`
      : `${millions.toFixed(millions % 1 === 0 ? 0 : 0)}M`;
  }

  // Thousands
  if (amount >= 1_000) {
    return locale === "vi"
      ? `${(amount / 1_000).toFixed(0)}K`
      : `${(amount / 1_000).toFixed(0)}K`;
  }

  return amount.toLocaleString(locale === "vi" ? "vi-VN" : "en-US");
}

/**
 * Format full currency with symbol
 * @example formatCurrency(50000000) -> "50.000.000 VND"
 */
export function formatCurrency(
  amount: number,
  currency: string = "VND",
  locale: string = "vi",
): string {
  if (!amount || amount <= 0) return `0 ${currency}`;

  const formatter = new Intl.NumberFormat(locale === "vi" ? "vi-VN" : "en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });

  return formatter.format(amount);
}

/**
 * Get partner logo URL
 * Falls back to placeholder if logo doesn't exist
 */
export function getPartnerLogoUrl(partnerCode: string): string {
  return `/images/partners/${partnerCode.toLowerCase()}.png`;
}

/**
 * Get loan type display name key for i18n
 */
export function getLoanTypeKey(productType: string): string {
  const typeMap: Record<string, string> = {
    personal_loan: "loanType.personal",
    credit_card: "loanType.creditCard",
    mortgage: "loanType.mortgage",
    auto_loan: "loanType.auto",
    business_loan: "loanType.business",
  };

  return typeMap[productType] || "loanType.other";
}

/**
 * Calculate estimated monthly payment (EMI)
 * Simple calculation: P * r * (1 + r)^n / ((1 + r)^n - 1)
 * Where P = principal, r = monthly rate, n = number of months
 */
export function calculateEMI(
  principal: number,
  annualRate: number,
  months: number,
): number {
  if (!principal || !annualRate || !months) return 0;

  const monthlyRate = annualRate / 12 / 100;
  const emi =
    (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) /
    (Math.pow(1 + monthlyRate, months) - 1);

  return Math.round(emi);
}
