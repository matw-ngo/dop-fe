# Form Submission Flow

## Overview

This document describes all possible submission flows in the Digital Onboarding Platform (DOP), covering single-step and multi-step scenarios with various configurations.

## Complete Flow Diagram

```mermaid
flowchart TD
    Start([User on Page]) --> LoadFlow[Load Flow Config from API]
    LoadFlow --> CheckFlowSteps{How many steps<br/>in flow?}

    CheckFlowSteps -->|Single Step| SingleStepFlow[Single Step Flow]
    CheckFlowSteps -->|Multiple Steps| MultiStepFlow[Multi-Step Flow]

    %% ============================================================================
    %% SINGLE STEP FLOW (e.g., Homepage /index)
    %% ============================================================================

    SingleStepFlow --> FillForm1[User fills form fields]
    FillForm1 --> ClickSubmit1[User clicks Submit]
    ClickSubmit1 --> Validate1[Validate all fields]

    Validate1 -->|Validation Failed| ShowErrors1[Show Errors]
    ShowErrors1 --> ScrollToError1[Auto-scroll to first error]
    ScrollToError1 --> CheckToast1{Field has<br/>showToastOnError?}
    CheckToast1 -->|Yes + High Priority| ShowToast1[Show Toast Error]
    CheckToast1 -->|Yes + Low Priority<br/>+ No other errors| ShowToast1
    CheckToast1 -->|No or has other errors| FillForm1
    ShowToast1 --> FillForm1

    Validate1 -->|Validation Passed| CheckSendOtp1{Step has<br/>sendOtp: true?}

    %% No OTP Path
    CheckSendOtp1 -->|No| CheckNextStep1{Has next step<br/>in flow?}
    CheckNextStep1 -->|Yes| NavNextStep1[Navigate to next step page]
    CheckNextStep1 -->|No| StayOnPage1[Stay on current page]
    NavNextStep1 --> MultiStepFlow

    %% OTP Path
    CheckSendOtp1 -->|Yes| CheckPhoneInData{phone_number<br/>in form data?}

    CheckPhoneInData -->|No| CheckPhoneRequired{phone_number<br/>field required?}
    CheckPhoneRequired -->|No| ConfigError[⚠️ Configuration Error<br/>Toast: Config error]
    ConfigError --> FillForm1
    CheckPhoneRequired -->|Yes| CheckConsent1{Has valid<br/>consent?}

    CheckConsent1 -->|No| ShowConsentModal1[Show Consent Modal]
    ShowConsentModal1 --> UserGrantConsent1[User grants consent]
    UserGrantConsent1 --> CreateConsentSession1[Create consent session]
    CreateConsentSession1 --> ShowPhoneModal1[Show Phone Modal]

    CheckConsent1 -->|Yes| ShowPhoneModal1

    ShowPhoneModal1 --> UserEnterPhone1[User enters phone number]
    UserEnterPhone1 --> ValidatePhone1[Validate phone format & telco]
    ValidatePhone1 -->|Invalid| PhoneError1[Toast: Phone error]
    PhoneError1 --> UserEnterPhone1

    CheckPhoneInData -->|Yes| ValidatePhone1

    ValidatePhone1 -->|Valid| CreateLeadAPI[API: POST /leads]
    CreateLeadAPI -->|Success| SaveLeadData[Save leadId & token]
    CreateLeadAPI -->|Failed| LeadError[Toast: Submission failed]
    LeadError --> FillForm1

    SaveLeadData --> ShowOTPModal1[Show OTP Modal]
    ShowOTPModal1 --> UserEnterOTP1[User enters OTP code]
    UserEnterOTP1 --> VerifyOTP1[API: Verify OTP]

    VerifyOTP1 -->|Failed| OTPError1[Toast: OTP error]
    OTPError1 --> UserEnterOTP1

    VerifyOTP1 -->|Success| CreateVerifSession1[Create verification session]
    CreateVerifSession1 --> CheckNextStepOTP{Has next step<br/>in flow?}
    CheckNextStepOTP -->|Yes| NavToLoanInfo[Navigate to /loan-info<br/>with leadId & token]
    CheckNextStepOTP -->|No| NavToLoanInfo

    NavToLoanInfo --> LoanInfoPage

    %% ============================================================================
    %% MULTI-STEP FLOW (e.g., /loan-info, /personal-info, etc.)
    %% ============================================================================

    MultiStepFlow --> InitWizard[Initialize StepWizard<br/>with all steps]
    InitWizard --> ShowStep[Show current step]
    ShowStep --> FillFormStep[User fills step fields]
    FillFormStep --> ClickNext[User clicks Next/Submit]

    ClickNext --> CheckLastStep{Is last step?}

    %% Not Last Step - Click Next
    CheckLastStep -->|No - Click Next| ValidateStep[Validate current step]
    ValidateStep -->|Failed| ShowStepErrors[Show inline errors]
    ShowStepErrors --> ScrollToStepError[Auto-scroll to first error]
    ScrollToStepError --> FillFormStep

    ValidateStep -->|Passed| MarkStepComplete[Mark step as complete]
    MarkStepComplete --> IncrementStep[currentStep++]
    IncrementStep --> ShowStep

    %% Last Step - Click Submit
    CheckLastStep -->|Yes - Click Submit| ValidateLastStep[Validate last step]
    ValidateLastStep -->|Failed| ShowLastStepErrors[Show errors + Toast<br/>if showToastOnError]
    ShowLastStepErrors --> ScrollToLastError[Auto-scroll to first error]
    ScrollToLastError --> FillFormStep

    ValidateLastStep -->|Passed| GetAllData[Collect all steps data]
    GetAllData --> CheckLastStepOTP{Last step has<br/>sendOtp: true?}

    %% Last Step - No OTP
    CheckLastStepOTP -->|No| CheckHasLead{Has leadId<br/>from previous step?}
    CheckHasLead -->|Yes| SubmitLeadInfo[API: POST /leads/:id/submit-info]
    CheckHasLead -->|No| CreateLeadFinal[API: POST /leads]

    SubmitLeadInfo --> ShowLoanSearching
    CreateLeadFinal --> ShowLoanSearching

    %% Last Step - With OTP
    CheckLastStepOTP -->|Yes| CheckPhoneInLastStep{phone_number<br/>in data?}
    CheckPhoneInLastStep -->|No| CheckPhoneReqLast{phone_number<br/>required?}
    CheckPhoneReqLast -->|No| ConfigErrorLast[⚠️ Config Error]
    ConfigErrorLast --> FillFormStep

    CheckPhoneReqLast -->|Yes| CheckConsentLast{Has valid<br/>consent?}
    CheckConsentLast -->|No| ShowConsentModalLast[Show Consent Modal]
    ShowConsentModalLast --> UserGrantConsentLast[User grants consent]
    UserGrantConsentLast --> ShowPhoneModalLast[Show Phone Modal]
    CheckConsentLast -->|Yes| ShowPhoneModalLast

    ShowPhoneModalLast --> UserEnterPhoneLast[User enters phone]
    UserEnterPhoneLast --> ValidatePhoneLast[Validate phone]
    ValidatePhoneLast -->|Invalid| PhoneErrorLast[Toast: Phone error]
    PhoneErrorLast --> UserEnterPhoneLast

    CheckPhoneInLastStep -->|Yes| ValidatePhoneLast

    ValidatePhoneLast -->|Valid| CreateLeadAPILast[API: POST /leads]
    CreateLeadAPILast -->|Failed| LeadErrorLast[Toast: Failed]
    LeadErrorLast --> FillFormStep

    CreateLeadAPILast -->|Success| SaveLeadDataLast[Save leadId & token]
    SaveLeadDataLast --> ShowOTPModalLast[Show OTP Modal]
    ShowOTPModalLast --> UserEnterOTPLast[User enters OTP]
    UserEnterOTPLast --> VerifyOTPLast[API: Verify OTP]

    VerifyOTPLast -->|Failed| OTPErrorLast[Toast: OTP error]
    OTPErrorLast --> UserEnterOTPLast

    VerifyOTPLast -->|Success| CreateVerifSessionLast[Create verification session]
    CreateVerifSessionLast --> NavToNextPage[Navigate to next page<br/>with leadId & token]
    NavToNextPage --> LoanInfoPage

    %% ============================================================================
    %% LOAN INFO PAGE (Continuation)
    %% ============================================================================

    LoanInfoPage[Loan Info Page<br/>/loan-info] --> CheckLeadParams{Has leadId<br/>& token in URL?}
    CheckLeadParams -->|Yes| LoadLoanInfoForm[Load DynamicLoanForm<br/>page=/submit-info]
    CheckLeadParams -->|No| LoadLoanInfoForm

    LoadLoanInfoForm --> CheckConsentLoanInfo{Has valid<br/>consent?}
    CheckConsentLoanInfo -->|No| ShowConsentModalLoan[Show Consent Modal]
    ShowConsentModalLoan --> UserGrantConsentLoan[User grants consent]
    UserGrantConsentLoan --> FillLoanInfoForm[User fills loan info form]
    CheckConsentLoanInfo -->|Yes| FillLoanInfoForm

    FillLoanInfoForm --> SubmitLoanInfo[User submits form]
    SubmitLoanInfo --> ValidateLoanInfo[Validate fields]
    ValidateLoanInfo -->|Failed| ShowLoanInfoErrors[Show errors]
    ShowLoanInfoErrors --> FillLoanInfoForm

    ValidateLoanInfo -->|Passed| CheckLeadIdExists{Has leadId?}
    CheckLeadIdExists -->|Yes| UpdateLeadInfo[API: POST /leads/:id/submit-info]
    CheckLeadIdExists -->|No| CreateNewLead[API: POST /leads]

    UpdateLeadInfo --> ShowLoanSearching
    CreateNewLead --> ShowLoanSearching

    %% ============================================================================
    %% LOAN SEARCHING SCREEN
    %% NOTE: The submit-info API call is SYNCHRONOUS — the server runs distribution
    %% and returns matched_products in the same response. There is NO polling needed.
    %% The 3s animation is purely cosmetic (fake loading UX), not waiting for data.
    %% TODO: Replace the 3s hardcoded timeout with a proper transition after API resolves.
    %% ============================================================================

    ShowLoanSearching[Show LoanSearchingScreen<br/>Animation ~3s]
    ShowLoanSearching --> AnimationDone{Animation done +<br/>API response received?}
    AnimationDone -->|Products returned| StoreProducts[Store matchedProducts<br/>in Zustand]
    AnimationDone -->|No products + forward_result| StoreForwardResult[Store forwardResult<br/>in Zustand]
    AnimationDone -->|No products + no result| ShowEmptyState

    StoreProducts --> NavToLoanResult[Navigate to /loan-result]
    StoreForwardResult --> NavToLoanResult

    NavToLoanResult --> LoanResultPage

    %% ============================================================================
    %% LOAN RESULT PAGE (/loan-result)
    %% ============================================================================

    LoanResultPage[/loan-result page] --> CheckProductsInStore{matchedProducts<br/>in store?}
    CheckProductsInStore -->|No — page refresh or direct access| RedirectHome[Redirect to /]
    CheckProductsInStore -->|Yes| CheckForwardStatusResult{forwardStatus<br/>in store?}

    CheckForwardStatusResult -->|forwarded| ShowAutoForwardSuccess[Show SuccessView<br/>partner info + leadId]
    CheckForwardStatusResult -->|rejected| ShowErrorRejected[Show ErrorState<br/>Lead rejected by all partners]
    CheckForwardStatusResult -->|exhausted| ShowErrorExhausted[Show ErrorState<br/>No partners available]
    CheckForwardStatusResult -->|undefined / products available| ShowProductList[Show ProductListView<br/>sorted by priority]

    ShowProductList --> UserSelectProduct[User clicks Đăng ký vay<br/>on a ProductCard]
    UserSelectProduct --> ShowRegistrationSuccess[Show RegistrationSuccessView<br/>partner box + note]

    %% FIXME: No API call is made when user selects a product.
    %% TODO: Implement POST /leads/:id/forward with {product_id, partner_id}
    %% to actually forward the lead to the selected partner.
    %% Old-code equivalent: POST /upl/forward {id: productId, lead_id, client_code}
    %% Expected response: ForwardResult {status, partner_id, partner_name, partner_lead_id}

    ShowRegistrationSuccess --> UserClickBack[User clicks Quay lại]
    UserClickBack --> ShowProductList

    ShowEmptyState[Show EmptyState<br/>No matching products]

    %% ============================================================================
    %% SPECIAL CASES
    %% ============================================================================

    style ConfigError fill:#ff6b6b,stroke:#c92a2a,color:#fff
    style ConfigErrorLast fill:#ff6b6b,stroke:#c92a2a,color:#fff
    style ShowErrors1 fill:#ffd43b,stroke:#fab005
    style ShowStepErrors fill:#ffd43b,stroke:#fab005
    style ShowLastStepErrors fill:#ffd43b,stroke:#fab005
    style ShowLoanInfoErrors fill:#ffd43b,stroke:#fab005
    style PhoneError1 fill:#ff8787,stroke:#fa5252
    style PhoneErrorLast fill:#ff8787,stroke:#fa5252
    style LeadError fill:#ff8787,stroke:#fa5252
    style LeadErrorLast fill:#ff8787,stroke:#fa5252
    style OTPError1 fill:#ff8787,stroke:#fa5252
    style OTPErrorLast fill:#ff8787,stroke:#fa5252
    style ShowLoanSearching fill:#74c0fc,stroke:#339af0
    style ShowProductList fill:#74c0fc,stroke:#339af0
    style ShowAutoForwardSuccess fill:#51cf66,stroke:#37b24d,color:#fff
    style ShowRegistrationSuccess fill:#51cf66,stroke:#37b24d,color:#fff
    style ShowErrorRejected fill:#ff8787,stroke:#fa5252
    style ShowErrorExhausted fill:#ff8787,stroke:#fa5252
    style CreateVerifSession1 fill:#74c0fc,stroke:#339af0
    style CreateVerifSessionLast fill:#74c0fc,stroke:#339af0
    style RedirectHome fill:#ff8787,stroke:#fa5252
```

