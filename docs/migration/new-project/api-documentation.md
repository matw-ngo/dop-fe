# DOP-FE API Documentation

## Overview

### API Base URL
- **Development**: `https://dop-stg.datanest.vn/v1`
- **Production**: `https://dop.datanest.vn/v1`
- **Local Override**: `process.env.NEXT_PUBLIC_API_URL`

### Authentication
- **Method**: Cookie-based authentication with session management
- **Security Scheme**: `cookie_auth` (apiKey in cookie named 'session')
- **Token Management**: Currently using mock authentication, real implementation pending

### Rate Limiting
- Rate limiting information not specified in OpenAPI spec
- Implement retry logic with exponential backoff for failed requests

### Version Information
- **API Version**: v1.0
- **OpenAPI Specification**: 3.0.3
- **Type Generation**: Auto-generated TypeScript types via `openapi-typescript`

## Endpoints

### Flow Management API

#### GET /flows/{domain}
- **Purpose**: Get domain onboarding flow configuration
- **Authentication**: Required (cookie_auth)
- **Parameters**:
  - `domain` (path, required): Domain identifier
- **Response**: [`FlowDetail`](src/lib/api/v1.d.ts:143)
- **Usage Example**:
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
- **Purpose**: Create a new lead in the system
- **Authentication**: Required (cookie_auth)
- **Request Body**: [`CreateLeadRequestBody`](src/lib/api/v1.d.ts:200)
- **Response**: [`CreateLeadResponseBody`](src/lib/api/v1.d.ts:207)
- **Usage Example**:
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
- **Purpose**: Submit additional lead information
- **Authentication**: Required (cookie_auth)
- **Parameters**:
  - `id` (path, required): Lead UUID
- **Request Body**: [`SubmitLeadInfoRequestBody`](src/lib/api/v1.d.ts:174)
- **Response**: HTTP 200 OK
- **Usage Example**:
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
- **Purpose**: Submit OTP verification code
- **Authentication**: Required (cookie_auth)
- **Parameters**:
  - `id` (path, required): Lead UUID
- **Request Body**: [`SubmitOTPRequestBody`](src/lib/api/v1.d.ts:211)
- **Response**: HTTP 200 OK
- **Usage Example**:
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
- **Purpose**: Resend OTP to user
- **Authentication**: Required (cookie_auth)
- **Parameters**:
  - `id` (path, required): Lead UUID
- **Request Body**: [`ResendOTPRequestBody`](src/lib/api/v1.d.ts:217)
- **Response**: HTTP 200 OK
- **Usage Example**:
```typescript
await apiClient.POST('/leads/{id}/resend-otp', {
  params: {
    path: { id: 'lead-uuid' }
  },
  body: {
    target: '+1234567890' // or email address
  }
});
```

### Admin API (Custom Implementation)

#### Flow Management
- **GET /admin/flows**: List all flows with pagination
- **GET /admin/flows/{id}**: Get specific flow details
- **PATCH /admin/flows/{id}**: Update flow configuration
- **Response Types**: [`AdminFlowDetail`](src/lib/api/admin-types.d.ts:16), [`AdminFlowListResponse`](src/lib/api/admin-types.d.ts:109)

#### Step Management
- **GET /admin/flows/{flowId}/steps**: Get steps for a flow
- **GET /admin/steps/{id}**: Get specific step details
- **PATCH /admin/steps/{id}**: Update step configuration
- **Response Types**: [`AdminStepDetail`](src/lib/api/admin-types.d.ts:36), [`AdminStepListResponse`](src/lib/api/admin-types.d.ts:119)

#### Field Management
- **PATCH /admin/steps/{stepId}/fields/{fieldId}**: Update field configuration
- **POST /admin/steps/{stepId}/fields/bulk**: Bulk update fields
- **Response Types**: [`AdminFieldDetail`](src/lib/api/admin-types.d.ts:48), [`BulkUpdateFieldsResponse`](src/lib/api/admin-types.d.ts:100)

## Request/Response Formats

### Request Headers

#### Required Headers
- **Content-Type**: `application/json` for POST/PUT/PATCH requests
- **Accept**: `application/json` for API responses
- **Cookie**: Session cookie for authentication (handled automatically)

#### Optional Headers
- **Accept-Language**: Locale preference (e.g., 'en', 'vi')
- **User-Agent**: Client identification (handled by browser/fetch)

### Response Format

#### Success Response Structure
```typescript
interface SuccessResponse<T> {
  // Direct data return for most endpoints
  data: T;
  
  // Or specific structure for create operations
  id: string;
  token: string;
}
```

#### Error Response Structure
```typescript
interface ErrorResponse {
  // HTTP status codes indicate error type
  // Response body may contain additional details
  code: string;
  message: string;
  details?: Record<string, any>;
}
```

#### Pagination Format (Admin API)
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

#### Success Codes
- **200 OK**: Request successful
- **201 Created**: Resource created successfully
- **204 No Content**: Request successful, no content returned

