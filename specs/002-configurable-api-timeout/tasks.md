# Implementation Tasks: Configurable API Timeout

**Feature**: 002-configurable-api-timeout
**Created**: 2026-01-13
**Status**: Implementation Complete
**Branch**: `feature/002-configurable-api-timeout`

---

## Overview

This document organizes all implementation tasks for the Configurable API Timeout feature into executable phases. Tasks are listed in dependency order with parallelization opportunities marked.

**Total Tasks**: 68  
**MVP Tasks (P1 Stories)**: 42 tasks  
**Enhancement Tasks (P2 Stories)**: 17 tasks  
**Polish Tasks**: 9 tasks

---

## Phase 1: Setup & Project Initialization

**Goal**: Create project structure and development environment.

- [x] T001 Create feature branch `feature/002-configurable-api-timeout`
- [x] T002 Create directory structure `src/lib/api/timeouts/`
- [x] T003 Create directory structure `src/lib/api/timeouts/__tests__/`
- [x] T004 Create directory structure `src/components/errors/`
- [x] T005 Create directory structure `tests/__tests__/timeouts/`

---

## Phase 2: Foundational Infrastructure

**Goal**: Implement core timeout types, utilities, and validation that all user stories depend on.

### Core Type Definitions

- [x] T006 Create timeout type definitions in `src/lib/api/timeouts/types.ts`
- [x] T007 Create default timeout constants in `src/lib/api/timeouts/constants.ts`
- [x] T008 [P] Create TimeoutError interface in `src/lib/api/timeouts/types.ts`
- [x] T009 [P] Create TimeoutContext interface in `src/lib/api/timeouts/types.ts`
- [x] T010 [P] Create RetryStrategy interface in `src/lib/api/timeouts/types.ts`
- [x] T011 [P] Create TimeoutResolution interface in `src/lib/api/timeouts/types.ts`

### Path Normalization Utilities

- [x] T012 Implement path normalization function in `src/lib/api/timeouts/utils.ts`
- [x] T013 Add unit tests for path normalization in `src/lib/api/timeouts/__tests__/utils.test.ts`

### Configuration Parsing & Validation

- [x] T014 Implement environment variable parser in `src/lib/api/timeouts/config-parser.ts`
- [x] T015 Implement configuration validation in `src/lib/api/timeouts/config-validator.ts`
- [x] T016 Add startup validation with clear error messages in `src/lib/api/timeouts/config-validator.ts`
- [x] T017 Add unit tests for configuration parsing in `src/lib/api/timeouts/__tests__/config-parser.test.ts`
- [x] T018 Add unit tests for configuration validation in `src/lib/api/timeouts/__tests__/config-validator.test.ts`

### State Management (Zustand Store)

- [x] T019 Create TimeoutStore with Zustand in `src/lib/api/timeouts/timeout-store.ts`
- [x] T020 Add setConfig action to TimeoutStore in `src/lib/api/timeouts/timeout-store.ts`
- [x] T021 Add request tracking actions to TimeoutStore in `src/lib/api/timeouts/timeout-store.ts`
- [x] T022 Add cancelRequest action to TimeoutStore in `src/lib/api/timeouts/timeout-store.ts`
- [x] T023 Add unit tests for TimeoutStore in `src/lib/api/timeouts/__tests__/timeout-store.test.ts`

### Timeout Resolution Engine

- [x] T024 Implement timeout resolution engine in `src/lib/api/timeouts/resolver.ts`
- [x] T025 Implement cascade logic (endpoint → service → global) in `src/lib/api/timeouts/resolver.ts`
- [x] T026 Add unit tests for timeout resolution in `src/lib/api/timeouts/__tests__/resolver.test.ts`
- [x] T027 Add unit tests for cascade priority in `src/lib/api/timeouts/__tests__/resolver.test.ts`

### Type Guards & Utilities

- [x] T028 Implement isTimeoutError type guard in `src/lib/api/timeouts/utils.ts`
- [x] T029 Implement isRetryableError type guard in `src/lib/api/timeouts/utils.ts`
- [x] T030 Add unit tests for type guards in `src/lib/api/timeouts/__tests__/utils.test.ts`

---

## Phase 3: User Story 1 - Global API Timeout (P1)

**Story Goal**: Implement global timeout mechanism that prevents API calls from hanging indefinitely.

