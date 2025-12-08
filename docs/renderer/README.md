# Renderer System Documentation

Complete documentation for the data-driven UI renderer system.

## Quick Start

The renderer system enables **backend-driven form creation** with dynamic components, conditional logic, and type-safe rendering.

### Key Concepts

- **Component Registry**: Type-safe mapping of names to React components
- **Dynamic Forms**: Forms configured from API responses
- **Conditional Fields**: Complex show/hide logic based on form values
- **Async Options**: Dropdown options fetched from APIs with dependencies
- **Multi-step Forms**: Step-by-step forms with progress tracking

## Documentation

| Document | Description |
|----------|-------------|
| **[Comprehensive Synthesis](./phase-4-synthesis.md)** ⭐ | Complete system overview and how-to guide |
| [Phase 1: Discovery](./phase-1-discovery.md) | File inventory and search results |
| [Phase 2: Structure](./phase-2-structure.md) | Architecture, dependencies, and patterns |
| [Phase 3: Analysis](./phase-3-analysis.md) | Code deep-dive with line references |

## Key Files

```
src/components/renderer/
├── FormRenderer.tsx        (322 lines) - Main form orchestration
├── FieldRenderer.tsx       (270 lines) - Individual field rendering
├── ComponentRegistry.ts    (82 lines) - Component mapping registry
└── MultiStepFormRenderer.tsx (307 lines) - Multi-step forms
```

## Quick Example

```typescript
const fields = [
  {
    fieldName: 'fullName',
    component: 'input',
    props: {
      labelKey: 'user.name.label',
      placeholderKey: 'user.name.placeholder',
      validations: [{ type: 'required' }]
    }
  },
  {
    fieldName: 'country',
    component: 'select',
    props: {
      labelKey: 'user.country.label',
      optionsFetcher: {
        url: '/api/countries',
        staleTime: 5 * 60 * 1000 // 5 minutes cache
      }
    }
  },
  {
    fieldName: 'state',
    component: 'select',
    condition: {
      field: 'country',
      operator: 'in',
      value: ['US', 'CA']
    },
    props: {
      labelKey: 'user.state.label',
      optionsFetcher: {
        url: '/api/states',
        dependencies: ['country'] // Refetch when country changes
      }
    }
  }
];

<FormRenderer
  fields={fields}
  onSubmit={(data) => console.log('Form data:', data)}
/>
```

## Features

- ✅ **20+ Components**: Input, Select, DatePicker, Ekyc, and more
- ✅ **Type Safety**: Full TypeScript with Zod validation
- ✅ **Conditional Logic**: 30+ operators including regex and array ops
- ✅ **Async Options**: Dynamic loading with caching and dependencies
- ✅ **Internationalization**: Full i18n support with next-intl
- ✅ **Multi-step Forms**: Progress tracking and state persistence
- ✅ **Form Validation**: Client and server-side validation

## Action Items

### Immediate (Week 1-2)
1. [ ] Add test coverage for core components
2. [ ] Implement error boundaries
3. [ ] Add retry logic for async options

### Short Term (Month 1)
1. [ ] Performance optimization for large forms
2. [ ] Accessibility improvements
3. [ ] Create developer documentation

### Long Term (Quarter 1)
1. [ ] Visual form builder
2. [ ] Form analytics
3. [ ] Advanced cross-field validation

## Resources

- [Component Registry Implementation](../../components/renderer/ComponentRegistry.ts)
- [Type Definitions](../../types/data-driven-ui.d.ts)
- [Usage Example: User Onboarding](../../app/[locale]/user-onboarding/components/onboarding-form.tsx)
- [Zod Schema Generator](../../lib/builders/zod-generator.ts)