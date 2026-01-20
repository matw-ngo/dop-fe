# Draft: Fix i18n Translation File Structure

## Requirements (confirmed)
- **Root Cause**: File `messages/vi/forms/loan-application.json` có cấu trúc SAI
- **Current structure** (WRONG):
  ```json
  {
    "loan-application": {
      "expected_amount": { "label": "Số tiền vay" }
    }
  }
  ```
- **Expected structure** (CORRECT):
  ```json
  {
    "expected_amount": { "label": "Số tiền vay" }
  }
  ```

## Technical Decisions
- **Loader behavior** (`split-loader.ts:226-246`):
  - Load file từ `messages/vi/forms/loan-application.json`
  - Tạo key: `forms["loan-application"] = file_content`
  - Result: `forms.loan-application.loan-application.expected_amount.label` ❌ (2x loan-application)

## Research Findings
- Config builder đúng: Có `i18n: { namespace: "loan-application" }`
- StepWizard đúng: Truyền namespace xuống StepContent  
- StepContent đúng: Truyền namespace xuống FieldFactory
- FieldFactory đúng: Gọi `useFormTranslations(namespace)`
- useFormTranslations đúng: Tạo key `forms.${namespace}.${fieldId}.label`
- **CHỈ có file translation SAI cấu trúc**

## Files to Fix
1. `messages/vi/forms/loan-application.json`
2. `messages/en/forms/loan-application.json` (nếu tồn tại)

## Scope Boundaries
- IN: Sửa cấu trúc JSON trong translation files
- OUT: Không thay đổi code logic (config builder, components đã đúng)

## Open Questions
- Test strategy: TDD/Tests-after hay Manual QA?

## Files to Fix
1. `messages/vi/forms/loan-application.json` - CẤU TRÚC SAI
2. `messages/en/forms/loan-application.json` - CẤU TRÚC SAI

## Current (WRONG) Structure - Cả 2 files
```json
{
  "loan-application": {           // ← THỪA! Loader tự thêm wrapper này
    "expected_amount": { "label": "Số tiền vay" }
  }
}
```

## Expected (CORRECT) Structure
```json
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