## Flow Scenarios

### Scenario 1: Single-Step Flow without OTP (Simple Form)

**Example**: Homepage with basic info collection, no phone verification

**Steps**:

1. User fills form on `/` (index page)
2. User clicks "Submit"
3. Validation passes
4. Check: `sendOtp: false`
5. Check: Has next step? → No
6. Stay on current page or show success

**Use Case**: Newsletter signup, basic contact form

---

### Scenario 2: Single-Step Flow with OTP (Homepage)

**Example**: Homepage with phone verification before proceeding

**Steps**:

1. User fills form on `/` (index page)
2. User clicks "Submit"
3. Validation passes
4. Check: `sendOtp: true`
5. Check: `phone_number` in data? → No
6. Show Phone Modal
7. User enters phone → Validate
8. Create Lead API → Success
9. Show OTP Modal
10. User enters OTP → Verify
11. Create verification session
12. Navigate to `/loan-info?leadId=X&token=Y`

**Use Case**: Quick loan application from homepage

---

### Scenario 3: Multi-Step Flow without OTP (Wizard)

**Example**: 3-step form (Personal Info → Financial Info → Submit)

**Steps**:

1. User on Step 1 (Personal Info)
2. Fill fields → Click "Next"
3. Validate Step 1 → Pass
4. Move to Step 2 (Financial Info)
5. Fill fields → Click "Next"
6. Validate Step 2 → Pass
7. Move to Step 3 (Submit)
8. Fill fields → Click "Submit"
9. Validate Step 3 → Pass
10. Check: Last step has `sendOtp: false`
11. Submit all data to API → API runs distribution synchronously
12. Show LoanSearchingScreen (3s cosmetic animation)
13. Navigate to `/loan-result`

