# Integration Plan: E2E Partner Loan Origination Webview

Bản kế hoạch triển khai (Version 5 - Truly Frozen) giải quyết dứt điểm các rủi ro kỹ thuật ngầm (Edge-case rủi ro cao) sẽ gây bug diện rộng trên môi trường Production Thực Tế, bao gồm quirk thiết bị OS, cơ chế bảo mật Cookie Cross-Origin và sai lệch đồng hồ (Timer Drift) Server-Client. Bản này làm tài liệu đóng băng trước khi code và họp.

## 🔴 Phase 1: Critical Prerequisites & Bridge Contract (Họp chốt thông số kỹ thuật)

### 1.1 Bidirectional Bridge Event Schema & Adapter Pattern
FE DOP cần có một file spec cho cả **Outbound (FE gửi Native)** và **Inbound (Native gửi FE)**.
- Định nghĩa schema phân tách 2 chiều `src/types/bridge-event-spec.ts`:
```typescript
// 1. FE -> Native (Outbound)
export type FEToNativeEventType = 'FLOW_COMPLETE' | 'FLOW_FAILED' | 'EXIT_FLOW' | 'BLOCK_NAVIGATION' | 'ALLOW_NAVIGATION';
// 2. Native -> FE (Inbound)
export type NativeToFEEventType = 'BACK_PRESSED' | 'APP_BACKGROUNDED' | 'APP_FOREGROUNDED';
```

### 1.2 Security Auth Code & Vấn Đề Cross-origin Cookie Bị Chặn
Tuyệt đối không lưu Session Token ở IndexedDB do lỗ hổng XSS.
*Giải pháp Thực thi:*
- Webview chạy luồng **One-time code exchange** lấy `HTTP-only Cookie` tách token khỏi tầng JS.
- **🚨 NỘI DUNG CẦN ĐƯA VÀO HỌP BACKEND:** Nếu domain gốc của Webview (FE) khác domain API (Backend) - VD: `dop.partner.com` gọi `api.fecredit.com` - thì Cookie trả về **BẮT BUỘC** phải gắn thuộc tính `SameSite=None; Secure`. Nếu Backend vô tình để mặc định (Lax), Safari và Chrome sẽ chặn hoàn toàn luồng Auth. Yêu cầu HTTPS trên cả 2 môi trường.

### 1.3 Native Camera Quirk: Lỗi hiển thị Photo Picker thay vì Mở thẳng Camera
Mặc dù đã set attribute phân loại camera, iOS WKWebView nổi tiếng với các "hành vi quirk" (chạy sai luật) tùy version. Thay vì luôn bật camera sau cho thẻ `capture="environment"`, WKWebView đôi khi vứt thẳng vào "Photo Picker" cho khách tự chọn ảnh trong thư viện, làm gãy luồng eKYC đòi tính Real-time.
*Giải pháp Thực thi:*
- Frontend thiết kế **Fallback UI (Lưới dự phòng)**: Nếu có dấu hiệu input trả về hình vuông mượt thay vì hình chụp thực tế, hiển thị Modal cảnh báo ngay: "Hệ thống phát hiện ảnh chọn từ thư viện. Vui lòng chụp mới hoàn toàn để đảm bảo xác thực eKYC" và ép user phải thao tác input lần nữa hoặc fallback sử dụng WebRTC. (Yêu cầu Native xác nhận có override hoàn tất webkit-permissions).
- Tuyệt đối không đẩy payload ảnh qua Bridge qua app Native vì nguy cơ treo RAM Memory Crash cực cao. Giữ luồng tải FE -> API qua chuẩn HTTP FormData.

---

## 🟡 Phase 2: High Impact Flow Corrections (Lệch nhịp Logic Hệ thống)

### 2.1 Mất Đồng Bộ Timer (Drift) vì Vòng đời APP_BACKGROUNDED
Logic hiện tại: Ấn ra background làm "Pause" bộ nhớ và bộ đếm OTP > Ấn Foreground (mở lại app) làm "Resume" đếm.
**🚨 Lỗi Thực Tế:** Server không "Nhấn Pause" cùng Frontend! Nếu user background 8 phút, Server đếm OTP chết từ phút thứ 5. Khi resume, Frontend ngây thơ đếm tiếp 2 phút cuối, dẫn đến call API verify luôn luôn rớt gây đơ ứng dụng.
*Giải pháp Thực thi:*
- Nhận `APP_BACKGROUNDED`: FE **Flush (Ghi ngay lập tức)** toàn bộ State đang nhập dở xuống Persistent IndexedDB. Trực tiếp tắt đồng hồ trên UI thay vì pause.
- Nhận `APP_FOREGROUNDED`: FE tải state, và gọi **Liveness Check Endpoint** của API Backend (`GET /otp/status`) để xác thực "Tình trạng khả dụng thực của mã OTP". Nếu Backend báo sống: tái lấy config countdown thực chạy tính từ giờ. Nếu báo hết hạn: Yêu cầu Request New OTP thay vì để App đánh lừa người dùng.
- Intercept Back: Gọi Bridge `{type: 'BLOCK_NAVIGATION'}` khóa luồng nếu ở màn OTP.

### 2.2 Quản lý PII Data Cleanup (Tránh rỉ dữ liệu qua SessionState)
Dữ liệu nhạy cảm nằm trên form cục bộ phải tự sát.
*Giải pháp Thực thi:*
- Trigger xóa sạch (Hard-Clear) CSDL PII từ Store nếu gặp lệnh `FLOW_COMPLETE`, `FLOW_FAILED`, `EXIT_FLOW`.
- **TTL (Time to Live) 60 Phút:** Lấy đồng bộ mốc thời gian Expire Token từ Backend, hoặc chốt cứng 60 Phút. Nếu qua khỏi khung thời gian này, Force-Clear cục bộ, ném State PII cho rỗng. Tránh việc User mượn máy 1 tiếng rưỡi sau vào lại lộ hết CCCD, thông tin.

### 2.3 Form Versioning
- Kẹp header HTTP `X-Form-Version` cho mọi submit API Form. Nếu config backend vừa nhảy version mới lúc user đang bấm, Server trả 406 Not Acceptable báo khách làm lại từ đầu.

---

## 🟢 Phase 3: Optimizations (Medium Risk)

### 3.1 Validation & Strict Fail-Closed Middleware
- Thiết lập chặn đường biên Slug validation bằng Router Middleware. 
- **Quy tắc Fail-Closed Cực Đoan:** Nếu API kiểm tra Backend lag/sập/timeout... Không được thả nổi cho React vẽ Layout Component! Ép luôn mã HTTP 503 Webview chết (Service Unavailable) hiển thị báo lõi mạng. Việc này nhằm tránh lọt qua màng bọc bảo vệ Auth dẫn đến Crash Theme/Data.

### 3.2 Dynamic Remote Theming
- Giải quyết vấn đề deploy cứng, thay bằng Endpoint fetch JSON theo slug biến màu CSS variable (`var()`) trực tiếp lúc render Component. Mở rộng n Partner không re-deploy.

---

## ✨ CHUYỂN GIAO THỰC THI (ACTION ITEMS 100% READY)
Khóa (Freeze) Document ở đây. Tiến tới:
1. Gửi Spec `bridge-event-spec` và Yêu cầu Camera/Cookie/Cross-Origin Token trong cuộc họp Native x FE x BE.
2. Coding `usePartnerBridge` ngay khi luồng Native đã khai thông kỹ thuật.
