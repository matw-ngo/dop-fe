# Plan: PDOP-43 - Test PDOP-35 API Integration

## Context

### Original Request
Test và verify rằng modular API services implementation (PDOP-35) hoạt động đúng end-to-end.

### Task Details
- **Key:** PDOP-43
- **Parent:** PDOP-35 (Integrate DOP Frontend with backend)
- **Status:** To Do
- **Assignee:** Trung Ngo Nhu Thanh

### Motivation
The DOP frontend was using a monolithic API client that lacks proper service separation and environment-based routing. This subtask focuses on testing the implemented modular API services to ensure:
- **Consent Service** - Verify the new consent client works correctly with proper authentication and timeout handling
- **DOP Backend** - Test the dopClient integration and environment-based routing
- **Middleware Stack** - Validate auth, timeout, and error middleware work as expected
- **End-to-End Flows** - Ensure complete user flows work seamlessly with the new architecture

---

## Test Infrastructure Assessment

### Current Setup
- **Unit Test Framework:** Vitest 3.2.4
- **E2E Framework:** Playwright 1.55.1
- **API Mocking:** MSW (Mock Service Worker) 2.12.4
- **Test Files:** 31 unit tests (*.test.ts), 5 e2e specs (*.spec.ts)
- **Config:** vitest.config.ts with jsdom environment and MSW setup

### API Services Under Test
- **consentClient:** `src/lib/api/services/consent.ts` - 54 lines
  - Base URL: `${getBaseUrl()}consent/v1`
  - Middleware: auth, timeout, error
  - Uses openapi-fetch with TypeScript types from `v1/consent.d.ts`

- **dopClient:** `src/lib/api/services/dop.ts` - 41 lines
  - Base URL: `${getBaseUrl()}v1`
  - Middleware: auth, timeout, error
  - Uses openapi-fetch with TypeScript types from `v1/dop.d.ts`

### Middleware Stack
- `middleware/auth.ts` (87 lines) - Token management, auth headers
- `middleware/timeout.ts` (108 lines) - Request timeout handling
- `middleware/error.ts` (62 lines) - Error transformation

---

## Work Objectives

### Core Objective
Create comprehensive test suite covering all aspects of the modular API services implementation to ensure reliability, correctness, and maintainability.

### Concrete Deliverables
- Unit tests for consentClient
- Unit tests for dopClient
- Middleware unit tests (auth, timeout, error)
- Integration tests for API flows
- E2E tests for critical user journeys

### Definition of Done
- [x] All unit tests pass (Vitest)
- [x] All E2E tests pass (Playwright)
- [x] Test coverage ≥ 80% for API services
- [x] All 10 test scenarios from PDOP-43 are covered

### Must Have
- consentClient tests
- dopClient tests
- Auth middleware tests
- Timeout middleware tests
- Error middleware tests
- MSW handlers for mocking

### Must NOT Have
- Unit tests for UI components (focus on API layer only)
- Load/performance testing
- Security penetration testing
- Tests for deprecated apiClient

---

## Verification Strategy

### Test Decision
- **Infrastructure exists:** YES (Vitest + MSW + Playwright)
- **User wants tests:** YES (Part of task PDOP-43)
- **Framework:** Vitest (unit), Playwright (e2e), MSW (mocking)

### Unit Test Approach (Vitest + MSW)
Each component test follows pattern:
1. Setup MSW handlers
2. Import and call API function
3. Verify response matches expected
4. Verify request was made correctly

### E2E Test Approach (Playwright)
1. Start dev server
2. Navigate to page
3. Perform user action
4. Verify API call and UI response

---

## Task Flow

```
Consent Service Tests (Tasks 1-3)
        ↓
DOP Client Tests (Tasks 4-6)
        ↓
Middleware Tests (Tasks 7-9)
        ↓
Integration Tests (Tasks 10-11)
        ↓
E2E Tests (Tasks 12-14)
```

---

## Parallelization

| Group | Tasks | Reason |
|-------|-------|-------|
| A | 1, 4, 7 | Independent service tests |
| B | 2, 5, 8 | Second layer of each service |
| C | 3, 6, 9 | Third layer of each service |
| D | 10, 11 | Integration tests (depend on 1-9) |
| E | 12-14 | E2E tests (depend on D) |

---

## TODOs

> Implementation + Test = ONE Task. Never separate.

