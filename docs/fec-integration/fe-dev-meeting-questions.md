# 🎯 FE Developer - Câu hỏi & Checklist cho cuộc họp E2E Partner Webview

**Mục tiêu**: Chuẩn bị các câu hỏi kỹ thuật để clarify requirements trước khi bắt đầu implementation.

---

## 📋 PHẦN 1: Câu hỏi về Bridge Communication (Native ↔ FE)

### 1.1 Về Event Schema

| #   | Câu hỏi                                                                                               | Lý do quan trọng                 |
| --- | ----------------------------------------------------------------------------------------------------- | -------------------------------- |
| 1   | Native app sẽ trigger event bằng cách nào? (`window.webkit.messageHandler` hay `window.postMessage`?) | Xác định implementation approach |
| 2   | Events có cần acknowledge từ FE không, hay fire-and-forget?                                           | Ảnh hưởng đến error handling     |
| 3   | Tần suất gửi `APP_BACKGROUNDED` / `APP_FOREGROUNDED` - có debounce không?                             | Tránh spam API calls             |
| 4   | Khi FE gửi `FLOW_COMPLETE` - Native có cần response không?                                            | Biết cách handle callback        |

### 1.2 Về Navigation

| #   | Câu hỏi                                                                                           | Lý do quan trọng     |
| --- | ------------------------------------------------------------------------------------------------- | -------------------- |
| 5   | Khi FE gửi `BLOCK_NAVIGATION`, Native có block bằng cách nào? (pop state? disable hardware back?) | Đảm bảo UX nhất quán |
| 6   | Trường hợp nào Native cho phép navigation (`ALLOW_NAVIGATION`)?                                   | Know when to allow   |
| 7   | User ấn nút "X" (close) trên UI - FE gửi event nào? `EXIT_FLOW`?                                  | Standardize action   |

---

## 📋 PHẦN 2: Câu hỏi về Auth & Security

### 2.1 Cookie Handling

| #   | Câu hỏi                                                                                         | Lý do quan trọng                        |
| --- | ----------------------------------------------------------------------------------------------- | --------------------------------------- |
| 8   | **QUAN TRỌNG**: Backend đã set `SameSite=None; Secure` cho cookie chưa?                         | Nếu chưa = Auth fail trên Safari/Chrome |
| 9   | API domain có khác với Webview domain không? (VD: `dop.partner.com` vs `api.fecredit.com`)      | Xác định cross-origin scenario          |
| 10  | Token exchange flow: FE gửi code → Backend trả cookie, hay FE gọi API lấy token rồi set cookie? | Xác định exact flow                     |
| 11  | Cookie có expiration time là bao nhiêu?                                                         | Tính TTL cho PII cleanup                |

### 2.2 PII & Security

| #   | Câu hỏi                                                            | Lý do quan trọng                 |
| --- | ------------------------------------------------------------------ | -------------------------------- |
| 12  | PII data nào cần FE clear? (CCCD, phone, address, income?)         | Xác định fields cần filter       |
| 13  | TTL 60 phút hay lấy từ token expiry?                               | Best practice: dùng token expiry |
| 14  | Khi user force-kill app (không qua event) - PII có bị clear không? | Edge case: app crash             |

---

## 📋 PHẦN 3: Câu hỏi về Timer Drift & OTP

### 3.1 Lifecycle Handling

| #   | Câu hỏi                                                                        | Lý do quan trọng            |
| --- | ------------------------------------------------------------------------------ | --------------------------- |
| 15  | Backend có API `GET /otp/status` để check OTP liveness không?                  | FE cần endpoint để validate |
| 16  | Nếu OTP expired khi foreground - user flow là gì? (auto-resend? manual click?) | UX decision                 |
| 17  | Khi background > 5 phút (OTP timeout) - FE nên hiển thị gì?                    | User experience             |

### 3.2 State Persistence

| #   | Câu hỏi                                                                       | Lý do quan trọng              |
| --- | ----------------------------------------------------------------------------- | ----------------------------- |
| 18  | Form data cần persist những gì? (chỉ text inputs hay including file uploads?) | IndexedDB size considerations |
| 19  | Khi restore từ IndexedDB - có cần re-validate data không?                     | Data integrity                |

---

## 📋 PHẦN 4: Câu hỏi về Camera & eKYC

### 4.1 Native Camera

| #   | Câu hỏi                                                                        | Lý do quan trọng                       |
| --- | ------------------------------------------------------------------------------ | -------------------------------------- |
| 20  | Native có override `webkit` permissions để force camera không?                 | Fix iOS quirk                          |
| 21  | Fallback mode: Nếu Native không support camera - FE có dùng WebRTC được không? | Fallback strategy                      |
| 22  | Photo Picker detection - Native có thể tell FE không?                          | Or FE phải tự detect via filename/EXIF |

