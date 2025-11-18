import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { toast } from "sonner";
import { queryClient } from "@/lib/query-client";
import { adminApi as realAdminApi } from "@/lib/api/admin-api";
import { getApiService, USE_MOCK_API } from "@/lib/api/mock-responses";
import type {
  FlowListItem,
  FlowDetail,
  StepListItem,
  StepDetail,
  FieldListItem,
  FlowFormData,
  StepFormData,
  FieldFormData,
  FlowStatus,
  StepStatus,
  FieldType
} from "@/types/admin";
import type {
  AdminFlowListItem,
  AdminFlowDetail,
  AdminStepListItem,
  AdminStepDetail,
  AdminFieldDetail
} from "@/lib/api/admin-types";
import { useAdminFlowStore } from "@/store/use-admin-flow-store";

// Get the appropriate API service (mock or real)
// Always use mock API to prevent CORS issues when BE is not ready
const apiService = getApiService();

// Query keys
export const adminQueryKeys = {
  flows: ["admin", "flows"] as const,
  flow: (id: string) => ["admin", "flows", id] as const,
  flowSteps: (flowId: string) => ["admin", "flows", flowId, "steps"] as const,
  step: (id: string) => ["admin", "steps", id] as const,
  stepFields: (stepId: string) => ["admin", "steps", stepId, "fields"] as const,
};

// API functions using the appropriate service (mock or real)
const adminApi = {
  // Flow API calls
  getFlows: async (options?: { page?: number; limit?: number; status?: string }): Promise<FlowListItem[]> => {
    const response = await apiService.getFlows(options);
    return response.flows.map(flow => ({
      id: flow.id,
      name: flow.name,
      status: flow.status as FlowStatus,
      stepCount: 0, // We'll need to fetch this separately or get from API
      createdAt: flow.createdAt,
      updatedAt: flow.updatedAt,
    }));
  },

  getFlow: async (id: string): Promise<FlowDetail> => {
    const flow = await apiService.getFlow(id);
    return {
      id: flow.id,
      name: flow.name,
      description: flow.description,
      status: flow.status as FlowStatus,
      createdAt: flow.createdAt,
      updatedAt: flow.updatedAt,
      steps: flow.steps.map(step => ({
        id: step.id,
        stepOrder: step.stepOrder,
        name: step.name,
        hasEkyc: step.hasEkyc,
        hasOtp: step.hasOtp,
        fieldCount: step.fieldCount || 0,
        status: step.status as StepStatus,
      })),
    };
  },

  updateFlow: async (id: string, data: Partial<FlowFormData>): Promise<FlowDetail> => {
    const updatedFlow = await apiService.updateFlow(id, data);
    return {
      id: updatedFlow.id,
      name: updatedFlow.name,
      description: updatedFlow.description,
      status: updatedFlow.status as FlowStatus,
      createdAt: updatedFlow.createdAt,
      updatedAt: updatedFlow.updatedAt,
      steps: updatedFlow.steps.map(step => ({
        id: step.id,
        stepOrder: step.stepOrder,
        name: step.name,
        hasEkyc: step.hasEkyc,
        hasOtp: step.hasOtp,
        fieldCount: step.fieldCount || 0,
        status: step.status as StepStatus,
      })),
    };
  },

  // Step API calls
  getFlowSteps: async (flowId: string): Promise<StepListItem[]> => {
    const response = await apiService.getFlowSteps(flowId);
    return response.steps.map(step => ({
      id: step.id,
      stepOrder: step.stepOrder,
      name: step.name,
      hasEkyc: step.hasEkyc,
      hasOtp: step.hasOtp,
      fieldCount: step.fieldCount || 0,
      status: step.status as StepStatus,
    }));
  },

  getStep: async (id: string): Promise<StepDetail> => {
    const step = await apiService.getStep(id);
    return {
      id: step.id,
      stepOrder: step.stepOrder,
      name: step.name,
      description: step.description,
      hasEkyc: step.hasEkyc,
      hasOtp: step.hasOtp,
      status: step.status as StepStatus,
      flowId: step.flowId,
      fields: step.fields.map(field => ({
        id: field.id,
        name: field.name,
        type: field.type as FieldType,
        visible: field.visible,
        required: field.required,
        label: field.label,
        placeholder: field.placeholder,
        validation: field.validation,
      })),
    };
  },

  updateStep: async (id: string, data: Partial<StepFormData>): Promise<StepDetail> => {
    const updatedStep = await apiService.updateStep(id, data);
    return {
      id: updatedStep.id,
      stepOrder: updatedStep.stepOrder,
      name: updatedStep.name,
      description: updatedStep.description,
      hasEkyc: updatedStep.hasEkyc,
      hasOtp: updatedStep.hasOtp,
      status: updatedStep.status as StepStatus,
      flowId: updatedStep.flowId,
      fields: updatedStep.fields.map(field => ({
        id: field.id,
        name: field.name,
        type: field.type as FieldType,
        visible: field.visible,
        required: field.required,
        label: field.label,
        placeholder: field.placeholder,
        validation: field.validation,
      })),
    };
  },

  // Field API calls
  updateField: async (
    stepId: string, 
    fieldId: string, 
    data: Partial<FieldFormData>
  ): Promise<FieldListItem> => {
    const updatedField = await apiService.updateField(stepId, fieldId, data);
    return {
      id: updatedField.id,
      name: updatedField.name,
      type: updatedField.type as FieldType,
      visible: updatedField.visible,
      required: updatedField.required,
      label: updatedField.label,
      placeholder: updatedField.placeholder,
      validation: updatedField.validation,
    };
  },
};