**Use Case**: Detailed loan application without phone verification

---

### Scenario 4: Multi-Step Flow with OTP at Middle Step

**Example**: Step 1 (Basic) → Step 2 (OTP) → Step 3 (Financial) → Step 4 (Submit)

**Steps**:

1. User on Step 1 (Basic Info)
2. Fill fields → Click "Next"
3. Validate → Pass → Move to Step 2
4. Step 2 has `sendOtp: true`
5. User fills phone → Click "Next"
6. Validate → Pass
7. Show Phone Modal (if phone not in data)
8. Create Lead API
9. Show OTP Modal
10. Verify OTP → Success
11. Create verification session
12. Move to Step 3 (Financial Info)
13. **Navigation Security Active**: Cannot go back to Step 1-2
14. Fill Step 3 → Click "Next" → Move to Step 4
15. Fill Step 4 → Click "Submit" → API runs distribution
16. Show LoanSearchingScreen → Navigate to `/loan-result`

**Use Case**: Secure loan application with mid-flow verification

---

### Scenario 5: Multi-Step Flow with OTP at Last Step

**Example**: Step 1 (Personal) → Step 2 (Financial) → Step 3 (OTP + Submit)

**Steps**:

1. User completes Step 1 → Move to Step 2
2. User completes Step 2 → Move to Step 3
3. Step 3 has `sendOtp: true`
4. User fills final info → Click "Submit"
5. Validate → Pass
6. Show Phone Modal (if needed)
7. Create Lead API
8. Show OTP Modal
9. Verify OTP → Success
10. Create verification session
11. Navigate to next page or show success

