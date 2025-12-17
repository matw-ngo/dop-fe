// Admin types for flow management

export type FlowStatus = "active" | "inactive" | "draft" | "archived";

export type StepStatus = "active" | "inactive" | "draft";

export type FieldType =
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

export interface FlowListItem {
  id: string;
  name: string;
  status: FlowStatus;
  stepCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface StepListItem {
  id: string;
  stepOrder: number;
  name: string;
  hasEkyc: boolean;
  hasOtp: boolean;
  fieldCount: number;
  status: StepStatus;
}

export interface FieldListItem {
  id: string;
  name: string;
  type: FieldType;
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

export interface FlowDetail {
  id: string;
  name: string;
  description?: string;
  status: FlowStatus;
  createdAt: string;
  updatedAt: string;
  steps: StepListItem[];
}

export interface StepDetail {
  id: string;
  stepOrder: number;
  name: string;
  description?: string;
  hasEkyc: boolean;
  hasOtp: boolean;
  status: StepStatus;
  flowId: string;
  fields: FieldListItem[];
}

export interface FlowFormData {
  name: string;
  description?: string;
  status: FlowStatus;
}

export interface StepFormData {
  name: string;
  description?: string;
  stepOrder: number;
  hasEkyc: boolean;
  hasOtp: boolean;
  status: StepStatus;
}

export interface FieldFormData {
  name: string;
  type: FieldType;
  label?: string;
  placeholder?: string;
  visible: boolean;
  required: boolean;
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
  };
}

export interface FlowFilters {
  status?: FlowStatus[];
  dateRange?: {
    from: string;
    to: string;
  };
  search?: string;
}

export interface FlowTableColumn {
  key: keyof FlowListItem;
  label: string;
  sortable?: boolean;
}

export interface StepTableColumn {
  key: keyof StepListItem;
  label: string;
  sortable?: boolean;
}

export interface FieldTableColumn {
  key: keyof FieldListItem;
  label: string;
  sortable?: boolean;
}
