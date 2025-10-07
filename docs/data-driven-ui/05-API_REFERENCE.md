# Tham chiếu API & Kiểu dữ liệu (API Reference & Types)

Tài liệu này định nghĩa các giao diện (interfaces) TypeScript cốt lõi được sử dụng trong toàn bộ kiến trúc Data-Driven UI. Việc sử dụng các kiểu dữ liệu mạnh giúp đảm bảo sự nhất quán, giảm thiểu lỗi và cải thiện trải nghiệm phát triển với tính năng tự động hoàn thành (autocompletion) của IDE.

## 1. Kiểu dữ liệu chính

### `RegisteredComponent`

Kiểu dữ liệu này là một union của các chuỗi ký tự, đại diện cho tất cả các tên component đã được đăng ký trong `ComponentRegistry`. Nó hoạt động như một "enum" để giới hạn các giá trị mà Backend có thể gửi cho thuộc tính `component`.

```typescript
// src/components/renderer/ComponentRegistry.ts

export const ComponentRegistry = {
  Input: Input,
  Slider: Slider,
  // ...
};

// Ví dụ: "Input" | "Slider"
export type RegisteredComponent = keyof typeof ComponentRegistry;
```

### `ValidationRule`

Định nghĩa cấu trúc của một quy tắc validation.

```typescript
// src/types/data-driven-ui.d.ts

export interface ValidationRule {
  /** Loại quy tắc, tương ứng với một phương thức của Zod (ví dụ: "required", "minLength", "email") */
  type: string;

  /** Giá trị của quy tắc (nếu có), ví dụ: 8 cho minLength */
  value?: any;

  /** Key i18n cho thông báo lỗi */
  messageKey: string;
}
```

### `FieldProps`

Định nghĩa cấu trúc của object `props` trong `FieldConfig`. Đây là một object linh hoạt, chứa cả các props cần dịch và các props sẽ được "rải" trực tiếp vào component.

```typescript
// src/types/data-driven-ui.d.ts
import { ValidationRule } from './data-driven-ui.d.ts';

export interface FieldProps {
  /** (Tùy chọn) Key i18n cho nhãn của field */
  labelKey?: string;

  /** (Tùy chọn) Key i18n cho placeholder của field */
  placeholderKey?: string;

  /** (Tùy chọn) Key i18n cho mô tả/hướng dẫn của field */
  descriptionKey?: string;

  /** (Tùy chọn) Mảng các quy tắc validation cho field */
  validations?: ValidationRule[];

  /** Bất kỳ props nào khác sẽ được truyền trực tiếp vào component */
  [key: string]: any;
}
```

### `FieldConfig`

Đây là kiểu dữ liệu quan trọng nhất, định nghĩa cấu trúc hoàn chỉnh của một field sau khi đã được hợp nhất với khuôn mẫu mặc định.

```typescript
// src/types/data-driven-ui.d.ts
import { RegisteredComponent, FieldProps } from './data-driven-ui.d.ts';

export interface FieldConfig {
  /** Tên định danh của field, được sử dụng bởi react-hook-form */
  fieldName: string;

  /** Tên component đã được đăng ký trong ComponentRegistry */
  component: RegisteredComponent;

  /** Object chứa tất cả các props cho component */
  props: FieldProps;

  /** (Tùy chọn) Điều kiện để hiển thị field này */
  condition?: {
    fieldName: string;
    operator: 'equals' | 'notEquals' | 'contains'; // Mở rộng khi cần
    value: any;
  };
}
```

### `StepConfig`

Định nghĩa cấu trúc của một step trong luồng.

```typescript
// src/types/data-driven-ui.d.ts
import { FieldConfig } from './data-driven-ui.d.ts';

export interface StepConfig {
  /** Tên định danh của step */
  stepName: string;

  /** Thứ tự hiển thị của step */
  order: number;

  /** Mảng các cấu hình field thuộc step này */
  fields: FieldConfig[];
}
```

## 2. Cấu trúc API Response từ Backend

Backend nên trả về một mảng các `StepConfig`. Tuy nhiên, các object `FieldConfig` và `FieldProps` có thể ở dạng thô (chưa hợp nhất), tức là có thể thiếu các thuộc tính sẽ được Frontend điền vào từ `DefaultFieldConfig`.

**Ví dụ API Response:**

```json
[
  {
    "stepName": "personalInfo",
    "order": 1,
    "fields": [
      {
        "fieldName": "email",
        "component": "Input",
        "props": {
          "labelKey": "form.field.email.label",
          "validations": [
            { "type": "required", "messageKey": "form.error.required" },
            { "type": "email", "messageKey": "form.error.email.invalid" }
          ]
        }
      },
      {
        "fieldName": "fullName",
        "component": "Input",
        "props": {
          "labelKey": "form.field.fullName.label"
        }
      }
    ]
  }
]
```

Việc định nghĩa và sử dụng chặt chẽ các kiểu dữ liệu này trong toàn bộ dự án Frontend sẽ giúp phát hiện lỗi sớm, tăng cường khả năng bảo trì và làm cho code trở nên dễ đọc và dễ hiểu hơn.
