# MSW Test Profiles

Modular test profiles for different flow configurations. Each profile defines a specific flow structure for testing different navigation security scenarios.

## Available Profiles

### 1. `default`
**Description:** Standard flow with OTP at step 3 (middle position)

**Steps:**
1. Personal Info
2. Consent
3. OTP Verification ⚡
4. Financial Info
5. Submit

**Use Case:** Default testing scenario, OTP in the middle of the flow

---

### 2. `otp-at-step-1`
**Description:** Flow with OTP at the first step (early verification)

**Steps:**
1. OTP Verification ⚡
2. Personal Info
3. Financial Info
4. Additional Info
5. Submit

**Use Case:** Test navigation blocking when OTP is at the very beginning

---

### 3. `otp-at-step-3`
**Description:** Flow with OTP at step 3 (explicit middle position)

**Steps:**
1. Basic Info
2. Consent
3. OTP Verification ⚡
4. Financial Info
5. Final Submit

**Use Case:** Same as default but with explicit naming for clarity

---

### 4. `otp-at-last-step`
**Description:** Flow with OTP at the final step (late verification)

**Steps:**
1. Personal Info
2. Consent
3. Financial Info
4. Additional Info
5. OTP Verification ⚡

**Use Case:** Test navigation when OTP is at the end (all info collected first)

---

### 5. `no-otp-flow`
**Description:** Flow without any OTP verification

**Steps:**
1. Personal Info
2. Consent
3. Financial Info
4. Additional Info
5. Submit

**Use Case:** Test that navigation works normally without OTP (no blocking)

---

### 6. `multi-otp-flow`
**Description:** Flow with multiple OTP steps

**Steps:**
1. Basic Info
2. OTP Verification (Phone) ⚡
3. Financial Info
4. OTP Verification (Email) ⚡
5. Final Submit

**Use Case:** Test navigation blocking with multiple verification points

---

### 7. `with-ekyc`
**Description:** Flow with eKYC verification step

**Steps:**
1. Personal Info
2. OTP Verification ⚡
3. eKYC Verification 🆔
4. Financial Info
5. Submit

**Use Case:** Test navigation with identity verification (eKYC)

---

## Usage

### In Tests

Use the `x-test-profile` header to select a profile:

```typescript
import { render, screen } from '@testing-library/react';
import { server } from '@/mocks/server';
import { http } from 'msw';

// Select a specific profile for your test
beforeEach(() => {
  server.use(
    http.get('*/flows/:tenant', ({ request }) => {
      // Profile will be automatically selected from header
      return Response.json(/* ... */);
    })
  );
});

test('OTP at first step', async () => {
  // Make request with profile header
  await fetch('/flows/test-tenant', {
    headers: {
      'x-test-profile': 'otp-at-step-1'
    }
  });
  
  // Test navigation behavior...
});
```

### With API Client

```typescript
import { client } from '@/lib/api/client';

// Add profile header to request
const response = await client.get('/flows/test-tenant', {
  headers: {
    'x-test-profile': 'otp-at-last-step'
  }
});
```

### In Integration Tests

```typescript
import { getProfile } from '@/__tests__/msw/profiles';

test('navigation with different profiles', async () => {
  // Get profile configuration
  const profile = getProfile('multi-otp-flow');
  
  console.log(profile.name); // 'multi-otp-flow'
  console.log(profile.description); // 'Flow with multiple OTP steps...'
  console.log(profile.flowConfig.steps.length); // 5
  
  // Use profile in test...
});
```

### List Available Profiles

```typescript
import { listProfiles } from '@/__tests__/msw/profiles';

const profiles = listProfiles();
console.log(profiles);
// [
//   { name: 'default', description: 'Standard flow with OTP at step 3...' },
//   { name: 'otp-at-step-1', description: 'Flow with OTP at the first step...' },
//   ...
// ]
```

---

## Profile Structure

Each profile is defined in its own file and exports a `TestProfile` object:

```typescript
export interface TestProfile {
  name: string;
  description: string;
  flowConfig: FlowDetailConfig;
}
```

### Creating a New Profile

1. Create a new file in `src/__tests__/msw/profiles/`:

```typescript
// my-custom-profile.ts
import type { TestProfile } from "./types";
import { createBaseFlow, createOTPStep, createPersonalInfoStep } from "./factory";

export const myCustomProfile: TestProfile = {
  name: "my-custom-profile",
  description: "Custom flow for specific test case",
  flowConfig: createBaseFlow({
    name: "My Custom Flow",
    description: "Custom flow description",
    steps: [
      createPersonalInfoStep(1, { page: "/step-1" }),
      createOTPStep(2, { page: "/otp" }),
      // ... more steps
    ],
  }),
};
```

