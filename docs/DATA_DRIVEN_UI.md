# Kiến trúc Giao diện Điều khiển bởi Dữ liệu (Data-Driven UI)

## 1. Giới thiệu

Đây là tài liệu trung tâm cho kiến trúc Giao diện Điều khiển bởi Dữ liệu (Data-Driven UI) của dự án. Kiến trúc này cho phép Frontend render các thành phần giao diện, đặc biệt là các form phức tạp, một cách linh hoạt dựa trên cấu hình được trả về từ API của Backend.

### Mục tiêu

-   **Linh hoạt:** Cho phép thay đổi, thêm, bớt hoặc sắp xếp lại các trường (fields) trong một luồng (flow) mà không cần triển khai lại (re-deploy) code Frontend.
-   **Tăng tốc độ phát triển:** Giảm thời gian phát triển cho các luồng nghiệp vụ mới có cấu trúc tương tự (ví dụ: các form đăng ký, khảo sát).
-   **Tách biệt logic:** Tách biệt logic nghiệp vụ (do Backend quản lý) khỏi logic hiển thị (do Frontend quản lý), giúp hai đội ngũ làm việc độc lập hơn.
-   **Nhất quán:** Đảm bảo giao diện người dùng luôn nhất quán bằng cách tái sử dụng các component đã được chuẩn hóa.

## 2. Nguyên tắc cốt lõi: Phương pháp Lai (Hybrid Approach)

Hệ thống áp dụng **Phương pháp Lai/Kết hợp (Hybrid Approach)**, kết hợp sự ổn định của Frontend và sự linh hoạt của Backend.

-   **Frontend (Người bảo vệ):** Chịu trách nhiệm định nghĩa các "khuôn mẫu mặc định" (default templates) cho mỗi loại component. Frontend đảm bảo rằng mọi component luôn có đủ thuộc tính (props) cần thiết để hoạt động ổn định và trông nhất quán. Đây là "nguồn chân lý" (single source of truth) về mặt giao diện.

-   **Backend (Người chỉ đạo):** Chịu trách nhiệm cung cấp logic nghiệp vụ. Backend chỉ cần gửi về dữ liệu "thô" và những thông tin "ghi đè" (overrides) cần thiết cho trường hợp cụ thể đó (ví dụ: field này có bắt buộc không, field kia có những lựa chọn nào).

## 3. Mục lục tài liệu chi tiết

Để đảm bảo tính đầy đủ và chi tiết, tài liệu được chia thành các phần nhỏ hơn. Vui lòng tham khảo các tài liệu sau để có thông tin chuyên sâu về từng khía cạnh của kiến trúc:

1.  **[Hướng dẫn Triển khai (Implementation Guide)](./data-driven-ui/01-IMPLEMENTATION_GUIDE.md)**
    -   *Mô tả:* Hướng dẫn chi tiết từng bước về luồng hoạt động, cách các thành phần chính (Component Registry, Default Config, Field Renderer) tương tác với nhau, và cách thêm một component mới vào hệ thống.

2.  **[Tích hợp Đa ngôn ngữ (i18n)](./data-driven-ui/02-I18N_INTEGRATION.md)**
    -   *Mô tả:* Giải thích quy ước và cách triển khai để hỗ trợ đa ngôn ngữ cho các thành phần được render động.

3.  **[Hệ thống Validation Động (Dynamic Validation)](./data-driven-ui/03-DYNAMIC_VALIDATION.md)**
    -   *Mô tả:* Hướng dẫn cách định nghĩa các quy tắc validation, cách Backend có thể ghi đè, và cách Frontend tự động tạo schema validation (với `zod`) từ cấu hình.

4.  **[Các Mẫu Nâng cao & Quản lý State (Advanced Patterns & State Management)](./data-driven-ui/04-ADVANCED_PATTERNS.md)**
    -   *Mô tả:* Thảo luận các chủ đề nâng cao như xử lý component phức tạp, quản lý state giữa các bước, và các mẫu thiết kế khác.

5.  **[Tham chiếu API & Kiểu dữ liệu (API Reference & Types)](./data-driven-ui/05-API_REFERENCE.md)**
    -   *Mô tả:* Định nghĩa chi tiết các giao diện (interfaces) TypeScript cho các đối tượng cấu hình được sử dụng trong toàn bộ kiến trúc.