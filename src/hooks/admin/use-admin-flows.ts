import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useCallback, useEffect } from "react";
import { toast } from "sonner";
import { getApiService } from "@/lib/api/mock-responses";
import {
  invalidateQueries,
  queryClient,
  setQueryData,
} from "@/lib/query-client";
import { useAdminFlowStore } from "@/store/use-admin-flow-store";
import type {
  FieldFormData,
  FieldListItem,
  FieldType,
  FlowDetail,
  FlowFormData,
  FlowListItem,
  FlowStatus,
  StepDetail,
  StepFormData,
  StepListItem,
  StepStatus,
} from "@/types/admin";

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
  getFlows: async (options?: {
    page?: number;
    limit?: number;
    status?: string;
  }): Promise<FlowListItem[]> => {
    const response = await apiService.getFlows(options);
    return response.flows.map((flow) => ({
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
      steps: flow.steps.map((step) => ({
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

  updateFlow: async (
    id: string,
    data: Partial<FlowFormData>,
  ): Promise<FlowDetail> => {
    const updatedFlow = await apiService.updateFlow(id, data);
    return {
      id: updatedFlow.id,
      name: updatedFlow.name,
      description: updatedFlow.description,
      status: updatedFlow.status as FlowStatus,
      createdAt: updatedFlow.createdAt,
      updatedAt: updatedFlow.updatedAt,
      steps: updatedFlow.steps.map((step) => ({
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

  deleteFlow: async (id: string): Promise<void> => {
    await apiService.deleteFlow(id);
  },

  duplicateFlow: async (id: string, name?: string): Promise<FlowDetail> => {
    const duplicatedFlow = await apiService.duplicateFlow(id, name);
    return {
      id: duplicatedFlow.id,
      name: duplicatedFlow.name,
      description: duplicatedFlow.description,
      status: duplicatedFlow.status as FlowStatus,
      createdAt: duplicatedFlow.createdAt,
      updatedAt: duplicatedFlow.updatedAt,
      steps: duplicatedFlow.steps.map((step) => ({
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

  toggleFlowStatus: async (id: string): Promise<FlowDetail> => {
    const updatedFlow = await apiService.toggleFlowStatus(id);
    return {
      id: updatedFlow.id,
      name: updatedFlow.name,
      description: updatedFlow.description,
      status: updatedFlow.status as FlowStatus,
      createdAt: updatedFlow.createdAt,
      updatedAt: updatedFlow.updatedAt,
      steps: updatedFlow.steps.map((step) => ({
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
    return response.steps.map((step) => ({
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
      fields: step.fields.map((field) => ({
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

  updateStep: async (
    id: string,
    data: Partial<StepFormData>,
  ): Promise<StepDetail> => {
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
      fields: updatedStep.fields.map((field) => ({
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
    data: Partial<FieldFormData>,
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

// Enhanced hooks with better caching and error handling
export const useFlows = (options?: {
  page?: number;
  limit?: number;
  status?: string;
}) => {
  return useQuery({
    queryKey: [...adminQueryKeys.flows, options] as const,
    queryFn: () => adminApi.getFlows(options),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: (failureCount, error) => {
      // Don't retry on 4xx errors except 408, 429
      if (error && typeof error === "object" && "status" in error) {
        const status = error.status as number;
        if (status >= 400 && status < 500 && status !== 408 && status !== 429) {
          return false;
        }
      }
      return failureCount < 3;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    refetchOnWindowFocus: false,
    select: (data) => {
      // Transform data if needed
      return data.map((flow) => ({
        ...flow,
        // Add computed properties if needed
        searchKey: `${flow.name.toLowerCase()} ${flow.status.toLowerCase()}`,
      }));
    },
  });
};

// Infinite query for large datasets
export const useInfiniteFlows = (options?: {
  limit?: number;
  status?: string;
}) => {
  return useInfiniteQuery({
    queryKey: [...adminQueryKeys.flows, "infinite", options] as const,
    queryFn: ({ pageParam = 1 }) =>
      adminApi.getFlows({ ...options, page: pageParam }),
    initialPageParam: 1,
    getNextPageParam: (lastPage, _allPages, lastPageParam) => {
      // Return undefined when there are no more pages
      if (lastPage.length < (options?.limit || 10)) {
        return undefined;
      }
      return lastPageParam + 1;
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    refetchOnWindowFocus: false,
  });
};

// Prefetch flows for better UX
export const usePrefetchFlows = () => {
  const queryClient = useQueryClient();

  return useCallback(
    (options?: { page?: number; limit?: number; status?: string }) => {
      queryClient.prefetchQuery({
        queryKey: [...adminQueryKeys.flows, options] as const,
        queryFn: () => adminApi.getFlows(options),
        staleTime: 5 * 60 * 1000,
      });
    },
    [queryClient],
  );
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
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: (failureCount, error) => {
      // Don't retry on 4xx errors except 408, 429
      if (error && typeof error === "object" && "status" in error) {
        const status = error.status as number;
        if (status >= 400 && status < 500 && status !== 408 && status !== 429) {
          return false;
        }
      }
      return failureCount < 3;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    refetchOnWindowFocus: false,
  });

  // Prefetch related data when flow is loaded
  useEffect(() => {
    if (query.data?.steps && query.data.steps.length > 0) {
      query.data.steps.forEach((step: StepListItem) => {
        queryClient.prefetchQuery({
          queryKey: adminQueryKeys.step(step.id),
          queryFn: () => adminApi.getStep(step.id),
          staleTime: 5 * 60 * 1000,
        });
      });
    }
  }, [query.data]);

  useEffect(() => {
    if (query.data) {
      setCurrentFlow(query.data as FlowDetail);
      setLoading(false);
      setError(null);
    }
  }, [query.data, setCurrentFlow, setLoading, setError]);

  useEffect(() => {
    if (query.error) {
      setError(
        query.error instanceof Error
          ? query.error.message
          : "Failed to load flow",
      );
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
    onMutate: async ({ id, data }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: adminQueryKeys.flows });
      await queryClient.cancelQueries({ queryKey: adminQueryKeys.flow(id) });

      // Snapshot previous values
      const previousFlows = queryClient.getQueryData(adminQueryKeys.flows);
      const previousFlow = queryClient.getQueryData(adminQueryKeys.flow(id));

      // Optimistically update the flow
      queryClient.setQueryData(
        adminQueryKeys.flow(id),
        (oldFlow: FlowDetail | undefined) =>
          oldFlow ? { ...oldFlow, ...data } : oldFlow,
      );

      // Optimistically update the flows list
      queryClient.setQueryData(
        adminQueryKeys.flows,
        (oldFlows: FlowListItem[] | undefined) =>
          oldFlows?.map((flow) =>
            flow.id === id ? { ...flow, ...data } : flow,
          ),
      );

      // Return context with the previous data
      return { previousFlows, previousFlow };
    },
    onError: (error, variables, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousFlows) {
        queryClient.setQueryData(adminQueryKeys.flows, context.previousFlows);
      }
      if (context?.previousFlow) {
        queryClient.setQueryData(
          adminQueryKeys.flow(variables.id),
          context.previousFlow,
        );
      }

      toast.error("Failed to update flow", {
        description:
          error instanceof Error ? error.message : "An error occurred",
      });
    },
    onSuccess: (updatedFlow) => {
      // Update the cache with the actual updated flow
      setQueryData(adminQueryKeys.flow(updatedFlow.id), updatedFlow);

      // Update flows list cache
      queryClient.setQueryData(
        adminQueryKeys.flows,
        (oldFlows: FlowListItem[] | undefined) =>
          oldFlows?.map((flow) =>
            flow.id === updatedFlow.id ? { ...flow, ...updatedFlow } : flow,
          ),
      );

      // Reset store changes
      resetChanges();

      toast.success("Flow updated successfully", {
        description: `"${updatedFlow.name}" has been updated.`,
      });
    },
    onSettled: (_, __, variables) => {
      // Always refetch after error or success to ensure we have the correct data
      invalidateQueries(adminQueryKeys.flow(variables.id));
      invalidateQueries(adminQueryKeys.flows);
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
      setError(
        query.error instanceof Error
          ? query.error.message
          : "Failed to load step",
      );
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
        updatedStep,
      );

      // Update flow steps cache
      queryClient.setQueryData(
        adminQueryKeys.flowSteps(updatedStep.flowId),
        (oldSteps: StepListItem[] | undefined) =>
          oldSteps?.map((step) =>
            step.id === updatedStep.id ? { ...step, ...updatedStep } : step,
          ),
      );

      // Reset store changes
      resetChanges();

      toast.success("Step updated successfully", {
        description: `"${updatedStep.name}" has been updated.`,
      });
    },
    onError: (error) => {
      toast.error("Failed to update step", {
        description:
          error instanceof Error ? error.message : "An error occurred",
      });
    },
  });
};

export const useUpdateField = () => {
  const queryClient = useQueryClient();
  const _currentStep = useAdminFlowStore((state) => state.currentStep);

  return useMutation({
    mutationFn: ({
      stepId,
      fieldId,
      data,
    }: {
      stepId: string;
      fieldId: string;
      data: Partial<FieldFormData>;
    }) => adminApi.updateField(stepId, fieldId, data),
    onMutate: async ({ stepId, fieldId, data }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({
        queryKey: adminQueryKeys.step(stepId),
      });

      // Snapshot previous value
      const previousStep = queryClient.getQueryData(
        adminQueryKeys.step(stepId),
      );

      // Optimistically update to the new value
      queryClient.setQueryData(
        adminQueryKeys.step(stepId),
        (oldStep: StepDetail | undefined) => {
          if (!oldStep) return oldStep;

          return {
            ...oldStep,
            fields: oldStep.fields.map((field) =>
              field.id === fieldId ? { ...field, ...data } : field,
            ),
          };
        },
      );

      // Return context with the previous data
      return { previousStep };
    },
    onError: (error, variables, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousStep) {
        queryClient.setQueryData(
          adminQueryKeys.step(variables.stepId),
          context.previousStep,
        );
      }

      toast.error("Failed to update field", {
        description:
          error instanceof Error ? error.message : "An error occurred",
      });
    },
    onSettled: (data, error, variables) => {
      // Always refetch after error or success to ensure we have the correct data
      queryClient.invalidateQueries({
        queryKey: adminQueryKeys.step(variables.stepId),
      });

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
      updates,
    }: {
      stepId: string;
      updates: Array<{ fieldId: string; data: Partial<FieldFormData> }>;
    }) => {
      // Process all updates in parallel
      const updatePromises = updates.map(({ fieldId, data }) =>
        adminApi.updateField(stepId, fieldId, data),
      );

      return Promise.all(updatePromises);
    },
    onSuccess: (_, variables) => {
      // Invalidate and refetch
      queryClient.invalidateQueries({
        queryKey: adminQueryKeys.step(variables.stepId),
      });

      // Reset store changes
      resetChanges();

      toast.success("Fields updated successfully", {
        description: `${variables.updates.length} field(s) have been updated.`,
      });
    },
    onError: (error) => {
      toast.error("Failed to update fields", {
        description:
          error instanceof Error ? error.message : "An error occurred",
      });
    },
  });
};

// Flow action mutations
export const useDeleteFlow = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => adminApi.deleteFlow(id),
    onMutate: async (id) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: adminQueryKeys.flows });

      // Snapshot previous value
      const previousFlows = queryClient.getQueryData(adminQueryKeys.flows);

      // Optimistically remove the flow from the cache
      queryClient.setQueryData(
        adminQueryKeys.flows,
        (oldFlows: FlowListItem[] | undefined) =>
          oldFlows?.filter((flow) => flow.id !== id),
      );

      // Return context with the previous data
      return { previousFlows };
    },
    onError: (error, _variables, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousFlows) {
        queryClient.setQueryData(adminQueryKeys.flows, context.previousFlows);
      }

      toast.error("Failed to delete flow", {
        description:
          error instanceof Error ? error.message : "An error occurred",
      });
    },
    onSuccess: (_, id) => {
      // Invalidate specific flow query
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.flow(id) });

      toast.success("Flow deleted successfully", {
        description: "The flow has been permanently removed.",
      });
    },
    onSettled: () => {
      // Always refetch after error or success to ensure we have the correct data
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.flows });
    },
  });
};

export const useDuplicateFlow = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, name }: { id: string; name?: string }) =>
      adminApi.duplicateFlow(id, name),
    onMutate: async ({ id, name }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: adminQueryKeys.flows });

      // Snapshot previous value
      const previousFlows = queryClient.getQueryData(adminQueryKeys.flows);

      // Get the original flow to duplicate
      const originalFlow = await queryClient.fetchQuery({
        queryKey: adminQueryKeys.flow(id),
        queryFn: () => adminApi.getFlow(id),
      });

      if (originalFlow) {
        // Create a temporary duplicated flow for optimistic update
        const tempFlow: FlowListItem = {
          id: `temp-${Date.now()}`,
          name: name || `${originalFlow.name} (Copy)`,
          status: "draft",
          stepCount: originalFlow.steps.length,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        // Optimistically add the duplicated flow to the cache
        queryClient.setQueryData(
          adminQueryKeys.flows,
          (oldFlows: FlowListItem[] | undefined) =>
            oldFlows ? [tempFlow, ...oldFlows] : [tempFlow],
        );
      }

      // Return context with the previous data
      return { previousFlows };
    },
    onError: (error, _variables, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousFlows) {
        queryClient.setQueryData(adminQueryKeys.flows, context.previousFlows);
      }

      toast.error("Failed to duplicate flow", {
        description:
          error instanceof Error ? error.message : "An error occurred",
      });
    },
    onSuccess: (duplicatedFlow) => {
      // Update the cache with the actual duplicated flow
      queryClient.setQueryData(
        adminQueryKeys.flow(duplicatedFlow.id),
        duplicatedFlow,
      );

      // Update flows list cache
      queryClient.setQueryData(
        adminQueryKeys.flows,
        (oldFlows: FlowListItem[] | undefined) => {
          if (!oldFlows) return [duplicatedFlow];

          // Remove any temporary flow and add the real one
          const filteredFlows = oldFlows.filter(
            (flow) => !flow.id.startsWith("temp-"),
          );
          return [duplicatedFlow, ...filteredFlows];
        },
      );

      toast.success("Flow duplicated successfully", {
        description: `"${duplicatedFlow.name}" has been created.`,
      });
    },
    onSettled: () => {
      // Always refetch after error or success to ensure we have the correct data
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.flows });
    },
  });
};

export const useToggleFlowStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => adminApi.toggleFlowStatus(id),
    onMutate: async (id) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: adminQueryKeys.flows });
      await queryClient.cancelQueries({ queryKey: adminQueryKeys.flow(id) });

      // Snapshot previous values
      const previousFlows = queryClient.getQueryData(adminQueryKeys.flows);
      const previousFlow = queryClient.getQueryData(adminQueryKeys.flow(id));

      // Optimistically update the flow status in the list
      queryClient.setQueryData(
        adminQueryKeys.flows,
        (oldFlows: FlowListItem[] | undefined) =>
          oldFlows?.map((flow) =>
            flow.id === id
              ? {
                  ...flow,
                  status:
                    flow.status === "active"
                      ? "inactive"
                      : ("active" as FlowStatus),
                }
              : flow,
          ),
      );

      // Optimistically update the flow status in the detail
      queryClient.setQueryData(
        adminQueryKeys.flow(id),
        (oldFlow: FlowDetail | undefined) => {
          if (!oldFlow) return oldFlow;

          return {
            ...oldFlow,
            status:
              oldFlow.status === "active"
                ? "inactive"
                : ("active" as FlowStatus),
          };
        },
      );

      // Return context with the previous data
      return { previousFlows, previousFlow };
    },
    onError: (error, variables, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousFlows) {
        queryClient.setQueryData(adminQueryKeys.flows, context.previousFlows);
      }
      if (context?.previousFlow) {
        queryClient.setQueryData(
          adminQueryKeys.flow(variables),
          context.previousFlow,
        );
      }

      toast.error("Failed to toggle flow status", {
        description:
          error instanceof Error ? error.message : "An error occurred",
      });
    },
    onSuccess: (updatedFlow) => {
      // Update the cache with the actual updated flow
      queryClient.setQueryData(
        adminQueryKeys.flow(updatedFlow.id),
        updatedFlow,
      );

      // Update flows list cache
      queryClient.setQueryData(
        adminQueryKeys.flows,
        (oldFlows: FlowListItem[] | undefined) =>
          oldFlows?.map((flow) =>
            flow.id === updatedFlow.id
              ? { ...flow, status: updatedFlow.status }
              : flow,
          ),
      );

      toast.success("Flow status updated successfully", {
        description: `"${updatedFlow.name}" is now ${updatedFlow.status}.`,
      });
    },
    onSettled: (_, __, id) => {
      // Always refetch after error or success to ensure we have the correct data
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.flows });
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.flow(id) });
    },
  });
};
