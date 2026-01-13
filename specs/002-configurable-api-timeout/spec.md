# Feature Specification: Configurable API Timeout

**Feature Branch**: `002-configurable-api-timeout`
**Created**: 2026-01-13
**Status**: Draft
**Input**: User description: "Implement configurable API timeouts with environment variable support for global, service, and endpoint-level configuration"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Global API Timeout (Priority: P1)

As a user, I need API calls to timeout after a reasonable duration so that my application doesn't hang indefinitely when the backend is unresponsive.

**Why this priority**: This is the foundational requirement. Without timeout mechanisms, API calls can hang indefinitely, causing poor user experience and potential memory leaks. This is independently testable and delivers immediate value by preventing hanging requests.

**Independent Test**: Can be fully tested by simulating a slow/hanging API endpoint and verifying that the request times out after the configured duration, loading states are cleared, and appropriate error messages are displayed.

**Acceptance Scenarios**:

1. **Given** a global timeout is configured to 30 seconds, **When** an API call takes longer than 30 seconds, **Then** the request should be cancelled and a timeout error should be thrown
2. **Given** an API call times out, **When** the timeout occurs, **Then** the loading state should be cleared and the user should see a timeout error message
3. **Given** the environment variable for global timeout is changed, **When** the application restarts, **Then** the new timeout value should be applied to all API calls without code changes

---

### User Story 2 - Service-Specific Timeouts (Priority: P1)

As a developer, I need to configure different timeouts for different API services (e.g., DOP, Consent, eKYC) so that services with varying performance characteristics can have appropriate timeout durations.

**Why this priority**: Different services have different performance characteristics. eKYC operations may take longer than simple data fetching. This is independently testable and delivers value by allowing fine-grained timeout control per service.

**Independent Test**: Can be tested by configuring different timeout values for different services and verifying that each service respects its specific timeout configuration.

**Acceptance Scenarios**:

1. **Given** DOP service has a 15-second timeout and eKYC service has a 60-second timeout, **When** both services are called simultaneously, **Then** each should timeout according to its configured duration
2. **Given** a service-specific timeout is configured via environment variable, **When** that service's API is called, **Then** the service-specific timeout should override the global timeout
3. **Given** no service-specific timeout is configured, **When** a service API is called, **Then** the global timeout should be used

---

### User Story 3 - Endpoint-Specific Timeouts (Priority: P2)

As a developer, I need to configure timeouts for specific endpoints (e.g., `/leads/{id}/submit-otp`) so that critical operations can have different timeout requirements than other endpoints in the same service.

**Why this priority**: This provides the most granular control for endpoints with unique performance requirements. While not critical for MVP, it significantly enhances flexibility for edge cases and performance optimization.

**Independent Test**: Can be tested by configuring endpoint-specific timeouts and verifying they take precedence over both service and global timeouts.

**Acceptance Scenarios**:

1. **Given** endpoint `/leads/{id}/submit-otp` has a 10-second timeout configured, **When** this endpoint is called, **Then** it should timeout after 10 seconds regardless of service or global timeout settings
2. **Given** endpoint-specific timeout is configured, **When** the endpoint is called, **Then** the endpoint timeout should override both service and global timeouts
3. **Given** no endpoint-specific timeout is configured, **When** an endpoint is called, **Then** the service-level timeout (or global if no service timeout) should be used

---

### User Story 4 - Timeout Error Handling and User Feedback (Priority: P1)

As a user, I need clear and actionable error messages when an API call times out so that I understand what happened and can decide whether to retry.

**Why this priority**: Without proper error handling, timeouts appear as silent failures or cryptic error messages. This is independently testable and crucial for user experience.

**Independent Test**: Can be tested by triggering timeouts and verifying that appropriate error messages are displayed, loading states are cleared, and retry options are available.

**Acceptance Scenarios**:

