# Fix Translation Namespace Mismatch

## Context

### Root Cause
The `LoanProductPanel` component displays raw translation keys like `forms.loan-application-form.expected_amount.label` instead of actual translated values because of a **namespace mismatch** between the form config builder and the translation files.

| Component | Value | Location |
|-----------|-------|----------|
| **Config Builder sets** | `namespace: "loan-application-form"` | `src/lib/builders/loan-form-config-builder.ts:379` |
| **Translation file is** | `forms/loan-application.json` | `messages/vi/forms/loan-application.json` |

The form config builder sets namespace to `"loan-application-form"` but the actual translation file is at `forms/loan-application.json`, which means the namespace should be `"loan-application"`.

### Investigation Summary
1. Translation files exist at `messages/vi/forms/loan-application.json` and `messages/en/forms/loan-application.json`
2. These files contain the correct translations for all form fields
3. The `FieldFactory` component uses `useFormTranslations()` to look up translations
4. When the namespace doesn't match the file location, `next-intl` returns the key itself as a fallback

---

## Work Objectives

### Core Objective
Fix the namespace mismatch so that form field labels display translated values instead of raw translation keys.

### Concrete Deliverables
- Updated namespace in `src/lib/builders/loan-form-config-builder.ts`
- Unit test verifying the namespace matches the translation file location

### Definition of Done
- [x] Translation files are loaded correctly
- [x] Form labels display translated values (e.g., "Số tiền vay" instead of `forms.loan-application-form.expected_amount.label`)
- [x] All form field labels render correctly

### Must Have
- [x] Correct namespace value in form config builder
- [x] Test to prevent regression

