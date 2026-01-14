# Configurable API Timeout System

Comprehensive timeout configuration system for API requests with automatic retry logic and user-friendly error handling.

## Features

- **Global Timeouts**: Default 30-second timeout for all API calls
- **Service-Specific Timeouts**: Configure different timeouts for different services (DOP, EKYC, Consent, Payment)
- **Endpoint-Specific Timeouts**: Fine-grained control for individual endpoints
- **Automatic Retry**: Exponential backoff retry logic for failed requests
- **User-Friendly Errors**: Localized error messages in English and Vietnamese
- **React Integration**: Seamless integration with React Query and the API client
- **Performance Optimized**: <1ms overhead per request, <10ms configuration parsing

## Installation

No additional dependencies required. The timeout system is built with:
- TypeScript 5.3+ (strict mode)
- Zustand 4.4+ (for state management)
- React Query (for query/mutation integration)

## Quick Start

### Basic Usage

```typescript
import { timeoutFetch, useTimeoutStore } from '@/lib/api/timeouts';

// The timeout system is automatically initialized in src/lib/api/client.ts
// All API calls will now have timeout support

// Example: Make a request with automatic timeout
try {
  const response = await timeoutFetch('/api/endpoint');
  const data = await response.json();
} catch (error) {
  if (error.name === 'TimeoutError') {
    console.log('Request timed out:', error.endpoint, error.timeout);
  }
}
```

### Configuration via Environment Variables

```bash
# Global timeout (30 seconds default)
NEXT_PUBLIC_API_TIMEOUT_GLOBAL=30000

# Service-specific timeouts
NEXT_PUBLIC_API_TIMEOUT_SERVICE_EKYC=60000
NEXT_PUBLIC_API_TIMEOUT_SERVICE_PAYMENT=45000

# Endpoint-specific timeouts
NEXT_PUBLIC_API_TIMEOUT_ENDPOINT_LEADS_SUBMIT_OTP=15000

# Retry configuration
NEXT_PUBLIC_API_MAX_RETRIES=3
NEXT_PUBLIC_API_RETRY_DELAY_MS=1000
```

## Architecture

### Timeout Resolution Cascade

The system uses a cascade logic to determine which timeout to apply:

```
1. Endpoint-specific timeout (highest priority)
2. Service-specific timeout
3. Global timeout
4. Hardcoded default (30000ms)
```

### Module Structure

```
src/lib/api/timeouts/
├── types.ts              # TypeScript type definitions
├── constants.ts          # Default values and constants
├── utils.ts              # Utility functions
├── config-parser.ts      # Environment variable parsing
├── config-validator.ts   # Configuration validation
├── timeout-store.ts      # Zustand store for state management
├── resolver.ts           # Timeout resolution engine
├── abort-timeout.ts      # AbortController integration
├── client-integration.ts # API client integration
├── endpoint-config.ts    # Default endpoint configurations
├── error-handler.ts      # Error handling and logging
├── retry-executor.ts     # Retry logic with exponential backoff
└── index.ts              # Public API exports
```

## API Reference

### Core Functions

#### `resolveTimeout(endpoint, config)`

Resolves the timeout for a specific endpoint using cascade logic.

```typescript
import { resolveTimeout } from '@/lib/api/timeouts';

const resolution = resolveTimeout('/ekyc/config', config);
// Returns: { timeout: 60000, source: 'service', serviceKey: 'EKYC', explicit: true }
```

#### `timeoutFetch(input, init, config)`

Fetch wrapper with timeout support.

```typescript
import { timeoutFetch } from '@/lib/api/timeouts';

const response = await timeoutFetch('/api/data', {
  method: 'POST',
  body: JSON.stringify(data)
});
```

#### `executeWithRetry(fn, options)`

Executes a function with automatic retry logic.

```typescript
import { executeWithRetry } from '@/lib/api/timeouts';

const result = await executeWithRetry(
  () => fetch('/api/data').then(r => r.json()),
  { maxAttempts: 3, initialDelay: 1000 }
);

if (result.success) {
  console.log(result.data);
} else {
  console.error('Failed after', result.attempts, 'attempts');
}
```

### React Hooks

#### `useTimeoutError(options)`

Hook for managing timeout errors in components.

```typescript
import { useTimeoutError } from '@/lib/api/timeouts';

function MyComponent() {
  const { error, canRetry, retry, clearError, setError } = useTimeoutError({
    locale: 'en',
    maxRetries: 3,
    onRetry: async () => {
      await fetchData();
    }
  });

  const handleSubmit = async () => {
    try {
      clearError();
      await submitData();
    } catch (err) {
      setError(err);
    }
  };

  return (
    <div>
      {error && (
        <TimeoutErrorMessage
          error={error}
          onRetry={canRetry ? retry : undefined}
          onDismiss={clearError}
        />
      )}
      <button onClick={handleSubmit}>Submit</button>
    </div>
  );
}
```

### Components

#### `<TimeoutErrorMessage />`

Displays user-friendly timeout error messages.

```typescript
import { TimeoutErrorMessage } from '@/components/errors/TimeoutErrorMessage';

<TimeoutErrorMessage
  error={timeoutError}
  locale="en"
  onRetry={() => retryRequest()}
  onDismiss={() => setError(null)}
  showDetails={true}
/>
```

**Variants:**

- `TimeoutErrorMessage.Simple` - Simple message without actions
- `TimeoutErrorMessage.Inline` - Compact inline message

## Default Timeouts

### Service Defaults

