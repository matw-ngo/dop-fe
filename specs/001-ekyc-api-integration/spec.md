# Feature Specification: eKYC API Integration

**Feature Branch**: `001-ekyc-api-integration`  
**Created**: 2026-01-12  
**Status**: Draft  
**Input**: User description: "Integrate eKYC APIs with backend - Add hooks for fetching eKYC config and submitting VNPT eKYC results"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Fetch eKYC Configuration (Priority: P1)

As a frontend application, I need to retrieve eKYC configuration from the backend so that I can properly initialize and configure the VNPT eKYC SDK with the correct parameters for the current tenant and environment.

**Why this priority**: This is the foundational requirement. Without the ability to fetch configuration, the eKYC SDK cannot be initialized, making all other eKYC functionality impossible.

**Independent Test**: Can be fully tested by calling the configuration hook and verifying that it returns the expected configuration object with SDK URL, API key, and supported document types. Delivers immediate value by enabling downstream eKYC feature development.

**Acceptance Scenarios**:

1. **Given** a user is authenticated, **When** the eKYC config hook is called, **Then** it should return configuration including SDK URL, API key, tenant ID, and supported document types
2. **Given** the API is unavailable, **When** the config hook is called, **Then** it should handle the error gracefully and return appropriate error state
3. **Given** cached configuration exists, **When** the config hook is called within the cache TTL, **Then** it should return the cached configuration without making a new API call

---

### User Story 2 - Submit VNPT eKYC Results (Priority: P1)

As a user completing the eKYC verification process, I need to submit my eKYC results (including extracted personal data, document images, and verification status) to the backend so that the verification data can be stored and processed for the application.

**Why this priority**: This is the core value proposition of eKYC. Users completing verification need their results stored and processed. This is independently testable as the submission flow can be validated end-to-end.

**Independent Test**: Can be fully tested by simulating a completed eKYC session and submitting the results payload to the backend API. Delivers immediate value by enabling the storage and processing of user verification data.

**Acceptance Scenarios**:

1. **Given** a user has completed eKYC verification, **When** they submit the results, **Then** the backend should store the verification data and return a success response
2. **Given** the submission fails due to network error, **When** the hook is called, **Then** it should retry or provide clear error messaging with retry options
3. **Given** invalid eKYC data is submitted, **When** the backend receives the request, **Then** it should return validation errors indicating what data is missing or invalid
4. **Given** the submission is successful, **When** the response is received, **Then** it should include the verification ID and status for future reference

---

### User Story 3 - Handle eKYC Session State (Priority: P2)

As a user, I need the application to track my eKYC session state so that I can resume verification if interrupted and the application can prevent duplicate submissions.

**Why this priority**: This improves user experience by allowing session recovery and preventing duplicate submissions. While not critical for MVP, it significantly enhances UX and data integrity.

**Independent Test**: Can be tested by initiating a session, interrupting it, and verifying that session state persists and can be recovered. Delivers value by improving user experience and data consistency.

**Acceptance Scenarios**:

1. **Given** a user starts eKYC verification, **When** they navigate away and return, **Then** the session state should be preserved and recoverable
2. **Given** a user has already submitted eKYC results, **When** they attempt to submit again, **Then** the system should prevent duplicate submission
3. **Given** a session expires, **When** the user returns, **Then** they should be prompted to restart the verification process

---

### Edge Cases

- What happens when the VNPT SDK configuration changes while a user is in the middle of verification?
- How does the system handle partial or incomplete eKYC data submission?
- What happens when the backend eKYC storage endpoint is rate-limited or down?
- How does the system handle eKYC results that fail backend validation after successful SDK verification?
- What happens when a user's eKYC session expires but they attempt to submit results?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST provide a hook (`useEkycConfig`) to fetch eKYC configuration from the backend API
- **FR-002**: System MUST cache eKYC configuration locally with configurable TTL to reduce API calls
- **FR-003**: System MUST provide a hook (`useSubmitEkycResult`) to submit VNPT eKYC results to the backend
- **FR-004**: System MUST map VNPT eKYC SDK response format to backend API format using a data mapper
- **FR-005**: System MUST handle API errors gracefully with appropriate error messages to users
- **FR-006**: System MUST include retry logic for failed API submissions with exponential backoff
- **FR-007**: System MUST validate eKYC result payload before submission to backend
- **FR-008**: System MUST support submission of document images (front, back, selfie) as base64 encoded strings (aligned with VnptEkycRequestBody schema in v1.d.ts)
- **FR-009**: System MUST maintain session state to prevent duplicate eKYC submissions
- **FR-010**: System MUST log all eKYC API interactions for audit purposes

