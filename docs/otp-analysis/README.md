# OTP Flow Analysis

## Tổng quan
Tài liệu này cung cấp phân tích chi tiết về quy trình OTP (One-Time Password) trong dự án Digital Onboarding Platform (DOP). Phân tích bao gồm kiến trúc, API, components, và các vấn đề đã phát hiện trong quá trình review code.

## Mục lục

1. [Kiến trúc & Luồng dữ liệu](./architecture.md)
   - Chi tiết về Two-tier OTP architecture (Lead-specific & Generic)
   - Biểu đồ luồng xử lý (Flow diagrams)

2. [Tài liệu API](./api-documentation.md)
   - Chi tiết các endpoints liên quan đến OTP
   - Cấu trúc Request/Response

3. [Components & Hooks](./components.md)
   - Cấu trúc phân cấp Component
   - Chức năng của từng Component và Hook
   - Cách sử dụng

4. [Vấn đề & Phát hiện](./issues-findings.md)
   - Các vấn đề code (Hardcoded values, Mock logic)
   - Các điểm cần cải thiện

5. [Chiến lược kiểm thử](./testing-strategy.md)
   - Các kịch bản kiểm thử (Test scenarios)
   - Phương pháp kiểm thử (Manual & Automated)

## Phạm vi
Phân tích tập trung vào:
- **Lead Onboarding Flow**: Quy trình xác thực OTP khi tạo Lead mới.
- **Generic OTP Service**: Service dùng chung cho các mục đích xác thực khác (Authentication).

## Trạng thái
- **Cập nhật lần cuối**: 20/01/2026
- **Phiên bản**: 1.0
- **Trạng thái**: Discovery & Documentation
