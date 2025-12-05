import {
  COVERAGE_PERIODS,
  SERVICE_INFO,
  PAYMENT_METHODS,
  CLAIM_METHODS,
  VEHICLE_TYPES,
  type ColorVariant,
} from "../constants";
import type { InsuranceProduct } from "@/types/insurance";

export function getCoverageProgress(limit: number, maxLimit: number): number {
  return Math.min((limit / maxLimit) * 100, 100);
}

export function getCoveragePeriodText(period: string): string {
  return COVERAGE_PERIODS[period as keyof typeof COVERAGE_PERIODS] || period;
}

export function getServiceInfo(service: string) {
  return (
    SERVICE_INFO[service as keyof typeof SERVICE_INFO] || {
      name: service,
      description: "",
    }
  );
}

export function getPaymentMethodInfo(method: string) {
  return (
    PAYMENT_METHODS[method as keyof typeof PAYMENT_METHODS] || {
      name: method,
      icon: "💳",
      description: "",
    }
  );
}

export function getClaimMethodIcon(method: string): string {
  return (
    CLAIM_METHODS[method as keyof typeof CLAIM_METHODS]?.icon || "📄"
  );
}

export function getClaimMethodName(method: string): string {
  return (
    CLAIM_METHODS[method as keyof typeof CLAIM_METHODS]?.name || method
  );
}

export function getClaimMethodDescription(method: string): string {
  return (
    CLAIM_METHODS[method as keyof typeof CLAIM_METHODS]?.description || ""
  );
}

export function getVehicleTypeText(type: string): string {
  return VEHICLE_TYPES[type as keyof typeof VEHICLE_TYPES] || type;
}

export function calculateNoClaimBonusYear(
  year: number,
  maxYears: number,
  maxDiscount: number
): number {
  return Math.min(
    (year / maxYears) * maxDiscount,
    maxDiscount
  );
}

export function calculateMonthlyPayment(
  totalPremium: number,
  months: number
): number {
  return Math.ceil(totalPremium / months);
}

export function hasVehicleSpecificCoverage(product: InsuranceProduct): boolean {
  return Boolean(product.vehicleCoverage);
}

export function hasActiveCoverage(
  coverage: { disabled: boolean; limit: number }
): boolean {
  return !coverage.disabled && coverage.limit > 0;
}

export function formatHotlineUrl(hotline: string): string {
  return `tel:${hotline.replace(/\s/g, "")}`;
}

export function formatWebsiteUrl(website: string): string {
  return `https://${website}`;
}

export function formatEmailUrl(email: string): string {
  return `mailto:${email}`;
}

export function getApprovalRateLevel(approvalRate: number): string {
  if (approvalRate >= 95) return "veryHigh";
  if (approvalRate >= 90) return "high";
  if (approvalRate >= 80) return "good";
  return "average";
}

export function isComparisonLimitReached(
  currentCount: number,
  maxProducts: number
): boolean {
  return currentCount >= maxProducts;
}

export function getColorClass(color: ColorVariant): string {
  const colorClasses = {
    blue: "bg-blue-100 text-blue-700",
    red: "bg-red-100 text-red-700",
    orange: "bg-orange-100 text-orange-700",
    green: "bg-green-100 text-green-700",
    purple: "bg-purple-100 text-purple-700",
    pink: "bg-pink-100 text-pink-700",
    yellow: "bg-yellow-100 text-yellow-700",
    indigo: "bg-indigo-100 text-indigo-700",
    cyan: "bg-cyan-100 text-cyan-700",
    teal: "bg-teal-100 text-teal-700",
    gray: "bg-gray-100 text-gray-700",
  };
  return colorClasses[color] || colorClasses.blue;
}

export function getProgressColorClass(color: ColorVariant): string {
  const progressColors = {
    blue: "bg-blue-500",
    red: "bg-red-500",
    orange: "bg-orange-500",
    green: "bg-green-500",
    purple: "bg-purple-500",
    pink: "bg-pink-500",
    yellow: "bg-yellow-500",
    indigo: "bg-indigo-500",
    cyan: "bg-cyan-500",
    teal: "bg-teal-500",
    gray: "bg-gray-500",
  };
  return progressColors[color] || progressColors.blue;
}