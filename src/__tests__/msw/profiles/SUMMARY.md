# MSW Profile System - Summary

## What Was Created

A modular, clean, and extensible MSW (Mock Service Worker) profile system for testing different flow configurations in the DOP frontend application.

## Architecture

```
src/__tests__/msw/profiles/
├── types.ts                  # TypeScript type definitions
├── factory.ts                # Factory functions for creating steps
├── index.ts                  # Profile registry and utilities
├── default.ts                # Default profile (OTP at step 3)
├── otp-at-step-1.ts          # OTP at first step
├── otp-at-step-3.ts          # OTP at step 3 (explicit)
├── otp-at-last-step.ts       # OTP at last step
├── no-otp-flow.ts            # No OTP verification
├── multi-otp-flow.ts         # Multiple OTP steps
├── with-ekyc.ts              # With eKYC verification
├── test-utils.ts             # Helper utilities for testing
├── profiles.test.ts          # Profile tests (32 tests, all passing)
├── README.md                 # Complete documentation
├── USAGE_EXAMPLES.md         # Practical usage examples
└── SUMMARY.md                # This file
```

## Design Principles

1. **Separation of Concerns (SoC)**: Each profile in its own file
2. **Modularity**: Reusable factory functions for creating steps
3. **Type Safety**: Full TypeScript support with strict types
4. **Extensibility**: Easy to add new profiles
5. **Clean Code**: DRY principles, no duplication
6. **Testability**: Comprehensive test coverage (32 tests)

## Available Profiles

| Profile Name | Description | OTP Position | Steps | Use Case |
|--------------|-------------|--------------|-------|----------|
| `default` | Standard flow | Step 3 | 5 | Default testing |
| `otp-at-step-1` | Early verification | Step 1 | 5 | Test immediate blocking |
| `otp-at-step-3` | Mid-flow verification | Step 3 | 5 | Explicit middle position |
| `otp-at-last-step` | Late verification | Step 5 | 5 | Test end-of-flow blocking |
| `no-otp-flow` | No verification | None | 5 | Test normal navigation |
| `multi-otp-flow` | Multiple verifications | Steps 2, 4 | 5 | Test multiple blocks |
| `with-ekyc` | Identity verification | Step 2 (OTP), Step 3 (eKYC) | 5 | Test eKYC flow |

## Key Features

### 1. Profile Selection via Header
```typescript
// Use 'x-test-profile' header to select a profile
fetch('/flows/tenant', {
  headers: { 'x-test-profile': 'otp-at-step-1' }
});
```

### 2. Factory Functions
```typescript
// Create steps with consistent configuration
createOTPStep(1, { page: '/verify' });
createPersonalInfoStep(2, { page: '/info' });
createEKYCStep(3, { page: '/ekyc' });
```

### 3. Test Utilities
```typescript
// Helper functions for testing
getFirstOTPStepIndex('default');      // 2
getBlockedSteps('default');           // [0, 1, 2]
getAccessibleSteps('default');        // [3, 4]
hasOTPVerification('no-otp-flow');    // false
```

### 4. Profile Registry
```typescript
// Get profiles programmatically
const profile = getProfile('otp-at-step-1');
const allProfiles = getAvailableProfiles();
const profileList = listProfiles();
```

## Integration with Existing Code

### Updated Files

1. **`src/__tests__/msw/handlers/dop.ts`**
   - Added profile import
   - Updated flow handler to use profiles
   - Maintains backward compatibility

### How It Works

```typescript
// In MSW handler
http.get('*/flows/:tenant', ({ request }) => {
  // Automatically selects profile from header
  const profile = getProfileFromRequest(request);
  return HttpResponse.json(profile.flowConfig);
});
```

## Usage Examples

### Basic Usage
```typescript
import { getProfile } from '@/__tests__/msw/profiles';

const profile = getProfile('otp-at-step-1');
render(<MyForm flowConfig={profile.flowConfig} />);
```

### With MSW
```typescript
server.use(
  http.get('*/flows/:tenant', () => {
    const profile = getProfile('multi-otp-flow');
    return HttpResponse.json(profile.flowConfig);
  })
);
```

