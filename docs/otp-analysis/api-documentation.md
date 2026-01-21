# OTP API Documentation

Tài liệu này mô tả các API endpoints được sử dụng trong quy trình OTP của Lead Onboarding.

## Endpoints

### 1. Create Lead
Khởi tạo một lead vay mới. Bước này thường kích hoạt việc gửi OTP đầu tiên đến số điện thoại đăng ký.

- **Method**: `POST`
- **Path**: `/leads`
- **Description**: Tạo lead mới và trả về thông tin định danh (ID) cùng token xác thực tạm thời.

#### Request Body
```json
{
  "phoneNumber": "0987654321",
  "nationalId": "123456789012",
  "fullName": "Nguyen Van A",
  // Các thông tin khác của khoản vay
}
```

#### Response (Success - 201)
```json
{
  "id": "lead-12345",
  "token": "eyJh...",
  "status": "pending_verification"
}
```

---

### 2. Submit OTP
Xác thực mã OTP mà người dùng nhập vào.

- **Method**: `POST`
- **Path**: `/leads/{id}/submit-otp`
- **Description**: Gửi mã OTP lên để xác thực quyền sở hữu số điện thoại.

#### Path Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | ID của Lead (nhận được từ bước Create Lead) |

#### Request Body
```json
{
  "otp": "123456",
  "type": 2 // 2 thường đại diện cho SMS OTP trong hệ thống
}
```

#### Response (Success - 200)
```json
{
  "verified": true,
  "message": "OTP verified successfully"
}
```

#### Response (Error - 400/401)
```json
{
  "code": "INVALID_OTP",
  "message": "Mã OTP không chính xác hoặc đã hết hạn."
}
```

---

### 3. Resend OTP
Gửi lại mã OTP mới khi mã cũ hết hạn hoặc người dùng không nhận được.

- **Method**: `POST`
- **Path**: `/leads/{id}/resend-otp`
- **Description**: Yêu cầu server gửi lại mã OTP qua SMS.

#### Path Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | ID của Lead |

#### Response (Success - 200)
```json
{
  "sent": true,
  "resendAvailableAt": "2024-01-20T10:05:00Z" // Thời gian có thể gửi lại tiếp theo
}
```

## Ghi chú tích hợp
- **Authentication**: Các API này có thể yêu cầu Bearer Token (nếu có) hoặc dựa vào session tạm thời được thiết lập từ bước Create Lead.
- **Rate Limiting**: API `resend-otp` thường có giới hạn số lần gửi trong một khoảng thời gian nhất định để ngăn chặn spam.
- **OTP Type**: Hiện tại hệ thống đang hardcode `type: 2` cho SMS. Cần lưu ý nếu mở rộng sang Voice OTP hoặc Email OTP trong tương lai.
