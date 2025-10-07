# Tích hợp Đa ngôn ngữ (i18n)

Tài liệu này giải thích cách kiến trúc Data-Driven UI hỗ trợ đa ngôn ngữ, đảm bảo các thành phần được render động có thể hiển thị đúng ngôn ngữ theo lựa chọn của người dùng.

## 1. Nguyên tắc

Nguyên tắc cốt lõi là: **Backend gửi "key", Frontend dịch "text"**.

-   **Lý do:** Frontend là nơi duy nhất biết được ngôn ngữ mà người dùng đang sử dụng (dựa trên URL, cookie, hoặc cài đặt của trình duyệt). Việc dịch thuật phải xảy ra ở phía client để đảm bảo tính đúng đắn.
-   **Trách nhiệm:**
    -   **Backend:** Chịu trách nhiệm cung cấp các **key định danh** cho tất cả các chuỗi văn bản cần được dịch.
    -   **Frontend:** Chịu trách nhiệm lấy các key này, sử dụng thư viện `next-intl` để tra cứu trong các file ngôn ngữ (`messages/en.json`, `messages/vi.json`) và hiển thị văn bản tương ứng.

## 2. Quy ước đặt tên

Để `FieldRenderer` có thể tự động nhận biết và dịch một thuộc tính, chúng ta sử dụng một quy ước đặt tên đơn giản:

> Bất kỳ thuộc tính nào trong object `props` cần được dịch sẽ có hậu tố là `Key`.

**Ví dụ:**

-   `label` → `labelKey`
-   `placeholder` → `placeholderKey`
-   `description` → `descriptionKey`
-   `errorMessage` → `errorMessageKey`

## 3. Cập nhật luồng hoạt động

### Cấu trúc dữ liệu từ Backend

Backend sẽ gửi về các `...Key` thay vì chuỗi văn bản cứng.

```json
// Ví dụ: Dữ liệu BE gửi về
{
  "fieldName": "fullName",
  "component": "Input",
  "props": {
    "labelKey": "form.field.fullName.label",
    "placeholderKey": "form.field.fullName.placeholder",
    "descriptionKey": "form.field.fullName.description"
  }
}
```

### Cập nhật `DefaultFieldConfig.ts`

Khuôn mẫu mặc định cũng nên tuân theo quy ước này để đảm bảo tính nhất quán.

```typescript
// src/configs/DefaultFieldConfig.ts
export const DefaultFieldConfig = {
  Input: {
    component: 'Input',
    props: {
      labelKey: 'common.defaultLabel', // Key cho label mặc định
      placeholderKey: 'common.defaultPlaceholder', // Key cho placeholder mặc định
    },
  },
  // ...
};
```

### Cập nhật `FieldRenderer.tsx`

`FieldRenderer` được nâng cấp để sử dụng hook `useTranslations` từ `next-intl` và xử lý các `...Key`.

```tsx
// src/components/renderer/FieldRenderer.tsx
import { useTranslations } from 'next-intl';
import { useFormContext } from 'react-hook-form';
// ... các import khác

export const FieldRenderer = ({ fieldConfig }) => {
  const { control } = useFormContext();
  const t = useTranslations(); // Có thể truyền namespace, ví dụ: useTranslations('Forms')

  const { component, fieldName, props } = fieldConfig;
  const ComponentToRender = ComponentRegistry[component];

  if (!ComponentToRender) { /* ... xử lý lỗi ... */ }

  // Tách các props có thể dịch ra
  const { labelKey, placeholderKey, descriptionKey, ...restProps } = props;

  // Dịch các key. Nếu key không tồn tại, có thể fallback về giá trị thường hoặc chuỗi rỗng.
  const label = labelKey ? t(labelKey) : props.label;
  const placeholder = placeholderKey ? t(placeholderKey) : props.placeholder;
  const description = descriptionKey ? t(descriptionKey) : props.description;

  return (
    <FormField control={control} name={fieldName} render={({ field }) => (
      <FormItem>
        {label && <FormLabel>{label}</FormLabel>}
        <FormControl>
          <ComponentToRender {...field} {...restProps} placeholder={placeholder} />
        </FormControl>
        {description && <FormDescription>{description}</FormDescription>}
        <FormMessage />
      </FormItem>
    )} />
  );
};
```

**Giải thích:**

-   `useTranslations()`: Hook này cung cấp hàm `t()` để thực hiện việc dịch.
-   **Logic dịch:** Component kiểm tra sự tồn tại của `labelKey`. Nếu có, nó sẽ gọi `t(labelKey)`. Nếu không, nó sẽ tìm một prop `label` thông thường như một phương án dự phòng (fallback), cho phép BE gửi một chuỗi không cần dịch trong một số trường hợp đặc biệt.

## 4. Quản lý file ngôn ngữ

Để hệ thống hoạt động, các key do Backend gửi về phải tồn tại trong các file ngôn ngữ của Frontend.

-   **Vị trí:** `messages/en.json`, `messages/vi.json`
-   **Cấu trúc:** Nên tổ chức các key theo cấu trúc lồng nhau (nested) để dễ quản lý.

```json
// messages/vi.json
{
  "common": {
    "defaultLabel": "Trường dữ liệu",
    "defaultPlaceholder": "Nhập tại đây..."
  },
  "form": {
    "field": {
      "fullName": {
        "label": "Họ và Tên",
        "placeholder": "Nhập đầy đủ họ và tên của bạn",
        "description": "Thông tin này sẽ được sử dụng để xác thực tài khoản."
      }
    }
  }
}
```

Bằng cách tuân thủ quy ước và luồng hoạt động này, tất cả các thành phần được render động sẽ tự động được dịch sang ngôn ngữ hiện tại của người dùng, tạo ra một trải nghiệm liền mạch và chuyên nghiệp.
