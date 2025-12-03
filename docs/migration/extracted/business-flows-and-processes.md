# Business Flows and Processes Documentation

## Table of Contents
- [Overview](#overview)
- [User Journeys](#user-journeys)
  - [Loan Application Journey](#loan-application-journey)
  - [Credit Card Journey](#credit-card-journey)
  - [Insurance Journey](#insurance-journey)
- [Authentication Flows](#authentication-flows)
  - [Admin Authentication](#admin-authentication)
  - [User OTP Authentication](#user-otp-authentication)
- [Data Input and Transaction Flows](#data-input-and-transaction-flows)
  - [Multi-Step Form Flow](#multi-step-form-flow)
  - [Lead Submission Process](#lead-submission-process)
- [Flow Management System](#flow-management-system)
  - [Dynamic Flow Configuration](#dynamic-flow-configuration)
  - [Flow State Management](#flow-state-management)
- [eKYC Integration Flow](#ekyc-integration-flow)
  - [VNPT eKYC Setup](#vnpt-ekyc-setup)
  - [eKYC Verification Process](#ekyc-verification-process)
  - [Data Mapping and Validation](#data-mapping-and-validation)
- [API Integration Patterns](#api-integration-patterns)
- [Error Handling and Recovery](#error-handling-and-recovery)
- [Security and Compliance](#security-and-compliance)

## Overview

This document outlines the key business flows, user journeys, authentication processes, and API interactions within the DOP-FE application. DOP-FE is a financial platform that connects users with credit cards, loans, and insurance products, enhanced with modern technologies including Next.js 15.5.4, React 19.1.0, shadcn/ui, and VNPT eKYC integration.

The new architecture implements a **flow-based system** that replaces hardcoded routes with dynamic, configurable user journeys managed through the admin panel. This approach allows for flexible business process management without code changes.

### Key Architecture Improvements

| Feature | Old Implementation | New Implementation |
|---------|------------------|-------------------|
| Routing | Hardcoded Pages Router | Dynamic App Router with flow-based navigation |
| State Management | Zustand only | Zustand + React Query for server state |
| Forms | Custom implementation | Multi-step form system with Zod validation |
| UI Components | Bulma/Mantine | shadcn/ui with Tailwind CSS 4 |
| Authentication | Basic CFP login | JWT-based with session management |
| Identity Verification | None | VNPT eKYC SDK integration |
| Form Configuration | Static | Data-driven UI with dynamic form rendering |

## User Journeys

### Loan Application Journey

**Flow:** Homepage → Loan Application → eKYC Verification → Additional Information → Loan Results

#### 1. Initial Application (Homepage)

**Implementation:** [`src/app/[locale]/page.tsx`](src/app/[locale]/page.tsx:1) with [`src/components/organisms/homepage/onboarding-card.tsx`](src/components/organisms/homepage/onboarding-card.tsx:1)

**New Technology Integration:**
- **Flow Management**: Uses [`useFlow`](src/hooks/flow/use-flow.ts:1) hook for journey tracking
- **Form Handling**: [`useMultiStepForm`](src/hooks/form/use-multi-step-form.ts:1) with Zod validation
- **UI Components**: shadcn/ui components with [`FormRenderer`](src/components/renderer/FormRenderer.tsx:1)

**Process Steps:**
1. User selects loan amount (5-90 million VND) using [`CustomSlider`](src/components/wrappers/CustomSlider.tsx:1)
2. User selects loan period (3-36 months) with [`CustomDatePicker`](src/components/wrappers/CustomDatePicker.tsx:1)
3. User selects loan purpose using [`CustomSelect`](src/components/wrappers/CustomSelect.tsx:1)
4. User agrees to terms and conditions with form validation
5. User provides phone number with telco validation

**Data Flow:**
```typescript
// Form state managed by useMultiStepForm
const loanApplicationData = {
  amount: number,
  period: number,
  purpose: string,
  phone: string,
  agreedToTerms: boolean
};

// Validation with Zod schema
const loanApplicationSchema = z.object({
  amount: z.number().min(5000000).max(90000000),
  period: z.number().min(3).max(36),
  purpose: z.string().min(1),
  phone: z.string().regex(/^(09|03|07|08)[0-9]{8}$/),
  agreedToTerms: z.boolean().true()
});
```

#### 2. eKYC Verification

**Implementation:** [`src/components/ekyc/ekyc-dialog.tsx`](src/components/ekyc/ekyc-dialog.tsx:1) with VNPT SDK integration

**New Technology Integration:**
- **VNPT eKYC SDK**: [`src/lib/ekyc/sdk-manager.ts`](src/lib/ekyc/sdk-manager.ts:1)
- **Camera Access**: WebRTC integration for document capture
- **OCR Processing**: Real-time data extraction from ID cards
- **Face Matching**: Liveness detection and facial recognition

**Process Steps:**
1. Initialize eKYC SDK with configuration from [`src/lib/ekyc/config-manager.ts`](src/lib/ekyc/config-manager.ts:1)
2. Capture front and back of National ID card
3. Extract personal information using OCR
4. Perform liveness detection with face matching
5. Validate extracted data against form inputs
6. Store verified data in [`useEkycStore`](src/store/use-ekyc-store.ts:1)

**Error Handling:**
```typescript
// eKYC error states
enum EkycError {
  CAMERA_ACCESS_DENIED = 'CAMERA_ACCESS_DENIED',
  OCR_FAILED = 'OCR_FAILED',
  FACE_MATCH_FAILED = 'FACE_MATCH_FAILED',
  NETWORK_ERROR = 'NETWORK_ERROR',
  INVALID_DOCUMENT = 'INVALID_DOCUMENT'
}
```

#### 3. Additional Information

**Implementation:** [`src/app/[locale]/user-onboarding/page.tsx`](src/app/[locale]/user-onboarding/page.tsx:1) with multi-step form

**New Technology Integration:**
- **Multi-Step Forms**: [`MultiStepFormRenderer`](src/components/renderer/MultiStepFormRenderer.tsx:1)
- **Dynamic Fields**: Configuration-driven form rendering
- **Data Persistence**: [`useMultiStepFormStore`](src/store/use-multi-step-form-store.ts:1) with localStorage
- **Validation**: Zod schemas with conditional validation

**Process Steps:**
1. **Personal Information Step**
   - Full name (pre-filled from eKYC)
   - National ID (validated from eKYC)
   - Province selection with [`CustomSelect`](src/components/wrappers/CustomSelect.tsx:1)
   - Vehicle registration ownership

2. **Income Information Step**
   - Employment status with [`CustomRadioGroup`](src/components/wrappers/CustomRadioGroup.tsx:1)
   - Field of work (conditional based on employment)
   - Monthly income range with [`CustomToggleGroup`](src/components/wrappers/CustomToggleGroup.tsx:1)

3. **Financial Information Step**
   - Current existing loans
   - Credit history assessment
   - Additional financial obligations

#### 4. Loan Results

**Implementation:** Dynamic results page with React Query data fetching

**New Technology Integration:**
- **Data Fetching**: React Query with [`src/lib/query-client.ts`](src/lib/query-client.ts:1)
- **State Management**: Optimistic updates with cache management
- **UI Components**: Card layouts with [`src/components/ui/card.tsx`](src/components/ui/card.tsx:1)

**Process Steps:**
1. Fetch matching loan products using React Query
2. Display results with filtering and sorting options
3. Allow users to select and compare products
4. Forward selected leads to financial institutions
5. Track conversion events with analytics

### Credit Card Journey

**Flow:** Homepage → Credit Card Module → Search/Compare → Card Details → Application

#### 1. Credit Card Selection

**Implementation:** Dynamic card listing with flow-based navigation

**New Technology Integration:**
- **Flow System**: Configurable card selection flow via admin panel
- **Data Tables**: [`@tanstack/react-table`](src/components/ui/data-table.tsx:1) for card listings
- **Filtering**: Advanced filtering with [`useAsyncOptions`](src/hooks/form/use-async-options.ts:1)

**Process Steps:**
1. User chooses between "Search Card" or "Compare Card" modes
2. Apply filters using dynamic form components
3. Browse cards with infinite scroll and pagination
4. Select up to 3 cards for side-by-side comparison

#### 2. Card Details

**Implementation:** Dynamic card detail pages with flow configuration

**New Technology Integration:**
- **Dynamic Routing**: App Router with flow-based page generation
- **Component Composition**: Reusable card detail components
- **Analytics**: Event tracking for user interactions

#### 3. Application/Redirect

**Implementation:** Partner redirection with lead tracking

**New Technology Integration:**
- **Lead Management**: Integration with [`src/lib/api/admin-api.ts`](src/lib/api/admin-api.ts:1)
- **Tracking**: Comprehensive event tracking for conversions
- **Security**: Secure partner redirection with token validation

### Insurance Journey

**Flow:** Homepage → Insurance Module → Product Selection → Purchase

#### 1. Insurance Type Selection

**Implementation:** Dynamic insurance product catalog

**New Technology Integration:**
- **Flow Configuration**: Admin-manageable insurance categories
- **Multi-Theme**: Product-specific theming with [`src/lib/theme/`](src/lib/theme/:1)
- **Internationalization**: Full i18n support with next-intl

#### 2. Product Details

**Implementation:** Dynamic product pages with comparison tools

**New Technology Integration:**
- **Data-Driven UI**: Product information from API with schema validation
- **Interactive Components**: Calculators and comparison tools
- **Responsive Design**: Mobile-first approach with Tailwind CSS 4

## Authentication Flows

### Admin Authentication

**Implementation:** [`src/app/[locale]/admin/login/page.tsx`](src/app/[locale]/admin/login/page.tsx:1) with JWT-based authentication

**New Technology Integration:**
- **JWT Tokens**: Secure token-based authentication
- **Session Management**: Persistent sessions with refresh tokens
- **Security**: Comprehensive security headers and CSRF protection

**Process Steps:**
1. Admin enters credentials in login form
2. System validates credentials against API
3. JWT token issued and stored securely
4. User redirected to admin dashboard
5. Session refreshed automatically

**Security Implementation:**
```typescript
// Auth store with secure token management
const useAuthStore = create<AuthState>((set, get) => ({
  token: null,
  user: null,
  isAuthenticated: false,
  
  login: async (credentials) => {
    const response = await adminApi.login(credentials);
    const { token, user } = response.data;
    
    // Store token securely
    localStorage.setItem('admin_token', token);
    
    set({ token, user, isAuthenticated: true });
  },
  
  logout: () => {
    localStorage.removeItem('admin_token');
    set({ token: null, user: null, isAuthenticated: false });
  }
}));
```

### User OTP Authentication

**Implementation:** Enhanced OTP flow with eKYC integration

**New Technology Integration:**
- **Multi-Channel OTP**: SMS, call, and in-app notifications
- **Rate Limiting**: Advanced rate limiting with exponential backoff
- **Security**: Encrypted OTP transmission and validation

**Process Steps:**
1. User initiates loan application
2. System generates OTP based on telco requirements
3. OTP delivered via appropriate channel
4. User enters OTP with real-time validation
5. System validates and processes authentication

**OTP State Management:**
```typescript
// OTP states with enhanced error handling
enum OtpState {
  WAITING_INPUT = 'WAITING_INPUT',
  SUBMITTING = 'SUBMITTING',
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
  EXPIRED = 'EXPIRED',
  MAX_ATTEMPTS = 'MAX_ATTEMPTS'
}

// OTP configuration per telco
const otpConfig = {
  viettel: { length: 6, timeout: 60000, maxAttempts: 3 },
  mobifone: { length: 4, timeout: 60000, maxAttempts: 3 },
  vinaphone: { length: 4, timeout: 60000, maxAttempts: 3 }
};
```

## Data Input and Transaction Flows

### Multi-Step Form Flow

**Implementation:** Comprehensive multi-step form system with data persistence

**New Technology Integration:**
- **Form Builder**: [`MultiStepFormBuilder`](src/lib/builders/multi-step-form-builder.ts:1) for dynamic forms
- **Validation**: Zod schemas with conditional validation
- **State Management**: Persistent form state with [`useMultiStepFormStore`](src/store/use-multi-step-form-store.ts:1)
- **UI Components**: Reusable form components with shadcn/ui

**Architecture:**
```typescript
// Multi-step form configuration
interface FormStep {
  id: string;
  title: string;
  description?: string;
  fields: FormField[];
  validation?: z.ZodSchema;
  dependencies?: string[];
  conditions?: FieldCondition[];
}

// Form field types
interface FormField {
  id: string;
  type: 'input' | 'select' | 'radio' | 'date' | 'ekyc' | 'custom';
  label: string;
  placeholder?: string;
  validation?: z.ZodSchema;
  options?: SelectOption[];
  component?: React.ComponentType<any>;
}
```

**Data Persistence:**
```typescript
// Form state with localStorage persistence
const useMultiStepFormStore = create<MultiStepFormState>()(
  persist(
    (set, get) => ({
      currentStep: 0,
      formData: {},
      completedSteps: [],
      
      nextStep: () => {
        const { currentStep, completedSteps } = get();
        set({
          currentStep: currentStep + 1,
          completedSteps: [...completedSteps, currentStep]
        });
      },
      
      updateFormData: (data: Partial<FormData>) => {
        set(state => ({
          formData: { ...state.formData, ...data }
        }));
      }
    }),
    {
      name: 'multi-step-form',
      partialize: (state) => ({ formData: state.formData })
    }
  )
);
```

### Lead Submission Process

**Implementation:** Enhanced lead management with React Query integration

**New Technology Integration:**
- **API Integration**: React Query for optimistic updates
- **Error Handling**: Comprehensive error recovery
- **Analytics**: Lead tracking and conversion analytics
- **Admin Panel**: Lead management interface

**Process Steps:**
1. **Initial Lead Creation**
   - Triggered by form submission
   - Includes device fingerprinting
   - Captures tracking parameters
   - Validates with reCAPTCHA

2. **Lead Verification**
   - OTP verification process
   - eKYC identity verification
   - Document validation
   - Risk assessment

3. **Lead Processing**
   - Data enrichment and validation
   - Product matching algorithms
   - Partner routing logic
   - Compliance checks

4. **Lead Forwarding**
   - Partner API integration
   - Lead status tracking
   - Conversion monitoring
   - Revenue attribution

## Flow Management System

### Dynamic Flow Configuration

**Implementation:** Admin-manageable flow configuration system

**New Technology Integration:**
- **Flow Builder**: Visual flow configuration interface
- **State Management**: [`useAdminFlowStore`](src/store/use-admin-flow-store.ts:1) with pending changes
- **API Integration**: Real-time flow updates
- **Version Control**: Flow versioning and rollback

**Flow Configuration Schema:**
```typescript
interface FlowConfiguration {
  id: string;
  name: string;
  description: string;
  version: string;
  steps: FlowStep[];
  conditions: FlowCondition[];
  integrations: FlowIntegration[];
  analytics: FlowAnalytics;
}

interface FlowStep {
  id: string;
  type: 'form' | 'verification' | 'display' | 'redirect';
  title: string;
  component: string;
  validation?: ValidationRule[];
  nextSteps: NextStepRule[];
  skipConditions?: SkipCondition[];
}
```

### Flow State Management

**Implementation:** Comprehensive flow state tracking with persistence

**New Technology Integration:**
- **Flow Hooks**: [`useFlow`](src/hooks/flow/use-flow.ts:1) for flow management
- **State Persistence**: Automatic state saving and recovery
- **Analytics**: Flow performance tracking
- **Error Recovery**: Automatic error handling and recovery

## eKYC Integration Flow

### VNPT eKYC Setup

**Implementation:** Comprehensive VNPT eKYC SDK integration

**New Technology Integration:**
- **SDK Management**: [`src/lib/ekyc/sdk-manager.ts`](src/lib/ekyc/sdk-manager.ts:1)
- **Configuration**: Dynamic SDK configuration with [`src/lib/ekyc/config-manager.ts`](src/lib/ekyc/config-manager.ts:1)
- **Event Handling**: Comprehensive event system with [`src/lib/ekyc/sdk-events.ts`](src/lib/ekyc/sdk-events.ts:1)
- **Data Mapping**: Intelligent data mapping with [`src/lib/ekyc/ekyc-data-mapper.ts`](src/lib/ekyc/ekyc-data-mapper.ts:1)

**SDK Configuration:**
```typescript
// VNPT eKYC configuration
const ekycConfig = {
  authToken: process.env.NEXT_PUBLIC_EKYC_AUTH_TOKEN,
  backendUrl: process.env.NEXT_PUBLIC_EKYC_BACKEND_URL,
  tokenKey: process.env.NEXT_PUBLIC_EKYC_TOKEN_KEY,
  tokenId: process.env.NEXT_PUBLIC_EKYC_TOKEN_ID,
  
  // SDK options
  options: {
    enableLiveness: true,
    enableFaceMatching: true,
    enableOCR: true,
    maxRetries: 3,
    timeout: 30000
  }
};
```

### eKYC Verification Process

**Implementation:** Complete eKYC workflow with error handling

**Process Steps:**
1. **SDK Initialization**
   - Load VNPT SDK dynamically
   - Configure with environment variables
   - Initialize camera and permissions
   - Set up event listeners

2. **Document Capture**
   - Guide user through document positioning
   - Capture front and back of ID card
   - Validate image quality
   - Extract data using OCR

3. **Face Verification**
   - Perform liveness detection
   - Capture face image
   - Match with ID photo
   - Validate biometric data

4. **Data Validation**
   - Cross-reference extracted data
   - Validate against form inputs
   - Check for document tampering
   - Verify data consistency

### Data Mapping and Validation

**Implementation:** Intelligent data mapping with validation

**New Technology Integration:**
- **Data Mapping**: [`src/lib/ekyc/ekyc-data-mapper.ts`](src/lib/ekyc/ekyc-data-mapper.ts:1)
- **Validation**: Zod schemas for eKYC data
- **Error Handling**: Comprehensive error recovery
- **Analytics**: Verification success tracking

**Data Mapping Schema:**
```typescript
// eKYC data mapping configuration
const ekycDataMapping = {
  // Map OCR fields to form fields
  fieldMappings: {
    'fullName': 'fullName',
    'idNumber': 'nationalId',
    'dateOfBirth': 'dateOfBirth',
    'placeOfOrigin': 'province',
    'address': 'address'
  },
  
  // Validation rules
  validationRules: {
    fullName: z.string().min(2).max(50),
    idNumber: z.string().regex(/^[0-9]{12}$/),
    dateOfBirth: z.string().datetime(),
    province: z.string().min(1),
    address: z.string().min(5)
  },
  
  // Data transformation rules
  transformations: {
    dateOfBirth: (value: string) => format(new Date(value), 'yyyy-MM-dd'),
    fullName: (value: string) => value.trim().toUpperCase()
  }
};
```

## API Integration Patterns

### React Query Implementation

**Implementation:** Sophisticated server state management with React Query

**New Technology Integration:**
- **Query Client**: [`src/lib/query-client.ts`](src/lib/query-client.ts:1) with optimized configuration
- **API Client**: [`src/lib/api/client.ts`](src/lib/api/client.ts:1) with TypeScript types
- **Mock Responses**: [`src/lib/api/mock-responses.ts`](src/lib/api/mock-responses.ts:1) for development
- **Schema Validation**: OpenAPI schema with [`src/lib/api/schema.yaml`](src/lib/api/schema.yaml:1)

**Query Configuration:**
```typescript
// React Query configuration
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      retry: 3,
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
      refetchOnWindowFocus: false,
      refetchOnReconnect: true
    },
    mutations: {
      retry: 1,
      onError: (error) => {
        // Global error handling
        console.error('Mutation error:', error);
      }
    }
  }
});
```

### API Endpoints

**Implementation:** Comprehensive API integration with type safety

**Authentication Endpoints:**
| Endpoint | Method | Purpose | Implementation |
|----------|--------|---------|----------------|
| `/auth/login` | POST | Admin authentication | [`src/lib/api/admin-api.ts`](src/lib/api/admin-api.ts:1) |
| `/auth/refresh` | POST | Token refresh | [`src/lib/api/client.ts`](src/lib/api/client.ts:1) |
| `/auth/logout` | POST | Session termination | [`src/lib/api/admin-api.ts`](src/lib/api/admin-api.ts:1) |

**Lead Management Endpoints:**
| Endpoint | Method | Purpose | Implementation |
|----------|--------|---------|----------------|
| `/leads` | POST | Create new lead | [`src/lib/api/client.ts`](src/lib/api/client.ts:1) |
| `/leads/[id]` | GET | Get lead details | [`src/lib/api/client.ts`](src/lib/api/client.ts:1) |
| `/leads/[id]/status` | PUT | Update lead status | [`src/lib/api/admin-api.ts`](src/lib/api/admin-api.ts:1) |
| `/leads/[id]/forward` | POST | Forward to partner | [`src/lib/api/client.ts`](src/lib/api/client.ts:1) |

**eKYC Endpoints:**
| Endpoint | Method | Purpose | Implementation |
|----------|--------|---------|----------------|
| `/ekyc/init` | POST | Initialize eKYC session | [`src/lib/ekyc/sdk-manager.ts`](src/lib/ekyc/sdk-manager.ts:1) |
| `/ekyc/verify` | POST | Verify eKYC data | [`src/lib/ekyc/sdk-manager.ts`](src/lib/ekyc/sdk-manager.ts:1) |
| `/ekyc/documents` | POST | Upload documents | [`src/lib/ekyc/sdk-manager.ts`](src/lib/ekyc/sdk-manager.ts:1) |

## Error Handling and Recovery

### Error Boundary Implementation

**Implementation:** Comprehensive error handling with React Error Boundaries

**New Technology Integration:**
- **Error Boundaries**: [`src/components/admin/retryable-error-boundary.tsx`](src/components/admin/retryable-error-boundary.tsx:1)
- **Error States**: [`src/components/feedback/error-state.tsx`](src/components/feedback/error-state.tsx:1)
- **Toast Notifications**: [`src/components/ui/toaster.tsx`](src/components/ui/toaster.tsx:1)
- **Logging**: Comprehensive error logging and tracking

**Error Handling Strategy:**
```typescript
// Error boundary with retry functionality
const RetryableErrorBoundary = ({ children, fallback, onRetry }) => {
  return (
    <ErrorBoundary
      fallback={fallback}
      onError={(error, errorInfo) => {
        // Log error to monitoring service
        console.error('Error caught by boundary:', error, errorInfo);
        
        // Track error in analytics
        trackError(error, errorInfo);
      }}
      onReset={() => {
        // Retry the failed operation
        onRetry?.();
      }}
    >
      {children}
    </ErrorBoundary>
  );
};
```

### Error Recovery Patterns

**Implementation:** Automatic error recovery with user feedback

**Recovery Strategies:**
1. **Network Errors**: Automatic retry with exponential backoff
2. **Validation Errors**: Inline validation with helpful messages
3. **Authentication Errors**: Automatic token refresh and retry
4. **eKYC Errors**: Guided retry with alternative verification methods

## Security and Compliance

### Security Implementation

**Implementation:** Comprehensive security measures for financial data

**Security Features:**
1. **Authentication**: JWT-based authentication with refresh tokens
2. **Data Encryption**: End-to-end encryption for sensitive data
3. **Input Validation**: Zod schemas for all input validation
4. **CSRF Protection**: CSRF tokens for all state-changing operations
5. **Security Headers**: Comprehensive security headers configuration
6. **Rate Limiting**: Advanced rate limiting with IP-based restrictions

**Security Configuration:**
```typescript
// Security headers configuration
const securityHeaders = [
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on'
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload'
  },
  {
    key: 'X-XSS-Protection',
    value: '1; mode=block'
  },
  {
    key: 'X-Frame-Options',
    value: 'DENY'
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  },
  {
    key: 'Referrer-Policy',
    value: 'origin-when-cross-origin'
  }
];
```

### Compliance Implementation

**Implementation:** Regulatory compliance for financial services

**Compliance Features:**
1. **Data Privacy**: GDPR-compliant data handling
2. **Consent Management**: Explicit user consent tracking
3. **Audit Logging**: Comprehensive audit trail for all operations
4. **Data Retention**: Automated data retention policies
5. **Access Control**: Role-based access control (RBAC)
6. **Data Anonymization**: Automatic data anonymization for analytics

## Conclusion

The DOP-FE business flows and processes have been completely redesigned to leverage modern technologies and architectural patterns. The new flow-based system provides unprecedented flexibility for business process management, while the VNPT eKYC integration enhances security and user experience.

Key improvements include:
- **Dynamic Flow Management**: Admin-configurable business processes
- **Enhanced Security**: eKYC verification with VNPT SDK
- **Modern Architecture**: Next.js 15, React 19, and shadcn/ui
- **Improved Developer Experience**: TypeScript strict mode, React Query, and comprehensive tooling
- **Better Performance**: Optimized bundle size and loading strategies

This architecture provides a solid foundation for future growth and enhancement while maintaining compliance with financial industry regulations.