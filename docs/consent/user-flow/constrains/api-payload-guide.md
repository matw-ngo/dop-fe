# TÀI LIỆU KỸ THUẬT: ĐẶC TẢ TÍCH HỢP API & PAYLOAD MẪU

Tài liệu này cung cấp các mẫu JSON request/response chuẩn cho quy trình User Consent, đảm bảo tuân thủ đúng định nghĩa kiểu dữ liệu trong `consent.d.ts`.

## 1. Cơ chế Xác thực & Header (Authentication)

Dựa trên các mã lỗi `401 Unauthorized` và `403 Forbidden` trong tài liệu API, mọi request từ phía User Flow (Web/App) bắt buộc phải kèm theo thông tin xác thực.

- **Headers bắt buộc:**

```http
Content-Type: application/json
Authorization: Bearer <user_access_token>
X-Client-Source: web-client-v1  // (Optional) Giúp tracking source dễ hơn

```

- **Lưu ý:** `lead_id` (User ID) trong body request phải khớp với thông tin trong `Authorization` token để tránh lỗi `403 permission_denied`.

## 2. Payload Cheat Sheet (Các mẫu JSON chuẩn)

### 2.1. Kịch bản: Người dùng cấp quyền (GRANT Flow)

Đây là request phức tạp nhất, cần thực hiện khi User bấm nút "Đồng ý".

**Bước 1: Tạo Consent Record (`POST /consent`)**

- **Endpoint:** `POST /consent`
- **Mô tả:** Khởi tạo sự đồng thuận.
- **Request Body:**

```json
{
  "controller_id": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d", // ID đơn vị kiểm soát (Lấy từ config)
  "processor_id": "123e4567-e89b-12d3-a456-426614174000", // ID đơn vị xử lý (Lấy từ config)
  "lead_id": "user-uuid-8888-9999-0000", // ID người dùng hiện tại
  "consent_version_id": "ver-uuid-1111-2222-3333", // ID phiên bản điều khoản vừa xem
  "source": "web_registration_form", // Nơi user thực hiện (Max 512 chars)
  "action": "grant" // BẮT BUỘC là "grant"
}
```

_[Tham chiếu: ConsentCreateRequest trong consent.d.ts]_

**Bước 2: Gắn danh mục dữ liệu (`POST /consent-data-category`)**

- **Endpoint:** `POST /consent-data-category`
- **Mô tả:** Gọi n lần tương ứng với n danh mục user đã chọn.
- **Request Body:**

```json
{
  "consent_id": "new-consent-uuid-từ-bước-1",
  "data_category_id": "category-email-uuid"
}
```

_[Tham chiếu: ConsentDataCategoryCreateRequest trong consent.d.ts]_

**Bước 3: Ghi Audit Log (`POST /consent-log`)**

- **Endpoint:** `POST /consent-log`
- **Mô tả:** Xác nhận hành động để lưu vết pháp lý.
- **Request Body:**

```json
{
  "consent_id": "new-consent-uuid-từ-bước-1",
  "action": "grant",
  "action_by": "user-uuid-8888-9999-0000", // Người thực hiện (User)
  "source": "web_registration_form" // Phải khớp với source ở Bước 1
}
```

_[Tham chiếu: ConsentLogCreateRequest trong consent.d.ts]_

---

### 2.2. Kịch bản: Người dùng thay đổi ý định (REVOKE/UPDATE Flow)

**Trường hợp 1: Thu hồi toàn bộ (`PATCH /consent/{id}`)**
Khi User bấm nút "Từ chối tất cả" hoặc "Hủy quyền".

- **Endpoint:** `PATCH /consent/{consent_id}`
- **Request Body:**

```json
{
  "action": "revoke", // Chuyển trạng thái sang revoke
  "source": "user_profile_settings" // Ghi nhận thay đổi từ trang cài đặt
}
```

_Lưu ý: Sau khi gọi API này, cần gọi tiếp `POST /consent-log` với action="revoke"._

**Trường hợp 2: Cập nhật danh mục con (`Update Logic`)**
Khi User bỏ chọn danh mục "Location" nhưng giữ "Email".

1. **Cập nhật Consent chính:**

- API: `PATCH /consent/{consent_id}`
- Body: `{ "action": "update" }` (Giữ trạng thái Active nhưng đánh dấu là có sửa đổi).

2. **Xóa danh mục bỏ chọn:**

- API: `DELETE /consent-data-category/{consent_data_category_id}`
- _Lưu ý:_ Cần ID của dòng liên kết (`consent_data_category_id`), không phải ID của category gốc. Frontend cần lưu ID này khi load dữ liệu ban đầu.

---

## 3. Mock Data cho Testing (Dữ liệu giả lập)

Để Frontend có thể code UI trước khi có API thật, hãy sử dụng bộ dữ liệu mẫu này (tuân thủ format UUID và String limit):

| Entity         | Field     | Mock Value                    | Ghi chú             |
| -------------- | --------- | ----------------------------- | ------------------- |
| **Controller** | `id`      | `con-00112233-4455-6677-8899` | Dùng chung toàn app |
| **User**       | `lead_id` | `usr-aabbccdd-eeff-0011-2233` | Current User        |
| **Version**    | `id`      | `ver-20240101-v1-rel`         | Version hiệu lực    |
| **Category**   | `id`      | `cat-marketing-001`           | Ví dụ: Marketing    |
| **Request**    | `source`  | `ios_app_v2.1`                | Max 512 ký tự       |

---

## 4. Checklist kiểm tra tích hợp (Integration Checklist)

Dev cần tích vào các mục sau trước khi báo cáo hoàn thành (Definition of Done):

- [ ] **API Flow:** Gọi đủ 3 API (Create Consent -> Link Category -> Log) trong một phiên thao tác thành công.
- [ ] **Data Type:** Trường `action` chỉ gửi các giá trị: `"grant"`, `"revoke"`, `"update"`, `"delete"` (Enum).
- [ ] **Validation:** Đã xử lý trường hợp API trả về `400` (sai data) và `401` (hết session).
- [ ] **UI Consistency:** Khi reload trang, trạng thái nút bấm (Toggle/Checkbox) hiển thị đúng theo dữ liệu `GET` về từ server.

---