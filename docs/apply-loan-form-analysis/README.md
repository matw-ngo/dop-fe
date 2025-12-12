# ApplyLoanForm Component - Complete Replication Guide

## Overview

This document provides a comprehensive guide for replicating the ApplyLoanForm component exactly as implemented in `docs/old-code/modules/ApplyLoanForm/index.tsx`. The component is a sophisticated multi-step loan application form with modal overlays, API integration, and robust validation.

## Quick Start

### Prerequisites
```bash
# Install required dependencies
npm install react react-dom next
npm install zustand axios react-toastify
npm install react-select react-input-slider
npm install md5

# For development
npm install -D @types/react @types/react-dom
npm install -D @types/node typescript
```

## Implementation Steps

### 1. Project Structure Setup

Create the following file structure:
```
src/
├── components/
│   ├── Slider/
│   │   └── index.tsx
│   ├── Button/
│   │   └── button.tsx
│   ├── Modal/
│   │   └── modal.tsx
│   ├── TextInput/
│   │   └── text-input.tsx
│   └── SelectGroup/
│       └── select-group.tsx
├── modules/
│   ├── ApplyLoanForm/
│   │   ├── index.tsx
│   │   └── style.module.scss
│   └── OtpForm/
│       └── index.tsx
├── states/
│   ├── zu-store.ts
│   └── zu-action.ts
├── helpers/
│   ├── mobile-num.ts
│   ├── user-tracking.tsx
│   └── api-config.ts
└── types/
    └── loan.types.ts
```

### 2. State Management Setup (Zustand)

```typescript
// src/states/zu-store.ts
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

export interface IUserData {
  expected_amount: number;
  loan_period: number;
  loan_purpose: string;
  phone_number: string;
  full_name?: string;
  email?: string;
  id_number?: string;
  dob?: string;
  province?: string;
  district?: string;
  monthly_income?: number;
  occupation?: string;
  company_name?: string;
}

export interface IUserDataValidate {
  [key: string]: {
    valid: boolean;
    msg: string;
  };
}

export interface ILeadData {
  leadId: string;
  otpStatus: 'UNVERIFIED' | 'VERIFIED' | 'EXPIRED';
  sessionToken: string;
  providers: IProvider[];
}

export enum LOAN_STEPS {
  HOMEPAGE = 'homepage',
  PHONE = 'phone',
  OTP = 'otp',
  LOAN_EXTRA_INFO = 'loan_extra_info',
  LOAN_FINDING = 'loan_finding',
  LOAN_RESULT = 'loan_result'
}

interface ILoanState {
  currentLoanStep: LOAN_STEPS;
  userData: IUserData;
  userDataValidate: IUserDataValidate;
  leadData: ILeadData;
  isSubmitting: boolean;
}

interface ILoanActions {
  setUserLoanData: (field: keyof IUserData, value: any) => void;
  setUserLoanValidate: (field: string, valid: boolean, msg: string) => void;
  setCurrentLoanStep: (step: LOAN_STEPS) => void;
  setLeadData: (data: Partial<ILeadData>) => void;
  setSubmitting: (submitting: boolean) => void;
  resetLoanState: () => void;
}

export const DEFAULT_USER_LOAN_DATA: IUserData = {
  expected_amount: 0,
  loan_period: 0,
  loan_purpose: '-1',
  phone_number: '',
};

export const useLoanStore = create<ILoanState & ILoanActions>()(
  immer((set) => ({
    // Initial state
    currentLoanStep: LOAN_STEPS.HOMEPAGE,
    userData: DEFAULT_USER_LOAN_DATA,
    userDataValidate: {},
    leadData: {
      leadId: '',
      otpStatus: 'UNVERIFIED',
      sessionToken: '',
      providers: [],
    },
    isSubmitting: false,

    // Actions
    setUserLoanData: (field, value) =>
      set((state) => {
        state.userData[field] = value;
      }),

    setUserLoanValidate: (field, valid, msg) =>
      set((state) => {
        state.userDataValidate[field] = { valid, msg };
      }),

    setCurrentLoanStep: (step) =>
      set((state) => {
        state.currentLoanStep = step;
      }),

    setLeadData: (data) =>
      set((state) => {
        state.leadData = { ...state.leadData, ...data };
      }),

    setSubmitting: (submitting) =>
      set((state) => {
        state.isSubmitting = submitting;
      }),

    resetLoanState: () =>
      set((state) => {
        state.currentLoanStep = LOAN_STEPS.HOMEPAGE;
        state.userData = DEFAULT_USER_LOAN_DATA;
        state.userDataValidate = {};
        state.leadData = {
          leadId: '',
          otpStatus: 'UNVERIFIED',
          sessionToken: '',
          providers: [],
        };
        state.isSubmitting = false;
      }),
  }))
);
```

