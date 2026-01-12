# eKYC API Integration - Research & Technical Decisions

**Feature Branch**: `001-ekyc-api-integration`  
**Status**: Implementation Validation  
**Last Updated**: 2026-01-12

## Overview

This document captures the research findings, technology decisions, clarifications, and best practices for the eKYC API Integration feature. The implementation already exists in the codebase; this document serves to validate and document the technical choices made.

---

## Technology Decisions

### Data Fetching Strategy

**Decision**: Use React Query (`@tanstack/react-query`) for data fetching

**Rationale**:
- Already integrated in the project for API calls
- Provides built-in caching, revalidation, and background updates
- Excellent TypeScript support with strict mode compatibility
- Handles loading/error states automatically
- Supports stale-while-revalidate strategy for optimal UX

**Implementation Reference**: [`useEkycConfig`](src/hooks/use-ekyc-config.ts:18), [`useSubmitEkycResult`](src/hooks/use-submit-ekyc-result.ts:29)

### TypeScript Configuration

**Decision**: TypeScript 5.3+ with strict mode enabled

**Rationale**:
- Project constitution requires strict mode for all code
- Provides maximum type safety for complex API response types
- Enables strict null checks to prevent runtime errors
- Required for proper type inference with OpenAPI-generated types

**Type Generation**: Types are auto-generated from OpenAPI schema in [`v1.d.ts`](src/lib/api/v1.d.ts:1)

### Session State Management

**Decision**: Use localStorage for session state persistence

**Rationale**:
- Complies with FR-009 (session state to prevent duplicate submissions)
- Data stored is minimal (<1KB): session ID, status, timestamps
- Survives page refreshes and tab switches
- No server-side dependency for session tracking
- Already used elsewhere in the project

**Implementation Pattern**:
```typescript
// Session key pattern: `ekyc_session_${leadId}`
interface EkycSessionState {
  sessionId: string;
  status: 'initialized' | 'in_progress' | 'completed' | 'failed';
  startTime: number;
  lastActivity: number;
  submittedAt?: number;
}
```

### Retry Strategy

**Decision**: Exponential backoff with jitter for failed submissions

**Rationale**:
- Complies with FR-006 (retry logic with exponential backoff)
- Reduces server load during outages
- React Query's default retry behavior can be customized
- Maximum 3 retries before failing (as per SC-004)

**Configuration**:
```typescript
{
  retry: 3,
  retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
}
```

---

## Clarifications Resolved

### Q1: Lead Creation Timing

**Question**: When should the Lead be created in the onboarding flow?

**Answer**: Create lead immediately when user starts onboarding (before first step)

**Rationale**:
- Ensures `leadId` is available before any eKYC step
- Required for both fetching eKYC config and submitting results
- Simplifies data integrity by avoiding temporary storage
- Enables proper session tracking for duplicate prevention
- Allows progressive lead updates as user completes each form step

**Implementation Note**: The timing of lead creation uses the Strategy Pattern (`LeadCreationStrategy` interface with `ImmediateCreationStrategy`).

### Q2: Document Image Format

**Question**: What format should document images be submitted in?

**Answer**: Base64 encoded strings

**Rationale**:
- Aligns with actual API contract in [`VnptEkycRequestBody`](src/lib/api/v1.d.ts:533)
- Properties `VNPTBase64DocImg` and `VNPTBase64FaceImg` are base64 strings
- Avoids complexity of multipart/form-data encoding
- Matches VNPT SDK output format (images are already base64)
- Maintains consistency with how VNPT SDK returns image data

**Implementation Reference**: [`ekyc-api-mapper.ts`](src/lib/ekyc/ekyc-api-mapper.ts:377) handles base64 image extraction

### Q3: Configuration Cache TTL

**Question**: What should be the default cache TTL for eKYC configuration?

**Answer**: 5 minutes (300 seconds)

**Rationale**:
- Balances API call reduction with data freshness
- Short enough that configuration remains current
- Long enough to avoid unnecessary API calls on page refreshes
- Aligns with SC-005 target (80% reduction in API calls within TTL)
- Typical onboarding sessions complete within this window

**Implementation**: The 5-minute TTL is hardcoded in the `useEkycConfig` hook via React Query's `staleTime` option.

---

## Best Practices

### Error Handling Patterns

#### 1. Network Error Handling

```typescript
// Pattern: Use React Query's error state
const { data, error, isLoading } = useEkycConfig(leadId);

if (error) {
  // User-friendly error messages (SC-007)
  const errorMessage = error.message.includes('Failed to get eKYC config')
    ? 'Unable to load verification configuration. Please check your connection.'
    : error.message;
  
  return <ErrorMessage message={errorMessage} />;
}
```

#### 2. Validation Error Handling

```typescript
// Pattern: Pre-submit validation
const validateEkycResult = (data: VnptEkycRequestBody): boolean => {
  if (!data.ocr?.object?.id || !data.ocr?.object?.name) {
    throw new Error('Missing required identity information');
  }
  return true;
};
```

#### 3. Submission Error Handling with Retry

```typescript
// Pattern: Mutation with error handling
const submitMutation = useSubmitEkycResult();

const handleSubmit = async (data: VnptEkycRequestBody) => {
  try {
    await submitMutation.mutateAsync({ leadId, ekycData: data });
    toast.success('Verification submitted successfully');
  } catch (error) {
    // User-friendly actionable error (SC-007)
    if (error.message.includes('network')) {
      toast.error('Network error. Retrying...');
    } else if (error.message.includes('validation')) {
      toast.error('Invalid data. Please restart verification.');
    }
  }
};
```

### Data Validation Strategies

#### 1. Schema-Based Validation

