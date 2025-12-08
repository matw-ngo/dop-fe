# Phase 1: Discovery - useOnboardingFormConfig

**Date**: 2025-01-08
**Search Query**: "useOnboardingFormConfig"
**Source**: src/app/[locale]/user-onboarding/hooks/use-onboarding-form-config.tsx

---

## Files Found

### Main Implementation (1 file)
- [`use-onboarding-form-config.tsx`](src/app/[locale]/user-onboarding/hooks/use-onboarding-form-config.tsx) (534 lines)
  - Core hook implementation with field builders and form configuration

### Components (3 files)
- [`onboarding-form.tsx`](src/app/[locale]/user-onboarding/components/onboarding-form.tsx) (73 lines)
  - Main component using the hook
  - Uses the hook at line 29: `const formConfig = useOnboardingFormConfig(flowData, tPage);`

- [`onboarding-form.container.tsx`](src/app/[locale]/user-onboarding/components/onboarding-form.container.tsx) (27 lines)
  - Container component that wraps OnboardingForm
  - Handles flow data fetching with useFlow hook

- [`page.tsx`](src/app/[locale]/user-onboarding/page.tsx) (43 lines)
  - Page component that renders the container
  - Manages OnboardingFormStore for state persistence

### Stories/Examples (1 file)
- [`onboarding-form.stories.tsx`](src/app/[locale]/user-onboarding/components/onboarding-form.stories.tsx) (252 lines)
  - Storybook stories with mock data
  - Shows different form configurations and states

### Documentation (1 file)
- [`REQUIRED_FIELD_EXAMPLE.md`](docs/renderer/REQUIRED_FIELD_EXAMPLE.md) (63 lines)
  - Documentation showing how to use required fields with the hook
  - Examples of field configuration

### Tests (0 files)
- No test files found specifically for this hook

---

## Entry Points

1. **Hook Definition**: [`use-onboarding-form-config.tsx`](src/app/[locale]/user-onboarding/hooks/use-onboarding-form-config.tsx)
   - Main hook implementation
   - Exported as named export

2. **Primary Usage**: [`onboarding-form.tsx`](src/app/[locale]/user-onboarding/components/onboarding-form.tsx:29)
   - Component that consumes the hook
   - Passes flow data and translation function

3. **Route**: `/user-onboarding`
   - User-facing page that uses the form
   - Entry point for the onboarding flow

---

## Core Functionality

The `useOnboardingFormConfig` hook:
- Takes `flowData: MappedFlow | undefined` and a translation function `t: (key: string) => string`
- Returns a multi-step form configuration using the `multiStepForm` builder
- Dynamically generates form fields based on the flow configuration
- Supports eKYC verification steps
- Handles form data persistence with localStorage

### Supported Field Types

| Field Type | Purpose | Configuration |
|------------|---------|---------------|
| `fullName` | User's full name | Text input with validation |
| `email` | Email address | Email input with format validation |
| `phoneNumber` | Phone number | Phone input with country code |
| `nationalId` | National ID number | Text input with masking |
| `secondNationalId` | Secondary ID | Text input (optional) |
| `dateOfBirth` | Birth date | Date picker |
| `gender` | Gender selection | Select dropdown |
| `location` | Location | Location picker |
| `income` | Income amount | Numeric input |
| `incomeType` | Income source | Select dropdown |
| `havingLoan` | Has existing loans | Boolean toggle |
| `creditStatus` | Credit status | Select dropdown |
| `careerStatus` | Employment status | Select dropdown |
| `careerType` | Job type | Select dropdown |
| `purpose` | Loan purpose | Text area |
| `ekycVerification` | Identity verification | eKYC component |

---

## Dependencies

### Internal Dependencies
- `@/components/renderer/builders/multi-step-form-builder` - Form builder
- `@/components/renderer/builders/field-builder` - Field configuration builder
- `@/mappers/flowMapper` - MappedFlow type definition
- `@/components/renderer/types/ui-theme` - UI theme types
- `@/stores/onboarding-form-store` - Form state management

### External Dependencies
- **React**: `useMemo` hook for optimization
- **Lucide React**: Icons for UI elements
- **Next.js**: Internationalization (next-intl)

---

## Data Flow

```mermaid
graph TD
    A[/user-onboarding page] --> B[OnboardingFormContainer]
    B --> C[fetch flow data]
    C --> D[OnboardingForm component]
    D --> E[useOnboardingFormConfig hook]
    E --> F[Generate form config]
    F --> G[MultiStepFormRenderer]
    G --> H[Render form fields]
    H --> I[Store data in localStorage]
```

---

## Key Features

1. **Dynamic Form Generation**: Forms are built based on flow configuration
2. **Multi-step Support**: Complex forms broken into manageable steps
3. **Field Validation**: Built-in validation for different field types
4. **Internationalization**: Full i18n support with next-intl
5. **State Persistence**: Form data saved to localStorage
6. **eKYC Integration**: Special handling for identity verification
7. **Theme Support**: Integrates with the UI theme system

---

## Configuration Structure

The hook generates a configuration object with:
- `id`: Unique identifier for the form
- `initialStep`: Starting step index
- `steps`: Array of step configurations
  - Each step has fields, validation, and navigation
- `fieldComponents`: Custom field renderers
- `onSubmit`: Form submission handler
- `styles`: Theme-aware styling

---

## Statistics

- **Total Files**: 6 files
- **Total Lines**: ~992 lines
- **Test Coverage**: 0% (no tests found)
- **Complexity**: High (supports 16+ field types, multi-step forms)

---

## Missing Features / TODOs

1. **Loan Application Form**: Placeholder in onboarding-form.tsx (line 66)
2. **Empty Select Options**: Several dropdown fields have empty options arrays:
   - incomeType
   - careerStatus
   - careerType
   - creditStatus
3. **Test Coverage**: No unit or integration tests found

---

## Integration Points

1. **Flow API**: Expects `MappedFlow` data structure
2. **Translation System**: Uses next-intl for all text
3. **Form Renderer System**: Integrates with field renderer
4. **eKYC Service**: For identity verification
5. **Storage API**: localStorage for data persistence

---

## Next Phase

→ **Phase 2** will analyze the structure and relationships between these files.

*[phase-2-structure.md](./phase-2-structure.md) (not yet created)*