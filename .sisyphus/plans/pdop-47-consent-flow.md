# Triển khai User Consent Flow cho Loan Application

## Context

### Original Request
**Task Key**: PDOP-47
**Title**: Triển khai User Consent Flow cho Loan Application
**Assignee**: trung.ngo@datanest.vn
**Priority**: Medium

### Interview Summary
**Key Discussions:**
- Confirmed consent APIs are deployed and available at `https://consent-stg.datanest.vn/v1` and `https://consent.datanest.vn/v1`
- Confirmed DataProcessor, DataController, ConsentPurpose, DataCategory entities will be setup via admin dashboard (PDOP-49)
- Confirmed user flow scope: integrate consent BEFORE loan form, not include admin features
- Confirmed TermsAgreement component must remain unchanged (separate from consent flow)

**Research Findings:**
- **Consent API Structure**: 3 sequential API calls required:
  1. POST /consent - Creates consent record
  2. POST /consent-data-category - Links consent to data categories
  3. POST /consent-log - Creates audit trail
- **Required Fields**: controller_id, processor_id, lead_id, consent_version_id, source, action (ConsentAction: "grant"|"revoke"|"update"|"delete")
- **Data Categories**: Must be pre-configured by admin
- **Consent Version**: Must reference existing consent purpose with version number
- **API Client**: Dedicated `consentClient` at `/v1/consent` with full middleware stack
- **Store Patterns**: Session-based like eKYC store (encrypted sessionStorage), follows existing Zustand conventions
- **Modal Patterns**: shadcn/ui Dialog with controlled state, similar to OtpVerificationModal

**Technical Decisions:**
1. **Persistence Strategy**: Session-based (no localStorage)
   - Rationale: Reload page should trigger consent again (GDPR compliance)
   - User can close browser → consent reset
   - Better for compliance (always fresh consent per session)
2. **Data Categories**: Hardcoded 3 categories for initial implementation
   - Categories: `["personal_data", "financial_data", "contact_data"]`
   - Rationale: Simplify implementation, admin must setup entities first
   - Future: Can enhance to fetch categories via GET /data-category when available
3. **Consent Content**: Static GDPR-compliant text in modal
   - Rationale: Faster implementation, better control over wording
   - Content will include: purpose description, data categories list, retention policy link
4. **API Orchestration**: Wrapper function with error handling
   - Step 1 critical (create consent) → blocks user if fails
   - Steps 2-3 non-critical (categories + log) → log but continue for UX

### Metis Review
**Identified Gaps** (addressed):
1. Consent modal trigger mechanism - defined: show on page load, check store, conditional display
2. Data category IDs - defined: hardcoded array of UUIDs (need to get from admin initially)
3. Consent version management - need mechanism to track versions (simplify: use purpose.version)
4. Lead ID integration point - where to inject consent_id into lead creation flow
5. Error handling strategy - defined: blocking vs non-blocking, fallback when APIs unavailable
6. DynamicLoanForm validation - ensure consent check before form submission
7. Translation keys - need to define i18n structure for consent modal content

**Guardrails Applied:**
1. Keep TermsAgreement component unchanged - separate legal concept from consent
2. Don't modify lead creation API - only inject consent_id field
3. Consent modal cannot be bypassed - user must accept before accessing loan form
4. No admin features in this task - separate PDOP-49 task
5. Session-based persistence ensures consent resets on page reload
6. Hardcoded categories match GDPR requirements for credit card application
7. Fallback behavior ensures graceful degradation when consent APIs unavailable

---

## Work Objectives

### Core Objective
Tích hợp hệ thống consent mới (GDPR-compliant) vào flow đăng ký khoản vay của người dùng trên trang chủ, cho phép user đồng ý xử lý dữ liệu cá nhân trước khi điền form.

### Concrete Deliverables
- Zustand store quản lý trạng thái consent (`src/store/use-consent-store.ts`)
- Modal consent hiển thị GDPR-compliant (`src/components/consent/ConsentModal.tsx`)
- Wrapper function orchestrate consent APIs (`src/lib/consent/credit-card-consent.ts`)
- Trang chủ tích hợp check consent và hiển thị modal (`src/app/[locale]/page.tsx`)
- Form vay bao gồm consent_id trong dữ liệu submit (`src/components/loan-application/DynamicLoanForm.tsx`)
- Thông báo lỗi rõ ràng cho user khi API fail

