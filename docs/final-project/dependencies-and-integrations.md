# Dependencies and Integrations

## Mục lục
- [Tổng quan](#tổng-quan)
- [Dependencies](#dependencies)
  - [Production Dependencies](#production-dependencies)
  - [Development Dependencies](#development-dependencies)
- [Integrations](#integrations)
  - [VNPT eKYC Integration](#vnpt-ekyc-integration)
  - [OpenAPI Integration](#openapi-integration)
  - [Internationalization Integration](#internationalization-integration)
- [Migration Strategies](#migration-strategies)
  - [Phase 1: Core Dependencies Migration](#phase-1-core-dependencies-migration)
  - [Phase 2: Feature Integration](#phase-2-feature-integration)
  - [Phase 3: Development Experience](#phase-3-development-experience)
- [Best Practices](#best-practices)
- [Security Considerations](#security-considerations)
- [Performance Considerations](#performance-considerations)
- [Related Documentation](#related-documentation)

## Tổng quan

DOP-FE sử dụng một hệ thống dependencies và integrations hiện đại, được thiết kế để tối ưu hóa hiệu suất, bảo mật và trải nghiệm phát triển. Tài liệu này cung cấp cái nhìn chi tiết về các dependencies production và development, cùng với các integrations bên ngoài và chiến lược migration từ dự án cũ.

## Dependencies

### Production Dependencies

#### Core Framework & Runtime

| Dependency | Version | Mục đích | Migration Notes |
|------------|---------|----------|-----------------|
| next | 15.5.4 | React framework với App Router và Turbopack | Nâng cấp từ 13.5.2 với breaking changes và performance improvements |
| react | 19.1.0 | UI library với Server Components | Nâng cấp từ 18.2.0 với new features |
| react-dom | 19.1.0 | React DOM renderer | Đồng bộ với React version |
| typescript | ^5 | Type checking và development experience | Bật strict mode, review path mapping |
| next-intl | ^4.3.9 | Internationalization với locale routing | Thêm mới cho multi-language support |

#### UI Components & Styling

| Dependency | Version | Mục đích | Migration Notes |
|------------|---------|----------|-----------------|
| @radix-ui/* | Multiple | Accessible UI primitives | Thay thế Mantine components |
| class-variance-authority | ^0.7.1 | Component variant management | Thêm mới cho shadcn/ui pattern |
| clsx | ^2.1.1 | Conditional className utility | Thêm mới cho dynamic styling |
| tailwind-merge | ^3.3.1 | Tailwind className merging | Thêm mới cho style conflicts resolution |
| lucide-react | ^0.544.0 | Icon library | Thay thế custom SVG icons |
| tailwindcss-animate | ^1.0.7 | Animation utilities | Thêm mới cho micro-interactions |

#### State Management & Data Fetching

| Dependency | Version | Mục đích | Migration Notes |
|------------|---------|----------|-----------------|
| zustand | ^5.0.8 | Client state management | Nâng cấp từ 4.3.8 với new API features |
| @tanstack/react-query | ^5.90.2 | Server state management | Thêm mới cho caching và data fetching |
| @tanstack/react-table | ^8.21.3 | Table components với sorting/filtering | Thay thế react-paginate |
| openapi-fetch | ^0.15.0 | Type-safe API client | Thay thế Axios với OpenAPI schema |

#### Form Handling & Validation

| Dependency | Version | Mục đích | Migration Notes |
|------------|---------|----------|-----------------|
| react-hook-form | ^7.63.0 | Form management với validation | Thêm mới thay thế custom form logic |
| @hookform/resolvers | ^5.2.2 | Validation integration (Zod) | Thêm mới cho schema validation |
| zod | ^4.1.11 | Schema validation | Thêm mới cho runtime type checking |
| input-otp | ^1.4.2 | OTP input component | Thêm mới cho verification forms |

#### Media & Content

| Dependency | Version | Mục đích | Migration Notes |
|------------|---------|----------|-----------------|
| embla-carousel-react | ^8.6.0 | Modern carousel với accessibility | Thay thế react-slick |
| framer-motion | ^12.23.24 | Animation library | Thêm mới cho micro-interactions |
| recharts | ^2.15.4 | Chart components | Thêm mới cho data visualization |
| react-day-picker | ^9.11.0 | Date picker component | Thêm mới cho date selection |
| date-fns | ^4.1.0 | Date manipulation utilities | Thêm mới cho date handling |

#### Utilities & Helpers

| Dependency | Version | Mục đích | Migration Notes |
|------------|---------|----------|-----------------|
| sonner | ^2.0.7 | Modern toast notifications | Thay thế react-toastify |
| cmdk | ^1.1.1 | Command palette component | Thêm mới cho search functionality |
| vaul | ^1.1.2 | Drawer/modal component | Thêm mới cho mobile interactions |
| react-resizable-panels | ^3.0.6 | Resizable panel components | Thêm mới cho admin dashboard |
| react-window | ^2.2.3 | Virtual scrolling | Thêm mới cho performance optimization |
| @vercel/analytics | ^1.5.0 | Production analytics | Thêm mới cho performance tracking |
| next-themes | ^0.4.6 | Theme management | Thêm mới cho dark mode |

### Development Dependencies

#### Build Tools & Code Quality

| Dependency | Version | Mục đích | Migration Notes |
|------------|---------|----------|-----------------|
| @biomejs/biome | 2.2.0 | Unified linting và formatting | Thay thế ESLint + Prettier |
| husky | ^9.1.7 | Git hooks | Thêm mới cho pre-commit checks |
| lint-staged | ^16.2.3 | Pre-commit linting | Thêm mới cho code quality |
| typescript | ^5 | Type checking | Đồng bộ với production dependencies |

#### Testing Framework

| Dependency | Version | Mục đích | Migration Notes |
|------------|---------|----------|-----------------|
| vitest | ^3.2.4 | Unit testing framework | Thay thế Jest với better DX |
| @vitest/browser | ^3.2.4 | Browser environment testing | Thay thế jest-environment-jsdom |
| @vitest/coverage-v8 | ^3.2.4 | Code coverage reporting | Thêm mới cho test coverage |
| @testing-library/react | ^15.0.7 | React testing utilities | Giữ nguyên với version mới |
| @testing-library/jest-dom | ^6.4.5 | DOM testing utilities | Giữ nguyên với version mới |
| playwright | ^1.55.1 | E2E testing framework | Thêm mới cho end-to-end tests |

#### Documentation & Development Tools

| Dependency | Version | Mục đích | Migration Notes |
|------------|---------|----------|-----------------|
| storybook | ~8.6.14 | Component documentation | Thêm mới cho component development |
| @storybook/* | Multiple | Storybook addons | Thêm mới cho enhanced documentation |
| openapi-typescript | ^7.9.1 | Type generation từ API schema | Thêm mới cho type safety |

#### CSS & Styling

| Dependency | Version | Mục đích | Migration Notes |
|------------|---------|----------|-----------------|
| tailwindcss | ^4 | Utility-first CSS framework | Nâng cấp từ 3.3.2 với new features |
| @tailwindcss/postcss | ^4 | Tailwind CSS PostCSS plugin | Thay thế Autoprefixer |
| tw-animate-css | ^1.4.0 | Animation utilities | Thêm mới cho custom animations |
| postcss | ^8 | CSS processing | Giữ nguyên cho compatibility |

## Integrations

### VNPT eKYC Integration

#### SDK Files

```
public/lib/
├── VNPTBrowserSDKAppV4.0.0.js
├── VNPTQRBrowserApp.js
├── VNPTQRUpload.js
├── mobile-oval.json
├── web-oval.json
└── bg-vnpt.svg
```

#### Implementation Files

```
src/lib/ekyc/
├── index.ts                    # Main export
├── sdk-manager.ts             # SDK lifecycle management
├── sdk-config.ts              # Configuration management
├── sdk-events.ts              # Event handling
├── sdk-loader.ts              # Dynamic SDK loading
├── ekyc-data-mapper.ts        # Data transformation
└── types.ts                   # TypeScript definitions
```

#### Configuration

```typescript
// src/lib/ekyc/sdk-config.ts
export const ekycConfig = {
  backendUrl: process.env.NEXT_PUBLIC_EKYC_BACKEND_URL,
  tokenEndpoint: process.env.NEXT_PUBLIC_EKYC_TOKEN_ENDPOINT,
  sdkVersion: '4.0.0',
  timeout: 30000,
  retryAttempts: 3,
  retryDelay: 1000,
  options: {
    enableLiveness: true,
    enableFaceMatching: true,
    enableOCR: true,
  }
};
```

#### Security Considerations

- **Token Rotation**: Secure token storage với automatic refresh
- **Proper Cleanup**: SDK cleanup on component unmount
- **Error Handling**: Comprehensive error handling với retry mechanisms
- **Data Protection**: Secure data transmission với encryption

### OpenAPI Integration

#### Schema Structure

```
src/lib/api/
├── schema.yaml                # OpenAPI schema definition
├── v1.d.ts                   # Generated TypeScript types
├── client.ts                 # Type-safe API client
├── admin-api.ts              # Admin-specific API calls
└── mock-responses.ts         # Development mock data
```

#### Type Generation

```bash
npm run gen:api
# Command: openapi-typescript src/lib/api/schema.yaml -o src/lib/api/v1.d.ts
```

#### Client Implementation

```typescript
// src/lib/api/client.ts
import createClient from 'openapi-fetch'
import type { paths } from './v1'

export const apiClient = createClient<paths>({
  baseUrl: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Usage with full type safety
const { data, error } = await apiClient.GET('/leads/{id}', {
  params: {
    path: { id: '123' }
  }
});
```

### Internationalization Integration

#### Translation Files

```
messages/
├── vi.json                   # Vietnamese translations
├── en.json                   # English translations
└── [locale]/
    └── common.json           # Common translations
```

#### Configuration

```typescript
// src/i18n/request.ts
import { getRequestConfig } from 'next-intl/server'
import { routing } from './routing'

export default getRequestConfig(async ({ locale }) => ({
  messages: (await import(`../messages/${locale}.json`)).default,
}));
```

#### Features

- **Automatic Locale Detection**: Browser preference detection
- **Dynamic Locale Switching**: Runtime locale changes
- **Namespace Support**: Organized translation files
- **Pluralization**: ICU message format support

## Migration Strategies

### Phase 1: Core Dependencies Migration

#### 1. Framework Upgrade

**Next.js Migration**
```bash
# From 13.5.2 to 15.5.4
npm install next@15.5.4
npm install react@19.1.0 react-dom@19.1.0
```

**Breaking Changes to Address:**
- App Router migration from Pages Router
- Turbopack configuration
- Middleware updates
- Image component API changes

**React Migration**
- Server Components adoption
- Concurrent features utilization
- Suspense boundaries implementation
- Error boundaries updates

#### 2. UI System Overhaul

**Mantine → Radix UI Migration**
```typescript
// Old Mantine component
import { Button, TextInput } from '@mantine/core';

// New Radix UI + shadcn/ui component
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
```

**SCSS → Tailwind CSS Migration**
```scss
/* Old SCSS */
.card {
  background: white;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}
```

```jsx
/* New Tailwind CSS */
<div className="bg-white rounded-lg p-4 shadow-sm">
  {/* Content */}
</div>
```

#### 3. State Management Refactor

**Zustand v4 → v5 Migration**
```typescript
// Old v4 pattern
const useStore = create((set) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 })),
}));

// New v5 pattern with immer support
const useStore = create(
  immer((set) => ({
    count: 0,
    increment: () => set((state) => {
      state.count += 1;
    }),
  }))
);
```

### Phase 2: Feature Integration

#### 1. Form System Implementation

**Custom Forms → react-hook-form + Zod**
```typescript
// Old custom form validation
const validateForm = (data: FormData) => {
  const errors = {};
  if (!data.email) errors.email = 'Email is required';
  return errors;
};

// New react-hook-form + Zod validation
const formSchema = z.object({
  email: z.string().email('Invalid email address'),
});

const form = useForm({
  resolver: zodResolver(formSchema),
});
```

#### 2. API Layer Modernization

**Axios → openapi-fetch Migration**
```typescript
// Old Axios implementation
const getLead = async (id: string) => {
  const response = await axios.get(`/api/leads/${id}`);
  return response.data;
};

// New openapi-fetch implementation
const getLead = async (id: string) => {
  const { data, error } = await apiClient.GET('/leads/{id}', {
    params: { path: { id } }
  });
  return data;
};
```

#### 3. Enhanced Features Integration

**VNPT eKYC Integration**
```typescript
// eKYC component implementation
import { useEkyc } from '@/hooks/features/ekyc/use-sdk';

export const EkycComponent = () => {
  const { initializeEkyc, isLoading, error } = useEkyc();
  
  const handleStartEkyc = async () => {
    try {
      const result = await initializeEkyc({
        enableLiveness: true,
        enableOCR: true,
      });
      // Handle successful verification
    } catch (err) {
      // Handle error
    }
  };
  
  return (
    <Button onClick={handleStartEkyc} disabled={isLoading}>
      Start Identity Verification
    </Button>
  );
};
```

### Phase 3: Development Experience

#### 1. Tooling Migration

**ESLint/Prettier → Biome**
```json
// biome.json configuration
{
  "linter": {
    "enabled": true,
    "rules": {
      "recommended": true
    }
  },
  "formatter": {
    "enabled": true,
    "formatWithErrors": false
  }
}
```

**Jest → Vitest Migration**
```typescript
// Old Jest test
describe('Component', () => {
  it('should render correctly', () => {
    render(<Component />);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });
});

// New Vitest test (similar API)
import { test, expect } from 'vitest';

test('should render correctly', () => {
  render(<Component />);
  expect(screen.getByText('Hello')).toBeInTheDocument();
});
```

#### 2. Testing Strategy

**Unit Tests với Vitest**
```typescript
// Example unit test
import { describe, test, expect } from 'vitest';
import { formatCurrency } from '@/lib/utils';

describe('formatCurrency', () => {
  test('should format number as currency', () => {
    expect(formatCurrency(1234.56)).toBe('1,234.56');
  });
});
```

**E2E Tests với Playwright**
```typescript
// Example E2E test
import { test, expect } from '@playwright/test';

test('user can complete onboarding flow', async ({ page }) => {
  await page.goto('/');
  await page.click('[data-testid="start-onboarding"]');
  await page.fill('[data-testid="name-input"]', 'John Doe');
  await page.click('[data-testid="submit-button"]');
  await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
});
```

## Best Practices

### Dependency Management

1. **Regular Updates**: Monthly dependency audits với `npm audit`
2. **Security Scanning**: Automated vulnerability scanning trong CI/CD
3. **Version Pinning**: Exact versions cho production stability
4. **Bundle Analysis**: Regular bundle size monitoring với `webpack-bundle-analyzer`

### Integration Patterns

1. **Type Safety**: Full TypeScript integration với generated types
2. **Error Boundaries**: Comprehensive error handling với fallback UI
3. **Performance Optimization**: Lazy loading và code splitting
4. **Security**: Secure token management và input validation

### Development Workflow

1. **Code Quality**: Biome + lint-staged + Husky cho pre-commit checks
2. **Testing**: Unit + Integration + E2E test pyramid
3. **Documentation**: Storybook cho component documentation
4. **Monitoring**: Performance tracking với Vercel Analytics

## Security Considerations

### Dependency Security

- **Regular Audits**: `npm audit` cho vulnerability detection
- **Automated Scanning**: GitHub Actions cho security checks
- **Dependency Review**: Manual review cho new dependencies
- **Security Headers**: Proper CSP và security headers

### Data Protection

- **PII Handling**: Proper encryption cho sensitive data
- **Token Security**: Secure storage và transmission
- **Input Validation**: Zod schemas cho runtime validation
- **XSS Prevention**: Proper encoding và CSP policies

### API Security

- **HTTPS-Only**: Secure communication protocols
- **JWT Authentication**: Token-based authentication
- **Rate Limiting**: API abuse prevention
- **CORS Configuration**: Proper cross-origin policies

## Performance Considerations

### Bundle Optimization

- **Tree Shaking**: Eliminate unused dependencies
- **Code Splitting**: Route và component-based splitting
- **Dynamic Imports**: Lazy loading cho heavy components
- **Bundle Analysis**: Regular size monitoring

### Runtime Performance

- **React Optimization**: Memoization và proper re-rendering
- **State Management**: Efficient state patterns
- **Image Optimization**: Next.js Image component
- **Memory Management**: Leak prevention strategies

### Network Performance

- **Request Batching**: Reduce API calls
- **Caching Strategies**: Intelligent data caching
- **Compression**: Asset optimization
- **CDN Integration**: Global content delivery

## Related Documentation

- **[Dependencies Mapping Matrix](dependencies-mapping-matrix.md)** - Detailed migration mapping
- **[Project Architecture Overview](project-architecture-overview.md)** - Architecture patterns
- **[Configuration and Environment Setup](configuration-and-environment-setup.md)** - Setup details
- **[Business Flows and Processes](business-flows-and-processes.md)** - Flow-based system implementation
- **[Application Pages and Components](application-pages-and-components.md)** - Component hierarchy
- **[Data Models and Structures](data-models-and-structures.md)** - Type definitions