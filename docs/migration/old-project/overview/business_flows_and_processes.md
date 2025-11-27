# Business Flows and Processes Documentation

## Overview

This document outlines the key business flows, user journeys, authentication processes, and API interactions within the FinZone frontend application. FinZone is a financial lead-generation platform that connects users with credit cards, loans, and insurance products.

## User Journeys

### 1. Loan Application Journey

**Flow:** Homepage → Loan Application → OTP Verification → Additional Information → Loan Results

1. **Initial Application (Homepage)**
   - User selects loan amount (5-90 million VND)
   - User selects loan period (3-36 months)
   - User selects loan purpose (consumer, education, travel, etc.)
   - User agrees to terms and conditions
   - User provides phone number

2. **OTP Verification**
   - System sends OTP via SMS or call (depending on telco)
   - User enters OTP (4-6 digits based on telco)
   - System validates OTP
   - Maximum attempts: 3 times
   - Maximum refresh requests: 5 times

3. **Additional Information**
   - Personal information: Full name, National ID, Province
   - Income information: Employment status, field, income range
   - Financial information: Current loans, credit history

4. **Loan Results**
   - System displays matching loan products
   - User can select and apply for specific loans
   - Lead is forwarded to selected financial institution

### 2. Credit Card Journey

**Flow:** Homepage → Credit Card Module → Search/Compare → Card Details → Application

1. **Credit Card Selection**
   - User chooses between "Search Card" or "Compare Card"
   - For search: User applies filters and browses cards
   - For compare: User selects up to 3 cards for side-by-side comparison

2. **Card Details**
   - User views detailed card information
   - User reviews features, fees, and benefits
   - User clicks "Apply" or redirect to partner

3. **Application/Redirect**
   - User is redirected to partner's application page
   - System tracks the click-through for lead generation

### 3. Insurance Journey

**Flow:** Homepage → Insurance Module → Product Selection → Purchase

1. **Insurance Type Selection**
   - User selects insurance type (currently only "Assets Insurance")
   - "Health Insurance" is marked as "Coming Soon"

2. **Product Details**
   - User views insurance product details
   - User sees pricing and coverage information
   - User clicks "Mua Ngay" (Buy Now)

3. **Purchase/Redirect**
   - User is redirected to insurance provider
   - System tracks the lead generation

## Authentication Flows

### 1. CFP (Content Financial Partner) Login

**File:** [`functions/cfp_login.ts`](functions/cfp_login.ts:1)

1. **Login Request**
   - POST request to CFP login endpoint
   - Password is hashed using SHA-256
   - Hash is compared with stored hash

2. **Authentication Success**
   - Sets authentication cookie
   - Redirects to home page
   - Cookie expires based on `CFP_COOKIE_MAX_AGE`

3. **Authentication Failure**
   - Redirects to login page with error parameter
   - Displays error message to user

### 2. OTP (One-Time Password) Authentication

**File:** [`modules/OtpForm/index.tsx`](modules/OtpForm/index.tsx:1)

1. **OTP Generation**
   - Triggered after initial loan application
   - OTP length varies by telco (4 digits for Mobifone/Vinaphone, 6 for Viettel)
   - Delivered via SMS or call

2. **OTP Verification Process**
   - User enters OTP digits in separate input fields
   - Auto-focus management between fields
   - Real-time validation
   - 60-second timeout

3. **OTP States**
   - `WAITING_OTP_INPUT`: Initial state
   - `OTP_SUBMITTING`: Verification in progress
   - `OTP_SUCCESS`: Verification successful
   - `OTP_FAILED`: Invalid OTP entered
   - `OTP_EXPIRED`: OTP timed out
   - `FORCE_REFRESH_OTP`: Maximum attempts reached

4. **Error Handling**
   - Maximum 3 incorrect attempts
   - Maximum 5 refresh requests
   - Force redirect to homepage on limit exceeded

## Data Input and Transaction Flows

### 1. Loan Application Data Flow

**Files:** 
- [`modules/ApplyLoanForm/index.tsx`](modules/ApplyLoanForm/index.tsx:1)
- [`modules/LoanExtraInfoForm/index.tsx`](modules/LoanExtraInfoForm/index.tsx:1)

#### Initial Loan Data Collection
1. **Basic Loan Information**
   - Loan amount (5-90 million VND)
   - Loan period (3-36 months)
   - Loan purpose (predefined options)
   - Phone number with telco validation

2. **Validation Rules**
   - Phone number must be from supported telcos (Viettel, Mobifone, Vinaphone)
   - All fields are required
   - Terms agreement is mandatory

#### Additional Information Collection
1. **Personal Information**
   - Full name (alphabetic characters only)
   - 12-digit National ID with province code validation
   - Province selection
   - Vehicle registration ownership

2. **Income Information**
   - Employment status
   - Field of work (for employed users)
   - Monthly income range

3. **Financial Information**
   - Current existing loans
   - Credit history (last 3 years)

### 2. Lead Submission Process

**File:** [`states/zu-action.tsx`](states/zu-action.tsx:1)

1. **Initial Lead Creation**
   - Triggered by `applyLoanOnHomePage` function
   - Includes device fingerprinting
   - Includes tracking parameters
   - Includes consent ID
   - Requires reCAPTCHA token

