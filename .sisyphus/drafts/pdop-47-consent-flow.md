# Draft: PDOP-47 - User Consent Flow Implementation

## Task Overview
**Task Key**: PDOP-47
**Title**: Triển khai User Consent Flow cho Loan Application
**Assignee**: trung.ngo@datanest.vn
**Priority**: Medium

## Original Requirements

### Scope
- Tích hợp flow consent vào trang chủ (trước khi điền form vay)
- Không bao gồm admin dashboard (task riêng)

### Technical Requirements

1. **Tạo Consent Store** (Zustand)
   - File: `src/store/use-consent-store.ts`
   - Quản lý trạng thái consent của user
   - Lưu consent_id khi đã đồng ý
   - Track consent status (pending, agreed, declined)

2. **Tạo Consent Modal Component**
   - File: `src/components/consent/ConsentModal.tsx`
   - Hiển thị consent modal với nội dung GDPR-compliant
   - Cho phép user accept/decline consent
   - Hiển thị checkbox cho từng mục consent (nếu cần)
   - Button "Đồng ý" và "Từ chối"

3. **Tạo Wrapper Function cho Consent APIs**
   - File: `src/lib/consent/credit-card-consent.ts`
   - Hàm `submitCreditCardConsent()` orchestrate 5 API calls:
     a. POST /consent - Tạo consent record
     b. POST /consent-data-category - Link data categories
     c. POST /consent-log - Audit log
   - Xử lý error và retry logic
   - Trả về consent_id khi success

4. **Tích hợp vào Home Page**
   - File: `src/app/[locale]/page.tsx`
   - Check consent status khi user mở trang
   - Nếu chưa consent → show consent modal
   - Nếu đã consent → ẩn modal, show bình thường
   - Lưu consent_id vào store

5. **Modify DynamicLoanForm**
   - File: `src/components/loan-application/DynamicLoanForm.tsx`
   - Bổ sung consent_id vào dữ liệu submit lead
   - Validate consent đã được chấp nhận trước khi submit
   - Hiển thị error message nếu chưa consent

6. **Error Handling & Validation**
   - Hiển thị thông báo lỗi nếu consent API fail
   - Retry logic cho các API calls
   - Fallback nếu backend not ready
   - Log error để debug

## Consent API Structure

### Available Endpoints (from consent.yaml)

**Consent Record APIs:**
- POST /consent - Create new consent record
- GET /consent - Search consents
- GET /consent/{id} - Get consent by ID
- PATCH /consent/{id} - Update consent
- DELETE /consent/{id} - Delete consent

**Consent Data Category APIs:**
- POST /consent-data-category - Link data categories to consent
- GET /consent-data-category - Search consent data categories
- GET /consent-data-category/{id} - Get by ID
- PATCH /consent-data-category/{id} - Update
- DELETE /consent-data-category/{id} - Delete

**Consent Log APIs:**
- POST /consent-log - Create consent log (audit trail)
- GET /consent-log - Search consent logs
- GET /consent-log/{id} - Get log by ID
- PATCH /consent-log/{id} - Update log
- DELETE /consent-log/{id} - Delete log

### Entities Required for Flow

1. **Consent** - Main consent record
2. **ConsentDataCategory** - Links consent to data categories
3. **ConsentLog** - Audit trail
4. **DataCategory** - Pre-configured from admin (not created in user flow)
5. **ConsentPurpose** - Pre-configured from admin (not created in user flow)

## Current Codebase Analysis

### Home Page (`src/app/[locale]/page.tsx`)
- Has HeroBanner, ProductTabs, LoanProductPanel
- No consent check currently
- No modal integration
- LoanProductPanel contains DynamicLoanForm

### DynamicLoanForm (`src/components/loan-application/DynamicLoanForm.tsx`)
- Uses useCreateLead hook for lead submission
- Has phone verification and OTP flow
- Currently does NOT include consent_id
- Has TermsAgreement component (separate from consent)

