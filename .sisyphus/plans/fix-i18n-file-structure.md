# Fix i18n Translation File Structure

## Context

### Root Cause (Confirmed from Investigation)
| Component | Issue | Location |
|-----------|-------|----------|
| **messages/vi/forms/loan-application.json** | **EXTRA wrapper key** `"loan-application"` | Root level |
| **messages/en/forms/loan-application.json** | **EXTRA wrapper key** `"loan-application"` | Root level |

### The Bug Chain (Confirmed via Playwright)
```
Current File Structure (WRONG):
messages/vi/forms/loan-application.json
{
  "loan-application": {           // ← EXTRA WRAPPER!
    "expected_amount": { "label": "Số tiền vay" }
  }
}

↓ Loader Behavior (split-loader.ts:226-246)
forms["loan-application"] = {
  "loan-application": {           // ← DOUBLE NESTING!
    "expected_amount": { "label": "Số tiền vay" }
  }
}

↓ Translation Key Usage (useFormTranslations.ts:19-20)
Translation Key: "forms.loan-application.expected_amount.label"
Actual Lookup: forms.loan-application.loan-application.expected_amount.label ❌
```

### Console Error (from Playwright)
```
IntlError: MISSING_MESSAGE: Could not resolve `forms.loan-application.expected_amount.label`
UI Display: "forms.loan-application.expected_amount.label*"
```

### Correct Structure (Expected)
```json
{
  "expected_amount": {
    "label": "Số tiền vay",
    "placeholder": "Nhập số tiền vay"
  },
  "validation": {
    "required": "Trường này là bắt buộc",
    ...
  }
}
```

### Metis Review Findings
- **Only 2 files affected**: VI and EN versions of loan-application.json
- **main.json files are correct**: No wrapper issue
- **Risk level**: LOW - scoped fix, well-understood bug
- **Cache**: No issue (CACHE_TTL = 0 in split-loader.ts)

---

## Work Objectives

### Core Objective
Fix i18n translation file structure so form labels display correctly instead of raw keys.

### Concrete Deliverables
1. Remove wrapper key `"loan-application"` from VI translation file
2. Remove wrapper key `"loan-application"` from EN translation file  
3. Preserve `validation` object at root level
4. Verify UI displays correctly (no console errors, no raw keys)

### Definition of Done
- [ ] No console errors about missing translation keys
- [ ] Form labels show "Số tiền vay" (VI) / "Loan Amount" (EN)
- [ ] No raw translation keys visible on UI
- [ ] Both VI and EN locales work correctly

---

## Task Flow

```
Task 1 (VI Translation File)
    ↓
Task 2 (EN Translation File)
    ↓
Task 3 (Verify with Playwright)
```

---

## TODOs

### Task 1: Fix Vietnamese translation file structure

**What to do**:
- Edit `messages/vi/forms/loan-application.json`
- Remove wrapper key `"loan-application"` from root
- Move all field translations to root level
- Keep `validation` object at root level

**Changes required**:
```json
// BEFORE (WRONG):
{
  "loan-application": {
    "expected_amount": { "label": "Số tiền vay" }
  },
  "validation": { ... }
}

// AFTER (CORRECT):
{
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
```

**Parallelizable**: YES (independent file)

**References**:
- `messages/vi/forms/main.json` - Reference structure (no wrapper)
- `src/lib/i18n/split-loader.ts:226-246` - Loader behavior
- `src/components/form-generation/i18n/useFormTranslations.ts:19-20` - Key generation

**Acceptance Criteria**:
- [ ] File is valid JSON (parse without errors)
- [ ] No `"loan-application"` wrapper key at root
- [ ] All field translations preserved
- [ ] `validation` object preserved at root

**Commit**: YES
- Message: `fix(i18n): remove wrapper from loan-application translation files`
- Files: `messages/vi/forms/loan-application.json`

---

### Task 2: Fix English translation file structure

**What to do**:
- Edit `messages/en/forms/loan-application.json`
- Remove wrapper key `"loan-application"` from root
- Move all field translations to root level
- Keep `validation` object at root level

**Changes required**:
```json
// BEFORE (WRONG):
{
  "loan-application": {
    "expected_amount": { "label": "Loan Amount" }
  },
  "validation": { ... }
}

// AFTER (CORRECT):
{
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
```

**Parallelizable**: YES (independent file, parallel with Task 1)

**References**:
- `messages/en/forms/main.json` - Reference structure (no wrapper)
- `src/lib/i18n/split-loader.ts:226-246` - Loader behavior

**Acceptance Criteria**:
- [ ] File is valid JSON (parse without errors)
- [ ] No `"loan-application"` wrapper key at root
- [ ] All field translations preserved
- [ ] `validation` object preserved at root

**Commit**: YES
- Message: `fix(i18n): remove wrapper from loan-application translation files`
- Files: `messages/en/forms/loan-application.json`

---

### Task 3: Verify fix with Playwright

**What to do**:
- Navigate to home page
- Click "Consumer Loan" button
- Verify no console errors about missing translation keys
- Verify labels display correctly (not raw keys)
- Test both VI and EN locales if possible

**Verification Commands**:
```bash
# Clear build cache (optional)
rm -rf .next

# Start dev server
pnpm dev

# Navigate to http://localhost:3001
# Click "Consumer Loan" button

# Check console for errors:
# BEFORE FIX: IntlError: MISSING_MESSAGE: forms.loan-application.expected_amount.label
# AFTER FIX: No such errors

# Check UI labels:
# Expected: "Số tiền vay" (VI) / "Loan Amount" (EN)
# NOT Expected: "forms.loan-application.expected_amount.label"
```

**Parallelizable**: NO (depends on Task 1 & 2)

**Manual Verification**:
1. Navigate to home page
2. Click "Consumer Loan" button
3. Observe form fields:
   - expected_amount label → "Số tiền vay" (VI) / "Loan Amount" (EN)
   - loan_period label → "Thời hạn vay" (VI) / "Loan Term" (EN)
   - loan_purpose label → "Mục đích vay" (VI) / "Loan Purpose" (EN)
4. Open browser console
5. Verify NO `IntlError: MISSING_MESSAGE` errors
6. Switch locale if possible and verify EN translations

**Acceptance Criteria**:
- [ ] No console errors about missing translation keys
- [ ] Form labels display translated values
- [ ] No raw translation keys visible on UI
- [ ] Both VI and EN locales work correctly

**Commit**: NO

---

## Success Criteria

### Verification Commands
```bash
# Start dev server
pnpm dev

# Navigate to http://localhost:3001
# Click "Consumer Loan"

# Expected:
# - Console: NO IntlError messages
# - UI: Labels show "Số tiền vay", "Thời hạn vay", etc.

# NOT Expected:
# - Console: "MISSING_MESSAGE: forms.loan-application.expected_amount.label"
# - UI: "forms.loan-application.expected_amount.label"
```

### Final Checklist
- [ ] All "Must Have" present
- [ ] All "Must NOT Have" absent
- [ ] No console errors about missing translation keys
- [ ] Form labels display translated values
- [ ] Both VI and EN locales work correctly
