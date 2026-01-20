# Fix i18n Namespace for Loan Form - Complete Work Plan

## Context

### Root Cause (Confirmed from Investigation)
| Component | Issue | Location |
|-----------|-------|----------|
| **loan-form-config-builder.ts** | Config KHÔNG có `i18n` property | Lines 332-351 |
| **StepWizard.tsx** | KHÔNG truyền `namespace` xuống StepContent | Lines 91-94 |
| **StepContent.tsx** | KHÔNG nhận/truyền `namespace` xuống FieldFactory | Lines 98-109 |
| **FieldFactory.tsx** | Default `namespace="common"` | Line 133 |

### Current Broken Flow
```
Config (id: "loan-application")
  → StepWizard KHÔNG truyền i18n
  → StepContent KHÔNG nhận namespace
  → FieldFactory (namespace="common")
  → "forms.common.expected_amount.label" → KHÔNG TÌM THẤY!
  → Fallback: Raw key hiển thị
```

### Fixed Flow (After Implementation)
```
Config (i18n: { namespace: "loan-application" })
  → StepWizard truyền namespace
  → StepContent truyền namespace  
  → FieldFactory (namespace="loan-application")
  → "forms.loan-application.expected_amount.label" → TÌM THẤY!
  → "Số tiền vay" hiển thị đúng
```

---

## Work Objectives

### Core Objective
Fix i18n flow so form labels display translations from `forms.loan-application.*` namespace instead of falling back to raw keys or "common" namespace.

### Concrete Deliverables
1. Add `i18n` property to config in `buildLoanFormConfigFromStep()`
2. Pass `namespace` from StepWizard → StepContent → FieldFactory
3. Enable i18n on ALL form fields
4. Create translation files for VI and EN

### Definition of Done
- [ ] Form labels show "Số tiền vay" instead of raw keys
- [ ] All form field labels use `loan-application` namespace
- [ ] Validation messages also translated
- [ ] Translation keys follow pattern: `forms.loan-application.{fieldId}.label`

---

## Task Flow

```
Task 1 (Config Builder - Add i18n property)
    ↓
Task 2 (StepWizard - Pass namespace)
    ↓
Task 3 (StepContent - Accept & pass namespace)
    ↓
Task 4 (VI Translation File)
    ↓
Task 5 (EN Translation File)
    ↓
Task 6 (Verify)
```

---

## TODOs

### Task 1: Add i18n property to loan-form-config-builder.ts

**What to do**:
- Edit `src/lib/builders/loan-form-config-builder.ts`
- Add `i18n: { namespace: "loan-application" }` to returned config
- Enable i18n on ALL fields (change `enabled: false` to `enabled: true`)
- Remove hard-coded labels from fields (use translation keys)

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

// For each field - ENABLE i18n and remove hard-coded labels:
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

**Parallelizable**: NO (first task)

**References**:
- `src/lib/builders/loan-form-config-builder.ts` - Config builder
- `src/components/form-generation/types.ts:FormI18nConfig` - Type definition (lines 793-803)

**Acceptance Criteria**:
- [ ] Config has `i18n: { namespace: "loan-application" }`
- [ ] All fields have `i18n.enabled: true`
- [ ] All hard-coded labels removed from fields

**Commit**: YES
- Message: `fix(builders): add i18n namespace and enable translations`
- Files: `src/lib/builders/loan-form-config-builder.ts`

---

### Task 2: Pass namespace from StepWizard to StepContent

**What to do**:
- Edit `src/components/form-generation/wizard/StepWizard.tsx`
- Pass `config.i18n?.namespace` to `StepContent` component

**Changes required**:
```typescript
// Lines 91-94 - Add namespace prop to StepContent
<StepContent
  step={currentStepConfig}
  showTitle={config.navigation?.showStepHeader}
  namespace={config.i18n?.namespace}  // ← ADD THIS
/>
```

**Parallelizable**: NO (depends on Task 1)

