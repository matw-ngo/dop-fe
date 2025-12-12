# Migration Map: Old ApplyLoanForm → New Project Structure

## Overview
This document provides a comprehensive mapping of constants, logic, and components from the old ApplyLoanForm to the new project structure in `src/`. It identifies what already exists, what needs to be migrated, and how to integrate them.

## 1. CONSTANTS MIGRATION

### Old Constants (from docs/old-code/modules/ApplyLoanForm)
```typescript
// Loan Amount Configuration
const MIN_LOAN_AMOUNT = 5_000_000;    // 5 million VND
const MAX_LOAN_AMOUNT = 90_000_000;   // 90 million VND
const LOAN_AMOUNT_STEP = 5_000_000;   // 5 million VND increments

// Loan Period Configuration
const MIN_LOAN_PERIOD = 3;            // 3 months
const MAX_LOAN_PERIOD = 36;           // 36 months
const LOAN_PERIOD_STEP = 1;           // 1 month increments

// Loan Purposes
const LOAN_PURPOSES = [
  { value: '-1', label: 'Chọn mục đích vay', disabled: true },
  { value: '1', label: 'Vay tiêu dùng' },
  { value: '2', label: 'Vay kinh doanh' },
  { value: '3', label: 'Vay mua nhà' },
  { value: '4', label: 'Vay mua xe' },
  { value: '5', label: 'Vay học phí' },
  { value: '6', label: 'Vay khác' },
];

// Supported Telcos for OTP
const ALLOWED_TELCOS = ['viettel', 'vinaphone', 'mobifone'];

// OTP Configuration
const OTP_LENGTH = 4;
const OTP_EXPIRED_TIME_SECONDS = 150; // 2.5 minutes
const MAX_OTP_ATTEMPTS = 3;
const MAX_OTP_REFRESH = 1;

// Form Steps
const LOAN_STEPS = {
  HOMEPAGE: 'homepage',
  PHONE: 'phone',
  OTP: 'otp',
  LOAN_EXTRA_INFO: 'loan_extra_info',
  LOAN_FINDING: 'loan_finding',
  LOAN_RESULT: 'loan_result'
};
```

### Migration to New Structure

#### 1.1 Create `/src/constants/loan-application.ts`
```typescript
// NEW: src/constants/loan-application.ts
export const LOAN_APPLICATION_CONSTANTS = {
  // Amount configuration (extends existing defaults)
  amount: {
    ...LOAN_DEFAULTS, // from src/lib/constants/tools.ts
    min: 5_000_000,
    max: 90_000_000,
    step: 5_000_000,
    presets: [10_000_000, 20_000_000, 50_000_000, 90_000_000],
  },

  // Period configuration
  period: {
    min: 3,
    max: 36,
    step: 1,
    presets: [6, 12, 24, 36],
  },

  // Loan purposes (mapped to Vietnamese context)
  purposes: [
    { value: 'consumption', label: 'Vay tiêu dùng', icon: 'shopping' },
    { value: 'business', label: 'Vay kinh doanh', icon: 'briefcase' },
    { value: 'home_renovation', label: 'Vay sửa nhà', icon: 'home' },
    { value: 'education', label: 'Vay học phí', icon: 'graduation' },
    { value: 'medical', label: 'Vay y tế', icon: 'medical' },
    { value: 'debt_consolidation', label: 'Vay hợp nhất nợ', icon: 'debt' },
  ] as const,

  // OTP configuration (can use existing AUTH_CONSTANTS)
  otp: {
    length: 4,
    expirySeconds: 150,
    maxAttempts: 3,
    maxRefresh: 1,
  },

  // Form steps (map to existing step management)
  steps: {
    initial: 'loan-details',
    phone: 'phone-verification',
    otp: 'otp-verification',
    personal: 'personal-info',
    financial: 'financial-info',
    documents: 'document-upload',
    review: 'application-review',
  } as const,
} as const;
```

## 2. VALIDATION LOGIC MIGRATION

### Old Phone Validation Logic
```typescript
// From mobile-num.ts
export const phoneValidation = (num: string) => {
  // Vietnamese mobile number validation
  // Carrier detection
  // Number standardization
};
```

### New Location
✅ **ALREADY EXISTS**: `/src/lib/telcos/phone-validation.ts`

**Integration**:
```typescript
// In form configuration
import { validateVietnamesePhone, getCarrier } from '@/lib/telcos/phone-validation';

const phoneField = {
  type: 'phone',
  name: 'phoneNumber',
  label: 'Số điện thoại',
  validation: (value: string) => {
    const result = validateVietnamesePhone(value);
    return {
      isValid: result.isValid,
      message: result.isValid ? undefined : result.error,
      carrier: result.carrier,
    };
  },
  // Check if carrier supports OTP
  validateCarrier: (carrier: string) => {
    return ['VIETTEL', 'VINAPHONE', 'MOBIFONE'].includes(carrier.toUpperCase());
  }
};
```

## 3. STATE MANAGEMENT MIGRATION

