# DOP-FE Data Models and Structures

## Core Data Models

### Type Definitions Overview
- **Primary Types Directory**: `src/types/` với 5 file chính: `component-props.d.ts`, `admin.ts`, `data-driven-ui.d.ts`, `field-conditions.ts`, `multi-step-form.d.ts`
- **Type Organization**: Types được tổ chức theo chức năng:
  - Component props: UI component type definitions
  - Admin: Admin-specific types cho flow management
  - Data-driven UI: Core types cho dynamic form system
  - Field conditions: Conditional logic types
  - Multi-step form: Form workflow types
- **Naming Conventions**: 
  - Interface names sử dụng PascalCase với descriptive names
  - Type aliases sử dụng PascalCase cho complex types
  - Enum values sử dụng snake_case cho API compatibility

### Component Props Types
- **Component Props Interface**: [`BaseComponentProps`](src/types/component-props.d.ts:9) là base interface chung với các properties cơ bản như `labelKey`, `placeholderKey`, `validations`, `disabled`
- **Generic Types**: [`ComponentPropsMap`](src/types/component-props.d.ts:215) mapping component names đến props types của chúng
- **Prop Validation**: Props được validated qua TypeScript strict mode và Zod schema generation

### Domain-Specific Types
- **Flow Types**: [`FlowDetail`](src/types/admin.ts:55), [`StepDetail`](src/types/admin.ts:65), [`FieldListItem`](src/types/admin.ts:40) với status management
- **User Types**: [`User`](src/store/use-auth-store.ts:4) interface với role-based access control
- **Form Types**: [`FieldConfig`](src/types/data-driven-ui.d.ts:64), [`StepConfig`](src/types/data-driven-ui.d.ts:84) cho dynamic form generation

## State Management Structure

### Zustand Store Architecture
- **Store Organization**: Hai main stores:
  - [`useAdminFlowStore`](src/store/use-admin-flow-store.ts:75): Admin flow management với pending changes tracking
  - [`useAuthStore`](src/store/use-auth-store.ts:29): Authentication state với persistence
- **State Shapes**: 
  - Admin store: currentFlow, currentStep, pendingFlowChanges, pendingStepChanges
  - Auth store: user, isAuthenticated, isLoading, isHydrated
- **Actions and Selectors**: Granular actions cho từng entity (flow, step, field) với optimized selectors

### Type Safety in State Management
- **Typed State**: Full TypeScript integration với generic types
- **Action Types**: Actions được strongly typed với parameter validation
- **Selector Return Types**: Custom selectors như [`useCurrentFlow`](src/store/use-admin-flow-store.ts:485), [`useIsEditing`](src/store/use-admin-flow-store.ts:487) với memoization

### DevTools Integration
- **DevTools Configuration**: Zustand devtools với store names "AdminFlowStore" và "auth-storage"
- **State Serialization**: JSON storage với partialize function cho auth store để exclude sensitive data

## Form Data Models

### Form Configuration Types
- **Field Configuration**: [`RawFieldConfig`](src/types/data-driven-ui.d.ts:104) và [`FieldConfig`](src/types/data-driven-ui.d.ts:64) với component mapping
- **Validation Types**: [`ValidationRule`](src/types/data-driven-ui.d.ts:12) với type, value, và messageKey
- **Form State Types**: [`MultiStepFormState`](src/types/multi-step-form.d.ts:76) với currentStep, formData, stepValidation

### Multi-step Form Data
- **Step Data Structure**: [`StepConfig`](src/types/multi-step-form.d.ts:9) với id, title, fields, stepValidation
- **Progress Tracking**: [`MultiStepFormState`](src/hooks/form/use-multi-step-form.ts:37) với completedSteps Set và progress calculation
- **Data Persistence**: LocalStorage integration với sensitive data filtering cho eKYC fields

### Zod Schema Integration
- **Schema Types**: Dynamic schema generation từ [`generateZodSchema`](src/lib/builders/zod-generator.ts:12) function
- **Inferred Types**: Type inference từ Zod schemas cho form validation
- **Validation Result Types**: [`validateFieldValue`](src/lib/builders/zod-generator.ts:257) với success/error handling

## API Payloads

