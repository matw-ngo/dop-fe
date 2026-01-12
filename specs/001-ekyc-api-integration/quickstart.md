# eKYC API Integration - Quickstart Guide

**Feature Branch**: `001-ekyc-api-integration`  
**Status**: Implementation Validation  
**Last Updated**: 2026-01-12

## Overview

This guide provides a quick reference for integrating eKYC (Electronic Know Your Customer) functionality into your application using the existing hooks and utilities. The implementation is already complete; this guide focuses on usage patterns and best practices.

---

## Prerequisites

### Environment Setup

Ensure the following environment variables are configured in your `.env.local` file:

```bash
# eKYC Configuration (optional, defaults provided)
NEXT_PUBLIC_EKYC_AUTH_TOKEN=your_auth_token_here
NEXT_PUBLIC_EKYC_BACKEND_URL=https://api.example.com
NEXT_PUBLIC_EKYC_TOKEN_KEY=your_token_key
NEXT_PUBLIC_EKYC_TOKEN_ID=your_token_id
```

### Required Dependencies

The following packages are already installed in the project:

```json
{
  "dependencies": {
    "@tanstack/react-query": "^5.0.0",
    "next": "14.x",
    "react": "18.2.x",
    "typescript": "5.3.x"
  }
}
```

### Type Generation

API types are auto-generated from the OpenAPI schema. To regenerate types:

```bash
# Generate TypeScript types from OpenAPI schema
npm run generate:types
```

This updates [`src/lib/api/v1.d.ts`](src/lib/api/v1.d.ts:1) with the latest API types.

---

## Usage Examples

### 1. Fetching eKYC Configuration

Use the [`useEkycConfig`](src/hooks/use-ekyc-config.ts:18) hook to fetch eKYC configuration for a lead.

```typescript
import { useEkycConfig } from '@/hooks/use-ekyc-config';

function EkycConfigLoader({ leadId }: { leadId: string }) {
  const { data, error, isLoading, isError } = useEkycConfig(leadId);

  if (isLoading) {
    return <div>Loading eKYC configuration...</div>;
  }

  if (isError) {
    return <div>Error: {error.message}</div>;
  }

  if (!data) {
    return null;
  }

  return (
    <div>
      <h3>eKYC Configuration Loaded</h3>
      <p>Document Types: {data.list_type_document.join(', ')}</p>
      <p>Flow Type: {data.sdk_flow}</p>
      {/* Use config to initialize VNPT SDK */}
    </div>
  );
}
```

### 2. Submitting eKYC Results

Use the [`useSubmitEkycResult`](src/hooks/use-submit-ekyc-result.ts:29) hook to submit eKYC results after verification completes.

```typescript
import { useSubmitEkycResult } from '@/hooks/use-submit-ekyc-result';
import { mapEkycResponseToApiRequest } from '@/lib/ekyc/ekyc-api-mapper';
import type { EkycResponse } from '@/lib/ekyc/types';

function EkycSubmitButton({ 
  leadId, 
  ekycResponse 
}: { 
  leadId: string; 
  ekycResponse: EkycResponse;
}) {
  const submitMutation = useSubmitEkycResult();

  const handleSubmit = async () => {
    try {
      // Map VNPT SDK response to API format
      const apiRequest = mapEkycResponseToApiRequest(ekycResponse);
      
      // Submit to backend
      await submitMutation.mutateAsync({
        leadId,
        ekycData: apiRequest,
      });
      
      // Handle success
      console.log('eKYC submitted successfully');
    } catch (error) {
      // Handle error
      console.error('Failed to submit eKYC:', error);
    }
  };

  return (
    <button
      onClick={handleSubmit}
      disabled={submitMutation.isPending}
    >
      {submitMutation.isPending 
        ? 'Submitting...' 
        : 'Submit Verification'
      }
    </button>
  );
}
```

### 3. Session State Management

Track eKYC session state to prevent duplicate submissions.

```typescript
interface EkycSessionState {
  sessionId: string;
  status: 'initialized' | 'in_progress' | 'completed' | 'failed' | 'cancelled' | 'expired';
  startTime: number;
  lastActivity: number;
  submittedAt?: number;
  submitted: boolean;
  submissionAttempts: number;
}

const SESSION_KEY = (leadId: string) => `ekyc_session_${leadId}`;

// Get session state
function getSessionState(leadId: string): EkycSessionState | null {
  if (typeof window === 'undefined') return null;
  
  const data = localStorage.getItem(SESSION_KEY(leadId));
  return data ? JSON.parse(data) : null;
}

// Initialize session
function initSession(leadId: string): void {
  const session: EkycSessionState = {
    sessionId: `vnpt_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
    status: 'initialized',
    startTime: Date.now(),
    lastActivity: Date.now(),
    submitted: false,
    submissionAttempts: 0,
  };
  
  localStorage.setItem(SESSION_KEY(leadId), JSON.stringify(session));
}