### Test Utilities
```typescript
import { 
  getBlockedSteps, 
  getAccessibleSteps 
} from '@/__tests__/msw/profiles/test-utils';

const blocked = getBlockedSteps('default');
const accessible = getAccessibleSteps('default');

// Assert navigation behavior
expect(canNavigateToStep(blocked[0])).toBe(false);
expect(canNavigateToStep(accessible[0])).toBe(true);
```

## Test Coverage

### Profile Tests (32 tests, all passing)

- ✅ Profile registry (5 tests)
- ✅ Profile configurations (8 tests)
- ✅ Profile utilities (9 tests)
- ✅ Profile test matrix (3 tests)
- ✅ Multi-OTP profile (2 tests)
- ✅ Profile step configurations (5 tests)

### Test Categories

1. **Registry Tests**: Profile selection, listing, fallback
2. **Configuration Tests**: OTP position, step count, field validation
3. **Utility Tests**: Helper functions, step detection, navigation logic
4. **Matrix Tests**: Bulk validation, cross-profile checks
5. **Integration Tests**: Real-world usage scenarios

## Benefits

### For Developers

1. **Easy to Use**: Simple API with clear documentation
2. **Type Safe**: Full TypeScript support prevents errors
3. **Flexible**: Easy to add new profiles or modify existing ones
4. **Well Tested**: Comprehensive test coverage ensures reliability
5. **Well Documented**: README, usage examples, and inline comments

### For Testing

1. **Comprehensive Coverage**: Test all navigation scenarios
2. **Isolated Tests**: Each profile tests specific behavior
3. **Reusable**: Profiles can be shared across tests
4. **Maintainable**: Changes to flow structure in one place
5. **Debuggable**: Clear profile names and descriptions

### For Maintenance

1. **Modular**: Each profile in separate file
2. **Extensible**: Easy to add new profiles
3. **Clean**: No code duplication
4. **Documented**: Clear documentation and examples
5. **Tested**: Automated tests catch regressions

## How to Add a New Profile

1. Create new file: `src/__tests__/msw/profiles/my-profile.ts`
2. Define profile using factory functions
3. Register in `index.ts`
4. Add to `ProfileName` type in `types.ts`
5. Add tests in `profiles.test.ts`
6. Document in `README.md`

Example:
```typescript
// my-profile.ts
export const myProfile: TestProfile = {
  name: "my-profile",
  description: "Custom flow for specific test case",
  flowConfig: createBaseFlow({
    name: "My Custom Flow",
    steps: [
      createPersonalInfoStep(1),
      createOTPStep(2),
      // ... more steps
    ],
  }),
};
```

## Migration Guide

### Before (Old Approach)
```typescript
// Hardcoded mock data in handler
const createMockFlowDetail = () => ({
  steps: [
    { id: "1", send_otp: true, /* ... */ },
    { id: "2", send_otp: false, /* ... */ },
  ]
});
```

### After (New Approach)
```typescript
// Use profiles
import { getProfileFromRequest } from '@/__tests__/msw/profiles';

const profile = getProfileFromRequest(request);
return HttpResponse.json(profile.flowConfig);
```

## Performance

- **Profile Loading**: Instant (pre-defined objects)
- **Profile Selection**: O(1) lookup
- **Test Execution**: No performance impact
- **Memory Usage**: Minimal (7 profiles, ~5KB total)

## Future Enhancements

Potential improvements:

1. **Dynamic Profile Generation**: Generate profiles from config
2. **Profile Composition**: Combine profiles for complex scenarios
3. **Profile Validation**: Runtime validation of profile structure
4. **Profile Versioning**: Support multiple versions of same profile
5. **Profile Presets**: Common combinations of profiles and scenarios

## Related Documentation

- **README.md**: Complete profile documentation
- **USAGE_EXAMPLES.md**: Practical usage examples
- **profiles.test.ts**: Test examples and patterns
- **AGENTS.md**: Project knowledge base (navigation security section)

## Support

For questions or issues:

1. Check README.md for documentation
2. Review USAGE_EXAMPLES.md for examples
3. Look at profiles.test.ts for test patterns
4. Check profile source files for implementation details

## Conclusion

The MSW profile system provides a clean, modular, and extensible way to test different flow configurations. It follows best practices for code organization, type safety, and testability, making it easy to maintain and extend as the application grows.

All 32 tests pass, demonstrating the system works correctly and is ready for use in your testing workflow.
