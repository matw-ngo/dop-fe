# User Consent Flow Implementation Plan

## Context

### Original Request
Implement User Consent Flow for DOP frontend based on documentation in `docs/consent/user-flow/`. The feature includes consent grant, revoke/update functionality with audit log display.

### Interview Summary

**Key Discussions**:
- **Trigger Location**: Trang chủ `src/app/[locale]/page.tsx` - hiển thị modal khi user chưa consent hoặc consent phiên bản cũ
- **Consent Categories**: Gọi API `GET /data-categories` với React Query cache
- **Consent History UI**: Tích hợp vào ConsentModal với 2 tabs (Consent Form + Consent History), Smart tab switching dựa trên API /consent response
- **User Classification Logic**: Dựa trên `GET /consent` response (empty = chưa có, có data = đã có)
- **Category Selection Granularity**: All-or-nothing (checkbox duy nhất "Đồng ý tất cả")
- **Transaction Failure Handling**: Báo lỗi user-friendly, KHÔNG rollback consent
- **Store Enhancement**: Giữ TODO encryption như placeholder (defer implementation)

**Research Findings**:
- **Critical Finding**: `src/store/use-consent-store.ts` already exists with GDPR-compliant encrypted sessionStorage
  - Stores: consentId, consentStatus ("pending" | "agreed" | "declined"), consentData, isLoading, error, lastConsentDate
  - Dispatches custom events: consent:id-updated, consent:status-updated, consent:data-updated, consent:error
  - Selectors: useConsentId, useConsentStatus, useConsentData, useConsentError, useIsLoadingConsent, useHasConsent, useIsConsentValid
  - TODO lines: Encryption not implemented (defer)
- **API Client Pattern**: `src/lib/api/client.ts` uses `openapi-fetch` with automatic retry (3 attempts), timeout config, CSRF protection, token refresh
- **Auth Store Pattern**: `src/store/use-auth-store.ts` provides `user.id` via `useAuthStore().user?.id`
- **Test Infrastructure**: Vitest (unit) + Playwright (E2E). Scripts: `pnpm test:run`, `pnpm test:e2e`
- **OpenAPI Types**: `src/lib/api/v1/consent.d.ts` auto-generated with all endpoint types
  - Key endpoints: createConsent, updateConsent, getConsent, searchConsents, searchConsentVersions, searchDataCategories, createConsentDataCategory, deleteConsentDataCategory, searchConsentLogs, createConsentLog, searchDataControllers, searchDataProcessors

**Technical Decisions from Documentation**:
- **API Endpoints** (from docs/consent/user-flow/constrains/api-payload-guide.md):
  - GET /consent-version - Load latest version
  - GET /consent - Check existing consent status
  - POST /consent - Create new consent (action="grant")
  - POST /consent-data-category - Link data categories (per category)
  - PATCH /consent/{id} - Update/revoke consent (action="revoke" | "update")
  - POST /consent-log - Audit log (append-only)
  - DELETE /consent-data-category/{id} - Remove category link
  - GET /data-category - Fetch data categories
  - GET /data-controller - Fetch controller ID
  - GET /data-processor - Fetch processor ID
- **Required Headers**: Authorization: Bearer <token>, Content-Type: application/json, X-Client-Source: web-client-v1
- **Critical IDs**: controller_id and processor_id MUST be fetched from config API, NOT hardcoded
- **Pre-check Logic**: Show prompt only if user hasn't consented to latest version (GET /consent returns empty or different version_id)
- **Transaction Requirements**: Consent + Categories + Log must all succeed
- **Error Codes to Handle**: not_found, already_exists, permission_denied, deadline_exceeded, resource_exhausted, failed_precondition, unauthenticated, data_loss

### Metis Review

**Identified Gaps** (addressed):
- ✅ User classification logic clarified (based on API /consent response)
- ✅ Category selection granularity decided (all-or-nothing)
- ✅ Transaction failure handling defined (no rollback, error message only)
- ✅ Scope lockdown established (user flow only, no admin features)

