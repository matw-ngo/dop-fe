# E2E Tests

End-to-end tests using Playwright for the Digital Onboarding Platform.

## Setup

```bash
# Install Playwright browsers (first time only)
npx playwright install

# Or install specific browser
npx playwright install chromium
```

## Running Tests

```bash
# Start dev server first
pnpm dev

# Run all e2e tests (in another terminal)
pnpm test:e2e

# Run specific test file
pnpm test:e2e tests/e2e/consent-flow.test.tsx

# Run in headed mode (see browser)
pnpm test:e2e --headed

# Run in specific browser
pnpm test:e2e --project=chromium
pnpm test:e2e --project=firefox
pnpm test:e2e --project=webkit

# Run in debug mode
pnpm test:e2e --debug
```

## Test Files

### consent-flow.test.tsx
Tests for redesigned consent modal (March 2026):
- Bottom banner UI and positioning
- Terms detail modal functionality
- User acceptance flow and redirection
- Responsive layout (desktop/mobile)
- Persistence across page reloads
- Accessibility (keyboard, ARIA)
- Theme integration (CSS variables)

### api-integration.spec.ts
Tests for API client integration:
- Environment-based URL configuration
- Authentication middleware
- Timeout handling
- Error recovery with retry logic

### ekyc-loan-application.spec.ts
Tests for eKYC integration in loan application flow

### home.spec.ts
Tests for homepage functionality

### tools.spec.ts
Tests for financial calculator tools

## Test Structure

```typescript
test.describe("Feature Name", () => {
  test.beforeEach(async ({ page }) => {
    // Setup before each test
    await page.goto("/");
  });

  test("should do something", async ({ page }) => {
    // Test implementation
    await expect(page.locator("selector")).toBeVisible();
  });
});
```

## Best Practices

1. **Clear state between tests**: Use `beforeEach` to reset state
2. **Use semantic selectors**: Prefer `getByRole`, `getByText` over CSS selectors
3. **Wait for navigation**: Use `waitForURL` for page transitions
4. **Check visibility**: Use `toBeVisible()` instead of just checking existence
5. **Responsive testing**: Test both desktop and mobile viewports
6. **Accessibility**: Include keyboard navigation and ARIA tests

## Debugging

```bash
# Run with UI mode
pnpm test:e2e --ui

# Generate trace
pnpm test:e2e --trace on

# View trace
npx playwright show-trace trace.zip
```

## CI/CD

Tests run automatically on CI with:
- Retries: 2 attempts on failure
- Parallel: Disabled on CI for stability
- Screenshots: Captured on failure
- Videos: Recorded on failure

## Configuration

See `playwright.config.ts` for:
- Browser configurations
- Viewport sizes
- Timeouts
- Reporter settings
- Global setup/teardown