**Use Case**: Final verification before submission

---

### Scenario 6: Multi-OTP Flow (Multiple Verification Points)

**Example**: Step 1 (Basic) → Step 2 (Phone OTP) → Step 3 (Financial) → Step 4 (Email OTP) → Step 5 (Submit)

**Steps**:

1. Complete Step 1 → Move to Step 2
2. Step 2 has `sendOtp: true` (phone)
3. Verify phone OTP → Create session #1
4. Move to Step 3 (cannot go back to 1-2)
5. Complete Step 3 → Move to Step 4
6. Step 4 has `sendOtp: true` (email)
7. Verify email OTP → Create session #2
8. Move to Step 5 (cannot go back to 1-4)
9. Complete Step 5 → Submit
10. Show Success

**Use Case**: High-security applications requiring multiple verifications

---

## Key Components

### 1. DynamicLoanForm

- **Props**: `page`, `initialData`, `onSubmitSuccess`
- **Responsibility**: Renders form for a specific page/step
- **Handles**: Validation, OTP flow, consent checks

### 2. StepWizard

- **Props**: `config`, `initialData`, `onComplete`
- **Responsibility**: Multi-step navigation and state management
- **Handles**: Step validation, progress tracking, navigation

### 3. WizardNavigation

- **Buttons**: Back, Next, Submit
- **Logic**:
  - Next: Validate → Move to next step
  - Submit: Validate → Call `onComplete`
