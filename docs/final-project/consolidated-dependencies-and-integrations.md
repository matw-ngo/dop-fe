# DOP-FE Consolidated Dependencies and Integrations

## Tổng quan
Tài liệu này tổng hợp toàn bộ dependencies và integrations cho dự án DOP-FE sau khi đã consolidation từ dự án cũ Finzone Frontend, bao gồm mapping, migration strategies và best practices.

## Dependencies Structure

### Production Dependencies

#### Core Framework & Runtime
```json
{
  "next": "15.5.4",
  "react": "19.1.0", 
  "react-dom": "19.1.0",
  "typescript": "^5",
  "next-intl": "^4.3.9"
}
```

**Migration Notes:**
- Next.js 13.5.2 → 15.5.4 với Turbopack optimization
- React 18.2.0 → 19.1.0 với new features và performance improvements
- TypeScript strict mode enabled
- Thêm next-intl cho internationalization

#### UI Components & Styling
```json
{
  "@radix-ui/react-accordion": "^1.2.12",
  "@radix-ui/react-alert-dialog": "^1.1.15",
  "@radix-ui/react-aspect-ratio": "^1.1.7",
  "@radix-ui/react-avatar": "^1.1.10",
  "@radix-ui/react-checkbox": "^1.3.3",
  "@radix-ui/react-collapsible": "^1.1.12",
  "@radix-ui/react-context-menu": "^2.2.16",
  "@radix-ui/react-dialog": "^1.1.15",
  "@radix-ui/react-dropdown-menu": "^2.1.16",
  "@radix-ui/react-hover-card": "^1.1.15",
  "@radix-ui/react-icons": "^1.3.2",
  "@radix-ui/react-label": "^2.1.7",
  "@radix-ui/react-menubar": "^1.1.16",
  "@radix-ui/react-navigation-menu": "^1.2.14",
  "@radix-ui/react-popover": "^1.1.15",
  "@radix-ui/react-progress": "^1.1.7",
  "@radix-ui/react-radio-group": "^1.3.8",
  "@radix-ui/react-scroll-area": "^1.2.10",
  "@radix-ui/react-select": "^2.2.6",
  "@radix-ui/react-separator": "^1.1.7",
  "@radix-ui/react-slider": "^1.3.6",
  "@radix-ui/react-slot": "^1.2.3",
  "@radix-ui/react-switch": "^1.2.6",
  "@radix-ui/react-tabs": "^1.1.13",
  "@radix-ui/react-toast": "^1.2.15",
  "@radix-ui/react-toggle": "^1.1.10",
  "@radix-ui/react-toggle-group": "^1.1.11",
  "@radix-ui/react-tooltip": "^1.2.8",
  "class-variance-authority": "^0.7.1",
  "clsx": "^2.1.1",
  "lucide-react": "^0.544.0",
  "tailwind-merge": "^3.3.1",
  "tailwindcss-animate": "^1.0.7"
}
```

**Migration Strategy:**
- **Từ Mantine → Radix UI**: Migrate sang Radix UI primitives với accessibility built-in
- **Từ Bulma/SCSS → Tailwind CSS 4**: Complete styling system overhaul
- **Từ custom SVG → Lucide React**: Standardized icon system
- **Component Architecture**: Implement shadcn/ui pattern với customizable components

#### State Management & Data Fetching
```json
{
  "zustand": "^5.0.8",
  "@tanstack/react-query": "^5.90.2",
  "@tanstack/react-table": "^8.21.3",
  "openapi-fetch": "^0.15.0"
}
```

**Migration Strategy:**
- **Zustand 4.3.8 → 5.0.8**: Upgrade với new API features
- **Thêm React Query**: Server state management với caching, refetching
- **Axios → openapi-fetch**: Type-safe API calls với OpenAPI schema
- **Immer removed**: Zustand 5 có built-in immer support

#### Form Handling & Validation
```json
{
  "react-hook-form": "^7.63.0",
  "@hookform/resolvers": "^5.2.2",
  "zod": "^4.1.11",
  "input-otp": "^1.4.2"
}
```

**Migration Strategy:**
- **Custom form validation → react-hook-form**: Standardized form management
- **Zod integration**: Runtime type validation với TypeScript integration
- **Component migration**: react-select → Radix Select, react-input-slider → Radix Slider

