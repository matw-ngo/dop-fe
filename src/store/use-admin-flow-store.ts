import { create } from "zustand";
import { devtools } from "zustand/middleware";
import type { 
  FlowDetail, 
  StepDetail, 
  FieldListItem, 
  FlowStatus, 
  StepStatus 
} from "@/types/admin";

interface FieldChange {
  fieldId: string;
  changes: Partial<FieldListItem>;
}

interface StepChange {
  stepId: string;
  changes: Partial<StepDetail>;
  fieldChanges?: FieldChange[];
}

interface AdminFlowState {
  // Current state
  currentFlow: FlowDetail | null;
  currentStep: StepDetail | null;
  isEditing: boolean;
  
  // Temporary changes (not yet saved)
  pendingFlowChanges: Partial<FlowDetail>;
  pendingStepChanges: Record<string, StepChange>;
  
  // Loading states
  isLoading: boolean;
  isSaving: boolean;
  
  // Error states
  error: string | null;
  
  // Actions
  setCurrentFlow: (flow: FlowDetail | null) => void;
  setCurrentStep: (step: StepDetail | null) => void;
  setEditing: (editing: boolean) => void;
  setLoading: (loading: boolean) => void;
  setSaving: (saving: boolean) => void;
  setError: (error: string | null) => void;
  
  // Flow management
  updateFlowStatus: (status: FlowStatus) => void;
  updateFlowName: (name: string) => void;
  updateFlowDescription: (description: string) => void;
  
  // Step management
  updateStepStatus: (stepId: string, status: StepStatus) => void;
  updateStepName: (stepId: string, name: string) => void;
  updateStepDescription: (stepId: string, description: string) => void;
  updateStepOrder: (stepId: string, stepOrder: number) => void;
  
  // Field management
  updateFieldVisibility: (fieldId: string, visible: boolean) => void;
  updateFieldRequirement: (fieldId: string, required: boolean) => void;
  updateFieldLabel: (fieldId: string, label: string) => void;
  updateFieldPlaceholder: (fieldId: string, placeholder: string) => void;
  updateFieldValidation: (fieldId: string, validation: FieldListItem['validation']) => void;
  
  // Change management
  hasUnsavedChanges: () => boolean;
  resetChanges: () => void;
  saveChanges: () => void;
  
  // Computed values
  getModifiedFields: (stepId: string) => FieldChange[];
  getModifiedSteps: () => StepChange[];
}

