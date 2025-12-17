/**
 * Admin API Types
 * This file contains types for admin-specific endpoints that are not part of the main API spec
 */

// Admin-specific request/response types
export interface AdminFlowListItem {
  id: string;
  name: string;
  status: "active" | "inactive" | "draft" | "archived";
  stepCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface AdminFlowDetail {
  id: string;
  name: string;
  description?: string;
  status: "active" | "inactive" | "draft" | "archived";
  createdAt: string;
  updatedAt: string;
  steps: AdminStepListItem[];
}

export interface AdminStepListItem {
  id: string;
  stepOrder: number;
  name: string;
  hasEkyc: boolean;
  hasOtp: boolean;
  fieldCount: number;
  status: "active" | "inactive" | "draft";
}

export interface AdminStepDetail {
  id: string;
  stepOrder: number;
  name: string;
  description?: string;
  hasEkyc: boolean;
  hasOtp: boolean;
  status: "active" | "inactive" | "draft";
  flowId: string;
  fields: AdminFieldDetail[];
}

export interface AdminFieldDetail {
  id: string;
  name: string;
  type:
    | "text"
    | "email"
    | "password"
    | "number"
    | "date"
    | "select"
    | "checkbox"
    | "radio"
    | "textarea"
    | "file"
    | "ekyc"
    | "otp";
  visible: boolean;
  required: boolean;
  label?: string;
  placeholder?: string;
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
  };
}

// Request types
export interface UpdateFlowRequest {
  name?: string;
  description?: string;
  status?: "active" | "inactive" | "draft" | "archived";
}

export interface UpdateStepRequest {
  name?: string;
  description?: string;
  stepOrder?: number;
  hasEkyc?: boolean;
  hasOtp?: boolean;
  status?: "active" | "inactive" | "draft";
}

export interface UpdateFieldRequest {
  name?: string;
  type?:
    | "text"
    | "email"
    | "password"
    | "number"
    | "date"
    | "select"
    | "checkbox"
    | "radio"
    | "textarea"
    | "file"
    | "ekyc"
    | "otp";
  visible?: boolean;
  required?: boolean;
  label?: string;
  placeholder?: string;
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
  };
}

export interface BulkUpdateFieldsRequest {
  updates: Array<{
    fieldId: string;
    data: UpdateFieldRequest;
  }>;
}

export interface BulkUpdateFieldsResponse {
  updatedFields: AdminFieldDetail[];
  errors?: Array<{
    fieldId: string;
    error: string;
  }>;
}

// Response wrapper types
export interface AdminFlowListResponse {
  flows: AdminFlowListItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface AdminStepListResponse {
  steps: AdminStepListItem[];
}

// API error types
export interface AdminApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
}

// Query options
export interface AdminFlowQueryOptions {
  page?: number;
  limit?: number;
  status?: string;
}
