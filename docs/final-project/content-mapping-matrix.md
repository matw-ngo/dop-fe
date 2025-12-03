# DOP-FE Content Mapping Matrix

## Tổng quan
Ma trận này ánh xạ nội dung từ dự án cũ (Finzone Frontend) sang cấu trúc tài liệu mới (DOP-FE), xác định các khoảng trống, xung đột và cơ hội để ưu tiên công nghệ mới.

## Ma trận ánh xạ nội dung

| Old Content Category/Topic | Key Details from Old | Corresponding New File/Section | Status (Fully Mapped / Gap / Conflict / Overlap) | Notes/Actions (incl. prioritize new tech) |
|------------------------|---------------------|---------------------------|-----------------------------------|-----------------------------------|
| **Business Flows** | | | | |
| Loan Application Journey | Homepage → Loan Application → OTP Verification → Additional Information → Loan Results | [Business Flows and Processes](business-flows-and-processes.md) | Gap | Cần tích hợp flow quản lý từ admin panel mới, sử dụng React Query thay vì Axios trực tiếp |
| Credit Card Journey | Homepage → Credit Card Module → Search/Compare → Card Details → Application | [Business Flows and Processes](business-flows-and-processes.md) | Gap | Cần tích hợp với hệ thống flow-based mới thay vì hardcode routes |
| Insurance Journey | Homepage → Insurance Module → Product Selection → Purchase | [Business Flows and Processes](business-flows-and-processes.md) | Gap | Cần tích hợp với hệ thống flow-based mới, thêm eKYC verification |
| Authentication Flows | CFP Login, OTP Authentication | [Security Best Practices](security-best-practices.md) | Fully Mapped | Nâng cấp với JWT token management, session security |
| **Application Pages** | | | | |
| Home Page | Hero section, TabDisplay, Blog section, Community section | [Application Pages and Components](../src/docs/application-pages-and-components.tsx) | Fully Mapped | Sử dụng component architecture mới với shadcn/ui |
| Credit Cards Pages | List, Detail, Compare, Redirect pages | [Application Pages and Components](../src/docs/application-pages-and-components.tsx) | Gap | Cần tích hợp vào hệ thống flow-based mới |
| Loan Pages | Application, Finding, Information, Result pages | [Application Pages and Components](../src/docs/application-pages-and-components.tsx) | Gap | Cần tích hợp vào hệ thống flow-based mới với eKYC |
| Insurance Pages | Product listings and details | [Application Pages and Components](../src/docs/application-pages-and-components.tsx) | Gap | Cần tích hợp vào hệ thống flow-based mới |
| Tools Pages | Interest calculator, salary converter, loan calculator | [Application Pages and Components](../src/docs/application-pages-and-components.tsx) | Gap | Cần tích hợp vào hệ thống mới |
| **Components** | | | | |
| Navigation Components | NavBar, Breadcrumb | [Application Pages and Components](../src/docs/application-pages-and-components.tsx) | Fully Mapped | Nâng cấp với internationalization support |
| Form Components | TextInput, SelectBox, Slider, etc. | [Application Pages and Components](../src/docs/application-pages-and-components.tsx) | Fully Mapped | Thay thế với shadcn/ui components, thêm Zod validation |
| Display Components | Card, Carousel, StarRating | [Application Pages and Components](../src/docs/application-pages-and-components.tsx) | Fully Mapped | Sử dụng Framer Motion cho animations |
| Layout Components | Footer, TabDisplay, etc. | [Application Pages and Components](../src/docs/application-pages-and-components.tsx) | Fully Mapped | Thêm theme system mới |
| **Data Models** | | | | |
| Loan Models | IUserData, IProvider, ILoanState | [Data Models and Structures](data-models-and-structures.md) | Fully Mapped | Nâng cấp với TypeScript strict mode, Zod schemas |
| Credit Card Models | ICard, ICardCategory, IUserReview | [Data Models and Structures](data-models-and-structures.md) | Gap | Cần tích hợp với hệ thống flow-based mới |
| Insurance Models | IInsurance, IInsuranceCategory | [Data Models and Structures](data-models-and-structures.md) | Gap | Cần tích hợp với hệ thống flow-based mới |
| Form State Management | Zustand stores with validation | [Data Models and Structures](data-models-and-structures.md) | Fully Mapped | Nâng cấp với React Query cho server state |
| **Configuration** | | | | |
| Environment Variables | API_HOST, reCAPTCHA, GA_ID | [Configuration and Environment Setup](configuration-and-environment-setup.md) | Fully Mapped | Thêm eKYC configuration, VNPT integration |
| Build Configuration | Next.js config with static export | [Configuration and Environment Setup](configuration-and-environment-setup.md) | Fully Mapped | Nâng cấp với Turbopack, static export optimization |
| Development Tools | ESLint, Prettier, Jest | [Configuration and Environment Setup](configuration-and-environment-setup.md) | Fully Mapped | Thay thế với Biome, Vitest, Storybook |
| **Dependencies** | | | | |
| Core Framework | Next.js 13.5.2, React 18.2.0 | [Dependencies and Integrations](../migration/new-project/dependencies-and-integrations.md) | Fully Mapped | Nâng cấp lên Next.js 15.5.4, React 19.1.0 |
| UI Libraries | Bulma, Mantine, SCSS | [Dependencies and Integrations](../migration/new-project/dependencies-and-integrations.md) | Fully Mapped | Thay thế với shadcn/ui, Tailwind CSS 4 |
| State Management | Zustand 4.3.8, Immer | [Dependencies and Integrations](../migration/new-project/dependencies-and-integrations.md) | Fully Mapped | Nâng cấp lên Zustand 5.0.8, thêm React Query |
| External Integrations | FingerprintJS, reCAPTCHA | [Dependencies and Integrations](../migration/new-project/dependencies-and-integrations.md) | Fully Mapped | Thêm VNPT eKYC SDK integration |
| **Dependencies Mapping** | | | | |
| Dependencies Migration | 80+ dependencies cũ | [Dependencies Mapping Matrix](dependencies-mapping-matrix.md) | Gap | Cần migrate 15 removed, 8 upgraded, 12 replaced, 20+ added |
| Consolidated Dependencies | Mix của cũ và mới | [Consolidated Dependencies and Integrations](consolidated-dependencies-and-integrations.md) | Gap | 55+ production deps, 25+ dev deps với modern toolchain |
| **API Integration** | | | | |
| Authentication API | CFP login, OTP verification | [API Documentation](api-documentation.md) | Fully Mapped | Nâng cấp với JWT-based authentication |
| Lead Management API | Lead creation, submission, forwarding | [API Documentation](api-documentation.md) | Fully Mapped | Tích hợp với flow-based system |
| Product APIs | Cards, Insurance, Tools endpoints | [API Documentation](api-documentation.md) | Gap | Cần tích hợp với hệ thống flow-based mới |
| **Architecture** | | | | |
| Technology Stack | Next.js, React, TypeScript, SCSS | [Project Architecture Overview](project-architecture-overview.md) | Fully Mapped | Nâng cấp với Next.js 15, React 19, Tailwind CSS 4 |
| Directory Structure | Pages Router, modules/ directory | [Project Architecture Overview](project-architecture-overview.md) | Fully Mapped | Chuyển sang App Router, component-based structure |
| State Management | Zustand stores | [Project Architecture Overview](project-architecture-overview.md) | Fully Mapped | Nâng cấp với React Query integration |
| **Security** | | | | |
| Authentication Security | SHA-256 hashing, session management | [Security Best Practices](security-best-practices.md) | Fully Mapped | Nâng cấp với JWT, secure token management |
| Data Protection | PII handling, input validation | [Security Best Practices](security-best-practices.md) | Fully Mapped | Thêm Zod validation, comprehensive input sanitization |
| Environment Security | Environment variables, HTTPS | [Security Best Practices](security-best-practices.md) | Fully Mapped | Thêm comprehensive security headers, CSP |
| **Performance** | | | | |
| Bundle Optimization | Tree shaking, code splitting | [Performance Optimization](performance-optimization.md) | Gap | Cần tích hợp Turbopack, advanced optimization techniques |
| Runtime Optimization | React.memo, useMemo patterns | [Performance Optimization](performance-optimization.md) | Gap | Cần tích hợp comprehensive optimization strategies |
| Monitoring | Core Web Vitals, bundle analysis | [Performance Optimization](performance-optimization.md) | Gap | Cần tích hợp comprehensive monitoring system |

