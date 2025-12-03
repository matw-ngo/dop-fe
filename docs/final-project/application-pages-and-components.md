# Application Pages and Components

## Table of Contents
- [Overview](#overview)
- [I. Application Pages Structure](#i-application-pages-structure)
  - [1. App Router Architecture](#1-app-router-architecture)
  - [2. Internationalization Support](#2-internationalization-support)
  - [3. Page Hierarchy](#3-page-hierarchy)
  - [4. Page Implementation Patterns](#4-page-implementation-patterns)
- [II. Component Architecture](#ii-component-architecture)
  - [1. Component Categories](#1-component-categories)
  - [2. shadcn/ui Components](#2-shadcnui-components)
  - [3. Custom Components](#3-custom-components)
  - [4. Component Registry System](#4-component-registry-system)
- [III. Data-Driven UI System](#iii-data-driven-ui-system)
  - [1. Form Renderer](#1-form-renderer)
  - [2. Multi-Step Form Renderer](#2-multi-step-form-renderer)
  - [3. Field Renderer](#3-field-renderer)
  - [4. Component Registry](#4-component-registry)
- [IV. Storybook Integration](#iv-storybook-integration)
  - [1. Storybook Setup](#1-storybook-setup)
  - [2. Component Documentation](#2-component-documentation)
  - [3. Interactive Examples](#3-interactive-examples)
- [V. Component Usage Examples](#v-component-usage-examples)
  - [1. UI Component Usage](#1-ui-component-usage)
  - [2. Custom Component Usage](#2-custom-component-usage)
  - [3. Data-Driven Form Usage](#3-data-driven-form-usage)
- [VI. Cross-references](#vi-cross-references)

## Overview

DOP-FE implements a modern, component-based architecture using Next.js 15.5.4 App Router with internationalization support, shadcn/ui components built on Radix UI primitives, and a sophisticated data-driven UI system. The application structure follows atomic design principles with clear separation between UI components, feature components, and business logic.

The architecture emphasizes:
- **Modular Design**: Reusable components with clear responsibilities
- **Type Safety**: Comprehensive TypeScript with Zod validation
- **Internationalization**: Multi-language support with next-intl
- **Data-Driven UI**: Dynamic form rendering based on configuration
- **Component Documentation**: Storybook integration for component showcase

## I. Application Pages Structure

### 1. App Router Architecture

The application uses Next.js 15.5.4 App Router with a `[locale]` dynamic segment for internationalization:

```
src/app/
├── [locale]/                 # Internationalized routes
│   ├── layout.tsx           # Root layout with providers
│   ├── page.tsx             # Homepage
│   ├── user-onboarding/      # Multi-step onboarding flow
│   ├── admin/               # Admin panel routes
│   │   ├── (protected)/     # Protected route group
│   │   └── login/          # Admin login
│   └── onboarding-success/   # Success page after onboarding
├── globals.css             # Global styles
└── not-found.tsx           # 404 page
```

#### Layout Architecture

The [`layout.tsx`](src/app/[locale]/layout.tsx:31) file provides:

- **Internationalization**: Dynamic locale handling with next-intl
- **Font Management**: Geist Sans and Mono fonts with CSS variables
- **Provider Setup**: Theme, authentication, and state management providers
- **Script Loading**: Analytics and SDK loading strategies
- **Metadata**: SEO and page metadata configuration

### 2. Internationalization Support

The application supports multiple languages through:

- **URL Structure**: `[locale]` dynamic segment (e.g., `/vi/`, `/en/`)
- **Message Files**: JSON translation files in `messages/` directory
- **Static Generation**: `generateStaticParams()` for pre-built locales
- **Component Integration**: `useTranslations()` hook for component-level translations

### 3. Page Hierarchy

| Path | Component | Purpose | Key Features |
|-------|-----------|---------|--------------|
| `/[locale]/` | [`Homepage`](src/app/[locale]/page.tsx:8) | Main landing page | Config-based rendering, company-specific content |
| `/[locale]/user-onboarding` | [`UserOnboardingPage`](src/app/[locale]/user-onboarding/page.tsx:9) | Multi-step onboarding | Form persistence, progress tracking |
| `/[locale]/admin/(protected)` | [`AdminDashboard`](src/app/[locale]/admin/(protected)/page.tsx:23) | Admin interface | Protected routes, role-based access |
| `/[locale]/onboarding-success` | Success page | Completion confirmation | Redirect handling |

### 4. Page Implementation Patterns

#### Homepage Implementation

The homepage uses a configuration-driven approach:

```typescript
// src/app/[locale]/page.tsx
import Homepage from "@/app/pages/homepage";
import { getHomepageConfig } from "@/configs/homepage-config";

const company = "finzone";

export default function Home() {
  const homepageConfig = getHomepageConfig(company);
  return <Homepage config={homepageConfig} />;
}
```

#### User Onboarding Implementation

The onboarding page implements a multi-step form with persistence:

```typescript
// src/app/[locale]/user-onboarding/page.tsx
export default function UserOnboardingPage() {
  const t = useTranslations("pages.userOnboardingPage");
  const resetForm = useOnboardingFormStore((state) => state.resetForm);

  const handleReset = () => {
    localStorage.removeItem("user-onboarding-data");
    resetForm();
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <OnboardingFormContainer />
    </div>
  );
}
```

#### Admin Dashboard Implementation

The admin dashboard uses protected routes with role-based access:

```typescript
// src/app/[locale]/admin/(protected)/page.tsx
export default function AdminDashboard() {
  const { user } = useAuth();
  const getLocalizedPath = useLocalizedPath();
  const t = useTranslations("admin.dashboard");

  // Stats cards, quick actions, and activity feed
  return (
    <div className="space-y-6">
      {/* Dashboard content */}
    </div>
  );
}
```

## II. Component Architecture

### 1. Component Categories

The application follows atomic design principles with these categories:

#### UI Components (shadcn/ui)
- **50+ base components** built on Radix UI primitives
- **Consistent API** with variant management using Class Variance Authority
- **Accessibility** built-in with proper ARIA attributes
- **TypeScript** fully typed with comprehensive prop interfaces

#### Feature Components
- **Business logic** encapsulated in feature-specific components
- **Data-driven** rendering with configuration-based UI
- **Reusable** across different flows and contexts
- **Testable** with clear separation of concerns

#### Homepage Components
- **Configurable** sections driven by configuration objects
- **Responsive** design with mobile-first approach
- **Internationalized** content with dynamic locale support
- **Animated** interactions using Framer Motion

#### Admin Components
- **Flow management** with optimistic updates
- **Data tables** with sorting and filtering
- **Form builders** with drag-and-drop interface
- **Error boundaries** with retry mechanisms

#### eKYC Components
- **SDK integration** with VNPT eKYC system
- **Dynamic loading** with error boundaries
- **Event handling** for verification lifecycle
- **Data mapping** to form fields

### 2. shadcn/ui Components

#### Button Component

The [`Button`](src/components/ui/button.tsx:39) component provides:

- **Multiple variants**: default, destructive, outline, secondary, ghost, link
- **Size options**: default, sm, lg, icon, icon-sm, icon-lg
- **Accessibility**: proper ARIA attributes and keyboard navigation
- **Composition**: supports `asChild` for custom rendering

```typescript
// Usage examples
<Button>Default Button</Button>
<Button variant="destructive">Delete</Button>
<Button size="sm">Small Button</Button>
<Button asChild>
  <Link href="/admin">Admin Link</Link>
</Button>
```

#### Card Component

The [`Card`](src/components/ui/card.tsx:5) component provides:

- **Structured sections**: Header, Content, Footer, Action
- **Responsive design**: mobile-first with container queries
- **Accessibility**: proper semantic HTML structure
- **Customization**: className support for styling overrides

```typescript
// Usage examples
<Card>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
    <CardDescription>Card Description</CardDescription>
  </CardHeader>
  <CardContent>
    <p>Card content goes here</p>
  </CardContent>
  <CardFooter>
    <Button>Action</Button>
  </CardFooter>
</Card>
```

### 3. Custom Components

#### Homepage Hero Component

The [`Hero`](src/components/organisms/homepage/hero.tsx:11) component provides:

- **Configurable content**: headings, subheadings, decorative icons
- **Highlight system**: styled text highlights within subheadings
- **Background themes**: gradient backgrounds with CSS classes
- **Responsive design**: mobile-first responsive layout

```typescript
// Configuration interface
interface HeroConfig {
  id: string;
  decorativeIcons: string[];
  heading: string;
  subheading: {
    text: string;
    highlights: Array<{
      text: string;
      className?: string;
    }>;
  };
  background: {
    className: string;
  };
}

// Usage example
<Hero config={heroConfig} company="finzone" />
```

#### eKYC Dialog Component

The [`EkycDialog`](src/components/ekyc/ekyc-dialog.tsx:31) component provides:

- **Dynamic SDK loading**: avoids SSR issues with dynamic imports
- **Flow configuration**: DOCUMENT_TO_FACE, FACE_TO_DOCUMENT, FACE, DOCUMENT
- **Event handling**: completion, error, and cleanup events
- **Responsive design**: full-screen on mobile, dialog on desktop

```typescript
// Usage example
<EkycDialog
  open={isOpen}
  onOpenChange={setIsOpen}
  onSuccess={handleEkycSuccess}
  onError={handleEkycError}
  flowType="DOCUMENT_TO_FACE"
  language="vi"
/>
```

### 4. Component Registry System

The application implements a component registry for dynamic rendering:

#### Registry Implementation

The [`ComponentRegistry`](src/components/renderer/ComponentRegistry.ts:27) maps string names to components:

```typescript
export const ComponentRegistry = {
  // Basic form inputs
  Input,
  Textarea,
  Checkbox,
  Switch,
  Slider,

  // Wrapper components for complex UI
  Select: CustomSelect,
  RadioGroup: CustomRadioGroup,
  DatePicker: CustomDatePicker,
  DateRangePicker: CustomDateRangePicker,
  ToggleGroup: CustomToggleGroup,
  InputOTP: CustomInputOTP,
  Ekyc: CustomEkyc,
  Confirmation: CustomConfirmation,

  // Display components
  Label,
  Progress,
  Badge,
  Separator,

  // Action components
  Button,
} as const;
```

#### Type Safety

The registry provides type-safe component selection:

```typescript
export type RegisteredComponent = keyof typeof ComponentRegistry;

export function isRegisteredComponent(
  componentName: string,
): componentName is RegisteredComponent {
  return componentName in ComponentRegistry;
}
```

## III. Data-Driven UI System

### 1. Form Renderer

The [`FormRenderer`](src/components/renderer/FormRenderer.tsx:52) component provides:

- **Dynamic field rendering** based on configuration
- **Conditional field visibility** with complex logic support
- **Async options loading** for select components
- **Validation integration** with Zod schemas
- **Internationalization** support with namespace handling

#### Key Features

- **Field Configuration**: Supports all registered components
- **Validation**: Real-time validation with custom rules
- **Conditional Logic**: Complex field visibility conditions
- **Async Options**: Dynamic option loading with caching
- **Error Handling**: Comprehensive error boundaries

#### Usage Example

```typescript
const formConfig = {
  fields: [
    {
      fieldName: "fullName",
      component: "Input",
      props: {
        labelKey: "fullName.label",
        placeholderKey: "fullName.placeholder",
        validations: [
          { type: "required", messageKey: "fullName.required" }
        ]
      }
    },
    {
      fieldName: "province",
      component: "Select",
      props: {
        labelKey: "province.label",
        optionsFetcher: {
          fetcher: fetchProvinces,
          transform: transformProvinces,
          cacheKey: "provinces"
        }
      }
    }
  ]
};

<FormRenderer
  fields={formConfig.fields}
  onSubmit={handleSubmit}
  translationNamespace="userForm"
/>
```

### 2. Multi-Step Form Renderer

The [`MultiStepFormRenderer`](src/components/renderer/MultiStepFormRenderer.tsx:30) component provides:

- **Step-by-step navigation** with progress tracking
- **Data persistence** across page refreshes
- **Conditional branching** based on user input
- **Progress indicators** with multiple styles
- **Custom navigation** and progress rendering

#### Progress Styles

- **Steps**: Visual step indicators with completion status
- **Bar**: Linear progress bar with percentage
- **Dots**: Simple dot indicators for minimal UI

#### Usage Example

```typescript
const multiStepConfig = {
  steps: [
    {
      id: "personal-info",
      title: "Personal Information",
      fields: [
        { fieldName: "fullName", component: "Input", props: { required: true } },
        { fieldName: "email", component: "Input", props: { type: "email" } }
      ]
    },
    {
      id: "financial-info",
      title: "Financial Information",
      fields: [
        { fieldName: "income", component: "Slider", props: { min: 0, max: 100000000 } },
        { fieldName: "employment", component: "RadioGroup", props: { options: employmentTypes } }
      ]
    }
  ],
  showProgress: true,
  progressStyle: "steps",
  persistData: true
};

<MultiStepFormRenderer
  config={multiStepConfig}
  translationNamespace="onboarding"
/>
```

### 3. Field Renderer

The [`FieldRenderer`](src/components/renderer/FieldRenderer.tsx:1) component provides:

- **Component mapping** from registry to actual components
- **Props transformation** with default merging
- **Validation integration** with error display
- **Accessibility** support with proper labeling

#### Field Types

- **Input Components**: Text, email, password, number inputs
- **Selection Components**: Select, radio groups, checkboxes
- **Date Components**: Date picker, date range picker
- **Specialized Components**: eKYC, OTP input, confirmation

### 4. Component Registry

The registry system enables:

- **Dynamic rendering** based on backend configuration
- **Type safety** with TypeScript interfaces
- **Component validation** with runtime checks
- **Extensibility** for new component types

## IV. Storybook Integration

### 1. Storybook Setup

The application uses Storybook 8.6.14 for component documentation:

- **Development Server**: `npm run storybook` (port 6006)
- **Build**: `npm run build-storybook` for static documentation
- **Configuration**: `.storybook/main.ts` with Next.js integration
- **Addons**: Essentials, a11y, docs, interactions

### 2. Component Documentation

#### Button Stories

The [`Button.stories.tsx`](src/components/ui/button.stories.tsx:6) provides:

- **Variant examples**: All button variants with controls
- **Size examples**: Different size options
- **State examples**: Loading, disabled, hover states
- **Interactive controls**: Real-time prop manipulation

```typescript
// Story example
export const Primary: Story = {
  args: {
    variant: "default",
    children: "Primary Button",
  },
};

export const Loading: Story = {
  args: {
    disabled: true,
    children: (
      <>
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Please wait
      </>
    ),
  },
};
```

#### Card Stories

The [`Card.stories.tsx`](src/components/ui/card.stories.tsx:14) provides:

- **Basic example**: Simple card with header and content
- **Full example**: Complete card with form elements
- **Layout examples**: Different card arrangements
- **Responsive examples**: Mobile-first responsive design

#### Hero Stories

The [`Hero.stories.tsx`](src/components/organisms/homepage/hero.stories.tsx:5) provides:

- **Company configurations**: Different company themes
- **Minimal examples**: Simple hero configurations
- **Theme examples**: Dark, light, gradient themes
- **Context examples**: Hero within page layouts

### 3. Interactive Examples

Storybook provides:

- **Prop controls**: Real-time component customization
- **Action logging**: Event handling visualization
- **Accessibility testing**: Built-in a11y addon
- **Responsive testing**: Mobile and desktop viewports

## V. Component Usage Examples

### 1. UI Component Usage

#### Form Components

```typescript
// Form with validation
import { Form, FormField, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const MyForm = () => {
  return (
    <Form>
      <FormField name="email">
        <FormLabel>Email</FormLabel>
        <FormControl>
          <Input type="email" placeholder="Enter your email" />
        </FormControl>
        <FormMessage />
      </FormField>
      <Button type="submit">Submit</Button>
    </Form>
  );
};
```

#### Navigation Components

```typescript
// Navigation with active state
import { NavigationMenu, NavigationMenuItem, NavigationMenuLink } from "@/components/ui/navigation-menu";

const MyNavigation = () => {
  return (
    <NavigationMenu>
      <NavigationMenuItem>
        <NavigationMenuLink href="/home">Home</NavigationMenuLink>
      </NavigationMenuItem>
      <NavigationMenuItem>
        <NavigationMenuLink href="/about">About</NavigationMenuLink>
      </NavigationMenuItem>
    </NavigationMenu>
  );
};
```

### 2. Custom Component Usage

#### Homepage Configuration

```typescript
// Homepage with custom configuration
import { getHomepageConfig } from "@/configs/homepage-config";
import Homepage from "@/app/pages/homepage";

const MyHomepage = () => {
  const config = getHomepageConfig("my-company");
  return <Homepage config={config} />;
};
```

#### eKYC Integration

```typescript
// eKYC dialog with custom handling
import { EkycDialog } from "@/components/ekyc/ekyc-dialog";

const MyForm = () => {
  const [isOpen, setIsOpen] = useState(false);

  const handleEkycSuccess = (result) => {
    console.log("eKYC completed:", result);
    // Process verification result
  };

  return (
    <div>
      <Button onClick={() => setIsOpen(true)}>
        Start Verification
      </Button>
      <EkycDialog
        open={isOpen}
        onOpenChange={setIsOpen}
        onSuccess={handleEkycSuccess}
        flowType="DOCUMENT_TO_FACE"
      />
    </div>
  );
};
```

### 3. Data-Driven Form Usage

#### Dynamic Form Configuration

```typescript
// Form with dynamic fields
import { FormRenderer } from "@/components/renderer/FormRenderer";

const MyDynamicForm = () => {
  const formConfig = {
    fields: [
      {
        fieldName: "firstName",
        component: "Input",
        props: {
          labelKey: "firstName.label",
          validations: [{ type: "required", messageKey: "firstName.required" }]
        }
      },
      {
        fieldName: "country",
        component: "Select",
        props: {
          labelKey: "country.label",
          optionsFetcher: {
            fetcher: fetchCountries,
            transform: transformCountries,
            cacheKey: "countries"
          }
        }
      }
    ]
  };

  const handleSubmit = async (data) => {
    console.log("Form submitted:", data);
    // Process form data
  };

  return (
    <FormRenderer
      fields={formConfig.fields}
      onSubmit={handleSubmit}
      translationNamespace="myForm"
    />
  );
};
```

#### Multi-Step Form Configuration

```typescript
// Multi-step form with conditional logic
import { MultiStepFormRenderer } from "@/components/renderer/MultiStepFormRenderer";

const MyMultiStepForm = () => {
  const formConfig = {
    steps: [
      {
        id: "personal",
        title: "Personal Information",
        fields: [
          { fieldName: "name", component: "Input", props: { required: true } },
          { fieldName: "email", component: "Input", props: { type: "email" } }
        ]
      },
      {
        id: "verification",
        title: "Identity Verification",
        fields: [
          { fieldName: "ekyc", component: "Ekyc", props: { required: true } }
        ],
        condition: {
          field: "email",
          operator: "exists",
          value: true
        }
      }
    ],
    showProgress: true,
    progressStyle: "steps"
  };

  return (
    <MultiStepFormRenderer
      config={formConfig}
      translationNamespace="onboarding"
    />
  );
};
```

## VI. Cross-references

### Related Documentation

- **[Project Architecture Overview](project-architecture-overview.md)** - Complete system architecture and technology stack
- **[Business Flows and Processes](business-flows-and-processes.md)** - Detailed flow-based system implementation
- **[Data Models and Structures](data-models-and-structures.md)** - Type definitions and data architecture
- **[Configuration and Environment Setup](configuration-and-environment-setup.md)** - Development environment configuration
- **[Consolidated Dependencies and Integrations](consolidated-dependencies-and-integrations.md)** - Complete technology stack analysis
- **[Content Mapping Matrix](content-mapping-matrix.md)** - Migration mapping from old to new project

### Implementation Resources

- **[shadcn/ui Documentation](https://ui.shadcn.com/)** - Component library documentation
- **[Next.js App Router Documentation](https://nextjs.org/docs/app)** - Routing and layout patterns
- **[React Hook Form Documentation](https://react-hook-form.com/)** - Form management and validation
- **[Zod Documentation](https://zod.dev/)** - Schema validation and type safety
- **[Storybook Documentation](https://storybook.js.org/)** - Component documentation and testing

### Technical References

- **[Component Registry](src/components/renderer/ComponentRegistry.ts:27)** - Dynamic component mapping
- **[Form Renderer](src/components/renderer/FormRenderer.tsx:52)** - Data-driven form rendering
- **[Multi-Step Form Renderer](src/components/renderer/MultiStepFormRenderer.tsx:30)** - Multi-step form system
- **[Homepage Configuration](src/configs/homepage-config.ts:133)** - Configuration-driven homepage
- **[Type Definitions](src/types/data-driven-ui.d.ts:64)** - TypeScript interfaces for data-driven UI

This architecture provides a solid foundation for building a modern, scalable financial platform with excellent user experience, developer productivity, and business agility. The component-based approach enables rapid development while maintaining consistency and type safety throughout the application.