# Test Infrastructure Documentation

## Overview

This document describes the test infrastructure for the DOP Frontend project, including test frameworks, mocking strategies, and known limitations.

## Test Frameworks

### Vitest (Unit & Integration Tests)

**Version**: 3.2.4  
**Configuration**: `vitest.config.ts`  
**Setup**: `vitest.setup.ts`

**Available Scripts**:
```bash
npm run test              # Run tests in watch mode
npm run test:ui           # Run tests with UI
npm run test:coverage     # Run tests with coverage report
npm run test:run          # Run tests once (CI mode)
```

**Coverage Configuration**:
- Target: 60-70% statement coverage
- Tool: @vitest/coverage-v8
- Thresholds configured in vitest.config.ts

### Playwright (E2E Tests)

**Version**: 1.57.0  
**Configuration**: `playwright.config.ts`

**Available Scripts**:
```bash
npm run test:e2e          # Run E2E tests
npm run test:e2e:ui       # Run E2E tests with UI
npm run test:e2e:debug    # Debug E2E tests
npm run test:e2e:codegen  # Generate E2E test code
```

## Mocking Strategies

### MSW (Mock Service Worker)

**Status**: Disabled globally, available per-test  
**Version**: 2.12.4  
**Reason**: Global MSW setup caused test hangs due to browser/Node.js environment mismatch

#### Per-Test MSW Setup Pattern

For tests that need API mocking, use this pattern:

```typescript
// Example: src/__tests__/api/consent.test.ts
import { setupServer } from 'msw/node'
import { beforeAll, afterEach, afterAll } from 'vitest'
import { consentHandlers } from '../msw/handlers/consent'

const server = setupServer(...consentHandlers)

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }))
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

describe('Consent API', () => {
  it('should create consent', async () => {
    // Test code here
  })
})
```

**Available Handlers**:
- `src/__tests__/msw/handlers/consent.ts` - Consent API handlers
- `src/__tests__/msw/handlers/dop.ts` - DOP API handlers

**Working Example**: See `src/__tests__/setup/global-setup.ts` for eKYC-specific MSW setup

### Zustand Store Mocking

**Utility**: `src/test/utils/store-mocks.ts`

#### Full-Featured Mock (with state management)

```typescript
import { createStoreMock } from '@/test/utils/store-mocks'
import type { LoanSearchStore } from '@/store/loan-search-store'

const mockStore = createStoreMock<LoanSearchStore>({
  result: null,
  forwardStatus: null,
  error: null,
  setResult: vi.fn(),
  setForwardStatus: vi.fn(),
  setError: vi.fn(),
  reset: vi.fn()
})

vi.mock('@/store/loan-search-store', () => ({
  useLoanSearchStore: mockStore.mock
}))

// In tests, you can update state:
mockStore.setState({ result: { products: [...] } })
```

#### Simple Mock (static state)

```typescript
import { createSimpleStoreMock } from '@/test/utils/store-mocks'
import type { LoanSearchStore } from '@/store/loan-search-store'

const mockStore = createSimpleStoreMock<LoanSearchStore>({
  result: null,
  forwardStatus: null,
  error: null,
  setResult: vi.fn(),
  setForwardStatus: vi.fn(),
  setError: vi.fn(),
  reset: vi.fn()
})

vi.mock('@/store/loan-search-store', () => ({
  useLoanSearchStore: mockStore
}))
```

**Pattern**: Use Vitest's `vi.mock()` API, not global MSW setup

## Real API Access

### Staging API

**Base URL**: `https://dop-stg.datanest.vn/`  
**Status**: ❌ Not accessible from local development  
**Reason**: Resolves to private IP (10.20.0.240), requires VPN or internal network access

**Test Command**:
```bash
curl --max-time 5 -X GET "https://dop-stg.datanest.vn/flows/11111111-1111-1111-1111-111111111111" \
  -H "Accept: application/json"
```

**Result**: Connection timeout

### Mock API (Default)