**Guardrails Applied**:
- **Scope Lockdown**:
  - Admin consent management is OUT of scope
  - Consent versioning UI is OUT of scope
  - Granular category selection is OUT (use all-or-nothing only)
  - Data deletion on revocation is OUT (backend responsibility)
  - Encryption implementation is OUT (defer to future)
  - Email/SMS notifications are OUT of scope
  - Consent analytics/reporting is OUT of scope

**Technical Guardrails**:
  - DO NOT hardcode controller_id or processor_id - MUST fetch from config APIs
  - DO NOT implement custom transaction logic - rely on API handling
  - DO NOT create new UI components beyond ConsentModal - reuse shadcn/ui
  - DO NOT bypass API client - all calls through src/lib/api/client.ts
  - DO NOT add consent state to localStorage - use existing encrypted sessionStorage pattern
  - DO NOT add new dependencies - use existing tech stack

**Scope Boundaries**:
- INCLUDE: User-facing consent UI (modal/prompt), GRANT flow, REVOKE/UPDATE flow, Consent history display (audit log), React Query hooks, i18n translations, Unit tests, E2E tests
- EXCLUDE: Admin flow, Data controller/processor configuration, Encryption enhancement, Backend OpenAPI schema changes, Transaction rollback logic, Granular category selection, Email notifications, Consent analytics

---

## Work Objectives

### Core Objective
Implement GDPR-compliant user consent flow with consent grant, revoke/update, and audit log display, integrated into homepage with smart tab switching.

### Concrete Deliverables
- ConsentModal component with Form and History tabs
- Pre-check logic (GET /consent-version vs GET /consent comparison)
- GRANT flow (create consent + link all categories + log)
- REVOKE flow (update consent to "revoked" + log)
- UPDATE flow (modify consent selections + log)
- Consent History tab with pagination (GET /consent-log)
- React Query hooks for all consent API calls
- i18n translations (`messages/[locale]/features/consent.json`)
- Unit tests for hooks and logic
- E2E tests for user flows

### Definition of Done
- [ ] All 11 test cases from `docs/consent/user-flow/constrains/test-cases.md` pass
- [ ] Pre-check logic shows prompt only when needed
- [ ] Grant flow succeeds (Consent + Categories + Log)
- [ ] Revoke flow succeeds (PATCH + Log)
- [ ] Update flow succeeds (PATCH + Categories + Log)
- [ ] History tab displays consent logs with pagination
- [ ] Smart tab switching works (Form for new users, History for existing)
- [ ] Error handling covers all documented error codes
- [ ] All API calls go through apiClient with auth token
- [ ] i18n translations work for both EN and VI locales

### Must Have
- User consent status tracked in use-consent-store.ts (encrypted sessionStorage)
- Pre-check logic (GET /consent-version vs GET /consent version comparison)
- GRANT flow: POST /consent → POST /consent-data-category × N → POST /consent-log
- REVOKE flow: PATCH /consent/{id} with action="revoke" → POST /consent-log
- UPDATE flow: PATCH /consent/{id} with action="update" → POST /consent-data-category for changes → POST /consent-log
- Consent history display with pagination (GET /consent-log)
- All-or-nothing category selection (checkbox duy nhất)
- Smart tab switching based on API /consent response
- Error handling for all documented codes

### Must NOT Have (Guardrails)
- NO admin consent management interface
- NO consent versioning UI (only GET /consent-version)
- NO granular category selection (individual checkboxes)
- NO transaction rollback logic (user chose: error message only)
- NO data deletion/anonymization on revocation (backend scope)
- NO encryption implementation (keep TODO placeholder)
- NO custom transaction logic (assume API handles partial failures)
- NO new dependencies beyond existing stack
- NO email/SMS notifications
- NO consent analytics/reporting
- NO new UI components beyond ConsentModal modifications

---

## Verification Strategy

### Test Decision
- **Infrastructure exists**: YES (Vitest + Playwright configured)
- **User wants tests**: YES (TDD + E2E)
- **Framework**: Vitest (unit) + Playwright (E2E)
- **Approach**: TDD for hooks/store, manual QA verification for UI flows

### Unit Tests (Vitest) - TDD Approach

**Test Structure**:
- File location: `src/components/features/consent/__tests__/`
- Test framework: Vitest with @testing-library/react
- Coverage: hooks, store logic, error handling

### E2E Tests (Playwright) - Manual QA Verification

