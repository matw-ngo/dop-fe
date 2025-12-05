// Loan Application Form Types
// Comprehensive types for Vietnamese digital lending platform

/**
 * Personal Information Data Structure
 */
export interface PersonalInfoData {
  /** Full name following Vietnamese naming conventions (Họ và tên) */
  fullName: string;

  /** Date of birth (YYYY-MM-DD) */
  dateOfBirth: string;

  /** Gender */
  gender: "male" | "female" | "other";

  /** National ID (CCCD) number - 12 digits */
  nationalId: string;

  /** National ID issue date (YYYY-MM-DD) */
  nationalIdIssueDate: string;

  /** National ID issue place */
  nationalIdIssuePlace: string;

  /** Phone number (Vietnamese format) */
  phoneNumber: string;

  /** Email address */
  email: string;

  /** Current address */
  currentAddress: {
    /** Street address */
    street: string;
    /** Province/City code */
    provinceCode: string;
    /** District code */
    districtCode: string;
    /** Ward code */
    wardCode: string;
    /** Province/City name */
    provinceName: string;
    /** District name */
    districtName: string;
    /** Ward name */
    wardName: string;
  };

  /** Whether permanent address is same as current */
  sameAsCurrentAddress: boolean;

  /** Permanent address (if different from current) */
  permanentAddress?: {
    /** Street address */
    street: string;
    /** Province/City code */
    provinceCode: string;
    /** District code */
    districtCode: string;
    /** Ward code */
    wardCode: string;
    /** Province/City name */
    provinceName: string;
    /** District name */
    districtName: string;
    /** Ward name */
    wardName: string;
  };

  /** Marital status */
  maritalStatus: "single" | "married" | "divorced" | "widowed";

  /** Number of dependents */
  dependentsCount: number;

  /** Education level */
  educationLevel:
    | "high_school"
    | "college"
    | "university"
    | "postgraduate"
    | "other";

  /** Residence status */
  residenceStatus: "owner" | "renter" | "family" | "other";
}

/**
 * Financial Information Data Structure
 */
export interface FinancialInfoData {
  /** Monthly income range */
  monthlyIncomeRange: string;

  /** Exact monthly income (if provided) */
  exactMonthlyIncome?: number;

  /** Income source */
  incomeSource:
    | "salary"
    | "business"
    | "investment"
    | "rental"
    | "pension"
    | "other";

  /** Income source details */
  incomeSourceDetails?: string;

  /** Bank information */
  bankInfo: {
    /** Bank name */
    bankName: string;
    /** Bank branch */
    bankBranch: string;
    /** Account number */
    accountNumber: string;
    /** Account holder name */
    accountHolderName: string;
  };

  /** Existing loans */
  existingLoans: {
    /** Has existing loans */
    hasExistingLoans: boolean;
    /** List of existing loans */
    loans?: Array<{
      /** Loan provider */
      provider: string;
      /** Outstanding amount */
      outstandingAmount: number;
      /** Monthly payment */
      monthlyPayment: number;
      /** Loan type */
      loanType: "personal" | "mortgage" | "car" | "credit_card" | "other";
    }>;
  };

  /** Credit card information */
  creditCardInfo: {
    /** Has credit cards */
    hasCreditCards: boolean;
    /** Number of credit cards */
    cardCount?: number;
    /** Total credit limit */
    totalCreditLimit?: number;
    /** Current outstanding balance */
    currentBalance?: number;
  };

  /** Other monthly expenses */
  monthlyExpenses: {
    /** Housing expenses */
    housing: number;
    /** Transportation expenses */
    transportation: number;
    /** Food and utilities */
    foodAndUtilities: number;
    /** Other expenses */
    other: number;
  };

  /** Assets */
  assets: {
    /** Has real estate */
    hasRealEstate: boolean;
    /** Real estate details */
    realEstateDetails?: string;
    /** Has vehicle */
    hasVehicle: boolean;
    /** Vehicle details */
    vehicleDetails?: string;
    /** Other assets */
    otherAssets?: string;
  };
}

/**
 * Employment Information Data Structure
 */
export interface EmploymentInfoData {
  /** Employment type */
  employmentType:
    | "formal"
    | "informal"
    | "self_employed"
    | "retired"
    | "unemployed"
    | "student";

  /** Employment status */
  employmentStatus:
    | "full_time"
    | "part_time"
    | "contract"
    | "freelance"
    | "temporary";

  /** Company/Organization name */
  companyName?: string;

  /** Job title/position */
  jobTitle?: string;

  /** Industry sector */
  industry?: string;

  /** Work duration */
  workDuration: {
    /** Years at current job */
    years: number;
    /** Months at current job */
    months: number;
    /** Total years of work experience */
    totalYears: number;
  };

  /** Work contact information */
  workContact: {
    /** Work phone number */
    phoneNumber?: string;
    /** Work email */
    email?: string;
    /** Company website */
    website?: string;
  };