1. **Given** an API call times out, **When** the timeout occurs, **Then** the user should see a localized error message explaining that the request took too long
2. **Given** a timeout error occurs, **When** the error is displayed, **Then** the loading spinner should be cleared and any in-progress UI states should be reset
3. **Given** a timeout occurs on a retryable operation, **When** the error is shown, **Then** the user should be presented with a retry option

---

### User Story 5 - Retry Logic After Timeout (Priority: P2)

As a user, I need the application to automatically retry failed requests after a timeout so that transient network issues don't permanently block my workflow.

**Why this priority**: Automatic retry improves resilience against temporary network issues. While not critical for MVP, it significantly improves user experience and success rates.

**Independent Test**: Can be tested by simulating transient timeouts and verifying that retry logic works with exponential backoff.

**Acceptance Scenarios**:

1. **Given** an API call times out, **When** retry is enabled, **Then** the request should be retried with exponential backoff
2. **Given** retry count is set to 3, **When** all 3 attempts timeout, **Then** the final error should be displayed to the user
3. **Given** a retry succeeds, **When** the retry completes, **Then** the user should see the success response without knowing a timeout occurred

---

### Edge Cases

- ~~What happens when a user manually cancels a request before timeout occurs?~~ ✓ *Resolved: Q9 - Show "cancelled" message, log as USER_CANCEL*
- How does the system handle multiple simultaneous requests with different timeouts?
- ~~What happens when timeout configuration values are invalid (negative, zero, non-numeric)?~~ ✓ *Resolved: Q8 - Reject at startup with clear error*
- ~~How does the system handle timeout during file upload operations?~~ ✓ *Resolved: Q10 - Server cleanup, client notification*
- ~~What happens when timeout occurs during a retry attempt?~~ ✓ *Resolved: Q11 - Counts against retry limit*
- ~~How does the system handle timeouts for streaming responses or long-polling endpoints?~~ ✓ *Resolved: Q12 - Requires explicit longer timeout*
- What happens when environment variables are changed while the application is running?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST support global API timeout configurable via environment variable `NEXT_PUBLIC_API_TIMEOUT_GLOBAL`
- **FR-002**: System MUST support service-specific timeouts configurable via environment variables (e.g., `NEXT_PUBLIC_API_TIMEOUT_DOP`, `NEXT_PUBLIC_API_TIMEOUT_CONSENT`)
- **FR-003**: System MUST support endpoint-specific timeouts configurable via environment variables (e.g., `NEXT_PUBLIC_API_TIMEOUT_ENDPOINT_LEADS_SUBMIT_OTP`)
- **FR-004**: System MUST implement timeout cascade priority: endpoint → service → global
- **FR-005**: System MUST default to 30 seconds for global timeout when no environment variable is set
- **FR-006**: System MUST clear loading states when timeout occurs
- **FR-007**: System MUST display user-friendly timeout error messages
- **FR-008**: System MUST log timeout events for monitoring and debugging
- **FR-009**: System MUST support retry logic with configurable max retry attempts via `NEXT_PUBLIC_API_MAX_RETRIES`
- **FR-010**: System MUST implement exponential backoff for retries (1s, 2s, 4s, etc.)
- **FR-011**: System MUST validate timeout configuration values at startup and reject invalid values with clear error messages indicating which variables are invalid
- **FR-012**: System MUST support different timeout configurations for development and production environments
- **FR-013**: System MUST allow user-initiated request cancellation before timeout and display user-friendly "cancelled" message while logging as distinct USER_CANCEL event type
- **FR-014**: System MUST handle timeout errors in React Query mutations and queries
- **FR-015**: System MUST provide TypeScript types for timeout configuration

### Key Entities

