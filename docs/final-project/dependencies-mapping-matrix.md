# DOP-FE Dependencies Mapping Matrix

## Tổng quan
Ma trận này ánh xạ dependencies từ dự án cũ (Finzone Frontend) sang dự án mới (DOP-FE), xác định các dependencies cần thay thế, loại bỏ và bổ sung, cùng với các hành động cần thực hiện.

## Ma trận ánh xạ Dependencies

| Category | Old Dependency | Version (Old) | New Dependency | Version (New) | Migration Status | Notes & Actions |
|----------|----------------|---------------|----------------|---------------|-----------------|-----------------|
| **Core Framework** | | | | | | |
| | next | 13.5.2 | next | 15.5.4 | ✅ Upgraded | Cần kiểm tra breaking changes, tận dụng Turbopack |
| | react | 18.2.0 | react | 19.1.0 | ✅ Upgraded | Cần kiểm tra breaking changes, review new features |
| | react-dom | 18.2.0 | react-dom | 19.1.0 | ✅ Upgraded | Đồng bộ với React version |
| | typescript | 5.0.4 | typescript | ^5 | ✅ Upgraded | Bật strict mode, review path mapping |
| **UI Components & Styling** | | | | | | |
| | @mantine/core | 6.0.16 | @radix-ui/* | Multiple | 🔄 Replaced | Migrate sang Radix UI primitives + shadcn/ui |
| | @mantine/hooks | 6.0.16 | Custom hooks | - | 🔄 Replaced | Tạo custom hooks tương ứng |
| | @emotion/react | 11.11.0 | tailwindcss | ^4 | 🔄 Replaced | Migration từ CSS-in-JS sang utility-first CSS |
| | bulma | 0.9.4 | tailwindcss | ^4 | 🔄 Replaced | Complete styling system overhaul |
| | sass | 1.62.1 | - | - | ❌ Removed | Không cần SCSS với Tailwind CSS 4 |
| | node-sass | 8.0.0 | - | - | ❌ Removed | Không cần với Tailwind CSS 4 |
| | - | - | class-variance-authority | ^0.7.1 | ➕ Added | Component variant management |
| | - | - | clsx | ^2.1.1 | ➕ Added | Conditional className utility |
| | - | - | tailwind-merge | ^3.3.1 | ➕ Added | Tailwind className merging |
| | - | - | lucide-react | ^0.544.0 | ➕ Added | Icon library thay thế custom SVG |
| **State Management** | | | | | | |
| | zustand | 4.3.8 | zustand | ^5.0.8 | ✅ Upgraded | Review API changes, new features |
| | immer | 10.0.2 | - | - | ❌ Removed | Zustand 5 có built-in immer support |
| | - | - | @tanstack/react-query | ^5.90.2 | ➕ Added | Server state management |
| | - | - | @tanstack/react-table | ^8.21.3 | ➕ Added | Table component với sorting/filtering |
| **Data Fetching & HTTP** | | | | | | |
| | axios | 1.4.0 | openapi-fetch | ^0.15.0 | 🔄 Replaced | Type-safe API calls với OpenAPI schema |
| | - | - | @vercel/analytics | ^1.5.0 | ➕ Added | Production analytics |
| **Form & Input Components** | | | | | | |
| | react-select | 5.7.3 | @radix-ui/react-select | ^2.2.6 | 🔄 Replaced | Radix UI primitive + custom styling |
| | react-input-slider | 6.0.1 | @radix-ui/react-slider | ^1.3.6 | 🔄 Replaced | Radix UI primitive + custom styling |
| | react-paginate | 8.2.0 | @tanstack/react-table | ^8.21.3 | 🔄 Replaced | Pagination built-in với React Table |
| | - | - | react-hook-form | ^7.63.0 | ➕ Added | Form management với validation |
| | - | - | @hookform/resolvers | ^5.2.2 | ➕ Added | Validation integration (Zod) |
| | - | - | zod | ^4.1.11 | ➕ Added | Schema validation |
| | - | - | input-otp | ^1.4.2 | ➕ Added | OTP input component |
| **Media & Content** | | | | | | |
| | react-slick | 0.29.0 | embla-carousel-react | ^8.6.0 | 🔄 Replaced | Modern carousel với better accessibility |
| | react-content-loader | 6.2.1 | Custom skeleton | - | 🔄 Replaced | Tailwind CSS skeleton components |
| | - | - | framer-motion | ^12.23.24 | ➕ Added | Animation library |
| | - | - | recharts | ^2.15.4 | ➕ Added | Chart components |
| **Utilities & Helpers** | | | | | | |
| | query-string | 7.1.3 | next-intl | ^4.3.9 | 🔄 Enhanced | Internationalization + query handling |
| | uuid | 10.0.0 | crypto.randomUUID | - | 🔄 Replaced | Native browser API |
| | md5 | 2.3.0 | crypto.subtle | - | 🔄 Replaced | Native Web Crypto API |
| | react-responsive | 9.0.2 | Custom hooks | - | 🔄 Replaced | Custom responsive hooks |
| | react-toastify | 9.1.3 | sonner | ^2.0.7 | 🔄 Replaced | Modern toast notifications |
| | - | - | date-fns | ^4.1.0 | ➕ Added | Date manipulation utilities |
| | - | - | react-day-picker | ^9.11.0 | ➕ Added | Date picker component |
| **Development Dependencies** | | | | | | |
| | @types/node | 20.1.3 | @types/node | ^20 | ✅ Upgraded | TypeScript definitions |
| | @types/react | 18.2.6 | @types/react | ^19 | ✅ Upgraded | TypeScript definitions |
| | @types/react-dom | 18.2.4 | @types/react-dom | ^19 | ✅ Upgraded | TypeScript definitions |
| | eslint | 8.40.0 | @biomejs/biome | 2.2.0 | 🔄 Replaced | Biome thay thế ESLint + Prettier |
| | eslint-config-next | 13.4.2 | @biomejs/biome | 2.2.0 | 🔄 Replaced | Biome configuration |
| | jest | 29.7.0 | vitest | ^3.2.4 | 🔄 Replaced | Faster test runner |
| | @testing-library/jest-dom | 6.4.5 | @testing-library/jest-dom | - | ✅ Kept | DOM testing utilities |
| | @testing-library/react | 15.0.7 | @testing-library/react | - | ✅ Kept | React testing utilities |
| | jest-environment-jsdom | 29.7.0 | @vitest/browser | ^3.2.4 | 🔄 Replaced | Vitest browser environment |
| | tailwindcss | 3.3.2 | tailwindcss | ^4 | ✅ Upgraded | Tailwind CSS v4 với new features |
| | autoprefixer | 10.4.14 | @tailwindcss/postcss | ^4 | 🔄 Enhanced | Tailwind CSS v4 PostCSS plugin |
| | postcss | 8.4.24 | - | - | ✅ Kept | CSS processing |
| | ts-node | 10.9.2 | - | - | ❌ Removed | Không cần với modern tooling |
| | - | - | @storybook/* | ~8.6.14 | ➕ Added | Component documentation |
| | - | - | playwright | ^1.55.1 | ➕ Added | E2E testing |
| | - | - | husky | ^9.1.7 | ➕ Added | Git hooks |
| | - | - | lint-staged | ^16.2.3 | ➕ Added | Pre-commit linting |
| | - | - | openapi-typescript | ^7.9.1 | ➕ Added | Type generation from OpenAPI |

## Phân tích tổng hợp

### Dependencies được loại bỏ (Removed)
1. **SCSS Ecosystem**: sass, node-sass - Thay thế bằng Tailwind CSS 4
2. **Legacy Testing**: jest, jest-environment-jsdom - Thay thế bằng Vitest
3. **Legacy Linting**: eslint, eslint-config-next - Thay thế bằng Biome
4. **Legacy Utilities**: query-string, uuid, md5 - Thay thế bằng native APIs
5. **Legacy Form Components**: react-select, react-input-slider, react-paginate - Thay thế bằng Radix UI + custom implementations

### Dependencies được nâng cấp (Upgraded)
1. **Core Framework**: Next.js 13.5.2 → 15.5.4, React 18.2.0 → 19.1.0
2. **State Management**: Zustand 4.3.8 → 5.0.8
3. **TypeScript**: 5.0.4 → ^5 với strict mode
4. **Tailwind CSS**: 3.3.2 → ^4 với new features

### Dependencies được thay thế (Replaced)
1. **UI Library**: Mantine → Radix UI + shadcn/ui
2. **Styling**: Emotion + Bulma → Tailwind CSS 4
3. **HTTP Client**: Axios → openapi-fetch (type-safe)
4. **Carousel**: react-slick → embla-carousel-react
5. **Notifications**: react-toastify → sonner
6. **Date Handling**: Multiple libraries → date-fns + react-day-picker

### Dependencies mới được thêm (Added)
1. **Form Management**: react-hook-form + @hookform/resolvers + zod
2. **State Management**: @tanstack/react-query + @tanstack/react-table
3. **Animation**: framer-motion
4. **Charts**: recharts
5. **Development**: Storybook, Playwright, Biome, Husky
6. **Internationalization**: next-intl
7. **Analytics**: @vercel/analytics

## Hành động cần thực hiện

### Priority 1: Core Migration
1. **UI Component Migration**
   - Migrate tất cả Mantine components sang Radix UI primitives
   - Implement shadcn/ui component library
   - Convert SCSS styles sang Tailwind CSS classes

2. **State Management Refactor**
   - Upgrade Zustand stores v4 → v5
   - Implement React Query cho server state
   - Remove immer dependency

3. **API Layer Modernization**
   - Replace Axios với openapi-fetch
   - Setup OpenAPI schema generation
   - Implement type-safe API calls

### Priority 2: Enhanced Features
1. **Form System Overhaul**
   - Implement react-hook-form + Zod validation
   - Migrate tất cả form components
   - Add comprehensive error handling

2. **Animation & Interactions**
   - Implement framer-motion animations
   - Migrate carousel sang embla-carousel
   - Add micro-interactions

3. **Development Experience**
   - Setup Storybook cho component documentation
   - Configure Biome cho linting/formatting
   - Implement Vitest + Playwright testing

### Priority 3: Advanced Features
1. **Internationalization**
   - Setup next-intl configuration
   - Migrate tất cả text content
   - Implement locale switching

2. **Analytics & Monitoring**
   - Implement Vercel Analytics
   - Setup performance monitoring
   - Add error tracking

3. **Advanced UI Components**
   - Implement data tables với React Table
   - Add chart components với Recharts
   - Create advanced form components

## Rủi ro và Giải pháp

### Rủi ro cao
1. **Breaking Changes**: Next.js 15 và React 19 có breaking changes
   - Giải pháp: Review migration guides, test thoroughly
   
2. **UI Component Migration**: Mantine → Radix UI là significant change
   - Giải pháp: Implement wrapper components, migrate gradually

3. **Styling System Overhaul**: SCSS → Tailwind CSS
   - Giải pháp: Use Tailwind CSS migration tools, convert incrementally

### Rủi ro trung bình
1. **State Management Changes**: Zustand v5 API changes
   - Giải pháp: Review changelog, update store patterns

2. **Form System Migration**: react-hook-form learning curve
   - Giải pháp: Start with simple forms, gradually add complexity

### Rủi ro thấp
1. **Development Tools**: Biome, Vitest migration
   - Giải pháp: Good documentation, similar APIs

## Kết luận

Migration dependencies này là một significant overhaul với:
- **15 dependencies được loại bỏ**
- **8 dependencies được nâng cấp**
- **12 dependencies được thay thế**
- **20+ dependencies mới được thêm**

Focus chính là modernizing tech stack trong khi maintaining functionality. Priority là UI component migration, state management refactor, và form system overhaul.