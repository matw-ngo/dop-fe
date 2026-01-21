# OTP Issues & Findings

Tài liệu này tổng hợp các vấn đề kỹ thuật và logic được phát hiện trong quá trình phân tích code OTP flow.

## 1. Mock Logic trong Hooks
**Mức độ:** Medium  
**Vị trí:** `use-submit.ts`, `use-resend.ts`

**Mô tả:**
Các hooks xử lý OTP hiện đang chứa logic giả lập (mock) thay vì gọi API thực tế hoặc song song với API call. Điều này có thể dẫn đến hành vi không đồng nhất giữa dev/test và production.

**Code dẫn chứng (minh họa):**
```typescript
// use-submit.ts
const submitOTP = async (otp: string) => {
  // TODO: Remove mock logic
  if (otp === "0000" || otp === "1234") {
    return { success: true };
  }
  // Real API call logic...
}
```

**Khuyến nghị:**
- Loại bỏ hoàn toàn mock logic trong production build.
- Sử dụng mocking ở tầng API client hoặc MSW (Mock Service Worker) cho testing thay vì hardcode trong hooks.

## 2. Hardcoded OTP Values
**Mức độ:** Critical (Security Risk if in Prod)  
**Vị trí:** `OtpContainer.tsx` hoặc các utility functions liên quan.

**Mô tả:**
Hệ thống đang chấp nhận các mã OTP cố định như `0000`, `1234` cho mục đích testing/demo. Nếu logic này lọt vào production, kẻ tấn công có thể dễ dàng vượt qua bước xác thực.

**Khuyến nghị:**
- Đảm bảo logic kiểm tra OTP cứng (whitelist) chỉ hoạt động ở môi trường `development` hoặc `test`.
- Tốt nhất là xóa bỏ và sử dụng số điện thoại whitelist trên server thay vì client.

## 3. Hardcoded OTP Type
**Mức độ:** Low  
**Vị trí:** Các API calls (`useSubmitOTP`).

**Mô tả:**
Tham số `type` trong API request đang được hardcode giá trị là `2` (SMS).

```typescript
// use-submit.ts
await api.post(`/leads/${id}/submit-otp`, {
  otp: code,
  type: 2 // Hardcoded SMS type
});
```

**Tác động:**
- Khó mở rộng nếu muốn hỗ trợ OTP qua Email, Voice, hoặc App Authenticator.
- Gây khó hiểu cho người đọc code mới nếu không có constant định nghĩa `2` là gì.

**Khuyến nghị:**
- Sử dụng Enum hoặc Constant: `OTP_TYPES.SMS = 2`.
- Truyền `type` như một tham số động vào hook hoặc component để dễ dàng cấu hình.

## 4. Thiếu xử lý lỗi chi tiết
**Mức độ:** Medium

**Mô tả:**
Hiện tại việc xử lý lỗi từ API có thể chưa bao phủ hết các trường hợp (ví dụ: OTP hết hạn vs OTP sai, quá số lần thử).

**Khuyến nghị:**
- Cập nhật UI để hiển thị thông báo lỗi cụ thể dựa trên error code từ API (ví dụ: "Mã đã hết hạn, vui lòng gửi lại" thay vì "Lỗi không xác định").