**Verification Tools**:
- Playwright browser automation for UI flows
- Test scenarios from `docs/consent/user-flow/constrains/test-cases.md`:
  - UI-01: New user (no consent) → Show Form tab
  - UI-02: Existing user, latest version → Show History tab
  - UI-03: Existing user, old version → Show Form tab with prompt
  - UI-04: Revoked consent → Show Form tab
  - FN-01: Grant all categories → Success + History update
  - FN-02: Grant partial → Error (not supported)
  - FN-03: Grant spam → Debounce prevents
  - FN-04: Revoke all → Success + History update
  - FN-05: Update categories → Success + History update
  - ERR-01: Network timeout → User-friendly error
  - ERR-02: Token expiry → Redirect to login
  - ERR-03: Wrong user → Error message
  - ERR-04: Missing config IDs → Critical error

**Evidence Required**:
- Screenshots of modal states (open, form tab, history tab, loading, error)
- Terminal output for Playwright tests
- Browser console logs showing API calls
- Response bodies for verification

---

## Task Flow

```
Homepage Load → Pre-check (GET /consent-version + GET /consent) → Smart Tab Decision → ConsentModal
```

**Parallelization**:
- API hooks and i18n setup can be done in parallel
- Component development depends on hooks + translations

## Parallelization

| Group | Tasks | Reason |
|-------|--------|--------|
| A | 1-5 | Independent files (hooks, translations) |
| B | 6-9 | Component development (depends on hooks) |

| Task | Depends On | Reason |
|------|-----------|--------|
| 6 | 1-5 | Requires API hooks and translations |
| 7-9 | 2 | Requires hooks + translations |

---

## TODOs

### Phase 1: Foundation (API Hooks & Translations)

- [x] 1. Create React Query hooks for consent API calls

  **What to do**:
  - Create `src/hooks/consent/use-consent-version.ts` - Hook to fetch latest consent version
  - Create `src/hooks/consent/use-user-consent.ts` - Hook to check user's current consent
  - Create `src/hooks/consent/use-data-categories.ts` - Hook to fetch data categories
  - Create `src/hooks/consent/use-consent-logs.ts` - Hook to fetch consent history with pagination
  - Create `src/hooks/consent/use-config-ids.ts` - Hook to fetch controller_id and processor_id
  - All hooks use TanStack Query (useQuery, useMutation) with proper loading/error states
  - Integrate with apiClient from `src/lib/api/client.ts`

  **Must NOT do**:
  - DO NOT call APIs directly - use apiClient
  - DO NOT hardcode controller_id or processor_id - use use-config-ids hook

  **Parallelizable**: YES (with 2, 3, 4, 5)

  **References** (CRITICAL - Be Exhaustive):

  **Pattern References** (existing code to follow):
  - `src/hooks/auth/` - Check for existing auth hook patterns to get user.id
  - TanStack Query patterns in codebase - Search for useQuery examples
  - API client usage: `src/lib/api/client.ts` - How to use openapi-generated types

  **API/Type References** (contracts to implement against):
  - `src/lib/api/v1/consent.d.ts` - Use types for all requests
  - Key types: ConsentCreateRequest, ConsentUpdateRequest, DataCategoryListResponse, ConsentLogListResponse
  - Endpoint operations: createConsent, updateConsent, searchConsents, searchDataCategories, createConsentDataCategory, searchConsentLogs, createConsentLog, searchDataControllers, searchDataProcessors

  **Store References** (state management):
  - `src/store/use-consent-store.ts` - Use setters: setConsentData, setConsentId, setConsentStatus, setError, clearError
  - Event system: Listen to consent:data-updated, consent:error events in component

  **Test References** (testing patterns to follow):
  - Search for existing Vitest test files in `src/**/__tests__/`
  - Test structure: describe block with it/expect pattern

  **Documentation References** (specs and requirements):
  - `docs/consent/user-flow/constrains/api-payload-guide.md` - Request/response payloads
  - `docs/consent/user-flow/constrains/integrate-spec.md` - Pre-check logic
  - `docs/consent/user-flow/constrains/techical-spec.md` - Controller/processor ID fetching

  **External References** (libraries and frameworks):
  - Official docs: `@tanstack/react-query` - useQuery and useMutation hooks
  - Official docs: `@testing-library/react` - Testing patterns
  - Official docs: `playwright.dev` - E2E testing API

  **WHY Each Reference Matters**:
  - `use-consent-store.ts`: This is the SINGLE SOURCE OF TRUTH for consent state. Don't duplicate logic. Use store setters only.
  - `api/v1/consent.d.ts`: These are TYPE-SAFE API contracts. NEVER hardcode request shapes. Import types and use them.
  - TanStack Query: Provides caching, loading states, error handling. Use it for ALL API calls.
  - Pre-check logic: The documented requirement is CRITICAL. If version mismatch, MUST show prompt. If version matches, MUST NOT show prompt.

  **Acceptance Criteria**:

  **If TDD (tests enabled):**
  - [ ] Test file created: `src/hooks/consent/__tests__/use-consent-version.test.ts`
  - [ ] Test covers: Fetch latest consent version
  - [ ] Test covers: Loading state is set correctly
  - [ ] Test covers: Error handling for failed fetch
  - [ ] `pnpm test:run` → PASS (1 test, 0 failures)

  **Manual Execution Verification (ALWAYS include, even with tests):**

  **For API Hooks**:
  - [ ] Using Vitest:
    - Command: `pnpm test:run src/hooks/consent/__tests__/use-consent-version.test.ts`
    - Expected: PASS (N tests, 0 failures)
  - [ ] Hooks are exported correctly: Check no TypeScript errors

  **Commit**: NO (wait for component development)

