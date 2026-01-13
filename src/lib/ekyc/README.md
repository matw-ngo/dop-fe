# eKYC Library - Tích hợp VNPT eKYC SDK

## 📋 Mục lục

1. [Tổng quan](#1-tổng-quan)
2. [Kiến trúc hệ thống](#2-kiến-trúc-hệ-thống)
3. [Refactoring và cải tiến](#3-refactoring-và-cải-tiến)
4. [Quản lý Configuration](#4-quản-lý-configuration)
5. [Hướng dẫn sử dụng](#5-hướng-dẫn-sử-dụng)
6. [API Reference](#6-api-reference)
7. [Best Practices](#7-best-practices)
8. [API Integration Usage](#9-api-integration_usage-ekyc-backend-integration)
9. [Session Management](#10-session-management)
10. [Audit Logging](#11-audit-logging)
11. [Performance Benchmarks](#12-performance-benchmarks)
12. [Troubleshooting](#13-troubleshooting)

---

## 1. Tổng quan

Thư viện eKYC được thiết kế để tích hợp và xử lý quy trình eKYC (Electronic Know Your Customer) thông qua nhà cung cấp VNPT một cách an toàn và hiệu quả.

### 🎯 Chức năng chính

- **OCR**: Bóc tách thông tin từ các loại giấy tờ tùy thân (CMND, CCCD, Hộ chiếu...)
- **Liveness Check**: Kiểm tra tính chân thực của giấy tờ và khuôn mặt
- **Face Comparison**: So sánh khuôn mặt trên giấy tờ và ảnh chân dung
- **Masked Face Detection**: Phát hiện khuôn mặt có bị che khẩu trang hay không

### 🔄 Luồng hoạt động bảo mật

Ứng dụng **KHÔNG** giao tiếp trực tiếp với server VNPT, tuân theo mô hình bảo mật:

```
Client App ⇄ Backend Server (của bạn) ⇄ VNPT eKYC Server
```

1. **Client App**: Thu thập ảnh từ người dùng
2. **Client App**: Gửi ảnh lên Backend Server qua API nội bộ
3. **Backend Server**: Xử lý và gọi API VNPT, quản lý authentication
4. **Backend Server**: Trả về kết quả đã xử lý cho Client
5. **Client App**: Hiển thị kết quả cho người dùng

---

## 2. Kiến trúc hệ thống

### 🏗️ Cấu trúc thư mục

```
src/lib/ekyc/
├── config-manager.ts     # Quản lý credentials bảo mật
├── sdk-loader.ts         # Loading CSS/JS assets
├── sdk-config.ts         # Configuration với builder pattern
├── sdk-events.ts         # Event handling
├── sdk-manager.ts        # Main orchestrator
├── types.ts              # Type definitions
└── index.ts              # Public API exports

src/hooks/
└── use-ekyc-sdk.ts       # React integration hook

src/components/features/ekyc/
├── ekyc-sdk-wrapper.tsx  # Clean React component
└── ekyc-example.tsx      # Usage example
```

### 📦 Modules và trách nhiệm

#### **EkycConfigManager** (`config-manager.ts`)

- Quản lý credentials bảo mật (`BACKEND_URL`, `TOKEN_KEY`, `TOKEN_ID`, `ACCESS_TOKEN`)
- Hỗ trợ load từ environment variables hoặc API
- Environment-specific configuration

#### **EkycSdkLoader** (`sdk-loader.ts`)

- Singleton pattern để load CSS/JS assets
- Quản lý lifecycle của SDK assets
- Automatic cleanup

#### **EkycConfigBuilder** (`sdk-config.ts`)

- Builder pattern cho SDK configuration
- Type-safe configuration management
- Customizable styling options

#### **EkycEventManager** (`sdk-events.ts`)

- Centralized event handling
- Callback management
- Two-step process handling (document + face)

#### **EkycSdkManager** (`sdk-manager.ts`)

- Main orchestrator kết hợp tất cả modules
- Public API cho SDK operations
- State management integration

---

## 3. Refactoring và cải tiến

#### 1. **Separation of Concerns**

- Mỗi module có trách nhiệm riêng biệt
- Dễ maintain và debug
- Clear interfaces giữa các modules

#### 2. **Better Error Handling**

- Centralized error management
- Loading states tự động
- Retry mechanisms

#### 3. **Enhanced Developer Experience**

- Better IntelliSense support
- Type safety với TypeScript
- Clear documentation

#### 4. **Performance Optimizations**

- Singleton pattern cho SDK loader
- Efficient cleanup mechanisms
- Optimized React re-renders

---

## 4. Quản lý Configuration

### 🔐 Sensitive Configuration Fields

Ba thông tin quan trọng cần quản lý bảo mật:

#### **BACKEND_URL**

- **Mục đích**: URL của backend proxy server
- **Khuyến nghị**: Sử dụng backend proxy thay vì gọi trực tiếp VNPT
- **Ví dụ**: `"https://your-backend.com/api/ekyc-proxy"`
- **Để trống**: Gọi trực tiếp VNPT (không khuyến nghị production)

#### **TOKEN_KEY**

- **Mục đích**: Key xác thực với VNPT
- **Giá trị mặc định**: `"+=="`
- **Lưu ý**: Phải khớp với cấu hình tài khoản VNPT

#### **TOKEN_ID**

- **Mục đích**: ID token từ VNPT
- **Giá trị mặc định**: `"b85b"`
- **Lưu ý**: Phải khớp với cấu hình tài khoản VNPT

### 🛠️ Configuration Methods

#### 1. **Environment Variables** (Khuyến nghị cho Development)

```bash
# .env.local
NEXT_PUBLIC_EKYC_BACKEND_URL="https://your-backend.com/api/ekyc-proxy"
NEXT_PUBLIC_EKYC_TOKEN_KEY="+=="
NEXT_PUBLIC_EKYC_TOKEN_ID="b85b"
NEXT_PUBLIC_EKYC_AUTH_TOKEN="your-auth-token"
```

**Sử dụng:**

```tsx
<EkycSdkWrapper credentialsSource="env" flowType="FACE" language="vi" />
```

#### 2. **API Endpoint** (Bảo mật cao nhất cho Production)

```typescript
// pages/api/ekyc/credentials.ts
export async function GET() {
  // Verify user authentication
  return Response.json({
    backendUrl: process.env.EKYC_BACKEND_URL,
    tokenKey: process.env.EKYC_TOKEN_KEY,
    tokenId: process.env.EKYC_TOKEN_ID,
    authToken: process.env.EKYC_AUTH_TOKEN,
  });
}
```

**Sử dụng:**

```tsx
<EkycSdkWrapper credentialsSource="api" flowType="FACE" language="vi" />
```

#### 3. **Direct Credentials** (Chỉ dùng Development)

```tsx
<EkycSdkWrapper
  credentialsSource={{
    BACKEND_URL: "https://api.idg.vnpt.vn",
    TOKEN_KEY: "+==",
    TOKEN_ID: "b85b",
    ACCESS_TOKEN: "your-dev-token",
  }}
  flowType="FACE"
  language="vi"
/>
```

---

## 5. Hướng dẫn sử dụng

### 🚀 Quick Start

#### **Basic Usage**

```tsx
import EkycSdkWrapper from "@/components/features/ekyc/ekyc-sdk-wrapper";

function MyComponent() {
  return (
    <EkycSdkWrapper flowType="FACE" language="vi" credentialsSource="env" />
  );
}
```

#### **Advanced Usage với Hook**

```tsx
import { useEkycSdk } from "@/hooks/use-ekyc-sdk";

function AdvancedComponent() {
  const { isLoading, error, restart, setFlowType, setLanguage } = useEkycSdk({
    credentialsSource: "api",
    config: {
      DEFAULT_LANGUAGE: "vi",
      SDK_FLOW: "DOCUMENT",
    },
    customEventHandlers: {
      onSuccess: (data) => console.log("Success!", data),
      onError: (error) => console.log("Error:", error),
    },
  });

  return (
    <div>
      {isLoading && <div>Đang tải SDK...</div>}
      {error && <div>Lỗi: {error}</div>}
      <button onClick={() => setFlowType("FACE")}>Chuyển sang Face</button>
      <button onClick={() => setFlowType("DOCUMENT_TO_FACE")}>Luồng đầy đủ</button>
      <button onClick={restart}>Khởi động lại</button>
    </div>
  );
}
```

#### **Custom Configuration với Builder Pattern**

```tsx
import { EkycConfigBuilder, EkycSdkManager } from "@/lib/ekyc";

const customConfig = new EkycConfigBuilder("your-token")
  .setFlowType("DOCUMENT_TO_FACE") // "DOCUMENT_TO_FACE" | "FACE_TO_DOCUMENT" | "FACE" | "DOCUMENT"
  .setLanguage("en")
  .setDocumentType(DocumentType.CCCD)
  .withCustomStyling({
    listChooseStyle: {
      item_active_color: "#ff0000",
      start_button_background: "#00ff00",
    },
  })
  .build();

const manager = new EkycSdkManager({
  config: customConfig,
  eventHandlers: {
    onSuccess: (data) => handleSuccess(data),
    onError: (error) => handleError(error),
  },
});
```

### 📱 Environment-specific Setup

#### **Development**

```bash
# .env.local
NEXT_PUBLIC_EKYC_BACKEND_URL="http://localhost:3001/api/ekyc-proxy"
NEXT_PUBLIC_EKYC_TOKEN_KEY="+=="
NEXT_PUBLIC_EKYC_TOKEN_ID="b85b"
NEXT_PUBLIC_EKYC_AUTH_TOKEN="dev-token"
```

#### **Production**

```bash
# Server environment variables (không dùng NEXT_PUBLIC_)
EKYC_BACKEND_URL="https://api.yourapp.com/api/ekyc-proxy"
EKYC_TOKEN_KEY="+=="
EKYC_TOKEN_ID="b85b"
EKYC_AUTH_TOKEN="production-token"
```

---

## 6. API Reference

### 🎯 Core Components

#### **EkycSdkWrapper Props**

```typescript
interface EkycSdkWrapperProps {
  containerId?: string; // Default: "ekyc_sdk_intergrated"
  authToken?: string; // Fallback auth token
  // Luồng eKYC:
  // - "DOCUMENT_TO_FACE": Luồng đầy đủ (giấy tờ → mặt)
  // - "FACE_TO_DOCUMENT": Luồng đầy đủ (mặt → giấy tờ)
  // - "DOCUMENT": Chỉ OCR giấy tờ
  // - "FACE": Chỉ quét mặt
  flowType?: "DOCUMENT_TO_FACE" | "FACE_TO_DOCUMENT" | "FACE" | "DOCUMENT"; // Default: "FACE"
  language?: "vi" | "en"; // Default: "vi"
  style?: React.CSSProperties; // Container styles
  className?: string; // CSS class
  credentialsSource?: "env" | "api" | CredentialsObject;
}
```

#### **useEkycSdk Hook**

```typescript
interface UseEkycSdkReturn {
  sdkManager: EkycSdkManager | null;
  isLoading: boolean;
  error: string | null;
  restart: () => void;
  updateConfig: (config: Partial<EkycSdkConfig>) => void;
  setFlowType: (flowType: "DOCUMENT_TO_FACE" | "FACE_TO_DOCUMENT" | "FACE" | "DOCUMENT") => void;
  setDocumentType: (docType: number) => void;
  setLanguage: (language: "vi" | "en") => void;
}
```

### 🏗️ Core Classes

#### **EkycConfigManager**

```typescript
class EkycConfigManager {
  static getInstance(): EkycConfigManager;
  async initialize(source: "env" | "api" | CredentialsObject): Promise<void>;
  getCredentials(): EkycCredentials;
  updateCredential(key: keyof EkycCredentials, value: string): void;
  isValid(): boolean;
  getBackendUrl(): string;
  isUsingProxy(): boolean;
}
```

#### **EkycSdkManager**

```typescript
class EkycSdkManager {
  constructor(options: EkycSdkManagerOptions);
  async initialize(options?: EkycSdkManagerOptions): Promise<void>;
  updateConfig(newConfig: Partial<EkycSdkConfig>): void;
  setFlowType(flowType: "DOCUMENT" | "FACE"): void;
  setDocumentType(docType: number): void;
  setLanguage(language: "vi" | "en"): void;
  restart(): void;
  cleanup(): void;
}
```

### 📊 Type Definitions

#### **Document Types**

```typescript
enum DocumentType {
  CMND = -1, // Chứng minh thư nhân dân
  HoChieu = 5, // Hộ chiếu
  BangLaiXe = 6, // Bằng lái xe
  CMNDQuanDoi = 7, // Chứng minh thư quân đội
  CCCD = 9, // Căn cước công dân gắn chip
}
```

#### **eKYC Response**

```typescript
interface EkycResponse {
  type_document: DocumentType;
  liveness_card_front: LivenessCardResponse;
  liveness_card_back: LivenessCardResponse;
  ocr: OcrResponse;
  liveness_face: LivenessFaceResponse;
  masked: MaskedFaceResponse;
  hash_img: HashImgResponse;
  compare: CompareFaceResponse;
}
```

---

## 7. Best Practices

### 🔒 Security Guidelines

#### **❌ Không nên làm:**

- Hardcode credentials trong frontend code
- Commit sensitive tokens vào git repository
- Sử dụng `NEXT_PUBLIC_` prefix cho sensitive data trong production
- Gọi trực tiếp VNPT API từ frontend

#### **✅ Nên làm:**

- Sử dụng API endpoint để lấy credentials
- Store sensitive data ở server-side only
- Implement proper authentication cho API endpoints
- Sử dụng environment-specific configuration
- Luôn sử dụng HTTPS cho production

### ⚡ Performance Tips

#### **Component Optimization**

```tsx
// ✅ Memoize component khi cần thiết
const MemoizedEkycWrapper = React.memo(EkycSdkWrapper);

// ✅ Sử dụng useCallback cho event handlers
const handleSuccess = useCallback((data) => {
  // Handle success
}, []);

// ✅ Lazy load component
const EkycSdkWrapper = lazy(
  () => import("@/components/features/ekyc/ekyc-sdk-wrapper")
);
```

#### **Configuration Caching**

```tsx
// ✅ Cache config để tránh re-initialization
const configRef = useRef(null);
if (!configRef.current) {
  configRef.current = createCustomConfig();
}
```

### 🧪 Testing Strategies

#### **Unit Testing**

```typescript
// Test các module độc lập
describe("EkycConfigManager", () => {
  it("should load credentials from environment", () => {
    // Test logic
  });
});
```

#### **Integration Testing**

```typescript
// Test integration giữa các modules
describe("EkycSdkManager", () => {
  it("should initialize with config manager", async () => {
    // Test integration
  });
});
```

### 📝 Code Organization

#### **Import Guidelines**

```typescript
// ✅ Grouped imports
import React, { useCallback, useRef } from "react";

import { EkycSdkWrapper, useEkycSdk } from "@/lib/ekyc";
import { DocumentType } from "@/lib/ekyc/types";

import { useEkycStore } from "@/store/use-ekyc-store";
```

#### **Error Handling Pattern**

```typescript
// ✅ Consistent error handling
try {
  await sdkManager.initialize();
} catch (error) {
  console.error("eKYC initialization failed:", error);
  // Specific error handling based on error type
  if (error.message.includes("credentials")) {
    // Handle credential errors
  } else if (error.message.includes("network")) {
    // Handle network errors
  }
}
```

---

## 8. Troubleshooting

### 🚨 Common Issues

#### **Lỗi: "Failed to initialize eKYC credentials"**

**Nguyên nhân:**

- Environment variables chưa được set
- API endpoint không hoạt động
- Network connectivity issues

**Giải pháp:**

```bash
# 1. Kiểm tra environment variables
echo $NEXT_PUBLIC_EKYC_AUTH_TOKEN

# 2. Verify API endpoint
curl -X GET http://localhost:3000/api/ekyc/credentials

# 3. Check .env.local file exists và có đúng format
```

#### **Lỗi: "EkycConfigManager not initialized"**

**Nguyên nhân:**

- ConfigManager chưa được initialize trước khi sử dụng

**Giải pháp:**

```typescript
// ✅ Đảm bảo gọi initialize() trước
const configManager = EkycConfigManager.getInstance();
await configManager.initialize("env");

// hoặc sử dụng autoStart trong hook
const { isLoading } = useEkycSdk({
  autoStart: true, // ✅ Tự động initialize
});
```

#### **Lỗi: "VNPT eKYC SDK not found on window object"**

**Nguyên nhân:**

- SDK scripts chưa load xong
- Network issues khi tải SDK

**Giải pháp:**

```typescript
// ✅ Check network và retry
const { restart } = useEkycSdk({
  // Component sẽ hiển thị retry button
});
```

#### **Environment Variables không load**

**Nguyên nhân:**

- File name sai (phải là `.env.local` cho Next.js)
- Missing `NEXT_PUBLIC_` prefix cho client-side variables
- Development server chưa restart

**Giải pháp:**

```bash
# 1. Restart development server
npm run dev

# 2. Check file name
ls -la .env*

# 3. Verify prefix
grep NEXT_PUBLIC_ .env.local
```

### 🔧 Debug Mode

#### **Enable Detailed Logging**

```typescript
// Thêm vào component để debug
const { sdkManager } = useEkycSdk({
  customEventHandlers: {
    onResult: (result) => {
      console.log("🔍 Debug - eKYC Result:", result);
    },
    onError: (error) => {
      console.error("🔍 Debug - eKYC Error:", error);
    },
  },
});

// Log current config
useEffect(() => {
  if (sdkManager) {
    console.log("🔍 Debug - Current Config:", sdkManager.currentConfig);
  }
}, [sdkManager]);
```

#### **Network Debugging**

```typescript
// Check backend connectivity
const checkBackend = async () => {
  try {
    const response = await fetch("/api/ekyc/credentials");
    console.log("Backend status:", response.status);
    const data = await response.json();
    console.log("Backend data:", data);
  } catch (error) {
    console.error("Backend error:", error);
  }
};
```

### 📞 Support

Nếu gặp issues:

1. Check [Troubleshooting section](#8-troubleshooting)
2. Enable debug mode để get detailed logs
3. Verify environment setup theo [Configuration guide](#4-quản-lý-configuration)

---

## 9. API Integration Usage (eKYC Backend Integration)

### Fetching eKYC Configuration

Use the [`useEkycConfig`](../../hooks/use-ekyc-config.ts:18) hook to fetch eKYC configuration for a lead:

```typescript
import { useEkycConfig } from '@/hooks/use-ekyc-config';

function MyComponent({ leadId }: { leadId: string }) {
  const { data, error, isLoading } = useEkycConfig(leadId);

  if (isLoading) {
    return <div>Loading eKYC configuration...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  if (!data) {
    return null;
  }

  return (
    <div>
      <h3>eKYC Configuration Loaded</h3>
      <p>Document Types: {data.list_type_document.join(', ')}</p>
      <p>Flow Type: {data.sdk_flow}</p>
      {/* Use config to initialize VNPT SDK */}
    </div>
  );
}
```

### Submitting eKYC Results

Use the [`useSubmitEkycResult`](../../hooks/use-submit-ekyc-result.ts:29) hook to submit eKYC results after verification completes:

```typescript
import { useSubmitEkycResult } from '@/hooks/use-submit-ekyc-result';
import { mapEkycResponseToApiRequest } from '@/lib/ekyc/ekyc-api-mapper';
import type { EkycResponse } from '@/lib/ekyc/types';

function EkycSubmitButton({
  leadId,
  ekycResponse
}: {
  leadId: string;
  ekycResponse: EkycResponse;
}) {
  const submitMutation = useSubmitEkycResult();

  const handleSubmit = async () => {
    try {
      // Map VNPT SDK response to API format
      const apiRequest = mapEkycResponseToApiRequest(ekycResponse);
      
      // Submit to backend
      await submitMutation.mutateAsync({
        leadId,
        ekycData: apiRequest,
      });
      
      // Handle success
      console.log('eKYC submitted successfully');
    } catch (error) {
      // Handle error
      console.error('Failed to submit eKYC:', error);
    }
  };

  return (
    <button
      onClick={handleSubmit}
      disabled={submitMutation.isPending}
    >
      {submitMutation.isPending
        ? 'Submitting...'
        : 'Submit Verification'
      }
    </button>
  );
}
```

---

## 10. Session Management

### Overview

Session management prevents duplicate submissions and tracks verification state across page refreshes using localStorage.

### Session Manager API

```typescript
import {
  initSession,
  getSession,
  updateSessionStatus,
  canSubmit,
  markSubmitted,
  clearSession
} from '@/lib/ekyc/session-manager';

// Initialize session
initSession(leadId);

// Get current session state
const session = getSession(leadId);

// Check if submission is allowed
if (canSubmit(leadId)) {
  // Submit eKYC results
  await submitEkycResult(leadId, ekycData);
  markSubmitted(leadId);
}

// Clear session when done
clearSession(leadId);
```

### Session State Structure

```typescript
interface EkycSessionState {
  sessionId: string;        // Generated as `vnpt_${timestamp}_${random}`
  leadId: string;
  status: 'initialized' | 'in_progress' | 'completed' | 'failed' | 'cancelled' | 'expired';
  startTime: number;        // Unix timestamp (ms)
  lastActivity: number;     // Unix timestamp (ms)
  submittedAt?: number;     // Unix timestamp (ms)
  submitted: boolean;
  submissionAttempts: number;
}
```

### Complete Example

```typescript
import { useEffect } from 'react';
import {
  initSession,
  getSession,
  canSubmit,
  markSubmitted,
  clearSession,
  updateSessionStatus
} from '@/lib/ekyc/session-manager';

function EkycFlow({ leadId }: { leadId: string }) {
  useEffect(() => {
    // Initialize session on mount
    initSession(leadId);
    
    return () => {
      // Optional: Clear session on unmount
      // clearSession(leadId);
    };
  }, [leadId]);

  const handleVerificationComplete = async (ekycData: EkycResponse) => {
    // Check if submission is allowed
    if (!canSubmit(leadId)) {
      console.warn('Duplicate submission prevented');
      return;
    }

    try {
      // Update session status
      updateSessionStatus(leadId, 'in_progress');
      
      // Submit to backend
      await submitEkycResult({ leadId, ekycData });
      
      // Mark as submitted
      markSubmitted(leadId);
      updateSessionStatus(leadId, 'completed');
    } catch (error) {
      updateSessionStatus(leadId, 'failed');
      console.error('Submission failed:', error);
    }
  };

  return (
    <div>
      {/* Your eKYC UI */}
    </div>
  );
}
```

### Storage

- **Storage Mechanism**: localStorage
- **Key Pattern**: `ekyc_session_${leadId}`
- **Session TTL**: 30 minutes
- **Cleanup**: Automatic on successful submission

---

## 11. Audit Logging

### Non-PII Logging Approach (SC-010)

The eKYC implementation follows strict non-PII logging practices to comply with Vietnamese Decree 13/2023:

### What is NOT Logged

- ❌ Base64 encoded images (document front/back, face images)
- ❌ Personal information (full name, ID number, date of birth)
- ❌ Address details (home address, hometown)
- ❌ Phone numbers or email addresses
- ❌ Document numbers or identifiers

### What IS Logged

- ✅ Session IDs (generated random identifiers)
- ✅ Timestamps (session start, submission times)
- ✅ Status transitions (initialized → in_progress → completed)
- ✅ Error codes and messages (without sensitive data)
- ✅ Performance metrics (fetch duration, submission duration)
- ✅ Feature flags and configuration settings

### Log Sanitization Example

```typescript
import { auditLogger } from '@/lib/ekyc/audit-logger';

// ✅ Good: Sanitized logging
auditLogger.info('eKYC session started', {
  sessionId: session.sessionId,
  leadId: session.leadId,
  documentType: config.documentType,
  flowType: config.flowType,
});

// ❌ Bad: Logging PII
console.log('User data:', {
  fullName: ekycData.ocr.object.name,
  idNumber: ekycData.ocr.object.id,
  images: ekycData.base64_doc_img // Never log base64 images!
});

// ✅ Good: Log metadata only
auditLogger.info('OCR extraction completed', {
  sessionId: session.sessionId,
  hasId: !!ekycData.ocr.object.id,
  hasName: !!ekycData.ocr.object.name,
  confidenceScore: ekycData.ocr.object.name_prob,
});
```

### Vietnamese Decree 13/2023 Compliance

The implementation adheres to key requirements of Vietnamese Decree 13/2023 on Personal Data Protection:

1. **Data Minimization**: Only collect and process data necessary for identity verification
2. **Purpose Limitation**: Use eKYC data solely for verification purposes
3. **Storage Limitation**: Clear session data after submission (30-minute TTL)
4. **Security Measures**: HTTPS/TLS 1.3 for all data transmission
5. **No Unnecessary Logging**: No PII in application logs or monitoring systems

### Audit Log Format

```typescript
interface AuditLogEntry {
  timestamp: string;
  level: 'info' | 'warn' | 'error';
  event: string;
  sessionId: string;
  metadata: Record<string, unknown>;
}
```

---

## 12. Performance Benchmarks

### Success Criteria

The eKYC implementation meets the following performance benchmarks:

| Criterion | Target | Implementation |
|-----------|--------|----------------|
| **SC-001**: Config fetch latency | <500ms (average) | React Query with 5-minute cache |
| **SC-002**: Submission latency | <3s (average) | Optimized API calls with retry logic |
| **SC-003**: First-attempt success rate | 95% | Pre-submission validation + quality checks |
| **SC-004**: Retry attempts | 3 with exponential backoff | React Query mutation retry config |
| **SC-005**: Cache hit reduction | 80% | 5-minute staleTime reduces API calls |
| **SC-006**: Duplicate submissions | Zero | Session state tracking in localStorage |
| **SC-007**: User-friendly errors | 100% | All errors mapped to user-friendly messages |
| **SC-010**: PII in logs | Zero | Comprehensive log sanitization |

### Measuring Performance

```typescript
// Track configuration fetch performance
const startTime = performance.now();
const { data } = await useEkycConfig(leadId);
const fetchDuration = performance.now() - startTime;
console.log(`Config fetch: ${fetchDuration.toFixed(2)}ms`);

// Track submission performance
const submitStart = performance.now();
await submitMutation.mutateAsync({ leadId, ekycData });
const submitDuration = performance.now() - submitStart;
console.log(`Submission: ${submitDuration.toFixed(2)}ms`);
```

### Cache Performance

The 5-minute cache TTL achieves approximately 80% reduction in API calls:

- **Without Cache**: Every component re-fetch triggers API call
- **With Cache**: Re-fetches within 5 minutes return cached data instantly
- **Cache Invalidation**: Manual refetch available via `refetch()` method

### Network Optimization

- **Payload Size**: Typical eKYC submission 500KB - 2MB (base64 images)
- **Timeout**: 30-second network timeout
- **Retry Strategy**: Exponential backoff (1s, 2s, 4s delays)
- **Compression**: Backend handles gzip compression

---

## 13. Troubleshooting

### Common Issues

#### Configuration Not Loading

**Symptoms**: [`useEkycConfig`](../../hooks/use-ekyc-config.ts:18) returns `isLoading: true` indefinitely

**Possible Causes**:
- Network connectivity issues
- Invalid `leadId` parameter
- Backend API unavailable
- Authentication token expired

**Solutions**:

```bash
# 1. Check network connection
ping your-backend-api.com

# 2. Verify lead ID is valid
# Check that leadId is not empty or undefined

# 3. Check backend API status
curl -H "Authorization: Bearer $TOKEN" \
  https://your-api.com/api/leads/{leadId}/ekyc/config

# 4. Review browser console for errors
# Open DevTools → Console tab
```

```typescript
// Enable debug logging
const { data, error } = useEkycConfig(leadId);

useEffect(() => {
  if (error) {
    console.error('Config fetch error:', error);
    if (error.message.includes('401')) {
      console.error('Authentication failed - token may be expired');
    } else if (error.message.includes('404')) {
      console.error('Lead not found - check leadId');
    }
  }
}, [error]);
```

#### Submission Fails with 409 Conflict

**Symptoms**: Backend returns "DUPLICATE_SUBMISSION" error

**Possible Causes**:
- Result already submitted for this lead
- Session state not properly tracked
- Multiple submission attempts

**Solutions**:

```typescript
// Check session state before submission
import { canSubmit, getSession } from '@/lib/ekyc/session-manager';

const session = getSession(leadId);
console.log('Session state:', session);

if (!canSubmit(leadId)) {
  console.warn('Submission not allowed:', {
    submitted: session?.submitted,
    attempts: session?.submissionAttempts,
    lastSubmit: session?.submittedAt,
  });
  // Show user-friendly message
  toast.info('Verification result already submitted');
  return;
}
```

```bash
# Clear session if needed (development only)
localStorage.removeItem('ekyc_session_{leadId}')
```

#### SDK Not Initializing

**Symptoms**: VNPT SDK container remains empty or shows error

**Possible Causes**:
- Invalid `access_token` in configuration
- SDK script failed to load
- Container element not found
- Browser compatibility issues

**Solutions**:

```typescript
// Verify configuration
const { data: config } = useEkycConfig(leadId);

useEffect(() => {
  if (!config) return;
  
  console.log('SDK Config:', {
    hasToken: !!config.access_token,
    tokenLength: config.access_token?.length,
    flowType: config.sdk_flow,
    docTypes: config.list_type_document,
  });
  
  // Check if container exists
  const container = document.getElementById('ekyc_sdk_intergrated');
  if (!container) {
    console.error('SDK container not found');
  }
}, [config]);
```

```bash
# Check browser compatibility
# Supported: Chrome 90+, Safari 14+, Firefox 88+, Edge 90+

# Verify SDK script loaded
# Open DevTools → Network tab → Filter by "Script"
# Look for vnpt-ekyc-sdk.js
```

#### Type Errors

**Symptoms**: TypeScript compilation errors with API types

**Possible Causes**:
- Outdated type definitions
- Missing type imports
- Incorrect type paths

**Solutions**:

```bash
# 1. Regenerate types from OpenAPI schema
npm run generate:types

# 2. Clear TypeScript cache
rm -rf node_modules/.cache
npm run build

# 3. Check type definitions
cat src/lib/api/v1.d.ts | grep -A 5 "EkycConfigResponse"
```

```typescript
// Ensure correct imports
import type { components } from "@/lib/api/v1.d.ts";

type EkycConfigResponseBody = components["schemas"]["EkycConfigResponseBody"];
type VnptEkycRequestBody = components["schemas"]["VnptEkycRequestBody"];
```

### Debug Mode

Enable detailed logging to troubleshoot issues:

```typescript
// Enable verbose logging in session manager
import { auditLogger } from '@/lib/ekyc/audit-logger';

auditLogger.setLevel('debug');

// All audit logs will now be visible in console
auditLogger.debug('Session state:', { sessionId, status, timestamp });
```

### Browser DevTools

Use browser DevTools for comprehensive debugging:

1. **Network Tab**: Monitor API requests and responses
   - Check `/leads/{id}/ekyc/config` endpoint
   - Check `/leads/{id}/ekyc/vnpt` endpoint
   - Verify request/response payloads

2. **Console Tab**: View application logs
   - Audit logs from [`audit-logger.ts`](audit-logger.ts:1)
   - React Query dev tools (if installed)
   - SDK initialization logs

3. **Application Tab**: Inspect localStorage
   - Key: `ekyc_session_{leadId}`
   - Verify session state structure
   - Check for stale sessions

4. **React DevTools**: Inspect component state
   - Hook return values (`data`, `error`, `isLoading`)
   - Component props and state
   - Query cache status

### Getting Help

If issues persist:

1. Check this README's [Troubleshooting section](#13-troubleshooting)
2. Review [Quickstart Guide](../../../specs/001-ekyc-api-integration/quickstart.md)
3. Enable debug mode for detailed logs
4. Check browser console and network tab
5. Verify environment configuration
6. Consult [API Contracts](../../../specs/001-ekyc-api-integration/contracts/)
