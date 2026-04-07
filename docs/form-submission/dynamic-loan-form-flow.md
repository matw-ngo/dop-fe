# DynamicLoanForm Logic Flow

```mermaid
flowchart TD
    Start([User visits page]) --> CheckStep{Which step?}
    
    %% ============ STEP 1 LOGIC ============
    CheckStep -->|"Step 1 (/index)"| Step1Start[Bước 1]
    Step1Start --> Step1API[createLead<br/>POST /leads]
    
    %% ============ STEP 2+ LOGIC ============
    CheckStep -->|"Step 2+"| Step2Start["Bước 2+"]
    Step2Start --> Step2Note["📝 LeadId đã có từ Step 1<br/>(không cần check vì Step 1 luôn tạo lead)"]
    Step2Note --> Step2API["submit-info<br/>POST /leads/{id}/submit-info"]
    
    %% ============ PHONE VERIFY LAYER ============
    %% Phone verify có thể xuất hiện ở BẤT KỲ bước nào
    subgraph PhoneVerifyLayer ["📱 Phone Verify Layer - Có thể ở BẤT KỲ bước nào"]
        direction TB
        PhoneCheck{sendOtp?} 
        PhoneCheck -->|Yes| PhoneNeed{Phone đã có?}
        PhoneNeed -->|Chưa có| PhoneModal[Hiện Phone Modal]
        PhoneNeed -->|Đã có trong form| UseFormPhone[Dùng phone từ form]
        PhoneModal --> VerifyModal[Hiện OTP Modal]
        UseFormPhone --> VerifyModal
        VerifyModal --> OTPResult{OTP OK?}
        OTPResult -->|Yes| ContinueAPI[Gọi API chính]
        OTPResult -->|No| ErrorRetry["Error / Retry"]
        PhoneCheck -->|No| ContinueAPINoPhone["Không cần phone<br/>Gọi API chính luôn"]
    end
    
    %% ============ KẾT NỐI CÁC LAYER ============
    %% Step 1: Luôn đi qua Phone Verify Layer trước rồi mới gọi API
    Step1Start -.->|Có thể có sendOtp| PhoneCheck
    ContinueAPI -.-> Step1API
    ContinueAPINoPhone -.-> Step1API
    
    %% Step 2+: Luôn submit-info (đã có lead từ step 1)
    Step2Start -.->|Có thể có sendOtp| PhoneCheck
    ContinueAPI -.-> Step2API
    ContinueAPINoPhone -.-> Step2API
    
    %% ============ FLOW TIẾP THEO ============
    Step1API --> NextStep[Chuyển sang step tiếp]
    Step2API --> NextStepOrEnd
    
    NextStepOrEnd{Đã là bước cuối?}
    NextStepOrEnd -->|Chưa| NextStep
    NextStepOrEnd -->|Rồi| ShowResults[Hiện kết quả tìm kiếm loan]
    NextStep --> CheckStep
    
    %% ============ STYLING ============
    style Step1Start fill:#4CAF50,color:#fff
    style Step2Start fill:#2196F3,color:#fff
    style Step1API fill:#81C784,color:#000
    style Step2API fill:#FF9800,color:#fff
    style PhoneVerifyLayer fill:#E3F2FD,color:#000,stroke:#2196F3,stroke-width:3px
    style PhoneCheck fill:#90CAF9,color:#000
    style ShowResults fill:#9C27B0,color:#fff
```

## 🎯 Logic Tóm Tắt

### API Call Logic (Không phụ thuộc Phone Verify)
```
Step Index === 0 (Bước 1)
    └── ALWAYS: POST /leads (createLead)

Step Index > 0 (Bước 2+)
    ├── IF leadId exists: POST /leads/{id}/submit-info
    └── IF no leadId: POST /leads (createLead)
```

### Phone Verify Layer (Có thể xuất hiện ở BẤT KỲ bước)
```
Bất kỳ bước nào:
    ├── IF sendOtp = true
    │   ├── IF phone chưa có → Hiện modal nhập phone → OTP → Gọi API
    │   └── IF phone đã có → OTP luôn → Gọi API
    └── IF sendOtp = false
        └── Gọi API ngay (không cần phone)
```

## 📝 Ví Dụ Cụ Thể

| Scenario | Step | sendOtp | Phone | API Call |
|----------|------|---------|-------|----------|
| **A** | Step 1 (/index) | true | Chưa có | Phone Modal → OTP → createLead |
| **B** | Step 1 (/index) | false | - | createLead ngay |
| **C** | Step 2 (/submit-info) | true | Đã có | OTP → submit-info |
| **D** | Step 2 (/submit-info) | false | - | submit-info ngay |
| **E** | Step 3 (/extra) | true | Chưa có | Phone Modal → OTP → submit-info |

## ⚠️ Lưu Ý Quan Trọng

1. **Phone Verify là "layer" riêng**, không phải logic rẽ nhánh chính
2. **API call chỉ phụ thuộc vào Step Index** (1 tạo lead, 2+ submit-info)
3. **OTP có thể xuất hiện ở bất kỳ step nào** dựa trên `sendOtp` flag của flow config
4. **Step 1 luôn tạo lead** dù có OTP hay không
5. **Step 2+ dùng submit-info** (nếu có leadId) hoặc tạo lead (nếu chưa có)
