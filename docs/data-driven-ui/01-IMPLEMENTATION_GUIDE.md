# Hướng dẫn Triển khai (Implementation Guide)

Tài liệu này mô tả chi tiết luồng hoạt động và cách các thành phần chính của kiến trúc Data-Driven UI tương tác với nhau.

## 1. Luồng hoạt động tổng thể

Luồng dữ liệu và xử lý diễn ra theo một chu trình rõ ràng, biến đổi dữ liệu thô từ Backend thành giao diện người dùng hoàn chỉnh.

```mermaid
graph TD
    A[Backend API] -- Gửi cấu hình thô (JSON) --> B(Frontend: useQuery);
    B -- Dữ liệu thô --> C{Xử lý và Hợp nhất};
    C -- Hợp nhất với --> D[DefaultFieldConfig.ts];
    C -- Dữ liệu đã hoàn thiện --> E[Component FormRenderer];
    E -- Lặp qua các field --> F(Component FieldRenderer);
    F -- Tra cứu component --> G[ComponentRegistry.ts];
    G -- Trả về component React --> F;
    F -- Render --> H[Giao diện người dùng (UI)];
```

1.  **Fetch dữ liệu:** Component cha (`FormRenderer`) sử dụng hook `useQuery` (từ TanStack Query) để gọi API và lấy cấu hình các steps/fields từ Backend.
2.  **Hợp nhất:** Ngay sau khi nhận được dữ liệu, `FormRenderer` lặp qua từng field thô và hợp nhất nó với cấu hình mặc định tương ứng từ file `DefaultFieldConfig.ts`. Quá trình này tạo ra một object cấu hình "hoàn hảo", đảm bảo mọi props cần thiết đều có mặt.
3.  **Render Form:** `FormRenderer` bắt đầu render, nó lặp qua danh sách các field đã được xử lý.
4.  **Render Field:** Với mỗi field, `FormRenderer` gọi component `FieldRenderer` và truyền vào object cấu hình hoàn hảo của field đó.
5.  **Tra cứu Component:** `FieldRenderer` đọc thuộc tính `component` (ví dụ: `"Input"`) từ cấu hình và tra cứu trong `ComponentRegistry.ts` để lấy về component React thực tế.
6.  **Render Component:** `FieldRenderer` render component React vừa tra cứu được, và "rải" (spread) tất cả các props trong cấu hình vào component đó, đồng thời kết nối nó với `react-hook-form`.

## 2. Các thành phần chính

### `ComponentRegistry.ts` (Sổ đăng ký Component)

Đây là một object JavaScript đơn giản, đóng vai trò là một bản đồ (map) giữa tên component (dạng `string`) và chính component đó (đã được import).

-   **Mục đích:** Cho phép hệ thống render động component dựa trên một chuỗi ký tự do Backend chỉ định.
-   **Vị trí (đề xuất):** `src/components/renderer/ComponentRegistry.ts`

```typescript
// src/components/renderer/ComponentRegistry.ts
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';

// Thêm các component khác bạn muốn hỗ trợ ở đây

export const ComponentRegistry = {
  Input,
  Slider,
  Checkbox,
};

// Kiểu dữ liệu này giúp giới hạn các giá trị string mà BE có thể gửi lên
export type RegisteredComponent = keyof typeof ComponentRegistry;
```

### `DefaultFieldConfig.ts` (Khuôn mẫu Mặc định)

File này định nghĩa giao diện và các giá trị mặc định cho mỗi component được đăng ký trong `ComponentRegistry`.

-   **Mục đích:** Đảm bảo sự ổn định. Ngay cả khi Backend gửi cấu hình tối giản, Frontend vẫn có đủ thông tin để render một component hoàn chỉnh, tránh lỗi và đảm bảo tính nhất quán.
-   **Vị trí (đề xuất):** `src/configs/DefaultFieldConfig.ts`