- **Error Handling**: Scroll to error, show toast for special fields

### 4. LoanSearchingScreen

- **Location**: `src/components/loan-application/LoanSearching/LoanSearchingScreen.tsx`
- **Purpose**: Cosmetic animation screen shown while transitioning to results
- **Duration**: ~3s hardcoded timeout (see `use-loan-search-store.ts`)
- **Note**: The submit-info API is **synchronous** — distribution results come back
  in the same response. The animation is purely UX, not waiting for data.
  > **TODO**: Replace hardcoded `setTimeout(3000)` with proper transition that fires
  > as soon as both the API response _and_ a minimum display time have elapsed.

### 5. LoanResultScreen

**Purpose**: Display loan search results and matched products from distribution engine

**Location**: `src/components/loan-application/LoanSearching/LoanResultScreen.tsx`

**Responsibility**:
- State-based view router (orchestrator pattern)
- Delegates rendering to appropriate view components
- No UI logic - only state determination

**State Flow**:
```
forwardStatus === "forwarded"  → SuccessView   (auto-forwarded by backend)
matchedProducts.length > 0     → ProductListView
forwardStatus === "rejected"   → ErrorState
forwardStatus === "exhausted"  → ErrorState
no products & no status        → EmptyState
```

**Views** (modular, in `LoanResult/views/`):