### Definition of Done
- [ ] User mở trang chủ → thấy consent modal (nếu chưa consent)
- [ ] User click "Đồng ý" → consent modal đóng, consent được lưu
- [ ] Consent APIs được gọi: POST /consent → POST /consent-data-category → POST /consent-log
- [ ] consent_id được lưu vào session store
- [ ] User có thể điền form vay (consent_id được validate)
- [ ] Error handling hoạt động: hiển thị thông báo khi API fail
- [ ] Consent modal không hiển thị lại trong cùng session (trừ khi reload)
- [ ] DynamicLoanForm bao gồm consent_id khi tạo lead
- [ ] Fallback: khi consent APIs unavailable → cho phép user tiếp tục với warning

### Must Have
- Consent modal hiển thị đúng nội dung GDPR-compliant
- Session-based persistence cho consent state
- Wrapper function orchestrate 3 API calls với error handling
- Consent modal tích hợp vào trang chủ
- Consent validation trong DynamicLoanForm trước khi submit
- Fallback behavior khi backend chưa sẵn sàng
- TermsAgreement component giữ nguyên vẹn không thay đổi

### Must NOT Have
- Không bao gồm admin dashboard (task riêng PDOP-49)
- Không tạo, sửa, hay xóa TermsAgreement component
- Không thay đổi lead creation API logic (chỉ inject consent_id)
- Không sử dụng localStorage cho consent_id
- Không fetch data categories từ API (hardcode)
- Không tạo cơ chế versioning phức tạp cho bản đầu

---

## Verification Strategy

### Test Infrastructure Assessment
- **Infrastructure exists**: Vitest + Playwright
- **User preference**: Manual QA (from task description)
- **Approach**: Detailed manual verification procedures for each task

### Manual Verification Commands
```bash
# Development server (local testing)
pnpm dev

# Run type check (ensure TypeScript valid)
pnpm type-check

# Run lint check (ensure code quality)
pnpm lint

# Verify components exist
ls src/store/use-consent-store.ts
ls src/components/consent/ConsentModal.tsx
ls src/lib/consent/credit-card-consent.ts
```

---

## Task Flow

```
Task 1: Create Consent Store
  └─ Task 2: Create Consent Modal Component
  └─ Task 3: Create Wrapper Function for Consent APIs
  └─ Task 4: Integrate Consent Modal into Home Page
  └─ Task 5: Modify DynamicLoanForm to Include Consent ID
       └─ Task 6: Error Handling & Validation
            └── Task 7: Manual Verification (Final Check)
```

---

## TODOs

### Task 1: Create Consent Store (Zustand)

**What to do:**
- Create `src/store/use-consent-store.ts`
- Implement session-based state management
- Store consentId, consentStatus, consentData, lastConsentDate
- Actions: giveConsent, clearConsent, setConsentStatus
- Getters: hasConsent, getConsentId
- Persistence: encrypted sessionStorage for consentId

**Must NOT do:**
- Don't use localStorage (user decided session-based)
- Don't persist sensitive data without encryption

**Parallelizable**: NO (foundational dependency)

**Acceptance Criteria:**
- [ ] File `src/store/use-consent-store.ts` created with:
  - Interface `ConsentState` with all required state fields
  - `create<ConsentState>()` with persist middleware
  - `giveConsent()` action stores consent ID
  - `clearConsent()` action clears session on logout/reload
  - `hasConsent()` getter checks if user has active consent
  - `getConsentId()` getter retrieves stored consent ID
  - Persistence uses encrypted sessionStorage with proper error handling
- [ ] Store follows existing Zustand patterns from `use-ekyc-store.ts` (persist with createJSONStorage, subscribeWithSelector)
- [ ] TypeScript compiles without errors: `pnpm type-check`
- [ ] Linter passes without warnings: `pnpm lint src/store/use-consent-store.ts`

**References** (CRITICAL - Be Exhaustive):

