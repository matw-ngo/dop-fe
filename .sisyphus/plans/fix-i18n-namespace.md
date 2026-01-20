# Fix i18n Namespace for Loan Form Config Builder

## Root Cause Analysis

### The Problem Chain

| Component | Issue | Line |
|-----------|-------|------|
| **loan-form-config-builder.ts** | Returns config WITHOUT `i18n` property | 332-351 |
| **StepWizard.tsx** | Doesn't pass `config.i18n` to StepContent | 91-94 |
| **StepContent.tsx** | Doesn't pass `namespace` to FieldFactory | 98-109 |
| **FieldFactory.tsx** | Defaults to `"common"` namespace | 133 |
| **Result** | Shows `forms.common.expected_amount.label` instead of `forms.loan-application...` | - |

### Key Findings

1. **FieldFactory** accepts `namespace` prop (line 101) but defaults to `"common"` (line 133)
2. **useFormTranslations()** generates keys as `forms.{namespace}.{fieldId}.label` (line 20)
3. **loan-form-config-builder.ts** returns config with `id: "loan-application"` but NO `i18n` property
4. All fields in builder have `i18n: { enabled: false }` - disabling translations!

---

## Work Objectives

### Core Objective
Fix the i18n flow so that form labels display translations from `forms.loan-application.*` namespace instead of falling back to `forms.common.*` or raw keys.

### Concrete Deliverables
1. Add `i18n` property to config returned by `buildLoanFormConfigFromStep()`
2. Pass namespace from StepWizard → StepContent → FieldFactory
3. Enable i18n on form fields
4. Create translation files

### Definition of Done
- [ ] Form labels show "Số tiền vay" instead of `forms.common.expected_amount.label`
- [ ] All form field labels use `loan-application` namespace
- [ ] Translation keys match pattern: `forms.loan-application.{fieldId}.label`

---

## i18n Flow (Current vs Fixed)

### Current (Broken)
```
buildLoanFormConfigFromStep()
  → returns { id: "loan-application", steps, navigation }  // NO i18n!
  
StepWizard(config)
  → passes config to StepContent  // NO i18n passed!
  
StepContent(step)
  → calls FieldFactory(field)  // NO namespace prop!
  
FieldFactory(namespace="common")  // ← Defaults to "common"!
  → useFormTranslations("common")
  → looks for "forms.common.expected_amount.label"  // WRONG!
```

### Fixed (Correct)
```
buildLoanFormConfigFromStep()
  → returns { 
      id: "loan-application", 
      i18n: { namespace: "loan-application" },  // ← ADD THIS
      steps, 
      navigation 
    }
  
StepWizard(config)
  → passes config.i18n to StepContent  // ← ADD THIS
  
StepContent(step, i18n)
  → passes namespace to FieldFactory  // ← ADD THIS
  
FieldFactory(namespace="loan-application")  // ← Use correct namespace!
  → useFormTranslations("loan-application")
  → looks for "forms.loan-application.expected_amount.label"  // CORRECT!
```

---

## Tasks

### Task 1: Add i18n property to loan-form-config-builder.ts

**What to do**:
- Edit `src/lib/builders/loan-form-config-builder.ts`
- Add `i18n: { namespace: "loan-application" }` to the returned config object
- Enable i18n on all fields (change `i18n.enabled: false` to `i18n.enabled: true` or remove the disabled setting)
- Change field labels from hard-coded text to translation key strings

**Changes required**:
```typescript
// Line 332-351 - Add i18n to returned config
return {
  id: "loan-application",
  i18n: {
    namespace: "loan-application",
  },
  steps: [...],
  navigation: {...},
};

// For each field:
// BEFORE:
{
  label: "Số tiền vay",
  i18n: { enabled: false },
}

// AFTER:
{
  label: undefined,  // Will be looked up from translation
  i18n: { enabled: true },
}
```

**References**:
- `src/lib/builders/loan-form-config-builder.ts` - Config builder
- `src/components/form-generation/types.ts:FormI18nConfig` - Type definition (line 793-803)

---

### Task 2: Pass i18n from StepWizard to StepContent

**What to do**:
- Edit `src/components/form-generation/wizard/StepWizard.tsx`
- Pass `config.i18n` to `StepContent` component

**Changes required**:
```typescript
// Line 91-94 - Add i18n prop to StepContent
<StepContent
  step={currentStepConfig}
  showTitle={config.navigation?.showStepHeader}
  i18n={config.i18n}  // ← ADD THIS
/>
```

**References**:
- `src/components/form-generation/wizard/StepWizard.tsx` - Component file
- `src/components/form-generation/wizard/StepContent.tsx` - Receives the prop

