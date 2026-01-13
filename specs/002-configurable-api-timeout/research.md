# Research Document: Configurable API Timeout

**Feature**: 002-configurable-api-timeout  
**Created**: 2026-01-13  
**Status**: Phase 0 Complete - All Decisions Recorded

## Overview

This document captures all technical decisions, rationale, and alternatives considered for implementing configurable API timeouts with environment variable support across global, service, and endpoint levels.

---

## Decision Records

### ADR-001: Timeout Implementation Mechanism

**Status**: Accepted  
**Context**: Need to implement request timeouts that work with the existing `openapi-fetch` client architecture.

**Decision**: Use native `AbortSignal.timeout()` API with `setTimeout()` fallback for older browsers.

**Rationale**:
- `AbortSignal.timeout()` is the modern, standards-based approach (supported in Chrome 103+, Firefox 115+, Safari 16.4+)
- Provides clean integration with existing `AbortController` patterns
- Minimal overhead (~50ms per request as specified in PT-001)
- Works seamlessly with `openapi-fetch` via the `signal` option
- Fallback to `setTimeout()` + `AbortController.abort()` ensures broad browser compatibility

**Alternatives Considered**:
1. **Third-party timeout libraries (e.g., axios-timeout)**: Rejected - adds dependency overhead, not needed with native APIs
2. **Custom wrapper around fetch**: Rejected - duplicates existing `openapi-fetch` functionality
3. **Server-side timeout only**: Rejected - doesn't address client-side hanging requests

**Impact**: Low risk - native APIs with proven fallback pattern

---

### ADR-002: Configuration Cascade Strategy

**Status**: Accepted  
**Context**: Multiple timeout levels (global, service, endpoint) need clear precedence rules.

**Decision**: Implement endpoint → service → global cascade with hardcoded default fallback.

**Rationale**:
- Most specific configuration wins (endpoint-level)
- Allows progressive configuration (start with global, add service/endpoint as needed)
- Hardcoded default (30s) ensures system works even with no env vars
- Matches industry patterns (e.g., CSS specificity, logging levels)

**Alternatives Considered**:
1. **Global → service → endpoint**: Rejected - less flexible, endpoint would be "most specific" but applied last
2. **Flat configuration with explicit priority**: Rejected - more complex, harder to maintain
3. **First-match wins**: Rejected - unpredictable behavior

**Impact**: Medium - requires careful testing of override logic

---

### ADR-003: Environment Variable Naming Convention

**Status**: Accepted  
**Context**: Need clear, consistent naming for timeout configuration at different scopes.

**Decision**: Use `NEXT_PUBLIC_API_TIMEOUT_<SCOPE>_<TARGET>` pattern with uppercase normalization.

**Rationale**:
- `NEXT_PUBLIC_` prefix required for client-side access in Next.js
- Clear scope separation (GLOBAL, SERVICE, ENDPOINT)
- Uppercase normalization follows Next.js conventions
- Path normalization (slashes to underscores, remove dynamic segments) prevents collisions

**Examples**:
- Global: `NEXT_PUBLIC_API_TIMEOUT_GLOBAL`
- Service: `NEXT_PUBLIC_API_TIMEOUT_SERVICE_EKYC`
- Endpoint: `NEXT_PUBLIC_API_TIMEOUT_ENDPOINT_LEADS_SUBMIT_OTP`

**Alternatives Considered**:
1. **Dot notation (e.g., `api.timeout.service.ekyc`)**: Rejected - not supported in Next.js env vars
2. **Nested JSON structure**: Rejected - harder to override per environment
3. **Separate prefixes per scope**: Rejected - inconsistent with Next.js patterns

**Impact**: Low - established pattern in Next.js ecosystem

---

### ADR-004: Startup Validation Strategy

**Status**: Accepted  
**Context**: Invalid timeout values (negative, zero, non-numeric) must be caught early.

**Decision**: Validate all timeout environment variables at application startup and fail fast with clear error messages.

**Rationale**:
- "Fail fast" principle prevents running with bad configuration
- Clear error messages show exactly which vars are invalid
- Startup validation within 10ms (per PT-002) is easily achievable
- Prevents production incidents from misconfiguration

**Validation Rules**:
- Values must be positive integers
- Values must be parseable as numbers
- Show all invalid values in a single error message

**Alternatives Considered**:
1. **Runtime validation with defaults**: Rejected - silently uses wrong values
2. **Warning only, continue execution**: Rejected - violates fail-fast principle
3. **Lazy validation on first use**: Rejected - too late, errors in production

**Impact**: High - prevents production incidents

---

### ADR-005: Retry Strategy

**Status**: Accepted  
**Context**: Timeout errors may be transient (network issues), requiring automatic retry.

**Decision**: Implement exponential backoff with configurable max retries (default: 3).

**Rationale**:
- Exponential backoff (1s, 2s, 4s) is industry standard
- 3 retries balance resilience vs. user wait time (7s total backoff)
- Configurable via `NEXT_PUBLIC_API_MAX_RETRIES` and `NEXT_PUBLIC_API_RETRY_DELAY_MS`
- Timeout during retry counts against limit (per Q11) prevents infinite loops

