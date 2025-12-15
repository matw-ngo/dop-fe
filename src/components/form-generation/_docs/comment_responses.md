# Cập Nhật Implementation Plan

## ✅ Comment #1: TailwindCSS Styling

**Vấn đề:** Hệ thống styling nên dùng TailwindCSS không?

**Giải pháp:** Đã cập nhật plan để sử dụng TailwindCSS (đã có sẵn trong project):

### Thay đổi:

1. **Loại bỏ**: `styles/form-generation.css` (vanilla CSS)

2. **Thêm mới**: `styles/variants.ts` với **class-variance-authority (CVA)**

   ```typescript
   // Ví dụ variant cho field wrapper
   const fieldWrapperVariants = cva(
     "flex flex-col gap-1.5 w-full",
     {
       variants: {
         size: { sm: "text-sm", md: "text-base", lg: "text-lg" },
         variant: { default: "", inline: "flex-row items-center gap-4" }
       }
     }
   )
   ```

3. **Component Variants** bao gồm:
   - Field Wrapper Variants
   - Input Variants (shared styling)
   - Label Variants (default, inline, floating)
   - Error Variants
   - Helper Text Variants

4. **Tích hợp với hệ thống hiện tại**:
   - Sử dụng TailwindCSS v4 (đã cài)
   - Sử dụng `class-variance-authority` (đã có)
   - Có thể leverage Radix UI components từ `@/components/ui`

---

## ✅ Comment #2: i18n Implementation

**Vấn đề:** i18n nên triển khai thế nào?

**Giải pháp:** Tích hợp với **next-intl** (đã có sẵn) và cache system tại `@/lib/i18n`:

### Thêm 3 files mới:

#### 1. `i18n/useFormTranslations.ts`
Hook để lấy translations cho form fields:

```typescript
const { t, getFieldLabel, getFieldError } = useFormTranslations('loan')

// Auto generate keys:
// forms.loan.amount.label
// forms.loan.amount.placeholder  
// forms.loan.amount.errors.required
```

#### 2. `i18n/translations.ts`
Translation key generators và utilities:

```typescript
// Key generation functions
getFieldLabel(namespace, fieldId) // → 'forms.{namespace}.{fieldId}.label'
getFieldError(namespace, fieldId, errorType) // → 'forms.{namespace}.{fieldId}.errors.{errorType}'
getValidationMessage(rule) // → 'forms.validation.{rule}'
```

**Cấu trúc translation file:**
```json
{
  "forms": {
    "loan": {
      "amount": {
        "label": "Số tiền vay",
        "placeholder": "Nhập số tiền",
        "help": "Số tiền bạn muốn vay",
        "errors": {
          "required": "Vui lòng nhập số tiền",
          "min": "Số tiền tối thiểu là ${min}",
          "max": "Số tiền tối đa là ${max}"
        }
      }
    },
    "validation": {
      "required": "Trường này là bắt buộc",
      "email": "Vui lòng nhập email hợp lệ"
    }
  }
}
```

#### 3. `i18n/FormTranslationProvider.tsx`
Context provider cho form-level translation:

- Set default namespace cho tất cả fields
- Provide translation helpers
- Handle locale switching
- Pre-warm cache với common translations

### Cập nhật Types:

**`FieldConfig` type** thêm i18n configuration:
```typescript
interface FieldConfig {
  // ... existing fields
  i18n?: {
    labelKey?: string        // Custom translation key
    placeholderKey?: string  
    helpKey?: string
    namespace?: string       // Override default namespace
    enabled?: boolean        // Enable/disable auto-translation
  }
}
```

**`DynamicFormConfig` type** thêm form-level i18n:
```typescript
interface DynamicFormConfig {
  // ... existing fields
  i18n?: {
    namespace: string  // Default namespace for all fields
    locale?: string    // Form locale
  }
}
```

### Tính năng:

✅ **Auto-translation**: Tự động translate labels, placeholders, help text  
✅ **Custom keys**: Override translation keys cho từng field  
✅ **Variable interpolation**: Support `{min}`, `{max}` trong error messages  
✅ **Fallback**: Hiển thị field ID nếu không có translation  
✅ **Cache integration**: Sử dụng cache system hiện có tại `@/lib/i18n`  
✅ **Namespace isolation**: Mỗi form có namespace riêng

---

## 📋 Tổng Kết

| Aspect | Solution | Status |
|--------|----------|--------|
| **Styling** | TailwindCSS + CVA | ✅ Updated |
| **i18n** | next-intl + custom cache | ✅ Updated |
| **Forms** | react-hook-form + zod | ✅ Integrated |
| **UI Components** | Radix UI (existing) | ✅ Leveraged |

Tất cả đã được cập nhật vào **implementation_plan.md**.
