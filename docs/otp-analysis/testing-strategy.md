# OTP Testing Strategy

Tài liệu này định nghĩa chiến lược kiểm thử cho quy trình OTP.

## 1. Test Scenarios (Kịch bản kiểm thử)

### 1.1 Positive Scenarios (Trường hợp thành công)
- **Verify OTP thành công**:
  - Nhập đúng mã OTP (hoặc mã mock `0000`/`1234` trên dev).
  - Hệ thống hiển thị thông báo thành công.
  - Modal đóng lại và chuyển sang bước tiếp theo (ví dụ: eKYC).
- **Resend OTP thành công**:
  - Nhấn nút "Gửi lại" sau khi đếm ngược kết thúc.
  - Nhận thông báo đã gửi lại mã mới.
  - Timer reset lại từ đầu.

### 1.2 Negative Scenarios (Trường hợp thất bại)
- **Sai OTP**:
  - Nhập mã OTP sai.
  - Hệ thống báo lỗi "Mã không chính xác".
  - Cho phép nhập lại.
- **Hết hạn OTP**:
  - Nhập mã OTP đúng nhưng đã quá thời gian hiệu lực (mô phỏng).
  - Hệ thống báo lỗi "Mã đã hết hạn".
- **Resend quá sớm**:
  - Cố gắng nhấn nút Resend khi timer chưa chạy xong (nút phải disable).
- **Quá số lần thử**:
  - Nhập sai OTP quá 5 lần (hoặc giới hạn cấu hình).
  - Tài khoản tạm thời bị khóa hoặc yêu cầu gửi lại mã mới.

## 2. Testing Levels

### 2.1 Unit Testing (Vitest)
Kiểm thử logic của các hooks và utility functions.

- **`useSubmitOTP`**:
  - Mock API trả về success -> Hook return success.
  - Mock API trả về error -> Hook return error state.
- **`OtpContainer` logic**:
  - Kiểm tra timer đếm ngược giảm đúng theo thời gian.
  - Kiểm tra state input thay đổi khi user nhập liệu.

### 2.2 E2E Testing (Playwright)
Kiểm thử toàn bộ luồng người dùng trên trình duyệt thực.

```typescript
// Ví dụ kịch bản Playwright
test('should complete OTP verification successfully', async ({ page }) => {
  // 1. Fill phone number & submit
  await page.fill('[data-testid="phone-input"]', '0987654321');
  await page.click('[data-testid="submit-phone"]');

  // 2. Wait for OTP Modal
  await expect(page.locator('[data-testid="otp-modal"]')).toBeVisible();

  // 3. Enter Mock OTP
  await page.fill('[data-testid="otp-input"]', '1234');
  await page.click('[data-testid="confirm-otp"]');

  // 4. Verify success navigation
  await expect(page.locator('[data-testid="ekyc-step"]')).toBeVisible();
});
```

## 3. Test Data
- **Phone Number**: Sử dụng số whitelist (nếu có) hoặc số bất kỳ trên môi trường dev.
- **OTP Code**:
  - Dev/Test: `0000`, `1234` (như đã phân tích ở phần Issues).
  - Staging/Prod: Cần cơ chế lấy OTP thực hoặc bypass cho test automation.

## 4. Công cụ
- **Vitest**: Unit & Integration Test.
- **Playwright**: End-to-End Test.
- **React Testing Library**: Component Testing.
