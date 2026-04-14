# Báo Cáo: Màn Hình Hiển Thị Kết Quả (Matched Products) - Old Code Analysis

## Tổng Quan

Màn hình hiển thị kết quả trong old code (Digital Onboarding Platform v1) là một hệ thống phức tạp bao gồm nhiều states và components khác nhau. Đây là nơi hiển thị các sản phẩm vay được match từ distribution engine sau khi người dùng hoàn thành form.

## Files Liên Quan

### 1. `docs/old-code/modules/LoanResult/index.tsx`
**Vai trò**: Main container component, xử lý state machine và render các sub-components

**States xử lý**:
- `LoanStatus.SUCCESS`: Hiển thị danh sách providers hoặc success view
- `LoanStatus.EXISTED`: Hồ sơ đã tồn tại
- `LoanStatus.PROCESSING`: Đang xử lý
- Default: Failed state

**Sub-components**:
- `LoanListBox`: Danh sách các khoản vay được match
- `LoanSuccessBox`: Màn hình thành công khi chuyển tiếp
- `LoanPendingBox`: Đang chờ xử lý
- `LoanExistingBox`: Hồ sơ đã tồn tại
- `LoanFailedBox`: Không có kết quả phù hợp
- `CathayBankSuccessView`: View đặc biệt cho CathayBank

### 2. `docs/old-code/modules/LoanResult/LoanListBox.tsx`
**Vai trò**: Hiển thị danh sách các sản phẩm vay được match

**Features**:
- Hiển thị header: `"{count} kết quả được tìm thấy dựa trên thông tin bạn cung cấp"`
- List view các `IProvider` với card layout
- Mỗi card hiển thị:
  - Logo đối tác (từ `/images/fi_result/{client_code}.png`)
  - Tag: "Vay cầm đồ" hoặc "Vay tiêu dùng"
  - Tên đối tác
  - Thời gian vay (format: "6 - 36 Tháng")
  - Số tiền vay (format: "10 Triệu - 100 Triệu")
  - Số tiền trả hàng tháng (EMI) với tooltip giải thích
  - Button "Đăng Ký Vay" với loading state

**Xử lý actions**:
- `handleForward`: Forward lead đến đối tác (type: "forward")
- `handleRedirect`: Redirect sang trang đối tác (type: "redirect")
- Error handling với modal thông báo

### 3. `docs/old-code/types/loan.ts`
**Định nghĩa types**:

```typescript
interface IProvider {
  id: number;
  name: string;
  client_code: string;        // e.g., "CATHAYBANK", "VPBANK"
  expected_amount: number;      // Số tiền vay dự kiến
  loan_period: number;          // Thời hạn vay (tháng)
  emi: number;                  // Số tiền trả hàng tháng
  require_dop: number;          // Yêu cầu DOP
  convert_type: "forward" | "redirect";  // Loại chuyển đổi
}

enum LoanStatus {
  NEW = "",
  SUCCESS = "SUCCESS",      // Có kết quả match
  EXISTED = "EXISTED",      // Lead đã tồn tại
  REJECTED = "REJECTED",    // Bị từ chối
  PROCESSING = "PROCESSING", // Đang xử lý
}
```

## API Response Structure

### CreateLeadResponseBody (từ dop.yaml)
```yaml
CreateLeadResponseBody:
  properties:
    id: uuid
    token: string
    matched_products:
      type: array
      description: "Products matched by the distribution engine"
      items:
        $ref: "#/components/schemas/matched_product"
```

### matched_product schema
```yaml
matched_product:
  properties:
    product_id: uuid
    product_name: string        # "Vay Tiêu Dùng Tín Chấp"
    product_type: string        # "personal_loan", "credit_card"
    partner_id: uuid
    partner_name: string        # "VPBank", "CathayBank"
    partner_code: string        # "VPBANK", "CATHAYBANK"
```

### SubmitLeadInfoResponseBody
```yaml
SubmitLeadInfoResponseBody:
  properties:
    next_step_id: uuid
    matched_products:           # Cũng có matched_products!
      type: array
      items:
        $ref: "#/components/schemas/matched_product"
    forward_result:
      $ref: "#/components/schemas/ForwardResult"
```

> **Quan trọng**: Cả `CreateLeadResponseBody` và `SubmitLeadInfoResponseBody` đều có `matched_products`!

## Flow Hiển Thị Kết Quả

### 1. Single-Step Flow (có OTP)
```
1. User submit form → CreateLead → Nhận matched_products
2. Show OTP modal
3. OTP success → SubmitOTP → Nhận matched_products (nếu có)
4. Show LoanResult screen với danh sách sản phẩm
```

### 2. Multi-Step Flow (không OTP)
```
1. User complete tất cả steps
2. Final step: SubmitLeadInfo → Nhận matched_products + forward_result
3. Show LoanResult screen
```

## UI States

| State | UI Component | Description |
|-------|--------------|-------------|
| Loading | Spinner + "Đang tìm kiếm..." | Initial loading |
| Success (multi) | `LoanListBox` | Danh sách nhiều sản phẩm |
| Success (single) | `LoanSuccessBox` | Một sản phẩm được chọn |
| Forwarded | `LoanSuccessBox` | Đã chuyển tiếp thành công |
| Existed | `LoanExistingBox` | Lead đã tồn tại |
| Failed | `LoanFailedBox` | Không có sản phẩm phù hợp |
| Processing | `LoanPendingBox` | Đang xử lý |

## So Sánh với New Architecture

### Old Code
- `matched_products` lưu trong `leadData.providers` (Zustand store)
- Hiển thị trong `LoanResultBox` component
- Forward logic trong `LoanListBox`

### New Code (Current)
- `matched_products` chưa được lưu trong `LoanSearchStore`
- `result` field hiện tại chỉ lưu `ForwardResult`
- `LoanSearchingScreen` chỉ hiển thị loading/success/error

## Recommendations cho Implementation

### Option 1: Mở rộng LoanSearchStore
```typescript
// Thêm vào LoanSearchState
matchedProducts: components["schemas"]["matched_product"][];
setMatchedProducts: (products: matched_product[]) => void;
```

### Option 2: Tạo Result Screen riêng
- Giữ `LoanSearchingScreen` cho loading state
- Tạo `LoanResultScreen` hiển thị danh sách products
- Transition: `LoanSearchingScreen` → `LoanResultScreen`

### Option 3: Kết hợp
```typescript
// Store có thể ở state "searching" hoặc "results"
type LoanSearchPhase = "searching" | "results" | "error";

// Result có thể là ForwardResult HOẶC matched_products[]
result: ForwardResult | matched_product[] | null;
```

## Action Items

1. **Quyết định**: Có nên hiển thị danh sách products cho user chọn (manual) hay auto-forward?
2. **Nếu manual**: Cần mở rộng store để lưu `matched_products[]`
3. **Nếu auto-forward**: Hiện tại đã đúng, chỉ cần cải thiện UI feedback
4. **API Integration**: Đảm bảo cả `createLead` và `submitLeadInfo` đều extract `matched_products`

## Files Cần Update

- `src/store/use-loan-search-store.ts`: Thêm `matchedProducts` state
- `src/hooks/features/lead/use-submit-and-search.ts`: Extract và lưu `matched_products`
- `src/components/loan-application/LoanSearching/`: Tạo `LoanResultScreen` hoặc mở rộng `LoanSearchingScreen`
- `src/components/loan-application/DynamicLoanForm.tsx`: Pass `matched_products` vào store