## Phân tích tổng hợp

### Khoảng trống chính (Gaps)

1. **Flow-based System Integration**: Dự án cũ sử dụng hardcode routes, cần tích hợp hoàn toàn vào hệ thống flow-based của dự án mới
2. **eKYC Integration**: Dự án cũ không có eKYC, cần tích hợp VNPT SDK
3. **Advanced Performance Optimization**: Dự án cũ thiếu comprehensive optimization strategies
4. **Modern UI Components**: Cần chuyển đổi từ Bulma/Mantine sang shadcn/ui
5. **Enhanced Security**: Cần nâng cấp authentication và data protection mechanisms

### Xung đột (Conflicts)

1. **State Management Approach**: Dự án cũ sử dụng Zustand đơn thuần, dự án mới kết hợp với React Query
2. **Routing System**: Pages Router (cũ) vs App Router (mới)
3. **Styling Approach**: SCSS modules (cũ) vs Tailwind CSS 4 (mới)

### Cơ hội ưu tiên công nghệ mới

1. **Next.js 15.5.4 với Turbopack**: Tăng tốc độ build và development experience
2. **React 19.1.0**: Latest features và performance improvements
3. **shadcn/ui + Tailwind CSS 4**: Modern, accessible component system
4. **TypeScript Strict Mode**: Enhanced type safety
5. **Zod Validation**: Runtime type validation
6. **VNPT eKYC Integration**: Enhanced identity verification
7. **React Query**: Sophisticated server state management
8. **Biome**: Faster linting và formatting
9. **Storybook 8.6.14**: Enhanced component development
10. **Static Export with Optimization**: Flexible deployment options
11. **Radix UI Primitives**: Accessible component foundations
12. **Framer Motion**: Advanced animation system
13. **OpenAPI + Type-safe API**: Enhanced API integration
14. **Vitest + Playwright**: Modern testing stack
15. **next-intl**: Comprehensive internationalization