```typescript
// Use Zod or similar for runtime validation
import { z } from 'zod';

const EkycResultSchema = z.object({
  type_document: z.number().optional(),
  ocr: z.object({
    object: z.object({
      id: z.string().min(1),
      name: z.string().min(1),
      birth_day: z.string().optional(),
    }).optional(),
  }).optional(),
});
```

#### 2. Type Guard Functions

```typescript
// Pattern: Type guard for validation
function isEkycResponseValid(data: unknown): data is EkycResponse {
  return !!(
    data &&
    typeof data === 'object' &&
    'ocr' in data &&
    data.ocr &&
    'object' in data.ocr &&
    data.ocr.object &&
    'id' in data.ocr.object &&
    'name' in data.ocr.object
  );
}
```

#### 3. Data Mapper Validation

The [`mapEkycResponseToApiRequest`](src/lib/ekyc/ekyc-api-mapper.ts:81) function handles transformation with safe defaults:
- `safeParseJSON` for JSON string parsing
- `safeGetString` for property extraction
- Graceful handling of missing/undefined fields

### Audit Logging Approach

#### 1. API Interaction Logging

```typescript
// Pattern: Log all eKYC API interactions (FR-010)
interface AuditLogEntry {
  timestamp: string;
  leadId: string;
  sessionId: string;
  action: 'config_fetch' | 'result_submit' | 'error';
  status: 'success' | 'failure';
  metadata?: Record<string, unknown>;
}

const logAuditEvent = (entry: AuditLogEntry) => {
  // Send to logging service
  console.log('[AUDIT]', JSON.stringify(entry));
};
```

#### 2. Session State Logging

```typescript
// Pattern: Track session lifecycle
const updateSessionState = (leadId: string, updates: Partial<EkycSessionState>) => {
  const current = getSessionState(leadId);
  const updated = { ...current, ...updates, lastActivity: Date.now() };
  
  localStorage.setItem(`ekyc_session_${leadId}`, JSON.stringify(updated));
  
  logAuditEvent({
    timestamp: new Date().toISOString(),
    leadId,
    sessionId: updated.sessionId,
    action: 'state_change',
    status: 'success',
    metadata: { from: current.status, to: updated.status },
  });
};
```

### Security Considerations

#### 1. Sensitive Data Handling

- Never log base64 image data (PII concern)
- Use `console.log` sparingly with eKYC data
- Clear sensitive data from localStorage after submission

#### 2. Vietnamese Decree 13/2023 Compliance

- Treat all eKYC data as personal data under Vietnamese law
- Ensure proper data encryption in transit (HTTPS)
- Implement appropriate data retention policies
- Provide user consent mechanisms for data collection

---

## Performance Considerations

### Cache Strategy

**Goal**: Reduce API calls by 80% for repeated page loads (SC-005)

**Implementation**:
```typescript
useQuery({
  queryKey: ['ekyc-config', leadId],
  queryFn: () => getEkycConfig(leadId),
  staleTime: 5 * 60 * 1000, // 5 minutes
  cacheTime: 10 * 60 * 1000, // 10 minutes
});
```

### Payload Size Optimization

**Concern**: Base64 images increase payload size

**Mitigation**:
- VNPT SDK compresses images before encoding
- Backend handles large payloads efficiently
- Network timeout configured appropriately (30s)

### Lazy Loading Strategy

**Pattern**: Load eKYC SDK only when needed
```typescript
// Dynamic import of VNPT SDK
const loadEkycSdk = async () => {
  if (!window.SDK) {
    await import('@/lib/ekyc/sdk-loader');
  }
};
```

---

## Testing Strategy

### Unit Testing

**Focus Areas**:
- Data mapper transformations ([`ekyc-api-mapper.test.ts`](src/lib/ekyc/__tests__/ekyc-api-mapper.test.ts))
- Validation functions
- Error handling logic
- Session state management

### Integration Testing

**Focus Areas**:
- Hook behavior with mock API responses
- Cache invalidation
- Error recovery scenarios
- Session lifecycle

### E2E Testing

**Focus Areas**:
- Complete eKYC flow from config fetch to result submission
- Error scenarios (network failure, invalid data)
- Session persistence across page refresh

---

## Migration Notes

### From Existing Implementation

The existing implementation is well-structured and follows best practices. Key observations:

1. **Hooks are properly typed**: Both hooks use auto-generated types from [`v1.d.ts`](src/lib/api/v1.d.ts:1)
2. **Data mapper is comprehensive**: [`ekyc-api-mapper.ts`](src/lib/ekyc/ekyc-api-mapper.ts:1) handles all transformations safely
3. **Provider abstraction exists**: [`vnpt-provider.ts`](src/lib/verification/providers/vnpt-provider.ts:1) wraps VNPT SDK cleanly

### Gaps Identified

1. **Cache TTL not implemented**: [`useEkycConfig`](src/hooks/use-ekyc-config.ts:18) needs `staleTime` configuration
2. **Retry logic not implemented**: [`useSubmitEkycResult`](src/hooks/use-submit-ekyc-result.ts:29) needs retry configuration
3. **Session state not tracked**: Need to add localStorage-based session management

---

## References

### Internal Documentation
- [Feature Specification](./spec.md)
- [API Types](src/lib/api/v1.d.ts:1)
- [Project Constitution](../../.zo/memory/constitution.md)

### External Documentation
- [React Query Documentation](https://tanstack.com/query/latest)
- [VNPT eKYC SDK Documentation](https://ekyc.vnpt.com.vn)
- [Vietnamese Decree 13/2023 on Personal Data Protection](https://thuvienphapluat.vn/van-ban/An-ninh-trat-tu/Nghi-dinh-13-2023-ND-CP-545532.aspx)

---

**Version**: 1.0.0  
**Author**: Architecture Team  
**Review Status**: Pending
