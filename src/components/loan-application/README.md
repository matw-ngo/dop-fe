# Loan Application Form Component

A modular, type-safe React component for loan applications with phone verification and OTP support.

## Features

- ✅ **Type-safe**: Full TypeScript support with Zod validation
- ✅ **Modular**: Split into reusable components
- ✅ **Phone Verification**: Built-in phone number validation with telecom provider check
- ✅ **OTP Support**: SMS-based OTP verification
- ✅ **Form Validation**: Client-side validation with React Hook Form
- ✅ **Internationalization**: Next-intl support for multiple languages
- ✅ **Accessible**: ARIA labels and keyboard navigation
- ✅ **Tested**: Comprehensive unit and integration tests

## Architecture

The loan application form has been refactored from a 415-line monolith into focused components:

```
src/components/loan-application/
├── ApplyLoanForm/           # Main component (legacy)
├── components/              # Reusable UI components
│   ├── AmountField.tsx      # Loan amount slider
│   ├── PeriodField.tsx      # Loan period slider
│   ├── PurposeField.tsx     # Loan purpose dropdown
│   ├── TermsAgreement.tsx   # Terms and conditions
│   ├── SubmitButton.tsx     # Form submit button
│   ├── FormLayout.tsx       # Form wrapper
│   ├── PhoneVerificationModal.tsx  # Phone input modal
│   └── OtpVerificationModal.tsx    # OTP verification modal
├── hooks/                   # Custom hooks
│   ├── useLoanApplicationForm.ts  # Main form logic
│   ├── useModal.ts          # Modal state management
│   └── useTracking.ts       # Analytics tracking
├── utils/                   # Utility functions
│   └── phoneValidation.ts   # Phone number validation
├── schema.ts                # Zod validation schemas
├── types.ts                 # TypeScript type definitions
├── constants.ts             # Magic numbers and strings
└── __tests__/               # Test files
```

## Installation

The component uses peer dependencies that should already be installed in your project:

```json
{
  "peerDependencies": {
    "react": "^18.0.0",
    "react-hook-form": "^7.63.0",
    "zod": "^4.1.11",
    "@hookform/resolvers": "^3.3.0",
    "next-intl": "^3.0.0",
    "sonner": "^1.0.0"
  }
}
```

## Usage

### Basic Usage

```tsx
import { ApplyLoanForm } from "@/components/loan-application";

function LoanPage() {
  return <ApplyLoanForm />;
}
```

### Using Individual Components

```tsx
import {
  AmountField,
  PeriodField,
  PurposeField,
  TermsAgreement,
  SubmitButton,
  FormLayout,
} from "@/components/loan-application";

function CustomLoanForm() {
  const [amount, setAmount] = useState(12);
  const [period, setPeriod] = useState(6);
  // ... other state

  return (
    <FormLayout>
      <AmountField
        value={amount}
        onChange={setAmount}
        label="Loan Amount"
        min={5}
        max={90}
      />
      <PeriodField
        value={period}
        onChange={setPeriod}
        label="Loan Period"
        min={3}
        max={36}
      />
      <PurposeField
        value={purpose}
        onChange={setPurpose}
        options={loanPurposes}
        label="Purpose"
      />
      <TermsAgreement
        value={agreeStatus}
        onChange={setAgreeStatus}
      />
      <SubmitButton
        isSubmitting={isSubmitting}
        onClick={handleSubmit}
      />
    </FormLayout>
  );
}
```

### Using the Custom Hook

```tsx
import { useLoanApplicationForm } from "@/components/loan-application";

function MyLoanForm() {
  const {
    form,
    errors,
    isSubmitting,
    modals,
    showPhoneModal,
    handlePhoneSubmit,
    handleOtpSuccess,
    // ... other returned values
  } = useLoanApplicationForm();

  // Use React Hook Form methods with the form control
  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      {/* Your form fields */}
    </form>
  );
}
```

## API Reference

### Components

#### AmountField

Props for the loan amount slider component:

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| value | number | - | Current amount (in millions) |
| onChange | (value: number) => void | - | Callback when value changes |
| label | string | "Loan Amount" | Field label |
| min | number | 5 | Minimum amount |
| max | number | 90 | Maximum amount |
| step | number | 5 | Step increment |
| disabled | boolean | false | Disable the slider |
| error | string | - | Error message to display |

#### PeriodField

Props for the loan period slider component:

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| value | number | - | Current period (in months) |
| onChange | (value: number) => void | - | Callback when value changes |
| label | string | "Loan Period" | Field label |
| min | number | 3 | Minimum months |
| max | number | 36 | Maximum months |
| step | number | 1 | Step increment |
| disabled | boolean | false | Disable the slider |
| error | string | - | Error message to display |