- [x] 2. Create i18n translations for consent UI

  **What to do**:
  - Create `messages/en/features/consent.json` with all consent UI strings
  - Create `messages/vi/features/consent.json` with Vietnamese translations
  - Include keys: modal title, form labels, button labels, error messages, tab labels
  - Follow project i18n structure (see `messages/[locale]/features/`)

  **Must NOT do**:
  - DO NOT create new translation keys beyond consent-specific ones
  - DO NOT use hardcoded English text in components

  **Parallelizable**: YES (with 3, 4, 5)

  **References** (CRITICAL - Be Exhaustive):

  **Pattern References** (existing code to follow):
  - Search for existing translation files in `messages/[locale]/features/` - Follow same structure
  - Check project i18n setup - likely using next-intl

  **Documentation References** (specs and requirements):
  - Documentation mentions consent terms in different languages - provide translations

  **WHY Each Reference Matters**:
  - Translation consistency: Following existing structure prevents format errors and missing keys.
  - next-intl integration: Proper JSON structure ensures translations load correctly.

  **Acceptance Criteria**:

  **If TDD (tests enabled):**
  - [ ] Translation files created without syntax errors
  - [ ] JSON validation passes: `pnpm translations:validate`
  - [ ] Both EN and VI files have same keys

  **Manual Execution Verification (ALWAYS include, even with tests):**

  - [ ] Translation file structure verified:
    - Command: `cat messages/en/features/consent.json` (check JSON structure)
    - Expected: Valid JSON with top-level object containing keys
  - [ ] Vietnamese translation completeness check:
    - Command: `pnpm translations:missing` (ensure no missing VI keys)

  **Commit**: NO (wait for component development)

### Phase 2: ConsentModal Component

