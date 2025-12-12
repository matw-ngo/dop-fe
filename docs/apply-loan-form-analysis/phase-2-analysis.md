# ApplyLoanForm Component - Phase 2: Code Analysis

## Implementation Details Deep Dive

### 1. Form State Management

#### Zustand Store Integration
```typescript
// Store selectors for optimized re-renders
const {
  setUserLoanData,      // Updates form field values
  setUserLoanValidate,  // Updates validation state
  leadData,            // Lead information from API
  userData,            // Form data state
  userDataValidate,    // Validation state for each field
  isSubmitting,        // Loading state
  navigateToHomepage,  // Navigation helper
  currentLoanStep,     // Current step in loan flow
} = useLoanStore();
```

#### State Update Pattern
```typescript
// Form field update with immediate state change
const onAmountChange = (value: number) => {
  setUserLoanData("expected_amount", value);
  // Tracking event sent with value
  eventTracking(EventType.lending_page_input_expected_amount, {
    expected_amount: value,
  });
};

// Phone validation with carrier detection
const validatePhoneNum = () => {
  let value = userData.phone_number;
  let phoneVerify = phoneValidation(value);

  if (phoneVerify.valid) {
    // Check if telco is supported for OTP
    if (!ALLOWED_TELCOS.includes(phoneVerify.telco)) {
      setUserLoanValidate(
        "phone_number",
        false,
        `Chỉ hỗ trợ nhà mạng ${ALLOWED_TELCOS.join(", ")}`
      );
      return false;
    }
    // Standardize phone number to international format
    setUserLoanData("phone_number", phoneVerify.validNum);
    setUserLoanValidate("phone_number", true, "");
    return true;
  }
  return false;
};
```

### 2. Business Logic Implementation

#### Vietnamese Mobile Number Validation
```typescript
// Comprehensive phone number validation with carrier detection
export const phoneValidation = (num: string) => {
  let result = { valid: false, telco: "", validNum: "" };

  if (!num) return result;

  // Standardize number format
  let phoneNum = standardizePhoneNum(num);

  // Validate against Vietnamese mobile regex
  if (isVNMobileNum(phoneNum)) {
    result.valid = true;
    result.validNum = phoneNum;

    // Detect carrier using regex patterns
    if (viettelRegex.test(phoneNum)) {
      result.telco = TELCO.VIETTEL;
    } else if (vinaphoneRegex.test(phoneNum)) {
      result.telco = TELCO.VINAPHONE;
    } else if (mobifoneRegex.test(phoneNum)) {
      result.telco = TELCO.MOBIFONE;
    }
    // ... other carriers
  }

  return result;
};

// Phone number standardization logic
export const standardizePhoneNum = (phone: string) => {
  if (!phone) return "";

  // Remove international prefixes
  phone = phone.replace(/^(\+)/, "");
  phone = phone.replace(/^(00)/, "");

  // Convert to Vietnam international format (84)
  if (!HasPrefix(phone, "84")) {
    if (!HasPrefix(phone, "0")) {
      phone = "84" + phone;
    } else if (HasPrefix(phone, "0")) {
      phone = "84" + phone.slice(1);
    }
  }

  // Handle number porting (old prefixes to new)
  if (convertMap[phone.slice(0, 5)]) {
    return convertMap[phone.slice(0, 5)] + phone.slice(5);
  }

  return phone;
};
```

#### OTP Flow with Timer Management
```typescript
// OTP timer with countdown
const [otpTimeout, setOtpTimeout] = useState(OtpConfig.OTP_EXPIRED_TIME_SECONDS);

useEffect(() => {
  const counterId = setTimeout(() => {
    if (otpTimeout > 0) {
      setOtpTimeout(otpTimeout - 1);
    } else {
      expiredOTP(); // Auto-expire OTP
    }
  }, 1000);
  return () => clearTimeout(counterId);
}, [otpTimeout]);

// OTP input with auto-focus and paste handling
const onInputHandle = (i: number, e: React.ChangeEvent<HTMLInputElement>) => {
  let newValue = e.target.value || "";
  let remainValue = newValue.substr(0, newValue.length);

  if (newValue.length > 1) {
    // Handle paste event - distribute digits
    let j = i;
    while (remainValue.length > 0 && j < otpSize) {
      otpInputRefs.current[j].current?.focus();
      otpInputRefs.current[j].current!.value = remainValue[0];
      otpInputRefs.current[j].current!.dispatchEvent(
        new Event("change", { bubbles: true })
      );
      remainValue = remainValue.substr(1, remainValue.length);
      j++;
    }
  } else {
    // Single digit input
    otpInputRefs.current[i].current!.value = newValue;
    otpInputRefs.current[i].current!.dispatchEvent(
      new Event("change", { bubbles: true })
    );
    // Auto-focus next input
    if (newValue && i < otpSize - 1) {
      otpInputRefs.current[i + 1].current?.focus();
    }
  }
};
```