2. Register in `src/__tests__/msw/profiles/index.ts`:

```typescript
import { myCustomProfile } from "./my-custom-profile";

const profiles: Record<ProfileName, TestProfile> = {
  // ... existing profiles
  "my-custom-profile": myCustomProfile,
};
```

3. Update the `ProfileName` type in `types.ts`:

```typescript
export type ProfileName =
  | "default"
  | "otp-at-step-1"
  // ... existing profiles
  | "my-custom-profile";
```

---

## Factory Functions

Use factory functions to create consistent step configurations:

### `createBaseStep(overrides?)`
Creates a basic step with all fields set to `false`

### `createOTPStep(stepNumber, overrides?)`
Creates an OTP verification step with `send_otp: true`

### `createEKYCStep(stepNumber, overrides?)`
Creates an eKYC verification step with `use_ekyc: true`

### `createPersonalInfoStep(stepNumber, overrides?)`
Creates a personal info step with name, email, birthday fields

### `createFinancialInfoStep(stepNumber, overrides?)`
Creates a financial info step with income, career fields

### `createConsentStep(stepNumber, overrides?)`
Creates a consent step with purpose fields

### Example:

```typescript
import { createOTPStep, createPersonalInfoStep } from "./factory";

const steps = [
  createPersonalInfoStep(1, {
    page: "/info",
    have_location: true,
    required_location: true,
  }),
  createOTPStep(2, {
    page: "/verify",
  }),
];
```

---

## Testing Scenarios

### Scenario 1: Early OTP Verification
**Profile:** `otp-at-step-1`
**Test:** Navigation should be blocked immediately after step 1

### Scenario 2: Late OTP Verification
**Profile:** `otp-at-last-step`
**Test:** All steps accessible until final OTP step

### Scenario 3: No OTP
**Profile:** `no-otp-flow`
**Test:** No navigation blocking, all steps accessible

### Scenario 4: Multiple OTP Steps
**Profile:** `multi-otp-flow`
**Test:** Navigation blocked after each OTP step

### Scenario 5: With eKYC
**Profile:** `with-ekyc`
**Test:** Navigation with identity verification flow

---

## Error Scenarios

Profiles work alongside error scenarios. Use both headers together:

```typescript
await fetch('/flows/test-tenant', {
  headers: {
    'x-test-profile': 'otp-at-step-1',  // Profile selection
    'x-test-scenario': 'not_found'       // Error scenario
  }
});
```

Available error scenarios:
- `not_found` - Flow not found (404)
- `inactive` - Flow is inactive (400)
- `validation_error` - Invalid request (400)
- `unauthorized` - Auth required (401)
- `forbidden` - Access denied (403)
- `server_error` - Internal error (500)

---

## Architecture

```
src/__tests__/msw/profiles/
├── types.ts              # TypeScript types
├── factory.ts            # Factory functions for creating steps
├── index.ts              # Profile registry and utilities
├── default.ts            # Default profile
├── otp-at-step-1.ts      # OTP at first step
├── otp-at-step-3.ts      # OTP at step 3
├── otp-at-last-step.ts   # OTP at last step
├── no-otp-flow.ts        # No OTP verification
├── multi-otp-flow.ts     # Multiple OTP steps
├── with-ekyc.ts          # With eKYC verification
└── README.md             # This file
```

### Design Principles

1. **Separation of Concerns**: Each profile in its own file
2. **Modularity**: Reusable factory functions
3. **Type Safety**: Full TypeScript support
4. **Extensibility**: Easy to add new profiles
5. **Clean Code**: No duplication, DRY principles

---

## Tips

1. **Use descriptive profile names** that clearly indicate the test scenario
2. **Keep profiles focused** on a single testing concern
3. **Reuse factory functions** instead of creating steps manually
4. **Document your profiles** with clear descriptions
5. **Test profile selection** in your integration tests

---

## Troubleshooting

### Profile not found
- Check that the profile name matches exactly (case-sensitive)
- Verify the profile is registered in `index.ts`
- Check the `ProfileName` type includes your profile

### Steps not rendering correctly
- Verify all required fields are set in the step configuration
- Check that `send_otp` is set correctly for OTP steps
- Ensure `use_ekyc` is set for eKYC steps

### Navigation not blocked
- Confirm the profile has `send_otp: true` on at least one step
- Check that the navigation guard hooks are initialized
- Verify the verification session is created after OTP success

---

## Related Files

- `src/__tests__/msw/handlers/dop.ts` - Main MSW handlers
- `src/hooks/navigation/` - Navigation guard hooks
- `src/store/use-auth-store.ts` - Auth store with verification session
- `src/components/form-generation/store/use-form-wizard-store.ts` - Form wizard store
