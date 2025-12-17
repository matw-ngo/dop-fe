import type {
  AdminFieldDetail,
  AdminFlowDetail,
  AdminFlowListItem,
  AdminFlowListResponse,
  AdminFlowQueryOptions,
  AdminStepDetail,
  AdminStepListItem,
  AdminStepListResponse,
  BulkUpdateFieldsResponse,
} from "./admin-types";

// Environment variable to toggle mock/real API
export const USE_MOCK_API = process.env.NEXT_PUBLIC_USE_MOCK_API === "true";

// Mock data
const mockFlows: AdminFlowListItem[] = [
  {
    id: "1",
    name: "Customer Onboarding",
    status: "active",
    stepCount: 5,
    createdAt: "2024-01-15T10:30:00Z",
    updatedAt: "2024-01-20T14:22:00Z",
  },
  {
    id: "2",
    name: "Loan Application",
    status: "draft",
    stepCount: 8,
    createdAt: "2024-01-10T09:15:00Z",
    updatedAt: "2024-01-18T16:45:00Z",
  },
  {
    id: "3",
    name: "Credit Card Application",
    status: "inactive",
    stepCount: 6,
    createdAt: "2024-01-05T11:20:00Z",
    updatedAt: "2024-01-12T13:30:00Z",
  },
];

const mockSteps: AdminStepListItem[] = [
  {
    id: "1-1",
    stepOrder: 1,
    name: "Personal Information",
    hasEkyc: false,
    hasOtp: false,
    fieldCount: 5,
    status: "active",
  },
  {
    id: "1-2",
    stepOrder: 2,
    name: "Identity Verification",
    hasEkyc: true,
    hasOtp: true,
    fieldCount: 3,
    status: "active",
  },
  {
    id: "1-3",
    stepOrder: 3,
    name: "Financial Information",
    hasEkyc: false,
    hasOtp: false,
    fieldCount: 4,
    status: "draft",
  },
];

const mockFields: AdminFieldDetail[] = [
  {
    id: "field-1",
    name: "full_name",
    type: "text",
    visible: true,
    required: true,
    label: "Full Name",
    placeholder: "Enter your full name",
  },
  {
    id: "field-2",
    name: "email",
    type: "email",
    visible: true,
    required: true,
    label: "Email Address",
    placeholder: "Enter your email address",
  },
  {
    id: "field-3",
    name: "phone",
    type: "text",
    visible: true,
    required: true,
    label: "Phone Number",
    placeholder: "Enter your phone number",
  },
  {
    id: "field-4",
    name: "date_of_birth",
    type: "date",
    visible: false,
    required: false,
    label: "Date of Birth",
    placeholder: "",
  },
  {
    id: "field-5",
    name: "gender",
    type: "radio",
    visible: true,
    required: false,
    label: "Gender",
    placeholder: "",
  },
];

// Utility to simulate API delay
const delay = (ms: number = 1000) =>
  new Promise((resolve) => setTimeout(resolve, ms));

// Utility to simulate random errors
const simulateRandomError = (errorRate: number = 0.1) => {
  if (Math.random() < errorRate) {
    throw new Error("Simulated API error");
  }
};