- **Timeout Configuration**: Contains global timeout (default 30s), service-specific timeouts (DOP, Consent, eKYC, etc.), endpoint-specific timeouts, max retry attempts, and retry backoff strategy
- **Timeout Error**: Represents a timeout failure containing the original request details, configured timeout duration, elapsed time, and retry count
- **Timeout Context**: Tracks active requests with their timeout configurations, start time, and cancellation tokens
- **Retry Strategy**: Defines retry behavior including max attempts, backoff multiplier, initial delay, and retryable error types

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of API calls respect the configured timeout duration and are cancelled when timeout is reached
- **SC-002**: Loading states are cleared within 100ms after timeout occurs
- **SC-003**: Timeout error messages are displayed in less than 200ms after timeout
- **SC-004**: 95% of users report understanding timeout error messages (measured via user testing)
- **SC-005**: Timeout configuration changes via environment variables take effect on application restart without code deployment
- **SC-006**: Endpoint-specific timeouts correctly override service-level timeouts in 100% of cases
- **SC-007**: Service-specific timeouts correctly override global timeouts in 100% of cases
- **SC-008**: Automatic retries with exponential backoff reduce permanent failures by at least 30% for transient network issues
- **SC-009**: Invalid timeout configuration values are detected at startup with clear error messages
- **SC-010**: Timeout monitoring logs capture 100% of timeout events with sufficient context for debugging

### Performance Targets

- **PT-001**: Timeout overhead should not exceed 50ms per request
- **PT-002**: Timeout configuration parsing should complete within 10ms at startup
- **PT-003**: Retry logic should not add more than 100ms of latency to successful requests

## Clarifications

### Session 2026-01-13

- **Q1: What should be the default global timeout value?** → **A: 30 seconds**

  **Rationale**: 30 seconds is a reasonable default that balances user experience with API performance. It's long enough for most legitimate API operations (including slower ones like eKYC) but short enough to prevent indefinite hangs. This aligns with industry standards for web API timeouts.

- **Q2: What should be the default retry count?** → **A: 3 attempts**

  **Rationale**: Three retry attempts provide a good balance between resilience and user experience. With exponential backoff (1s, 2s, 4s), the total maximum wait time is 7 seconds plus the initial timeout, which is acceptable for users while providing sufficient retries for transient issues.

- **Q3: How should endpoint-specific environment variables be named?** → **A: `NEXT_PUBLIC_API_TIMEOUT_ENDPOINT_<normalized_path>`**

  **Rationale**: Using a consistent naming pattern with `NEXT_PUBLIC_` prefix (required for client-side access in Next.js), `API_TIMEOUT_ENDPOINT` as the category, and normalized path (e.g., `LEADS_SUBMIT_OTP` for `/leads/{id}/submit-otp`) provides clarity and prevents naming collisions. The normalization converts path separators to underscores and removes dynamic segments like `{id}`.

  **Examples**:
  - `/leads` → `NEXT_PUBLIC_API_TIMEOUT_ENDPOINT_LEADS`
  - `/leads/{id}/submit-otp` → `NEXT_PUBLIC_API_TIMEOUT_ENDPOINT_LEADS_SUBMIT_OTP`
  - `/ekyc/config` → `NEXT_PUBLIC_API_TIMEOUT_ENDPOINT_EKYC_CONFIG`

- **Q4: Should timeout apply to all HTTP methods or only specific ones?** → **A: All HTTP methods (GET, POST, PUT, DELETE, PATCH)**

  **Rationale**: Timeout issues can affect any HTTP method. GET requests can hang due to unresponsive servers, POST requests can hang during processing, etc. Applying timeout universally ensures consistent behavior and prevents hanging requests regardless of the HTTP method.

- **Q5: How should file upload timeouts be handled?** → **A: Use the same timeout mechanism but with longer default values**

  **Rationale**: File uploads typically take longer than other API calls. The same timeout mechanism should apply, but endpoints that handle file uploads should have longer endpoint-specific timeouts configured via environment variables. For example, `NEXT_PUBLIC_API_TIMEOUT_ENDPOINT_EKYC_SUBMIT` might be set to 120 seconds while the global timeout is 30 seconds.