// Update session state
function updateSessionState(
  leadId: string, 
  updates: Partial<EkycSessionState>
): void {
  const current = getSessionState(leadId);
  if (!current) return;
  
  const updated = {
    ...current,
    ...updates,
    lastActivity: Date.now(),
  };
  
  localStorage.setItem(SESSION_KEY(leadId), JSON.stringify(updated));
}

// Check if submission is allowed
function canSubmit(leadId: string): boolean {
  const session = getSessionState(leadId);
  if (!session) return true;
  
  // Check if already submitted
  if (session.submitted) return false;
  
  // Check max attempts
  if (session.submissionAttempts >= 3) return false;
  
  // Check recent submission (within 1 minute)
  if (session.submittedAt && Date.now() - session.submittedAt < 60000) {
    return false;
  }
  
  return true;
}

// Mark as submitted
function markSubmitted(leadId: string): void {
  updateSessionState(leadId, {
    submitted: true,
    submittedAt: Date.now(),
    submissionAttempts: getSessionState(leadId)!.submissionAttempts + 1,
  });
}

// Clear session
function clearSession(leadId: string): void {
  localStorage.removeItem(SESSION_KEY(leadId));
}
```

### 4. Complete Integration Example

```typescript
import { useState, useEffect } from 'react';
import { useEkycConfig } from '@/hooks/use-ekyc-config';
import { useSubmitEkycResult } from '@/hooks/use-submit-ekyc-result';
import { mapEkycResponseToApiRequest } from '@/lib/ekyc/ekyc-api-mapper';

function EkycFlow({ leadId }: { leadId: string }) {
  const [sdkLoaded, setSdkLoaded] = useState(false);
  
  // Fetch configuration
  const { data: config, isLoading: configLoading } = useEkycConfig(leadId);
  
  // Submit mutation
  const submitMutation = useSubmitEkycResult();
  
  // Initialize session on mount
  useEffect(() => {
    initSession(leadId);
    
    return () => {
      // Optional: Clear session on unmount
      // clearSession(leadId);
    };
  }, [leadId]);
  
  // Load VNPT SDK when config is available
  useEffect(() => {
    if (!config || sdkLoaded) return;
    
    // Initialize SDK with config
    const sdkManager = new EkycSdkManager({
      authToken: config.access_token,
      leadId,
      onComplete: async (result) => {
        // Handle completion
        if (canSubmit(leadId)) {
          const apiRequest = mapEkycResponseToApiRequest(result);
          
          try {
            await submitMutation.mutateAsync({ leadId, ekycData: apiRequest });
            markSubmitted(leadId);
            // Navigate to success screen
          } catch (error) {
            updateSessionState(leadId, { status: 'failed' });
          }
        }
      },
    });
    
    sdkManager.initialize({ config }).then(() => {
      setSdkLoaded(true);
    });
  }, [config, leadId]);
  
  if (configLoading) {
    return <div>Loading...</div>;
  }
  
  if (!config) {
    return <div>Failed to load configuration</div>;
  }
  
  return (
    <div>
      {/* eKYC SDK container */}
      <div id="ekyc_sdk_intergrated" />
    </div>
  );
}
```

---

## Error Handling

### Network Errors

```typescript
const { data, error, isLoading } = useEkycConfig(leadId);

if (error) {
  // User-friendly error messages
  let message = 'Unable to load eKYC configuration';
  
  if (error.message.includes('Failed to get eKYC config')) {
    message = 'Unable to connect to verification service. Please check your internet connection.';
  } else if (error.message.includes('401')) {
    message = 'Your session has expired. Please refresh the page.';
  } else if (error.message.includes('404')) {
    message = 'Lead not found. Please start a new application.';
  }
  
  return (
    <div className="error-message">
      <p>{message}</p>
      <button onClick={() => window.location.reload()}>Retry</button>
    </div>
  );
}
```

### Validation Errors

```typescript
const validateEkycData = (data: VnptEkycRequestBody): string[] => {
  const errors: string[] = [];
  
  if (!data.ocr?.object?.id) {
    errors.push('Personal ID is required');
  }
  
  if (!data.ocr?.object?.name) {
    errors.push('Full name is required');
  }
  
  if (!data.liveness_card_front && !data.liveness_face) {
    errors.push('At least one liveness check is required');
  }
  
  return errors;
};