export const useAdminFlowStore = create<AdminFlowState>()(
  devtools(
    (set, get) => ({
      // Initial state
      currentFlow: null,
      currentStep: null,
      isEditing: false,
      pendingFlowChanges: {},
      pendingStepChanges: {},
      isLoading: false,
      isSaving: false,
      error: null,

      // Basic setters
      setCurrentFlow: (flow) => {
        set({ 
          currentFlow: flow, 
          currentStep: null,
          pendingFlowChanges: {},
          pendingStepChanges: {},
          error: null 
        }, false, "setCurrentFlow");
      },

      setCurrentStep: (step) => {
        set({ 
          currentStep: step,
          error: null 
        }, false, "setCurrentStep");
      },

      setEditing: (editing) => {
        set({ isEditing: editing }, false, "setEditing");
      },

      setLoading: (loading) => {
        set({ isLoading: loading }, false, "setLoading");
      },

      setSaving: (saving) => {
        set({ isSaving: saving }, false, "setSaving");
      },

      setError: (error) => {
        set({ error }, false, "setError");
      },

      // Flow management
      updateFlowStatus: (status) => {
        set((state) => ({
          pendingFlowChanges: {
            ...state.pendingFlowChanges,
            status,
          },
          isEditing: true,
        }), false, "updateFlowStatus");
      },

      updateFlowName: (name) => {
        set((state) => ({
          pendingFlowChanges: {
            ...state.pendingFlowChanges,
            name,
          },
          isEditing: true,
        }), false, "updateFlowName");
      },

      updateFlowDescription: (description) => {
        set((state) => ({
          pendingFlowChanges: {
            ...state.pendingFlowChanges,
            description,
          },
          isEditing: true,
        }), false, "updateFlowDescription");
      },

      // Step management
      updateStepStatus: (stepId, status) => {
        set((state) => ({
          pendingStepChanges: {
            ...state.pendingStepChanges,
            [stepId]: {
              ...state.pendingStepChanges[stepId],
              stepId,
              changes: {
                ...state.pendingStepChanges[stepId]?.changes,
                status,
              },
            },
          },
          isEditing: true,
        }), false, "updateStepStatus");
      },

      updateStepName: (stepId, name) => {
        set((state) => ({
          pendingStepChanges: {
            ...state.pendingStepChanges,
            [stepId]: {
              ...state.pendingStepChanges[stepId],
              stepId,
              changes: {
                ...state.pendingStepChanges[stepId]?.changes,
                name,
              },
            },
          },
          isEditing: true,
        }), false, "updateStepName");
      },

      updateStepDescription: (stepId, description) => {
        set((state) => ({
          pendingStepChanges: {
            ...state.pendingStepChanges,
            [stepId]: {
              ...state.pendingStepChanges[stepId],
              stepId,
              changes: {
                ...state.pendingStepChanges[stepId]?.changes,
                description,
              },
            },
          },
          isEditing: true,
        }), false, "updateStepDescription");
      },

      updateStepOrder: (stepId, stepOrder) => {
        set((state) => ({
          pendingStepChanges: {
            ...state.pendingStepChanges,
            [stepId]: {
              ...state.pendingStepChanges[stepId],
              stepId,
              changes: {
                ...state.pendingStepChanges[stepId]?.changes,
                stepOrder,
              },
            },
          },
          isEditing: true,
        }), false, "updateStepOrder");
      },

      // Field management
      updateFieldVisibility: (fieldId, visible) => {
        const { currentStep } = get();
        if (!currentStep) return;

        set((state) => {
          const existingStepChange = state.pendingStepChanges[currentStep.id];
          const existingFieldChanges = existingStepChange?.fieldChanges || [];
          const existingFieldIndex = existingFieldChanges.findIndex(fc => fc.fieldId === fieldId);
          
          let newFieldChanges: FieldChange[];
          
          if (existingFieldIndex >= 0) {
            // Update existing field change
            newFieldChanges = [...existingFieldChanges];
            newFieldChanges[existingFieldIndex] = {
              fieldId,
              changes: {
                ...newFieldChanges[existingFieldIndex].changes,
                visible,
              },
            };
          } else {
            // Add new field change
            newFieldChanges = [
              ...existingFieldChanges,
              { fieldId, changes: { visible } }
            ];
          }

          return {
            pendingStepChanges: {
              ...state.pendingStepChanges,
              [currentStep.id]: {
                ...existingStepChange,
                stepId: currentStep.id,
                changes: existingStepChange?.changes || {},
                fieldChanges: newFieldChanges,
              },
            },
            isEditing: true,
          };
        }, false, "updateFieldVisibility");
      },

      updateFieldRequirement: (fieldId, required) => {
        const { currentStep } = get();
        if (!currentStep) return;

        set((state) => {
          const existingStepChange = state.pendingStepChanges[currentStep.id];
          const existingFieldChanges = existingStepChange?.fieldChanges || [];
          const existingFieldIndex = existingFieldChanges.findIndex(fc => fc.fieldId === fieldId);
          
          let newFieldChanges: FieldChange[];
          
          if (existingFieldIndex >= 0) {
            // Update existing field change
            newFieldChanges = [...existingFieldChanges];
            newFieldChanges[existingFieldIndex] = {
              fieldId,
              changes: {
                ...newFieldChanges[existingFieldIndex].changes,
                required,
              },
            };
          } else {
            // Add new field change
            newFieldChanges = [
              ...existingFieldChanges,
              { fieldId, changes: { required } }
            ];
          }

          return {
            pendingStepChanges: {
              ...state.pendingStepChanges,
              [currentStep.id]: {
                ...existingStepChange,
                stepId: currentStep.id,
                changes: existingStepChange?.changes || {},
                fieldChanges: newFieldChanges,
              },
            },
            isEditing: true,
          };
        }, false, "updateFieldRequirement");
      },

      updateFieldLabel: (fieldId, label) => {
        const { currentStep } = get();
        if (!currentStep) return;

        set((state) => {
          const existingStepChange = state.pendingStepChanges[currentStep.id];
          const existingFieldChanges = existingStepChange?.fieldChanges || [];
          const existingFieldIndex = existingFieldChanges.findIndex(fc => fc.fieldId === fieldId);
          
          let newFieldChanges: FieldChange[];
          
          if (existingFieldIndex >= 0) {
            // Update existing field change
            newFieldChanges = [...existingFieldChanges];
            newFieldChanges[existingFieldIndex] = {
              fieldId,
              changes: {
                ...newFieldChanges[existingFieldIndex].changes,
                label,
              },
            };
          } else {
            // Add new field change
            newFieldChanges = [
              ...existingFieldChanges,
              { fieldId, changes: { label } }
            ];
          }

          return {
            pendingStepChanges: {
              ...state.pendingStepChanges,
              [currentStep.id]: {
                ...existingStepChange,
                stepId: currentStep.id,
                changes: existingStepChange?.changes || {},
                fieldChanges: newFieldChanges,
              },
            },
            isEditing: true,
          };
        }, false, "updateFieldLabel");
      },

      updateFieldPlaceholder: (fieldId, placeholder) => {
        const { currentStep } = get();
        if (!currentStep) return;

        set((state) => {
          const existingStepChange = state.pendingStepChanges[currentStep.id];
          const existingFieldChanges = existingStepChange?.fieldChanges || [];
          const existingFieldIndex = existingFieldChanges.findIndex(fc => fc.fieldId === fieldId);
          
          let newFieldChanges: FieldChange[];
          
          if (existingFieldIndex >= 0) {
            // Update existing field change
            newFieldChanges = [...existingFieldChanges];
            newFieldChanges[existingFieldIndex] = {
              fieldId,
              changes: {
                ...newFieldChanges[existingFieldIndex].changes,
                placeholder,
              },
            };
          } else {
            // Add new field change
            newFieldChanges = [
              ...existingFieldChanges,
              { fieldId, changes: { placeholder } }
            ];
          }

          return {
            pendingStepChanges: {
              ...state.pendingStepChanges,
              [currentStep.id]: {
                ...existingStepChange,
                stepId: currentStep.id,
                changes: existingStepChange?.changes || {},
                fieldChanges: newFieldChanges,
              },
            },
            isEditing: true,
          };
        }, false, "updateFieldPlaceholder");
      },

      updateFieldValidation: (fieldId, validation) => {
        const { currentStep } = get();
        if (!currentStep) return;

        set((state) => {
          const existingStepChange = state.pendingStepChanges[currentStep.id];
          const existingFieldChanges = existingStepChange?.fieldChanges || [];
          const existingFieldIndex = existingFieldChanges.findIndex(fc => fc.fieldId === fieldId);
          
          let newFieldChanges: FieldChange[];
          
          if (existingFieldIndex >= 0) {
            // Update existing field change
            newFieldChanges = [...existingFieldChanges];
            newFieldChanges[existingFieldIndex] = {
              fieldId,
              changes: {
                ...newFieldChanges[existingFieldIndex].changes,
                validation,
              },
            };
          } else {
            // Add new field change
            newFieldChanges = [
              ...existingFieldChanges,
              { fieldId, changes: { validation } }
            ];
          }

          return {
            pendingStepChanges: {
              ...state.pendingStepChanges,
              [currentStep.id]: {
                ...existingStepChange,
                stepId: currentStep.id,
                changes: existingStepChange?.changes || {},
                fieldChanges: newFieldChanges,
              },
            },
            isEditing: true,
          };
        }, false, "updateFieldValidation");
      },

      // Change management
      hasUnsavedChanges: () => {
        const { pendingFlowChanges, pendingStepChanges } = get();
        return (
          Object.keys(pendingFlowChanges).length > 0 ||
          Object.keys(pendingStepChanges).length > 0
        );
      },

      resetChanges: () => {
        set({
          pendingFlowChanges: {},
          pendingStepChanges: {},
          isEditing: false,
          error: null,
        }, false, "resetChanges");
      },

      saveChanges: () => {
        // This will be handled by the hooks that call the API
        // The store just tracks the state
        set({ isSaving: true }, false, "saveChanges");
      },

      // Computed values
      getModifiedFields: (stepId) => {
        const { pendingStepChanges } = get();
        return pendingStepChanges[stepId]?.fieldChanges || [];
      },

      getModifiedSteps: () => {
        const { pendingStepChanges } = get();
        return Object.values(pendingStepChanges);
      },
    }),
    {
      name: "AdminFlowStore",
    }
  )
);

// Selectors for better performance
export const useCurrentFlow = () => useAdminFlowStore((state) => state.currentFlow);
export const useCurrentStep = () => useAdminFlowStore((state) => state.currentStep);
export const useIsEditing = () => useAdminFlowStore((state) => state.isEditing);
export const useHasUnsavedChanges = () => useAdminFlowStore((state) => state.hasUnsavedChanges());
export const useIsSaving = () => useAdminFlowStore((state) => state.isSaving);
export const useAdminError = () => useAdminFlowStore((state) => state.error);