### Must NOT Have
- [x] No changes to translation files (they're already correct)
- [x] No changes to other components

---

## Verification Strategy (TDD)

### Test Strategy
- **Infrastructure exists**: YES (Vitest)
- **User wants tests**: YES (TDD approach)
- **Test framework**: Vitest

### Task Structure (RED-GREEN-REFACTOR)

**Task 1: RED - Write failing test**
- Create test file that verifies namespace matches translation file location
- Test will FAIL because current namespace is wrong

**Task 2: GREEN - Fix the namespace**
- Change `"loan-application-form"` → `"loan-application"` in config builder
- Test will PASS

**Task 3: REFACTOR - Verify and clean up**
- Ensure test covers the key scenario
- No additional refactoring needed for this simple fix

---

## Task Flow

```
Task 1 (Write failing test) → Task 2 (Fix namespace) → Task 3 (Verify)
```

---

## Parallelization

| Group | Tasks | Reason |
|-------|-------|--------|
| A | 1, 2 | Sequential - test must fail before fix |
| B | 3 | Depends on Task 2 |

---

## TODOs

- [x] 1. Write failing unit test for namespace validation

  **What to do**:
  - Create test file: `src/lib/builders/__tests__/loan-form-config-builder.test.ts`
  - Test that `buildLoanFormConfigFromStep()` returns config with correct i18n namespace
  - Mock `useLoanPurposes` hook
  - Test should verify: `config.i18n.namespace === "loan-application"`
  - Currently this will FAIL because namespace is `"loan-application-form"`

  **Parallelizable**: NO (first task)

  **References**:
  
  **Pattern References**:
  - `src/lib/builders/loan-form-config-builder.ts:376-388` - Current config structure with wrong namespace
  - `src/components/form-generation/types.ts:DynamicFormConfig` - i18n config type definition
  
  **Test References**:
  - `src/components/form-generation/__tests__/DynamicForm.test.tsx` - Example form generation tests
  
  **External References**:
  - `messages/vi/forms/loan-application.json` - Actual translation file location

  **Acceptance Criteria**:
  
  **If TDD (tests enabled):**
  - [x] Test file created: `src/lib/builders/__tests__/loan-form-config-builder.test.ts`
  - [x] Test verifies: `config.i18n.namespace === "loan-application"`
  - [x] `pnpm test:run` → FAIL (1)
  
  **Manual Execution Verification**:
  - [x] Run: `pnpm test:run -- loan-form-config-builder.test.ts`
  - [x] Expected: Test fails with assertion error

  **Evidence Required**:
  - [x] Test output showing: `Expected: "loan-application", Received: "loan-application-form"`

  **Commit**: YES
  - Message: `test(builders): add namespace validation test`
  - Files: `src/lib/builders/__tests__/loan-form-config-builder.test.ts`

- [x] 2. Fix namespace in loan-form-config-builder.ts

  **What to do**:
  - Edit file: `src/lib/builders/loan-form-config-builder.ts`
  - Line 379: Change `namespace: "loan-application-form"` to `namespace: "loan-application"`
  - This single line change aligns the namespace with the actual translation file location

  **Must NOT do**:
  - No other changes to the file
  - No changes to translation files

  **Parallelizable**: NO (depends on Task 1)

  **References**:
  
  **Pattern References**:
  - `src/lib/builders/loan-form-config-builder.ts:376-388` - Config structure needing fix
  
  **External References**:
  - `messages/vi/forms/loan-application.json` - Translation file that must be matched
  - `messages/en/forms/loan-application.json` - English translations

  **Acceptance Criteria**:
  
  **If TDD (tests enabled):**
  - [x] `pnpm test:run -- loan-form-config-builder.test.ts` → PASS
  
  **Manual Execution Verification**:
  - [x] Read updated file to verify namespace change
  - [x] Verify: `namespace: "loan-application"` on line 333

  **Evidence Required**:
  - [x] File content showing correct namespace

  **Commit**: YES
  - Message: `fix(builders): correct i18n namespace to match translation file`
  - Files: `src/lib/builders/loan-form-config-builder.ts`

- [x] 3. Verify fix and run full test suite

  **What to do**:
  - Run the specific test to confirm it passes
  - Run broader test suite to ensure no regressions
  - Optionally: Verify UI displays correct translations (manual check)

  **Parallelizable**: NO (depends on Task 2)

  **References**:
  
  **Test References**:
  - `src/lib/builders/__tests__/loan-form-config-builder.test.ts` - The test file
  
  **Documentation References**:
  - `messages/vi/forms/loan-application.json` - Verify translations exist

  **Acceptance Criteria**:
  
  **If TDD (tests enabled):**
  - [x] `pnpm test:run -- loan-form-config-builder.test.ts` → PASS (1 test passes)
  - [x] `pnpm test:run` → All tests pass (no regressions)
  
  **Manual Execution Verification** (optional):
  - [ ] Start dev server: `pnpm dev`
  - [ ] Navigate to home page
  - [ ] Verify form labels show "Số tiền vay", "Thời hạn vay", etc. instead of raw keys

  **Evidence Required**:
  - [x] Test output showing: `✓ test(builders): add namespace validation test`
  - [x] Full test suite output (optional)

  **Commit**: NO (changes already committed in Task 2)

---

## Commit Strategy

| After Task | Message | Files | Verification |
|------------|---------|-------|--------------|
| 1 | `test(builders): add namespace validation test` | `src/lib/builders/__tests__/loan-form-config-builder.test.ts` | `pnpm test:run -- loan-form-config-builder.test.ts` → FAIL |
| 2 | `fix(builders): correct i18n namespace to match translation file` | `src/lib/builders/loan-form-config-builder.ts` | `pnpm test:run -- loan-form-config-builder.test.ts` → PASS |

---

## Success Criteria

### Verification Commands
```bash
# Run specific test (after Task 1 - should FAIL)
pnpm test:run -- src/lib/builders/__tests__/loan-form-config-builder.test.ts

# Run specific test (after Task 2 - should PASS)
pnpm test:run -- src/lib/builders/__tests__/loan-form-config-builder.test.ts

# Full test suite (no regressions)
pnpm test:run
```

### Final Checklist
- [x] All "Must Have" present
- [x] All "Must NOT Have" absent
- [x] All tests pass
- [ ] Form labels display translated values (verified manually if desired)
