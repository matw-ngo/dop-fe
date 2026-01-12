# Requirements Checklist: eKYC API Integration

**Purpose**: Verify that all functional requirements for the eKYC API integration feature are properly implemented and tested
**Created**: 2026-01-12
**Feature**: [spec.md](../spec.md)

**Note**: This checklist is generated based on the feature specification for eKYC API integration.

## P1 Requirements (Critical)

### eKYC Configuration Hook

- [ ] CHK001 Implement `useEkycConfig` hook that fetches configuration from backend API
- [ ] CHK002 Configuration includes SDK URL, API key, tenant ID, environment, and supported document types
- [ ] CHK003 Configuration is cached locally with configurable TTL (default 5 minutes)
- [ ] CHK004 Cache is respected - no API call made when cache is valid
- [ ] CHK005 Cache is invalidated and refreshed when TTL expires
- [ ] CHK006 Hook returns loading state during initial fetch
- [ ] CHK007 Hook returns error state when API call fails
- [ ] CHK008 Error messages are user-friendly and actionable

### eKYC Result Submission Hook

- [ ] CHK009 Implement `useSubmitEkycResult` hook that submits VNPT eKYC results to backend
- [ ] CHK010 Hook accepts eKYC result payload with extracted data, document images, and verification status
- [ ] CHK011 Document images (front, back, selfie) are submitted as multipart/form-data or base64
- [ ] CHK012 Hook validates payload before submission (required fields, data types)
- [ ] CHK013 Submission includes session ID for tracking
- [ ] CHK014 Hook returns success response with verification ID
- [ ] CHK015 Hook handles API errors gracefully
- [ ] CHK016 Failed submissions trigger retry with exponential backoff (max 3 retries)
- [ ] CHK017 Retry logic includes delay between attempts (1s, 2s, 4s)

## P2 Requirements (Important)

### Data Mapping

- [ ] CHK018 Implement `EkycApiMapper` to transform VNPT SDK response to backend API format
- [ ] CHK019 Mapper handles personal data fields (name, ID number, DOB, address)
- [ ] CHK020 Mapper handles document image data
- [ ] CHK021 Mapper handles verification status mapping
- [ ] CHK022 Mapper handles timestamp conversion to ISO format
- [ ] CHK023 Mapper validates required fields exist before transformation

### Session State Management

- [ ] CHK024 Implement session state tracking using localStorage or sessionStorage
- [ ] CHK025 Session includes status (initialized, in_progress, completed, failed)
- [ ] CHK026 Session includes session ID, start time, and last activity timestamp
- [ ] CHK027 Session is persisted across page navigations
- [ ] CHK028 Duplicate submissions are prevented for completed sessions
- [ ] CHK029 Expired sessions are cleared and trigger restart prompt

## P3 Requirements (Nice to Have)

### Error Handling & Logging

- [ ] CHK030 All eKYC API interactions are logged for audit purposes
- [ ] CHK031 Logs include timestamp, endpoint, payload (sanitized), and response status
- [ ] CHK032 Error logs include stack traces and error context
- [ ] CHK033 Network errors are distinguished from validation errors
- [ ] CHK034 Rate limit errors are detected and appropriate retry strategy is applied

### Performance & Optimization

- [ ] CHK035 Configuration fetch completes within 500ms under normal conditions
- [ ] CHK036 Result submission completes within 3 seconds under normal conditions
- [ ] CHK037 Cache reduces API calls by at least 80% for repeated loads
- [ ] CHK038 Payload validation is synchronous and non-blocking
- [ ] CHK039 Image compression is applied before submission if needed

## Edge Cases

- [ ] CHK040 Handle configuration changes during active eKYC session
- [ ] CHK041 Handle partial/incomplete eKYC data submission gracefully
- [ ] CHK042 Handle backend rate limiting with appropriate user feedback
- [ ] CHK043 Handle backend validation failures after successful SDK verification
- [ ] CHK044 Handle expired session submission attempts with clear error
- [ ] CHK045 Handle network interruptions during submission
- [ ] CHK046 Handle malformed API responses from backend
- [ ] CHK047 Handle authentication token expiration during API calls

## Testing Requirements

- [ ] CHK048 Unit tests for `useEkycConfig` hook with mocked API
- [ ] CHK049 Unit tests for `useSubmitEkycResult` hook with mocked API
- [ ] CHK050 Unit tests for `EkycApiMapper` transformations
- [ ] CHK051 Unit tests for session state management
- [ ] CHK052 Integration tests for complete eKYC flow (config -> submit)
- [ ] CHK053 Error scenario tests (network failure, validation errors, rate limiting)
- [ ] CHK054 Cache behavior tests (hit, miss, expiry)
- [ ] CHK055 Retry logic tests (exponential backoff, max retries)
- [ ] CHK056 Edge case tests (expired sessions, partial data, config changes)

## Documentation

- [ ] CHK057 JSDoc comments for all exported functions and hooks
- [ ] CHK058 Type definitions for all eKYC-related types
- [ ] CHK059 Usage examples in README or doc comments
- [ ] CHK060 API endpoint documentation (request/response formats)
- [ ] CHK061 Error code reference with user-friendly messages

## Notes

- Check items off as completed: `[x]`
- Add comments or findings inline
- Link to relevant resources or documentation
- Items are numbered sequentially for easy reference
- P1 items must be completed before feature can be considered MVP-ready
- P2 items should be completed for full feature release
- P3 items are enhancements that can be added in future iterations
