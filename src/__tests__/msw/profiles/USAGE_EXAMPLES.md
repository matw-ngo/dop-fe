# MSW Profile Usage Examples

Practical examples showing how to use MSW profiles in your tests.

## Basic Usage

### Example 1: Test with Default Profile

```typescript
import { render, screen } from '@testing-library/react';
import { server } from '@/mocks/server';

test('navigation with default profile', async () => {
  // Default profile is used automatically
  render(<MyForm />);
  
  // Test your component...
});
```

### Example 2: Test with Specific Profile

```typescript
import { render, screen } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { server } from '@/mocks/server';
import { getProfile } from '@/__tests__/msw/profiles';

test('navigation with OTP at first step', async () => {
  // Override handler to use specific profile
  server.use(
    http.get('*/flows/:tenant', ({ request }) => {
      const profile = getProfile('otp-at-step-1');
      return HttpResponse.json(profile.flowConfig);
    })
  );
  
  render(<MyForm />);
  
  // Test navigation blocking after step 1...
});
```

### Example 3: Using Profile Header

```typescript
import { createProfileRequest } from '@/__tests__/msw/profiles/test-utils';

test('fetch flow with profile header', async () => {
  const request = createProfileRequest(
    'https://api.example.com/flows/test-tenant',
    'otp-at-last-step'
  );
  
  const response = await fetch(request);
  const data = await response.json();
  
  expect(data.steps).toHaveLength(5);
  expect(data.steps[4].send_otp).toBe(true);
});
```

## Advanced Usage

### Example 4: Test All Profiles with Parameterized Tests

```typescript
import { describe, it, expect } from 'vitest';
import { getAvailableProfiles, getProfile } from '@/__tests__/msw/profiles';
import { getOTPStepIndices } from '@/__tests__/msw/profiles/test-utils';

describe.each(getAvailableProfiles())('Profile: %s', (profileName) => {
  it('should have valid configuration', () => {
    const profile = getProfile(profileName);
    
    expect(profile.flowConfig.steps.length).toBeGreaterThan(0);
    expect(profile.flowConfig.flow_status).toBe('active');
  });
  
  it('should detect OTP steps correctly', () => {
    const profile = getProfile(profileName);
    const otpIndices = getOTPStepIndices(profile);
    
    if (profileName === 'no-otp-flow') {
      expect(otpIndices).toHaveLength(0);
    } else {
      expect(otpIndices.length).toBeGreaterThan(0);
    }
  });
});
```

### Example 5: Test Navigation Blocking Logic

```typescript
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { getProfile } from '@/__tests__/msw/profiles';
import { 
  getFirstOTPStepIndex, 
  getBlockedSteps, 
  getAccessibleSteps 
} from '@/__tests__/msw/profiles/test-utils';

test('navigation blocking after OTP', async () => {
  const user = userEvent.setup();
  const profile = getProfile('default');
  const otpStepIndex = getFirstOTPStepIndex('default')!;
  const blockedSteps = getBlockedSteps('default');
  const accessibleSteps = getAccessibleSteps('default');
  
  // Initialize form with profile
  const { container } = render(<DynamicForm flowConfig={profile.flowConfig} />);
  
  // Navigate to OTP step
  for (let i = 0; i < otpStepIndex; i++) {
    await user.click(screen.getByTestId('next-button'));
  }
  
  // Verify OTP
  await user.type(screen.getByTestId('otp-input'), '123456');
  await user.click(screen.getByTestId('verify-button'));
  
  // Try to navigate back to blocked steps
  for (const stepIndex of blockedSteps) {
    const canNavigate = await checkNavigationToStep(stepIndex);
    expect(canNavigate).toBe(false);
  }
  
  // Try to navigate to accessible steps
  for (const stepIndex of accessibleSteps) {
    const canNavigate = await checkNavigationToStep(stepIndex);
    expect(canNavigate).toBe(true);
  }
});
```

### Example 6: Test with Multiple Profiles in One Test

```typescript
import { render } from '@testing-library/react';
import { getProfile } from '@/__tests__/msw/profiles';
import { getFirstOTPStepIndex } from '@/__tests__/msw/profiles/test-utils';

test('OTP position affects navigation behavior', async () => {
  const profiles = ['otp-at-step-1', 'default', 'otp-at-last-step'] as const;
  
  for (const profileName of profiles) {
    const profile = getProfile(profileName);
    const otpIndex = getFirstOTPStepIndex(profileName)!;
    
    const { unmount } = render(
      <DynamicForm flowConfig={profile.flowConfig} />
    );
    
    // Test navigation behavior specific to this profile
    // ...
    
    unmount();
  }
});
```

### Example 7: Test Error Scenarios with Profiles

```typescript
import { createTestRequest } from '@/__tests__/msw/profiles/test-utils';

test('handle errors with specific profile', async () => {
  const request = createTestRequest(
    'https://api.example.com/flows/test-tenant',
    'with-ekyc',
    'not_found' // Error scenario
  );
  
  const response = await fetch(request);
  
  expect(response.status).toBe(404);
  expect(await response.json()).toMatchObject({
    code: 'not_found',
    message: expect.stringContaining('not found'),
  });
});
```

### Example 8: Test Profile Matrix

```typescript
import { createProfileTestMatrix } from '@/__tests__/msw/profiles/test-utils';

test('verify all profiles have correct structure', () => {
  const matrix = createProfileTestMatrix();
  
  matrix.forEach((profile) => {
    console.log(`Testing profile: ${profile.profileName}`);
    console.log(`  Description: ${profile.description}`);
    console.log(`  Has OTP: ${profile.hasOTP}`);
    console.log(`  Has eKYC: ${profile.hasEKYC}`);
    console.log(`  Step count: ${profile.stepCount}`);
    console.log(`  OTP steps: ${profile.otpStepIndices.join(', ')}`);
    
    expect(profile.stepCount).toBeGreaterThanOrEqual(3);
    
    if (profile.hasOTP) {
      expect(profile.otpStepIndices.length).toBeGreaterThan(0);
    }
  });
});
```