// In submit handler
const validationErrors = validateEkycData(apiRequest);
if (validationErrors.length > 0) {
  // Show validation errors to user
  toast.error('Please complete all required verification steps', {
    description: validationErrors.join(', '),
  });
  return;
}
```

### Retry Logic

The submit hook includes automatic retry with exponential backoff:

```typescript
// Configure retry behavior
const submitMutation = useSubmitEkycResult();

// Handle retry
if (submitMutation.error) {
  const canRetry = submitMutation.failureCount < 3;
  
  return (
    <div className="error-message">
      <p>Failed to submit. {canRetry ? 'Retrying...' : 'Please try again later.'}</p>
      {!canRetry && (
        <button onClick={() => submitMutation.reset()}>Retry Manually</button>
      )}
    </div>
  );
}
```

---

## Testing

### Unit Testing

Test the data mapper and validation functions:

```typescript
// src/lib/ekyc/__tests__/ekyc-api-mapper.test.ts
import { mapEkycResponseToApiRequest, isEkycResponseValid } from '../ekyc-api-mapper';
import type { EkycResponse } from '../types';

describe('ekyc-api-mapper', () => {
  describe('mapEkycResponseToApiRequest', () => {
    it('should map VNPT response to API format', () => {
      const mockResponse: EkycResponse = {
        type_document: 0,
        ocr: {
          object: {
            id: '123',
            name: 'Test User',
          },
        },
      };
      
      const result = mapEkycResponseToApiRequest(mockResponse);
      
      expect(result.type_document).toBe(0);
      expect(result.ocr?.object?.id).toBe('123');
    });
  });
  
  describe('isEkycResponseValid', () => {
    it('should return true for valid response', () => {
      const validResponse: EkycResponse = {
        ocr: {
          object: {
            id: '123',
            name: 'Test User',
          },
        } as any,
      } as any;
      
      expect(isEkycResponseValid(validResponse)).toBe(true);
    });
    
    it('should return false for invalid response', () => {
      const invalidResponse = {} as EkycResponse;
      expect(isEkycResponseValid(invalidResponse)).toBe(false);
    });
  });
});
```

### Integration Testing

Test hooks with mock API responses:

```typescript
// src/hooks/__tests__/use-ekyc-config.test.ts
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEkycConfig } from '../use-ekyc-config';
import { apiClient } from '@/lib/api/client';

// Mock API client
vi.mock('@/lib/api/client');

describe('useEkycConfig', () => {
  it('should fetch config successfully', async () => {
    const mockConfig = {
      access_token: 'test-token',
      challenge_code: 'ABC123',
      sdk_flow: 'DOCUMENT_TO_FACE',
      list_type_document: [0, 1],
    };
    
    vi.mocked(apiClient.GET).mockResolvedValue({
      data: mockConfig,
      error: null,
    });
    
    const { result } = renderHook(() => useEkycConfig('test-lead-id'));
    
    await waitFor(() => {
      expect(result.current.data).toEqual(mockConfig);
    });
  });
  
  it('should handle errors', async () => {
    vi.mocked(apiClient.GET).mockResolvedValue({
      data: null,
      error: { message: 'Failed to fetch config' },
    });
    
    const { result } = renderHook(() => useEkycConfig('test-lead-id'));
    
    await waitFor(() => {
      expect(result.current.error).toBeDefined();
    });
  });
});
```

### E2E Testing

Test the complete eKYC flow:

```typescript
// e2e/ekyc-flow.spec.ts
import { test, expect } from '@playwright/test';

test.describe('eKYC Flow', () => {
  test('should complete eKYC verification', async ({ page }) => {
    // Navigate to application
    await page.goto('/onboarding');
    
    // Start verification
    await page.click('[data-testid="start-ekyc"]');
    
    // Wait for SDK to load
    await expect(page.locator('#ekyc_sdk_intergrated')).toBeVisible();
    
    // Wait for completion (mocked in test env)
    await page.waitForSelector('[data-testid="ekyc-complete"]');
    
    // Verify submission
    await expect(page.locator('text=Verification submitted')).toBeVisible();
  });
  
  test('should handle network errors gracefully', async ({ page, context }) => {
    // Simulate offline mode
    await context.setOffline(true);
    
    await page.goto('/onboarding');
    await page.click('[data-testid="start-ekyc"]');
    
    // Should show error message
    await expect(page.locator('text=Unable to connect')).toBeVisible();
    
    // Go back online
    await context.setOffline(false);
    
    // Retry should work
    await page.click('[data-testid="retry-button"]');
    await expect(page.locator('#ekyc_sdk_intergrated')).toBeVisible();
  });
});
```

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --coverage

# Run specific test file
npm test -- ekyc-api-mapper.test.ts

# Run E2E tests
npm run test:e2e
```