**Pattern References** (existing code to follow):
- `src/store/use-ekyc-store.ts:1199 lines` - Zustand store pattern with `create<...>()`, `persist()`, `subscribeWithSelector()`
  - Key patterns: persist middleware with sessionStorage, error handling in try/catch, loading states, encrypted data management
  - Example: `persist((set, get) => ({ status, encryptedData: new Map() }))`
  - Example action: `set((state) => ({ status: "success", encryptedData }))`

**API/Type References** (types to use):
- Generated types from `src/lib/api/v1/consent.d.ts` (auto-generated from schema.yaml)
- Use `ConsentCreateRequest`, `ConsentLogCreateRequest` interfaces
- API client: `src/lib/api/services/consent.ts` - use `consentClient.POST("/consent", { body: consentData })`

**Component References** (shadcn/ui patterns to follow):
- Modal structure: `<Dialog open={open} onOpenChange={setOpen}>` with DialogHeader, DialogTitle, DialogDescription, DialogContent, DialogFooter
- Example component: `src/components/loan-application/ApplyLoanForm/components/OtpVerificationModal.tsx` (43 lines)
  - Button patterns: `<Button variant="outline" onClick={handleClose}>Cancel</Button>`, `<Button onClick={handleSubmit} loading={isSubmitting}>Submit</Button>`

**Documentation References** (understanding architecture):
- `src/lib/api/specs/consent.yaml`: Lines 1-2200 - Complete API specification with consent endpoints, request schemas, and response definitions
- `AGENTS.md` - Store structure overview (store patterns, naming conventions, anti-patterns)
- Project README: Overview of tech stack (Next.js 15, Zustand, shadcn/ui)

**External References** (libraries and best practices):
- Zustand documentation: https://zustand.docs.pmnd.rs.dev/core/concepts
- shadcn/ui documentation: https://ui.shadcn.com/docs/components/dialog
- Next.js documentation: https://nextjs.org/docs

---

### Task 2: Create Consent Modal Component

**What to do:**
- Create `src/components/consent/ConsentModal.tsx`
- Implement GDPR-compliant consent modal using shadcn/ui Dialog component
- Display static consent text (Vietnamese)
- Two buttons: "Đồng ý" (primary) and "Từ chối" (secondary/outline)
- State management: `const [open, setOpen] = useState(false)`
- Integration with consent store: check `hasConsent()` to auto-close if already consented
- Call wrapper function on accept: `await submitCreditCardConsent()`
- Error handling: Show error message via toast if submission fails
- Loading states: Disable buttons during API call, show spinner

**Must NOT do:**
- Don't fetch consent purposes or categories from API (use hardcoded)
- Don't create multi-page modal
- Don't use TermsAgreement component pattern (different purpose)

**Parallelizable**: NO (depends on Task 1 and 3)

**Acceptance Criteria:**
- [ ] File `src/components/consent/ConsentModal.tsx` created with:
  - shadcn/ui Dialog integration with proper imports
  - Modal title: "Đồng ý xử lý dữ liệu cá nhân"
  - Static consent content in Vietnamese
  - Two action buttons (Đồng ý/Từ chối)
  - Loading state support (disabled buttons during submission)
  - Error state with toast notifications
  - Responsive design ( Dialog size="md" )
- [ ] Modal integrates with consent store: checks `hasConsent()`, calls `submitCreditCardConsent()`, handles success/error
- [ ] TypeScript compiles: `pnpm type-check src/components/consent/ConsentModal.tsx`
- [ ] Linter passes: `pnpm lint src/components/consent/ConsentModal.tsx`
- [ ] Manual verification: Open modal at `http://localhost:3000/vi` → Click "Đồng ý" → Toast success → Consent stored → Modal closes → Reload page → Modal doesn't show

**References** (CRITICAL - Be Exhaustive):

**Pattern References** (existing code to follow):
- `src/components/loan-application/ApplyLoanForm/components/OtpVerificationModal.tsx:43 lines` - Modal example with useState, Dialog structure, button patterns
- `src/components/ui/dialog/index.tsx` - Base Dialog implementation

**Component References** (shadcn/ui):
- Dialog component: https://ui.shadcn.com/docs/components/dialog
- Button component: https://ui.shadcn.com/docs/components/button
- AlertDialog: https://ui.shadcn.com/docs/components/alert-dialog