### 3. API Configuration

```typescript
// src/helpers/api-config.ts
export const BASE_API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.example.com';

export const ApiUrl = {
  NEW_LEAD: `${BASE_API_URL}/upl/new`,
  SUBMIT_OTP: `${BASE_API_URL}/otp/submit`,
  REQUEST_NEW_OTP: `${BASE_API_URL}/otp/renew`,
  SUBMIT_LEAD: `${BASE_API_URL}/upl/submit-info`,
  FORWARD_LEAD: `${BASE_API_URL}/upl/forward`,
};

export const RECAPTCHA_CLIENT_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_KEY || 'your-recaptcha-key';

export const ApiErrorCode = {
  MaximumOTPVerify: 'MAX_OTP_VERIFY',
  OTPExpired: 'OTP_EXPIRED',
  InvalidPhoneNumber: 'INVALID_PHONE',
  LeadNotFound: 'LEAD_NOT_FOUND',
};

// API client setup
import axios from 'axios';

export const api = axios.create({
  baseURL: BASE_API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle common errors
    if (error.response?.status === 401) {
      // Handle unauthorized
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

### 4. Phone Validation Utility

```typescript
// src/helpers/mobile-num.ts
export enum TELCO {
  VIETTEL = 'viettel',
  VINAPHONE = 'vinaphone',
  MOBIFONE = 'mobifone',
  VIETNAMOBILE = 'vietnamobile',
  GTEL = 'gtel',
}

export const ALLOWED_TELCOS = [TELCO.VIETTEL, TELCO.VINAPHONE, TELCO.MOBIFONE];

// Vietnamese mobile number regex patterns
const vnMobileRegex = /^(0|84)(56|58|59|7[67890]|3[2-9]|8[1-5]|9\d|16[2-9]|12\d|86|88|89|186|188|199)(\d{7})$/;

// Carrier-specific regex
const viettelRegex = /^(0|84)(9[6-8]|16[2-9]|3[2-9]|86)(\d{7})$/;
const vinaphoneRegex = /^(0|84)(9[14]|12[34579]|8[1-5]|88)(\d{7})$/;
const mobifoneRegex = /^(0|84)(9[03]|12[01268]|7[67890]|89)(\d{7})$/;

// Number porting conversion map
const convertMap: Record<string, string> = {
  '84123': '84125', // Example: Vinaphone old prefix to new
  '84124': '84125',
  '84127': '84129',
  '84126': '84129',
  '84128': '84129',
  '84122': '84123',
  '84121': '84123',
  '84120': '84123',
  '84168': '8438',
  '84168': '8439',
};

export const standardizePhoneNum = (phone: string): string => {
  if (!phone) return '';

  // Remove prefixes
  phone = phone.replace(/^(\+)/, '');
  phone = phone.replace(/^(00)/, '');

  // Convert to international format
  if (!phone.startsWith('84')) {
    if (!phone.startsWith('0')) {
      phone = '84' + phone;
    } else if (phone.startsWith('0')) {
      phone = '84' + phone.slice(1);
    }
  }

  // Handle number porting
  const prefix = phone.slice(0, 5);
  if (convertMap[prefix]) {
    return convertMap[prefix] + phone.slice(5);
  }

  return phone;
};

export const isVNMobileNum = (phone: string): boolean => {
  return vnMobileRegex.test(phone);
};

