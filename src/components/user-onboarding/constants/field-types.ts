import {
  User,
  UserCircle,
  FileText,
  CreditCard,
  MapPin,
  Calendar,
  DollarSign,
  Briefcase,
  Heart,
  Shield,
  CheckCircle,
} from "lucide-react";

/**
 * Field type definitions and metadata
 */
export enum FieldType {
  // Personal Information
  FULL_NAME = "fullName",
  EMAIL = "email",
  PHONE_NUMBER = "phoneNumber",
  GENDER = "gender",

  // Identity Verification
  NATIONAL_ID = "nationalId",
  SECOND_NATIONAL_ID = "secondNationalId",
  DATE_OF_BIRTH = "dateOfBirth",
  LOCATION = "location",

  // Financial Information
  INCOME = "income",
  INCOME_TYPE = "incomeType",
  CAREER_STATUS = "careerStatus",
  CAREER_TYPE = "careerType",

  // Loan Information
  HAVING_LOAN = "havingLoan",
  CREDIT_STATUS = "creditStatus",
  PURPOSE = "purpose",

  // Special Fields
  EKYC_VERIFICATION = "ekycVerification",
}

/**
 * Field categories for grouping
 */
export enum FieldCategory {
  PERSONAL = "personal",
  IDENTITY = "identity",
  FINANCIAL = "financial",
  LOAN = "loan",
  VERIFICATION = "verification",
}

/**
 * Mapping of field types to their categories
 */
export const FIELD_CATEGORY_MAP: Record<FieldType, FieldCategory> = {
  [FieldType.FULL_NAME]: FieldCategory.PERSONAL,
  [FieldType.EMAIL]: FieldCategory.PERSONAL,
  [FieldType.PHONE_NUMBER]: FieldCategory.PERSONAL,
  [FieldType.GENDER]: FieldCategory.PERSONAL,

  [FieldType.NATIONAL_ID]: FieldCategory.IDENTITY,
  [FieldType.SECOND_NATIONAL_ID]: FieldCategory.IDENTITY,
  [FieldType.DATE_OF_BIRTH]: FieldCategory.IDENTITY,
  [FieldType.LOCATION]: FieldCategory.IDENTITY,

  [FieldType.INCOME]: FieldCategory.FINANCIAL,
  [FieldType.INCOME_TYPE]: FieldCategory.FINANCIAL,
  [FieldType.CAREER_STATUS]: FieldCategory.FINANCIAL,
  [FieldType.CAREER_TYPE]: FieldCategory.FINANCIAL,

  [FieldType.HAVING_LOAN]: FieldCategory.LOAN,
  [FieldType.CREDIT_STATUS]: FieldCategory.LOAN,
  [FieldType.PURPOSE]: FieldCategory.LOAN,

  [FieldType.EKYC_VERIFICATION]: FieldCategory.VERIFICATION,
};

/**
 * Icon mapping for field types
 */
export const FIELD_ICON_MAP: Record<FieldType, any> = {
  [FieldType.FULL_NAME]: UserCircle,
  [FieldType.EMAIL]: FileText,
  [FieldType.PHONE_NUMBER]: CreditCard,
  [FieldType.GENDER]: User,

  [FieldType.NATIONAL_ID]: CreditCard,
  [FieldType.SECOND_NATIONAL_ID]: CreditCard,
  [FieldType.DATE_OF_BIRTH]: Calendar,
  [FieldType.LOCATION]: MapPin,

  [FieldType.INCOME]: DollarSign,
  [FieldType.INCOME_TYPE]: DollarSign,
  [FieldType.CAREER_STATUS]: Briefcase,
  [FieldType.CAREER_TYPE]: Briefcase,

  [FieldType.HAVING_LOAN]: DollarSign,
  [FieldType.CREDIT_STATUS]: CreditCard,
  [FieldType.PURPOSE]: Heart,

  [FieldType.EKYC_VERIFICATION]: Shield,
};

/**
 * Step patterns for field groupings
 */
export const STEP_PATTERNS = {
  PERSONAL_INFO: {
    fields: [
      FieldType.FULL_NAME,
      FieldType.EMAIL,
      FieldType.PHONE_NUMBER,
      FieldType.GENDER,
    ],
    icon: UserCircle,
  },
  IDENTITY: {
    fields: [
      FieldType.NATIONAL_ID,
      FieldType.SECOND_NATIONAL_ID,
      FieldType.DATE_OF_BIRTH,
      FieldType.LOCATION,
    ],
    icon: Shield,
  },
  FINANCIAL: {
    fields: [
      FieldType.INCOME,
      FieldType.INCOME_TYPE,
      FieldType.CAREER_STATUS,
      FieldType.CAREER_TYPE,
    ],
    icon: DollarSign,
  },
  LOAN: {
    fields: [FieldType.PURPOSE, FieldType.HAVING_LOAN, FieldType.CREDIT_STATUS],
    icon: Briefcase,
  },
  VERIFICATION: {
    fields: [FieldType.EKYC_VERIFICATION],
    icon: CheckCircle,
  },
} as const;

/**
 * Get the default icon for a field type
 */
export function getFieldIcon(fieldType: FieldType): any {
  return FIELD_ICON_MAP[fieldType] || User;
}

/**
 * Get the category for a field type
 */
export function getFieldCategory(fieldType: FieldType): FieldCategory {
  return FIELD_CATEGORY_MAP[fieldType];
}

/**
 * Check if a field type belongs to a specific category
 */
export function isFieldInCategory(
  fieldType: FieldType,
  category: FieldCategory,
): boolean {
  return getFieldCategory(fieldType) === category;
}