**References**:
- `src/components/form-generation/wizard/StepWizard.tsx` - Component file
- `src/components/form-generation/wizard/StepContent.tsx` - Receives the prop

**Acceptance Criteria**:
- [ ] StepContent receives `namespace` prop from config

**Commit**: YES
- Message: `fix(wizard): pass i18n namespace from config to StepContent`
- Files: `src/components/form-generation/wizard/StepWizard.tsx`

---

### Task 3: Update StepContent to accept and pass namespace to FieldFactory

**What to do**:
- Edit `src/components/form-generation/wizard/StepContent.tsx`
- Accept `namespace` prop
- Pass `namespace` to all `FieldFactory` components

**Changes required**:
```typescript
// Lines 11-15 - Add namespace to props interface
interface StepContentProps {
  step: FormStep;
  className?: string;
  showTitle?: boolean;
  namespace?: string;  // ← ADD THIS
}

// Lines 17-21 - Destructure namespace
export function StepContent({
  step,
  className,
  showTitle = true,
  namespace,  // ← ADD THIS
}: StepContentProps) {

// Lines 98-109 - Pass namespace to FieldFactory
{step.fields.filter(isFieldVisible).map((field) => (
  <FieldFactory
    key={field.id}
    field={field}
    value={stepData[field.name]}
    onChange={(value) => updateFieldValue(step.id, field.name, value)}
    onBlur={() => {}}
    error={meta?.errors?.[field.name]}
    namespace={namespace || "common"}  // ← ADD THIS
  />
))}
```

**Parallelizable**: NO (depends on Task 2)

**References**:
- `src/components/form-generation/wizard/StepContent.tsx` - Component file
- `src/components/form-generation/factory/FieldFactory.tsx:101` - Accepts namespace prop

**Acceptance Criteria**:
- [ ] StepContent accepts `namespace` prop
- [ ] FieldFactory receives correct namespace

**Commit**: YES
- Message: `fix(wizard): pass namespace to FieldFactory for translations`
- Files: `src/components/form-generation/wizard/StepContent.tsx`

---

### Task 4: Create Vietnamese translation file

