import {
  FieldType,
  getFieldIcon,
} from "@/components/user-onboarding/constants/field-types";
import { Calendar, DollarSign, MapPin, User } from "lucide-react";

/**
 * Maps field values to their display format with appropriate icons
 * Handles all 14 field types supported by the system
 */
export function getFieldDisplayValue(
  fieldType: FieldType,
  value: any,
  t: (key: string) => string,
) {
  // Return N/A for empty values
  if (!value && value !== 0) {
    return { display: "N/A", icon: User };
  }

  switch (fieldType) {
    case FieldType.FULL_NAME:
      return {
        display: String(value || ""),
        icon: User,
      };

    case FieldType.EMAIL:
      return {
        display: String(value || ""),
        icon: User,
      };

    case FieldType.PHONE_NUMBER:
      return {
        display: String(value || ""),
        icon: User,
      };

    case FieldType.DATE_OF_BIRTH:
      const date = typeof value === "string" ? new Date(value) : value;
      return {
        display: date.toLocaleDateString("vi-VN"),
        icon: Calendar,
      };

    case FieldType.GENDER:
      return {
        display:
          t(`onboarding.confirm.genderOptions.${value}`) || String(value),
        icon: User,
      };

    case FieldType.NATIONAL_ID:
    case FieldType.SECOND_NATIONAL_ID:
      return {
        display: String(value || ""),
        icon: User,
      };

    case FieldType.LOCATION:
      return {
        display: t(`onboarding.confirm.cityOptions.${value}`) || String(value),
        icon: MapPin,
      };

    case FieldType.INCOME:
      return {
        display: new Intl.NumberFormat("vi-VN", {
          style: "currency",
          currency: "VND",
        }).format(Number(value) || 0),
        icon: DollarSign,
      };

    case FieldType.INCOME_TYPE:
      return {
        display:
          t(`onboarding.confirm.incomeTypeOptions.${value}`) || String(value),
        icon: DollarSign,
      };

    case FieldType.CAREER_STATUS:
      return {
        display:
          t(`onboarding.confirm.careerStatusOptions.${value}`) || String(value),
        icon: User,
      };

    case FieldType.CAREER_TYPE:
      return {
        display:
          t(`onboarding.confirm.careerTypeOptions.${value}`) || String(value),
        icon: User,
      };

    case FieldType.HAVING_LOAN:
      return {
        display:
          t(`onboarding.confirm.havingLoanOptions.${value}`) || String(value),
        icon: DollarSign,
      };

    case FieldType.CREDIT_STATUS:
      return {
        display:
          t(`onboarding.confirm.creditStatusOptions.${value}`) || String(value),
        icon: User,
      };

    case FieldType.PURPOSE:
      return {
        display: String(value || ""),
        icon: User,
      };

    default:
      return {
        display: String(value || "N/A"),
        icon: getFieldIcon(fieldType as FieldType) || User,
      };
  }
}

/**
 * Gets the field label for display
 */
export function getFieldLabel(
  fieldType: FieldType,
  t: (key: string) => string,
): string {
  return t(`form.fields.${fieldType}.label`) || fieldType;
}
