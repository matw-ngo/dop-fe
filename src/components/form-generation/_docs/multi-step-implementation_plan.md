# P5: Multi-Step Wizard Form - Comprehensive Implementation Plan

## 🎯 **Executive Summary**

Implement production-ready **multi-step wizard forms** with **Zustand state management** following project's existing patterns. Support API-driven step definitions with comprehensive validation, multiple progress indicators, and advanced features.

---

## 📚 **Research Findings**

### Existing Zustand Infrastructure

**Project has**:
- ✅ Zustand v5.0.8 installed
- ✅ [use-multi-step-form-store.ts](file:///Users/trung.ngo/Documents/projects/dop-fe/src/store/use-multi-step-form-store.ts) - Basic multi-step state
- ✅ [use-onboarding-form-store.ts](file:///Users/trung.ngo/Documents/projects/dop-fe/src/store/use-onboarding-form-store.ts) - Form-specific store
- ✅ Devtools middleware pattern
- ✅ Persist middleware with partialize
- ✅ Convenience selector hooks

**Pattern to follow**:
```typescript
create<Store>()(
  devtools(
    persist(
      (set, get) => ({...}),
      { name: 'storage-key', partialize: ... }
    ),
    { name: 'DevtoolsName' }
  )
)
```

---

## 🏗️ **Architecture Overview**

### State Management Strategy

```
┌─────────────────────────────────────┐
│   useFormWizardStore (Zustand)      │
│   ─────────────────────────────────│
│   • Current step index              │
│   • Step data (per step)            │
│   • Step validation status          │
│   • Step completion status          │
│   • Visit history                   │
│   • Conditional visibility          │
└─────────────────────────────────────┘
           ↓
┌─────────────────────────────────────┐
│       StepWizard Component          │
│   (Renders based on store state)   │
└─────────────────────────────────────┘
```

---

## 📝 **Type Definitions** (Add to [types.ts](file:///Users/trung.ngo/Documents/projects/dop-fe/src/components/form-generation/types.ts))

### Step Configuration Types

```typescript
/**
 * Step validation status
 */
export type StepValidationStatus = 
  | 'idle'       // Not validated yet
  | 'validating' // Validation in progress
  | 'valid'      // Passed validation
  | 'invalid'    // Failed validation
  | 'skipped';   // Skipped (optional step)

/**
 * Step completion status
 */
export type StepCompletionStatus =
  | 'pending'    // Not started
  | 'current'    // Currently active
  | 'complete'   // Completed
  | 'locked'     // Cannot access (previous steps incomplete)
  | 'error';     // Has errors

/**
 * Progress indicator type
 */
export type ProgressIndicatorType =
  | 'bar'        // Linear progress bar
  | 'dots'       // Dot indicators
  | 'numbers'    // Numbered circles
  | 'stepper'    // Material-style stepper
  | 'tabs'       // Tab-like navigation
  | 'sidebar';   // Sidebar navigation

/**
 * Step condition configuration
 */
export interface StepCondition {
  /** Field to check */
  field: string;
  /** Comparison operator */
  operator: 'equals' | 'notEquals' | 'contains' | 'greaterThan' | 'lessThan' | 'in';
  /** Value to compare against */
  value: FieldValue;
  /** Logic for multiple conditions */
  logic?: 'and' | 'or';
}

/**
 * Step validation configuration
 */
export interface StepValidation {
  /** Validate on next button click */
  validateOnNext?: boolean; // Default: true
  /** Allow skipping this step */
  allowSkip?: boolean;
  /** Show validation errors immediately */
  showErrorsImmediately?: boolean;
  /** Custom validation function */
  customValidator?: (stepData: Record<string, any>, allData: Record<string, any>) => Promise<boolean | string>;
}

/**
 * Form step configuration
 */
export interface FormStep {
  /** Unique step ID */
  id: string;
  
  /** Step title */
  title: string;
  
  /** Step description/subtitle */
  description?: string;
  
  /** Step icon (optional) */
  icon?: ReactNode | string;
  
  /** Fields in this step */
  fields: FormField[];
  
  /** Validation configuration */
  validation?: StepValidation;
  
  /** Conditional visibility */
  condition?: StepCondition[];
  
  /** Optional step flag */
  optional?: boolean;
  
  /** Lock step until previous completed */
  locked?: boolean;
  
  /** Custom layout for this step */
  layout?: FormLayoutConfig;
  
  /** Help text or instructions */
  helpText?: string;
  
  /** Step-specific CSS class */
  className?: string;
}

/**
 * Navigation button configuration
 */
export interface NavigationButtonConfig {
  /** Button label */
  label?: string;
  
  /** Show/hide button */
  show?: boolean;
  
  /** Custom icon */
  icon?: ReactNode;
  
  /** Loading state label */
  loadingLabel?: string;
  
  /** CSS class */
  className?: string;
  
  /** Button variant */
  variant?: 'default' | 'outline' | 'ghost' | 'link';
}

/**
 * Wizard navigation configuration
 */
export interface WizardNavigationConfig {
  /** Show progress indicator */
  showProgress?: boolean;
  
  /** Progress indicator type */
  progressType?: ProgressIndicatorType;
  
  /** Show step titles in progress */
  showStepTitles?: boolean;
  
  /** Allow clicking on completed steps */
  allowStepClick?: boolean;
  
  /** Back button config */
  backButton?: NavigationButtonConfig;
  
  /** Next button config */
  nextButton?: NavigationButtonConfig;
  
  /** Submit button config (last step) */
  submitButton?: NavigationButtonConfig;
  
  /** Show step numbers */
  showStepNumbers?: boolean;
  
  /** Sticky navigation */
  stickyNavigation?: boolean;
}

/**
 * Enhanced FormConfig with multi-step support
 */
export interface FormConfig {
  /** Form ID */
  id?: string;
  
  /** Single-page fields (legacy) */
  fields?: FormField[];
  
  /** Multi-step configuration */
  steps?: FormStep[];
  
  /** Wizard navigation config */
  navigation?: WizardNavigationConfig;
  
  /** Auto-save configuration */
  autoSave?: {
    enabled?: boolean;
    interval?: number; // ms
    storageKey?: string;
  };
  
  /** Callbacks */
  onStepChange?: (step: number, data: Record<string, any>) => void;
  onStepValidation?: (step: number, isValid: boolean) => void;
  onComplete?: (data: Record<string, any>) => void | Promise<void>;
  
  /** Existing properties... */
  layout?: FormLayoutConfig;
  validation?: ValidationConfig;
  submitButton?: SubmitButtonConfig;
}
```

---

## 🗃️ **Zustand Store Implementation**

### New Store: `use-form-wizard-store.ts`

```typescript
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import type { FormStep, StepValidationStatus, StepCompletionStatus } from '@/components/form-generation/types';

/** Step metadata */
interface StepMeta {
  id: string;
  validationStatus: StepValidationStatus;
  completionStatus: StepCompletionStatus;
  visited: boolean;
  errors: Record<string, string>;
  touched: boolean;
}

/** Store state */
interface FormWizardState {
  /** Current active step index */
  currentStep: number;
  
  /** All steps configuration */
  steps: FormStep[];
  
  /** Form data (all steps combined) */
  formData: Record<string, any>;
  
  /** Per-step data (isolated) */
  stepData: Record<string, Record<string, any>>;
  
  /** Step metadata */
  stepMeta: Record<string, StepMeta>;
  
  /** Visited step indices */
  visitedSteps: number[];
  
  /** Completed step indices */
  completedSteps: number[];
  
  /** Wizard ID (for multi-wizard support) */
  wizardId: string;
  
  /** Loading states */
  isValidating: boolean;
  isSubmitting: boolean;
}

/** Store actions */
interface FormWizardActions {
  // Initialization
  initWizard: (wizardId: string, steps: FormStep[], initialData?: Record<string, any>) => void;
  resetWizard: () => void;
  
  // Navigation
  goToStep: (stepIndex: number) => void;
  nextStep: () => Promise<boolean>;
  previousStep: () => void;
  goToStepById: (stepId: string) => void;
  
  // Data management
  updateStepData: (stepId: string, data: Record<string, any>) => void;
  updateFieldValue: (stepId: string, fieldName: string, value: any) => void;
  getStepData: (stepId: string) => Record<string, any>;
  getAllData: () => Record<string, any>;
  
  // Validation
  validateStep: (stepIndex: number) => Promise<boolean>;
  validateAllSteps: () => Promise<boolean>;
  setStepErrors: (stepId: string, errors: Record<string, string>) => void;
  clearStepErrors: (stepId: string) => void;
  
  // Step status
  markStepComplete: (stepIndex: number) => void;
  markStepVisited: (stepIndex: number) => void;
  setStepValidationStatus: (stepId: string, status: StepValidationStatus) => void;
  setStepCompletionStatus: (stepId: string, status: StepCompletionStatus) => void;
  
  // Utilities
  canGoToStep: (stepIndex: number) => boolean;
  isStepComplete: (stepIndex: number) => boolean;
  isStepValid: (stepIndex: number) => boolean;
  getProgress: () => { current: number; total: number; percentage: number };
  
  // Conditional steps
  getVisibleSteps: () => FormStep[];
  isStepVisible: (stepId: string) => boolean;
}

type FormWizardStore = FormWizardState & FormWizardActions;

export const useFormWizardStore = create<FormWizardStore>()(
  devtools(
    persist(
      immer((set, get) => ({
        // Initial state
        currentStep: 0,
        steps: [],
        formData: {},
        stepData: {},
        stepMeta: {},
        visitedSteps: [],
        completedSteps: [],
        wizardId: '',
        isValidating: false,
        isSubmitting: false,
        
        // Initialize wizard
        initWizard: (wizardId, steps, initialData = {}) => {
          set((state) => {
            state.wizardId = wizardId;
            state.steps = steps;
            state.formData = initialData;
            state.currentStep = 0;
            state.visitedSteps = [0];
            state.completedSteps = [];
            
            // Initialize step metadata
            steps.forEach((step) => {
              state.stepMeta[step.id] = {
                id: step.id,
                validationStatus: 'idle',
                completionStatus: 'pending',
                visited: false,
                errors: {},
                touched: false,
              };
              state.stepData[step.id] = {};
            });
            
            // Mark first step as current
            if (steps[0]) {
              state.stepMeta[steps[0].id].completionStatus = 'current';
              state.stepMeta[steps[0].id].visited = true;
            }
          });
        },
        
        // Reset wizard
        resetWizard: () => {
          set({
            currentStep: 0,
            steps: [],
            formData: {},
            stepData: {},
            stepMeta: {},
            visitedSteps: [],
            completedSteps: [],
            wizardId: '',
            isValidating: false,
            isSubmitting: false,
          });
        },
        
        // Navigate to step by index
        goToStep: (stepIndex) => {
          const { steps, canGoToStep } = get();
          if (stepIndex >= 0 && stepIndex < steps.length && canGoToStep(stepIndex)) {
            set((state) => {
              // Update current step
              const prevStep = state.steps[state.currentStep];
              const nextStep = state.steps[stepIndex];
              
              if (prevStep) {
                state.stepMeta[prevStep.id].completionStatus = 
                  state.completedSteps.includes(state.currentStep) ? 'complete' : 'pending';
              }
              
              if (nextStep) {
                state.stepMeta[nextStep.id].completionStatus = 'current';
                state.stepMeta[nextStep.id].visited = true;
              }
              
              state.currentStep = stepIndex;
              
              if (!state.visitedSteps.includes(stepIndex)) {
                state.visitedSteps.push(stepIndex);
              }
            });
          }
        },
        
        // Go to next step (with validation)
        nextStep: async () => {
          const { currentStep, steps, validateStep, markStepComplete, goToStep } = get();
          
          // Validate current step
          const isValid = await validateStep(currentStep);
          
          if (!isValid) {
            return false;
          }
          
          // Mark current step as complete
          markStepComplete(currentStep);
          
          // Move to next step
          if (currentStep < steps.length - 1) {
            goToStep(currentStep + 1);
          }
          
          return true;
        },
        
        // Go to previous step
        previousStep: () => {
          const { currentStep, goToStep } = get();
          if (currentStep > 0) {
            goToStep(currentStep - 1);
          }
        },
        
        // Go to step by ID
        goToStepById: (stepId) => {
          const { steps } = get();
          const stepIndex = steps.findIndex(s => s.id === stepId);
          if (stepIndex !== -1) {
            get().goToStep(stepIndex);
          }
        },
        
        // Update step data
        updateStepData: (stepId, data) => {
          set((state) => {
            state.stepData[stepId] = { ...state.stepData[stepId], ...data };
            state.formData = { ...state.formData, ...data };
            state.stepMeta[stepId].touched = true;
          });
        },
        
        // Update single field value
        updateFieldValue: (stepId, fieldName, value) => {
          set((state) => {
            if (!state.stepData[stepId]) {
              state.stepData[stepId] = {};
            }
            state.stepData[stepId][fieldName] = value;
            state.formData[fieldName] = value;
            state.stepMeta[stepId].touched = true;
          });
        },
        
        // Get step data
        getStepData: (stepId) => {
          return get().stepData[stepId] || {};
        },
        
        // Get all data
        getAllData: () => {
          return get().formData;
        },
        
        // Validate step
        validateStep: async (stepIndex) => {
          const { steps, formData } = get();
          const step = steps[stepIndex];
          
          if (!step) return false;
          
          set((state) => {
            state.isValidating = true;
            state.stepMeta[step.id].validationStatus = 'validating';
          });
          
          try {
            // Custom validation
            if (step.validation?.customValidator) {
              const result = await step.validation.customValidator(
                get().stepData[step.id] || {},
                formData
              );
              
              if (typeof result === 'string') {
                // Validation failed with message
                set((state) => {
                  state.stepMeta[step.id].validationStatus = 'invalid';
                  state.stepMeta[step.id].errors = { _step: result };
                  state.isValidating = false;
                });
                return false;
              } else if (!result) {
                // Validation failed
                set((state) => {
                  state.stepMeta[step.id].validationStatus = 'invalid';
                  state.isValidating = false;
                });
                return false;
              }
            }
            
            // Field validations (use existing ValidationEngine)
            // TODO: Integrate with ValidationEngine for field-level validation
            
            // If all passed
            set((state) => {
              state.stepMeta[step.id].validationStatus = 'valid';
              state.stepMeta[step.id].errors = {};
              state.isValidating = false;
            });
            
            return true;
          } catch (error) {
            set((state) => {
              state.stepMeta[step.id].validationStatus = 'invalid';
              state.stepMeta[step.id].errors = { _step: 'Validation error' };
              state.isValidating = false;
            });
            return false;
          }
        },
        
        // Validate all steps
        validateAllSteps: async () => {
          const { steps } = get();
          const results = await Promise.all(
            steps.map((_, index) => get().validateStep(index))
          );
          return results.every(r => r);
        },
        
        // Set step errors
        setStepErrors: (stepId, errors) => {
          set((state) => {
            state.stepMeta[stepId].errors = errors;
            state.stepMeta[stepId].validationStatus = 'invalid';
          });
        },
        
        // Clear step errors
        clearStepErrors: (stepId) => {
          set((state) => {
            state.stepMeta[stepId].errors = {};
          });
        },
        
        // Mark step as complete
        markStepComplete: (stepIndex) => {
          const { steps } = get();
          const step = steps[stepIndex];
          
          if (step) {
            set((state) => {
              state.stepMeta[step.id].completionStatus = 'complete';
              if (!state.completedSteps.includes(stepIndex)) {
                state.completedSteps.push(stepIndex);
              }
            });
          }
        },
        
        // Mark step as visited
        markStepVisited: (stepIndex) => {
          const { steps } = get();
          const step = steps[stepIndex];
          
          if (step) {
            set((state) => {
              state.stepMeta[step.id].visited = true;
              if (!state.visitedSteps.includes(stepIndex)) {
                state.visitedSteps.push(stepIndex);
              }
            });
          }
        },
        
        // Set validation status
        setStepValidationStatus: (stepId, status) => {
          set((state) => {
            state.stepMeta[stepId].validationStatus = status;
          });
        },
        
        // Set completion status
        setStepCompletionStatus: (stepId, status) => {
          set((state) => {
            state.stepMeta[stepId].completionStatus = status;
          });
        },
        
        // Can go to step
        canGoToStep: (stepIndex) => {
          const { steps, completedSteps, visitedSteps } = get();
          const step = steps[stepIndex];
          
          if (!step) return false;
          
          // Always allow going to visited steps
          if (visitedSteps.includes(stepIndex)) {
            return true;
          }
          
          // If step is locked, previous steps must be complete
          if (step.locked) {
            for (let i = 0; i < stepIndex; i++) {
              if (!completedSteps.includes(i)) {
                return false;
              }
            }
          }
          
          return true;
        },
        
        // Is step complete
        isStepComplete: (stepIndex) => {
          return get().completedSteps.includes(stepIndex);
        },
        
        // Is step valid
        isStepValid: (stepIndex) => {
          const { steps } = get();
          const step = steps[stepIndex];
          return step ? get().stepMeta[step.id]?.validationStatus === 'valid' : false;
        },
        
        // Get progress
        getProgress: () => {
          const { currentStep, steps } = get();
          return {
            current: currentStep + 1,
            total: steps.length,
            percentage: ((currentStep + 1) / steps.length) * 100,
          };
        },
        
        // Get visible steps (considering conditions)
        getVisibleSteps: () => {
          const { steps, formData, isStepVisible } = get();
          return steps.filter(step => isStepVisible(step.id));
        },
        
        // Check if step is visible
        isStepVisible: (stepId) => {
          const { steps, formData } = get();
          const step = steps.find(s => s.id === stepId);
          
          if (!step || !step.condition || step.condition.length === 0) {
            return true; // No conditions, always visible
          }
          
          // Evaluate conditions
          // TODO: Implement condition evaluation logic
          return true;
        },
      })),
      {
        name: 'form-wizard-storage',
        partialize: (state) => ({
          wizardId: state.wizardId,
          formData: state.formData,
          stepData: state.stepData,
          currentStep: state.currentStep,
          visitedSteps: state.visitedSteps,
          completedSteps: state.completedSteps,
        }),
      }
    ),
    {
      name: 'FormWizardStore',
    }
  )
);

// Convenience selectors
export const useCurrentStep = () => useFormWizardStore((state) => state.currentStep);
export const useFormWizardData = () => useFormWizardStore((state) => state.formData);
export const useWizardProgress = () => useFormWizardStore((state) => state.getProgress());
export const useStepMeta = (stepId: string) => useFormWizardStore((state) => state.stepMeta[stepId]);
```

---

## 🎨 **UI Components**

### 1. Progress Indicators

#### **Progress Bar**
```typescript
// src/components/form-generation/wizard/ProgressBar.tsx
export function ProgressBar({ current, total }: { current: number, total: number }) {
  const percentage = (current / total) * 100;
  
  return (
    <div className="w-full space-y-2">
      <div className="flex justify-between text-sm text-muted-foreground">
        <span>Step {current} of {total}</span>
        <span>{Math.round(percentage)}% Complete</span>
      </div>
      <Progress value={percentage} className="h-2" />
    </div>
  );
}
```

#### **Dots Indicator**
```typescript
// src/components/form-generation/wizard/DotsIndicator.tsx
export function DotsIndicator({ steps, currentStep, onStepClick }: Props) {
  return (
    <div className="flex items-center justify-center gap-2">
      {steps.map((step, index) => {
        const status = getStepStatus(index, currentStep);
        
        return (
          <button
            key={step.id}
            onClick={() => onStepClick?.(index)}
            className={cn(
              "h-3 w-3 rounded-full transition-all",
              status === 'complete' && "bg-primary",
              status === 'current' && "bg-primary scale-125",
              status === 'pending' && "bg-muted",
              status === 'locked' && "bg-muted/50 cursor-not-allowed"
            )}
            disabled={status === 'locked'}
            aria-label={`Step ${index + 1}: ${step.title}`}
          />
        );
      })}
    </div>
  );
}
```

#### **Numbered Stepper** (Material Design)
```typescript
// src/components/form-generation/wizard/NumberedStepper.tsx
export function NumberedStepper({ steps, currentStep, completedSteps }: Props) {
  return (
    <div className="flex items-center">
      {steps.map((step, index) => (
        <React.Fragment key={step.id}>
          <StepNumber
            number={index + 1}
            title={step.title}
            status={getStepStatus(index, currentStep, completedSteps)}
          />
          {index < steps.length - 1 && <StepConnector />}
        </React.Fragment>
      ))}
    </div>
  );
}

function StepNumber({ number, title, status }: StepNumberProps) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className={cn(
          "flex h-10 w-10 items-center justify-center rounded-full border-2 font-semibold",
          status === 'complete' && "bg-primary border-primary text-primary-foreground",
          status === 'current' && "border-primary text-primary",
          status === 'pending' && "border-muted text-muted-foreground"
        )}
      >
        {status === 'complete' ? <Check className="h-5 w-5" /> : number}
      </div>
      <span className="text-xs text-center max-w-20">{title}</span>
    </div>
  );
}
```

#### **Sidebar Navigation**
```typescript
// src/components/form-generation/wizard/SidebarNav.tsx
export function SidebarNav({ steps, currentStep, onStepClick }: Props) {
  return (
    <nav className="space-y-1">
      {steps.map((step, index) => (
        <button
          key={step.id}
          onClick={() => onStepClick(index)}
          className={cn(
            "w-full text-left px-4 py-3 rounded-lg transition-colors",
            index === currentStep && "bg-primary text-primary-foreground",
            index !== currentStep && "hover:bg-accent"
          )}
        >
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0">
              {step.icon}
            </div>
            <div className="flex-1">
              <div className="font-medium">{step.title}</div>
              {step.description && (
                <div className="text-sm opacity-70">{step.description}</div>
              )}
            </div>
            {completedSteps.includes(index) && (
              <Check className="h-5 w-5 flex-shrink-0" />
            )}
          </div>
        </button>
      ))}
    </nav>
  );
}
```

---

### 2. Main Wizard Components

#### **StepWizard.tsx** - Container
```typescript
export function StepWizard({ config, onComplete }: StepWizardProps) {
  const store = useFormWizardStore();
  const { currentStep, steps, initWizard } = store;
  
  useEffect(() => {
    if (config.steps) {
      initWizard(config.id || 'wizard', config.steps, config.initialData);
    }
  }, [config.steps]);
  
  const currentStepConfig = steps[currentStep];
  
  return (
    <div className="space-y-6">
      {/* Progress */}
      <WizardProgress 
        type={config.navigation?.progressType || 'bar'}
        {...store.getProgress()}
      />
      
      {/* Step Content */}
      <StepContent
        step={currentStepConfig}
        stepIndex={currentStep}
      />
      
      {/* Navigation */}
      <WizardNavigation
        config={config.navigation}
        onComplete={onComplete}
      />
    </div>
  );
}
```

---

## ✨ **Advanced Features**

### 1. **Auto-Save Draft**
```typescript
useEffect(() => {
  if (config.autoSave?.enabled) {
    const interval = setInterval(() => {
      const data = store.getAllData();
      localStorage.setItem(
        config.autoSave.storageKey || 'wizard-draft',
        JSON.stringify(data)
      );
    }, config.autoSave.interval || 30000); // 30s default
    
    return () => clearInterval(interval);
  }
}, [config.autoSave]);
```

### 2. **Review Step** (Summary)
```typescript
// Special last step showing all data
{
  id: 'review',
  title: 'Review Your Information',
  fields: [],
  isReviewStep: true,
}

// Component renders summary of all previous steps
```

### 3. **Conditional Step Visibility**
```typescript
// Skip step if condition not met
const visibleSteps = store.getVisibleSteps();
```

### 4. **Step Locking**
```typescript
// Prevent skipping ahead
{
  id: 'payment',
  title: 'Payment',
  locked: true, // Cannot access until previous steps complete
}
```

### 5. **Async Step Validation**
```typescript
validation: {
  customValidator: async (stepData, allData) => {
    const response = await validateWithAPI(stepData);
    return response.valid || response.errorMessage;
  }
}
```

---

## 📋 **Implementation Phases**

### **Phase P5.1: Foundation** (Week 1)
- [ ] Add types to [types.ts](file:///Users/trung.ngo/Documents/projects/dop-fe/src/components/form-generation/types.ts)
- [ ] Create `use-form-wizard-store.ts`
- [ ] Basic StepWizard component
- [ ] Progress Bar indicator
- [ ] Step navigation (Next/Back)

### **Phase P5.2: Validation** (Week 1)
- [ ] Step-level validation
- [ ] Integration with ValidationEngine
- [ ] Error display per step
- [ ] Async validation support

### **Phase P5.3: Progress Indicators** (Week 2)
- [ ] Dots indicator
- [ ] Numbered stepper
- [ ] Sidebar navigation
- [ ] Tab-style navigation

### **Phase P5.4: Advanced Features** (Week 2)
- [ ] Conditional steps
- [ ] Step locking
- [ ] Auto-save drafts
- [ ] Review step
- [ ] URL sync (optional)

### **Phase P5.5: Testing & Polish** (Week 3)
- [ ] Unit tests
- [ ] Integration tests
- [ ] Visual testing
- [ ] Docs & examples

---

## 🧪 **Testing Strategy**

```typescript
// Zustand store testing
describe('FormWizardStore', () => {
  it('should initialize wizard', () => {
    const store = useFormWizardStore.getState();
    store.initWizard('test', mockSteps);
    expect(store.steps).toEqual(mockSteps);
  });
  
  it('should navigate to next step after validation', async () => {
    const store = useFormWizardStore.getState();
    const success = await store.nextStep();
    expect(success).toBe(true);
    expect(store.currentStep).toBe(1);
  });
});
```

---

## 📚 **Usage Examples**

### Example 1: Simple 3-Step Form
```typescript
const config: FormConfig = {
  id: 'onboarding',
  steps: [
    {
      id: 'personal',
      title: 'Personal Info',
      fields: [/* fields */],
    },
    {
      id: 'contact',
      title: 'Contact Details',
      fields: [/* fields */],
    },
    {
      id: 'preferences',
      title: 'Preferences',
      fields: [/* fields */],
      optional: true,
    },
  ],
  navigation: {
    progressType: 'dots',
    showStepTitles: true,
  },
};

<StepWizard config={config} onComplete={handleSubmit} />
```

---

## ⚠️ **Potential Concerns & Solutions**

| Concern | Solution |
|---------|----------|
| **State persistence across refreshes** | Use Zustand persist middleware |
| **Performance with many steps** | Lazy load step fields, virtualize |
| **Form abandonment** | Auto-save drafts, send reminder emails |
| **Mobile UX** | Swipe gestures, sticky progress |
| **SEO** | Server-side render first step, use Next.js |

---

## 🎯 **Success Metrics**

- ✅ Multi-step forms render from API config
- ✅ Step-by-step validation works
- ✅ All 6 indicator types implemented
- ✅ Auto-save prevents data loss
- ✅ Conditional steps work
- ✅ 95%+ test coverage

---

**Ready for approval to proceed with P5.1 implementation?**