// Hooks
export const useFlows = (options?: { page?: number; limit?: number; status?: string }) => {
  return useQuery({
    queryKey: [...adminQueryKeys.flows, options] as const,
    queryFn: () => adminApi.getFlows(options),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useFlow = (id: string) => {
  const setCurrentFlow = useAdminFlowStore((state) => state.setCurrentFlow);
  const setLoading = useAdminFlowStore((state) => state.setLoading);
  const setError = useAdminFlowStore((state) => state.setError);

  const query = useQuery({
    queryKey: adminQueryKeys.flow(id),
    queryFn: () => adminApi.getFlow(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  useEffect(() => {
    if (query.data) {
      setCurrentFlow(query.data);
      setLoading(false);
      setError(null);
    }
  }, [query.data, setCurrentFlow, setLoading, setError]);

  useEffect(() => {
    if (query.error) {
      setError(query.error instanceof Error ? query.error.message : "Failed to load flow");
      setLoading(false);
    }
  }, [query.error, setError, setLoading]);

  useEffect(() => {
    if (query.isLoading) {
      setLoading(true);
    }
  }, [query.isLoading, setLoading]);

  return query;
};

export const useUpdateFlow = () => {
  const queryClient = useQueryClient();
  const { resetChanges } = useAdminFlowStore();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<FlowFormData> }) =>
      adminApi.updateFlow(id, data),
    onSuccess: (updatedFlow) => {
      // Update flow in cache
      queryClient.setQueryData(
        adminQueryKeys.flow(updatedFlow.id),
        updatedFlow
      );
      
      // Update flows list cache
      queryClient.setQueryData(
        adminQueryKeys.flows,
        (oldFlows: FlowListItem[] | undefined) =>
          oldFlows?.map((flow) =>
            flow.id === updatedFlow.id
              ? { ...flow, ...updatedFlow }
              : flow
          )
      );
      
      // Reset store changes
      resetChanges();
      
      toast.success("Flow updated successfully", {
        description: `"${updatedFlow.name}" has been updated.`,
      });
    },
    onError: (error) => {
      toast.error("Failed to update flow", {
        description: error instanceof Error ? error.message : "An error occurred",
      });
    },
  });
};

export const useFlowSteps = (flowId: string) => {
  return useQuery({
    queryKey: adminQueryKeys.flowSteps(flowId),
    queryFn: () => adminApi.getFlowSteps(flowId),
    enabled: !!flowId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useStep = (id: string) => {
  const setCurrentStep = useAdminFlowStore((state) => state.setCurrentStep);
  const setLoading = useAdminFlowStore((state) => state.setLoading);
  const setError = useAdminFlowStore((state) => state.setError);

  const query = useQuery({
    queryKey: adminQueryKeys.step(id),
    queryFn: () => adminApi.getStep(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  useEffect(() => {
    if (query.data) {
      setCurrentStep(query.data);
      setLoading(false);
      setError(null);
    }
  }, [query.data, setCurrentStep, setLoading, setError]);

  useEffect(() => {
    if (query.error) {
      setError(query.error instanceof Error ? query.error.message : "Failed to load step");
      setLoading(false);
    }
  }, [query.error, setError, setLoading]);

  useEffect(() => {
    if (query.isLoading) {
      setLoading(true);
    }
  }, [query.isLoading, setLoading]);

  return query;
};

export const useUpdateStep = () => {
  const queryClient = useQueryClient();
  const { resetChanges } = useAdminFlowStore();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<StepFormData> }) =>
      adminApi.updateStep(id, data),
    onSuccess: (updatedStep) => {
      // Update step in cache
      queryClient.setQueryData(
        adminQueryKeys.step(updatedStep.id),
        updatedStep
      );
      
      // Update flow steps cache
      queryClient.setQueryData(
        adminQueryKeys.flowSteps(updatedStep.flowId),
        (oldSteps: StepListItem[] | undefined) =>
          oldSteps?.map((step) =>
            step.id === updatedStep.id
              ? { ...step, ...updatedStep }
              : step
          )
      );
      
      // Reset store changes
      resetChanges();
      
      toast.success("Step updated successfully", {
        description: `"${updatedStep.name}" has been updated.`,
      });
    },
    onError: (error) => {
      toast.error("Failed to update step", {
        description: error instanceof Error ? error.message : "An error occurred",
      });
    },
  });
};

export const useUpdateField = () => {
  const queryClient = useQueryClient();
  const currentStep = useAdminFlowStore((state) => state.currentStep);

  return useMutation({
    mutationFn: ({ 
      stepId, 
      fieldId, 
      data 
    }: { 
      stepId: string; 
      fieldId: string; 
      data: Partial<FieldFormData> 
    }) => adminApi.updateField(stepId, fieldId, data),
    onMutate: async ({ stepId, fieldId, data }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: adminQueryKeys.step(stepId) });
      
      // Snapshot previous value
      const previousStep = queryClient.getQueryData(adminQueryKeys.step(stepId));
      
      // Optimistically update to the new value
      queryClient.setQueryData(
        adminQueryKeys.step(stepId),
        (oldStep: StepDetail | undefined) => {
          if (!oldStep) return oldStep;
          
          return {
            ...oldStep,
            fields: oldStep.fields.map((field) =>
              field.id === fieldId
                ? { ...field, ...data }
                : field
            ),
          };
        }
      );
      
      // Return context with the previous data
      return { previousStep };
    },
    onError: (error, variables, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousStep) {
        queryClient.setQueryData(
          adminQueryKeys.step(variables.stepId),
          context.previousStep
        );
      }
      
      toast.error("Failed to update field", {
        description: error instanceof Error ? error.message : "An error occurred",
      });
    },
    onSettled: (data, error, variables) => {
      // Always refetch after error or success to ensure we have the correct data
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.step(variables.stepId) });
      
      if (!error && data) {
        toast.success("Field updated successfully", {
          description: `Field "${data.name}" has been updated.`,
        });
      }
    },
  });
};

// Bulk update mutations
export const useBulkUpdateFields = () => {
  const queryClient = useQueryClient();
  const { resetChanges } = useAdminFlowStore();

  return useMutation({
    mutationFn: async ({ 
      stepId, 
      updates 
    }: { 
      stepId: string; 
      updates: Array<{ fieldId: string; data: Partial<FieldFormData> }> 
    }) => {
      // Process all updates in parallel
      const updatePromises = updates.map(({ fieldId, data }) =>
        adminApi.updateField(stepId, fieldId, data)
      );
      
      return Promise.all(updatePromises);
    },
    onSuccess: (_, variables) => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.step(variables.stepId) });
      
      // Reset store changes
      resetChanges();
      
      toast.success("Fields updated successfully", {
        description: `${variables.updates.length} field(s) have been updated.`,
      });
    },
    onError: (error) => {
      toast.error("Failed to update fields", {
        description: error instanceof Error ? error.message : "An error occurred",
      });
    },
  });
};