# TÀI LIỆU BỔ SUNG: KIỂM SOÁT KỸ THUẬT & TÍCH HỢP DỮ LIỆU

Tài liệu này liệt kê các vấn đề kỹ thuật cần lưu ý ngoài luồng nghiệp vụ chính, tập trung vào tính toàn vẹn dữ liệu và xử lý ngoại lệ dựa trên đặc tả API.

## 1. Quản lý "ID ẩn" (Hidden Entities Management)

Trong sơ đồ luồng User Flow, người dùng chỉ nhìn thấy "Prompt" và nút bấm. Tuy nhiên, để gọi API `POST /consent`, Frontend bắt buộc phải gửi lên các ID cấu hình hệ thống mà người dùng không hề nhập.

- **Vấn đề:** API `createConsent` yêu cầu bắt buộc các trường: `controller_id`, `processor_id` trong body.
- **Rủi ro:** Nếu Frontend không lấy được các ID này trước khi User bấm nút, việc gọi API sẽ thất bại (Lỗi 400 Bad Request).
- **Giải pháp triển khai:**
- **Startup Load:** Khi ứng dụng khởi động, cần gọi API `searchDataControllers` và `searchDataProcessors` để lấy ID của đơn vị quản lý dữ liệu hiện hành.
- **Hard-check:** Không được hardcode (gán cứng) các ID này trong code Frontend, vì Admin có thể thay đổi cấu hình Entities ở luồng Admin Flow.

## 2. Logic xác định "Effective Date" (Ngày hiệu lực)

Khi hiển thị Prompt, hệ thống phải đảm bảo hiển thị đúng Version đang có hiệu lực, không phải Version nháp hoặc Version tương lai.

- **Cấu trúc dữ liệu:** Object `ConsentVersion` có trường `effective_date` (định dạng `date-time`).
- **Logic hiển thị:**
- Chỉ hiển thị Version có `effective_date` <= `Thời gian hiện tại` (Server time).
- Nếu có nhiều Version thỏa mãn, chọn Version có `effective_date` gần nhất (hoặc `version` number lớn nhất).
- _Lưu ý Dev:_ Cần so sánh múi giờ cẩn thận giữa Client (User) và Server để tránh việc User nhìn thấy điều khoản chưa đến giờ áp dụng.

## 3. Đồng bộ trạng thái danh mục con (Data Category Consistency)

Trong nhánh "REVOKE / UPDATE" của sơ đồ, có bước "Update Consent & Consent-data category Tables". Đây là điểm phức tạp nhất.

- **Tình huống:** User ban đầu đồng ý 2 danh mục: "Email" và "Location". Sau đó User vào Settings, bỏ chọn "Location" nhưng giữ "Email".
- **Xử lý API:**

1. **Không dùng `REVOKE`:** Vì `Consent` chính vẫn còn hiệu lực (vẫn giữ Email), nên trạng thái `Consent` phải là `update`, không được set thành `revoke`.
2. **Xóa liên kết thừa:** Cần gọi API `deleteConsentDataCategory` với `id` của liên kết "Location" cũ.
3. **Thêm liên kết thiếu (nếu có):** Gọi `createConsentDataCategory` nếu User chọn thêm mục mới.

- _Tóm lại:_ Hành động "Update" trên UI thực chất là một chuỗi các thao tác: `PATCH Consent` + `DELETE Category Link` + `POST Category Link`.

## 4. Xử lý các mã lỗi đặc thù (Error Code Handling)

File API định nghĩa `ErrorCode` enum với nhiều trạng thái chi tiết. Frontend cần bắt (catch) đúng các lỗi này để UX mượt mà.

| Error Code            | Ngữ cảnh xảy ra (Context)                                                       | Hướng xử lý (Action)                                                                                     |
| --------------------- | ------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| `resource_exhausted`  | User spam nút Grant liên tục, hoặc hệ thống quá tải Log.                        | Disable nút bấm tạm thời (Debounce), hiện thông báo "Vui lòng đợi giây lát".                             |
| `failed_precondition` | Dữ liệu thiếu các ID bắt buộc (như mục 1) hoặc Version đã bị Admin vô hiệu hóa. | Reload lại trang để lấy cấu hình mới nhất.                                                               |
| `unauthenticated`     | Token của User hết hạn trong lúc đang xem Prompt.                               | Tự động refresh token hoặc redirect về trang Login, không cho phép Submit.                               |
| `data_loss`           | Lỗi nghiêm trọng phía Server khi lưu Log.                                       | Báo User thử lại, đồng thời Frontend nên log lỗi này về hệ thống tracking lỗi của App (Sentry/Firebase). |
