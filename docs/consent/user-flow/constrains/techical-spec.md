# TÀI LIỆU BỔ SUNG: CÁC LƯU Ý KỸ THUẬT KHI TRIỂN KHAI

## 1. Logic kiểm tra trạng thái trước khi hiển thị (Pre-check Logic)

Trước khi quyết định có hiện popup "View Prompt" hay không, Client cần kiểm tra xem User đã đồng ý với **Version mới nhất** chưa. Nếu không kiểm tra kỹ, popup sẽ hiện liên tục gây khó chịu, hoặc không hiện khi có điều khoản mới.

- **Vấn đề:** Admin cập nhật `Consent Version` mới. User đã đồng ý version cũ (v1) nhưng chưa đồng ý version mới (v2).
- **Giải pháp:**

1. Gọi `GET /consent-version` để lấy ID của version mới nhất (Latest Version ID).
2. Gọi `GET /consent` với tham số `lead_id` (User hiện tại) và `consent_version_id` (Latest Version ID).
3. **Logic UI:**

- Nếu kết quả trả về **Rỗng (Empty)** -> Hiển thị Prompt (Yêu cầu Grant).
- Nếu kết quả có bản ghi và `action` = `grant` -> Không hiển thị (Đã đồng ý).
- Nếu kết quả có bản ghi nhưng `action` = `revoke` -> Tùy nghiệp vụ (Có thể hiển thị banner nhỏ nhắc nhở bật lại).

## 2. Xử lý phân trang (Pagination Handling)

Các API tìm kiếm (`searchConsents`, `searchConsentLogs`,...) trong thiết kế đều có phân trang.

- **Lưu ý:** API trả về object `Pagination` gồm `page`, `page_size`, `total_count`.
- **Rủi ro:** Khi lấy lịch sử Log (`GET /consent-log`) để hiển thị cho User xem lại hoạt động của họ, nếu User có quá nhiều log, việc không xử lý phân trang sẽ làm app bị chậm hoặc mất dữ liệu cũ.
- **Yêu cầu:** Frontend phải implement logic "Load more" hoặc phân trang số (1, 2, 3...) khi hiển thị danh sách lịch sử.

## 3. Xử lý mã lỗi (Error Handling Strategy)

Dựa trên `ErrorCode` enum trong file định nghĩa, Frontend cần map các mã lỗi hệ thống sang thông báo thân thiện người dùng.

| Error Code          | Ngữ cảnh User Flow                                              | Gợi ý xử lý UI                                            |
| ------------------- | --------------------------------------------------------------- | --------------------------------------------------------- |
| `not_found`         | Khi User cố Revoke một Consent đã bị xóa hoặc không tồn tại.    | Thông báo: "Dữ liệu không tồn tại hoặc đã được cập nhật." |
| `already_exists`    | Khi User bấm "Đồng ý" 2 lần liên tiếp quá nhanh (Double click). | Bỏ qua lỗi hoặc hiển thị: "Bạn đã cấp quyền này rồi."     |
| `permission_denied` | Token hết hạn hoặc User cố sửa Consent của người khác.          | Logout user hoặc yêu cầu đăng nhập lại.                   |
| `deadline_exceeded` | Mạng chậm khi gọi API Log/Grant.                                | Hiển thị nút "Thử lại" (Retry), không để User bị kẹt.     |

## 4. Tính bất biến của Consent Log (Audit Trail Integrity)

Trong sơ đồ User Flow, cả luồng GRANT và REVOKE đều trỏ về hành động "Log Action".

- **Quy tắc:** Bảng `ConsentLog` chỉ cho phép **Create (`POST`)** và **Read (`GET`)**, tuyệt đối không có `UPDATE` hay `DELETE` (API `deleteConsentLog` và `updateConsentLog` tuy có trong `paths` nhưng về mặt nghiệp vụ Audit log thường bị hạn chế hoặc Admin mới có quyền).
- **Lưu ý cho Dev:** Không được sửa lại Log cũ khi User thay đổi ý định. Ví dụ:
- 8:00 AM: User Grant -> Ghi Log dòng 1: "Action: Grant".
- 8:05 AM: User Revoke -> **Không sửa dòng 1**, mà Ghi Log dòng 2: "Action: Revoke".
- Khi hiển thị lịch sử: Show cả 2 dòng để chứng minh User đã từng đồng ý lúc 8:00 AM.
