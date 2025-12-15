# Form Generation Library

A comprehensive, type-safe library for generating dynamic forms from backend configuration with full UI control.

## Features

✅ **Type-Safe**: Complete TypeScript support with strict typing  
✅ **Component Registry**: Easily register custom field components  
✅ **Factory Pattern**: Dynamic component rendering based on configuration  
✅ **Layout Control**: Grid, Flex, Stack, and Inline layouts  
✅ **Conditional Logic**: Show/hide/enable/disable fields based on conditions  
✅ **Validation Engine**: Built-in and custom validators with async support  
✅ **i18n Integration**: Works seamlessly with next-intl  
✅ **TailwindCSS**: Styled with Tailwind + class-variance-authority  
✅ **Self-Contained**: All code in this folder, no external dependencies (except UI libraries)

## Quick Start

### 1. Basic Usage

```typescript
import { DynamicForm, FormConfigMapper } from '@/components/form-generation';

// Transform API response to form config
const formConfig = FormConfigMapper.mapApiToFormConfig(apiResponse);

// Render form
<DynamicForm
  config={formConfig}
  onSubmit={(data) => {
    console.log('Form data:', data);
  }}
/>
```

### 2. Custom Field Component

```typescript
import { registerComponent, type FieldComponentProps } from '@/components/form-generation';

function CurrencyInput({ field, value, onChange, error }: FieldComponentProps<number>) {
  return (
    <input
      type="text"
      value={formatCurrency(value)}
      onChange={(e) => onChange(parseCurrency(e.target.value))}
    />
  );
}

// Register component
registerComponent('currency', CurrencyInput);
```

### 3. API Response Format

```json
{
  "fields": [
    {
      "id": "email",
      "name": "email",
      "type": "email",
      "label": "Email Address",
      "placeholder": "Enter your email",
      "validation": [
        { "type": "required", "message": "Email is required" },
        { "type": "email", "message": "Invalid email format" }
      ]
    }
  ],
  "i18n": {
    "namespace": "contact"
  }
}
```

## Architecture

```
form-generation/
├── types.ts                    # Type definitions
├── index.ts                    # Public API
├── DynamicForm.tsx            # Main form component
├── components/
│   └── FieldWrapper.tsx       # Common field wrapper
├── factory/
│   └── FieldFactory.tsx       # Component factory
├── fields/
│   ├── TextField.tsx
│   ├── TextAreaField.tsx
│   ├── NumberField.tsx
│   ├── SelectField.tsx
│   ├── CheckboxField.tsx
│   └── RadioField.tsx
├── layouts/
│   ├── LayoutEngine.tsx       # Grid/Flex/Stack layouts
│   └── FormSection.tsx        # Section grouping
├── mappers/
│   └── FormConfigMapper.ts    # API → Config transformation
├── registry/
│   └── ComponentRegistry.ts   # Component registry
├── validation/
│   └── ValidationEngine.ts    # Validation system
├── i18n/
│   └── useFormTranslations.ts # Translation utilities
├── utils/
│   └── helpers.ts             # Utility functions
└── styles/
    └── variants.ts            # TailwindCSS variants
```

## Documentation

- **[Custom Components Guide](path/to/custom_components_guide.md)** - How to create and register custom field components
- **[Implementation Plan](path/to/implementation_plan.md)** - Detailed architecture and implementation details

## Supported Field Types

### Text Inputs
- `text`, `email`, `password`, `url`, `tel`
- `textarea`
- `rich-text`

### Numeric
- `number`
- `currency`

### Selection
- `select` (single/multi)
- `radio`
- `checkbox` (single/group)
- `switch`

### Date/Time
- `date`, `datetime`, `time`
- `date-range`

### File
- `file`, `file-upload`, `image-upload`

### Advanced
- `slider`, `rating`, `color`
- `custom` (your own components)

## License

MIT
