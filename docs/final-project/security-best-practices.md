# DOP-FE Security Best Practices

## Mục lục

1. [Tổng quan về Bảo mật](#tổng-quan-về-bảo-mật)
2. [Xác thực và Phân quyền](#xác-thực-và-phân-quyền)
3. [Validation và Xử lý Dữ liệu](#validation-và-xử-lý-dữ-liệu)
4. [Quản lý Bí mật và Môi trường](#quản-lý-bí-mật-và-môi-trường)
5. [Bảo mật Triển khai](#bảo-mật-triển-khai)
6. [Kiểm tra và Giám sát Bảo mật](#kiểm-tra-và-giám-sát-bảo-mật)
7. [Checklist Bảo mật](#checklist-bảo-mật)

## Tổng quan về Bảo mật

DOP-FE được xây dựng với nhiều lớp bảo mật để đảm bảo an toàn dữ liệu người dùng và ngăn chặn các cuộc tấn công phổ biến. Tài liệu này cung cấp hướng dẫn chi tiết về các thực hành bảo mật tốt nhất được áp dụng trong dự án.

### Nguyên tắc bảo mật chính

- **Defense in Depth**: Áp dụng nhiều lớp bảo mật
- **Least Privilege**: Cung cấp quyền truy cập tối thiểu cần thiết
- **Secure by Default**: Cấu hình bảo mật theo mặc định
- **Fail Securely**: Khi hệ thống lỗi, vẫn duy trì trạng thái an toàn

## Xác thực và Phân quyền

### Hệ thống Xác thực

DOP-FE sử dụng hệ thống xác thực dựa trên token với các thành phần chính sau:

#### Auth Context và Store

Hệ thống xác thực được quản lý qua [`AuthContext`](src/lib/auth/auth-context.tsx:1) và [`useAuthStore`](src/store/use-auth-store.ts:1):

```typescript
// Cấu trúc Auth State
export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isHydrated: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  checkAuth: () => void;
}
```

#### Quản lý Token

Token được lưu trữ an toàn trong localStorage với các cơ chế sau:

- **Access Token**: Dùng cho xác thực các yêu cầu API
- **Refresh Token**: Dùng để làm mới access token khi hết hạn
- **Token Validation**: Kiểm tra tính hợp lệ của token trước mỗi yêu cầu

```typescript
// Ví dụ quản lý token trong API client
const token = localStorage.getItem("accessToken");
if (token) {
  req.request.headers.set("Authorization", `Bearer ${token}`);
}
```

#### Protected Routes

Sử dụng component [`ProtectedRoute`](src/components/auth/protected-route.tsx:1) để bảo vệ các route cần xác thực:

```typescript
export function ProtectedRoute({
  children,
  requiredRole,
  redirectTo = "/admin/login",
}: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, isHydrated, user } = useAuth();
  
  // Logic kiểm tra xác thực và phân quyền
}
```

### Phân quyền theo vai trò (Role-Based Access Control)

Hệ thống hỗ trợ phân quyền dựa trên vai trò:

- **Admin**: Toàn quyền truy cập
- **User**: Quyền truy cập giới hạn

```typescript
export interface User {
  id: string;
  username: string;
  email: string;
  role: "admin" | "user";
}
```

## Validation và Xử lý Dữ liệu

### Client-side Validation với Zod

DOP-FE sử dụng Zod để validation dữ liệu ở phía client thông qua [`zod-generator`](src/lib/builders/zod-generator.ts:1):

```typescript
// Tạo schema từ field configurations
export function generateZodSchema(
  fields: FieldConfig[],
  t: (key: string, values?: Record<string, any>) => string,
) {
  const schemaShape: Record<string, z.ZodTypeAny> = {};
  
  // Logic tạo schema động
  for (const field of fields) {
    let fieldSchema: z.ZodTypeAny = z.string();
    
    // Áp dụng validation rules
    const validations = field.props.validations || [];
    for (const rule of validations) {
      fieldSchema = applyValidationRule(
        fieldSchema,
        rule,
        message,
        field.component,
      );
    }
    
    schemaShape[field.fieldName] = fieldSchema;
  }
  
  return z.object(schemaShape);
}
```

### Các loại Validation được hỗ trợ

Hệ thống hỗ trợ nhiều loại validation:

- **required**: Trường bắt buộc
- **minLength/maxLength**: Độ dài tối thiểu/tối đa
- **min/max**: Giá trị tối thiểu/tối đa
- **email**: Định dạng email
- **url**: Định dạng URL
- **regex**: Biểu thức chính quy tùy chỉnh
- **number/integer**: Kiểu số
- **date**: Kiểu ngày tháng

### Xử lý Dữ liệu Nhạy cảm

#### PII (Personally Identifiable Information) Protection

```typescript
// Ví dụ về masking PII
class PIIProtection {
  static maskPII(field: PIIField): string {
    if (!field.isPII || !field.value) {
      return field.value;
    }
    
    const { maskChar = '*', visibleChars = 4 } = field;
    
    if (field.value.length <= visibleChars) {
      return field.value;
    }
    
    const visiblePart = field.value.substring(0, visibleChars);
    const maskedPart = maskChar.repeat(field.value.length - visibleChars);
    
    return visiblePart + maskedPart;
  }
}
```

#### Sanitization

- **Input Sanitization**: Làm sạch dữ liệu đầu vào
- **Output Encoding**: Mã hóa dữ liệu đầu ra
- **XSS Prevention**: Ngăn chặn Cross-Site Scripting

## Quản lý Bí mật và Môi trường

### Environment Variables

Các biến môi trường được quản lý an toàn:

```typescript
// Ví dụ cấu trúc environment config
interface EnvironmentConfig {
  API_URL: string;
  USE_MOCK_API: boolean;
  EKYC_CONFIG: {
    AUTH_TOKEN: string;
    BACKEND_URL: string;
    ENVIRONMENT: 'development' | 'staging' | 'production';
  };
  ANALYTICS_ID?: string;
  FEATURE_FLAGS: {
    ENABLE_DEBUG: boolean;
    ENABLE_ANALYTICS: boolean;
  };
}
```

### Best Practices cho Environment Variables

- **Không bao giờ commit file .env** vào version control
- **Sử dụng .env.example** làm template
- **Phân tách môi trường** (development, staging, production)
- **Validation** cho các biến môi trường bắt buộc

### API Client Security

[`API Client`](src/lib/api/client.ts:1) được thiết kế với các tính năng bảo mật:

```typescript
// Interceptor cho authentication
apiClient.use({
  async onRequest(req) {
    // Attach authentication token
    const token = localStorage.getItem("accessToken");
    if (token) {
      req.request.headers.set("Authorization", `Bearer ${token}`);
    }
  },
  
  async onResponse(res) {
    // Token refresh logic
    if (res.response.status === 401) {
      // Xử lý làm mới token
    }
    
    // Global error handling
    if (res.response.status >= 500) {
      // Xử lý lỗi server
    }
  },
});
```

## Bảo mật Triển khai

### Security Headers

Triển khai các security headers quan trọng:

```typescript
// Ví dụ security headers
const securityHeaders = {
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Content-Security-Policy': 'default-src \'self\'; script-src \'self\'',
};
```

### HTTPS Configuration

- **Bắt buộc HTTPS** cho tất cả kết nối
- **TLS 1.2+** cho encryption
- **HSTS** để enforce HTTPS
- **Certificate Management** đúng cách

### CORS Configuration

```typescript
// Ví dụ CORS configuration
const corsConfig = {
  allowedOrigins: ['https://your-domain.com'],
  allowedMethods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
};
```

## Kiểm tra và Giám sát Bảo mật

### Security Testing

#### Dependency Scanning

```bash
# Quét lỗ hổng dependencies
npm audit --audit-level high

# Sử dụng Snyk cho quét sâu hơn
snyk test
```

#### Code Analysis

```bash
# ESLint với security rules
npx eslint . --ext .js,.jsx,.ts,.tsx --config .eslintrc.security.js
```

### Monitoring

#### Security Event Logging

```typescript
// Ví dụ logging security events
private logSecurityEvent(event: string, data: any): void {
  fetch('/api/security/log', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      event, 
      data, 
      timestamp: Date.now(),
      userAgent: navigator.userAgent,
      ip: getClientIP()
    })
  }).catch(console.error);
}
```

#### Error Handling

- **Secure Error Messages**: Không tiết lộ thông tin nhạy cảm
- **Global Error Handler**: Xử lý lỗi tập trung
- **Error Reporting**: Báo cáo lỗi đến monitoring service

## Checklist Bảo mật

### Development Phase

- [ ] **Input Validation**: Tất cả input đều được validate
- [ ] **Output Encoding**: Output được encoding đúng cách
- [ ] **Authentication**: Xác thực mạnh mẽ được triển khai
- [ ] **Session Management**: Quản lý session an toàn
- [ ] **Data Protection**: Dữ liệu nhạy cảm được bảo vệ
- [ ] **API Security**: API endpoints được bảo mật
- [ ] **Dependencies**: Dependencies được cập nhật thường xuyên

### Production Deployment

- [ ] **HTTPS**: Tất cả kết nối sử dụng HTTPS
- [ ] **Security Headers**: Tất cả security headers được triển khai
- [ ] **CSP**: Content Security Policy được cấu hình
- [ ] **CORS**: CORS được cấu hình đúng cách
- [ ] **Environment Variables**: Biến môi trường được bảo mật
- [ ] **Monitoring**: Security monitoring được kích hoạt
- [ ] **Backup**: Backup an toàn được thiết lập
- [ ] **Access Control**: Kiểm soát truy cập phù hợp
- [ ] **Audit Trail**: Logging toàn diện được triển khai
- [ ] **Incident Response**: Kế hoạch response sẵn sàng

### Regular Maintenance

- [ ] **Security Updates**: Áp dụng security patches thường xuyên
- [ ] **Vulnerability Scanning**: Quét lỗ hổng định kỳ
- [ ] **Security Audits**: Thực hiện security audits
- [ ] **Training**: Đào tạo security cho team
- [ ] **Documentation**: Cập nhật tài liệu security

## Kết luận

Bảo mật là một quá trình liên tục, không phải là một đích đến. Bằng cách tuân thủ các thực hành bảo mật tốt nhất được mô tả trong tài liệu này, DOP-FE có thể đảm bảo an toàn cho dữ liệu người dùng và ngăn chặn các cuộc tấn công phổ biến.

Để hiệu quả nhất, các thực hành này nên được tích hợp vào toàn bộ vòng đời phát triển phần mềm, từ thiết kế, phát triển, triển khai đến bảo trì.