- [x] 3. Create ConsentModal component structure

  **What to do**:
  - Create `src/components/features/consent/ConsentModal.tsx`
  - Use "use client" directive for interactivity
  - Integrate use-consent-store (subscribe to consent state changes)
  - Use useAuthStore to get user.id
  - Integrate hooks from Phase 1 (use-consent-version, use-user-consent, use-data-categories, use-consent-logs, use-config-ids)
  - Implement 2-tab layout: Tab 1 = ConsentForm, Tab 2 = ConsentHistory
  - Use shadcn/ui Dialog or Modal component for base
  - Implement smart tab switching logic:
    - If GET /consent returns empty → Show ConsentForm tab
    - If GET /consent returns data → Show ConsentHistory tab (default)
  - Add loading states: Spinner during API calls
  - Add error display: Alert component for error messages

  **Must NOT do**:
  - DO NOT create custom modal component - reuse shadcn/ui Dialog
  - DO NOT implement granular category selection (use all-or-nothing checkbox only)
  - DO NOT show admin features (version management, etc.)
  - DO NOT bypass consent store - use setConsentData, setConsentId, setConsentStatus

  **Parallelizable**: NO (depends on hooks and translations)

  **References** (CRITICAL - Be Exhaustive):

  **Pattern References** (existing code to follow):
  - `src/components/ui/` - Check for existing modal/dialog patterns in shadcn/ui
  - Shadcn/ui Dialog usage - Check project for examples of Dialog with tabs
  - Component structure: `"use client"` + hooks pattern

  **Store References** (state management):
  - `src/store/use-consent-store.ts` - setConsentData, setError, clearError
  - Event listeners: Use useEffect to listen to consent:data-updated, consent:error

  **API/Type References** (contracts to implement against):
  - `src/lib/api/v1/consent.d.ts` - Request types for mutations

  **Test References** (testing patterns to follow):
  - Search for component test files in `src/components/**/__tests__/`

  **WHY Each Reference Matters**:
  - Store integration: Direct mutation causes inconsistent state. ALWAYS use store setters.
  - Smart tab switching: This is CRITICAL UX requirement. Use API response to determine default tab.
  - Loading states: User feedback prevents confusion during API calls.

  **Acceptance Criteria**:

  **If TDD (tests enabled):**
  - [ ] Test file created: `src/components/features/consent/__tests__/ConsentModal.test.tsx`
  - [ ] Test covers: Component renders without errors
  - [ ] Test covers: Smart tab switching logic
  - [ ] Test covers: Error state display
  - [ ] `pnpm test:run` → PASS (N tests, 0 failures)

  **Manual Execution Verification (ALWAYS include, even with tests):**

  **For Component Rendering**:
  - [ ] Using Playwright:
    - Navigate to: `http://localhost:3001/en` (or appropriate locale)
    - Action: Load page, check if ConsentModal appears (if pre-check fails)
    - Verify: Modal shows with correct default tab based on consent status
    - Screenshot: Save evidence to `.sisyphus/evidence/3-render-modal.png`
  - [ ] Tab switching test:
    - Action: Click between Form and History tabs
    - Verify: Tab content updates correctly without page reload
    - Screenshot: Save evidence to `.sisyphus/evidence/3-tab-switch.png`

  **Commit**: NO (wait for sub-components)

- [x] 4. Create ConsentForm tab component

  **What to do**:
  - Create `src/components/features/consent/ConsentForm.tsx`
  - Implement all-or-nothing checkbox: Single checkbox "Đồng ý tất cả các categories"
  - Display consent version content from GET /consent-version
  - Show latest version number and effective date
  - Implement "Grant Consent" button (disabled if already consented to latest)
  - Show loading state during GRANT flow
  - Display error messages from store (useConsentError)
  - Handle user ID from useAuthStore for API calls

  **Must NOT do**:
  - DO NOT implement individual category checkboxes (granular selection is OUT of scope)
  - DO NOT allow partial consent (all-or-nothing only)

  **Parallelizable**: NO (depends on ConsentModal parent)

  **References** (CRITICAL - Be Exhaustive):

  **Pattern References** (existing code to follow):
  - Shadcn/ui Checkbox component - Find existing checkbox usage
  - Form component patterns in `src/components/features/` - Check for form validation patterns

  **Store References** (state management):
  - `src/store/use-consent-store.ts` - useIsConsentValid, hasConsent

  **API/Type References** (contracts to implement against):
  - `src/lib/api/v1/consent.d.ts` - ConsentVersion, ConsentCreateRequest

  **Documentation References** (specs and requirements):
  - `docs/consent/user-flow/main.md` - Consent version content display
  - `docs/consent/user-flow/constrains/integrate-spec.md` - GRANT flow steps

  **WHY Each Reference Matters**:
  - All-or-nothing: This is the DECIDED granularity. Do not implement individual checkboxes.
  - Version content: Users need to see what they're consenting to. Display full content.
  - Store validation: Check useIsConsentValid before allowing grant.

  **Acceptance Criteria**:

  **If TDD (tests enabled):**
  - [ ] Test file created: `src/components/features/consent/__tests__/ConsentForm.test.tsx`
  - [ ] Test covers: Checkbox toggle
  - [ ] Test covers: Grant button disabled/enabled logic
  - [ ] Test covers: Consent version content display
  - [ ] `pnpm test:run` → PASS (N tests, 0 failures)

  **Manual Execution Verification (ALWAYS include, even with tests):**

  **For Form Interactions**:
  - [ ] Using Playwright:
    - Action: Navigate to modal, click Form tab
    - Verify: Consent version content is displayed
    - Verify: Checkbox shows current state (checked/unchecked)
    - Action: Click checkbox to toggle, verify state updates
    - Screenshot: Save evidence to `.sisyphus/evidence/4-checkbox-toggle.png`
  - [ ] Grant consent test:
    - Action: Click "Grant Consent" button
    - Verify: Loading spinner appears
    - Verify: API calls made (check console logs)
    - Screenshot: Save evidence to `.sisyphus/evidence/4-grant-success.png`

  **Commit**: NO (wait for History tab)