#### PurposeField

Props for the loan purpose dropdown component:

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| value | string | - | Selected purpose value |
| onChange | (value: string) => void | - | Callback when selection changes |
| options | Array<{value: string, label: string}> | - | List of available purposes |
| label | string | "Loan Purpose" | Field label |
| placeholder | string | "Select purpose" | Placeholder text |
| disabled | boolean | false | Disable the dropdown |
| error | string | - | Error message to display |

#### TermsAgreement

Props for the terms and conditions component:

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| value | string | - | Selected value ("0", "1", or "") |
| onChange | (value: string) => void | - | Callback when selection changes |
| error | string | - | Error message to display |
| termsLink | string | "/dieu-khoan-su-dung" | URL to terms page |
| termsText | string | "I agree to..." | Custom terms text |

#### PhoneVerificationModal

Props for the phone verification modal:

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| open | boolean | false | Whether modal is open |
| onClose | () => void | - | Callback when modal closes |
| onVerify | (phone: string) => void | - | Callback with verified phone |
| title | string | "Verify Phone" | Modal title |
| description | string | "Enter number" | Modal description |

### Hooks

#### useLoanApplicationForm

Main hook for form state management:

```tsx
const {
  form,              // React Hook Form control
  errors,            // Form errors
  isSubmitting,      // Submission state
  isValid,           // Form validity
  isDirty,           // Form dirty state
  handleSubmit,      // Submit handler
  onSubmit,          // Submit function
  modals,            // Modal states {phone, otp}
  showPhoneModal,    // Show phone modal
  hidePhoneModal,    // Hide phone modal
  showOtpModal,      // Show OTP modal
  hideOtpModal,      // Hide OTP modal
  values,            // Current form values
} = useLoanApplicationForm();
```

#### useModal

Simple modal state management hook:

```tsx
const { modals, actions } = useModal();

// modals.phone - Phone modal open state
// modals.otp - OTP modal open state
// actions.showPhoneModal() - Open phone modal
// actions.hidePhoneModal() - Close phone modal
// actions.showOtpModal() - Open OTP modal
// actions.hideOtpModal() - Close OTP modal
// actions.hideAllModals() - Close all modals
```

### Validation

The form uses Zod schemas for validation:

```typescript
import { loanApplicationSchema } from "@/components/loan-application/schema";

// Schema includes:
// - expected_amount: number between 5-90
// - loan_period: number between 3-36
// - loan_purpose: required string
// - phone_number: optional, valid phone format
// - agreeStatus: must be "1" (agreed)
```

## Internationalization

The component supports multiple languages through next-intl:

```typescript
// Translation keys used:
features.loan-application:
  - expectedAmount.label
  - loanPeriod.label
  - loanPeriod.unit
  - loanPurpose.label
  - loanPurpose.placeholder
  - otp.title
  - otp.description
  - otp.placeholder
  - otp.continue
  - errors.*
  - messages.*
```

## Testing

Run tests for the loan application components:

```bash
# Run all tests
npm test loan-application

# Run tests with coverage
npm test loan-application -- --coverage

# Run tests in watch mode
npm test loan-application -- --watch
```

### Test Files

- `__tests__/useLoanApplicationForm.test.ts` - Hook tests
- `__tests__/useModal.test.ts` - Modal hook tests
- `__tests__/integration.test.tsx` - Integration tests
- `components/__tests__/*.test.tsx` - Component tests

## Styling

The components use Tailwind CSS classes defined in `constants.ts`:

```typescript
export const CSS_CLASSES = {
  CONTAINER: "font-['Lexend_Deca'] max-w-2xl mx-auto p-4",
  FIELD_WRAPPER: "relative mb-[34px] rounded-lg border border-[#bfd1cc] bg-white p-4 pb-[9px]",
  // ... more classes
};
```

Custom styling can be applied by overriding these classes or passing additional `className` props.

## Contributing

When making changes:

1. Update types in `types.ts` if adding new props
2. Add/update schemas in `schema.ts` for validation changes
3. Write tests for new functionality
4. Update Storybook stories if adding components
5. Keep the documentation up to date

## Migration from Legacy Component

The legacy `ApplyLoanForm` component is still available. To migrate:

1. Import individual components instead of the monolith
2. Use `useLoanApplicationForm` hook for state management
3. Replace inline validation with Zod schemas
4. Use new modal components instead of inline modals

Example migration:

```tsx
// Before
import ApplyLoanForm from "./ApplyLoanForm";

// After
import {
  AmountField,
  PeriodField,
  PurposeField,
  TermsAgreement,
  SubmitButton,
  useLoanApplicationForm,
} from "@/components/loan-application";
```