### Old Zustand Store Structure
```typescript
interface ILoanState {
  currentLoanStep: LOAN_STEPS;
  userData: IUserData;
  userDataValidate: IUserDataValidate;
  leadData: {
    leadId: string;
    otpStatus: OtpStatus;
    sessionToken: string;
    providers: IProvider[];
  };
  isSubmitting: boolean;
}
```

### New Location
✅ **ALREADY EXISTS**: `/src/store/use-loan-store.ts`

**Integration**:
```typescript
// Extend existing store for ApplyLoanForm needs
interface LoanApplicationState extends BaseLoanState {
  // Already exists in base store
  step: string;
  formData: LoanApplicationData;
  validation: ValidationState;

  // Add ApplyLoanForm specific state
  phoneNumber?: string;
  otpVerified: boolean;
  leadId?: string;
  sessionToken?: string;

  // UI state
  showPhoneModal: boolean;
  showOtpModal: boolean;
  isSubmitting: boolean;
}

// Use existing store with additional actions
const useLoanApplication = () => {
  const store = useLoanStore();

  return {
    ...store,
    // ApplyLoanForm specific actions
    setPhoneNumber: (phone: string) => store.updateField('personalInfo', { phone }),
    verifyOtp: (otp: string) => {
      // Integrate with existing OTP system
      return verifyOtpMutation.mutateAsync({ otp, leadId: store.leadId });
    },
  };
};
```

## 4. API ENDPOINTS MIGRATION

### Old API Configuration
```typescript
const ApiUrl = {
  NEW_LEAD: `${BASE_API_URL}/upl/new`,
  SUBMIT_OTP: `${BASE_API_URL}/otp/submit`,
  REQUEST_NEW_OTP: `${BASE_API_URL}/otp/renew`,
  SUBMIT_LEAD: `${BASE_API_URL}/upl/submit-info`,
  FORWARD_LEAD: `${BASE_API_URL}/upl/forward`,
};
```

### New Location
✅ **ALREADY EXISTS**: `/src/lib/api/endpoints/loans.ts`

**Integration**:
```typescript
// Add missing endpoints to existing file
export const loanApplicationEndpoints = {
  // Existing endpoints...
  applyLoan: '/loans/apply', // Maps to NEW_LEAD
  verifyOtp: '/auth/otp/verify', // Maps to SUBMIT_OTP
  resendOtp: '/auth/otp/resend', // Maps to REQUEST_NEW_OTP
  submitInfo: '/loans/submit-info', // Maps to SUBMIT_LEAD
  forwardLead: '/loans/forward', // Maps to FORWARD_LEAD
} as const;
```

## 5. COMPONENT MIGRATION

### 5.1 Main Component

#### Old: `docs/old-code/modules/ApplyLoanForm/index.tsx`
#### New: `/src/components/loan-application/QuickLoanApplication.tsx`

```typescript
// NEW: Using existing FormRenderer
import { FormRenderer } from '@/components/renderer/FormRenderer';
import { loanApplicationFields } from '@/config/loan-application-fields';
import { useLoanApplication } from '@/hooks/loan/use-loan-application';

export const QuickLoanApplication = () => {
  const { formData, updateField, submitApplication } = useLoanApplication();

  return (
    <FormRenderer
      fields={loanApplicationFields.initialStep}
      data={formData}
      onChange={updateField}
      onSubmit={submitApplication}
      theme="loan"
    />
  );
};
```

### 5.2 Slider Components

#### Old: Custom amount/period sliders
#### New: Extend existing field builders

```typescript
// NEW: src/components/fields/LoanAmountSlider.tsx
import { FieldBuilder } from '@/components/renderer/FieldBuilder';

export const loanAmountField: FieldBuilder = {
  type: 'loan-amount',
  name: 'loanAmount',
  label: 'Khoản vay mong muốn',
  component: LoanAmountSlider,
  // Use existing constants
  config: LOAN_APPLICATION_CONSTANTS.amount,
};

// NEW: src/components/fields/LoanAmountSlider.tsx
export const LoanAmountSlider = ({ value, onChange, config }) => {
  return (
    <div className="loan-amount-slider">
      <Slider
        value={value}
        onChange={onChange}
        min={config.min}
        max={config.max}
        step={config.step}
        formatValue={formatVND}
        presets={config.presets}
      />
    </div>
  );
};
```

### 5.3 Modal Components

#### Old: Phone and OTP modals
#### New: Use existing modal system

```typescript
// NEW: src/components/loan-application/PhoneVerificationModal.tsx
import { Modal } from '@/components/ui/modal';
import { PhoneInput } from '@/components/fields/PhoneInput';

export const PhoneVerificationModal = ({ isOpen, onClose, onVerify }) => {
  const [phoneNumber, setPhoneNumber] = useState('');

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <Modal.Header>Xác thực số điện thoại</Modal.Header>
      <Modal.Body>
        <PhoneInput
          value={phoneNumber}
          onChange={setPhoneNumber}
          validation="vietnamese"
        />
      </Modal.Body>
      <Modal.Footer>
        <Button onClick={() => onVerify(phoneNumber)}>
          Gửi mã OTP
        </Button>
      </Modal.Footer>
    </Modal>
  );
};
```

## 6. BUSINESS LOGIC MIGRATION

