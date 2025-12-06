# Testing Guide

This guide covers the testing setup and best practices for the DOP Frontend project.

## 📦 Testing Stack

| Layer | Tool | Purpose |
|-------|------|---------|
| **Unit/Component** | Vitest + React Testing Library | Component & hook testing |
| **API Mocking** | MSW (Mock Service Worker) | Mock API responses |
| **E2E Testing** | Playwright + BDD | Full user flows |
| **Visual Testing** | Storybook | Component isolation testing |

## 🚀 Running Tests

### Unit/Component Tests

```bash
# Run tests in watch mode
pnpm test

# Run tests once
pnpm test:run

# Open Vitest UI
pnpm test:ui

# Generate coverage report
pnpm test:coverage

# Run specific test file
pnpm test src/components/features/credit-cards/CreditCardSearchBar.test.tsx
```

### E2E Tests

```bash
# Run all E2E tests
pnpm test:e2e

# Run E2E tests with UI
pnpm test:e2e:ui

# Debug E2E tests
pnpm test:e2e:debug

# Generate tests with codegen
pnpm test:e2e:codegen

# Run specific test
pnpm test:e2e tests/e2e/home.spec.ts
```

### All Tests

```bash
# Run unit and E2E tests
pnpm test:all
```

## 📁 Test Structure

```
project-root/
├── src/
│   ├── app/
│   │   └── page.test.tsx           # Co-located page tests
│   ├── components/
│   │   └── features/
│   │       └── credit-cards/
│   │           ├── ComponentName.test.tsx
│   │           └── hooks/
│   │               └── hookName.test.ts
├── tests/
│   ├── e2e/                        # E2E tests
│   │   └── home.spec.ts
│   ├── global-setup.ts             # Playwright global setup
│   └── global-teardown.ts          # Playwright global teardown
├── mocks/                          # MSW mock handlers
│   ├── handlers.ts
│   └── server.ts
├── vitest.config.ts                # Vitest configuration
├── vitest.setup.ts                 # Vitest setup file
└── playwright.config.ts            # Playwright configuration
```

## ✍️ Writing Tests

### Component Tests

Best practices for component testing:

1. **Focus on user behavior**, not implementation
2. **Use accessible selectors** (`getByRole`, `getByLabelText`)
3. **Test user interactions** with `userEvent`
4. **Mock external dependencies** with MSW

```typescript
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { MyComponent } from './MyComponent';

describe('MyComponent', () => {
  it('should render with correct label', () => {
    render(<MyComponent label="Test Label" />);
    expect(screen.getByText('Test Label')).toBeInTheDocument();
  });

  it('should call onClick when clicked', async () => {
    const handleClick = vi.fn();
    const user = userEvent.setup();

    render(<MyComponent onClick={handleClick} />);

    await user.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

### Hook Tests

```typescript
import { renderHook, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useMyHook } from './useMyHook';

describe('useMyHook', () => {
  it('should return initial state', () => {
    const { result } = renderHook(() => useMyHook());

    expect(result.current.value).toBe(initialValue);
  });

  it('should update state when action is called', () => {
    const { result } = renderHook(() => useMyHook());

    act(() => {
      result.current.updateValue('new value');
    });

    expect(result.current.value).toBe('new value');
  });
});
```

### E2E Tests

Use Playwright's BDD-style tests with Gherkin syntax:

```typescript
import { test, expect } from '@playwright/test';

test.describe('User Authentication', () => {
  test('should allow user to login', async ({ page }) => {
    // Given
    await page.goto('/login');

    // When
    await page.getByLabel(/email/i).fill('test@example.com');
    await page.getByLabel(/password/i).fill('password123');
    await page.getByRole('button', { name: /login/i }).click();

    // Then
    await expect(page).toHaveURL(/\/dashboard/);
    await expect(page.getByText(/welcome/i)).toBeVisible();
  });
});
```

## 🎯 Test Naming Conventions

### Files
- Component tests: `ComponentName.test.tsx`
- Hook tests: `useHookName.test.ts`
- Page tests: `page.test.tsx`
- E2E tests: `feature-name.spec.ts`

### Test Cases
Use the "should [behavior] when [condition]" pattern:

```typescript
// ✅ Good
it('should display error message when login fails')
it('should add item to cart when add button is clicked')
it('should filter results when search query changes')

// ❌ Bad
it('test login')
it('check if error shows')
it('test the filter functionality')
```

## 🔧 Mocking

### API Mocking with MSW

```typescript
// mocks/handlers.ts
import { http, HttpResponse } from 'msw';

export const handlers = [
  // Mock GET request
  http.get('/api/credit-cards', ({ request }) => {
    const url = new URL(request.url);
    const category = url.searchParams.get('category');

    return HttpResponse.json({
      cards: mockCreditCards.filter(card =>
        category ? card.category === category : true
      ),
    });
  }),

  // Mock POST request
  http.post('/api/credit-cards/:id/compare', async ({ params, request }) => {
    const cardId = params.id;
    const data = await request.json();

    return HttpResponse.json({
      success: true,
      comparisonId: 'comp_123',
    });
  }),
];
```

### Component Mocks

```typescript
// vitest.setup.ts
vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
  useLocale: () => 'en',
}));

vi.mock('@tanstack/react-query', () => ({
  useQuery: () => ({
    data: mockData,
    isLoading: false,
    error: null,
  }),
}));
```

## 📊 Coverage

Run coverage with:

```bash
pnpm test:coverage
```

Coverage reports are generated in:
- Terminal output
- `coverage/index.html` (HTML report)
- `coverage/coverage-final.json` (JSON for CI)

### Coverage Goals
- Unit tests: 80%+ line coverage
- Critical components: 95%+
- New features: 100% on new code

## 🐛 Troubleshooting

### Common Issues

1. **"Test timed out"**
   - Increase timeout: `test.setTimeout(10000)`
   - Check for async operations not properly awaited

2. **"MSW handlers not matching"**
   - Ensure handlers are registered before tests
   - Check request URL and method match exactly

3. **"Playwright can't find element"**
   - Use `waitFor` for dynamic content
   - Check if element is behind a loading state

4. **"Import errors in tests"**
   - Update `vitest.config.ts` to include path aliases
   - Ensure module resolution is correct

### Debug Mode

```bash
# Debug specific test
pnpm test --inspect-brk ComponentName.test.tsx

# Debug E2E test
pnpm test:e2e:debug tests/e2e/home.spec.ts
```

## 🔄 CI/CD Integration

The testing setup includes GitHub Actions integration:

```yaml
# .github/workflows/test.yml
name: Tests

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
        with:
          version: 8
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install

      - name: Run type check
        run: pnpm type-check

      - name: Run unit tests
        run: pnpm test:coverage

      - name: Install Playwright browsers
        run: npx playwright install --with-deps

      - name: Run E2E tests
        run: pnpm test:e2e

      - name: Upload coverage
        uses: codecov/codecov-action@v3
```

## 📚 Resources

- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Playwright Documentation](https://playwright.dev/)
- [MSW Documentation](https://mswjs.io/)
- [Next.js Testing](https://nextjs.org/docs/testing)

## 🎉 Best Practices

1. **Test behavior, not implementation**
2. **Keep tests simple and focused**
3. **Use meaningful assertions**
4. **Mock external dependencies**
5. **Test error cases**
6. **Use accessible selectors**
7. **Run tests in CI**
8. **Review coverage reports**
9. **Update tests when refactoring**
10. **Document complex test scenarios**