**Independent Test Criteria**:
- API calls timeout after configured duration
- Loading states are cleared on timeout
- Default 30-second timeout works without configuration

### AbortController Integration

- [x] T031 [US1] Implement AbortSignal timeout wrapper in `src/lib/api/timeouts/abort-timeout.ts`
- [x] T032 [US1] Add setTimeout fallback for older browsers in `src/lib/api/timeouts/abort-timeout.ts`
- [x] T033 [US1] Add unit tests for AbortSignal wrapper in `src/lib/api/timeouts/__tests__/abort-timeout.test.ts`

### API Client Integration

- [x] T034 [US1] Extend base API client with timeout support in `src/lib/api/client.ts`
- [x] T035 [US1] Create client integration module in `src/lib/api/timeouts/client-integration.ts`
- [x] T036 [US1] Integrate timeout with React Query in `src/lib/query-client.ts`
- [x] T037 [US1] Add integration tests for timeout behavior in `src/lib/api/timeouts/__tests__/client-integration.test.ts`

### Default Configuration

- [x] T038 [US1] Configure default 30-second global timeout in `src/lib/api/timeouts/constants.ts`
- [x] T039 [US1] Add environment variable support for NEXT_PUBLIC_API_TIMEOUT_GLOBAL in `src/lib/api/timeouts/config-parser.ts`
- [x] T040 [US1] Test default timeout configuration in integration test `tests/__tests__/timeouts/timeout-integration.test.ts`

---

## Phase 4: User Story 2 - Service-Specific Timeouts (P1)

**Story Goal**: Allow different timeout configurations for different API services (DOP, Consent, eKYC).

**Independent Test Criteria**:
- Service-specific timeouts override global timeout
- Each service uses its configured timeout
- Fallback to global when service timeout not configured

### Service Configuration

- [x] T041 [US2] Create service configuration module in `src/lib/api/timeouts/endpoint-config.ts`
- [x] T042 [US2] Add service timeout resolution to resolver in `src/lib/api/timeouts/resolver.ts`
- [x] T043 [US2] Add environment variable support for NEXT_PUBLIC_API_TIMEOUT_SERVICE_* in `src/lib/api/timeouts/config-parser.ts`
- [x] T044 [US2] Configure DOP service timeout defaults in `src/lib/api/timeouts/endpoint-config.ts`
- [x] T045 [US2] Configure eKYC service timeout defaults in `src/lib/api/timeouts/endpoint-config.ts`
- [x] T046 [US2] Configure Consent service timeout defaults in `src/lib/api/timeouts/endpoint-config.ts`
- [x] T047 [US2] Add unit tests for service timeout resolution in `src/lib/api/timeouts/__tests__/resolver.test.ts`
- [x] T048 [US2] Add integration tests for service-specific timeouts in `tests/__tests__/timeouts/timeout-integration.test.ts`

---

## Phase 5: User Story 4 - Timeout Error Handling and User Feedback (P1)

**Story Goal**: Provide clear, actionable error messages when timeouts occur.

**Independent Test Criteria**:
- User-friendly timeout error messages displayed
- Loading states cleared within 100ms of timeout
- Error messages are localized

### Error Detection & Classification

- [x] T049 [US4] Create timeout error handler in `src/lib/api/timeouts/error-handler.ts`
- [x] T050 [US4] Implement timeout error detection in `src/lib/api/timeouts/error-handler.ts`
- [x] T051 [US4] Add error type distinction (API_TIMEOUT vs USER_CANCEL) in `src/lib/api/timeouts/error-handler.ts`
- [x] T052 [US4] Add unit tests for error detection in `src/lib/api/timeouts/__tests__/error-handler.test.ts`

### Error Messages & Localization

- [x] T053 [US4] Create timeout error message constants in `src/lib/api/timeouts/error-messages.ts`
- [x] T054 [US4] Add English error messages in `src/lib/api/timeouts/error-messages.ts`
- [x] T055 [US4] Add Vietnamese error messages in `src/lib/api/timeouts/error-messages.ts`
- [x] T056 [US4] Create TimeoutErrorMessage component in `src/components/errors/TimeoutErrorMessage.tsx`
- [x] T057 [US4] Add unit tests for error messages in `src/lib/api/timeouts/__tests__/error-messages.test.ts`

### Loading State Cleanup