**Configuration**: `.env.local`
```bash
NEXT_PUBLIC_USE_MOCK_API="true"
NEXT_PUBLIC_USE_FLOW_MOCK="true"
```

**Handlers**: MSW handlers in `src/__tests__/msw/handlers/` provide realistic responses

### Toggling Mock/Real API

The application supports toggling between mock and real API via UI (MSW enable/disable toggle).

## Known Limitations

1. **Real API Access**: Staging API requires VPN connection or deployment to staging/production environment
2. **MSW Global Setup**: Disabled to prevent test hangs; use per-test setup instead
3. **Service Worker**: Not available in Vitest (Node.js environment); use `setupServer` from `msw/node`

## Test Organization

### Directory Structure

```
src/
├── __tests__/
│   ├── msw/
│   │   └── handlers/          # MSW request handlers
│   ├── setup/
│   │   └── global-setup.ts    # Example MSW setup
│   └── utils/
│       └── msw-test-setup.ts  # Reusable MSW helper
├── test/
│   └── utils/
│       ├── store-mocks.ts     # Zustand store mocking utilities
│       └── __tests__/
│           └── store-mocks.test.ts
└── hooks/features/lead/
    └── __tests__/             # Hook unit tests
```

### Test Types

1. **Unit Tests**: Individual functions, hooks, utilities
   - Location: `src/**/__tests__/*.test.ts`
   - Pattern: Test one unit in isolation
   - Mocking: Use `vi.mock()` for dependencies

2. **Integration Tests**: Multiple components/hooks working together
   - Location: `src/components/**/__tests__/*.integration.test.tsx`
   - Pattern: Test data flow between components
   - Mocking: Use MSW for API, store mocks for state

3. **E2E Tests**: Complete user flows
   - Location: `e2e/*.spec.ts`
   - Pattern: Test from user perspective
   - Mocking: Minimal (prefer real API when available)

## Best Practices

### Unit Tests

- ✅ Test one unit in isolation
- ✅ Mock all external dependencies
- ✅ Use descriptive test names
- ✅ Aim for 80%+ coverage per file
- ❌ Don't test implementation details
- ❌ Don't test third-party libraries

### Integration Tests

- ✅ Test data flow between components
- ✅ Use MSW for API mocking (per-test setup)
- ✅ Verify store state updates
- ✅ Test error scenarios
- ❌ Don't mock internal components
- ❌ Don't test every edge case (that's for unit tests)

### E2E Tests

- ✅ Test critical user flows
- ✅ Use real API when available (via VPN)
- ✅ Capture screenshots on failure
- ✅ Test error states
- ❌ Don't test every permutation
- ❌ Don't duplicate unit test coverage

## Troubleshooting

### Tests Hang

**Symptom**: Tests never complete, process hangs  
**Cause**: Global MSW setup or async operations not cleaned up  
**Solution**: 
1. Check for global MSW setup in `vitest.setup.ts` (should be disabled)
2. Ensure all async operations have cleanup in `afterEach`/`afterAll`
3. Use `--no-coverage` flag to isolate coverage tool issues

### Mock Not Working

**Symptom**: Mock functions not called, real implementation runs  
**Cause**: Mock defined after import or incorrect path  
**Solution**:
1. Define `vi.mock()` at top of test file (before imports)
2. Verify mock path matches actual import path
3. Check that mock returns correct shape

### Store Mock Issues

**Symptom**: "Cannot read property of undefined" in store tests  
**Cause**: Selector function not handled correctly  
**Solution**: Use `createStoreMock()` which handles selectors automatically

### Real API Not Accessible

**Symptom**: Connection timeout when testing with real API  
**Cause**: Staging API requires VPN  
**Solution**: 
1. Connect to VPN
2. Or use mock API for local development
3. Or deploy to staging environment for testing

## References

- [Vitest Documentation](https://vitest.dev/)
- [Playwright Documentation](https://playwright.dev/)
- [MSW Documentation](https://mswjs.io/)
- [Zustand Testing Guide](https://docs.pmnd.rs/zustand/guides/testing)
