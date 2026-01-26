# TÀI LIỆU KỸ THUẬT: KỊCH BẢN KIỂM THỬ (TEST CASES) - USER CONSENT FLOW

## 1. Nhóm kịch bản: Hiển thị Prompt (Display Logic)

Mục tiêu: Đảm bảo người dùng luôn nhìn thấy đúng phiên bản điều khoản cần thiết.

| ID | Tên kịch bản (Scenario) | Điều kiện tiên quyết (Pre-condition) | Các bước thực hiện (Steps) | Kết quả mong đợi (Expected Result) | Kiểm tra API (Verification) |
| --- | --- | --- | --- | --- | --- |
| **UI-01** | **User mới truy cập lần đầu** | User chưa có bất kỳ bản ghi Consent nào trong DB. | Truy cập trang chủ hoặc trang yêu cầu quyền. | Prompt hiển thị phiên bản điều khoản mới nhất (Latest Version). | `GET /consent` trả về rỗng hoặc 404. |
| **UI-02** | **User cũ đã đồng ý Version mới nhất** | User đã có bản ghi Consent với `consent_version_id` = ID của bản mới nhất, `action` = `grant`. | Truy cập trang. | **KHÔNG** hiển thị Prompt. | `GET /consent` trả về object có `action: "grant"`. |
| **UI-03** | **User cũ đã đồng ý Version cũ** | Admin vừa tạo Version mới (`effective_date` mới). User đang giữ Consent của Version cũ. | Truy cập trang. | Prompt hiển thị, yêu cầu User đồng ý lại với nội dung mới. | `GET /consent-version` trả về ID mới khác với ID user đang có. |
| **UI-04** | **User đã từ chối (Revoked) trước đó** | User có bản ghi Consent với `action` = `revoke`. | Truy cập tính năng cần quyền (ví dụ: Xem bản đồ). | Hiển thị thông báo/Prompt yêu cầu bật lại quyền. | `GET /consent` trả về object có `action: "revoke"`. |

---

## 2. Nhóm kịch bản: Cấp quyền (Grant Flow)

Mục tiêu: Đảm bảo dữ liệu được ghi nhận chính xác và đầy đủ 3 bước (Consent -> Category -> Log).

| ID | Tên kịch bản | Các bước thực hiện | Kết quả mong đợi | Dữ liệu kiểm tra (Data Check) |
| --- | --- | --- | --- | --- |
| **FN-01** | **Grant All (Đồng ý tất cả)** | 1. Tick chọn "Select All" (Marketing, Analytics...).<br>

<br>2. Bấm "Agree". | - Prompt đóng lại.<br>

<br>- Toast message: "Cài đặt thành công". | - Bảng `Consent`: Tạo mới 1 dòng, `action`="grant".<br>

<br>- Bảng `ConsentDataCategory`: Tạo đủ dòng tương ứng số category.<br>

<br>- Bảng `ConsentLog`: Có 1 dòng log `action`="grant". |
| **FN-02** | **Grant Partial (Đồng ý một phần)** | 1. Chỉ tick chọn "Marketing".<br>

<br>2. Bỏ tick "Analytics".<br>

<br>3. Bấm "Agree". | - Prompt đóng lại.<br>

<br>- Toast message thành công. | - Bảng `Consent`: Tạo mới.<br>

<br>- Bảng `ConsentDataCategory`: **CHỈ** có dòng cho Marketing, không có Analytics. |
| **FN-03** | **Spam Click (Double Submit)** | User bấm nút "Agree" liên tục (nhấp đúp/ba) nhanh chóng. | - Chỉ gửi 1 Request thành công.<br>

<br>- Hoặc Request thứ 2 bị chặn/báo lỗi nhẹ. | - **KHÔNG** được tạo 2 bản ghi Consent trùng lặp cho cùng 1 Version. API backend có thể trả về lỗi `already_exists` hoặc frontend disable nút bấm ngay khi click. |

---

## 3. Nhóm kịch bản: Thu hồi & Cập nhật (Revoke/Update Flow)

Mục tiêu: Kiểm tra logic cập nhật trạng thái và tính toàn vẹn dữ liệu khi thay đổi.

| ID | Tên kịch bản | Các bước thực hiện | Kết quả mong đợi | Verification |
| --- | --- | --- | --- | --- |
| **FN-04** | **Revoke All (Hủy toàn bộ)** | 1. Vào Settings -> Privacy.<br>

<br>2. Bấm "Revoke Consent". | - Trạng thái UI chuyển sang "Chưa cấp quyền". | - `PATCH /consent/{id}` gửi `action`="revoke".<br>

<br>- `POST /consent-log` ghi nhận `action`="revoke". |
| **FN-05** | **Update (Bỏ 1 danh mục)** | 1. Đang có quyền: Email, Location.<br>

<br>2. Bỏ tick "Location".<br>

<br>3. Bấm "Save". | - UI cập nhật trạng thái.<br>

<br>- Location bị tắt. | - `PATCH /consent/{id}` gửi `action`="update".<br>

<br>- `DELETE /consent-data-category/{id}` xóa dòng Location.<br>

<br>- `POST /consent-log` ghi `action`="update". |

---

## 4. Nhóm kịch bản: Xử lý lỗi & Bảo mật (Edge Cases & Security)

Mục tiêu: Đảm bảo hệ thống không bị crash hoặc sai dữ liệu khi gặp sự cố.

| ID | Tên kịch bản | Tình huống (Context) | Kết quả mong đợi | Mã lỗi API (Error Code) |
| --- | --- | --- | --- | --- |
| **ERR-01** | **Mất mạng khi đang Log** | User bấm Grant -> API `createConsent` thành công -> Mạng rớt -> API `createConsentLog` thất bại. | - UI hiển thị cảnh báo: "Kết nối không ổn định, vui lòng thử lại".<br>

<br>- Hệ thống **KHÔNG** được coi là đã hoàn tất quy trình (vì thiếu Log pháp lý). | `deadline_exceeded` hoặc `unavailable`. |
| **ERR-02** | **Token hết hạn (Session Timeout)** | User mở Prompt và để treo máy 30 phút -> Token hết hạn -> Bấm "Agree". | - Không thực hiện action.<br>

<br>- Redirect về Login hoặc hiện popup Login lại. | `401 unauthenticated`. |
| **ERR-03** | **Thao tác trên tài khoản khác** | Hacker dùng API Client, dùng Token của User A nhưng gửi `lead_id` của User B để Grant quyền. | - Hệ thống từ chối Request.<br>

<br>- Phải kiểm tra sự khớp nhau giữa Token và Lead ID. | `403 permission_denied`. |
| **ERR-04** | **Config ID sai lệch** | Frontend gửi `controller_id` không tồn tại (do code cứng ID cũ). | - Báo lỗi hệ thống.<br>

<br>- UI hiển thị: "Đã có lỗi xảy ra (Mã: 400)". | `400 invalid_argument` hoặc `404 not_found`. |

---

## 5. Tiêu chí chấp nhận (Definition of Done)

Một tính năng Consent được coi là hoàn thành khi:

1. [ ] Chạy qua tất cả Test Cases trên mà không có lỗi Critical/High.
2. [ ] Dữ liệu trong bảng `ConsentLog` khớp 100% với số lần thao tác của User (Không thừa, không thiếu).
3. [ ] User không thể thao tác khi chưa load xong API cấu hình (Loading state hoạt động đúng).