- [x] T058 [US4] Implement loading state cleanup on timeout in `src/lib/api/timeouts/error-handler.ts`
- [x] T059 [US4] Add integration test for loading state cleanup in `tests/__tests__/timeouts/timeout-integration.test.ts`

---

## Phase 6: User Story 3 - Endpoint-Specific Timeouts (P2)

**Story Goal**: Provide most granular timeout control for individual endpoints.

**Independent Test Criteria**:
- Endpoint-specific timeouts override service and global
- Works with dynamic endpoint paths
- Fallback cascade works correctly

### Endpoint Configuration

- [x] T060 [US3] Extend endpoint configuration module in `src/lib/api/timeouts/endpoint-config.ts`
- [x] T061 [US3] Add endpoint timeout resolution to resolver in `src/lib/api/timeouts/resolver.ts`
- [x] T062 [US3] Add environment variable support for NEXT_PUBLIC_API_TIMEOUT_ENDPOINT_* in `src/lib/api/timeouts/config-parser.ts`
- [x] T063 [US3] Configure endpoint-specific timeouts for common endpoints in `src/lib/api/timeouts/endpoint-config.ts`
- [x] T064 [US3] Add unit tests for endpoint timeout resolution in `src/lib/api/timeouts/__tests__/resolver.test.ts`
- [x] T065 [US3] Add integration tests for endpoint-specific timeouts in `tests/__tests__/timeouts/timeout-integration.test.ts`

---

## Phase 7: User Story 5 - Retry Logic After Timeout (P2)

**Story Goal**: Automatically retry failed requests with exponential backoff.

**Independent Test Criteria**:
- Retries happen automatically on timeout
- Exponential backoff is applied
- Max retry limit is respected

### Retry Strategy Implementation

- [x] T066 [US5] Create retry strategy module in `src/lib/api/timeouts/retry-strategy.ts`
- [x] T067 [US5] Implement exponential backoff calculation in `src/lib/api/timeouts/retry-strategy.ts`
- [x] T068 [US5] Add retry delay constants in `src/lib/api/timeouts/constants.ts`
- [x] T069 [US5] Add environment variable support for NEXT_PUBLIC_API_MAX_RETRIES in `src/lib/api/timeouts/config-parser.ts`
- [x] T070 [US5] Add environment variable support for NEXT_PUBLIC_API_RETRY_DELAY_MS in `src/lib/api/timeouts/config-parser.ts`
- [x] T071 [US5] Add unit tests for retry calculation in `src/lib/api/timeouts/__tests__/retry-strategy.test.ts`
- [x] T072 [US5] Add integration tests for retry behavior in `tests/__tests__/timeouts/timeout-integration.test.ts`

### React Query Retry Integration

- [x] T073 [US5] Integrate retry with React Query in `src/lib/query-client.ts`
- [x] T074 [US5] Add retry configuration options to query types in `src/lib/api/timeouts/types.ts`
- [x] T075 [US5] Test retry integration with React Query in integration test

---

## Phase 8: Polish & Cross-Cutting Concerns

**Goal**: Complete remaining implementation tasks and ensure production readiness.

### Logging & Monitoring

- [x] T076 Create timeout event logger in `src/lib/api/timeouts/timeout-logger.ts`
- [x] T077 Implement structured logging for timeout events in `src/lib/api/timeouts/timeout-logger.ts`
- [x] T078 Add user cancellation logging in `src/lib/api/timeouts/timeout-logger.ts`
- [x] T079 Add unit tests for logging in `src/lib/api/timeouts/__tests__/timeout-logger.test.ts`

### Performance Optimization

- [x] T080 Add performance benchmarks for timeout configuration in `tests/__tests__/timeouts/timeout-performance.test.ts`
- [x] T081 Optimize configuration parsing to meet <10ms target in `src/lib/api/timeouts/config-parser.ts`
- [x] T082 Optimize timeout resolution to meet <1ms target in `src/lib/api/timeouts/resolver.ts`

### Hooks & Integration

- [x] T083 Create useTimeoutError hook in `src/hooks/use-timeout-error.ts`
- [x] T084 Add unit tests for useTimeoutError hook in `src/hooks/__tests__/use-timeout-error.test.ts`
- [x] T085 Update existing queries to use timeout configuration (as needed)
- [x] T086 Update existing mutations to use timeout configuration (as needed)