```typescript
// src/configs/DefaultFieldConfig.ts
import { RegisteredComponent } from '@/components/renderer/ComponentRegistry';

// Định nghĩa cấu trúc của một field
interface FieldConfig {
  component: RegisteredComponent;
  props: { [key: string]: any };
  // Thêm các thuộc tính chung khác nếu cần
}

// Record này chứa các khuôn mẫu mặc định
export const DefaultFieldConfig: Partial<Record<RegisteredComponent, FieldConfig>> = {
  Input: {
    component: 'Input',
    props: {
      type: 'text',
    },
  },
  Slider: {
    component: 'Slider',
    props: {
      min: 0,
      max: 100,
      step: 1,
      defaultValue: [50],
    },
  },
  Checkbox: {
    component: 'Checkbox',
    props: {},
  },
};
```

### `FieldRenderer.tsx` (Component Render Field)

Đây là component cốt lõi, chịu trách nhiệm render một field duy nhất.

-   **Mục đích:** Đọc một object cấu hình đã hoàn thiện, tra cứu component, và render nó ra giao diện, đồng thời kết nối với `react-hook-form`.
-   **Vị trí (đề xuất):** `src/components/renderer/FieldRenderer.tsx`

```tsx
// src/components/renderer/FieldRenderer.tsx
import { useFormContext } from 'react-hook-form';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { ComponentRegistry } from './ComponentRegistry';

// Giả sử config và các kiểu dữ liệu được định nghĩa ở một file chung
interface FieldRendererProps {
  fieldConfig: any; // Thay bằng kiểu dữ liệu FieldConfig hoàn chỉnh
}

export const FieldRenderer = ({ fieldConfig }: FieldRendererProps) => {
  // Lấy context từ react-hook-form, được cung cấp bởi FormRenderer
  const { control } = useFormContext();
  const { component, fieldName, props } = fieldConfig;

  const ComponentToRender = ComponentRegistry[component];

  if (!ComponentToRender) {
    console.error(`Component "${component}" is not registered.`);
    return <div>Lỗi: Component không tồn tại.</div>;
  }

  // Tách các props dành cho i18n hoặc các logic đặc biệt khác ra khỏi props chung
  const { label, description, ...restProps } = props;

  return (
    <FormField
      control={control}
      name={fieldName}
      render={({ field }) => (
        <FormItem>
          {label && <FormLabel>{label}</FormLabel>}
          
          <FormControl>
            <ComponentToRender {...field} {...restProps} />
          </FormControl>

          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
```

## 3. Hướng dẫn thêm một Component mới

Quy trình thêm một component mới vào hệ thống rất đơn giản và có cấu trúc.

**Ví dụ: Thêm component `DatePicker`**

1.  **Tạo hoặc Import Component:**
    Đảm bảo bạn có một component `DatePicker` sẵn sàng để sử dụng. Giả sử nó nằm ở `@/components/ui/date-picker`.

2.  **Đăng ký vào `ComponentRegistry.ts`:**
    Mở file và thêm component vừa import vào.

    ```typescript
    // src/components/renderer/ComponentRegistry.ts
    import { Input } from '@/components/ui/input';
    import { Slider } from '@/components/ui/slider';
    import { DatePicker } from '@/components/ui/date-picker'; // <-- Thêm import

    export const ComponentRegistry = {
      Input,
      Slider,
      DatePicker, // <-- Thêm vào object
    };
    ```

3.  **Thêm Khuôn mẫu vào `DefaultFieldConfig.ts`:**
    Cung cấp các giá trị mặc định hợp lý cho `DatePicker`.

    ```typescript
    // src/configs/DefaultFieldConfig.ts
    export const DefaultFieldConfig: Partial<Record<RegisteredComponent, FieldConfig>> = {
      // ... các component khác
      DatePicker: {
        component: 'DatePicker',
        props: {
          // có thể thêm các props mặc định cho DatePicker ở đây
        },
      },
    };
    ```

4.  **Thông báo cho Backend:**
    Thông báo cho đội ngũ Backend rằng component `"DatePicker"` đã sẵn sàng để sử dụng. Cung cấp cho họ tên các props mà component này hỗ trợ (ví dụ: `disabledDays`, `format`, v.v.) để họ có thể gửi lên trong object `props`.

Sau khi hoàn thành 4 bước trên, hệ thống đã sẵn sàng để render động component `DatePicker` ở bất cứ đâu Backend chỉ định.
