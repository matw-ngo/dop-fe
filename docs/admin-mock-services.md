# Admin Mock Services Documentation

## Overview

This document provides a comprehensive overview of all mock services used in the admin panel, their locations, functionality, and how to replace them with real API implementations.

## Environment Configuration

### Toggle Mock/Real API

```bash
# Set to 'true' to use mock services, 'false' to use real API
NEXT_PUBLIC_USE_MOCK_API=true
```

- **Location**: Used in [`src/lib/api/mock-responses.ts`](src/lib/api/mock-responses.ts:14)
- **Purpose**: Toggle between mock and real API services
- **Implementation**: `export const USE_MOCK_API = process.env.NEXT_PUBLIC_USE_MOCK_API === 'true';`

---

## Authentication Services

### Mock Authentication Store

| Property | Details |
|----------|---------|
| **File Location** | [`src/store/use-auth-store.ts`](src/store/use-auth-store.ts) |
| **Mock Function** | `login()`, `logout()`, `checkAuth()` |
| **Purpose** | Handles admin user authentication state |
| **Real API Needed** | `/auth/login`, `/auth/logout`, `/auth/refresh` |
| **Mock Data** | `DUMMY_ADMIN_USER` (admin/admin123) |

#### Mock Implementation Details

```typescript
// Mock user credentials
username: "admin"
password: "admin123"
```

#### Real API Implementation Required

Replace the mock authentication logic in [`src/store/use-auth-store.ts`](src/store/use-auth-store.ts:35-53) with actual API calls to your authentication endpoints.

---

## Flow Management Services

### Mock Flow API

| Property | Details |
|----------|---------|
| **File Location** | [`src/lib/api/mock-responses.ts`](src/lib/api/mock-responses.ts:133-207) |
| **Mock Functions** | `getFlows()`, `getFlow()`, `updateFlow()` |
| **Purpose** | Manage flow CRUD operations |
| **Real API Needed** | `/admin/flows`, `/admin/flows/{id}` |
| **Request/Response** | [`AdminFlowDetail`](src/lib/api/admin-types.d.ts:16), [`AdminFlowListResponse`](src/lib/api/admin-types.d.ts:109) |

#### Mock Data Structure

```typescript
// Sample flow data
{
  id: "1",
  name: "Customer Onboarding",
  status: "active",
  stepCount: 5,
  createdAt: "2024-01-15T10:30:00Z",
  updatedAt: "2024-01-20T14:22:00Z"
}
```

#### Real API Implementation Required

Replace mock functions in [`src/lib/api/mock-responses.ts`](src/lib/api/mock-responses.ts:133-207) with actual API calls to your flow management endpoints.

---

## Step Management Services

### Mock Step API

| Property | Details |
|----------|---------|
| **File Location** | [`src/lib/api/mock-responses.ts`](src/lib/api/mock-responses.ts:209-259) |
| **Mock Functions** | `getFlowSteps()`, `getStep()`, `updateStep()` |
| **Purpose** | Manage step CRUD operations within flows |
| **Real API Needed** | `/admin/flows/{flowId}/steps`, `/admin/steps/{id}` |
| **Request/Response** | [`AdminStepDetail`](src/lib/api/admin-types.d.ts:36), [`AdminStepListResponse`](src/lib/api/admin-types.d.ts:119) |

#### Mock Data Structure

```typescript
// Sample step data
{
  id: "1-1",
  stepOrder: 1,
  name: "Personal Information",
  hasEkyc: false,
  hasOtp: false,
  fieldCount: 5,
  status: "active"
}
```

#### Real API Implementation Required

Replace mock functions in [`src/lib/api/mock-responses.ts`](src/lib/api/mock-responses.ts:209-259) with actual API calls to your step management endpoints.

---

## Field Management Services

### Mock Field API

| Property | Details |
|----------|---------|
| **File Location** | [`src/lib/api/mock-responses.ts`](src/lib/api/mock-responses.ts:261-312) |
| **Mock Functions** | `updateField()`, `bulkUpdateFields()` |
| **Purpose** | Manage field configurations within steps |
| **Real API Needed** | `/admin/steps/{stepId}/fields/{fieldId}`, `/admin/steps/{stepId}/fields/bulk` |
| **Request/Response** | [`AdminFieldDetail`](src/lib/api/admin-types.d.ts:48), [`BulkUpdateFieldsResponse`](src/lib/api/admin-types.d.ts:100) |

#### Mock Data Structure

```typescript
// Sample field data
{
  id: "field-1",
  name: "full_name",
  type: "text",
  visible: true,
  required: true,
  label: "Full Name",
  placeholder: "Enter your full name"
}
```

