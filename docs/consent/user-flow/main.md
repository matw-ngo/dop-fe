# TÀI LIỆU KỸ THUẬT: USER CONSENT FLOW

## 1. Tổng quan

Tài liệu này mô tả chi tiết luồng tương tác của người dùng cuối (User/Lead) khi thực hiện cấp quyền (Grant) hoặc thu hồi quyền (Revoke) đồng thuận xử lý dữ liệu.

**Mục tiêu:**

- Hiển thị đúng phiên bản điều khoản (Consent Version) hiện hành.
- Ghi nhận hành động đồng ý (Grant) và lưu trữ các danh mục dữ liệu liên quan.
- Xử lý hành động thu hồi (Revoke) hoặc cập nhật (Update).
- Đảm bảo mọi thao tác đều được ghi Log (Audit trail).

**Phạm vi:** Chỉ bao gồm nhánh "USER FLOW" (bên phải sơ đồ).

---

## 2. Quy trình chi tiết

### Giai đoạn 1: Khởi tạo & Hiển thị (View Prompt)

Trước khi người dùng thực hiện hành động, hệ thống cần tải thông tin điều khoản mới nhất từ Database để hiển thị trên giao diện (Web/App).

- **Mô tả:** Hệ thống truy vấn "Consent Version Table" để lấy nội dung điều khoản.
- **API sử dụng:** `GET /consent-version`.
- **Logic xử lý:**

1. Client gọi API tìm kiếm version.
2. Nên filter theo `consent_purpose_id` (ví dụ: mục đích Marketing, Tracking) và sắp xếp theo `effective_date` giảm dần để lấy bản mới nhất.
3. **Dữ liệu quan trọng cần lấy:**

- `id` (Version ID): Dùng để mapping khi tạo Consent.
- `content`: Nội dung hiển thị cho User đọc.
- `document_url`: Link văn bản pháp lý đầy đủ.

### Giai đoạn 2: Người dùng Đồng ý (Action: GRANT)

Kích hoạt khi người dùng nhấn nút "Accept", "Agree" hoặc "Allow". Quy trình này bao gồm 3 bước tuần tự được định nghĩa trong sơ đồ.

#### Bước 2.1: Tạo bản ghi Consent (Create Active Record)

- **Mô tả:** Tạo một bản ghi mới trong bảng Consent để xác nhận người dùng đã chấp thuận phiên bản điều khoản cụ thể.
- **API sử dụng:** `POST /consent`.
- **Dữ liệu yêu cầu (Payload):**
- `consent_version_id`: ID lấy từ Giai đoạn 1.
- `lead_id` / `user_id`: ID định danh của người dùng.
- `controller_id`: ID của đơn vị kiểm soát dữ liệu.
- `action`: Giá trị bắt buộc là `"grant"`.
- `source`: Nguồn (ví dụ: "web-popup", "mobile-app").

#### Bước 2.2: Liên kết Danh mục dữ liệu (Link Categories)

- **Mô tả:** Nếu Consent này áp dụng cho nhiều loại dữ liệu (ví dụ: Email, Location, Cookies), hệ thống cần lưu chi tiết các danh mục được chấp thuận.
- **API sử dụng:** `POST /consent-data-category`.
- **Logic:**
- Duyệt qua danh sách các `data_category_id` mà user đã tích chọn.
- Gọi API tạo bản ghi liên kết giữa `consent_id` (vừa tạo ở bước 2.1) và `data_category_id`.

#### Bước 2.3: Ghi Log (Log Action - GRANT)

- **Mô tả:** Lưu vết hành động vào bảng Audit Log để phục vụ tra soát sau này.
- **API sử dụng:** `POST /consent-log`.
- **Dữ liệu yêu cầu:**
- `consent_id`: ID của bản ghi consent.
- `action`: `"grant"`.
- `action_by`: ID hoặc tên người thực hiện.
- `source`: Nơi thực hiện hành động.

---

### Giai đoạn 3: Người dùng Thu hồi/Cập nhật (Action: REVOKE / UPDATE)

Kích hoạt khi người dùng vào trang cài đặt (Privacy Settings) để thay đổi quyền đã cấp trước đó.

#### Bước 3.1: Xác định bản ghi Consent hiện tại

- **Mô tả:** Tìm kiếm bản ghi Consent đang hiệu lực của người dùng này.
- **API sử dụng:** `GET /consent`.
- **Logic:** Tìm kiếm theo `lead_id` và `consent_purpose_id` (thông qua version) để lấy `consent_id` cần sửa.

#### Bước 3.2: Cập nhật trạng thái (Update Status)

- **Mô tả:** Thay đổi trạng thái của bản ghi Consent hiện có.
- **API sử dụng:** `PATCH /consent/{id}`.
- **Dữ liệu yêu cầu:**
- `action`: Chuyển thành `"revoke"` (nếu từ chối toàn bộ) hoặc `"update"` (nếu chỉnh sửa danh mục con).
- Lưu ý: Không xóa bản ghi vật lý, chỉ cập nhật trạng thái logic.

#### Bước 3.3: Ghi Log (Log Action - REVOKE/UPDATE)

- **Mô tả:** Tương tự như luồng Grant, mọi thay đổi trạng thái đều phải ghi log mới.
- **API sử dụng:** `POST /consent-log`.
- **Dữ liệu yêu cầu:**
- `consent_id`: ID của bản ghi vừa update.
- `action`: `"revoke"` hoặc `"update"`.

---

## 3. Cấu trúc dữ liệu tham chiếu

Dưới đây là các định nghĩa dữ liệu quan trọng từ file thiết kế API cần lưu ý khi tích hợp:

### 3.1. Consent Action (Enum)

Các trạng thái hợp lệ của trường `action`:

- `grant`: Cấp quyền mới.
- `revoke`: Thu hồi quyền đã cấp.
- `update`: Cập nhật thông tin quyền.
- `delete`: Xóa quyền (ít dùng trong user flow thông thường).

### 3.2. Mapping bảng dữ liệu (Entity Relationship)

- **Consent Version**: Chứa nội dung điều khoản (`content`, `document_url`).
- **Consent**: Bảng trung tâm, liên kết `User` (Lead) <-> `Version` <-> `Controller`.
- **Consent Data Category**: Bảng chi tiết, liên kết `Consent` <-> `Data Category` (loại dữ liệu cụ thể).
- **Consent Log**: Bảng lịch sử, chỉ thêm mới (append-only), không sửa xóa.

---

## 4. Các lưu ý tích hợp (Implementation Notes)

1. **Tính toàn vẹn (Transaction):** Trong luồng "Grant", việc tạo Consent và Ghi Log nên được xử lý đảm bảo tính nhất quán. Nếu tạo Consent thành công nhưng Ghi Log thất bại, Client cần có cơ chế retry hoặc báo lỗi.
2. **Versioning:** Luôn lấy `id` của Version mới nhất (`GET /consent-version`) tại thời điểm hiển thị prompt. Không hardcode Version ID dưới Client.
3. **Security:** Các API `POST` và `PATCH` cần được bảo vệ bằng Token xác thực của User để đảm bảo User A không thể Revoke quyền của User B.