### Key Entities

- **eKYC Configuration**: Contains SDK initialization parameters including SDK URL, API key, tenant ID, environment (sandbox/production), supported document types (CMND, CCCD, Passport), and configuration TTL
- **eKYC Result**: Represents the verification outcome containing extracted personal data (name, ID number, date of birth, address), document images (front, back, selfie), verification status, timestamp, and session ID
- **eKYC Session**: Tracks the current verification state including status (initialized, in_progress, completed, failed), session ID, start time, and last activity timestamp
- **API Response**: Standard backend response structure including success flag, data payload, error message, and verification ID

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: eKYC configuration is successfully retrieved and cached within 500ms on page load
- **SC-002**: eKYC results are successfully submitted to the backend within 3 seconds under normal network conditions
- **SC-003**: 95% of eKYC submissions succeed on first attempt under normal network conditions
- **SC-004**: Failed submissions are automatically retried up to 3 times with exponential backoff
- **SC-005**: Configuration cache reduces API calls by at least 80% for repeated page loads within TTL
- **SC-006**: Zero duplicate eKYC submissions occur for the same user session
- **SC-007**: API error messages are user-friendly and actionable in 100% of error cases

## Clarifications

### Session 2026-01-12

- **Q1: When should the Lead be created in the onboarding flow?** → **A: Create lead immediately when user starts onboarding (before first step)**
  
  **Rationale**: Creating lead immediately ensures the leadId is available before any eKYC step, which is required for both fetching eKYC config (GET /leads/{id}/ekyc/config) and submitting eKYC results (POST /leads/{id}/ekyc/vnpt)). This approach:
  - Simplifies data integrity by avoiding temporary storage complexity
  - Enables proper session tracking for duplicate prevention (FR-009)
  - Allows progressive lead updates as user completes each form step
  - Reduces testing complexity by having a single clear code path
  
  **Implementation Note**: The timing of lead creation should be implemented using the Strategy Pattern (LeadCreationStrategy interface with ImmediateCreationStrategy) to maintain code quality and allow for future business rule changes if needed. For this MVP phase, the strategy is hard-coded rather than externally configurable.

- **Q2: What format should document images be submitted in?** → **B: Base64 encoded strings (aligned with VnptEkycRequestBody schema in v1.d.ts)**
  
  **Rationale**: The actual OpenAPI schema ([`src/lib/api/v1.d.ts`](src/lib/api/v1.d.ts:1)) shows `VNPTBase64DocImg` and `VNPTBase64FaceImg` as base64 string properties. This design choice:
  - Aligns with the actual API contract defined in the schema
  - Avoids the complexity of multipart/form-data encoding
  - Matches VNPT SDK output format (images are already base64 from SDK)
  - Maintains consistency with how the VNPT SDK returns image data
  - **Note**: FR-008 was updated to reflect this clarification

- **Q3: What should be the default cache TTL for eKYC configuration?** → **A: 5 minutes (300 seconds)**
  
  **Rationale**: This balances API call reduction with data freshness for typical onboarding sessions. It's short enough that configuration remains current, but long enough to avoid unnecessary API calls on page refreshes or tab switches. This aligns with the measurable target in SC-005 (80% reduction in API calls for repeated page loads within TTL).
  
  **Implementation Note**: The 5-minute TTL should be the default hardcoded value in the `useEkycConfig` hook.

- **Q3: What should be the default cache TTL for eKYC configuration?** → **A: 5 minutes (300 seconds)**
  
  **Rationale**: This balances API call reduction with data freshness for typical onboarding sessions. It's short enough that configuration remains current, but long enough to avoid unnecessary API calls on page refreshes or tab switches. This aligns with the measurable target in SC-005 (80% reduction in API calls for repeated page loads within TTL).
  
  **Implementation Note**: The 5-minute TTL should be the default hardcoded value in the `useEkycConfig` hook.

---

## Assumptions

- The backend provides RESTful API endpoints for fetching eKYC configuration and submitting eKYC results
- VNPT eKYC SDK is already integrated and produces a standardized response format
- User authentication is handled separately and authentication tokens are available for API calls
- Backend validation rules for EKYC data are documented and consistent
- Document images are base64-encoded or provided as file URLs from the SDK
- The application has network connectivity to both the VNPT SDK and backend APIs
- Rate limiting on backend APIs allows for reasonable retry attempts
- Session state can be maintained using localStorage or sessionStorage
- Lead creation timing is implemented as a hard-coded strategy pattern (not externally configurable for MVP)
