# DynamicLoanForm Logic Flow

```mermaid
flowchart TD
    Start([User visits page]) --> CheckStep{Which step?}

    %% ============ STEP 1 ============
    CheckStep -->|"Step 1 — /index"| Step1Start[Bước 1]

    Step1Start --> Step1CheckOtp{sendOtp?}

    Step1CheckOtp -->|Yes| Step1PhoneCheck{Phone có sẵn?}
    Step1PhoneCheck -->|Chưa có| Step1PhoneModal[Hiện Phone Modal]
    Step1PhoneCheck -->|Đã có| Step1CreateLead["createLead\nPOST /leads"]
    Step1PhoneModal --> Step1CreateLead

    Step1CreateLead --> Step1OtpModal["OTP Modal\nDùng token từ createLead"]
    Step1OtpModal --> Step1OtpResult{OTP OK?}
    Step1OtpResult -->|Yes| Step1Next[Chuyển step tiếp]
    Step1OtpResult -->|No - Retry| Step1OtpModal

    Step1CheckOtp -->|No| Step1CreateLeadNoOtp["createLead\nPOST /leads"]
    Step1CreateLeadNoOtp --> Step1Next

    %% ============ STEP 2+ ============
    CheckStep -->|"Step 2+ — /submit-info, /extra..."| Step2Start[Bước 2+]
    Step2Start --> Step2Note["Lead đã có từ Step 1\nĐã có leadId + token"]
    Step2Note --> Step2CheckOtp{sendOtp?}

    Step2CheckOtp -->|Yes| Step2PhoneCheck{Phone có sẵn?}
    Step2PhoneCheck -->|Chưa có| Step2PhoneModal[Hiện Phone Modal]
    Step2PhoneCheck -->|Đã có| Step2OtpModal["OTP Modal\nDùng token hiện có"]
    Step2PhoneModal --> Step2OtpModal

    Step2OtpModal --> Step2OtpResult{OTP OK?}
    Step2OtpResult -->|Yes| Step2SubmitInfo["submit-info\nPOST /leads/:id/submit-info"]
    Step2OtpResult -->|No - Retry| Step2OtpModal
    Step2SubmitInfo --> Step2Next[Chuyển step tiếp / Kết thúc]

    Step2CheckOtp -->|No| Step2SubmitInfoNoOtp["submit-info\nPOST /leads/:id/submit-info"]
    Step2SubmitInfoNoOtp --> Step2Next

    %% ============ FINAL ============
    Step2Next --> FinalCheck{Đã là bước cuối?}
    FinalCheck -->|Chưa| CheckStep
    FinalCheck -->|Rồi| ShowResults([Hiện kết quả tìm kiếm loan])

    %% ============ STYLING ============
    style Start         fill:#607D8B,color:#fff,stroke:none
    style Step1Start    fill:#4CAF50,color:#fff,stroke:none
    style Step2Start    fill:#2196F3,color:#fff,stroke:none
    style Step2Note     fill:#FFF9C4,color:#333,stroke:#FBC02D
    style Step1CreateLead       fill:#81C784,color:#000,stroke:none
    style Step1CreateLeadNoOtp  fill:#81C784,color:#000,stroke:none
    style Step2SubmitInfo       fill:#FF9800,color:#fff,stroke:none
    style Step2SubmitInfoNoOtp  fill:#FF9800,color:#fff,stroke:none
    style Step1OtpModal fill:#E3F2FD,color:#000,stroke:#2196F3,stroke-width:2px
    style Step2OtpModal fill:#E3F2FD,color:#000,stroke:#2196F3,stroke-width:2px
    style ShowResults   fill:#9C27B0,color:#fff,stroke:none
```

## 🎯 Logic Tóm Tắt

### Step 1 (Index === 0)
```
IF sendOtp = true
    ├── Nếu chưa có phone → Hiện Phone Modal
    ├── Gọi createLead (POST /leads) để lấy token
    ├── Hiện OTP Modal (dùng token vừa nhận)
    ├── OTP OK → Navigate step tiếp
    └── OTP Fail → Retry (vòng lại OTP Modal)
ELSE (sendOtp = false)
    └── Gọi createLead → Navigate step tiếp
```

### Step 2+ (Index > 0)
```
Đã có leadId + token từ Step 1

IF sendOtp = true
    ├── Nếu chưa có phone → Hiện Phone Modal
    ├── Hiện OTP Modal (dùng token đã có)
    ├── OTP OK → Gọi submit-info (POST /leads/:id/submit-info)
    ├── submit-info OK → Navigate step tiếp / Kết thúc
    └── OTP Fail → Retry (vòng lại OTP Modal)
ELSE (sendOtp = false)
    └── Gọi submit-info → Navigate step tiếp / Kết thúc
```

## 📝 Ví Dụ Cụ Thể

| Scenario | Step | sendOtp | Phone | Flow |
|----------|------|---------|-------|------|
| **A** | Step 1 `/index` | true | Chưa có | Phone Modal → createLead → OTP → Navigate |
| **B** | Step 1 `/index` | true | Đã có | createLead → OTP → Navigate |
| **C** | Step 1 `/index` | false | — | createLead → Navigate |
| **D** | Step 2 `/submit-info` | true | Đã có | OTP → submit-info → Navigate |
| **E** | Step 2 `/submit-info` | false | — | submit-info → Navigate |
| **F** | Step 3 `/extra` | true | Chưa có | Phone Modal → OTP → submit-info → Navigate |

## ⚠️ Lưu Ý Quan Trọng

1. **Step 1 + OTP**: Luôn gọi `createLead` TRƯỚC OTP để có token
2. **OTP container cần**: `leadId` và `token` để gọi `POST /leads/:id/submit-otp`
3. **Step 2+**: Đã có token từ Step 1, chỉ cần verify OTP rồi gọi `submit-info`
4. **Token lifecycle**: Tạo ở Step 1, dùng cho OTP ở mọi step, hết hạn khi session kết thúc
5. **OTP không thay đổi API chính**: Chỉ là "gate" trước khi navigate (Step 1) hoặc trước `submit-info` (Step 2+)