### 4.2 Image Upload

| #   | Câu hỏi                                                                         | Lý do quan trọng      |
| --- | ------------------------------------------------------------------------------- | --------------------- |
| 23  | Image upload có qua Native bridge không? (Warning trong spec: có thể crash RAM) | Push via bridge = BAD |
| 24  | Image size limit? (Để FE validate trước khi upload)                             | Avoid failed uploads  |

---

## 📋 PHẦN 5: Câu hỏi về Form & API

### 5.1 Form Versioning

| #   | Câu hỏi                                                          | Lý do quan trọng |
| --- | ---------------------------------------------------------------- | ---------------- |
| 25  | Version format là gì? (VD: `1.0.0`, `2024-01-15`, hash?)         | Consistency      |
| 26  | Khi Backend trả 406 - FE flow là gì? (reset form? show message?) | UX handling      |
| 27  | Form version lấy từ đâu? (API response? config file?)            | Source of truth  |

### 5.2 Error Handling

| #   | Câu hỏi                                                         | Lý do quan trọng           |
| --- | --------------------------------------------------------------- | -------------------------- |
| 28  | 503 error - Native có hiển thị error page không, hay FE render? | Fail-closed implementation |
| 29  | Network timeout - FE retry mấy lần trước khi show error?        | UX balance                 |

---

## 📋 PHẦN 6: Câu hỏi về Theming

### 6.1 Remote Theme

| #   | Câu hỏi                                                      | Lý do quan trọng  |
| --- | ------------------------------------------------------------ | ----------------- |
| 30  | Theme API endpoint là gì? (`/api/v1/partners/{slug}/theme`?) | Implement đúng    |
| 31  | Theme response format là JSON với fields gì?                 | Parse đúng schema |
| 32  | Fallback theme khi API fail - dùng theme nào?                | Default theme     |
| 33  | Theme có cache không? (Và cache duration?)                   | Performance       |

---

## 📋 PHẦN 7: Infrastructure & Setup Questions

### 7.1 Environment

| #   | Câu hỏi                                                 | Lý do quan trọng        |
| --- | ------------------------------------------------------- | ----------------------- |
| 34  | Partner slug lấy từ đâu? URL query, path, hay env var?  | Implementation approach |
| 35  | Có cần build riêng cho partner không, hay single build? | Deployment strategy     |
| 36  | Có Multi-language (i18n) cho partner không?             | Translation scope       |

### 7.2 Testing

| #   | Câu hỏi                                        | Lý do quan trọng |
| --- | ---------------------------------------------- | ---------------- |
| 37  | Có mock/server cho local development không?    | Dev experience   |
| 38  | Có device lab để test iOS Safari quirks không? | QA coverage      |

---

## ✅ CHECKLIST - Items cần có TRƯỚC KHI code

### Must-have từ Native Team:

- [ ] Bridge event listener implementation (iOS: `webkit.messageHandler`, Android: `AndroidBridge`)
- [ ] Xác nhận: Cookie `SameSite=None; Secure` đã set ở Backend
- [ ] `APP_BACKGROUNDED` / `APP_FOREGROUNDED` events firing correctly
- [ ] Camera permission override confirmed

### Must-have từ Backend Team:

- [ ] `GET /otp/status` endpoint (liveness check)
- [ ] Theme API endpoint hoặc config source
- [ ] X-Form-Version header validation
- [ ] 406 response handling (form version mismatch)

### Must-have từ Product/Design:

- [ ] PII fields list cần clear
- [ ] UX flow khi OTP expired
- [ ] Error messages cho các trường hợp
- [ ] Partner-specific branding requirements

---

## 🔴 RISK SUMMARY - Items cần highlight trong cuộc họp

| Risk                              | Mức độ        | Mitigation                             |
| --------------------------------- | ------------- | -------------------------------------- |
| Safari chặn cookie (SameSite=Lax) | 🔴 Cao        | Backend phải set đúng attrs            |
| iOS Photo Picker thay vì Camera   | 🟡 Trung bình | Fallback UI + Native override          |
| Timer drift (Server vs Client)    | 🔴 Cao        | Cần endpoint validate OTP status       |
| IndexedDB storage limit           | 🟡 Trung bình | Chỉ persist text, không persist images |
| Form version mismatch             | 🟡 Trung bình | Cần clear UX khi 406                   |

---

## 📝 NOTES - Ghi chú cá nhân

_(Điền thêm khi có câu trả lời từ cuộc họp)_

### Câu trả lời từ cuộc họp:

---

### Action items sau cuộc họp:

1. [ ]
2. [ ]
3. [ ]

---

**Created**: CUỘC HỌP CHIỀU NAY
**Status**: CHỜ XÁC NHẬN
