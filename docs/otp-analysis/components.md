# OTP Component Analysis

Tài liệu này phân tích cấu trúc và chức năng của các components tham gia vào quy trình OTP.

## Component Hierarchy

```
DynamicLoanForm (Page Level)
└── OtpVerificationModal (Wrapper)
    └── OtpContainer (Logic Core)
        └── OtpForm (UI Presentation)
            ├── OTP Input Fields
            └── Resend Timer/Button
```

## Chi tiết Components

### 1. DynamicLoanForm
- **Vị trí**: `src/components/renderer/DynamicLoanForm.tsx` (giả định dựa trên context)
- **Vai trò**: Form chính quản lý quy trình đăng ký khoản vay.
- **Tương tác OTP**:
  - Gọi `useCreateLead` để khởi tạo lead.
  - Quản lý trạng thái hiển thị của `OtpVerificationModal` (mở modal khi `createLead` thành công).

### 2. PhoneVerificationModal / OtpVerificationModal
- **Vị trí**: `src/components/features/lead/PhoneVerificationModal.tsx` hoặc tương tự.
- **Vai trò**: Modal wrapper hiển thị giao diện xác thực số điện thoại.
- **Nhiệm vụ**:
  - Cung cấp overlay và container cho nội dung OTP.
  - Nhận các props như `isOpen`, `onClose`, `phoneNumber`.

### 3. OtpContainer
- **Vị trí**: `src/components/features/otp/OtpContainer.tsx`
- **Vai trò**: Container chứa logic chính của OTP.
- **Chức năng**:
  - Quản lý state nội bộ: `otpValue`, `timer`, `attempts`.
  - Tích hợp các hooks: `useSubmitOTP`, `useResendOTP`.
  - Xử lý logic đếm ngược (countdown) cho việc gửi lại mã.
  - Xử lý lỗi hiển thị khi nhập sai OTP.
- **Props quan trọng**: `leadId` (để gọi API submit/resend).

### 4. OtpForm
- **Vị trí**: `src/components/ui/otp/OtpForm.tsx`
- **Vai trò**: Component hiển thị thuần túy (Presentational Component).
- **Chức năng**:
  - Render các ô input cho mã OTP (thường là 4 hoặc 6 ô).
  - Render nút "Gửi lại" và đồng hồ đếm ngược.
  - Gọi callback `onChange`, `onSubmit` khi người dùng tương tác.

## Hooks Usage

### useCreateLead
- **Mục đích**: Gọi API tạo lead.
- **Output**: Trả về `leadId` cần thiết cho các bước OTP tiếp theo.

### useSubmitOTP
- **Mục đích**: Gửi mã OTP người dùng nhập lên server.
- **Logic**: Gọi `POST /leads/{id}/submit-otp`.
- **Issues**: Có thể đang chứa mock logic (xem `issues-findings.md`).

### useResendOTP
- **Mục đích**: Yêu cầu gửi lại mã.
- **Logic**: Gọi `POST /leads/{id}/resend-otp`.

## Generic Flow Components
Ngoài luồng Lead, hệ thống còn có `useOTPVerification` hook kết hợp với `useAuthStore` để xử lý OTP cho các luồng generic (như login, transaction verification) mà không phụ thuộc vào `DynamicLoanForm`.
