#Hệ thống Validation Động (Dynamic Validation)

Tài liệu này mô tả cách kiến trúc Data-Driven UI xử lý việc xác thực (validation) dữ liệu form một cách linh hoạt, cho phép Backend định nghĩa các quy tắc và Frontend tự động áp dụng chúng.

## 1. Nguyên tắc

-   **Backend định nghĩa quy tắc:** Logic nghiệp vụ, bao gồm cả các quy tắc validation (ví dụ: trường này có bắt buộc không, độ dài tối thiểu là bao nhiêu), thuộc về trách nhiệm của Backend.
-   **Frontend thực thi:** Frontend nhận các quy tắc này, dịch chúng thành một schema validation cụ thể (sử dụng thư viện `zod`), và áp dụng vào `react-hook-form`.
-   **JSON-Serializable:** Các quy tắc validation phải được định nghĩa ở định dạng JSON để có thể dễ dàng truyền qua API.

## 2. Cấu trúc Quy tắc Validation

Chúng ta định nghĩa một mảng `validations` trong `props` của mỗi field. Mỗi phần tử trong mảng là một object đại diện cho một quy tắc.

```json
// Ví dụ: Cấu trúc một quy tắc
{
  "type": "required", // Loại quy tắc (tương ứng với một phương thức của zod)
  "messageKey": "form.error.required" // Key i18n cho thông báo lỗi
}

// Ví dụ: Quy tắc có giá trị
{
  "type": "minLength",
  "value": 8,
  "messageKey": "form.error.minLength"
}
```

### Cấu trúc dữ liệu từ Backend

Backend sẽ gửi mảng `validations` này cùng với các props khác.

```json
// Ví dụ: Dữ liệu BE gửi về
{
  "fieldName": "password",
  "component": "Input",
  "props": {
    "type": "password",
    "labelKey": "form.field.password.label",
    "validations": [
      {
        "type": "required",
        "messageKey": "form.error.required"
      },
      {
        "type": "minLength",
        "value": 8,
        "messageKey": "form.error.password.minLength"
      },
      {
        "type": "regex",
        "value": "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)[a-zA-Z\\d]{8,}",
        "messageKey": "form.error.password.regex"
      }
    ]
  }
}
```

## 3. Triển khai ở Frontend

### `DefaultFieldConfig.ts`

Khuôn mẫu mặc định cũng có thể chứa các quy tắc validation cơ bản. Ví dụ, một trường `email` mặc định luôn phải là định dạng email.

```typescript
// src/configs/DefaultFieldConfig.ts
export const DefaultFieldConfig = {
  EmailInput: { // Ví dụ một component tùy chỉnh cho email
    component: 'Input',
    props: {
      labelKey: 'form.field.email.label',
      type: 'email',
      validations: [
        {
          type: 'required',
          messageKey: 'form.error.required',
        },
        {
          type: 'email',
          messageKey: 'form.error.email.invalid',
        },
      ],
    },
  },
};
```

### Hàm `generateZodSchema`

Đây là một hàm tiện ích (utility function) cốt lõi, chịu trách nhiệm dịch mảng `validations` thành một schema của `zod`.

-   **Vị trí (đề xuất):** `src/lib/zod-generator.ts`

```typescript
// src/lib/zod-generator.ts
import { z } from 'zod';

// Hàm này nhận vào mảng cấu hình các field của một step
export const generateZodSchema = (fields: any[], t: (key: string) => string) => {
  const schemaShape = fields.reduce((shape, field) => {
    // Bắt đầu với một schema cơ bản, ví dụ z.string()
    // Có thể mở rộng để hỗ trợ z.number(), z.boolean() dựa trên một `dataType` từ BE
    let fieldSchema = z.string();

    const validations = field.props?.validations || [];

    // Áp dụng từng quy tắc validation
    validations.forEach(rule => {
      const message = rule.messageKey ? t(rule.messageKey, { value: rule.value }) : undefined;

      switch (rule.type) {
        case 'required':
          // Đối với string, dùng .min(1) thay cho .nonempty() để tùy chỉnh message dễ hơn
          fieldSchema = fieldSchema.min(1, { message });
          break;
        case 'minLength':
          fieldSchema = fieldSchema.min(rule.value, { message });
          break;
        case 'maxLength':
          fieldSchema = fieldSchema.max(rule.value, { message });
          break;
        case 'email':
          fieldSchema = fieldSchema.email({ message });
          break;
        case 'regex':
          fieldSchema = fieldSchema.regex(new RegExp(rule.value), { message });
          break;
        // Thêm các `case` khác cho các quy tắc bạn muốn hỗ trợ
      }
    });

    // Nếu field không bắt buộc, thêm .optional() 
    if (!validations.some(rule => rule.type === 'required')) {
      fieldSchema = fieldSchema.optional().or(z.literal(''));
    }

    shape[field.fieldName] = fieldSchema;
    return shape;
  }, {});

  return z.object(schemaShape);
};
```

### Tích hợp vào `FormRenderer`

Component cha sẽ sử dụng hàm `generateZodSchema` để tạo schema và cung cấp cho `react-hook-form`.

```tsx
// src/components/renderer/FormRenderer.tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { generateZodSchema } from '@/lib/zod-generator';
import { useTranslations } from 'next-intl';

const FormRenderer = ({ fields, onSubmit }) => {
  const t = useTranslations('Errors'); // Namespace cho các thông báo lỗi

  // Tạo schema động
  const formSchema = generateZodSchema(fields, t);

  const form = useForm({
    resolver: zodResolver(formSchema),
    // ... các cài đặt khác
  });

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        {fields.map(field => (
          <FieldRenderer key={field.fieldName} fieldConfig={field} />
        ))}
        <Button type="submit">Submit</Button>
      </form>
    </FormProvider>
  );
};
```

Với hệ thống này, Backend có toàn quyền kiểm soát logic validation của form mà không cần Frontend phải thay đổi code. Frontend chỉ cần đảm bảo hàm `generateZodSchema` hỗ trợ các loại quy tắc mà Backend có thể gửi lên.