export const phoneValidation = (num: string) => {
  const result = { valid: false, telco: '', validNum: '' };

  if (!num) return result;

  const phoneNum = standardizePhoneNum(num);

  if (isVNMobileNum(phoneNum)) {
    result.valid = true;
    result.validNum = phoneNum;

    if (viettelRegex.test(phoneNum)) {
      result.telco = TELCO.VIETTEL;
    } else if (vinaphoneRegex.test(phoneNum)) {
      result.telco = TELCO.VINAPHONE;
    } else if (mobifoneRegex.test(phoneNum)) {
      result.telco = TELCO.MOBIFONE;
    }
  }

  return result;
};

export const getTelco = (phone: string): string => {
  const validation = phoneValidation(phone);
  return validation.telco;
};
```

### 5. Main ApplyLoanForm Component

```typescript
// src/modules/ApplyLoanForm/index.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import Slider from '@app/components/Slider';
import Button from '@app/components/Button/button';
import Modal from '@app/components/Modal/modal';
import TextInput from '@app/components/TextInput/text-input';
import SelectGroup from '@app/components/SelectGroup/select-group';
import OtpForm from '@app/modules/OtpForm';
import {
  useLoanStore,
  LOAN_STEPS,
  IUserData,
  ILeadData,
} from '@app/states/zu-store';
import { phoneValidation, ALLOWED_TELCOS } from '@app/helpers/mobile-num';
import { eventTracking, EventType } from '@app/helpers/user-tracking';
import { applyLoanOnHomePage, submitOtp } from '@app/states/zu-action';
import { formatCurrency } from '@app/utils/formatters';
import styles from './style.module.scss';

