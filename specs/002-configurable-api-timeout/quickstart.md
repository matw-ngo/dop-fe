# Quickstart Guide: Configurable API Timeout

**Feature**: 002-configurable-api-timeout  
**Created**: 2026-01-13  
**Audience**: Developers implementing the timeout feature

---

## Overview

This guide helps you quickly implement and use the configurable API timeout system. The system provides global, service-specific, and endpoint-specific timeout configuration via environment variables.

---

## Table of Contents

1. [Basic Setup](#basic-setup)
2. [Environment Configuration](#environment-configuration)
3. [Usage in React Queries](#usage-in-react-queries)
4. [Usage in React Mutations](#usage-in-react-mutations)
5. [Testing Timeout Behavior](#testing-timeout-behavior)
6. [Common Patterns](#common-patterns)
7. [Troubleshooting](#troubleshooting)

---

## Basic Setup

### 1. Default Configuration (Zero Config)

The timeout system works out of the box with default values:

```typescript
// No configuration needed - defaults are automatically applied
// All API calls will timeout after 30 seconds with 3 retries
```

**Defaults**:
- Global timeout: 30 seconds
- Max retries: 3 attempts
- Retry delay: 1 second (with exponential backoff)

### 2. Environment Variables Setup

Add timeout configuration to your `.env` files:

```bash
# .env.production
NEXT_PUBLIC_API_TIMEOUT_GLOBAL=30000
NEXT_PUBLIC_API_MAX_RETRIES=3

# .env.development
NEXT_PUBLIC_API_TIMEOUT_GLOBAL=60000  # Longer for debugging
NEXT_PUBLIC_API_MAX_RETRIES=5
```

---

## Environment Configuration

### Global Timeout

Set a default timeout for all API calls:

```bash
# .env
NEXT_PUBLIC_API_TIMEOUT_GLOBAL=30000  # 30 seconds
```

### Service-Specific Timeouts

Configure different timeouts for different services:

```bash
# .env
# DOP service - fast responses
NEXT_PUBLIC_API_TIMEOUT_SERVICE_DOP=15000  # 15 seconds

# eKYC service - slower operations
NEXT_PUBLIC_API_TIMEOUT_SERVICE_EKYC=60000  # 60 seconds

# Consent service
NEXT_PUBLIC_API_TIMEOUT_SERVICE_CONSENT=20000  # 20 seconds
```

### Endpoint-Specific Timeouts

Configure timeouts for specific endpoints:

```bash
# .env
# Quick OTP submission
NEXT_PUBLIC_API_TIMEOUT_ENDPOINT_LEADS_SUBMIT_OTP=10000  # 10 seconds

# eKYC configuration
NEXT_PUBLIC_API_TIMEOUT_ENDPOINT_EKYC_CONFIG=15000  # 15 seconds

# File upload endpoint (longer timeout)
NEXT_PUBLIC_API_TIMEOUT_ENDPOINT_EKYC_SUBMIT=120000  # 120 seconds
```

### Retry Configuration

```bash
# .env
NEXT_PUBLIC_API_MAX_RETRIES=3
NEXT_PUBLIC_API_RETRY_DELAY_MS=1000
```

---

## Usage in React Queries

### Basic Query (Uses Default Timeout)

```typescript
import { useQuery } from '@tanstack/react-query';

function useUserData(userId: string) {
  return useQuery({
    queryKey: ['user', userId],
    queryFn: () => apiClient.GET('/users/{userId}', {
      params: { path: { userId } }
    }),
    // Timeout automatically applied from configuration
  });
}
```

### Query with Custom Timeout

```typescript
function useUserData(userId: string) {
  return useQuery({
    queryKey: ['user', userId],
    queryFn: () => apiClient.GET('/users/{userId}', {
      params: { path: { userId } }
    }),
    timeout: 15000,  // Override: 15 seconds
  });
}
```

### Query with Retry Disabled

```typescript
function useRealtimeData() {
  return useQuery({
    queryKey: ['realtime'],
    queryFn: () => apiClient.GET('/realtime'),
    disableRetry: true,  // Don't retry on timeout
  });
}
```

### Query with Custom Retry Strategy

```typescript
function useCriticalData() {
  return useQuery({
    queryKey: ['critical'],
    queryFn: () => apiClient.GET('/critical'),
    retryStrategy: {
      maxAttempts: 5,
      initialDelay: 2000,
      backoffMultiplier: 2,
    },
  });
}
```

---

## Usage in React Mutations

### Basic Mutation (Uses Default Timeout)

```typescript
import { useMutation } from '@tanstack/react-query';

function useSubmitOTP() {
  return useMutation({
    mutationFn: (data: { leadId: string; otp: string }) =>
      apiClient.POST('/leads/{leadId}/submit-otp', {
        params: { path: { leadId: data.leadId } },
        body: data,
      }),
    // Timeout automatically applied from configuration
  });
}
```

### Mutation with Custom Timeout

```typescript
function useSubmitOTP() {
  return useMutation({
    mutationFn: (data: { leadId: string; otp: string }) =>
      apiClient.POST('/leads/{leadId}/submit-otp', {
        params: { path: { leadId: data.leadId } },
        body: data,
      }),
    timeout: 10000,  // 10 seconds for OTP submission
  });
}
```

### Mutation with Error Handling

```typescript
function useSubmitOTP() {
  return useMutation({
    mutationFn: (data) => apiClient.POST('/leads/{leadId}/submit-otp', {
      params: { path: { leadId: data.leadId } },
      body: data,
    }),
    onError: (error) => {
      if (isTimeoutError(error)) {
        // Handle timeout specifically
        toast.error('Request timed out. Please try again.');
      }
    },
  });
}
```

---

## Testing Timeout Behavior

### Unit Test: Timeout Configuration

```typescript
import { getTimeoutConfig } from '@/lib/api/timeout-config';

describe('Timeout Configuration', () => {
  it('should use default timeout when no env vars set', () => {
    const config = getTimeoutConfig();
    expect(config.global).toBe(30000);
    expect(config.maxRetries).toBe(3);
  });

  it('should parse service-specific timeouts', () => {
    process.env.NEXT_PUBLIC_API_TIMEOUT_SERVICE_EKYC = '60000';
    const config = getTimeoutConfig();
    expect(config.services?.EKYC).toBe(60000);
  });

  it('should validate timeout values', () => {
    process.env.NEXT_PUBLIC_API_TIMEOUT_GLOBAL = '-1000';
    expect(() => getTimeoutConfig()).toThrow('Invalid timeout configuration');
  });
});
```

### Integration Test: Timeout Behavior

```typescript
import { renderHook, waitFor } from '@testing-library/react';
import { useQuery } from '@tanstack/react-query';

describe('Timeout Behavior', () => {
  it('should timeout after configured duration', async () => {
    const { result } = renderHook(() =>
      useQuery({
        queryKey: ['test'],
        queryFn: async () => {
          // Simulate slow API
          await new Promise(resolve => setTimeout(resolve, 40000));
          return { data: 'success' };
        },
        timeout: 5000,  // 5 seconds
      })
    );

    await waitFor(() => {
      expect(result.current.error).toBeDefined();
      expect(isTimeoutError(result.current.error)).toBe(true);
    });
  });

  it('should retry on timeout', async () => {
    let attempts = 0;
    const { result } = renderHook(() =>
      useQuery({
        queryKey: ['test-retry'],
        queryFn: async () => {
          attempts++;
          if (attempts < 3) {
            await new Promise(resolve => setTimeout(resolve, 20000));
            throw new Error('Timeout');
          }
          return { data: 'success' };
        },
        retryStrategy: { maxAttempts: 3, initialDelay: 100 },
      })
    );

    await waitFor(() => {
      expect(result.current.data).toEqual({ data: 'success' });
      expect(attempts).toBe(3);
    });
  });
});
```

### Mocking Timeouts in Tests

```typescript
import { vi } from 'vitest';

describe('Mock Timeouts', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should handle timeout with fake timers', async () => {
    const queryFn = vi.fn().mockResolvedValue({ data: 'success' });
    
    const { result } = renderHook(() =>
      useQuery({
        queryKey: ['test'],
        queryFn,
        timeout: 5000,
      })
    );

    // Fast forward past timeout
    vi.advanceTimersByTime(6000);

    await waitFor(() => {
      expect(result.current.error).toBeDefined();
    });
  });
});
```

---

## Common Patterns

### Pattern 1: Quick UI Operations

```typescript
// Fast operations that should timeout quickly
function useQuickActions() {
  return useMutation({
    mutationFn: (data) => apiClient.POST('/quick-action', { body: data }),
    timeout: 5000,  // 5 seconds - fail fast
    disableRetry: true,  // Don't retry quick operations
  });
}
```

### Pattern 2: Slow Operations

```typescript
// Operations that take longer (eKYC, file uploads)
function useEKYCSubmit() {
  return useMutation({
    mutationFn: (data) => apiClient.POST('/ekyc/submit', { body: data }),
    timeout: 120000,  // 2 minutes - plenty of time
    retryStrategy: {
      maxAttempts: 2,  // Fewer retries for slow operations
      initialDelay: 2000,
    },
  });
}
```

### Pattern 3: Streaming Endpoints

```typescript
// Long-running streaming endpoints
function useStreamData() {
  return useQuery({
    queryKey: ['stream'],
    queryFn: () => apiClient.GET('/stream'),
    timeout: 300000,  // 5 minutes - very long timeout
    disableRetry: true,  // Don't retry streaming
  });
}
```

### Pattern 4: Conditional Timeout

```typescript
function useConditionalTimeout(isSlow: boolean) {
  return useQuery({
    queryKey: ['conditional'],
    queryFn: () => apiClient.GET('/endpoint'),
    timeout: isSlow ? 60000 : 15000,  // Conditional timeout
  });
}
```

---

## Troubleshooting

### Issue: Application Won't Start

**Symptom**: Application fails with "Invalid timeout configuration" error.

**Solution**: Check your environment variables:
```bash
# Invalid values
NEXT_PUBLIC_API_TIMEOUT_GLOBAL=abc      # Not a number
NEXT_PUBLIC_API_TIMEOUT_GLOBAL=-1000    # Negative
NEXT_PUBLIC_API_TIMEOUT_GLOBAL=0        # Zero

# Valid values
NEXT_PUBLIC_API_TIMEOUT_GLOBAL=30000    # Positive integer
```

### Issue: Timeouts Not Working

**Symptom**: Requests hang indefinitely despite timeout configuration.

**Solutions**:
1. Check that environment variables have `NEXT_PUBLIC_` prefix:
   ```bash
   # Wrong
   API_TIMEOUT_GLOBAL=30000
   
   # Right
   NEXT_PUBLIC_API_TIMEOUT_GLOBAL=30000
   ```

2. Restart development server after changing environment variables

3. Check browser console for validation errors

### Issue: All Requests Timing Out

**Symptom**: Every request times out immediately.

**Solution**: Your global timeout might be too short:
```bash
# Too short for most operations
NEXT_PUBLIC_API_TIMEOUT_GLOBAL=1000  # 1 second

# Better
NEXT_PUBLIC_API_TIMEOUT_GLOBAL=30000  # 30 seconds
```

### Issue: Retry Not Working

**Symptom**: Requests fail immediately without retry.

**Solutions**:
1. Check that retry is enabled:
   ```bash
   NEXT_PUBLIC_API_MAX_RETRIES=3  # Must be > 0
   ```

2. Verify error is retryable (only `API_TIMEOUT` retries, not `USER_CANCEL`)

3. Check if retry is disabled for specific query/mutation:
   ```typescript
   // Remove this to enable retries
   disableRetry: true
   ```

### Issue: Streaming Endpoints Failing

**Symptom**: Streaming connections disconnect after 30 seconds.

**Solution**: Add explicit timeout for streaming endpoints:
```bash
NEXT_PUBLIC_API_TIMEOUT_ENDPOINT_EKYC_STREAM=300000  # 5 minutes
```

---

## Migration Guide

### From No Timeout to Timeout

**Before**:
```typescript
const { data } = useQuery({
  queryKey: ['users'],
  queryFn: () => apiClient.GET('/users'),
});
```

**After** (no changes needed - timeout is automatic):
```typescript
const { data } = useQuery({
  queryKey: ['users'],
  queryFn: () => apiClient.GET('/users'),
  // Timeout automatically applied
});
```

### From Custom Timeout Wrapper

**Before**:
```typescript
const withTimeout = (promise, ms) => {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Timeout')), ms)
    ),
  ]);
};

const { data } = useQuery({
  queryKey: ['users'],
  queryFn: () => withTimeout(apiClient.GET('/users'), 5000),
});
```

**After** (built-in timeout):
```typescript
const { data } = useQuery({
  queryKey: ['users'],
  queryFn: () => apiClient.GET('/users'),
  timeout: 5000,
});
```

---

## Best Practices

### 1. Start with Defaults

Use default timeouts first, then add specific overrides as needed:

```bash
# Start here
NEXT_PUBLIC_API_TIMEOUT_GLOBAL=30000

# Add specific overrides only when needed
NEXT_PUBLIC_API_TIMEOUT_SERVICE_EKYC=60000
NEXT_PUBLIC_API_TIMEOUT_ENDPOINT_LEADS_SUBMIT_OTP=10000
```

### 2. Configure by Environment

Use different timeouts for development and production:

```bash
# .env.development - longer for debugging
NEXT_PUBLIC_API_TIMEOUT_GLOBAL=60000
NEXT_PUBLIC_API_MAX_RETRIES=5

# .env.production - shorter for better UX
NEXT_PUBLIC_API_TIMEOUT_GLOBAL=30000
NEXT_PUBLIC_API_MAX_RETRIES=3
```

### 3. Monitor Timeout Rates

Track timeout rates in production to identify problematic endpoints:

```typescript
import { logTimeoutEvent } from '@/lib/api/timeout-logger';

// Automatic logging is built-in
// Review logs for patterns like:
// - High timeout rates on specific endpoints
// - Consistent timeouts across all requests (network issue)
// - Timeout rate increases during peak hours
```

### 4. Test Timeouts

Test your timeout handling with intentional delays:

```typescript
// Test endpoint that simulates timeout
app.get('/test/timeout', (req, res) => {
  setTimeout(() => res.json({ success: true }), 35000);
});

// Your app should timeout after 30s and show error
```

---

## Quick Reference

### Environment Variables

| Variable | Default | Range | Description |
|----------|---------|-------|-------------|
| `NEXT_PUBLIC_API_TIMEOUT_GLOBAL` | 30000 | 1000-600000 | Global timeout in ms |
| `NEXT_PUBLIC_API_TIMEOUT_SERVICE_<name>` | undefined | 1000-600000 | Service timeout in ms |
| `NEXT_PUBLIC_API_TIMEOUT_ENDPOINT_<path>` | undefined | 1000-600000 | Endpoint timeout in ms |
| `NEXT_PUBLIC_API_MAX_RETRIES` | 3 | 0-10 | Maximum retry attempts |
| `NEXT_PUBLIC_API_RETRY_DELAY_MS` | 1000 | 100-30000 | Initial retry delay in ms |

### Query Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `timeout` | number | from config | Override timeout in ms |
| `disableRetry` | boolean | false | Disable retry for this query |
| `retryStrategy` | object | from config | Custom retry configuration |

### Error Types

| Type | Message | Retry? |
|------|---------|--------|
| `API_TIMEOUT` | "Request took too long" | Yes |
| `USER_CANCEL` | "Request was cancelled" | No |

---

## Next Steps

1. **Review the spec**: [`spec.md`](spec.md) for full requirements
2. **Check data model**: [`data-model.md`](data-model.md) for type definitions
3. **See contracts**: [`contracts/timeout-contracts.md`](contracts/timeout-contracts.md) for API contracts
4. **Read research**: [`research.md`](research.md) for technical decisions

---

**Need Help?**

- Check the [Troubleshooting](#troubleshooting) section above
- Review the full [specification](spec.md)
- Examine the [data model](data-model.md) for type definitions
- See [contracts](contracts/timeout-contracts.md) for implementation details

---

**Version**: 1.0  
**Last Updated**: 2026-01-13  
**Status**: Ready for Implementation
