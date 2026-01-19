# Draft: Loan Form i18n Integration Plan

## Current State Analysis

### Translation Files Structure (messages/{locale}/forms/main.json)
```json
{
  "common": {
    "full_name": {
      "label": "Họ và tên",
      "placeholder": "Nhập họ và tên"
    },
    "national_id": { ... },
    "province": { ... },
    "income": { ... },
    "credit_status": { ... }
  },
  "validation": {
    "required": "Trường này là bắt buộc",
    "pattern": "Định dạng không hợp lệ"
  }
}
```

### Current loan-form-config.ts Issues
| Issue | Location | Impact |
|-------|----------|--------|
| Wrong namespace | Line 54-56: `i18n: { namespace: "loan" }` | Won't match translation files |
| Hard-coded step titles | Lines 69, 167, 311 | Not translated |
| Hard-coded field labels | Lines 75, 87, 88, etc. | Not translated |
| Hard-coded choices labels | Lines 124-127, 143-146, etc. | Not translated |
| `i18n.enabled: false` | Multiple field configs | Explicitly disabled |

### Existing "common" namespace overlaps
Many fields in loan-form-config.ts already have translations in `forms.common`:
- `fullName` → `full_name`
- `idCard` → `national_id`  
- `city` → `province`
- `jobStatus` → `career_status`
- `monthlyIncome` → `income`
- `existingLoans` → `having_loan`
- `creditHistory` → `credit_status`

## Namespace Recommendation

### Problem with "loan"
- Too general/vague
- Could conflict with other loan-related features
- Doesn't match existing patterns

### Recommended Namespace Structure

**Option A: Hierarchical (Recommended)**
```
loan-application.personal    // Step 1: Personal info
loan-application.income      // Step 2: Income info  
loan-application.financial   // Step 3: Financial info
```

**Option B: Flat but specific**
```
loan-application-personal
loan-application-income
loan-application-financial
```

**Option C: Unified (Simpler)**
```
loan-application-form
```

### Decision: Option A (Hierarchical)

**Rationale:**
1. Clear separation of concerns
2. Easy to maintain and extend
3. Matches step structure in config
4. Follows best practices for form i18n organization

## Translation Keys Structure

### Step 1: Personal Info (loan-application.personal)
```
forms.loan-application.personal.title              // "Thông tin vay"
forms.loan-application.personal.section.personal   // "Thông tin cá nhân"
forms.loan-application.personal.fullName.label     // "Họ và tên"
forms.loan-application.personal.fullName.placeholder
forms.loan-application.personal.fullName.errors.required
forms.loan-application.personal.idCard.label       // "Căn cước công dân 12 Số"
forms.loan-application.personal.idCard.placeholder
forms.loan-application.personal.idCard.errors.required
forms.loan-application.personal.idCard.errors.pattern
forms.loan-application.personal.city.label         // "Tỉnh thành"
forms.loan-application.personal.city.placeholder   // "Vui lòng chọn"
forms.loan-application.personal.city.options.hanoi     // "Hà Nội"
forms.loan-application.personal.city.options.hcm       // "TP. Hồ Chí Minh"
forms.loan-application.personal.city.options.danang    // "Đà Nẵng"
forms.loan-application.personal.vehicleOwnership.label // "Sở hữu Đăng ký/ Cà vẹt xe chính chủ"
forms.loan-application.personal.vehicleOwnership.options.yes  // "Có"
forms.loan-application.personal.vehicleOwnership.options.no   // "Không"
```

### Step 2: Income Info (loan-application.income)
```
forms.loan-application.income.title                 // "Thông tin thu nhập"
forms.loan-application.income.jobStatus.label       // "Tình trạng việc làm"
forms.loan-application.income.jobStatus.options.salaried       // "Đi làm hưởng lương"
forms.loan-application.income.jobStatus.options.self_employed  // "Kinh doanh/Lao động tự do"
forms.loan-application.income.jobStatus.options.unemployed     // "Không có việc làm"
forms.loan-application.income.companyName.label     // "Tên công ty"
forms.loan-application.income.companyName.placeholder
forms.loan-application.income.position.label        // "Chức vụ"
forms.loan-application.income.position.placeholder
forms.loan-application.income.businessType.label    // "Lĩnh vực làm việc"
forms.loan-application.income.businessType.placeholder
forms.loan-application.income.monthlyIncome.label   // "Mức thu nhập"
forms.loan-application.income.monthlyIncome.options.less-5m  // "Dưới 5 triệu"
forms.loan-application.income.monthlyIncome.options.5-10m    // "5 - 10 triệu"
forms.loan-application.income.monthlyIncome.options.10-20m   // "10 - 20 triệu"
forms.loan-application.income.monthlyIncome.options.greater-20m // "Trên 20 triệu"
```

### Step 3: Financial Info (loan-application.financial)
```
forms.loan-application.financial.title              // "Thông tin tài chính"
forms.loan-application.financial.existingLoans.label      // "Hiện tại, Bạn đang có khoản vay..."
forms.loan-application.financial.existingLoans.options.none   // "Không"
forms.loan-application.financial.existingLoans.options.1      // "1 khoản vay"
forms.loan-application.financial.existingLoans.options.2      // "2 khoản vay"
forms.loan-application.financial.existingLoans.options.3      // "3 khoản vay"
forms.loan-application.financial.existingLoans.options.greater-3 // "Trên 3 khoản vay"
forms.loan-application.financial.creditHistory.label     // "Lịch sử tín dụng của bạn trong 3 năm..."
forms.loan-application.financial.creditHistory.options.none      // "Không có nợ xấu"
forms.loan-application.financial.creditHistory.options.group2    // "Đang có nợ xấu hoặc nợ chậm trả nhóm 2"
forms.loan-application.financial.creditHistory.options.group3+   // "Nợ xấu nhóm 3 trở lên"
```

## Implementation Steps

### 1. Update loan-form-config.ts
- Change namespace from "loan" to hierarchical structure
- Remove all hard-coded labels, placeholders, titles
- Enable i18n on all fields (remove `i18n: { enabled: false }`)
- Update choices to use translation keys or keep hard-coded with i18n option

### 2. Create Translation Files
- Add loan-application.personal section to messages/en/forms/main.json
- Add loan-application.income section to messages/en/forms/main.json
- Add loan-application.financial section to messages/en/forms/main.json
- Repeat for Vietnamese (messages/vi/forms/main.json)

### 3. Validation Strategy
- Keep validation errors in forms.validation namespace (already exists)
- For custom messages like "pages.form.errors.pattern", convert to namespace format

## Open Questions

1. **Should choices/labels use i18n keys or hard-coded values?**
   - Option A: Use translation keys for choices
   - Option B: Keep hard-coded but allow translation lookup
   - Recommendation: Option B for simplicity, unless dynamic

2. **Should we merge with "common" namespace?**
   - Common already has similar fields (full_name, national_id, etc.)
   - Could use common for shared fields, specific for loan-specific
   - Decision: Create separate "loan-application" namespace for clarity

3. **Step titles translation?**
   - Currently hard-coded
   - Need to determine how to translate step titles in DynamicFormConfig
   - Likely: step.title becomes translation key