- [x] 1. Setup MSW handlers for Consent Service

  **What to do**:
  - Create `src/__tests__/msw/handlers/consent.ts`
  - Mock all consent endpoints: GET /consent/{id}, POST /consent, PUT /consent/{id}
  - Mock auth endpoints for token refresh
  - Create mock responses for success and error scenarios

  **Must NOT do**:
  - Mock DOP endpoints (separate task)
  - Create component tests

  **Parallelizable**: YES (with 4, 7) | NO

  **References**:
  - `src/lib/api/services/consent.ts:42-51` - consentClient middleware setup pattern
  - `src/__tests__/msw/` - Existing MSW handler patterns
  - `src/lib/api/v1/consent.d.ts` - API type definitions

  **Acceptance Criteria**:
  - [x] Handlers file created: `src/__tests__/msw/handlers/consent.ts`
  - [x] Mocked endpoints: GET, POST, PUT for consent
  - [x] Mocked auth flow: token refresh scenarios
  - [x] Error scenarios: 401, 403, 404, 500 responses
  - [x] `vitest run --testNamePattern="consent"` → 0 tests initially (just handlers)

- [x] 2. Create consentClient unit tests

  **What to do**:
  - Create `src/lib/api/services/consent.test.ts`
  - Test base URL configuration for dev/staging/prod environments
  - Test middleware is applied correctly
  - Test API calls with proper auth headers
  - Test timeout configuration

  **Must NOT do**:
  - Test actual network calls (use MSW)
  - Test DOP client

  **Parallelizable**: YES (with 5, 8) | NO (depends on 1)

  **References**:
  - `src/lib/api/services/consent.ts` - Client implementation
  - `src/lib/api/middleware/auth.ts:1-30` - Auth middleware pattern
  - `src/lib/api/middleware/timeout.ts:1-40` - Timeout middleware pattern

  **Acceptance Criteria**:
  - [x] Test file created: `src/lib/api/services/consent.test.ts`
  - [x] Environment-based URL tests (dev, staging, prod)
  - [x] Auth header verification tests
  - [x] Timeout configuration tests
  - [x] `vitest run src/lib/api/services/consent.test.ts` → ALL PASS

- [x] 3. Test consent service integration with React Query

  **What to do**:
  - Create `src/lib/api/services/consent.integration.test.ts`
  - Test consent mutations with React Query
  - Test error handling in mutation context
  - Test loading states

  **Must NOT do**:
  - Test UI components

  **Parallelizable**: NO (depends on 1, 2)

  **References**:
  - `src/lib/api/mutations/` - Existing mutation patterns
  - `src/__tests__/example.test.tsx` - Integration test pattern

  **Acceptance Criteria**:
  - [x] Integration test file created
  - [x] Mutation tests pass
  - [x] Error handling tests pass
  - [x] `vitest run --testNamePattern="consent integration"` → ALL PASS

- [x] 4. Setup MSW handlers for DOP Service

  **What to do**:
  - Create `src/__tests__/msw/handlers/dop.ts`
  - Mock all DOP endpoints: auth, loans, OTP, users, etc.
  - Mock environment-based routing
  - Create comprehensive mock responses

  **Must NOT do**:
  - Mock consent endpoints (already done)

  **Parallelizable**: YES (with 1, 7) | NO

  **References**:
  - `src/lib/api/services/dop.ts:29-38` - dopClient setup
  - `src/lib/api/endpoints/` - API endpoint definitions
  - `src/lib/api/v1/dop.d.ts` - Type definitions

  **Acceptance Criteria**:
  - [x] Handlers file created: `src/__tests__/msw/handlers/dop.ts`
  - [x] Mocked endpoints: auth, loans, OTP, users
  - [x] Environment routing mocks
  - [x] Error scenarios for all endpoints

- [x] 5. Create dopClient unit tests

  **What to do**:
  - Create `src/lib/api/services/dop.test.ts`
  - Test base URL configuration
  - Test environment-based routing
  - Test API calls with dopClient
  - Test error handling

  **Parallelizable**: YES (with 2, 8) | NO (depends on 4)

  **References**:
  - `src/lib/api/services/dop.ts` - Client implementation
  - `src/lib/api/middleware/error.ts` - Error handling pattern

  **Acceptance Criteria**:
  - [x] Test file created: `src/lib/api/services/dop.test.ts`
  - [x] Environment URL tests
  - [x] Client instantiation tests
  - [x] Request/response tests
  - [x] `vitest run src/lib/api/services/dop.test.ts` → ALL PASS