  /** Work address */
  workAddress?: {
    /** Street address */
    street: string;
    /** Province/City code */
    provinceCode: string;
    /** District code */
    districtCode: string;
    /** Ward code */
    wardCode: string;
    /** Province/City name */
    provinceName: string;
    /** District name */
    districtName: string;
    /** Ward name */
    wardName: string;
  };

  /** Income verification */
  incomeVerification: {
    /** Method of income verification */
    method:
      | "payslip"
      | "bank_statement"
      | "tax_return"
      | "certificate"
      | "other";
    /** Can provide documents */
    canProvideDocuments: boolean;
    /** Additional notes */
    notes?: string;
  };

  /** Business information (for self-employed) */
  businessInfo?: {
    /** Business name */
    businessName: string;
    /** Business registration number */
    registrationNumber?: string;
    /** Business type */
    businessType: string;
    /** Years in operation */
    yearsInOperation: number;
    /** Annual revenue */
    annualRevenue?: number;
    /** Number of employees */
    employeeCount?: number;
  };
}

/**
 * Document Upload Data Structure
 */
export interface DocumentUploadData {
  /** National ID card documents */
  nationalId: {
    /** Front side file */
    frontFile?: File;
    /** Back side file */
    backFile?: File;
    /** Upload status */
    uploadStatus: "pending" | "uploading" | "completed" | "failed";
    /** Verification status */
    verificationStatus?: "pending" | "verified" | "rejected";
  };

  /** Face photo/video */
  faceVerification: {
    /** Face photo file */
    photoFile?: File;
    /** Face video file (if required) */
    videoFile?: File;
    /** Upload status */
    uploadStatus: "pending" | "uploading" | "completed" | "failed";
    /** Verification status */
    verificationStatus?: "pending" | "verified" | "rejected";
  };

  /** Address proof documents */
  addressProof: {
    /** Document type */
    documentType:
      | "utility_bill"
      | "rental_agreement"
      | "household_registration"
      | "other";
    /** Document files */
    files: File[];
    /** Upload status */
    uploadStatus: "pending" | "uploading" | "completed" | "failed";
    /** Verification status */
    verificationStatus?: "pending" | "verified" | "rejected";
  };

  /** Income proof documents */
  incomeProof: {
    /** Document types */
    documentTypes: Array<
      "payslip" | "bank_statement" | "tax_return" | "certificate" | "other"
    >;
    /** Document files mapped by type */
    files: Record<string, File[]>;
    /** Upload status */
    uploadStatus: "pending" | "uploading" | "completed" | "failed";
    /** Verification status */
    verificationStatus?: "pending" | "verified" | "rejected";
  };

  /** Employment proof documents */
  employmentProof: {
    /** Document types */
    documentTypes: Array<
      "employment_contract" | "work_certificate" | "business_license" | "other"
    >;
    /** Document files mapped by type */
    files: Record<string, File[]>;
    /** Upload status */
    uploadStatus: "pending" | "uploading" | "completed" | "failed";
    /** Verification status */
    verificationStatus?: "pending" | "verified" | "rejected";
  };

  /** Additional documents */
  additionalDocuments: {
    /** Document type */
    documentType: string;
    /** Description */
    description?: string;
    /** Files */
    files: File[];
    /** Upload status */
    uploadStatus: "pending" | "uploading" | "completed" | "failed";
  }[];
}

/**
 * Loan Details Data Structure
 */
export interface LoanDetailsData {
  /** Loan product ID */
  productId: string;

  /** Loan amount requested */
  requestedAmount: number;

  /** Loan term in months */
  loanTerm: number;

  /** Loan purpose */
  loanPurpose: string;

  /** Loan purpose details */
  loanPurposeDetails?: string;

  /** Preferred repayment method */
  repaymentMethod: "bank_transfer" | "cash" | "salary_deduction" | "auto_debit";

  /** Collateral information */
  collateral: {
    /** Has collateral */
    hasCollateral: boolean;
    /** Collateral type */
    collateralType?:
      | "real_estate"
      | "vehicle"
      | "savings"
      | "guarantor"
      | "other";
    /** Collateral details */
    collateralDetails?: string;
    /** Estimated collateral value */
    estimatedValue?: number;
  };

  /** Disbursement information */
  disbursement: {
    /** Preferred disbursement method */
    method: "bank_transfer" | "cash" | "check";
    /** Bank account for disbursement (if bank transfer) */
    bankAccount?: string;
    /** Disbursement timing */
    timing: "immediate" | "within_3_days" | "within_1_week" | "within_2_weeks";
  };

  /** Additional notes */
  notes?: string;

  /** Agreement to terms and conditions */
  agreesToTerms: boolean;

  /** Agreement to privacy policy */
  agreesToPrivacyPolicy: boolean;

  /** Agreement to credit check */
  agreesToCreditCheck: boolean;
}

/**
 * Complete Loan Application Data Structure
 */
