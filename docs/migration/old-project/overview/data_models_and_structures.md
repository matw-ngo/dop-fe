# Data Models and Structures Documentation

## Overview

This document describes the data models, structures, and state management patterns used in the finzone-frontend application. The application is a financial lead-generation platform built with Next.js/React/TypeScript that handles credit cards, loans, and insurance products.

## Table of Contents

1. [Core Data Models](#core-data-models)
2. [State Management](#state-management)
3. [API Payloads](#api-payloads)
4. [Mock Data Structures](#mock-data-structures)
5. [Data Relationships](#data-relationships)

## Core Data Models

### Loan Models

#### IUserData
Represents user information for loan applications:

```typescript
interface IUserData {
  full_name?: string;
  gender?: string;
  loan_purpose?: string;
  loan_period?: number;
  phone_number?: string;
  national_id?: string;
  birthday?: string;
  district?: string;
  province?: string;
  income?: number;
  income_type?: string;
  expected_amount?: number;
  having_loan: number;
  credit_status: number;
  career_status?: string;
  career_type?: string;
  national_id_front_key?: string;
  national_id_back_key?: string;
  mandatory_docs?: string;
  extra_docs?: string;
  device_id?: string;
}
```

#### IUserDataValidate
Validation state for user data fields:

```typescript
interface IUserDataValidate {
  full_name: IValidator;
  gender: IValidator;
  loan_purpose: IValidator;
  loan_period: IValidator;
  phone_number: IValidator;
  national_id: IValidator;
  birthday: IValidator;
  district: IValidator;
  province: IValidator;
  income: IValidator;
  income_type: IValidator;
  expected_amount: IValidator;
  having_loan: IValidator;
  credit_status: IValidator;
  career_status: IValidator;
  career_type: IValidator;
  national_id_front_key: IValidator;
  national_id_back_key: IValidator;
  mandatory_docs: IValidator;
  extra_docs: IValidator;
  device_id: IValidator;
}

interface IValidator {
  valid: boolean;
  msg: string;
}
```

#### IProvider
Represents a loan provider/product:

```typescript
interface IProvider {
  id: number;
  name: string;
  client_code: string;
  expected_amount: number;
  loan_period: number;
  emi: number;
  require_dop: number;
  convert_type: "forward" | "redirect";
}
```

#### ILoanState
Complete state for the loan application process:

```typescript
interface ILoanState {
  currentLoanStep: LOAN_STEPS;
  loanStatus: LoanStatus | null;
  isSubmitting: boolean;
  userData: IUserData & Record<string, string | number | boolean>;
  userDataValidate: IUserDataValidate;
  leadData: {
    leadId: string;
    leadStatus: LeadStatus | null;
    otpStatus: OtpStatus;
    otpCount: number;
    otpAttemps: number;
    otpType: number;
    leadStatusPollingAttemps: number;
    sessionToken: string;
    loanStatus: LoanStatus;
    providers: IProvider[];
  };
  provider: {
    id?: string;
    name?: string;
    providedAmount?: string;
    providedMonthlyPay?: string;
  };
  trackingParams: any;
}
```

#### Enums for Loan Process

```typescript
enum LOAN_STEPS {
  HOMEPAGE = 1,
  OTP = 3,
  LOAN_EXTRA_INFO = 4,
  LOAN_FINDING = 5,
  LOAN_FINISH = 6,
}

enum LoanStatus {
  NEW = "",
  SUCCESS = "SUCCESS",
  EXISTED = "EXISTED",
  REJECTED = "REJECTED",
  PROCESSING = "PROCESSING",
}

enum LeadStatus {
  DRAFTING = "Drafting",
  VERIFIED = "Verified",
  ORGANIC = "Organic",
  DENIED = "Denied",
  WAITING = "Waiting",
  ASSIGNED = "Assigned",
  UNASSIGNED = "Unassigned",
  SENT = "Sent",
  SUCCESS = "Success",
}

enum OtpStatus {
  UNVERIFIED = 1,
  OTP_SUCCESS = 2,
  OTP_FAILED = 3,
  OTP_SUBMITTING = 4,
  OTP_EXPIRED = 5,
}
```

### Credit Card Models

#### ICard
Represents a credit card product:

```typescript
interface ICard {
  id: number;
  name: string;
  client_code: string;
  issuer: string;
  link: string;
  image_link: string;
  age_required_min: number;
  age_required_max: number;
  income_required: number;
  is_income_needing_validation: boolean;
  is_online_application: boolean;
  credit_limit: number;
  waive_fee_condition: string[];
  interest_rate: number;
  annual_fee: number;
  withdrawal_fee: number;
  min_withdrawal_fee: number;
  over_limit_fee: number;
  min_over_limit_fee: number;
  installment_fee: number;
  fx_fee: number;
  min_fx_fee: number;
  benefit: string[];
  drawback: string[];
  opening_gift_amount: number;
  opening_gift_desc: string[];
  benefit_rate: number;
  fee_rate: number;
  service_rate: number;
  procedure_rate: number;
  customer_rate: number;
  category_ids: number[];
  category_names: string[];
  provinces: string[];
  province_description: string;
  weight: number;
  features: string[];
  updated_at: string;
  user_reviews: IUserReview[];
}
```

#### ICardCategory
Represents a credit card category:

```typescript
interface ICardCategory {
  id: number;
  name: string;
  description?: string;
  status?: boolean;
}
```

#### IUserReview
Represents a user review for a credit card:

```typescript
interface IUserReview {
  customer_name: string;
  rate: number;
  comment: string;
  comment_time: string;
}
```

#### ICardState
Complete state for credit card functionality:

```typescript
interface ICardState {
  cardCats: ICardCategory[];
  allCards: ICard[];
  cards: { status: string, cards: ICard[] }; // cards selected by some conditions
  card: { status: string, card: ICard };
  suggestedCards: ICard[];
  inputComparedCards: ICard[];
  fullComparedCards: { status: string, fullComparedCards: ICard[] };
  saveRedirectCardTxResp: { status: number, link: string };
}
```

### Insurance Models

#### IInsurance
Represents an insurance product:

```typescript
interface IInsurance {
  id: number;
  name: string;
  client_code: string;
  issuer: string;
  link: string;
  image_link: string;
  fee: number;
  body_limit: number;
  property_limit: number;
  target: string;
  coverage: string;
  benefit: string;
  exclusion: string;
  indemnity_profile: string;
  rate: string;
  metadata: any;
}
```

#### IInsuranceCategory
Represents an insurance category:

```typescript
interface IInsuranceCategory {
  id: number;
  name: string;
  description?: string;
  status?: boolean;
}
```

#### IInsuranceState
Complete state for insurance functionality:

```typescript
interface IInsuranceState {
  insuranceCats: IInsuranceCategory[];
  allInsurances: IInsurance[];
  insurances: { status: string, insurances: IInsurance[] };
  insurance: { status: string, insurance: IInsurance };
}
```

### Tool Models

#### ISaving
Represents a savings product:

```typescript
interface ISaving {
  name: string;
  link: string;
  logo_link: string;
  ir: number; // interest rate
  interest: number;
  total: number;
}
```

## State Management

The application uses Zustand for state management with the following main stores:

### Loan Store (useLoanStore)
Manages the entire loan application flow including:
- User data and validation
- OTP verification process
- Lead status tracking
- Provider matching results

### Card Store (useCardStore)
Manages credit card data and operations:
- Card categories and listings
- Card filtering and comparison
- Card details and reviews
- Redirect transaction tracking

### Insurance Store (useInsuranceStore)
Manages insurance products:
- Insurance categories and listings
- Product filtering and details

### App Store (useAppStore)
Manages global application state:
- Theme settings
- Alert messages
- Device information
- Session tokens

### Banner Store (useBannerStore)
Manages promotional banners for different product categories.

### Tool Stores
- useSavingStore: Manages savings product data
- useSalaryConversionStore: Manages salary conversion calculations
- useIRCalcStore: Manages interest rate calculations

## API Payloads

### Loan Application Payloads

#### New Lead Request
```typescript
interface NewLeadRequest {
  // Mapped from IUserData
  full_name: string;
  phone_number: string;
  // ... other user fields
  
  // Additional fields
  tracking_params: TrackingParams;
  device_info: DeviceInfo;
  consent_id: string;
  device_id: string;
}
```

#### OTP Verification
```typescript
interface OTPRequest {
  otp: string;
  lead_id: string;
  consent_id: string;
}
```

#### Partner Redirect Request
```typescript
interface PartnerRedirectRequest {
  object_id: string;
  product: string;
  product_code: string;
  device_id: string;
  tracking_params: TrackingParams;
  device_info: DeviceInfo;
  metadata: Metadata;
}
```

### Card Redirect Transaction
```typescript
interface SaveCardRedirectTransactionRequest {
  id: number;
  link: string;
  deviceID?: string;
  deviceInfo?: string;
  trackingParams?: string;
  categoryIDs: number[];
}
```

## Mock Data Structures

### Bank Savings List
```typescript
export const bankSavingList = [
  {
    "name": "Timo",
    "link": "https://timo.vn/",
    "logo_link": "https://images.crunchbase.com/image/upload/c_lpad,h_170,w_170,f_auto,b_white,q_auto:eco,dpr_1/qph1bxwjrg8xhwidqisq",
    "ir": 6.55,
    "interest": 655000,
    "total": 10655000
  },
  // ... more banks
];
```

### Insurance Categories
```typescript
export const insuranceCatList = [
  { id: 0, name: "Tất cả" },
  { id: 1, name: "Bảo Hiểm Xe" },
  // ... more categories
];
```

### Insurance Products
```typescript
export const insuranceList = [
  {
    id: 1,
    name: "Bảo Hiểm Bắt Buộc Trách Nhiệm Dân Sự Xe Ô Tô",
    client_code: "BSH",
    issuer: "BSH",
    link: "",
    image_link: "bsh.png",
    fee: 480000,
    body_limit: 150000000,
    property_limit: 100000000,
    // ... more fields
  },
  // ... more insurance products
];
```

### Financial Institution Partners
```typescript
export const FIList: IPartner[] = [
  {
    id: "fecredit",
    name: "Công ty Tài chính TNHH MTV Ngân hàng Việt Nam Thịnh Vượng",
    desc: "",
    enabled: true,
    product: "all",
  },
  // ... more partners
];
```

## Data Relationships

### Loan Flow Relationships
1. **User Data** → **Lead Creation** → **OTP Verification** → **Additional Info** → **Provider Matching**
2. **IUserData** is validated using **IUserDataValidate**
3. **LeadData** contains the current state of the loan application
4. **IProvider** represents the matched loan products

### Credit Card Relationships
1. **ICard** belongs to one or more **ICardCategory** (via category_ids)
2. **ICard** contains multiple **IUserReview** entries
3. **ICard** is available in specific **provinces** (array of province names)
4. **ICard** has various rates and fees that are used for comparison

### Insurance Relationships
1. **IInsurance** belongs to one or more **IInsuranceCategory**
2. **IInsurance** contains metadata with specific limits and coverages

### Cross-Product Relationships
1. All products share common partner structure (**IPartner**)
2. All products use similar filtering patterns (category, amount, etc.)
3. All products support redirect tracking for analytics

## Key Design Patterns

### Validation Pattern
Each data model has a corresponding validation model that follows the structure:
```typescript
interface IModelValidate {
  field1: IValidator;
  field2: IValidator;
  // ... for each field
}

interface IValidator {
  valid: boolean;
  msg: string;
}
```

### API Response Pattern
Most API responses follow this structure:
```typescript
interface ApiResponse<T> {
  error: {
    code: number;
    message: string;
  };
  data: {
    [key: string]: T;
  };
}
```

### State Management Pattern
Each Zustand store follows this pattern:
```typescript
interface IState {
  // State properties
}

interface IActions {
  // Action methods
}

const useStore = create<IState & IActions>((set, get) => ({
  // State initializations
  // Action implementations
}));
```

## Constants and Configuration

### Product Types
```typescript
export const ALL_PRODUCTS = [
  { id: "lending", name: "Lending", displayName: "Vay tiêu dùng" },
  { id: "credit-card", name: "Credit Card", displayName: "Thẻ tín dụng" },
  { id: "car-insur", name: "Car Insurrance", displayName: "Bảo hiểm xe hơi" },
  { id: "mortgage", name: "Mortgage", displayName: "Gói vay HSSV" },
];
```

### Form Options
Various constants define form options for:
- Employment statuses
- Income ranges
- Credit statuses
- Career types
- And more...

These are used throughout the application to populate form dropdowns and validate inputs.