- [x] 5. Create ConsentHistory tab component

  **What to do**:
  - Create `src/components/features/consent/ConsentHistory.tsx`
  - Use use-consent-logs hook to fetch consent logs
  - Display logs in table or list format
  - Implement pagination (Load More button or infinite scroll)
  - Show log entries with: action (grant/revoke/update), timestamp, action_by
  - Show empty state when no logs exist
  - Handle loading state during fetch

  **Must NOT do**:
  - DO NOT allow log deletion (append-only table)
  - DO NOT add admin features (bulk operations, filtering by other users)

  **Parallelizable**: NO (depends on ConsentModal parent)

  **References** (CRITICAL - Be Exhaustive):

  **Pattern References** (existing code to follow):
  - Data table/list component patterns in `src/components/` - Search for examples of table display
  - Pagination patterns - Check for existing Load More implementations

  **Store References** (state management):
  - Not directly used (logs fetched via API, not stored)

  **API/Type References** (contracts to implement against):
  - `src/lib/api/v1/consent.d.ts` - ConsentLogListResponse with pagination

  **Documentation References** (specs and requirements):
  - `docs/consent/user-flow/constrains/techical-spec.md` - Consent log is append-only, pagination required

  **WHY Each Reference Matters**:
  - Append-only: This is a GDPR requirement. Never allow deletion.
  - Pagination: Logs can grow large. Implement client-side pagination if API doesn't support it.

  **Acceptance Criteria**:

  **If TDD (tests enabled):**
  - [ ] Test file created: `src/components/features/consent/__tests__/ConsentHistory.test.tsx`
  - [ ] Test covers: Logs display
  - [ ] Test covers: Pagination (Load More button)
  - [ ] Test covers: Empty state
  - [ ] `pnpm test:run` → PASS (N tests, 0 failures)

  **Manual Execution Verification (ALWAYS include, even with tests):**

  **For History Display**:
  - [ ] Using Playwright:
    - Action: Click History tab
    - Verify: Logs are displayed (if any exist)
    - Verify: Log entries show action, timestamp, action_by
    - Action: Click Load More (or scroll to bottom)
    - Verify: More logs load correctly
    - Screenshot: Save evidence to `.sisyphus/evidence/5-history-pagination.png`

  **Commit**: YES (with 3, 4, 5)

  - Message: `feat(consent): create ConsentModal component with Form and History tabs`
  - Files: `src/components/features/consent/ConsentModal.tsx`, `ConsentForm.tsx`, `ConsentHistory.tsx`
  - Pre-commit: `pnpm lint` and `pnpm type-check`

### Phase 3: Homepage Integration