#### Real API Implementation Required

Replace mock functions in [`src/lib/api/mock-responses.ts`](src/lib/api/mock-responses.ts:261-312) with actual API calls to your field management endpoints.

---

## API Client Configuration

### Mock vs Real API Switch

| Property | Details |
|----------|---------|
| **File Location** | [`src/hooks/admin/use-admin-flows.ts`](src/hooks/admin/use-admin-flows.ts:30) |
| **Mock Function** | `getApiService()` |
| **Purpose** | Switch between mock and real API services |
| **Implementation** | `const apiService = getApiService() || realAdminApi;` |

### Real API Client

| Property | Details |
|----------|---------|
| **File Location** | [`src/lib/api/admin-api.ts`](src/lib/api/admin-api.ts) |
| **Purpose** | Real API client implementation |
| **Base URL** | `process.env.NEXT_PUBLIC_API_URL || "https://dop-stg.datanest.vn/v1"` |
| **Authentication** | Bearer token from localStorage |

---

## Store Mock Logic

### Admin Flow Store

| Property | Details |
|----------|---------|
| **File Location** | [`src/store/use-admin-flow-store.ts`](src/store/use-admin-flow-store.ts) |
| **Purpose** | State management for flow/step/field operations |
| **Mock Functions** | State tracking, change management, optimistic updates |
| **Real Integration** | Works with both mock and real API through hooks |

---

## Mock Data Locations

### Flow Mock Data

- **Location**: [`src/lib/api/mock-responses.ts`](src/lib/api/mock-responses.ts:17-42)
- **Variable**: `mockFlows`
- **Structure**: [`AdminFlowListItem[]`](src/lib/api/admin-types.d.ts:7)

### Step Mock Data

- **Location**: [`src/lib/api/mock-responses.ts`](src/lib/api/mock-responses.ts:44-72)
- **Variable**: `mockSteps`
- **Structure**: [`AdminStepListItem[]`](src/lib/api/admin-types.d.ts:26)

### Field Mock Data

- **Location**: [`src/lib/api/mock-responses.ts`](src/lib/api/mock-responses.ts:74-120)
- **Variable**: `mockFields`
- **Structure**: [`AdminFieldDetail[]`](src/lib/api/admin-types.d.ts:48)

---

## Implementation Guide

### Step 1: Update Environment Variables

```bash
# Disable mock API
NEXT_PUBLIC_USE_MOCK_API=false

# Set real API URL
NEXT_PUBLIC_API_URL=https://your-api-domain.com/v1
```

### Step 2: Update API Service Selection

In [`src/lib/api/mock-responses.ts`](src/lib/api/mock-responses.ts:316-318):

```typescript
export const getApiService = () => {
  return USE_MOCK_API ? mockAdminApi : realAdminApi;
};
```

### Step 3: Replace Authentication Logic

Update [`src/store/use-auth-store.ts`](src/store/use-auth-store.ts:35-53) to call real authentication endpoints.

### Step 4: Test Real API Integration

1. Set `NEXT_PUBLIC_USE_MOCK_API=false`
2. Verify all API calls are working
3. Test error handling and loading states
4. Update mock data if needed for testing

---

## Type Definitions

### Admin API Types

- **Location**: [`src/lib/api/admin-types.d.ts`](src/lib/api/admin-types.d.ts)
- **Purpose**: Type definitions for all admin API requests/responses
- **Key Types**: `AdminFlowDetail`, `AdminStepDetail`, `AdminFieldDetail`

### Application Types

- **Location**: [`src/types/admin.ts`](src/types/admin.ts)
- **Purpose**: Type definitions for application state
- **Key Types**: `FlowDetail`, `StepDetail`, `FieldListItem`

---

## Testing Considerations

### Mock API Benefits

- **Offline Development**: Works without backend connection
- **Consistent Data**: Predictable responses for testing
- **Error Simulation**: Built-in error rate simulation
- **Performance**: Fast responses with configurable delays

### Real API Testing

- **Integration Testing**: Test actual API integration
- **Error Handling**: Verify proper error responses
- **Performance**: Check API response times
- **Authentication**: Test token refresh and auth flows

---

## Troubleshooting

### Common Issues

1. **Mock API Still Active**: Check `NEXT_PUBLIC_USE_MOCK_API` environment variable
2. **Authentication Failures**: Verify token storage and refresh logic
3. **Type Mismatches**: Ensure real API responses match type definitions
4. **CORS Issues**: Configure backend to allow frontend domain

### Debug Mode

Enable debug logging in [`src/lib/api/admin-api.ts`](src/lib/api/admin-api.ts) to trace API calls and responses.