## Hành động đề xuất

1. **Priority 1 - Core Migration**:
   - Tích hợp flow-based system cho tất cả business flows
   - Chuyển đổi component architecture sang shadcn/ui
   - Nâng cấp state management với React Query
   - **Dependencies Migration**: Execute [Dependencies Mapping Matrix](dependencies-mapping-matrix.md) với 15 removed, 8 upgraded, 12 replaced dependencies

2. **Priority 2 - Enhanced Features**:
   - Tích hợp VNPT eKYC cho identity verification
   - Thêm comprehensive error handling với Zod
   - Implement internationalization với next-intl
   - **Consolidated Integration**: Implement [Consolidated Dependencies and Integrations](consolidated-dependencies-and-integrations.md) với 55+ production deps

3. **Priority 3 - Performance & Security**:
   - Implement comprehensive performance optimization strategies
   - Nâng cấp security với JWT và enhanced data protection
   - Thêm monitoring và analytics capabilities
   - **Modern Toolchain**: Complete migration sang Biome, Vitest, Storybook

4. **Priority 4 - Development Experience**:
   - Setup comprehensive testing với Vitest và Playwright
   - Configure Storybook cho component development
   - Implement Biome cho code quality
   - **Type Safety**: Full TypeScript strict mode với Zod validation

## Kết luận

Ma trận này xác định 25+ areas cần migration với 5 gaps chính, 3 conflicts và 15+ opportunities để ưu tiên công nghệ mới. Focus chính là tích hợp flow-based system, nâng cấp component architecture, và thêm eKYC integration.

### Dependencies Migration Summary
- **55+ production dependencies** được consolidated với modern stack
- **25+ development dependencies** cho enhanced development experience
- **15 dependencies removed** (SCSS ecosystem, legacy testing, etc.)
- **8 dependencies upgraded** (Next.js, React, Zustand, etc.)
- **12 dependencies replaced** (Mantine → Radix UI, Axios → openapi-fetch, etc.)
- **20+ new dependencies added** (React Query, Framer Motion, etc.)

### Key Integration Points
1. **VNPT eKYC SDK**: Complete identity verification system
2. **OpenAPI + Type-safe API**: Modern API integration
3. **shadcn/ui + Tailwind CSS 4**: Modern component system
4. **React Query + Zustand**: Hybrid state management
5. **Biome + Vitest + Storybook**: Modern development toolchain