- [x] 6. Integrate ConsentModal into homepage

  **What to do**:
  - Modify `src/app/[locale]/page.tsx` to include ConsentModal
  - Implement pre-check logic on page load:
    - Call use-consent-version hook to fetch latest version
    - Call use-user-consent hook to check user's current consent
    - Compare version_id: If mismatch or no consent exists, show modal
  - Auto-show modal when pre-check fails
  - Hide modal after consent is granted/updated
  - Handle consent store events (consent:data-updated, consent:error)

  **Must NOT do**:
  - DO NOT show modal if user already consented to latest version
  - DO NOT show modal on other routes (only homepage)
  - DO NOT implement custom consent prompt logic beyond documented pre-check

  **Parallelizable**: NO (depends on ConsentModal component)

  **References** (CRITICAL - Be Exhaustive):

  **Pattern References** (existing code to follow):
  - Existing homepage structure - Check current page.tsx implementation
  - Modal integration patterns - Search for other modal/dialog integrations in codebase

  **Store References** (state management):
  - `src/store/use-consent-store.ts` - Event-driven updates via custom events

  **API/Type References** (contracts to implement against):
  - `src/lib/api/v1/consent.d.ts` - ConsentVersion, Consent

  **Documentation References** (specs and requirements):
  - `docs/consent/user-flow/constrains/integrate-spec.md` - Pre-check logic: show prompt only if version mismatch

  **WHY Each Reference Matters**:
  - Pre-check: This is REQUIRED. If version matches, don't show modal. If mismatched, MUST show.
  - Event-driven: Store dispatches events. Use useEffect to listen and show/hide modal.

  **Acceptance Criteria**:

  **If TDD (tests enabled):**
  - [ ] Test file created: `src/app/[locale]/__tests__/page.test.tsx`
  - [ ] Test covers: Pre-check logic (version comparison)
  - [ ] Test covers: Modal shows when needed, hides when not needed
  - [ ] Test covers: Store event handling
  - [ ] `pnpm test:run` → PASS (N tests, 0 failures)

  **Manual Execution Verification (ALWAYS include, even with tests):**

  **For Homepage Integration**:
  - [ ] Using Playwright:
    - Navigate to: `http://localhost:3001/en` (or appropriate locale)
    - Action: Load page with new user (no consent)
    - Verify: ConsentModal appears automatically (pre-check: no consent)
    - Verify: Form tab is default for new user
    - Screenshot: Save evidence to `.sisyphus/evidence/6-new-user-modal.png`
  - [ ] Test with existing user:
    - Action: Load page with user having consent to latest version
    - Verify: ConsentModal does NOT appear (pre-check: version matches)
    - Verify: User can access application normally
    - Screenshot: Save evidence to `.sisyphus/evidence/7-existing-user-no-modal.png`
  - [ ] Test version mismatch:
    - Action: Simulate backend changing version (clear consent store)
    - Verify: Modal appears with prompt to update
    - Screenshot: Save evidence to `.sisyphus/evidence/8-version-mismatch.png`

  **Commit**: YES (with 6)

  - Message: `feat(consent): integrate ConsentModal into homepage with pre-check logic`
  - Files: `src/app/[locale]/page.tsx`
  - Pre-commit: `pnpm lint` and `pnpm type-check`

---

## Commit Strategy

| After Task | Message | Files | Verification |
|------------|---------|-------|--------------|
| 1-2 | feat(consent): add React Query hooks for consent APIs | hooks/*.ts | pnpm test:run |
| 3 | feat(consent): add i18n translations | messages/*/*.json | pnpm translations:validate |
| 4-5 | feat(consent): create ConsentModal component with Form & History tabs | components/features/consent/*.tsx | pnpm test:run |
| 6 | feat(consent): integrate ConsentModal into homepage | src/app/[locale]/page.tsx | pnpm test:e2e |

---

## Success Criteria

### Verification Commands
```bash
# Type check
pnpm type-check

# Lint check
pnpm lint

# Unit tests
pnpm test:run

# E2E tests
pnpm test:e2e

# Translation validation
pnpm translations:validate

# Translation completeness
pnpm translations:missing
```

### Final Checklist
- [ ] All 11 test cases from documentation pass
- [ ] Pre-check logic: Modal shows only when version mismatch
- [ ] GRANT flow: Consent + all categories + Log created
- [ ] REVOKE flow: Consent updated to "revoked" + Log created
- [ ] UPDATE flow: Consent updated + categories modified + Log created
- [ ] History tab: Displays logs with pagination
- [ ] Smart tab switching: Correct default tab based on user status
- [ ] Error handling: All documented codes covered
- [ ] All API calls: Through apiClient with auth token
- [ ] i18n translations: EN and VI complete
- [ ] No guardrails violated (admin features, granular selection, rollback logic)
- [ ] All tests pass: Unit + E2E