### TermsAgreement (`src/components/loan-application/ApplyLoanForm/components/TermsAgreement.tsx`)
- Shows terms and conditions agreement
- Has agreeStatus field ("0" or "1")
- This is LEGAL contract agreement, NOT GDPR consent
- Must NOT be removed or modified

### API Client (`src/lib/api/client.ts`)
- Has retry logic (3 attempts, exponential backoff)
- Has timeout management (30s default)
- Has auth token handling
- Consent APIs use same base URL as other APIs

## Technical Decisions

### Consent vs TermsAgreement
- **Decision**: Keep BOTH fields
- **Reasoning**:
  - TermsAgreement: Legal contract with app terms (agreeStatus field)
  - Consent: GDPR data processing consent (new APIs)
  - They serve different legal purposes

### Consent Flow Pattern
- **Chosen**: Pre-form consent modal (before loan form)
- **Reasoning**:
  - Better UX for GDPR compliance
  - User must consent before entering personal data
  - Clear separation between consent and terms

### Consent Modal Design
- **Pattern**: Use Dialog from shadcn/ui
- **Content**: GDPR-compliant text with purpose description
- **Actions**: "Đồng ý" (primary) and "Từ chối" (secondary)
- **Validation**: User must accept before continuing

### API Orchestration
- **Approach**: Wrapper function with error handling
- **Flow**:
  1. POST /consent → Get consent_id
  2. POST /consent-data-category → Link categories
  3. POST /consent-log → Audit trail
- **Error Handling**:
  - If step 1 fails → Return error to UI
  - If step 2 or 3 fails → Log error but proceed (non-blocking)
  - Retry logic for transient errors (timeouts)

### State Management
- **Store**: Zustand (like other stores)
- **State**:
  - consentId: string | null
  - consentStatus: "pending" | "agreed" | "declined"
  - consentData: ConsentRecord | null
  - lastConsentDate: string | null
- **Persistence**: localStorage (for reload)

## Dependencies

### Backend Dependencies
- Consent APIs must be deployed and accessible
- ConsentPurpose and DataCategory must be configured in admin
- DataProcessor and DataController must exist

### Frontend Dependencies
- shadcn/ui Dialog component for modal
- apiClient from `src/lib/api/client.ts`
- Existing Zustand store pattern
- i18n keys for consent text

## Open Questions

### Consent Modal Content
- What specific text should be shown in consent modal?
- Should it be static text or loaded from API?
- Which consent purposes should be shown?

### Data Categories
- Which data categories to link to consent?
- Should be hardcoded or fetched from API?
- What are the default data categories?

### Fallback Behavior
- What if consent APIs are not ready (503)?
- Should user still see the form with warning?
- Or block completely until APIs are ready?

### Consent ID Management
- How long to store consent_id in localStorage?
- When to force re-consent (e.g., after policy changes)?
- Should user be able to view/change consent later?

## Files to Modify/Create

### New Files
1. `src/store/use-consent-store.ts` - Consent state management
2. `src/components/consent/ConsentModal.tsx` - GDPR consent modal
3. `src/lib/consent/credit-card-consent.ts` - Wrapper function for consent APIs

### Modified Files
1. `src/app/[locale]/page.tsx` - Add consent check and modal
2. `src/components/loan-application/DynamicLoanForm.tsx` - Include consent_id

### Reference Files
1. `src/lib/api/specs/consent.yaml` - API specification
2. `src/store/use-ekyc-store.ts` - Zustand store pattern
3. `src/components/ui/dialog.tsx` - Dialog component
4. Existing modal components for patterns

## Next Steps

1. Confirm consent modal content and data categories with user
2. Create consent store with Zustand
3. Create wrapper function for consent API orchestration
4. Build consent modal component
5. Integrate modal into home page
6. Modify DynamicLoanForm to include consent_id
7. Test full flow end-to-end