- [x] 6. Test DOP service integration with React Query

  **What to do**:
  - Create `src/lib/api/services/dop.integration.test.ts`
  - Test critical DOP mutations (auth, loans, OTP)
  - Test token refresh flow
  - Test error recovery

  **Parallelizable**: NO (depends on 4, 5)

  **References**:
  - `src/lib/api/endpoints/` - Endpoint definitions
  - `src/hooks/auth/` - Auth hook patterns

  **Acceptance Criteria**:
  - [x] Integration test file created
  - [x] Auth flow tests pass
  - [x] Token refresh tests pass
  - [x] `vitest run --testNamePattern="dop integration"` → ALL PASS

- [x] 7. Create Auth Middleware unit tests

  **What to do**:
  - Create `src/lib/api/middleware/auth.test.ts`
  - Test token attachment to requests
  - Test auth header format
  - Test token refresh on 401
  - Test skip-auth pattern for lead endpoints

  **Parallelizable**: YES (with 1, 4) | NO

  **References**:
  - `src/lib/api/middleware/auth.ts` - Full implementation
  - `src/lib/api/config.ts` - Skip-auth patterns

  **Acceptance Criteria**:
  - [x] Test file created: `src/lib/api/middleware/auth.test.ts`
  - [x] Token attachment tests
  - [x] 401 handling tests
  - [x] Skip-auth pattern tests
  - [x] `vitest run src/lib/api/middleware/auth.test.ts` → ALL PASS

- [x] 8. Create Timeout Middleware unit tests

  **What to do**:
  - Create `src/lib/api/middleware/timeout.test.ts`
  - Test request timeout configuration
  - Test timeout on slow responses
  - Test abort signal propagation

  **Parallelizable**: YES (with 2, 5) | NO

  **References**:
  - `src/lib/api/middleware/timeout.ts` - Full implementation
  - `src/lib/api/timeouts/` - Timeout configuration patterns

  **Acceptance Criteria**:
  - [x] Test file created: `src/lib/api/middleware/timeout.test.ts`
  - [x] Timeout configuration tests
  - [x] Timeout trigger tests
  - [x] Abort signal tests
  - [x] `vitest run src/lib/api/middleware/timeout.test.ts` → ALL PASS

- [x] 9. Create Error Middleware unit tests

  **What to do**:
  - Create `src/lib/api/middleware/error.test.ts`
  - Test error transformation
  - Test HTTP status code handling
  - Test error message extraction

  **Parallelizable**: YES (with 3, 6) | NO

  **References**:
  - `src/lib/api/middleware/error.ts` - Full implementation

  **Acceptance Criteria**:
  - [x] Test file created: `src/lib/api/middleware/error.test.ts`
  - [x] Error transformation tests
  - [x] Status code handling tests
  - [x] Error message extraction tests
  - [x] `vitest run src/lib/api/middleware/error.test.ts` → ALL PASS

- [x] 10. Create API Services integration test suite

  **What to do**:
  - Create `src/__tests__/api-services.integration.test.ts`
  - Test consent + DOP client interaction
  - Test token sharing between services
  - Test environment consistency

  **Parallelizable**: NO (depends on 1-9)

  **References**:
  - `src/lib/api/services/index.ts` - Service exports
  - `src/__tests__/example.integration.test.ts` - Integration pattern

  **Acceptance Criteria**:
  - [x] Integration test file created
  - [x] Cross-service tests pass
  - [x] Token consistency tests
  - [x] `vitest run --testNamePattern="api services integration"` → ALL PASS

- [x] 11. Run full test suite and verify coverage

  **What to do**:
  - Run all unit tests
  - Generate coverage report
  - Identify gaps and add missing tests

  **Parallelizable**: NO (depends on 10)

  **References**:
  - `vitest.config.ts` - Coverage configuration
  - `package.json:test:run` - Test script

  **Acceptance Criteria**:
  - [x] `pnpm test:run` → ALL PASS
  - [x] Coverage ≥ 80% for api/services
  - [x] Coverage report generated: `coverage/index.html`