| Service | Timeout | Use Case |
|---------|---------|----------|
| DOP | 30s | Standard operations |
| EKYC | 60s | Document upload and processing |
| CONSENT | 20s | Consent management |
| PAYMENT | 45s | Payment gateway calls |
| AUTH | 15s | Authentication |
| LEADS | 25s | Lead generation |

### Endpoint Defaults

| Endpoint | Timeout | Use Case |
|----------|---------|----------|
| LEADS_SUBMIT_OTP | 15s | OTP submission |
| EKYC_SUBMIT | 120s | Document upload |
| EKYC_CONFIG | 20s | Configuration fetch |
| EKYC_STREAM | 600s | SSE/streaming |
| EXPORT_DATA | 300s | Data export |

## Error Handling

### Timeout Error Structure

```typescript
interface TimeoutError extends Error {
  type: 'API_TIMEOUT' | 'USER_CANCEL';
  endpoint: string;
  timeoutDuration: number;
  elapsedTime: number;
  retryCount: number;
  method: string;
  requestId?: string;
  sessionId?: string;
  timestamp: string;
}
```

### Error Detection

```typescript
import { 
  isTimeoutError, 
  isRetryableTimeoutError,
  formatErrorDetails 
} from '@/lib/api/timeouts';

if (isTimeoutError(error)) {
  console.log('Timeout detected:', error.endpoint);
  
  if (isRetryableTimeoutError(error)) {
    // Show retry button
  }
  
  const details = formatErrorDetails(error, 'en');
  console.log(details.title, details.message);
}
```

## Retry Strategy

The retry system uses exponential backoff with the following default configuration:

```typescript
{
  maxAttempts: 3,
  initialDelay: 1000,    // 1 second
  backoffMultiplier: 2,   // Double each retry
  maxDelay: 10000,        // Cap at 10 seconds
  useJitter: false        // No random variance
}
```

**Retry Delays:**
- Attempt 1: 1000ms
- Attempt 2: 2000ms
- Attempt 3: 4000ms

**Total time:** 7000ms (7 seconds)

## Performance

### Benchmarks

- **Timeout resolution:** <1ms
- **Configuration parsing:** <10ms
- **Request overhead:** <1ms per request
- **Memory footprint:** ~2KB for config store

### Optimization Tips

1. **Use service timeouts** when multiple endpoints share the same timeout
2. **Avoid endpoint-specific timeouts** unless necessary (adds lookup overhead)
3. **Keep retry counts low** (3 or less) to avoid long wait times
4. **Use proper error handling** to prevent unnecessary retries

## Migration Guide

### From Hardcoded Timeouts

**Before:**
```typescript
const response = await fetch('/api/data', {
  signal: AbortSignal.timeout(30000)
});
```

**After:**
```typescript
// Timeout is automatically applied
const response = await fetch('/api/data');

// Or use timeoutFetch for explicit control
import { timeoutFetch } from '@/lib/api/timeouts';
const response = await timeoutFetch('/api/data');
```

### From Custom Retry Logic

**Before:**
```typescript
let lastError;
for (let i = 0; i < 3; i++) {
  try {
    return await fetchData();
  } catch (error) {
    lastError = error;
    await new Promise(r => setTimeout(r, 1000 * (2 ** i)));
  }
}
throw lastError;
```

**After:**
```typescript
import { executeWithRetry } from '@/lib/api/timeouts';

const result = await executeWithRetry(fetchData, {
  maxAttempts: 3,
  initialDelay: 1000
});

if (!result.success) {
  throw result.error;
}
```

## Testing

### Unit Tests

```typescript
import { resolveTimeout, parseTimeoutConfig } from '@/lib/api/timeouts';

describe('Timeout System', () => {
  it('should resolve timeout for endpoint', () => {
    const config = parseTimeoutConfig();
    const resolution = resolveTimeout('/ekyc/config', config);
    
    expect(resolution.timeout).toBe(60000);
    expect(resolution.source).toBe('service');
  });
});
```

### Integration Tests

See [`tests/__tests__/timeouts/timeout-integration.test.ts`](../../../../tests/__tests__/timeouts/timeout-integration.test.ts) for comprehensive integration tests.

## Troubleshooting

### Timeouts Too Short

If you're seeing frequent timeouts:

1. Check the endpoint/service timeout configuration
2. Verify network conditions
3. Consider using endpoint-specific timeout for long operations
4. Check for server-side performance issues

```bash
# Increase timeout for a specific service
NEXT_PUBLIC_API_TIMEOUT_SERVICE_EKYC=120000
```

### Retries Not Working

If retries aren't triggering:

1. Ensure the error is a timeout error (not user cancellation)
2. Check retry count limits
3. Verify the error is retryable

```typescript
import { isRetryableTimeoutError } from '@/lib/api/timeouts';

if (isRetryableTimeoutError(error)) {
  // This error will trigger retry
} else {
  // User cancellation - no retry
}
```

### Configuration Not Loading

If environment variables aren't being read:

1. Ensure variables start with `NEXT_PUBLIC_`
2. Check variable names match the expected format
3. Restart the development server after adding new variables

```bash
# Correct format
NEXT_PUBLIC_API_TIMEOUT_GLOBAL=30000

# Incorrect (missing NEXT_PUBLIC_ prefix)
API_TIMEOUT_GLOBAL=30000
```

## Best Practices

1. **Use defaults** when possible - they're tuned for most use cases
2. **Service-level configuration** is preferred over endpoint-level
3. **Log timeout events** for monitoring and debugging
4. **Provide user feedback** when timeouts occur
5. **Test timeout scenarios** in development

## License

MIT

## Contributing

See project contribution guidelines.