### 3. Security Implementation

#### reCAPTCHA Integration
```typescript
// Google reCAPTCHA v2 configuration
export const RECAPTCHA_CLIENT_KEY = "6Le7HZocAAAAANgMkWiDGi9znf9xVkK2sW0HeZVw";

// Execute reCAPTCHA before form submission
const onSubmitFinal = () => {
  if (validateForm().valid && validatePhoneNum()) {
    // reCAPTCHA token generated automatically in API call
    applyLoanOnHomePage(userData, { formId });
  }
};
```

#### JWT Authentication for OTP
```typescript
// OTP submission with Bearer token
const submitOtp = async (otp: string) => {
  const headers = {
    'Authorization': `Bearer ${sessionToken}`,
    'Content-Type': 'application/json'
  };

  try {
    const response = await axios.post(ApiUrl.SUBMIT_OTP, { otp }, { headers });
    // Handle success
    if (response.data.success) {
      navigateToLoanExtraInfo();
      router.push("/thong-tin-vay");
    }
  } catch (error) {
    // Handle specific error codes
    if (error.response?.data?.code === ApiErrorCode.MaximumOTPVerify) {
      showAlert("Bạn đã vượt quá số lần thử. Vui lòng thử lại sau.");
    }
  }
};
```

### 4. Data Models & Interfaces

#### Core Data Structures
```typescript
// Complete user data model
interface IUserData {
  expected_amount: number;     // Loan amount in VND
  loan_period: number;         // Loan period in months
  loan_purpose: string;        // Loan purpose ID
  phone_number: string;        // Phone number in international format
  full_name?: string;          // User full name
  email?: string;             // User email
  id_number?: string;         // ID card number
  dob?: string;               // Date of birth
  province?: string;          // Province code
  district?: string;          // District code
  monthly_income?: number;    // Monthly income
  occupation?: string;        // Occupation
  company_name?: string;      // Company name
  // ... additional fields
}

// Validation state with error messages
interface IUserDataValidate {
  [key: string]: {
    valid: boolean;
    msg: string;
  };
}

// Lead data from API
interface ILeadData {
  leadId: string;
  otpStatus: OtpStatus;
  sessionToken: string;
  providers: IProvider[];
}

// Provider information
interface IProvider {
  id: string;
  name: string;
  logo: string;
  maxAmount: number;
  minAmount: number;
  interestRate: number;
  // ... other fields
}
```

### 5. Implementation Patterns

#### Custom Hook for Form Logic
```typescript
// Form submission hook with API integration
const useLoanSubmission = () => {
  const { userData, formId } = useLoanStore();

  const applyLoanOnHomePage = async (data: IUserData, options: any) => {
    try {
      setIsSubmitting(true);

      // Generate reCAPTCHA token
      const recaptchaToken = await executeRecaptcha();

      // Submit to API
      const response = await api.post(ApiUrl.NEW_LEAD, {
        ...data,
        formId: options.formId,
        device_id: getDeviceId(),
        recaptcha_token: recaptchaToken
      });

      // Handle response
      if (response.data.requiresOtp) {
        setShowPhoneModal(false);
        setShowOTPModal(true);
      } else {
        router.push("/thong-tin-vay");
      }
    } catch (error) {
      showAlert(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return { applyLoanOnHomePage };
};
```

#### Event Tracking Implementation
```typescript
// Comprehensive tracking for analytics
const eventTracking = (
  event: EventType,
  data: Record<string, string | number>,
  service?: string
) => {
  const trackingData: IEventTracking = {
    lead_id: leadData.leadId ? parseInt(leadData.leadId) : undefined,
    session_id: getSessionId(),
    device_id: getDeviceId(),
    event,
    data: {
      ...data,
      timestamp: new Date().toISOString(),
      page: window.location.pathname
    },
    service
  };

  // Send to tracking API
  trackingApi.send(trackingData);
};
```

#### Performance Optimizations
```typescript
// Debounced validation for phone input
const debouncedPhoneValidation = useCallback(
  debounce((value: string) => {
    if (value.length >= 10) {
      validatePhoneNum();
    }
  }, 500),
  []
);

// Memoized calculations
const monthlyPayment = React.useMemo(() => {
  if (!userData.expected_amount || !userData.loan_period) return 0;

  // Simple interest calculation
  const principal = userData.expected_amount;
  const months = userData.loan_period;
  const rate = 0.022; // 2.2% monthly

  return (principal * (1 + rate * months)) / months;
}, [userData.expected_amount, userData.loan_period]);

// Optimized re-renders with React.memo
const LoanAmountSlider = React.memo(({ value, onChange }) => {
  return (
    <Slider
      value={value}
      onChange={onChange}
      min={5000000}
      max={90000000}
      step={5000000}
      formatValue={(v) => formatCurrency(v)}
    />
  );
});
```

### 6. Error Handling Strategy