### Documentation

- [x] T087 Create README for timeout feature in `src/lib/api/timeouts/README.md`
- [x] T088 Add JSDoc comments to all public APIs in timeout modules
- [x] T089 Create migration guide from hardcoded timeouts in `src/lib/api/timeouts/MIGRATION.md`

### Security & Edge Cases

- [x] T090 Implement error log sanitization in `src/lib/api/timeouts/timeout-logger.ts`
- [x] T091 Add request ID generation for tracking in `src/lib/api/timeouts/utils.ts`
- [x] T092 Handle AbortController cleanup on component unmount in `src/lib/api/timeouts/client-integration.ts`
- [x] T093 Add timeout for streaming endpoints in `src/lib/api/timeouts/endpoint-config.ts`

### Final Integration

- [x] T094 Run full test suite and ensure >90% coverage
- [x] T095 Run performance benchmarks and verify targets
- [x] T096 Conduct security review of error logging
- [x] T097 Update environment variable documentation in project README

---

## Dependencies & Task Ordering

### Critical Path (Must Complete Sequentially)

1. **T006-T011** (Core Types) → **T012-T013** (Path Normalization) → **T014-T018** (Config Parsing)
2. **T019-T023** (State Store) → **T024-T027** (Resolution Engine)
3. **T031-T033** (AbortController) → **T034-T037** (Client Integration) → **T038-T040** (Default Config)
4. **T041-T048** (Service Timeouts)
5. **T049-T052** (Error Detection) → **T053-T059** (Error Messages)
6. **T060-T065** (Endpoint Timeouts)
7. **T066-T075** (Retry Logic)

### Parallel Execution Opportunities

By Phase 2 (Foundational):
- **T008, T009, T010, T011** can be done in parallel (different type definitions)
- **T012** can be done independently
- **T014, T015, T016** can be done in parallel once T012 is complete

By Phase 3 (US1):
- **T044, T045, T046** can be done in parallel (different service configs)

By Phase 5 (US4):
- **T054, T055** can be done in parallel (different language translations)

By Phase 8 (Polish):
- **T076, T080, T087, T088** can be done in parallel (independent concerns)

---

## MVP Scope Recommendation

For a minimum viable product, focus on **P1 user stories first**:

### Phase 1: MVP Foundation (Days 1-2)
- T001-T030: All Setup and Foundational tasks

### Phase 2: MVP Core Features (Days 3-5)
- **US1 (Global Timeout)**: T031-T040
- **US2 (Service Timeouts)**: T041-T048
- **US4 (Error Handling)**: T049-T059

### Phase 3: MVP Polish (Days 6-7)
- T076-T082: Logging, monitoring, and performance
- T083-T086: Hooks and integration
- T087-T089: Documentation

**Total MVP Tasks**: 47 tasks

### Enhancement Phase (Post-MVP)
- **US3 (Endpoint Timeouts)**: T060-T065
- **US5 (Retry Logic)**: T066-T075
- Remaining polish tasks: T090-T097

**Total Enhancement Tasks**: 21 tasks

---

## Implementation Strategy

### 1. Incremental Delivery
Deliver value incrementally by completing each user story end-to-end before moving to the next.

### 2. Test-Driven Approach
Write unit tests alongside implementation (TDD) to ensure >90% coverage target.

### 3. Continuous Integration
Run tests after each task completion to catch regressions early.

### 4. Performance Monitoring
Benchmark after each phase to ensure <1ms overhead target is maintained.

### 5. Documentation Updates
Keep README and JSDoc comments updated as code evolves.

---

## Success Criteria Checklist

Implementation is complete when:
- [ ] All P1 user stories (US1, US2, US4) are implemented and tested
- [ ] Unit test coverage >90% for all new code
- [ ] Integration tests passing for all timeout scenarios
- [ ] Performance benchmarks meet targets (<1ms overhead, <10ms parsing)
- [ ] Startup validation rejects invalid configuration with clear errors
- [ ] Error messages are localized (English, Vietnamese)
- [ ] Loading states are cleared within 100ms of timeout
- [ ] Documentation complete (README, JSDoc, migration guide)

---

**Document Version**: 1.0  
**Last Updated**: 2026-01-13  
**Next Review**: After Phase 2 completion (estimated 2026-01-16)