| View | File | Purpose |
|------|------|---------|
| `ProductListView` | `ProductListView.tsx` | Display list of matched products |
| `SuccessView` | `SuccessView.tsx` | Show auto-forwarded success state |
| `RegistrationSuccessView` | `RegistrationSuccessView.tsx` | Show manual registration success |
| `EmptyState` | `EmptyState.tsx` | No matching products found |
| `ErrorState` | `ErrorState.tsx` | Error or rejected state |

**Components** (in `LoanResult/components/`):
- `ProductCard.tsx`: Individual product display with special partner support

**Config** (in `LoanResult/config/`):
- `special-partners.ts`: Partner-specific configurations (e.g., CathayBank)

**Utils** (in `LoanResult/utils/`):
- `formatters.ts`: Pure formatting functions (currency, period, etc.)

---

### 6. LoanSearchStore (Zustand)

**Purpose**: Global state management for loan search and result display

**Location**: `src/store/use-loan-search-store.ts`

**State**:
```typescript
interface LoanSearchState {
  isVisible: boolean;
  config: LoanSearchConfig | null;
  forwardStatus: ForwardStatus;  // undefined | "forwarded" | "rejected" | "exhausted"
  result: unknown;               // Generic result from API
  matchedProducts: matched_product[];  // Products from distribution
  error: string | null;
  isLoading: boolean;
}
```

**Actions**:
- `showLoanSearching(config)`: Show searching screen, reset state, start 3s timer
- `hideLoanSearching()`: Hide and reset all state
- `setForwardStatus(status)`: Update forward status from API
- `setResult(result)`: Set generic API result
- `setMatchedProducts(products)`: Set matched products from distribution
- `setError(error)`: Set error and update status to "rejected"

**Selectors**:
- `useLoanSearchVisible()`: Check if screen is visible
- `useForwardStatus()`: Get current forward status
- `useLoanSearchResult<T>()`: Type-safe result access
- `useMatchedProducts()`: Get matched products array
- `useLoanSearchError()`: Get error message

---

## API Endpoints

### POST /leads

**Purpose**: Create new lead
**Response**: `{ id, token, matched_products?, forward_result? }`

### POST /leads/:id/submit-info

**Purpose**: Submit lead info and trigger distribution engine
**Note**: This call is **synchronous** — the server blocks until distribution completes
and returns `matched_products` + `forward_result` in the same response.
There is **no need for polling** from the frontend.
**Response**: `{ next_step_id?, matched_products?, forward_result? }`

### POST /leads/:id/forward ⚠️ NOT YET IN API SPEC

**Purpose**: Manually forward a lead to a specific partner when user clicks "Đăng ký vay"
**Status**: **FIXME / TODO** — Endpoint does not exist in current `dop.yaml`
**Old-code equivalent**: `POST /upl/forward { id: productId, lead_id, client_code }`
**Proposed payload**:
```typescript
{
  product_id: string;   // matched_product.product_id
  partner_id: string;   // matched_product.partner_id
}
```
**Expected response**: `ForwardResult { status, partner_id, partner_name, partner_lead_id }`

### POST /leads/:id/verify-otp

**Purpose**: Verify OTP code

### POST /leads/:id/resend-otp

**Purpose**: Resend OTP

---

## Modals

### 1. Consent Modal

- **Trigger**: No valid consent + `consent_purpose_id` exists
- **Action**: User grants consent → Create consent session
- **Next**: Continue with original flow

### 2. Phone Verification Modal

- **Trigger**: `sendOtp: true` + phone not in data + phone required
- **Input**: Phone number
- **Validation**: Format + Telco check
- **Next**: Create Lead API

### 3. OTP Verification Modal