const ApplyLoanForm: React.FC = () => {
  const router = useRouter();

  // Global state
  const {
    userData,
    userDataValidate,
    isSubmitting,
    leadData,
    currentLoanStep,
    setUserLoanData,
    setUserLoanValidate,
    setCurrentLoanStep,
  } = useLoanStore();

  // Local state
  const [showPhoneModal, setShowPhoneModal] = useState(false);
  const [showOTPModal, setShowOTPModal] = useState(false);
  const [isAgree, setIsAgree] = useState(false);
  const [agreeStatus, setAgreeStatus] = useState<"0" | "1" | "">("");
  const [formId, setFormId] = useState("");

  // Effects
  useEffect(() => {
    // Generate unique form ID
    const id = `form_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    setFormId(id);

    // Track form view
    eventTracking(EventType.lending_page_view, {});
  }, []);

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
      router.push('/thong-tin-vay');
    }
  }, [currentLoanStep, router]);

  // Event handlers
  const onAmountChange = useCallback((value: number) => {
    setUserLoanData('expected_amount', value);
    eventTracking(EventType.lending_page_input_expected_amount, {
      expected_amount: value,
    });
  }, [setUserLoanData]);

  const onPeriodChange = useCallback((value: number) => {
    setUserLoanData('loan_period', value);
    eventTracking(EventType.lending_page_input_loan_period, {
      loan_period: value,
    });
  }, [setUserLoanData]);

  const onPurposeChange = useCallback((value: string) => {
    setUserLoanData('loan_purpose', value);
    eventTracking(EventType.lending_page_input_loan_purpose, {
      loan_purpose: value,
    });
  }, [setUserLoanData]);

  // Validation
  const validateForm = useCallback(() => {
    const rs = { valid: true, msg: '' };

    if (!userData.expected_amount) {
      rs.valid = false;
      rs.msg = 'Vui lòng chọn khoản vay';
    } else if (!userData.loan_period) {
      rs.valid = false;
      rs.msg = 'Vui lòng chọn thời gian vay';
    } else if (userData.loan_purpose === '-1') {
      rs.valid = false;
      rs.msg = 'Vui lòng chọn mục đích vay';
    } else if (!isAgree) {
      rs.valid = false;
      rs.msg = 'Vui lòng đồng ý với điều khoản';
    }

    return rs;
  }, [userData, isAgree]);

  const validatePhoneNum = useCallback(() => {
    const value = userData.phone_number;
    const phoneVerify = phoneValidation(value);

    if (phoneVerify.valid) {
      if (!ALLOWED_TELCOS.includes(phoneVerify.telco as any)) {
        setUserLoanValidate(
          'phone_number',
          false,
          `Chỉ hỗ trợ nhà mạng ${ALLOWED_TELCOS.join(', ')}`
        );
        return false;
      }
      setUserLoanData('phone_number', phoneVerify.validNum);
      setUserLoanValidate('phone_number', true, '');
      return true;
    }

    setUserLoanValidate('phone_number', false, 'Số điện thoại không hợp lệ');
    return false;
  }, [userData.phone_number, setUserLoanData, setUserLoanValidate]);

  // Form submission
  const onSubmitFinal = useCallback(async () => {
    const validation = validateForm();
    if (!validation.valid) {
      toast.error(validation.msg);
      return;
    }

    if (!validatePhoneNum()) {
      return;
    }

    try {
      await applyLoanOnHomePage(userData, { formId });
      setShowPhoneModal(true);
    } catch (error: any) {
      toast.error(error.message || 'Đã có lỗi xảy ra. Vui lòng thử lại.');
    }
  }, [validateForm, validatePhoneNum, userData, formId]);

  // OTP submission
  const submitOtpHandle = useCallback(async (otp: string) => {
    try {
      await submitOtp(otp, leadData.sessionToken);
      setShowOTPModal(false);
      setCurrentLoanStep(LOAN_STEPS.LOAN_EXTRA_INFO);
    } catch (error: any) {
      toast.error(error.message || 'OTP không hợp lệ');
    }
  }, [leadData.sessionToken, setCurrentLoanStep]);

  // Phone modal submission
  const submitPhoneModal = useCallback(() => {
    if (validatePhoneNum()) {
      setShowPhoneModal(false);
      // OTP will be shown based on API response
    }
  }, [validatePhoneNum]);

  // Loan purposes data
  const loanPurposes = [
    { value: '-1', label: 'Chọn mục đích vay', disabled: true },
    { value: '1', label: 'Vay tiêu dùng' },
    { value: '2', label: 'Vay kinh doanh' },
    { value: '3', label: 'Vay mua nhà' },
    { value: '4', label: 'Vay mua xe' },
    { value: '5', label: 'Vay học phí' },
    { value: '6', label: 'Vay khác' },
  ];

  return (
    <div className={styles.applyLoanForm}>
      <form onSubmit={(e) => { e.preventDefault(); onSubmitFinal(); }}>
        {/* Loan Amount Slider */}
        <div className={styles.formGroup}>
          <label className={styles.label}>Khoản vay mong muốn</label>
          <Slider
            value={userData.expected_amount || 5000000}
            onChange={onAmountChange}
            min={5000000}
            max={90000000}
            step={5000000}
            formatValue={(v) => formatCurrency(v)}
            thumbImage="/images/dollar-circle.png"
            className={styles.slider}
          />
          <div className={styles.sliderLabels}>
            <span>5 triệu</span>
            <span>90 triệu</span>
          </div>
        </div>

        {/* Loan Period Slider */}
        <div className={styles.formGroup}>
          <label className={styles.label}>Thời gian vay (tháng)</label>
          <Slider
            value={userData.loan_period || 3}
            onChange={onPeriodChange}
            min={3}
            max={36}
            step={1}
            formatValue={(v) => `${v} tháng`}
            thumbImage="/images/calendar.png"
            className={styles.slider}
          />
          <div className={styles.sliderLabels}>
            <span>3 tháng</span>
            <span>36 tháng</span>
          </div>
        </div>

        {/* Loan Purpose */}
        <div className={styles.formGroup}>
          <label className={styles.label}>Mục đích vay</label>
          <SelectGroup
            value={userData.loan_purpose || '-1'}
            onChange={onPurposeChange}
            options={loanPurposes}
            className={styles.select}
          />
        </div>

        {/* Terms Agreement */}
        <div className={styles.formGroup}>
          <label className={styles.checkboxLabel}>
            <input
              type="radio"
              name="agree"
              value="1"
              checked={agreeStatus === '1'}
              onChange={(e) => {
                setAgreeStatus(e.target.value);
                setIsAgree(e.target.value === '1');
              }}
            />
            <span>Tôi đồng ý với</span>
            <a href="/dieu-khoan" target="_blank" rel="noopener noreferrer">
              điều khoản và điều kiện
            </a>
          </label>
          <label className={styles.checkboxLabel}>
            <input
              type="radio"
              name="agree"
              value="0"
              checked={agreeStatus === '0'}
              onChange={(e) => {
                setAgreeStatus(e.target.value);
                setIsAgree(e.target.value === '1');
              }}
            />
            <span>Tôi không đồng ý</span>
          </label>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          loading={isSubmitting}
          disabled={isSubmitting}
          className={styles.submitButton}
        >
          Đăng ký vay
        </Button>
      </form>

      {/* Phone Number Modal */}
      <Modal
        isOpen={showPhoneModal}
        onClose={() => setShowPhoneModal(false)}
        title="Xác thực số điện thoại"
        className={styles.phoneModal}
      >
        <div className={styles.modalContent}>
          <p className={styles.modalDescription}>
            Vui lòng nhập số điện thoại để tiếp tục
          </p>
          <TextInput
            value={userData.phone_number || ''}
            onChange={(value) => setUserLoanData('phone_number', value)}
            placeholder="Nhập số điện thoại"
            error={userDataValidate.phone_number?.valid === false}
            helperText={userDataValidate.phone_number?.msg}
            onBlur={validatePhoneNum}
            className={styles.phoneInput}
          />
          <div className={styles.modalActions}>
            <Button
              onClick={submitPhoneModal}
              loading={isSubmitting}
              disabled={!userData.phone_number || isSubmitting}
            >
              Tiếp tục
            </Button>
          </div>
        </div>
      </Modal>

      {/* OTP Modal */}
      <Modal
        isOpen={showOTPModal}
        onClose={() => {}}
        title="Xác thực OTP"
        className={styles.otpModal}
        closable={false}
      >
        <OtpForm
          onSubmit={submitOtpHandle}
          phoneNumber={userData.phone_number || ''}
          sessionToken={leadData.sessionToken}
        />
      </Modal>
    </div>
  );
};

export default ApplyLoanForm;
```

### 6. Component Styles (SCSS)

```scss
// src/modules/ApplyLoanForm/style.module.scss
.applyLoanForm {
  max-width: 600px;
  margin: 0 auto;
  padding: 2rem;

  .formGroup {
    margin-bottom: 2rem;
  }

  .label {
    display: block;
    margin-bottom: 1rem;
    font-weight: 600;
    color: #333;
  }

  .slider {
    margin-bottom: 0.5rem;
  }

  .sliderLabels {
    display: flex;
    justify-content: space-between;
    font-size: 0.875rem;
    color: #666;
  }

  .select {
    width: 100%;

    :global(.react-select__control) {
      min-height: 48px;
      border: 1px solid #ddd;
      border-radius: 8px;

      &:hover {
        border-color: #999;
      }

      &:focus-within {
        border-color: #4a90e2;
        box-shadow: 0 0 0 2px rgba(74, 144, 226, 0.2);
      }
    }

    :global(.react-select__placeholder) {
      color: #999;
    }
  }

  .checkboxLabel {
    display: flex;
    align-items: center;
    margin-bottom: 0.5rem;
    cursor: pointer;

    input[type="radio"] {
      margin-right: 0.5rem;
    }

    span {
      margin-right: 0.5rem;
    }

    a {
      color: #4a90e2;
      text-decoration: none;

      &:hover {
        text-decoration: underline;
      }
    }
  }

  .submitButton {
    width: 100%;
    height: 48px;
    background: #4a90e2;
    color: white;
    border: none;
    border-radius: 8px;
    font-weight: 600;
    font-size: 1rem;
    cursor: pointer;
    transition: background-color 0.2s;

    &:hover:not(:disabled) {
      background: #357abd;
    }

    &:disabled {
      background: #ccc;
      cursor: not-allowed;
    }
  }

  // Modal styles
  .phoneModal,
  .otpModal {
    :global(.modal-content) {
      max-width: 400px;
      width: 90%;
    }
  }

  .modalContent {
    padding: 1.5rem;
  }

  .modalDescription {
    margin-bottom: 1.5rem;
    text-align: center;
    color: #666;
  }

  .phoneInput {
    margin-bottom: 1.5rem;

    :global(.has-error) {
      input {
        border-color: #f56565;
      }
    }

    :global(.help-text) {
      color: #f56565;
      font-size: 0.875rem;
      margin-top: 0.25rem;
    }
  }

  .modalActions {
    display: flex;
    justify-content: center;
  }
}
```

## API Endpoints Required

### 1. Create New Lead
```
POST /upl/new
Content-Type: application/json

Body:
{
  "expected_amount": 50000000,
  "loan_period": 12,
  "loan_purpose": "1",
  "phone_number": "84912345678",
  "formId": "form_1234567890_abc123",
  "device_id": "device_unique_id",
  "recaptcha_token": "recaptcha_response_token"
}

Response:
{
  "success": true,
  "leadId": "lead_123456",
  "requiresOtp": true,
  "otpType": "sms",
  "sessionToken": "jwt_token_here"
}
```

### 2. Submit OTP
```
POST /otp/submit
Authorization: Bearer {sessionToken}
Content-Type: application/json

Body:
{
  "otp": "1234"
}

Response:
{
  "success": true,
  "verified": true
}
```

### 3. Resend OTP
```
POST /otp/renew
Authorization: Bearer {sessionToken}
Content-Type: application/json

Response:
{
  "success": true,
  "otpSent": true,
  "otpType": "call"
}
```

### 4. Submit Additional Info
```
POST /upl/submit-info
Authorization: Bearer {sessionToken}
Content-Type: application/json

Body:
{
  "leadId": "lead_123456",
  "full_name": "Nguyen Van A",
  "email": "email@example.com",
  "id_number": "123456789",
  "dob": "1990-01-01",
  "province": "HN",
  "district": "HK",
  "monthly_income": 20000000,
  "occupation": "office",
  "company_name": "Company Name"
}
```

## Environment Variables

```bash
# .env.local
NEXT_PUBLIC_API_URL=https://api.example.com
NEXT_PUBLIC_RECAPTCHA_KEY=6Le7HZocAAAAANgMkWiDGi9znf9xVkK2sW0HeZVw
```

## Testing

```bash
# Run unit tests
npm test

# Run integration tests
npm run test:integration

# Run E2E tests
npm run test:e2e
```

## Key Features Implemented

1. **Multi-step Form Flow**
   - Initial form with loan parameters
   - Phone number verification modal
   - OTP verification (if required)
   - Navigation to additional info page

2. **Robust Validation**
   - Vietnamese phone number validation with carrier detection
   - Form field validation with error messages
   - Real-time validation feedback

3. **Security Features**
   - Google reCAPTCHA v2 integration
   - JWT authentication for secure endpoints
   - Input sanitization and validation

4. **User Experience**
   - Custom styled sliders for amount and period
   - Responsive modal overlays
   - Loading states and error feedback
   - Toast notifications for user feedback

5. **State Management**
   - Zustand for global state management
   - Optimized re-renders with selectors
   - Immutable state updates

6. **Performance Optimizations**
   - Debounced input handling
   - Memoized callbacks
   - Lazy loaded modals

7. **Analytics Tracking**
   - Comprehensive event tracking
   - Form interaction events
   - API call tracking

## Common Issues and Solutions

1. **reCAPTCHA Not Loading**
   - Ensure the reCAPTCHA script is loaded
   - Check if the site key is correct
   - Make sure the domain is whitelisted

2. **OTP Not Received**
   - Check if the phone number is supported
   - Verify the phone number format
   - Check SMS gateway configuration

3. **Form Validation Errors**
   - Ensure all required fields are filled
   - Check phone number format
   - Verify terms agreement

4. **API Connection Issues**
   - Check CORS configuration
   - Verify API URL in environment variables
   - Ensure proper error handling

## Security Considerations

1. Always validate input on both client and server
2. Use HTTPS for all API calls
3. Implement rate limiting for OTP requests
4. Sanitize all user inputs
5. Use secure session management
6. Implement proper error handling without exposing sensitive information

This comprehensive guide provides everything needed to replicate the ApplyLoanForm component exactly, including all business logic, validation rules, API integrations, and user experience features.