export interface LoanApplicationData {
  /** Application ID (generated by system) */
  applicationId?: string;

  /** Personal information */
  personalInfo: PersonalInfoData;

  /** Financial information */
  financialInfo: FinancialInfoData;

  /** Employment information */
  employmentInfo: EmploymentInfoData;

  /** Document uploads */
  documents: DocumentUploadData;

  /** Loan details */
  loanDetails: LoanDetailsData;

  /** Application metadata */
  metadata: {
    /** Application date */
    applicationDate: string;
    /** Application status */
    status:
      | "draft"
      | "submitted"
      | "under_review"
      | "approved"
      | "rejected"
      | "requires_more_info";
    /** IP address */
    ipAddress?: string;
    /** User agent */
    userAgent?: string;
    /** Source channel */
    sourceChannel: "web" | "mobile" | "agent" | "partner";
    /** Referral code (if any) */
    referralCode?: string;
    /** Marketing consent */
    marketingConsent: boolean;
  };
}

/**
 * Vietnamese Address Structure
 */
export interface VietnameseAddress {
  /** Province/City (Tỉnh/Thành phố) */
  province: {
    code: string;
    name: string;
    nameWithType: string;
  };

  /** District (Quận/Huyện) */
  district: {
    code: string;
    name: string;
    nameWithType: string;
  };

  /** Ward (Phường/Xã) */
  ward: {
    code: string;
    name: string;
    nameWithType: string;
  };
}

/**
 * Loan Product Configuration
 */
export interface LoanProductConfig {
  /** Product ID */
  id: string;

  /** Product name */
  name: string;

  /** Product description */
  description: string;

  /** Loan amount limits */
  amountLimits: {
    /** Minimum amount */
    min: number;
    /** Maximum amount */
    max: number;
    /** Default amount */
    default: number;
    /** Step amount for increments */
    step: number;
  };

  /** Loan term options */
  termOptions: {
    /** Minimum term in months */
    min: number;
    /** Maximum term in months */
    max: number;
    /** Available terms */
    availableTerms: number[];
    /** Default term */
    default: number;
  };

  /** Interest rate information */
  interestRate: {
    /** Annual interest rate (%) */
    annual: number;
    /** Interest type */
    type: "fixed" | "reducing" | "flat";
    /** Promotional rate (if applicable) */
    promotional?: {
      rate: number;
      duration: number; // in months
    };
  };

  /** Eligibility criteria */
  eligibility: {
    /** Minimum age */
    minAge: number;
    /** Maximum age */
    maxAge: number;
    /** Minimum monthly income */
    minMonthlyIncome: number;
    /** Required documents */
    requiredDocuments: string[];
    /** Employment requirements */
    employmentRequirement?: "formal" | "any" | "self_employed";
  };

  /** Processing time */
  processingTime: {
    /** Minimum processing days */
    min: number;
    /** Maximum processing days */
    max: number;
    /** Typical processing days */
    typical: number;
  };

  /** Fees */
  fees: {
    /** Processing fee (%) */
    processingFee?: number;
    /** Late payment fee (%) */
    latePaymentFee?: number;
    /** Early repayment fee (%) */
    earlyRepaymentFee?: number;
    /** Other fees */
    otherFees?: Array<{
      name: string;
      amount: number;
      type: "fixed" | "percentage";
    }>;
  };
}

/**
 * API Response Types
 */
export interface LoanApplicationResponse {
  /** Success flag */
  success: boolean;

  /** Application ID */
  applicationId: string;

  /** Reference number */
  referenceNumber: string;

  /** Status */
  status: string;

  /** Message */
  message: string;

  /** Next steps */
  nextSteps?: string[];

  /** Estimated processing time */
  estimatedProcessingTime?: string;
}

/**
 * File Upload Configuration
 */
export interface FileUploadConfig {
  /** Maximum file size in bytes */
  maxFileSize: number;

  /** Allowed file types */
  allowedTypes: string[];

  /** Upload endpoint */
  uploadEndpoint: string;

  /** Chunk size for large files */
  chunkSize?: number;

  /** Maximum concurrent uploads */
  maxConcurrentUploads?: number;
}

/**
 * Form Step Configuration for Multi-Step Form
 */
export interface LoanFormStepConfig {
  /** Step identifier */
  id: string;

  /** Step title */
  title: string;

  /** Step description */
  description?: string;

  /** Step icon */
  icon?: string;

  /** Step order */
  order: number;

  /** Whether step is optional */
  optional?: boolean;

  /** Fields configuration for this step */
  fields: Array<{
    /** Field name */
    fieldName: string;

    /** Component type */
    component: string;

    /** Field properties */
    props: any;

    /** Field validation rules */
    validation?: any[];

    /** Field condition for showing/hiding */
    condition?: any;
  }>;

  /** Step-level validation */
  stepValidation?: {
    validate?: (data: any) => Promise<boolean | string>;
  };
}