**What to do**:
- Create `messages/vi/forms/loan-application.json`

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
        "placeholder": "Tháng"
      },
      "loan_purpose": {
        "label": "Mục đích vay",
        "placeholder": "Chọn mục đích vay"
      },
      "fullName": {
        "label": "Họ và tên",
        "placeholder": "Nhập họ và tên",
        "errors": {
          "required": "Vui lòng nhập họ tên",
          "minLength": "Họ tên phải có ít nhất 2 ký tự"
        }
      },
      "nationalId": {
        "label": "Căn cước công dân",
        "placeholder": "Nhập số CCCD",
        "errors": {
          "required": "Vui lòng nhập số CCCD",
          "pattern": "CCCD phải có 12 số"
        }
      },
      "email": {
        "label": "Email",
        "placeholder": "Nhập địa chỉ email",
        "errors": {
          "required": "Vui lòng nhập email",
          "email": "Email không hợp lệ"
        }
      },
      "location": {
        "label": "Tỉnh/Thành phố",
        "placeholder": "Chọn tỉnh/thành phố",
        "errors": {
          "required": "Vui lòng chọn tỉnh/thành phố"
        }
      },
      "birthday": {
        "label": "Ngày sinh",
        "placeholder": "Chọn ngày sinh",
        "errors": {
          "required": "Vui lòng chọn ngày sinh"
        }
      },
      "gender": {
        "label": "Giới tính",
        "placeholder": "Chọn giới tính",
        "errors": {
          "required": "Vui lòng chọn giới tính"
        }
      },
      "income": {
        "label": "Mức thu nhập hàng tháng",
        "placeholder": "Chọn mức thu nhập",
        "errors": {
          "required": "Vui lòng chọn mức thu nhập"
        }
      },
      "agreeStatus": {
        "label": ""
      }
    },
    "validation": {
      "required": "Trường này là bắt buộc",
      "email": "Email không hợp lệ",
      "minLength": "Tối thiểu {min} ký tự",
      "maxLength": "Tối đa {max} ký tự",
      "min": "Giá trị phải lớn hơn hoặc bằng {min}",
      "max": "Giá trị phải nhỏ hơn hoặc bằng {max}",
      "pattern": "Định dạng không hợp lệ"
    }
  }
}
```

**References**:
- `messages/vi/forms/main.json` - Existing translation file pattern

**Acceptance Criteria**:
- [ ] File created at `messages/vi/forms/loan-application.json`
- [ ] Contains all field labels and placeholders
- [ ] Contains validation error messages

**Commit**: YES
- Message: `feat(i18n): add Vietnamese translations for loan application form`
- Files: `messages/vi/forms/loan-application.json`

---

### Task 5: Create English translation file

**What to do**:
- Create `messages/en/forms/loan-application.json`

**File structure**:
```json
{
  "forms": {
    "loan-application": {
      "expected_amount": {
        "label": "Loan Amount",
        "placeholder": "Enter loan amount"
      },
      "loan_period": {
        "label": "Loan Term",
        "placeholder": "Months"
      },
      "loan_purpose": {
        "label": "Loan Purpose",
        "placeholder": "Select purpose"
      },
      "fullName": {
        "label": "Full Name",
        "placeholder": "Enter full name",
        "errors": {
          "required": "Please enter your full name",
          "minLength": "Name must be at least 2 characters"
        }
      },
      "nationalId": {
        "label": "National ID",
        "placeholder": "Enter ID number",
        "errors": {
          "required": "Please enter your ID number",
          "pattern": "ID must be 12 digits"
        }
      },
      "email": {
        "label": "Email",
        "placeholder": "Enter email address",
        "errors": {
          "required": "Please enter your email",
          "email": "Invalid email address"
        }
      },
      "location": {
        "label": "Province/City",
        "placeholder": "Select province/city",
        "errors": {
          "required": "Please select province/city"
        }
      },
      "birthday": {
        "label": "Date of Birth",
        "placeholder": "Select date of birth",
        "errors": {
          "required": "Please select date of birth"
        }
      },
      "gender": {
        "label": "Gender",
        "placeholder": "Select gender",
        "errors": {
          "required": "Please select gender"
        }
      },
      "income": {
        "label": "Monthly Income",
        "placeholder": "Select income range",
        "errors": {
          "required": "Please select income range"
        }
      },
      "agreeStatus": {
        "label": ""
      }
    },
    "validation": {
      "required": "This field is required",
      "email": "Invalid email address",
      "minLength": "Minimum {min} characters required",
      "maxLength": "Maximum {max} characters allowed",
      "min": "Value must be at least {min}",
      "max": "Value must be at most {max}",
      "pattern": "Invalid format"
    }
  }
}
```

**References**:
- `messages/en/forms/main.json` - Existing translation file pattern

**Acceptance Criteria**:
- [ ] File created at `messages/en/forms/loan-application.json`
- [ ] Contains all field labels and placeholders in English
- [ ] Contains validation error messages in English

**Commit**: YES
- Message: `feat(i18n): add English translations for loan application form`
- Files: `messages/en/forms/loan-application.json`

---

### Task 6: Verify fix with dev server

**What to do**:
- Start dev server
- Navigate to home page
- Verify form labels display correctly

**Verification Commands**:
```bash
# Start dev server
pnpm dev

# Navigate to http://localhost:3001
# Check LoanProductPanel form
# Expected: "Số tiền vay", "Thời hạn vay", "Mục đích vay" etc.
# NOT Expected: "forms.loan-application.expected_amount.label" or raw keys
```

**Acceptance Criteria**:
- [ ] Dev server starts successfully
- [ ] Form labels show translated values
- [ ] No raw translation keys visible

**Commit**: NO

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
- [ ] All "Must Have" present
- [ ] All "Must NOT Have" absent
- [ ] Form labels display translated values
- [ ] Namespace propagation works end-to-end