## Integration Test Examples

### Example 9: Full Flow Integration Test

```typescript
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { server } from '@/mocks/server';
import { http, HttpResponse } from 'msw';
import { getProfile } from '@/__tests__/msw/profiles';

test('complete flow with OTP at step 3', async () => {
  const user = userEvent.setup();
  
  // Setup MSW to use specific profile
  server.use(
    http.get('*/flows/:tenant', () => {
      const profile = getProfile('otp-at-step-3');
      return HttpResponse.json(profile.flowConfig);
    })
  );
  
  render(<UserOnboardingFlow />);
  
  // Step 1: Basic Info
  await user.type(screen.getByLabelText(/name/i), 'John Doe');
  await user.click(screen.getByText(/next/i));
  
  // Step 2: Consent
  await waitFor(() => {
    expect(screen.getByText(/consent/i)).toBeInTheDocument();
  });
  await user.click(screen.getByLabelText(/agree/i));
  await user.click(screen.getByText(/next/i));
  
  // Step 3: OTP
  await waitFor(() => {
    expect(screen.getByText(/verify/i)).toBeInTheDocument();
  });
  await user.type(screen.getByLabelText(/otp/i), '123456');
  await user.click(screen.getByText(/verify/i));
  
  // After OTP, navigation should be blocked
  const backButton = screen.queryByText(/back/i);
  if (backButton) {
    await user.click(backButton);
    // Should still be on step 4 (navigation blocked)
    expect(screen.getByText(/financial/i)).toBeInTheDocument();
  }
  
  // Step 4: Financial Info
  await user.type(screen.getByLabelText(/income/i), '50000');
  await user.click(screen.getByText(/next/i));
  
  // Step 5: Submit
  await waitFor(() => {
    expect(screen.getByText(/submit/i)).toBeInTheDocument();
  });
  await user.click(screen.getByText(/submit/i));
  
  // Verify submission
  await waitFor(() => {
    expect(screen.getByText(/success/i)).toBeInTheDocument();
  });
});
```

### Example 10: Test Profile Switching

```typescript
import { render, screen } from '@testing-library/react';
import { server } from '@/mocks/server';
import { http, HttpResponse } from 'msw';
import { getProfile } from '@/__tests__/msw/profiles';

describe('Profile switching', () => {
  it('should handle profile change mid-test', async () => {
    // Start with default profile
    server.use(
      http.get('*/flows/:tenant', () => {
        const profile = getProfile('default');
        return HttpResponse.json(profile.flowConfig);
      })
    );
    
    const { rerender } = render(<MyForm />);
    
    // Verify default profile behavior
    expect(screen.getByText(/step 1/i)).toBeInTheDocument();
    
    // Switch to different profile
    server.use(
      http.get('*/flows/:tenant', () => {
        const profile = getProfile('otp-at-step-1');
        return HttpResponse.json(profile.flowConfig);
      })
    );
    
    // Re-fetch and rerender
    rerender(<MyForm key="new-profile" />);
    
    // Verify new profile behavior
    // ...
  });
});
```

## Tips and Best Practices

1. **Use descriptive profile names** in your tests for clarity
2. **Test edge cases** with profiles like `otp-at-step-1` and `otp-at-last-step`
3. **Verify no-OTP behavior** with `no-otp-flow` profile
4. **Test multi-step verification** with `multi-otp-flow` profile
5. **Use test utilities** like `getBlockedSteps()` and `getAccessibleSteps()` for assertions
6. **Create profile matrix tests** to ensure all profiles work correctly
7. **Combine profiles with error scenarios** for comprehensive testing
8. **Document which profile you're using** in test descriptions

## Common Patterns

### Pattern 1: Setup Profile in beforeEach

```typescript
import { server } from '@/mocks/server';
import { http, HttpResponse } from 'msw';
import { getProfile } from '@/__tests__/msw/profiles';

describe('My Feature', () => {
  beforeEach(() => {
    server.use(
      http.get('*/flows/:tenant', () => {
        const profile = getProfile('default');
        return HttpResponse.json(profile.flowConfig);
      })
    );
  });
  
  it('test 1', () => { /* ... */ });
  it('test 2', () => { /* ... */ });
});
```

### Pattern 2: Profile-Specific Test Suites

```typescript
describe('Navigation with OTP at first step', () => {
  const profileName = 'otp-at-step-1';
  
  beforeEach(() => {
    server.use(
      http.get('*/flows/:tenant', () => {
        const profile = getProfile(profileName);
        return HttpResponse.json(profile.flowConfig);
      })
    );
  });
  
  it('should block navigation immediately after OTP', () => { /* ... */ });
  it('should allow forward navigation', () => { /* ... */ });
});
```

### Pattern 3: Dynamic Profile Selection

```typescript
const testCases = [
  { profile: 'otp-at-step-1', expectedBlockedSteps: [0] },
  { profile: 'default', expectedBlockedSteps: [0, 1, 2] },
  { profile: 'otp-at-last-step', expectedBlockedSteps: [0, 1, 2, 3, 4] },
];

test.each(testCases)('navigation with $profile', async ({ profile, expectedBlockedSteps }) => {
  const flowConfig = getProfile(profile).flowConfig;
  
  render(<MyForm flowConfig={flowConfig} />);
  
  // Test blocked steps...
  for (const stepIndex of expectedBlockedSteps) {
    // Assert navigation is blocked
  }
});
```