#### Media & Content
```json
{
  "embla-carousel-react": "^8.6.0",
  "framer-motion": "^12.23.24",
  "recharts": "^2.15.4",
  "react-day-picker": "^9.11.0",
  "date-fns": "^4.1.0"
}
```

**Migration Strategy:**
- **react-slick → embla-carousel**: Modern carousel với better accessibility
- **Thêm framer-motion**: Animation library cho micro-interactions
- **Thêm recharts**: Chart components cho data visualization
- **react-content-loader → Custom skeleton**: Tailwind-based skeleton components

#### Utilities & Helpers
```json
{
  "sonner": "^2.0.7",
  "cmdk": "^1.1.1",
  "vaul": "^1.1.2",
  "react-resizable-panels": "^3.0.6",
  "react-window": "^2.2.3",
  "@types/react-window": "^1.8.8",
  "@vercel/analytics": "^1.5.0",
  "next-themes": "^0.4.6"
}
```

**Migration Strategy:**
- **react-toastify → sonner**: Modern toast notifications
- **query-string → next-intl**: Enhanced internationalization
- **uuid/md5 → crypto APIs**: Native browser APIs
- **react-responsive → Custom hooks**: Tailwind-based responsive utilities

### Development Dependencies

#### Build Tools & Code Quality
```json
{
  "@biomejs/biome": "2.2.0",
  "husky": "^9.1.7",
  "lint-staged": "^16.2.3",
  "typescript": "^5"
}
```

**Migration Strategy:**
- **ESLint + Prettier → Biome**: Unified linting và formatting
- **Thêm Husky + lint-staged**: Pre-commit hooks cho code quality
- **TypeScript strict mode**: Enhanced type safety

#### Testing Framework
```json
{
  "vitest": "^3.2.4",
  "@vitest/browser": "^3.2.4",
  "@vitest/coverage-v8": "^3.2.4",
  "@testing-library/react": "^15.0.7",
  "@testing-library/jest-dom": "^6.4.5",
  "playwright": "^1.55.1"
}
```

**Migration Strategy:**
- **Jest → Vitest**: Faster test runner với better DX
- **Thêm Playwright**: E2E testing framework
- **Maintain Testing Library**: Consistent testing utilities

#### Documentation & Development Tools
```json
{
  "storybook": "~8.6.14",
  "@storybook/addon-essentials": "~8.6.14",
  "@storybook/addon-a11y": "~8.6.14",
  "@storybook/addon-docs": "~8.6.14",
  "@storybook/addon-interactions": "~8.6.14",
  "@storybook/addon-onboarding": "~8.6.14",
  "@storybook/addon-vitest": "^9.1.10",
  "@storybook/nextjs": "~8.6.14",
  "openapi-typescript": "^7.9.1"
}
```

**Migration Strategy:**
- **Thêm Storybook**: Component documentation và development
- **OpenAPI TypeScript**: Type generation từ API schema
- **Vitest integration**: Testing trong Storybook

#### CSS & Styling
```json
{
  "tailwindcss": "^4",
  "@tailwindcss/postcss": "^4",
  "tw-animate-css": "^1.4.0",
  "postcss": "^8"
}
```

**Migration Strategy:**
- **Tailwind CSS 3.3.2 → 4**: New features và performance improvements
- **Autoprefixer → @tailwindcss/postcss**: Tailwind v4 PostCSS plugin
- **Thêm tw-animate-css**: Animation utilities

## External Integrations

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
├── index.ts
├── sdk-manager.ts
├── sdk-config.ts
├── sdk-events.ts
├── sdk-loader.ts
├── ekyc-data-mapper.ts
└── types.ts
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
}
```

#### Security Considerations
- Token rotation với secure storage
- Proper cleanup on component unmount
- Error handling với retry mechanisms
- Secure data transmission

### OpenAPI Integration

#### Schema Structure
```
src/lib/api/
├── schema.yaml
├── v1.d.ts (generated)
├── client.ts
├── admin-api.ts
└── mock-responses.ts
```

#### Type Generation
```bash
npm run gen:api
# Generates: openapi-typescript src/lib/api/schema.yaml -o src/lib/api/v1.d.ts
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
})
```

### Internationalization Integration

#### Translation Files
```
messages/
├── vi.json
├── en.json
└── [locale]/
    └── common.json
