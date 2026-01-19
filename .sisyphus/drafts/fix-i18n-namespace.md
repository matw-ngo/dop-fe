# Draft: Fix i18n Namespace for Loan Form

## Root Cause (CONFIRMED from investigation)

| Component | Issue |
|-----------|-------|
| **StepWizard.tsx** | Không truyền `config.i18n.namespace` xuống StepContent (line 91-94) |
| **StepContent.tsx** | Không nhận và không truyền `namespace` xuống FieldFactory (line 98-109) |
| **FieldFactory.tsx** | Default `namespace="common"` khi không nhận được prop (line 133) |
| **loan-form-config-builder.ts** | Config không có `i18n` property, fields có `i18n.enabled: false` |

## Translation Flow (BROKEN)

```
Config (id: "loan-application", nhưng KHÔNG có i18n!)
    ↓
StepWizard → StepContent (không nhận được namespace!)
    ↓
FieldFactory (namespace="common" default)
    ↓
useFormTranslations("common")
    ↓
Tìm "forms.common.expected_amount.label" → KHÔNG TÌM THẤY!
    ↓
Fallback: Hiển thị raw key hoặc fieldId
```

## Translation Flow (FIXED)

```
Config (id: "loan-application", i18n: { namespace: "loan-application" })
    ↓
StepWizard → StepContent(namespace="loan-application")
    ↓
FieldFactory(namespace="loan-application")
    ↓
useFormTranslations("loan-application")
    ↓
Tìm "forms.loan-application.expected_amount.label" → TÌM THẤY!
    ↓
Hiển thị: "Số tiền vay"
```

## Files cần sửa

### 1. loan-form-config-builder.ts (lines 332-351)
Thêm `i18n` property vào returned config:
```typescript
return {
  id: "loan-application",
  i18n: {
    namespace: "loan-application",
  },
  steps: [...],
  navigation: {...},
};
```

### 2. StepWizard.tsx (lines 91-94)
Truyền namespace xuống StepContent:
```tsx
<StepContent
  step={currentStepConfig}
  showTitle={config.navigation?.showStepHeader}
  namespace={config.i18n?.namespace}  // ← THÊM
/>
```

### 3. StepContent.tsx (lines 11-15, 98-109)
Nhận và truyền namespace:
```typescript
interface StepContentProps {
  step: FormStep;
  className?: string;
  showTitle?: boolean;
  namespace?: string;  // ← THÊM
}

// Truyền xuống FieldFactory
<FieldFactory
  key={field.id}
  field={field}
  value={stepData[field.name]}
  onChange={(value) => updateFieldValue(step.id, field.name, value)}
  onBlur={() => {}}
  error={meta?.errors?.[field.name]}
  namespace={namespace || "common"}  // ← THÊM
/>
```

## Translation Files cần tạo

### messages/vi/forms/loan-application.json
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

## Questions cho user

1. Translation keys: `forms.loan-application.{fieldId}.label` đúng không?
2. Enable i18n cho tất cả fields hay chỉ một số?
3. Validation messages cũng translate qua i18n không?