**Backoff Calculation**: `delay = initialDelay * 2^attemptNumber`

**Alternatives Considered**:
1. **Fixed delay**: Rejected - less effective for server congestion
2. **Jittered backoff**: Rejected - adds complexity, not needed for client-side
3. **No retry**: Rejected - poor user experience for transient failures

**Impact**: Medium - improves success rate for transient issues

---

### ADR-006: Error Type Distinction

**Status**: Accepted  
**Context**: User cancellation and automatic timeout have different semantics.

**Decision**: Log `USER_CANCEL` and `API_TIMEOUT` as distinct event types with different user messages.

**Rationale**:
- User cancellation = user action, should show "cancelled" message
- Automatic timeout = system issue, should show error message with retry option
- Distinct logging enables accurate monitoring (timeout rate vs. cancel rate)
- Prevents conflating system performance with user behavior

**User Messages**:
- Timeout: "The request took too long to complete. Please try again."
- Cancel: "Request was cancelled."

**Alternatives Considered**:
1. **Same error type for both**: Rejected - loses valuable distinction
2. **No distinction, just generic error**: Rejected - poor monitoring, poor UX
3. **More granular types (network timeout, read timeout, etc.)**: Rejected - over-engineering

**Impact**: Low - straightforward implementation

---

### ADR-007: File Upload Timeout Handling

**Status**: Accepted  
**Context**: File uploads timeout differently and require cleanup.

**Decision**: Use same timeout mechanism but expect longer endpoint-specific timeouts; client notifies server of cancellation/timeout.

**Rationale**:
- Consistent timeout mechanism across all request types
- File upload endpoints configured with longer timeouts (e.g., 120s)
- Server must implement cleanup for partial uploads (architectural decision)
- Client sends cancellation signal to server on abort

**Implementation**:
- Configure longer timeouts for upload endpoints via env vars
- On timeout/cancel, send explicit abort request to server
- Server-side cleanup is out of scope for this feature

**Alternatives Considered**:
1. **Separate timeout mechanism for uploads**: Rejected - inconsistent, complex
2. **No timeout for uploads**: Rejected - can hang indefinitely
3. **Client-only cleanup**: Rejected - doesn't address server-side partial data

**Impact**: Medium - requires coordination with server implementation

---

### ADR-008: Streaming/Long-Polling Timeout Strategy

**Status**: Accepted  
**Context**: Streaming and long-polling endpoints have fundamentally different timeout requirements.

**Decision**: Require explicit longer timeout configuration for streaming endpoints; no default timeout applies if not configured.

**Rationale**:
- 30-second default would break streaming endpoints
- These endpoints have known, long-running characteristics
- Explicit configuration forces developers to consider timeout needs
- If no explicit timeout, use very large value or no timeout

**Configuration Example**:
```env
NEXT_PUBLIC_API_TIMEOUT_ENDPOINT_EKYC_STREAM=300000
```

**Alternatives Considered**:
1. **Apply default timeout to all endpoints**: Rejected - breaks streaming
2. **Detect streaming automatically**: Rejected - unreliable detection
3. **Separate "streaming timeout" config**: Rejected - adds complexity

**Impact**: High - prevents breaking streaming endpoints

---

### ADR-009: React Query Integration

**Status**: Accepted  
**Context**: Application uses React Query for data fetching (per spec assumptions).

**Decision**: Integrate timeout via React Query's `signal` option and custom error handling.

**Rationale**:
- React Query natively supports `AbortSignal` via `signal` option
- Automatic cancellation on component unmount
- Integrates with existing error boundaries and retry logic
- Minimal changes to existing queries/mutations

**Integration Points**:
- Add timeout config to query client setup
- Custom error handler for timeout errors
- Update error display logic to handle timeout type

**Alternatives Considered**:
1. **Custom fetch wrapper**: Rejected - duplicates React Query functionality
2. **Middleware-based timeout**: Rejected - adds unnecessary abstraction
3. **Per-request timeout**: Rejected - inconsistent, hard to maintain

**Impact**: Low - React Query designed for this pattern

---

### ADR-010: Logging and Monitoring Strategy

**Status**: Accepted  
**Context**: Timeout events need monitoring for performance analysis and debugging.

**Decision**: Log timeout events as distinct error type with structured context (endpoint, duration, elapsed, retries, session).

**Rationale**:
- Structured logs enable querying and alerting
- Distinct error type (`API_TIMEOUT`) separates from other API errors
- Session context enables user-level analysis
- Supports success criteria SC-010 (100% timeout capture)

**Log Schema**:
```typescript
{
  type: 'API_TIMEOUT' | 'USER_CANCEL',
  endpoint: string,
  timeoutDuration: number,
  elapsedTime: number,
  retryCount: number,
  sessionId?: string,
  timestamp: ISO8601
}
```

**Alternatives Considered**:
1. **Console.log only**: Rejected - not production-ready
2. **Separate monitoring service**: Rejected - out of scope for this feature
3. **Unstructured logs**: Rejected - hard to query and analyze