#### Client Error Codes
- **400 Bad Request**: Invalid request parameters or body
- **401 Unauthorized**: Authentication required or invalid
- **403 Forbidden**: Insufficient permissions
- **404 Not Found**: Resource not found
- **422 Unprocessable Entity**: Validation errors

#### Server Error Codes
- **500 Internal Server Error**: Server-side error occurred
- **503 Service Unavailable**: Service temporarily unavailable

### Error Response Structure

#### Standard Error Format
```typescript
interface ApiError {
  code: string;          // Machine-readable error code
  message: string;       // Human-readable error message
  details?: {           // Additional error context
    field?: string;      // Field name for validation errors
    value?: any;         // Invalid value provided
    constraint?: string;  // Validation constraint violated
  };
  timestamp: string;     // ISO timestamp of error
}
```

#### Common Error Scenarios
```typescript
// Authentication Error
{
  code: "AUTH_REQUIRED",
  message: "Authentication is required to access this resource",
  timestamp: "2024-01-01T00:00:00.000Z"
}

// Validation Error
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
- **Storage**: Session stored in HTTP-only cookies
- **Duration**: Session duration not specified in API spec
- **Security**: Secure, HttpOnly, SameSite attributes recommended

### Permission System
- **Role-based Access**: Admin and user roles defined
- **Resource Access**: Flow-based access control
- **Permission Checking**: Server-side validation on each request

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
    // Handle 401 errors and token refresh
    if (res.response.status === 401) {
      // Implement token refresh logic
    }
  }
});
```

#### Admin API Client
```typescript
// src/lib/api/admin-api.ts
import { adminApi } from '@/lib/api/admin-api';

// Flow operations
const flows = await adminApi.getFlows({ page: 1, limit: 10 });
const flow = await adminApi.getFlow('flow-id');

// Step operations
const steps = await adminApi.getFlowSteps('flow-id');
const step = await adminApi.getStep('step-id');

// Field operations
const field = await adminApi.updateField('step-id', 'field-id', {
  name: 'Updated Field',
  required: true
});
```

## Type Safety

### Generated Types
- **Source**: [`src/lib/api/v1.d.ts`](src/lib/api/v1.d.ts:1) auto-generated from OpenAPI spec
- **Generation**: `npm run gen:api` command
- **Schema**: Based on [`src/lib/api/schema.yaml`](src/lib/api/schema.yaml:1)

### Custom Types
- **Admin Types**: [`src/lib/api/admin-types.d.ts`](src/lib/api/admin-types.d.ts:1)
- **Type Safety**: Full TypeScript integration for all API operations
- **Validation**: Runtime validation through TypeScript interfaces

## Development Tools

### API Type Generation
```bash
# Generate TypeScript types from OpenAPI spec
npm run gen:api

# This updates src/lib/api/v1.d.ts
```

### Mock vs Real API
```typescript
// Environment variable controls API mode
const USE_MOCK_API = process.env.NEXT_PUBLIC_USE_MOCK_API === 'true';

// Mock responses in src/lib/api/mock-responses.ts
// Real API client in src/lib/api/admin-api.ts
```

### Debug Mode
```typescript
// Enable debug logging in src/lib/api/admin-api.ts
// Set DEBUG_API=true in environment
```

## Best Practices

### Error Handling
- Always check response status before processing data
- Implement retry logic for transient failures
- Provide user-friendly error messages
- Log errors for debugging and monitoring

### Performance Optimization
- Use request batching where possible
- Implement caching for frequently accessed data
- Optimize payload sizes
- Use pagination for large datasets

### Security Considerations
- Never expose sensitive data in client-side code
- Validate all input data before sending
- Use HTTPS for all API communications
- Implement proper session management

## Integration Examples

### React Hook Integration
```typescript
// Custom hook for API calls
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
// Form submission with API
async function submitForm(formData: FormData) {
  try {
    const response = await apiClient.POST('/leads', {
      body: {
        flow_id: formData.flowId,
        domain: formData.domain,
        info: formData.userInfo
      }
    });
    
    // Handle success
    return response.data;
  } catch (error) {
    // Handle error
    console.error('Form submission failed:', error);
    throw error;
  }
}
```

## Troubleshooting

### Common Issues

#### CORS Errors
- Verify API server allows frontend domain
- Check preflight request handling
- Ensure proper headers are set

#### Authentication Issues
- Verify session cookie is being sent
- Check token expiration and refresh logic
- Ensure proper authentication flow

#### Type Mismatches
- Regenerate API types with `npm run gen:api`
- Verify OpenAPI spec matches backend implementation
- Check for version compatibility issues

### Debug Tools

#### Network Inspection
- Use browser DevTools Network tab
- Check request/response headers
- Verify payload format

#### API Testing
- Use Postman or similar tools
- Test endpoints independently
- Verify authentication setup

#### Logging
- Enable debug mode in API client
- Check console for error details
- Monitor API response times