---

### Task 3: Update StepContent to accept and pass namespace

**What to do**:
- Edit `src/components/form-generation/wizard/StepContent.tsx`
- Accept `i18n` prop from StepWizard
- Pass `namespace` to FieldFactory

**Changes required**:
```typescript
// Line 11-15 - Add i18n to props interface
interface StepContentProps {
  step: FormStep;
  className?: string;
  showTitle?: boolean;
  i18n?: { namespace: string };  // ← ADD THIS
}

// Line 17-21 - Destructure i18n prop
export function StepContent({
  step,
  className,
  showTitle = true,
  i18n,  // ← ADD THIS
}: StepContentProps) {

// Line 98-109 - Pass namespace to FieldFactory
{step.fields.filter(isFieldVisible).map((field) => (
  <FieldFactory
    key={field.id}
    field={field}
    value={stepData[field.name]}
    onChange={(value) => updateFieldValue(step.id, field.name, value)}
    onBlur={() => {}}
    error={meta?.errors?.[field.name]}
    namespace={i18n?.namespace || "common"}  // ← ADD THIS
  />
))}
```

**References**:
- `src/components/form-generation/wizard/StepContent.tsx` - Component file
- `src/components/form-generation/factory/FieldFactory.tsx:101` - Accepts namespace prop

---

### Task 4: Create translation files

**What to do**:
- Create `messages/vi/forms/loan-application.json`
- Create `messages/en/forms/loan-application.json`

**File structure**:
```json
{
  "forms": {
    "loan-application": {
      "expected_amount": {
        "label": "Số tiền vay",
        "placeholder": "Nhập số tiền vay"
      },
      "loan_period": {
        "label": "Thời hạn vay",
        "placeholder": "Chọn thời hạn"
      },
      "loan_purpose": {
        "label": "Mục đích vay",
        "placeholder": "Chọn mục đích vay"
      },
      "fullName": {
        "label": "Họ và tên",
        "placeholder": "Nhập họ và tên"
      },
      "nationalId": {
        "label": "Căn cước công dân",
        "placeholder": "Nhập số CCCD"
      },
      "email": {
        "label": "Email",
        "placeholder": "Nhập địa chỉ email"
      },
      "location": {
        "label": "Tỉnh/Thành phố",
        "placeholder": "Chọn tỉnh/thành phố"
      },
      "birthday": {
        "label": "Ngày sinh",
        "placeholder": "Chọn ngày sinh"
      },
      "gender": {
        "label": "Giới tính",
        "placeholder": "Chọn giới tính"
      },
      "income": {
        "label": "Mức thu nhập hàng tháng",
        "placeholder": "Chọn mức thu nhập"
      },
      "agreeStatus": {
        "label": ""
      }
    },
    "validation": {
      "required": "Trường này là bắt buộc",
      "email": "Email không hợp lệ",
      "minLength": "Tối thiểu {min} ký tự",
      "pattern": "Định dạng không hợp lệ"
    }
  }
}
```

**References**:
- `messages/vi/forms/main.json` - Existing translation file pattern

---

## Verification Strategy

### Test Strategy
- **Infrastructure exists**: YES (Vitest)
- **Test approach**: Manual verification with dev server

### Verification Steps
1. Run dev server: `pnpm dev`
2. Navigate to home page
3. Verify form labels show "Số tiền vay", "Thời hạn vay", etc.
4. Verify NO raw keys like `forms.loan-application.expected_amount.label`

---

## Task Flow

```
Task 1 (Config Builder)
    ↓
Task 2 (StepWizard)
    ↓
Task 3 (StepContent)
    ↓
Task 4 (Translation Files)
    ↓
Task 5 (Verify)
```

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/lib/builders/loan-form-config-builder.ts` | Add i18n property, enable i18n on fields |
| `src/components/form-generation/wizard/StepWizard.tsx` | Pass i18n to StepContent |
| `src/components/form-generation/wizard/StepContent.tsx` | Accept and pass namespace to FieldFactory |
| `messages/vi/forms/loan-application.json` | Create file with Vietnamese translations |
| `messages/en/forms/loan-application.json` | Create file with English translations |

---

## Success Criteria

### Verification Commands
```bash
# Start dev server
pnpm dev

# Navigate to home page
# Expected: Form labels show "Số tiền vay" not raw keys
```

### Final Checklist
- [ ] Config has `i18n: { namespace: "loan-application" }`
- [ ] StepWizard passes i18n to StepContent
- [ ] StepContent passes namespace to FieldFactory
- [ ] Translation files exist with correct keys
- [ ] Form labels display translated values