- **Q6: What should happen to timeout errors in monitoring/analytics?** → **A: Log as distinct error type with full context**

  **Rationale**: Timeout errors should be logged as a distinct error type (e.g., `API_TIMEOUT`) separate from other API errors. The log should include: endpoint, timeout duration, elapsed time, retry count, and user context. This enables monitoring for timeout patterns and identifying problematic endpoints.

- **Q7: Should development and production have different default timeouts?** → **A: No, defaults should be the same but can be overridden per environment**

  **Rationale**: Using the same defaults ensures consistent behavior across environments. However, environment-specific overrides (via `.env.development` and `.env.production`) allow for longer timeouts in development if needed for debugging, or shorter timeouts in production for better user experience.

- **Q8: What should happen when timeout configuration values are invalid (negative, zero, non-numeric)?** → **A: Reject invalid values at startup, log warnings, and fail with clear error message showing which values are invalid**

  **Rationale**: Invalid timeout values can cause unpredictable behavior. Failing fast at startup prevents the application from running with misconfigured timeouts. The error message should clearly indicate which environment variable(s) contain invalid values and what the valid range is (positive numbers, typically in milliseconds). This approach aligns with the "fail fast" principle and helps developers catch configuration errors early.

- **Q9: What happens when a user manually cancels a request before timeout occurs?** → **A: Show user-friendly "cancelled" message, but log as distinct event type (USER_CANCEL vs API_TIMEOUT)**

  **Rationale**: User-initiated cancellation is semantically different from an automatic timeout. Users should see a friendly "cancelled" message that doesn't imply a system failure. However, for monitoring and debugging purposes, these events should be logged separately (`USER_CANCEL`) from actual timeouts (`API_TIMEOUT`) to enable accurate tracking of system performance vs. user behavior.

- **Q10: How does the system handle timeout during file upload operations?** → **A: Server should automatically clean up partial uploads when timeout is detected; client should notify server of cancellation**

  **Rationale**: File uploads that timeout leave partial data on the server. The server must implement cleanup mechanisms to remove incomplete uploads when timeout occurs. On the client side, when a timeout (or user cancellation) happens, the application should explicitly notify the server to abort the upload and clean up resources. This prevents storage waste and potential security issues from orphaned files.

- **Q11: What happens when timeout occurs during a retry attempt?** → **A: Yes, timeout during retry counts against the retry limit (e.g., if max retries = 3, 3 timeouts will exhaust retries)**

  **Rationale**: Each timeout, whether during the initial request or during a retry, represents a failed attempt. Counting all timeouts against the retry limit prevents infinite retry loops when the server is consistently unresponsive. For example, with max retries = 3, a total of 4 attempts (1 initial + 3 retries) could timeout before giving up. This ensures the retry mechanism doesn't worsen the user experience by extending the wait time indefinitely.

- **Q12: How does the system handle timeouts for streaming responses or long-polling endpoints?** → **A: Streaming/long-polling endpoints require explicit, longer timeout configuration via endpoint-specific env vars; no default timeout applies**

  **Rationale**: Streaming and long-polling endpoints have fundamentally different timeout requirements than standard request/response endpoints. Applying the default 30-second timeout would break these endpoints. Instead, these endpoints must have explicit, longer timeout values configured via endpoint-specific environment variables (e.g., `NEXT_PUBLIC_API_TIMEOUT_ENDPOINT_EKYC_STREAM=300000`). If no explicit timeout is configured, these endpoints should not have any timeout applied (or use a very large default) to prevent unintended disconnections.

---

## Assumptions