**i18n References** (translation keys to define):
- Need to add consent-specific keys to `messages/[locale]/features/consent.json`
- Example structure: `{ "modal": { "title": "...", "description": "...", "agreeButton": "...", "declineButton": "..." } }`

**Store References** (state management):
- `src/store/use-ekyc-store.ts:1199 lines` - Zustand pattern reference
- `src/store/use-consent-store.ts` - Will create (Task 1) - Should follow this pattern

**API References** (consent APIs to call):
- `src/lib/api/specs/consent.yaml` - Lines 670-733 (ConsentCreateRequest schema)
- `src/lib/api/services/consent.ts` - Has `consentClient` with full middleware
- Schema types: `ConsentCreateRequest`, `ConsentLogCreateRequest` from `src/lib/api/v1/consent.d.ts`

---

### Task 3: Create Wrapper Function for Consent APIs

**What to do:**
- Create `src/lib/consent/credit-card-consent.ts`
- Implement `submitCreditCardConsent()` function to orchestrate 3 API calls
- API 1: POST /consent - Create consent record
- API 2: POST /consent-data-category - Link data categories (loop through hardcoded array)
- API 3: POST /consent-log - Create audit log
- Use `consentClient` from `src/lib/api/services/consent.ts`
- Error handling:
  - Step 1 failure: Throw error, return consentId = null
  - Step 2 failure: Log error, continue (don't throw)
  - Step 3 failure: Log error, return consentId (may be useful)
- Retry logic: Use apiClient built-in retry (3 attempts, exponential backoff)
- Return consentId on success or partial success

**Must NOT do:**
- Don't create separate API client (use existing consentsClient)
- Don't implement complex error recovery flows
- Don't add extra API calls beyond the 3 specified
- Don't implement custom timeout logic (use apiClient defaults)

**Parallelizable**: NO (depends on Task 1 store)

**Acceptance Criteria:**
- [ ] File `src/lib/consent/credit-card-consent.ts` created with:
  - `submitCreditCardConsent()` function with proper TypeScript types
  - Sequential API calls: consent → data categories (loop) → log
  - Error handling for each step with proper fallbacks
  - Returns `string` (consentId) on success, `null` on step 1 failure
  - Uses `consentClient` from `src/lib/api/services/consent.ts`
- [ ] TypeScript compiles: `pnpm type-check src/lib/consent/credit-card-consent.ts`
- [ ] Error handling covers: network errors, 400/401/403/404/500/503
- [ ] Retry logic built-in: 3 attempts with exponential backoff (default apiClient behavior)

**References** (CRITICAL - Be Exhaustive):

**API Client References** (existing code to use):
- `src/lib/api/services/consent.ts` - Use `consentClient` (auto-generated client)
- Example usage: `await consentsClient.POST("/consent", { body: consentData })`
- Client has built-in middleware, retry logic, error handling

**Schema References** (request/response types):
- `src/lib/api/v1/consent.d.ts` - Generated types
- `ConsentCreateRequest`: controller_id, processor_id, lead_id, consent_version_id, source, action
- `ConsentLogCreateRequest`: consent_id, action, action_by, source
- `ConsentAction`: "grant", "revoke", "update", "delete" (enum)

**Store References** (created in Task 1):
- `src/store/use-consent-store.ts` - Will have `giveConsent(consentId)` action
- `giveConsent()` expects: consentId: string or null

**Hardcoded References** (data categories):
- Task 2 will create array of category IDs to link: `["personal_data_id", "financial_data_id", "contact_data_id"]`
- These IDs will be passed to POST /consent-data-category

**Documentation References** (API patterns):
- `AGENTS.md` - API client architecture overview
- `src/lib/api/README.md` - Client features (retry, timeout, error handling)

---

### Task 4: Integrate Consent Modal into Home Page

**What to do:**
- Modify `src/app/[locale]/page.tsx`
- Add useEffect to check consent status on page mount
- Import `useConsentStore`, `ConsentModal` components
- Conditional rendering: Show ConsentModal if `!hasConsent()`
- Consent modal props: `onSuccess={() => router.push('/user-onboarding')}`
- Consent modal passed `consentId` as prop for "Đồng ý" action
- Ensure modal is in DOM before calling set functions

**Must NOT do:**
- Don't modify existing HeroBanner, ProductTabs, LoanProductPanel, etc.
- Don't move existing components
- Don't add consent check to every page section
- Don't create separate consent route (integrate into existing home page)

**Parallelizable**: NO (depends on Tasks 1, 2, 3)

**Acceptance Criteria:**
- [ ] File `src/app/[locale]/page.tsx` modified with:
  - Consent modal integration: Import components, conditional render based on `hasConsent()`
  - useEffect dependency array: `[useConsentStore, ConsentModal]`
  - Modal only shows if consent not given (`!hasConsent()`)
  - User can still interact with other page elements while modal is open
  - TypeScript compiles: `pnpm type-check src/app/[locale]/page.tsx`
  - [ ] Linter passes: `pnpm lint src/app/[locale]/page.tsx`
- [ ] Manual verification: Navigate to `http://localhost:3000/vi` → Consent modal should appear → Click "Đồng ý" → Success → Modal closes → Navigate away → Back → Modal should NOT appear

**References** (CRITICAL - Be Exhaustive):

**File References** (existing code to modify):
- `src/app/[locale]/page.tsx:62 lines` - Current home page structure
- Existing components: Header, HeroBanner, ProductTabs, LoanProductPanel
- Import patterns: React imports from components, useTranslations hook usage

**Component References** (created in Task 2):
- `src/components/consent/ConsentModal.tsx` - Modal component to integrate
- `src/store/use-consent-store.ts` - Created in Task 1, will have `hasConsent()` getter

**Store Integration Patterns**:
- `src/store/use-ekyc-store.ts:1199 lines` - How stores use Zustand actions
- `src/app/[locale]/page.tsx` - Will read consent store state: `const hasConsent = useConsentStore(state => state.hasConsent())`

**Component Structure Patterns**:
- HeroBanner, ProductTabs, LoanProductPanel - existing layout components
- Modal integration: Add conditional rendering, similar to how modals are integrated elsewhere

---

### Task 5: Modify DynamicLoanForm to Include Consent ID

**What to do:**
- Modify `src/components/loan-application/DynamicLoanForm.tsx`
- Find lead creation API call (search for "createLead" or similar)
- Add consent_id to lead data before submitting
- Validate consent status before allowing submission: Check `useConsentStore.hasConsent()` before submit
- Show error message if user tries to submit without consent: "Bạn cần đồng ý consent để tiếp tục"
- Use consent store getter: `const consentId = useConsentStore(state => state.consentId)` to get consent ID
- Ensure consent_id is included in lead submission payload

**Must NOT do:**
- Don't modify existing lead creation logic or API call
- Don't change existing form validation or phone verification flow
- Don't create separate consent check inside form (handled by modal)
- Don't modify TermsAgreement component or agreeStatus handling

**Parallelizable**: NO (depends on Tasks 1, 2, 3)

**Acceptance Criteria:**
- [ ] File `src/components/loan-application/DynamicLoanForm.tsx` modified with:
  - consent_id included in lead creation: Search for lead submission, inject consentId
  - Consent validation: Check `useConsentStore.hasConsent()` before submit
  - Error message: Show toast if consent not given when trying to submit
  - [ ] TypeScript compiles: `pnpm type-check src/components/loan-application/DynamicLoanForm.tsx`
  - [ ] Linter passes: `pnpm lint src/components/loan-application/DynamicLoanForm.tsx`
- [ ] DynamicLoanForm still works normally when consent is given (existing flow unchanged)
- [ ] Manual verification: Open loan form → Submit without consent → Should see error "Bạn cần đồng ý consent"
  - [ ] Consent modal should block access to form: When modal not dismissed, form should not be accessible (or show consent modal again)

**References** (CRITICAL - Be Exhaustive):

**File References** (existing code to modify):
- `src/components/loan-application/DynamicLoanForm.tsx: 100 lines (first 100 read) - Dynamic loan form component
- Existing hooks: `useCreateLead`, `useFlow`, `useLoanPurposes`
- Existing components: PhoneVerificationModal, OtpVerificationModal, TermsAgreement
- Modal integration example: Existing modals in loan flow

**Store References** (created in Task 1):
- `src/store/use-consent-store.ts` - Will have `getConsentId()` getter
- `src/store/use-consent-store.ts` - Will have `hasConsent()` getter for validation

**Lead Creation Flow**:
- Need to understand how `createLead` API is called
- Search for mutation: `POST /leads` or `createLead` endpoint
- Understand payload structure to inject consent_id correctly

---

### Task 6: Error Handling & Validation

**What to do:**
- Add comprehensive error handling to consent modal and wrapper function
- Implement loading states: Disable buttons during API calls, show spinner
- Fallback behavior: If consent APIs return 503 (unavailable), allow user to proceed with warning
- Network error handling: Show user-friendly error messages in Vietnamese
- Validation: Prevent duplicate consent submissions in same session
- Toast notifications: Use sonner for success/error messages

**Must NOT do:**
- Don't block user indefinitely if consent APIs fail - allow manual override after warning
- Don't show technical error details to end user
- Don't create complex error recovery flows

**Parallelizable**: NO (depends on Tasks 1, 2, 3, 4, 5)

**Acceptance Criteria:**
- [ ] Consent modal shows loading state (spinner or disabled buttons) during API call
- [ ] Error messages displayed via toast: "Lỗi khi lưu consent: {error}"
- [ ] Success message: "Đồng ý thành công!"
- [ ] Fallback behavior: Show warning "Chưa đồng ý" and allow form access with warning toast
- [ ] Toast notifications use proper severity: error (red), warning (yellow), success (green)
- [ ] TypeScript compiles: `pnpm type-check` and `pnpm lint` pass for all new error handling code
- [ ] No duplicate consent submissions: Check `hasConsent()` before allowing consent action

**References** (CRITICAL - Be Exhaustive):

**Error Handling Patterns**:
- Toast from `sonner`: `toast.success(...)`, `toast.error(...)`
- Loading states: `isSubmitting` or `isLoading` boolean
- Disable buttons: `<Button disabled={isLoading}>`

**Store References** (created in Task 1):
- `src/store/use-consent-store.ts` - Will have `error` field, `isLoading` state

**Component References** (created in Task 2):
- `src/components/consent/ConsentModal.tsx` - Modal with loading state
- `src/lib/consent/credit-card-consent.ts` - Wrapper with error handling

---

### Task 7: Manual Verification (Final Check)

**What to do:**
- Perform end-to-end testing of consent flow
- Verify all acceptance criteria are met
- Document test results for each task

**Manual Verification Commands**:
```bash
# Start development server
pnpm dev

# Test Task 1: Consent Store
curl http://localhost:3000/vi
# Check browser console: Should see encrypted consentId in sessionStorage
# Reload page: Modal should NOT appear (consent persisted in session)
# Close browser: Session should reset, modal should appear on next load

# Test Task 2: Consent Modal
curl http://localhost:3000/vi
# Modal should appear (if no consent)
# Click "Đồng ý" button
# Expected: Toast success "Đồng ý thành công!"
# Verify: console shows consent submission API calls
# Reload: Modal should NOT appear (consent saved)
# Click "Từ chối": Modal closes without consent

# Test Task 3: Wrapper Function
curl http://localhost:3000/vi
# Trigger consent by clicking "Đồng ý" in modal
# Expected console logs: Shows 3 API calls (POST /consent, POST /consent-data-category, POST /consent-log)
# Verify consentId is stored: Check sessionStorage
# Reload page: Modal shouldn't appear, consentId still valid

# Test Task 4: Home Page Integration
curl http://localhost:3000/vi
# Page should load normally with HeroBanner, ProductTabs
# If no consent: Modal should appear after 3s delay (check consent)
# If has consent: Modal should NOT appear
# Navigate away from consent modal: Modal should persist state
# Back to page: Modal should still not appear (hasConsent returns true)
# Loan product panel should be accessible

# Test Task 5: DynamicLoanForm
curl http://localhost:3000/vi/user-onboarding
# Try to submit form WITHOUT consent: Should see error toast
# Submit form WITH consent: Should succeed
# Verify consentId is included in lead creation API call
# Check browser console for API calls

# Test Task 6: Error Handling
# Verify fallback behavior:
# Stop consent API (simulate 503): Should see warning toast
# Network error (simulate timeout): Should see error toast
# Reload page: Modal should reset, consentId cleared
# Check toast messages are user-friendly Vietnamese
```

**Acceptance Criteria:**
- [ ] All 7 tasks pass acceptance criteria:
  - Consent store works correctly with session persistence
  - Consent modal shows/hides correctly based on consent status
  - Wrapper function successfully orchestrates 3 API calls
  - Home page integrates modal without breaking existing functionality
  - DynamicLoanForm validates and includes consent_id
  - Error handling shows appropriate messages
  - Fallback behavior allows form access with warnings when APIs unavailable
- [ ] TypeScript compiles: `pnpm type-check` passes for all new files
- [ ] Linter passes: `pnpm lint` passes for all new files
- [ ] Manual verification confirms end-to-end functionality works as expected

**References** (CRITICAL - Be Exhaustive):

**File References** (all created/modified files):
- `src/store/use-consent-store.ts` - Created in Task 1
- `src/components/consent/ConsentModal.tsx` - Created in Task 2
- `src/lib/consent/credit-card-consent.ts` - Created in Task 3
- `src/app/[locale]/page.tsx` - Modified in Task 4
- `src/components/loan-application/DynamicLoanForm.tsx` - Modified in Task 5

**Component References** (shadcn/ui patterns):
- Dialog: https://ui.shadcn.com/docs/components/dialog
- Button: https://ui.shadcn.com/docs/components/button
- Toast: Sonner documentation

**Store References** (Zustand patterns):
- `src/store/use-ekyc-store.ts:1199 lines` - Pattern reference
- `src/store/use-consent-store.ts` - Will be created following this pattern

---

## Commit Strategy

| After Task | Message | Files | Verification |
|-------------|---------|--------|-------------|
| 1 | feat: Create consent store | use-consent-store.ts | Manual: `curl` + console checks |
| 2 | feat: Create consent modal | ConsentModal.tsx | Manual: Open at localhost:3000/vi, test modal, check TypeScript |
| 3 | feat: Create consent wrapper | credit-card-consent.ts | Manual: Trigger consent in modal, check console logs |
| 4 | feat: Integrate modal into home | page.tsx | Manual: Open localhost:3000/vi, verify modal behavior, check TypeScript |
| 5 | feat: Modify loan form for consent | DynamicLoanForm.tsx | Manual: Submit with/without consent, verify error, check consentId in payload |
| 6 | feat: Add error handling | All new files | Manual: Test all scenarios, verify fallback, check toasts |

---

## Success Criteria

### Verification Commands
```bash
# Type check entire project
pnpm type-check

# Lint all new files
pnpm lint

# Final verification
curl http://localhost:3000/vi # End-to-end flow check
```

### Final Checklist
- [ ] All TypeScript files compile without errors
- [ ] All files pass linting rules
- [ ] Consent store follows Zustand patterns
- [ ] Consent modal integrates with shadcn/ui Dialog
- [ ] Wrapper function uses existing apiClient
- [ ] Home page integrates modal without breaking
- [ ] DynamicLoanForm includes consent_id in lead submission
- [ ] Error handling works for all scenarios
- [ ] Manual verification confirms all acceptance criteria
- [ ] No TermsAgreement component modifications
- [ ] Session-based persistence (no localStorage for consent_id)

---

## Notes

**Implementation Priority**:
1. Start with Task 1 (Store foundation) - Critical dependency
2. Task 2 (Modal) - Depends on store
3. Task 3 (Wrapper) - Depends on Task 1 and modal
4. Task 4 (Home) - Depends on store and modal
5. Task 5 (Form) - Depends on store and wrapper
6. Task 6 (Error) - Apply to all components after they exist

**GDPR Compliance**:
- Consent modal includes: purpose description, data categories list, retention policy
- Consent is freely given, specific, informed, unambiguous
- Audit trail maintained via consent-log API
- User can withdraw consent (logout/reload)

**Technical Debt / Future Enhancements**:
- Fetch data categories from GET /data-category API when admin dashboard ready
- Implement consent version management for policy updates
- Add "Manage Consent" link in user settings
- Multi-language support for modal content (EN/VI)

**Risks**:
- Consent APIs may be unavailable during initial deployment (503 errors)
- Data category IDs hardcoded initially - will need update when admin creates new ones
- Consent modal content should be reviewed by legal team for GDPR compliance
