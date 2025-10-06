# eKYC Library - Tích hợp VNPT eKYC SDK

## 📋 Mục lục

1. [Tổng quan](#1-tổng-quan)
2. [Kiến trúc hệ thống](#2-kiến-trúc-hệ-thống)
3. [Refactoring và cải tiến](#3-refactoring-và-cải-tiến)
4. [Quản lý Configuration](#4-quản-lý-configuration)
5. [Hướng dẫn sử dụng](#5-hướng-dẫn-sử-dụng)
6. [API Reference](#6-api-reference)
7. [Best Practices](#7-best-practices)
8. [Troubleshooting](#8-troubleshooting)

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

- Quản lý credentials bảo mật (`BACKEND_URL`, `TOKEN_KEY`, `TOKEN_ID`, `AUTHORIZION`)
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
    BACKEND_URL: "http://localhost:3001/api/ekyc-proxy",
    TOKEN_KEY: "+==",
    TOKEN_ID: "b85b",
    AUTHORIZION: "your-dev-token",
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
      LANGUAGE: "vi",
      FLOW_TYPE: "DOCUMENT",
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
      <button onClick={restart}>Khởi động lại</button>
    </div>
  );
}
```

#### **Custom Configuration với Builder Pattern**

```tsx
import { EkycConfigBuilder, EkycSdkManager } from "@/lib/ekyc";

const customConfig = new EkycConfigBuilder("your-token")
  .setFlowType("DOCUMENT")
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
  flowType?: "DOCUMENT" | "FACE"; // Default: "FACE"
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
  setFlowType: (flowType: "DOCUMENT" | "FACE") => void;
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