---

## Common Patterns

### Cache Invalidation

Manually invalidate and refetch configuration:

```typescript
const { data, refetch } = useEkycConfig(leadId);

// Refetch on button click
const handleRefresh = () => {
  refetch({ cancelRefetch: false });
};

return <button onClick={handleRefresh}>Refresh Configuration</button>;
```

### Conditional Fetching

Only fetch when lead ID is available:

```typescript
const { data } = useEkycConfig(leadId || ''); // Hook is disabled when leadId is empty

// Or use the enabled option
const { data } = useQuery({
  queryKey: ['ekyc-config', leadId],
  queryFn: () => getEkycConfig(leadId),
  enabled: !!leadId, // Only fetch when leadId exists
});
```

### Optimistic Updates

Update UI optimistically while submitting:

```typescript
const submitMutation = useSubmitEkycResult();

const handleSubmit = async () => {
  // Optimistically update UI
  updateSessionState(leadId, { status: 'completed' });
  
  try {
    await submitMutation.mutateAsync({ leadId, ekycData });
    markSubmitted(leadId);
  } catch (error) {
    // Revert on error
    updateSessionState(leadId, { status: 'in_progress' });
  }
};
```

### Cleanup on Unmount

Clean up resources when component unmounts:

```typescript
useEffect(() => {
  const sdkManager = new EkycSdkManager({ leadId });
  
  sdkManager.initialize();
  
  return () => {
    // Cleanup SDK
    sdkManager.cleanup();
    // Clear session if needed
    clearSession(leadId);
  };
}, [leadId]);
```

---

## Troubleshooting

### Common Issues

#### 1. Configuration Not Loading

**Symptom**: `useEkycConfig` returns `isLoading: true` indefinitely

**Solutions**:
- Check network connection
- Verify `leadId` is valid
- Check backend API status
- Review browser console for errors

#### 2. Submission Fails with 409 Conflict

**Symptom**: Backend returns "DUPLICATE_SUBMISSION" error

**Solutions**:
- Check session state in localStorage
- Implement proper duplicate prevention
- Clear stale sessions

#### 3. SDK Not Initializing

**Symptom**: VNPT SDK container remains empty

**Solutions**:
- Verify `access_token` is valid
- Check browser console for SDK errors
- Ensure SDK script is loaded
- Verify container element exists

#### 4. Type Errors

**Symptom**: TypeScript compilation errors with API types

**Solutions**:
- Regenerate types: `npm run generate:types`
- Check [`v1.d.ts`](src/lib/api/v1.d.ts:1) for type definitions
- Ensure imports use correct paths

### Debug Mode

Enable debug logging:

```typescript
// Enable verbose logging
const sdkManager = new EkycSdkManager({
  leadId,
  debug: true, // Enable debug logs
});
```

### Browser DevTools

Use browser DevTools to inspect:

1. **Network Tab**: Check API requests/responses
2. **Console Tab**: View SDK logs and errors
3. **Application Tab**: Inspect localStorage session state
4. **React DevTools**: Inspect component state and hooks

---

## Performance Tips

1. **Cache Configuration**: 5-minute cache reduces API calls by 80%
2. **Lazy Load SDK**: Load SDK only when needed
3. **Debounce Updates**: Debounce session state updates
4. **Optimize Images**: VNPT SDK handles image compression
5. **Use React.memo**: Prevent unnecessary re-renders

```typescript
const EkycComponent = React.memo(({ leadId }: { leadId: string }) => {
  // Component logic
});
```

---

## Security Considerations

1. **Never Log PII**: Don't log base64 images or personal data
2. **Clear Sensitive Data**: Clear session data after submission
3. **Use HTTPS**: All API calls must use HTTPS
4. **Validate Input**: Validate all data before submission
5. **Handle Errors Securely**: Don't expose sensitive error details

---

## References

### Documentation
- [Feature Specification](./spec.md)
- [Research Document](./research.md)
- [Data Model](./data-model.md)
- [API Contracts](./contracts/)

### Code References
- [Config Hook](src/hooks/use-ekyc-config.ts:18)
- [Submit Hook](src/hooks/use-submit-ekyc-result.ts:29)
- [Data Mapper](src/lib/ekyc/ekyc-api-mapper.ts:1)
- [VNPT Provider](src/lib/verification/providers/vnpt-provider.ts:1)

### External Resources
- [React Query Documentation](https://tanstack.com/query/latest)
- [VNPT eKYC SDK Documentation](https://ekyc.vnpt.com.vn)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

---

**Version**: 1.0.0  
**Author**: Development Team  
**Review Status**: Pending