- **Trigger**: Lead created successfully
- **Input**: 6-digit OTP code
- **Validation**: API verification
- **Next**: Create verification session → Navigate

---

## Navigation Security

### Verification Session

- **Created**: After successful OTP verification
- **Purpose**: Prevent back navigation to pre-OTP steps
- **Storage**: Auth store + session storage (encrypted)
- **Check**: `canNavigateBack(targetStep)` in wizard store

### Rules

1. User can navigate forward freely
2. User can navigate back to steps BEFORE OTP step
3. User CANNOT navigate back to OTP step or earlier after verification
4. Session expires after timeout (configurable)

---

## Error Handling

### Validation Errors

- **Inline**: Show below field (default)
- **Toast**: For fields with `showToastOnError: true`
- **Priority**:
  - High (0): Always show toast
  - Low (>0): Show only if no other errors
- **Auto-scroll**: Focus first error field

### API Errors

- **Lead Creation Failed**: Toast error → Stay on form
- **OTP Verification Failed**: Toast error → Allow retry
- **Network Error**: Toast error → Allow retry
- **No matched products**: Show EmptyState on `/loan-result`
- **Forward rejected/exhausted**: Show ErrorState on `/loan-result`

### Configuration Errors

- **sendOtp: true but phone not required**: Toast config error
- **Missing consent_purpose_id**: Skip consent check
- **Invalid flow config**: Show error message

---

## About Distribution & Polling

The old-code (`POST /upl/submit-info`) was also a single synchronous call — no polling was used. The server runs the distribution engine inline and returns the result immediately. This pattern is preserved in the new API (`POST /leads/:id/submit-info`).

**Current implementation note**: `use-loan-search-store.ts` uses a `setTimeout(3000)` purely for cosmetic UX (to show the searching animation for at least 3 seconds). This is NOT polling — the data is already in the store before the timer fires.

> **TODO**: Consider implementing a minimum display time + "data ready" flag approach
> instead of a flat 3s timeout, so the UI transitions as soon as both conditions are met.

---

## Testing Profiles

Located in `src/__tests__/msw/profiles/`:

1. **default**: OTP at step 3 (middle)
2. **otp-at-step-1**: OTP at first step
3. **otp-at-step-3**: OTP at step 3
4. **otp-at-last-step**: OTP at final step
5. **no-otp-flow**: No OTP verification
6. **multi-otp-flow**: Multiple OTP steps
7. **with-ekyc**: Includes eKYC verification

---

## Common Issues

### Issue 1: Toast not showing on Next button

**Problem**: Toast only shows on Submit, not on Next
**Solution**: Add toast logic to `handleNext()` in WizardNavigation

### Issue 2: Phone modal shows when phone already collected

**Problem**: Logic doesn't check if phone in form data
**Solution**: Check `data.phone_number` before showing modal

### Issue 3: Cannot navigate back after OTP

**Problem**: Verification session blocks navigation
**Solution**: This is intended behavior for security

### Issue 4: Consent modal shows repeatedly

**Problem**: Consent session not persisted
**Solution**: Check `hasConsent()` before showing modal

### Issue 5: User clicks "Đăng ký vay" but no API call is made

**Problem**: `onSelectProduct` in `/loan-result` page only shows local `RegistrationSuccessView` without forwarding the lead
**Solution**: Implement `POST /leads/:id/forward` in backend, then call it from `loan-result/page.tsx` when product is selected

---

## Future Enhancements

1. **Forward API**: Implement `POST /leads/:id/forward` to actually forward lead to selected partner
2. **Resume Flow**: Save progress and resume later
3. **Multi-language OTP**: Support SMS in multiple languages
4. **Biometric Verification**: Alternative to OTP
5. **Step Skipping**: Conditional step visibility
6. **Parallel Steps**: Multiple steps at once (tabs)

---

## Related Documentation

- [Navigation Security](./navigation-security.md)
- [Consent System](./consent/README.md)
- [Form Generation](./form-generation/README.md)
- [Testing Guide](./testing/README.md)