### Request/Response Formats
- **API Client Types**: Auto-generated từ OpenAPI spec trong [`v1.d.ts`](src/lib/api/v1.d.ts:1)
- **Request Payloads**: [`SubmitLeadInfoRequestBody`](src/lib/api/v1.d.ts:174), [`CreateLeadRequestBody`](src/lib/api/v1.d.ts:200) với typed fields
- **Response Types**: [`FlowDetail`](src/lib/api/v1.d.ts:143), [`CreateLeadResponseBody`](src/lib/api/v1.d.ts:207) với proper typing

### Error Response Types
- **Error Structure**: [`AdminApiError`](src/lib/api/admin-types.d.ts:124) với code, message, details
- **Error Code Types**: HTTP status codes với specific error types
- **Error Handling Types**: Global error handling trong API client với toast notifications

### Data Transformation Types
- **Mapper Types**: [`mapFormToApi`](src/mappers/onboardingMapper.ts:14) và [`mapApiFlowToFlow`](src/mappers/flowMapper.ts:114) functions
- **Transformation Functions**: Enum mapping cho gender, havingLoan, careerStatus, creditStatus
- **Conversion Utilities**: Date formatting, type conversion cho API compatibility

## Data Relationships

### Model Relationships
- **One-to-Many Relationships**: Flow → Steps → Fields hierarchy với proper parent-child relationships
- **Many-to-Many Relationships**: Field validation rules với multiple conditions
- **Hierarchical Data**: Multi-step form structure với nested step configurations

### Foreign Keys and References
- **Reference Types**: UUID-based references cho flow_id, step_id, field_id
- **Key Constraints**: Proper typing cho foreign keys với UUID format validation
- **Cascade Operations**: Step deletion triggers field cleanup trong admin store

### Data Flow Between Components
- **Prop Drilling Patterns**: Minimal prop drilling với context providers và custom hooks
- **Context Usage**: React context cho theme và authentication
- **Event Data Flow**: Event-driven updates qua Zustand store actions

## Type Inheritance and Composition

### Interface Extension
- **Base Interfaces**: [`BaseComponentProps`](src/types/component-props.d.ts:9) sebagai foundation cho tất cả component props
- **Extension Patterns**: Component-specific interfaces extend base props với additional properties
- **Mixin Patterns**: Validation rules composition qua arrays và conditional logic

### Generic Type Usage
- **Generic Components**: [`TypedFieldConfig`](src/types/component-props.d.ts:245) với generic component type parameter
- **Utility Types**: Custom utility types cho field mapping và data transformation
- **Type Constraints**: Proper constraints cho generic functions với extends keyword

## Key Observations

### Type Safety Strengths
- **Comprehensive Type Coverage**: Hầu hết entities được properly typed với strict TypeScript
- **Generic Type Safety**: Strong generic typing cho reusable components và functions
- **API Type Generation**: Auto-generated types từ OpenAPI spec đảm bảo consistency

### Data Consistency Patterns
- **Centralized Type Definitions**: All types centralized trong `src/types/` directory
- **Mapper Pattern**: Consistent data transformation qua dedicated mapper functions
- **Validation Integration**: Zod schema generation đảm bảo runtime type safety

### Potential Type-Related Improvements
- **Enum Consolidation**: Some enums duplicated giữa API types và frontend types
- **Validation Rule Types**: Could benefit từ more specific validation rule types
- **Error Type Standardization**: Error handling could be more standardized across different APIs

### Architecture Strengths
- **Separation of Concerns**: Clear separation giữa UI types, business logic types, và API types
- **Type-Driven Development**: Strong emphasis trên type safety driving development process
- **Scalable Type System**: Type system designed để scale với complex form requirements

### Data Flow Patterns
- **Unidirectional Data Flow**: Clear data flow từ API → mappers → stores → components
- **Immutable Updates**: State updates qua immutable patterns trong Zustand stores
- **Reactive Updates**: Reactive updates qua proper state management patterns

## Related Documentation
- **[Project Architecture Overview](project-architecture-overview.md)** - Architecture patterns and design decisions
- **[Dependencies and Integrations](dependencies-and-integrations.md)** - External integrations and data flow
- **[Application Pages and Components](../src/docs/application-pages-and-components.tsx)** - Component hierarchy and structure
- **[API Documentation](api-documentation.md)** - Complete API reference
- **[Business Flows and Processes](business-flows-and-processes.md)** - User journeys and process flows