- The application uses Next.js 14+ with environment variable support via `NEXT_PUBLIC_` prefix
- React Query (or similar data fetching library) is used for API calls
- The application already has an API client abstraction layer (e.g., [`src/lib/api/client.ts`](src/lib/api/client.ts))
- TypeScript is used and type definitions will be provided for timeout configuration
- Environment variables are loaded at build time and runtime as appropriate
- The application has existing error handling infrastructure (e.g., toast notifications)
- Logging infrastructure exists or will be implemented alongside timeout functionality
- Timeout duration is measured from the start of the request (not including connection setup time)
- Browser's AbortController API is available for request cancellation
- The application does not currently have any timeout mechanism implemented (confirmed by previous research)
- User-initiated cancellation is semantically distinct from automatic timeout and requires different user messaging and logging (Q9)
- File upload endpoints require server-side cleanup of partial uploads when timeout or cancellation occurs (Q10)
- Timeout during retry attempts counts against the configured retry limit to prevent infinite retry loops (Q11)
- Streaming and long-polling endpoints require explicit longer timeout configuration and should not use default timeout values (Q12)

## Environment Variable Configuration

### Naming Convention

All timeout environment variables follow the pattern:

```
NEXT_PUBLIC_API_TIMEOUT_<scope>_<target>
```

Where:
- `<scope>` is either `GLOBAL`, `SERVICE`, or `ENDPOINT`
- `<target>` is the service name or normalized endpoint path

### Default Values

| Environment Variable | Default Value | Description |
|---------------------|---------------|-------------|
| `NEXT_PUBLIC_API_TIMEOUT_GLOBAL` | `30000` | Global timeout in milliseconds for all API calls |
| `NEXT_PUBLIC_API_TIMEOUT_SERVICE_DOP` | undefined | DOP service timeout (falls back to global) |
| `NEXT_PUBLIC_API_TIMEOUT_SERVICE_CONSENT` | undefined | Consent service timeout (falls back to global) |
| `NEXT_PUBLIC_API_TIMEOUT_SERVICE_EKYC` | undefined | eKYC service timeout (falls back to global) |
| `NEXT_PUBLIC_API_MAX_RETRIES` | `3` | Maximum number of retry attempts |
| `NEXT_PUBLIC_API_RETRY_DELAY_MS` | `1000` | Initial retry delay in milliseconds |

### Example Configuration

```env
# .env.production
NEXT_PUBLIC_API_TIMEOUT_GLOBAL=30000
NEXT_PUBLIC_API_TIMEOUT_SERVICE_EKYC=60000
NEXT_PUBLIC_API_TIMEOUT_ENDPOINT_LEADS_SUBMIT_OTP=15000
NEXT_PUBLIC_API_MAX_RETRIES=3
```

### Configuration Cascade

The timeout resolution follows this priority order:

1. **Endpoint-specific** (e.g., `NEXT_PUBLIC_API_TIMEOUT_ENDPOINT_LEADS_SUBMIT_OTP`)
2. **Service-specific** (e.g., `NEXT_PUBLIC_API_TIMEOUT_SERVICE_DOP`)
3. **Global** (e.g., `NEXT_PUBLIC_API_TIMEOUT_GLOBAL`)
4. **Hardcoded default** (30000ms = 30 seconds)

## Technical Notes

### Timeout Implementation Approach

- Use [`AbortController.timeout()`](https://developer.mozilla.org/en-US/docs/Web/API/AbortController/timeout) or `AbortSignal.timeout()` for modern browsers
- Fallback to `setTimeout()` with `AbortController.abort()` for older browser support
- Integrate with React Query's `signal` option for automatic request cancellation

### Type Safety

```typescript
interface TimeoutConfig {
  global: number; // in milliseconds
  services?: Record<string, number>;
  endpoints?: Record<string, number>;
  maxRetries: number;
  retryDelay: number;
}
```

### Error Message Localization

Timeout error messages should support i18n:
- English: "The request took too long to complete. Please try again."
- Vietnamese: "Yêu cầu mất quá nhiều thời gian. Vui lòng thử lại."

### Monitoring Integration

Timeout events should be logged with:
- Endpoint path
- Configured timeout duration
- Actual elapsed time
- Retry count
- User session ID (if available)
- Timestamp
