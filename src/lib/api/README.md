# API Client Module

**Last Updated:** 2026-01-20

## Overview

The API client module provides a centralized, type-safe HTTP client for all backend communication. It includes automatic retry logic, configurable timeouts, authentication handling, and response interceptors.

## Architecture

```
src/lib/api/
├── client.ts           # Base client with interceptors
├── config.ts           # Auth configuration (skip-auth patterns)
├── v1.d.ts            # Generated TypeScript types (DO NOT EDIT)
├── schema.yaml        # OpenAPI specification
├── timeouts/          # Per-endpoint timeout configurations
│   ├── config-parser.ts
│   ├── resolver.ts
│   ├── abort-timeout.ts
│   ├── timeout-store.ts
│   ├── constants.ts
│   └── README.md
├── endpoints/         # API endpoint definitions
└── tools.md           # Developer tools & utilities
```

## Core Components

### client.ts

The main API client built on `openapi-fetch` with:

- **Request Interceptor**: Adds auth headers, CSRF tokens, timeout signals
- **Response Interceptor**: Handles 401 errors, token refresh, rate limiting
- **Retry Logic**: Exponential backoff for failed requests
- **Timeout Management**: Per-endpoint configurable timeouts

### config.ts

Authentication configuration for endpoints that should skip auth token handling:

```typescript
export const apiConfig: ApiConfig = {
  skipAuthEndpoints: {
    patterns: [
      "/leads/*",  // Lead flow APIs use leadToken, not authToken
    ],
  },
};
```

**Usage:**
```typescript
import { shouldSkipAuth } from "./config";

const skipAuth = shouldSkipAuth("/leads/123/submit-otp"); // true
const skipAuth = shouldSkipAuth("/users/profile");        // false
```

## Authentication Flow

### Two Token Systems

This application uses **two separate token systems**:

| System | Storage | Usage | Refresh |
|--------|---------|-------|---------|
| `authToken` | `useTokenStore` (sessionStorage) | User authentication (admin, protected routes) | Auto-refresh via `/api/auth/refresh` |
| `leadToken` | Component state (props) | Lead flow (loan applications) | N/A - one-time use |

### Token Confusion Issue

**Problem:** Both systems return JWT tokens, but the API client interceptor was treating all 401 errors as auth token failures.

**Solution:** Config-driven approach to skip auth handling for specific endpoints:

```typescript
// client.ts - Response Interceptor
const skipAuth = shouldSkipAuth(res.request.url);

if (res.response.status === 401 && !skipAuth && !res.request.url.includes("/refresh")) {
  // Handle auth token refresh
  await refreshTokens();
} else if (res.response.status === 401 && skipAuth) {
  // Log warning, don't redirect
  console.warn("Lead API returned 401...");
}
```

## Adding New Skip-Auth Endpoints

To add an endpoint that uses its own token system (not authToken):

1. **Edit `config.ts`:**

```typescript
export const apiConfig: ApiConfig = {
  skipAuthEndpoints: {
    patterns: [
      "/leads/*",
      "/new-flow/*",        // Add new pattern
      "/another-api/*",     // Add more as needed
    ],
  },
};
```

2. **Pattern Matching:**
   - `*` matches any characters
   - `/api/*` matches `/api/users`, `/api/products`, etc.
   - Exact match: `/specific-endpoint` (no wildcard)

3. **No Code Changes Needed:** The interceptor automatically reads from config.

## Timeout Configuration

Per-endpoint timeout overrides are managed in `timeouts/`:

| Config File | Purpose |
|-------------|---------|
| `config-parser.ts` | Parse timeout config |
| `resolver.ts` | Resolve timeout for endpoint |
| `abort-timeout.ts` | Create AbortController with timeout |
| `timeout-store.ts` | Zustand store for timeout config |
| `constants.ts` | Default timeout values |

**Default Timeouts:**
- Standard API: 30 seconds
- File uploads: 2-10 minutes
- Retry attempts: 3 max
- Backoff: 3s → 6s → 10s (with jitter)

### Adding Custom Timeout

Create `timeouts/custom.json` or override in environment variables. See `timeouts/README.md` for details.

## Retry Logic

The client implements automatic retry with exponential backoff:

```typescript
// client.ts
const withRetry = async <T>(
  apiCall: () => Promise<T>,
  maxRetries = 3,
  delay = 3000  // 3 seconds
): Promise<T> => {
  for (let i = 0; i <= maxRetries; i++) {
    try {
      return await apiCall();
    } catch (error) {
      if (error.name === "TimeoutError" || error.message.includes("Auth failed")) {
        throw error;  // Don't retry
      }
      if (i === maxRetries) throw error;
      // Exponential backoff
      await new Promise(r => setTimeout(r, delay * Math.pow(2, i)));
    }
  }
};
```

**Not Retried:**
- `TimeoutError` - Already timed out
- `Authentication failed` - Token issue, not network

## Error Handling

### HTTP Status Handling

| Status | Behavior |
|--------|----------|
| 200-299 | Success, return data |
| 401 | Check skip-auth config → refresh auth token or log warning |
| 429 | Show rate limit toast, throw error |
| 500+ | Show server error toast, log to monitoring |

### Custom Error Types

```typescript
interface TimeoutError extends Error {
  name: "TimeoutError";
  code: "TIMEOUT";
  endpoint: string;
  timeout: number;
}
```

## Making API Calls

### Basic Usage

```typescript
import apiClient from "@/lib/api/client";

// GET request
const { data, error } = await apiClient.GET("/users/{id}", {
  params: { path: { id: userId } }
});

// POST request
const { data, error } = await apiClient.POST("/leads", {
  body: { phone_number: "0901234567", ... }
});
```

### With Timeout

```typescript
import { withRetry } from "@/lib/api/client";

const result = await withRetry(
  () => apiClient.GET("/leads/{id}", { params: { path: { id } } }),
  3  // 3 retries
);
```

## Best Practices

1. **DO NOT** modify `v1.d.ts` directly; regenerate from `schema.yaml`
2. **DO** use `shouldSkipAuth()` for custom auth handling
3. **DO** configure timeouts in `timeouts/` for long-running operations
4. **DO NOT** hardcode endpoint URLs; use OpenAPI types
5. **DO** handle errors at the component level when possible
6. **DO NOT** swallow 401 errors in skip-auth endpoints without logging

## Commands

```bash
# Regenerate types from OpenAPI schema
pnpm gen:api

# View API documentation
open src/lib/api/tools.md
```

## Troubleshooting

### 401 Redirect to Login

**Cause:** Auth token expired and refresh failed.

**Solutions:**
1. User must log in again (admin routes)
2. Check if endpoint should be in `skipAuthEndpoints` patterns
3. Verify backend is returning correct token type

### Timeout Errors

**Cause:** Request took too long.

**Solutions:**
1. Add custom timeout in `timeouts/` directory
2. Increase `DEFAULT_RETRY.MAX_DELAY` in `constants.ts`
3. Consider pagination for large datasets

### Lead Token 401

**Cause:** Backend rejected lead token.

**Solutions:**
1. Check lead token expiry in JWT payload
2. Verify backend `/leads` API is working correctly
3. This is expected behavior - handle at component level