// Mock API functions
export const mockAdminApi = {
  // Flow management
  getFlows: async (
    options?: AdminFlowQueryOptions,
  ): Promise<AdminFlowListResponse> => {
    await delay(800);
    simulateRandomError(0.05);

    let filteredFlows = [...mockFlows];

    // Filter by status if provided
    if (options?.status) {
      filteredFlows = filteredFlows.filter(
        (flow) => flow.status === options.status,
      );
    }

    // Pagination
    const page = options?.page || 1;
    const limit = options?.limit || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedFlows = filteredFlows.slice(startIndex, endIndex);

    return {
      flows: paginatedFlows,
      pagination: {
        page,
        limit,
        total: filteredFlows.length,
        totalPages: Math.ceil(filteredFlows.length / limit),
      },
    };
  },

  getFlow: async (id: string): Promise<AdminFlowDetail> => {
    await delay(600);
    simulateRandomError(0.05);

    const flow = mockFlows.find((f) => f.id === id);
    if (!flow) {
      throw new Error(`Flow with ID ${id} not found`);
    }

    return {
      ...flow,
      description: `Complete ${flow.name.toLowerCase()} process with verification steps`,
      steps: mockSteps.map((step) => ({
        ...step,
        flowId: id,
      })),
    };
  },

  updateFlow: async (id: string, updates: any): Promise<AdminFlowDetail> => {
    await delay(1200);
    simulateRandomError(0.1);

    const flowIndex = mockFlows.findIndex((f) => f.id === id);
    if (flowIndex === -1) {
      throw new Error(`Flow with ID ${id} not found`);
    }

    // Update the flow in mock data
    const updatedFlow = {
      ...mockFlows[flowIndex],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    mockFlows[flowIndex] = updatedFlow;

    return {
      ...updatedFlow,
      steps: mockSteps.map((step) => ({
        ...step,
        flowId: id,
      })),
    };
  },

  deleteFlow: async (id: string): Promise<void> => {
    await delay(1000);
    simulateRandomError(0.1);

    const flowIndex = mockFlows.findIndex((f) => f.id === id);
    if (flowIndex === -1) {
      throw new Error(`Flow with ID ${id} not found`);
    }

    // Remove the flow from mock data
    mockFlows.splice(flowIndex, 1);
  },

  duplicateFlow: async (
    id: string,
    name?: string,
  ): Promise<AdminFlowDetail> => {
    await delay(1200);
    simulateRandomError(0.1);

    const flowToDuplicate = mockFlows.find((f) => f.id === id);
    if (!flowToDuplicate) {
      throw new Error(`Flow with ID ${id} not found`);
    }

    // Create a new flow with duplicated data
    const newFlow: AdminFlowListItem = {
      id: `${mockFlows.length + 1}`,
      name: name || `${flowToDuplicate.name} (Copy)`,
      status: "draft",
      stepCount: flowToDuplicate.stepCount,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Add to mock data
    mockFlows.push(newFlow);

    return {
      ...newFlow,
      description: `${flowToDuplicate.name} (Copy) - Duplicated flow`,
      steps: mockSteps.map((step) => ({
        ...step,
        flowId: newFlow.id,
      })),
    };
  },

  toggleFlowStatus: async (id: string): Promise<AdminFlowDetail> => {
    await delay(800);
    simulateRandomError(0.1);

    const flowIndex = mockFlows.findIndex((f) => f.id === id);
    if (flowIndex === -1) {
      throw new Error(`Flow with ID ${id} not found`);
    }

    // Toggle the flow status
    const currentFlow = mockFlows[flowIndex];
    const newStatus: "active" | "inactive" | "draft" | "archived" =
      currentFlow.status === "active" ? "inactive" : "active";

    const updatedFlow = {
      ...currentFlow,
      status: newStatus,
      updatedAt: new Date().toISOString(),
    };

    mockFlows[flowIndex] = updatedFlow;

    return {
      ...updatedFlow,
      description: `${updatedFlow.name} flow`,
      steps: mockSteps.map((step) => ({
        ...step,
        flowId: id,
      })),
    };
  },

  // Step management
  getFlowSteps: async (flowId: string): Promise<AdminStepListResponse> => {
    await delay(500);
    simulateRandomError(0.05);

    return {
      steps: mockSteps.map((step) => ({
        ...step,
        flowId,
      })),
    };
  },

  getStep: async (id: string): Promise<AdminStepDetail> => {
    await delay(400);
    simulateRandomError(0.05);

    const step = mockSteps.find((s) => s.id === id);
    if (!step) {
      throw new Error(`Step with ID ${id} not found`);
    }

    return {
      ...step,
      flowId: "1", // Default flow ID
      fields: mockFields,
    };
  },

  updateStep: async (id: string, updates: any): Promise<AdminStepDetail> => {
    await delay(800);
    simulateRandomError(0.1);

    const stepIndex = mockSteps.findIndex((s) => s.id === id);
    if (stepIndex === -1) {
      throw new Error(`Step with ID ${id} not found`);
    }

    // Update the step in mock data
    const updatedStep = {
      ...mockSteps[stepIndex],
      ...updates,
    };
    mockSteps[stepIndex] = updatedStep;

    return {
      ...updatedStep,
      flowId: "1", // Default flow ID
      fields: mockFields,
    };
  },

  // Field management
  updateField: async (
    stepId: string,
    fieldId: string,
    updates: any,
  ): Promise<AdminFieldDetail> => {
    await delay(300);
    simulateRandomError(0.08);

    const fieldIndex = mockFields.findIndex((f) => f.id === fieldId);
    if (fieldIndex === -1) {
      throw new Error(`Field with ID ${fieldId} not found`);
    }

    // Update the field in mock data
    const updatedField = {
      ...mockFields[fieldIndex],
      ...updates,
    };
    mockFields[fieldIndex] = updatedField;

    return updatedField;
  },

  // Bulk operations
  bulkUpdateFields: async (
    stepId: string,
    updates: Array<{ fieldId: string; data: any }>,
  ): Promise<BulkUpdateFieldsResponse> => {
    await delay(1000);
    simulateRandomError(0.15);

    const updatedFields: AdminFieldDetail[] = [];
    const errors: Array<{ fieldId: string; error: string }> = [];

    for (const { fieldId, data } of updates) {
      try {
        const updatedField = await mockAdminApi.updateField(
          stepId,
          fieldId,
          data,
        );
        updatedFields.push(updatedField);
      } catch (error) {
        errors.push({
          fieldId,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    return {
      updatedFields,
      errors: errors.length > 0 ? errors : undefined,
    };
  },
};

// Function to toggle between mock and real API
export const getApiService = () => {
  // Always return mock API for now to prevent CORS issues when BE is not ready
  // Change this to return USE_MOCK_API ? mockAdminApi : null when BE is ready
  return mockAdminApi;
};
