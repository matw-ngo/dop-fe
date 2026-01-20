# Notepad: fix-translation-namespace

## Learnings

### Translation Mechanism
- The `useFormTranslations()` hook in `src/components/form-generation/i18n/useFormTranslations.ts` generates translation keys in the format: `forms.{namespace}.{fieldId}.{property}`
- The namespace must match the translation file location: `messages/{locale}/forms/{namespace}.json`
- For example: namespace `"loan-application"` matches file `messages/vi/forms/loan-application.json`

### Root Cause
- `buildLoanFormConfigFromStep()` in `src/lib/builders/loan-form-config-builder.ts` was setting `id: "loan-application-form"`
- Translation file is at `messages/vi/forms/loan-application.json` (namespace: `"loan-application"`)
- This mismatch caused next-intl to return the raw key as the fallback value

### Fix Applied
- Changed line 333 in `loan-form-config-builder.ts`:
  - Before: `id: "loan-application-form"`
  - After: `id: "loan-application"`

### Test Pattern
- Created test at `src/lib/builders/__tests__/loan-form-config-builder.test.ts`
- Uses Vitest with `MappedStep` type from `@/mappers/flowMapper`
- Mocks `useLoanPurposes` hook with `vi.mock()`

### Key Files
- Translation files: `messages/{locale}/forms/loan-application.json`
- Config builder: `src/lib/builders/loan-form-config-builder.ts`
- Test file: `src/lib/builders/__tests__/loan-form-config-builder.test.ts`
- Type definition: `src/mappers/flowMapper.ts` (MappedStep interface)