### 6.1 Form Validation

#### Old: Manual validation functions
#### New: Use existing Zod validation system

```typescript
// NEW: src/config/schemas/loan-application.ts
import { z } from 'zod';
import { vietnamesePhoneSchema } from '@/lib/validation/phone';

export const loanApplicationSchema = z.object({
  loanDetails: z.object({
    amount: z.number().min(5_000_000).max(90_000_000),
    term: z.number().min(3).max(36),
    purpose: z.enum(['consumption', 'business', 'home_renovation']),
  }),
  personalInfo: z.object({
    fullName: z.string().min(2),
    phoneNumber: vietnamesePhoneSchema,
    email: z.string().email(),
  }),
});
```

### 6.2 Event Tracking

#### Old: Custom event tracking
#### New: Use existing analytics system

```typescript
// NEW: src/lib/analytics/loan-events.ts
import { trackEvent } from '@/lib/analytics';

export const loanEvents = {
  formStarted: () => trackEvent('loan_application_started'),
  amountChanged: (amount: number) => trackEvent('loan_amount_changed', { amount }),
  termChanged: (term: number) => trackEvent('loan_term_changed', { term }),
  phoneSubmitted: (phone: string) => trackEvent('phone_submitted', { phone }),
  otpVerified: () => trackEvent('otp_verified'),
  formSubmitted: (data: any) => trackEvent('loan_application_submitted', data),
};
```

## 7. HOOKS MIGRATION

### Missing Hooks to Create

```typescript
// NEW: src/hooks/loan/use-loan-calculator.ts
export const useLoanCalculator = (amount: number, term: number) => {
  const monthlyPayment = useMemo(() => {
    const rate = 0.022; // 2.2% monthly
    return (amount * (1 + rate * term)) / term;
  }, [amount, term]);

  const totalInterest = monthlyPayment * term - amount;

  return { monthlyPayment, totalInterest };
};

// NEW: src/hooks/loan/use-otp-verification.ts
export const useOtpVerification = () => {
  const [otpSent, setOtpSent] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  const sendOtp = async (phone: string) => {
    // Use existing API
    await sendOtpMutation.mutateAsync({ phone });
    setOtpSent(true);
    startCooldown();
  };

  return { sendOtp, otpSent, cooldown };
};
```

## 8. CONFIGURATION MIGRATION

### Field Configuration

```typescript
// NEW: src/config/loan-application-fields.ts
import { LOAN_APPLICATION_CONSTANTS } from '@/constants/loan-application';

export const loanApplicationFields = {
  initialStep: [
    loanAmountField,
    loanTermField,
    loanPurposeField,
    termsAndConditionsField,
  ],
  phoneVerification: [
    phoneField,
  ],
  // ... other steps
};
```

## 9. STYLING MIGRATION

### Old: SCSS modules
### New: Tailwind CSS + shadcn/ui components

```typescript
// Convert SCSS to Tailwind classes
const loanApplicationStyles = {
  form: 'max-w-2xl mx-auto p-6 space-y-6',
  slider: 'w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer',
  modal: 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center',
  // ... more styles
};
```

## 10. TESTING MIGRATION

```typescript
// NEW: src/components/loan-application/__tests__/QuickLoanApplication.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { QuickLoanApplication } from '../QuickLoanApplication';

describe('QuickLoanApplication', () => {
  it('should render loan amount slider', () => {
    render(<QuickLoanApplication />);
    expect(screen.getByLabelText('Khoản vay mong muốn')).toBeInTheDocument();
  });

  it('should validate phone number', async () => {
    render(<QuickLoanApplication />);
    const phoneInput = screen.getByLabelText('Số điện thoại');

    fireEvent.change(phoneInput, { target: { value: 'invalid' } });
    expect(await screen.findByText('Số điện thoại không hợp lệ')).toBeInTheDocument();
  });
});
```

## IMPLEMENTATION PRIORITY

### Phase 1: Core Infrastructure (Week 1)
1. ✅ Use existing FormRenderer
2. ✅ Leverage existing loan store
3. ✅ Integrate with existing phone validation
4. ⚠️ Create loan application constants
5. ⚠️ Define field configurations

### Phase 2: Missing Components (Week 2)
1. ⚠️ Create loan-specific field components
2. ⚠️ Implement OTP verification flow
3. ⚠️ Build modal components
4. ⚠️ Add missing hooks

### Phase 3: Integration (Week 3)
1. ⚠️ Connect all components
2. ⚠️ Implement API integration
3. ⚠️ Add analytics tracking
4. ⚠️ Write tests

### Phase 4: Polish (Week 4)
1. ⚠️ Optimize performance
2. ⚠️ Add error handling
3. ⚠️ Improve accessibility
4. ⚠️ Document code

## CONCLUSION

The new project structure already has most of the infrastructure needed for the ApplyLoanForm. The migration primarily involves:

1. **Mapping old constants to new configuration files**
2. **Leveraging existing FormRenderer instead of custom implementation**
3. **Using existing validation and state management systems**
4. **Creating missing loan-specific components and hooks**

This approach ensures consistency with the current architecture while reducing development time.