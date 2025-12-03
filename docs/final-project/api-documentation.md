# Tài liệu API DOP-FE

## Tổng quan

### API Base URL
- **Development**: `https://dop-stg.datanest.vn/v1`
- **Production**: `https://dop.datanest.vn/v1`
- **Local Override**: `process.env.NEXT_PUBLIC_API_URL`

### Xác thực
- **Phương thức**: Cookie-based authentication với session management
- **Security Scheme**: `cookie_auth` (apiKey trong cookie có tên 'session')
- **Token Management**: Hiện tại sử dụng mock authentication, triển khai thực tế đang chờ xử lý

### Rate Limiting
- Thông tin rate limiting không được chỉ định trong OpenAPI spec
- Triển khai retry logic với exponential backoff cho các yêu cầu thất bại

### Thông tin phiên bản
- **API Version**: v1.0
- **OpenAPI Specification**: 3.0.3
- **Type Generation**: Tự động tạo TypeScript types qua `openapi-typescript`

## Mục lục

1. [Endpoints](#endpoints)
   - [Flow Management API](#flow-management-api)
   - [User Onboarding API](#user-onboarding-api)
   - [OTP Management API](#otp-management-api)
   - [Admin API](#admin-api)
2. [Request/Response Formats](#requestresponse-formats)
   - [Request Headers](#request-headers)
   - [Response Format](#response-format)
3. [Error Handling](#error-handling)
   - [HTTP Status Codes](#http-status-codes)
   - [Error Response Structure](#error-response-structure)
4. [Authentication](#authentication)
   - [Session Management](#session-management)
   - [Permission System](#permission-system)
   - [Client Implementation](#client-implementation)
5. [Type Safety](#type-safety)
   - [Generated Types](#generated-types)
   - [Custom Types](#custom-types)
6. [Development Tools](#development-tools)
   - [API Type Generation](#api-type-generation)
   - [Mock vs Real API](#mock-vs-real-api)
   - [Debug Mode](#debug-mode)
7. [Best Practices](#best-practices)
   - [Error Handling](#error-handling-best-practices)
   - [Performance Optimization](#performance-optimization)
   - [Security Considerations](#security-considerations)
8. [Integration Examples](#integration-examples)
   - [React Hook Integration](#react-hook-integration)
   - [Form Submission Integration](#form-submission-integration)
9. [Troubleshooting](#troubleshooting)
   - [Common Issues](#common-issues)
   - [Debug Tools](#debug-tools)

## Endpoints

### Flow Management API

#### GET /flows/{domain}
- **Mục đích**: Lấy cấu hình flow onboarding theo domain
- **Xác thực**: Yêu cầu (cookie_auth)
- **Tham số**:
  - `domain` (path, required): Domain identifier
- **Response**: [`FlowDetail`](src/lib/api/v1.d.ts:143)
- **Ví dụ sử dụng**:
```typescript
import apiClient from '@/lib/api/client';

const flow = await apiClient.GET('/flows/{domain}', {
  params: {
    path: { domain: 'example-domain' }
  }
});
```

### User Onboarding API

#### POST /leads
- **Mục đích**: Tạo một lead mới trong hệ thống
- **Xác thực**: Yêu cầu (cookie_auth)
- **Request Body**: [`CreateLeadRequestBody`](src/lib/api/v1.d.ts:200)
- **Response**: [`CreateLeadResponseBody`](src/lib/api/v1.d.ts:207)
- **Ví dụ sử dụng**:
```typescript
const lead = await apiClient.POST('/leads', {
  body: {
    flow_id: 'uuid-here',
    domain: 'example-domain',
    deviece_info: {},
    tracking_params: {},
    info: {
      flow_id: 'uuid-here',
      step_id: 'step-uuid',
      phone_number: '+1234567890',
      email: 'user@example.com'
    }
  }
});
```

#### POST /leads/{id}/submit-info
- **Mục đích**: Gửi thêm thông tin lead
- **Xác thực**: Yêu cầu (cookie_auth)
- **Tham số**:
  - `id` (path, required): Lead UUID
- **Request Body**: [`SubmitLeadInfoRequestBody`](src/lib/api/v1.d.ts:174)
- **Response**: HTTP 200 OK
- **Ví dụ sử dụng**:
```typescript
await apiClient.POST('/leads/{id}/submit-info', {
  params: {
    path: { id: 'lead-uuid' }
  },
  body: {
    flow_id: 'flow-uuid',
    step_id: 'step-uuid',
    full_name: 'John Doe',
    national_id: '123456789',
    gender: 'male',
    birthday: '1990-01-01'
  }
});
```

### OTP Management API

#### POST /leads/{id}/submit-otp
- **Mục đích**: Gửi mã xác thực OTP
- **Xác thực**: Yêu cầu (cookie_auth)
- **Tham số**:
  - `id` (path, required): Lead UUID
- **Request Body**: [`SubmitOTPRequestBody`](src/lib/api/v1.d.ts:211)
- **Response**: HTTP 200 OK
- **Ví dụ sử dụng**:
```typescript
await apiClient.POST('/leads/{id}/submit-otp', {
  params: {
    path: { id: 'lead-uuid' }
  },
  body: {
    token: 'verification-token',
    otp: '123456'
  }
});
```

#### POST /leads/{id}/resend-otp
- **Mục đích**: Gửi lại OTP cho người dùng
- **Xác thực**: Yêu cầu (cookie_auth)
- **Tham số**:
  - `id` (path, required): Lead UUID
- **Request Body**: [`ResendOTPRequestBody`](src/lib/api/v1.d.ts:217)
- **Response**: HTTP 200 OK
- **Ví dụ sử dụng**:
```typescript
await apiClient.POST('/leads/{id}/resend-otp', {
  params: {
    path: { id: 'lead-uuid' }
  },
  body: {
    target: '+1234567890' // hoặc địa chỉ email
  }
});
```

### Admin API (Triển khai tùy chỉnh)

#### Flow Management
- **GET /admin/flows**: Liệt kê tất cả flows với phân trang
- **GET /admin/flows/{id}**: Lấy chi tiết flow cụ thể
- **PATCH /admin/flows/{id}**: Cập nhật cấu hình flow
- **Response Types**: [`AdminFlowDetail`](src/lib/api/admin-types.d.ts:16), [`AdminFlowListResponse`](src/lib/api/admin-types.d.ts:109)

#### Step Management
- **GET /admin/flows/{flowId}/steps**: Lấy các steps cho một flow
- **GET /admin/steps/{id}**: Lấy chi tiết step cụ thể
- **PATCH /admin/steps/{id}**: Cập nhật cấu hình step
- **Response Types**: [`AdminStepDetail`](src/lib/api/admin-types.d.ts:36), [`AdminStepListResponse`](src/lib/api/admin-types.d.ts:119)

#### Field Management
- **PATCH /admin/steps/{stepId}/fields/{fieldId}**: Cập nhật cấu hình field
- **POST /admin/steps/{stepId}/fields/bulk**: Cập nhật hàng loạt các fields
- **Response Types**: [`AdminFieldDetail`](src/lib/api/admin-types.d.ts:48), [`BulkUpdateFieldsResponse`](src/lib/api/admin-types.d.ts:100)

## Request/Response Formats

### Request Headers

#### Headers Bắt Buộc
- **Content-Type**: `application/json` cho các yêu cầu POST/PUT/PATCH
- **Accept**: `application/json` cho các phản hồi API
- **Cookie**: Session cookie cho xác thực (xử lý tự động)

#### Headers Tùy Chọn
- **Accept-Language**: Ưu tiên ngôn ngữ (ví dụ: 'en', 'vi')
- **User-Agent**: Xác định client (xử lý bởi browser/fetch)

### Response Format

#### Cấu trúc Phản hồi Thành công
```typescript
interface SuccessResponse<T> {
  // Trả về dữ liệu trực tiếp cho hầu hết các endpoints
  data: T;
  
  // Hoặc cấu trúc cụ thể cho các thao tác tạo
  id: string;
  token: string;
}
```

#### Cấu trúc Phản hồi Lỗi
```typescript
interface ErrorResponse {
  // Mã trạng thái HTTP chỉ định loại lỗi
  // Response body có thể chứa chi tiết bổ sung
  code: string;
  message: string;
  details?: Record<string, any>;
}
```

#### Định dạng Phân trang (Admin API)
```typescript
interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
```

## Error Handling

### HTTP Status Codes

#### Mã Thành công
- **200 OK**: Yêu cầu thành công
- **201 Created**: Tạo tài nguyên thành công
- **204 No Content**: Yêu cầu thành công, không có nội dung trả về

#### Mã Lỗi Client
- **400 Bad Request**: Tham số hoặc body yêu cầu không hợp lệ
- **401 Unauthorized**: Yêu cầu xác thực hoặc không hợp lệ
- **403 Forbidden**: Không đủ quyền truy cập
- **404 Not Found**: Không tìm thấy tài nguyên
- **422 Unprocessable Entity**: Lỗi xác thực

#### Mã Lỗi Server
- **500 Internal Server Error**: Xảy ra lỗi phía server
- **503 Service Unavailable**: Dịch vụ tạm thời không khả dụng

### Error Response Structure

#### Định dạng Lỗi Tiêu chuẩn
```typescript
interface ApiError {
  code: string;          // Mã lỗi có thể đọc được bởi máy
  message: string;       // Thông báo lỗi có thể đọc được bởi con người
  details?: {           // Ngữ cảnh lỗi bổ sung
    field?: string;      // Tên field cho lỗi xác thực
    value?: any;         // Giá trị không hợp lệ được cung cấp
    constraint?: string;  // Ràng buộc xác thực bị vi phạm
  };
  timestamp: string;     // Dấu thời gian ISO của lỗi
}
```

#### Kịch bản Lỗi Phổ biến
```typescript
// Lỗi Xác thực
{
  code: "AUTH_REQUIRED",
  message: "Authentication is required to access this resource",
  timestamp: "2024-01-01T00:00:00.000Z"
}

// Lỗi Xác thực
{
  code: "VALIDATION_ERROR",
  message: "Request validation failed",
  details: {
    field: "email",
    value: "invalid-email",
    constraint: "format"
  },
  timestamp: "2024-01-01T00:00:00.000Z"
}
```

## Authentication

### Session Management
- **Storage**: Session được lưu trữ trong HTTP-only cookies
- **Duration**: Thời hạn session không được chỉ định trong API spec
- **Security**: Khuyến nghị các thuộc tính Secure, HttpOnly, SameSite

### Permission System
- **Role-based Access**: Định nghĩa các vai trò admin và user
- **Resource Access**: Kiểm soát truy cập dựa trên flow
- **Permission Checking**: Xác thực phía server cho mỗi yêu cầu

### Client Implementation

#### API Client Setup
```typescript
// src/lib/api/client.ts
import createClient from "openapi-fetch";
import type { paths } from "./v1.d.ts";

const apiClient = createClient<paths>({ 
  baseUrl: process.env.NEXT_PUBLIC_API_URL || "https://dop-stg.datanest.vn/v1"
});

// Authentication interceptor
apiClient.use({
  async onRequest(req) {
    const token = localStorage.getItem("accessToken");
    if (token) {
      req.request.headers.set("Authorization", `Bearer ${token}`);
    }
  },
  
  async onResponse(res) {
    // Xử lý lỗi 401 và làm mới token
    if (res.response.status === 401) {
      // Triển khai logic làm mới token
    }
  }
});
```

#### Admin API Client
```typescript
// src/lib/api/admin-api.ts
import { adminApi } from '@/lib/api/admin-api';

// Thao tác Flow
const flows = await adminApi.getFlows({ page: 1, limit: 10 });
const flow = await adminApi.getFlow('flow-id');

// Thao tác Step
const steps = await adminApi.getFlowSteps('flow-id');
const step = await adminApi.getStep('step-id');

// Thao tác Field
const field = await adminApi.updateField('step-id', 'field-id', {
  name: 'Updated Field',
  required: true
});
```

## Type Safety

### Generated Types
- **Source**: [`src/lib/api/v1.d.ts`](src/lib/api/v1.d.ts:1) được tạo tự động từ OpenAPI spec
- **Generation**: Lệnh `npm run gen:api`
- **Schema**: Dựa trên [`src/lib/api/schema.yaml`](src/lib/api/schema.yaml:1)

### Custom Types
- **Admin Types**: [`src/lib/api/admin-types.d.ts`](src/lib/api/admin-types.d.ts:1)
- **Type Safety**: Tích hợp TypeScript đầy đủ cho tất cả các thao tác API
- **Validation**: Xác thực runtime thông qua các giao diện TypeScript

## Development Tools

### API Type Generation
```bash
# Tạo TypeScript types từ OpenAPI spec
npm run gen:api

# Điều này cập nhật src/lib/api/v1.d.ts
```

### Mock vs Real API
```typescript
// Biến môi trường điều khiển chế độ API
const USE_MOCK_API = process.env.NEXT_PUBLIC_USE_MOCK_API === 'true';

// Mock responses trong src/lib/api/mock-responses.ts
// Real API client trong src/lib/api/admin-api.ts
```

### Debug Mode
```typescript
// Bật debug logging trong src/lib/api/admin-api.ts
// Đặt DEBUG_API=true trong môi trường
```

## Best Practices

### Error Handling
- Luôn kiểm tra trạng thái phản hồi trước khi xử lý dữ liệu
- Triển khai retry logic cho các lỗi tạm thời
- Cung cấp thông báo lỗi thân thiện với người dùng
- Ghi lại lỗi để gỡ lỗi và giám sát

### Performance Optimization
- Sử dụng request batching khi có thể
- Triển khai caching cho dữ liệu truy cập thường xuyên
- Tối ưu hóa kích thước payload
- Sử dụng phân trang cho các tập dữ liệu lớn

### Security Considerations
- Không bao giờ hiển thị dữ liệu nhạy cảm trong mã client-side
- Xác thực tất cả dữ liệu đầu vào trước khi gửi
- Sử dụng HTTPS cho tất cả các giao tiếp API
- Triển khai quản lý session thích hợp

## Integration Examples

### React Hook Integration
```typescript
// Custom hook cho các cuộc gọi API
function useApiCall<T>(endpoint: string, options?: RequestOptions) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  const execute = useCallback(async (params?: any) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiClient[endpoint](params);
      setData(response.data);
      return response.data;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [endpoint]);
  
  return { data, loading, error, execute };
}
```

### Form Submission Integration
```typescript
// Gửi form với API
async function submitForm(formData: FormData) {
  try {
    const response = await apiClient.POST('/leads', {
      body: {
        flow_id: formData.flowId,
        domain: formData.domain,
        info: formData.userInfo
      }
    });
    
    // Xử lý thành công
    return response.data;
  } catch (error) {
    // Xử lý lỗi
    console.error('Form submission failed:', error);
    throw error;
  }
}
```

## Troubleshooting

### Common Issues

#### CORS Errors
- Xác minh server API cho phép domain frontend
- Kiểm tra xử lý yêu cầu preflight
- Đảm bảo các headers được đặt đúng cách

#### Authentication Issues
- Xác minh session cookie đang được gửi
- Kiểm tra token expiration và logic làm mới
- Đảm bảo flow xác thực phù hợp

#### Type Mismatches
- Tạo lại API types với `npm run gen:api`
- Xác minh OpenAPI spec khớp với triển khai backend
- Kiểm tra các vấn đề tương thích phiên bản

### Debug Tools

#### Network Inspection
- Sử dụng tab Network DevTools của trình duyệt
- Kiểm tra request/response headers
- Xác minh định dạng payload

#### API Testing
- Sử dụng Postman hoặc các công cụ tương tự
- Kiểm tra các endpoint độc lập
- Xác minh thiết lập xác thực

#### Logging
- Bật chế độ debug trong API client
- Kiểm tra console để biết chi tiết lỗi
- Giám sát thời gian phản hồi API