**Impact**: Medium - enables production monitoring

---

## Resolved Clarifications

All clarifications from the spec (Q1-Q12) have been incorporated into the decision records above:

| Q | Topic | Decision Record |
|---|-------|-----------------|
| Q1 | Default global timeout | ADR-002 (30 seconds) |
| Q2 | Default retry count | ADR-005 (3 attempts) |
| Q3 | Endpoint env var naming | ADR-003 |
| Q4 | HTTP methods for timeout | All methods (ADR-001) |
| Q5 | File upload timeouts | ADR-007 |
| Q6 | Timeout logging | ADR-010 |
| Q7 | Dev vs prod defaults | ADR-002 (same defaults, overridable) |
| Q8 | Invalid config values | ADR-004 |
| Q9 | User cancellation | ADR-006 |
| Q10 | File upload cleanup | ADR-007 |
| Q11 | Retry timeout counting | ADR-005 |
| Q12 | Streaming endpoints | ADR-008 |

---

## Technical Context Analysis

### Known Implementation Requirements

1. **Browser APIs Required**:
   - `AbortSignal.timeout()` (modern) or `AbortController.abort()` (fallback)
   - `setTimeout()` for backoff delays

2. **Next.js Integration Points**:
   - Environment variable parsing at build/runtime
   - `NEXT_PUBLIC_` prefix for client-side access
   - Client initialization in `src/lib/api/client.ts`

3. **Existing Architecture**:
   - `openapi-fetch` client already in use
   - Existing interceptor system (`apiClient.use()`)
   - React Query for data fetching (assumed)
   - Toast notifications via Sonner (already used)

4. **Performance Constraints**:
   - PT-001: Timeout overhead < 50ms per request
   - PT-002: Config parsing < 10ms at startup
   - PT-003: Retry overhead < 100ms for successful requests

### Unknowns Requiring Resolution

✅ **All unknowns have been resolved** through clarifications Q1-Q12 and the decision records above.

### Remaining Edge Cases

The following edge cases remain for implementation consideration:

1. **Multiple simultaneous requests with different timeouts**: Each request gets its own AbortController
2. **Environment variable changes during runtime**: Not supported (requires restart, per SC-005)
3. **Timeout during component unmount**: React Query handles cancellation automatically

---

## Technology Alignment

This feature aligns with the project's technology stack and constitutional principles:

- **TypeScript 5.3+ strict mode**: All configuration types will be strongly typed
- **Next.js 14+**: Uses `NEXT_PUBLIC_` env var pattern
- **Performance & Reliability**: Prevents hanging requests (Constitution Principle II)
- **User Experience First**: Clear error messages (Constitution Principle I)
- **Code Quality**: Comprehensive testing planned (Constitution Principle IV)

---

## Implementation Complexity Assessment

### Low Complexity Components
- Environment variable parsing
- AbortSignal integration
- Basic timeout logic

### Medium Complexity Components
- Configuration cascade (endpoint → service → global)
- Retry logic with exponential backoff
- Error type distinction (timeout vs cancel)

### High Complexity Components
- Startup validation with clear error messages
- Integration with existing React Query setup
- Comprehensive testing of all timeout levels

---

## Dependencies

### Internal Dependencies
- `src/lib/api/client.ts`: Main API client (requires modification)
- React Query setup: Requires timeout configuration
- Error handling system: Requires timeout error handling
- i18n system: Requires timeout message translations

### External Dependencies
- `openapi-fetch`: Already in use, supports `signal` option
- Browser AbortSignal API: Native, no dependencies
- Sonner (toasts): Already in use for error display

### No New Dependencies Required

All functionality can be implemented using native browser APIs and existing dependencies.

---

## Testing Strategy Preview

### Unit Tests Required
- Configuration parsing and validation
- Timeout cascade logic (endpoint → service → global)
- Retry calculation with exponential backoff
- Error type distinction

### Integration Tests Required
- Timeout with actual API calls (mocked)
- Retry behavior across multiple attempts
- User cancellation vs. automatic timeout
- Configuration loading from environment

### E2E Tests Required
- Timeout error display to users
- Loading state cleanup after timeout
- Retry option presentation
- Configuration changes between environments

---

## Risks and Mitigations

| Risk | Severity | Mitigation |
|------|----------|------------|
| Browser compatibility (AbortSignal.timeout) | Low | Fallback to setTimeout + AbortController |
| Breaking existing API calls | Medium | Comprehensive regression testing |
| Configuration errors in production | High | Startup validation (ADR-004) |
| Performance overhead | Low | Native APIs, minimal overhead |
| User experience degradation | Medium | Clear error messages, retry logic |

---

## Next Steps

1. ✅ **Phase 0 - Research**: Complete (this document)
2. ⏳ **Phase 1 - Design & Contracts**:
   - Generate data model document
   - Create API contracts
   - Write quickstart guide
3. ⏸️ **Phase 2 - Implementation**: Not in scope for planning phase

---

**Document Version**: 1.0  
**Last Updated**: 2026-01-13  
**Status**: Ready for Phase 1