```

#### Configuration
```typescript
// src/i18n/request.ts
import { getRequestConfig } from 'next-intl/server'
import { routing } from './routing'

export default getRequestConfig(async ({ locale }) => ({
  messages: (await import(`../messages/${locale}.json`)).default,
}))
```

#### Features
- Automatic locale detection
- Dynamic locale switching
- Namespace support
- Pluralization support

## Migration Strategies

### Phase 1: Core Dependencies Migration
1. **Framework Upgrade**
   - Next.js 13.5.2 → 15.5.4
   - React 18.2.0 → 19.1.0
   - TypeScript strict mode

2. **UI System Overhaul**
   - Mantine → Radix UI + shadcn/ui
   - SCSS/Bulma → Tailwind CSS 4
   - Custom SVG → Lucide React

3. **State Management Refactor**
   - Zustand 4.3.8 → 5.0.8
   - Add React Query
   - Remove Immer

### Phase 2: Feature Integration
1. **Form System**
   - react-hook-form + Zod
   - Component migration
   - Validation overhaul

2. **API Layer**
   - Axios → openapi-fetch
   - Type-safe implementation
   - Error handling

3. **Enhanced Features**
   - VNPT eKYC integration
   - Internationalization
   - Animation system

### Phase 3: Development Experience
1. **Tooling**
   - ESLint/Prettier → Biome
   - Jest → Vitest
   - Add Storybook

2. **Testing**
   - Unit tests với Vitest
   - E2E tests với Playwright
   - Component testing

3. **Documentation**
   - Storybook setup
   - API documentation
   - Component docs

## Best Practices

### Dependency Management
1. **Regular Updates**: Monthly dependency audits
2. **Security Scanning**: Automated vulnerability scanning
3. **Version Pinning**: Exact versions cho production
4. **Bundle Analysis**: Regular bundle size monitoring

### Integration Patterns
1. **Type Safety**: Full TypeScript integration
2. **Error Boundaries**: Comprehensive error handling
3. **Performance Optimization**: Lazy loading, code splitting
4. **Security**: Secure token management, input validation

### Development Workflow
1. **Code Quality**: Biome + lint-staged + Husky
2. **Testing**: Unit + Integration + E2E
3. **Documentation**: Storybook + API docs
4. **Monitoring**: Performance + error tracking

## Security Considerations

### Dependency Security
- Regular security audits với `npm audit`
- Automated vulnerability scanning trong CI/CD
- Proper dependency review process
- Security headers implementation

### Data Protection
- PII handling với proper encryption
- Secure token storage và transmission
- Input validation với Zod schemas
- XSS prevention với proper encoding

### API Security
- HTTPS-only communication
- JWT-based authentication
- Rate limiting implementation
- CORS configuration

## Performance Considerations

### Bundle Optimization
- Tree shaking cho unused dependencies
- Code splitting theo routes và components
- Dynamic imports cho heavy components
- Bundle analysis với webpack-bundle-analyzer

### Runtime Performance
- React optimization với memoization
- Proper state management patterns
- Image optimization strategies
- Memory leak prevention

### Network Performance
- Request batching và deduplication
- Intelligent caching strategies
- Compression cho static assets
- CDN integration

## Related Documentation

- **[Dependencies Mapping Matrix](dependencies-mapping-matrix.md)** - Detailed migration mapping
- **[Project Architecture Overview](../migration/new-project/project-architecture-overview.md)** - Architecture patterns
- **[Configuration and Environment Setup](../migration/new-project/configuration-and-environment-setup.md)** - Setup details
- **[Security Best Practices](../migration/new-project/security-best-practices.md)** - Security implementation
- **[Performance Optimization](../migration/new-project/performance-optimization.md)** - Performance strategies

## Conclusion

Consolidated dependencies và integrations cho DOP-FE represent một comprehensive modernization effort với:
- **55+ production dependencies** được carefully selected
- **25+ development dependencies** cho enhanced DX
- **Major external integrations** (VNPT eKYC, OpenAPI, i18n)
- **Modern toolchain** với Biome, Vitest, Storybook

Focus là building maintainable, scalable, và performant application với modern React ecosystem và best practices.