#### API Error Handling
```typescript
// Centralized error handling
const handleApiError = (error: AxiosError) => {
  const errorCode = error.response?.data?.code;
  const errorMessage = error.response?.data?.message;

  switch (errorCode) {
    case ApiErrorCode.MaximumOTPVerify:
      showAlert("Bạn đã vượt quá số lần thử. Vui lòng thử lại sau.");
      break;
    case ApiErrorCode.OTPExpired:
      showAlert("Mã OTP đã hết hạn. Vui lòng gửi lại mã mới.");
      break;
    case ApiErrorCode.InvalidPhoneNumber:
      showAlert("Số điện thoại không hợp lệ.");
      break;
    default:
      showAlert(errorMessage || "Đã có lỗi xảy ra. Vui lòng thử lại.");
  }
};
```

#### Form Validation with Visual Feedback
```typescript
// Validation with error state
const renderFieldWithError = (fieldName: string) => {
  const isValid = userDataValidate[fieldName]?.valid !== false;
  const errorMsg = userDataValidate[fieldName]?.msg;

  return (
    <div className={`field ${!isValid ? 'has-error' : ''}`}>
      <label>{getLabel(fieldName)}</label>
      <input
        value={userData[fieldName] || ''}
        onChange={(e) => setUserLoanData(fieldName, e.target.value)}
        onBlur={() => validateField(fieldName)}
        className={!isValid ? 'is-danger' : ''}
      />
      {!isValid && <p className="help is-danger">{errorMsg}</p>}
    </div>
  );
};
```

### 7. Modal Management

#### Controlled Modal States
```typescript
// Modal visibility management
const [showPhoneModal, setShowPhoneModal] = React.useState(false);
const [showOTPModal, setShowOTPModal] = React.useState(false);

// Sync modal states with global step
useEffect(() => {
  if (currentLoanStep === LOAN_STEPS.PHONE) {
    setShowPhoneModal(true);
  } else if (currentLoanStep === LOAN_STEPS.OTP) {
    setShowPhoneModal(false);
    setShowOTPModal(true);
  } else if (currentLoanStep === LOAN_STEPS.LOAN_EXTRA_INFO) {
    setShowPhoneModal(false);
    setShowOTPModal(false);
    router.push("/thong-tin-vay");
  }
}, [currentLoanStep]);

// Modal close handlers
const closePhoneModal = () => {
  setShowPhoneModal(false);
  navigateToHomepage();
};
```

### 8. Component Architecture

#### Main Component Structure
```typescript
const ApplyLoanForm: React.FC = () => {
  // Global state
  const {
    userData,
    userDataValidate,
    isSubmitting,
    // ... other selectors
  } = useLoanStore();

  // Local state
  const [showPhoneModal, setShowPhoneModal] = useState(false);
  const [showOTPModal, setShowOTPModal] = useState(false);
  const [isAgree, setIsAgree] = useState(false);
  const [agreeStatus, setAgreeStatus] = useState<"0" | "1" | "">("");

  // Effects
  useEffect(() => {
    // Generate unique form ID
    setFormId(generateUUID());
    // Track form view
    eventTracking(EventType.lending_page_view, {});
  }, []);

  // Event handlers
  const handleAmountChange = (value: number) => {
    setUserLoanData("expected_amount", value);
    eventTracking(EventType.lending_page_input_expected_amount, {
      expected_amount: value,
    });
  };

  // Render
  return (
    <div className="apply-loan-form">
      <form onSubmit={handleSubmit}>
        {/* Form fields */}
        <LoanAmountSlider />
        <LoanPeriodSlider />
        <LoanPurposeSelect />
        <TermsAgreement />
        <SubmitButton />
      </form>

      {/* Modals */}
      <PhoneModal />
      <OTPModal />
    </div>
  );
};
```

### Key Implementation Requirements for Replication

1. **State Management Architecture**
   - Zustand store with selectors for performance
   - Immutable state updates
   - Clear separation between global and local state

2. **Validation System**
   - Field-level validation
   - Real-time validation feedback
   - Vietnamese phone number validation with carrier detection

3. **Security Implementation**
   - Google reCAPTCHA v2 integration
   - JWT authentication for secure endpoints
   - Input sanitization and validation

4. **User Experience**
   - Debounced input handling
   - Auto-focus management in OTP
   - Loading states and error feedback
   - Comprehensive event tracking

5. **Performance Optimization**
   - React.memo for expensive components
   - useMemo for calculations
   - useCallback for event handlers
   - Debounced API calls

6. **Error Handling**
   - Centralized error handling
   - User-friendly error messages
   - Graceful degradation

7. **Modal Management**
   - Controlled modal states
   - Keyboard navigation support
   - Focus trapping
   - Backdrop handling

8. **API Integration**
   - Axios for HTTP requests
   - Request/response interceptors
   - Retry logic for failed requests
   - Proper error propagation

This implementation demonstrates a production-ready loan application form with robust validation, security, user experience, and performance considerations.

---
*Analysis completed: Phase 2 of 2*