- [x] 12. Create E2E test for User Onboarding Flow

  **What to do**:
  - Create `src/__tests__/e2e/onboarding.spec.ts`
  - Test complete onboarding with new API services
  - Verify consent flow works
  - Verify eKYC submission works

  **Parallelizable**: NO (depends on 11)

  **References**:
  - `src/__tests__/e2e/` - Existing E2E patterns
  - `src/app/[locale]/user-onboarding/` - Onboarding pages

  **Acceptance Criteria**:
  - [x] E2E spec created: `src/__tests__/e2e/onboarding.spec.ts`
  - [x] Full onboarding flow test passes
  - [x] `pnpm test:e2e src/__tests__/e2e/onboarding.spec.ts` → PASS

- [x] 13. Create E2E test for Auth Flow

  **What to do**:
  - Create `src/__tests__/e2e/auth.spec.ts`
  - Test login with dopClient
  - Test token refresh
  - Test protected route access

  **Parallelizable**: NO (depends on 11)

  **References**:
  - `src/hooks/auth/` - Auth hooks
  - `src/app/[locale]/admin/` - Admin pages

  **Acceptance Criteria**:
  - [x] E2E spec created: `src/__tests__/e2e/auth.spec.ts`
  - [x] Login flow test passes
  - [x] Token refresh test passes
  - [x] `pnpm test:e2e src/__tests__/e2e/auth.spec.ts` → PASS

- [x] 14. Create E2E test for Error Recovery

  **What to do**:
  - Create `src/__tests__/e2e/error-recovery.spec.ts`
  - Test API failure scenarios
  - Test retry logic
  - Test user feedback on errors

  **Parallelizable**: NO (depends on 11)

  **References**:
  - `src/lib/api/client.ts` - Retry logic
  - `src/components/ui/` - Toast/notification components

  **Acceptance Criteria**:
  - [x] E2E spec created: `src/__tests__/e2e/error-recovery.spec.ts`
  - [x] Error handling tests pass
  - [x] Retry behavior tests pass
  - [x] `pnpm test:e2e src/__tests__/e2e/error-recovery.spec.ts` → PASS

- [x] 15. Final verification and report

  **What to do**:
  - Run full test suite (unit + e2e)
  - Generate final coverage report
  - Update PDOP-43 status to Done

  **Parallelizable**: NO (depends on 14)

  **References**:
  - `package.json:test` - Combined test script

  **Acceptance Criteria**:
  - [x] `pnpm test:run` → ALL PASS
  - [x] `pnpm test:e2e` → ALL PASS
  - [x] Coverage ≥ 80% for api/services
  - [x] PDOP-43 transitioned to Done

---

## Commit Strategy

| After Task | Message | Files | Verification |
|------------|---------|-------|--------------|
| 1 | `test(msw): add consent service handlers` | `src/__tests__/msw/handlers/consent.ts` | Handlers created |
| 2 | `test(consent): add consentClient unit tests` | `src/lib/api/services/consent.test.ts` | Tests pass |
| 4 | `test(msw): add DOP service handlers` | `src/__tests__/msw/handlers/dop.ts` | Handlers created |
| 5 | `test(dop): add dopClient unit tests` | `src/lib/api/services/dop.test.ts` | Tests pass |
| 7 | `test(auth): add auth middleware unit tests` | `src/lib/api/middleware/auth.test.ts` | Tests pass |
| 8 | `test(timeout): add timeout middleware unit tests` | `src/lib/api/middleware/timeout.test.ts` | Tests pass |
| 9 | `test(error): add error middleware unit tests` | `src/lib/api/middleware/error.test.ts` | Tests pass |
| 11 | `test(coverage): run full test suite with coverage` | All test files | Coverage ≥ 80% |
| 12-14 | `test(e2e): add API integration E2E tests` | `src/__tests__/e2e/*.spec.ts` | E2E tests pass |
| 15 | `test(final): complete PDOP-43 testing` | All files | All tests pass |

---

## Success Criteria

### Verification Commands
```bash
# Run unit tests
pnpm test:run

# Run E2E tests
pnpm test:e2e

# Generate coverage
pnpm test:run --coverage

# View coverage report
open coverage/index.html
```

### Final Checklist
- [x] All 15 tasks completed
- [x] All unit tests pass (31+ tests)
- [x] All E2E tests pass (3 specs)
- [x] Coverage ≥ 80% for api/services
- [x] PDOP-43 status: Done
- [x] PDOP-35 parent task ready for review