2. **OTP Verification**
   - Triggered by `submitOtp` function
   - Includes lead ID and consent ID
   - Requires JWT token from initial response

3. **Additional Information Submission**
   - Triggered by `startSubmittingAndFindingLoan` function
   - Maps form data to API format
   - Includes session token

4. **Lead Forwarding**
   - Triggered by `forwardLead` function
   - Includes product ID and client code
   - Tracks successful lead generation

## API Endpoints

### Authentication Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/cfp_login` | POST | CFP authentication with password hashing |
| `/otp/submit` | POST | Verify OTP for loan application |
| `/otp/renew` | POST | Request new OTP |

### Lead Management Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/upl/new` | POST | Create new loan lead |
| `/upl/submit-info` | POST | Submit additional loan information |
| `/upl/forward` | POST | Forward lead to financial institution |
| `/lead/[LEAD_ID]/status` | GET | Check lead status |

### Credit Card Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/cards/all` | GET | Get all available credit cards |
| `/cards/card` | GET | Get filtered credit cards |
| `/cards/by-id` | GET | Get specific card by ID |
| `/cards/by-ids` | GET | Get multiple cards by IDs |
| `/cards/click-link` | POST | Track card click-through |
| `/cat/all` | GET | Get all card categories |

### Insurance Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/insurance/all` | GET | Get all available insurance products |

### Tools Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/tools/saving` | GET | Get saving calculator data |
| `/tools/saving/all` | GET | Get saving interest rates |
| `/tools/saving/interest` | POST | Calculate saving interest |
| `/tools/salary` | GET | Get salary conversion data |
| `/tools/ir` | GET | Get interest rate calculator |

### Consent Management Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/consent/submit` | POST | Submit user consent |
| `/consent/check` | GET | Check consent status |
| `/consent/latest` | GET | Get latest consent content |

### Tracking Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/tr_e` | POST | Track user events |
| `/tr_s` | POST | Track user sessions |
| `/lead/[LEAD_ID]/click-link` | POST | Track referral link clicks |

### Document Management Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/documents/presigned/download` | GET | Get document download link |
| `/documents/presigned/upload` | GET | Get document upload information |

### Partner Integration Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/partner/redirect` | POST | Redirect to partner application |

## Error Handling

### API Error Codes

| Code | Description | Handling |
|------|-------------|-----------|
| 1 | Unknown Error | Generic error message |
| 2 | Invalid Body Request | Validation error |
| 3 | Invalid Lead ID | Redirect to homepage |
| 4 | Invalid Expected Amount | Validation error |
| 5 | Invalid Loan Period | Validation error |
| 6 | Missing Loan Purpose | Validation error |
| 7 | Missing Device ID | Device fingerprinting error |
| 8 | Invalid Phone Number | Phone validation error |
| 9 | Maximum Lead Registration | Rate limiting error |
| 10 | Invalid OTP | OTP verification error |
| 11 | Duplicated Lead | Lead already exists |
| 12 | Maximum OTP Verify | OTP limit exceeded |
| 13 | Verify OTP Failed | OTP verification failed |
| 14 | Missing Full Name | Validation error |
| 15 | Invalid National ID | ID validation error |
| 16 | Invalid Gender | Validation error |
| 17 | Missing Province | Validation error |
| 18 | Missing District | Validation error |
| 19 | Missing Birthday | Validation error |
| 20 | Age Not in Range | Age validation error |
| 21 | Missing Income Type | Validation error |
| 22 | Invalid Income | Income validation error |
| 23 | No Available Products | No matching products |
| 24 | Invalid Product ID | Product validation error |
| 25 | Missing Client Code | Partner validation error |
| 26 | Missing Finance Name | Partner validation error |
| 27 | Missing Finance Link | Partner validation error |
| 28 | Lead Rejected | Lead rejected by partner |
| 50 | Unsupported Telco | Telco not supported |
| 51 | Maximum OTP Request | OTP request limit exceeded |

## Security Measures

1. **Password Hashing**: SHA-256 hashing for CFP authentication
2. **OTP Security**: Time-limited OTP with attempt limits
3. **reCAPTCHA Integration**: Google reCAPTCHA for form submissions
4. **Device Fingerprinting**: Unique device identification
5. **JWT Tokens**: Session management for lead verification
6. **Secure Cookies**: HttpOnly and Secure flags for authentication cookies

## Tracking and Analytics

1. **Event Tracking**: All user interactions are tracked via EventType constants
2. **Session Management**: User sessions are tracked for analytics
3. **Lead Attribution**: Referral links and tracking parameters are captured
4. **Conversion Tracking**: Partner redirects and lead generation are tracked

## Integration Points

1. **Financial Institutions**: Integration with 30+ banks and financial institutions
2. **Telco Providers**: Integration with Viettel, Mobifone, and Vinaphone for OTP delivery
3. **Insurance Providers**: Integration with insurance companies for policy sales
4. **Analytics Platforms**: Integration with Google Analytics
5. **Fingerprinting**: Integration with FingerprintJS for device identification

## Compliance and Consent

1. **Consent Management**: User consent is captured and stored for compliance
2. **Data Privacy**: Personal data is handled according to privacy regulations
3. **Terms Agreement**: Users must agree to terms before proceeding
4. **Data Processing**: Clear disclosure of data processing for loan matching