# Hướng dẫn Cấu hình và Thiết lập Môi trường

Tài liệu này cung cấp hướng dẫn toàn diện về việc cấu hình và thiết lập dự án DOP-FE, đã được chuyển đổi sang Next.js 15, shadcn/ui, TypeScript, Zod, eKYC, TanStack Query, Zustand, Tailwind CSS, Biome và Storybook.

## Mục lục
- [Tệp cấu hình](#tệp-cấu-hình)
- [Biến môi trường](#biến-môi-trường)
- [Hướng dẫn thiết lập](#hướng-dẫn-thiết-lập)
- [Công cụ phát triển](#công-cụ-phát-triển)
- [Build và triển khai](#build-và-triển-khai)
- [Ghi chú chuyển đổi](#ghi-chú-chuyển-đổi)
- [Khắc phục sự cố](#khắc-phục-sự-cố)

## Tệp cấu hình

### Tệp cấu hình chính

| Tệp | Mục đích | Cài đặt chính |
|------|---------|--------------|
| [`package.json`](package.json) | Quản lý dependencies và scripts | Next.js 15.5.4, React 19.1.0, Biome 2.2.0, Storybook 8.6.14 |
| [`next.config.ts`](next.config.ts) | Cấu hình Next.js | Turbopack được bật, chế độ xuất khẩu tĩnh, next-intl plugin |
| [`tsconfig.json`](tsconfig.json) | Cấu hình TypeScript | Chế độ strict được bật, ánh xạ đường dẫn (`@/*` → `./src/*`) |
| [`biome.json`](biome.json) | Linting và formatting với Biome | Thụt lề 2 khoảng trắng, quy tắc React/Next.js |
| [`components.json`](components.json) | Cấu hình shadcn/ui | Kiểu New York, biến CSS, RSC được bật |
| [`postcss.config.mjs`](postcss.config.mjs) | Cấu hình PostCSS | Plugin Tailwind CSS |
| [`.env.example`](.env.example) | Mẫu biến môi trường | URL API, token eKYC, feature flags |

### Cấu hình Tailwind CSS

Tailwind CSS được cấu hình thông qua:
- **PostCSS plugin**: Sử dụng `@tailwindcss/postcss` trong [`postcss.config.mjs`](postcss.config.mjs)
- **CSS Variables**: Định nghĩa trong [`src/app/globals.css`](src/app/globals.css) với `@theme inline`
- **Theme Integration**: Hỗ trợ dark mode với `@custom-variant dark`

### Cấu hình Testing

| Tệp | Mục đích | Cài đặt chính |
|------|---------|--------------|
| [`vitest.config.ts`](vitest.config.ts) | Cấu hình Vitest | Tích hợp Storybook, Playwright cho browser testing |

## Biến môi trường

### Biến môi trường bắt buộc

```bash
# Cấu hình API
NEXT_PUBLIC_API_URL=https://dop-stg.datanest.vn/v1
NEXT_PUBLIC_USE_MOCK_API=true

# Cấu hình eKYC
NEXT_PUBLIC_EKYC_AUTH_TOKEN=your_ekyc_auth_token
NEXT_PUBLIC_EKYC_TOKEN_KEY=your_ekyc_token_key
NEXT_PUBLIC_EKYC_TOKEN_ID=your_ekyc_token_id
NEXT_PUBLIC_EKYC_BACKEND_URL=your_ekyc_backend_url
```

### Biến môi trường tùy chọn

```bash
# Phát triển
EKYC_ENVIRONMENT=development
EKYC_BACKEND_URL=server_side_ekyc_url
EKYC_AUTH_TOKEN=server_side_ekyc_token

# Analytics
NEXT_PUBLIC_GA_ID=your_google_analytics_id
NEXT_PUBLIC_FINGERPRINTJS_API_KEY=your_fingerprintjs_api_key
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=your_recaptcha_site_key
```

### Cấu hình theo môi trường

#### Development (.env.local)
```bash
NODE_ENV=development
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_USE_MOCK_API=true
NEXT_PUBLIC_ENV_MODE=dev
```

#### Staging (.env.staging)
```bash
NODE_ENV=production
NEXT_PUBLIC_API_URL=https://dop-stg.datanest.vn/v1
NEXT_PUBLIC_USE_MOCK_API=false
NEXT_PUBLIC_ENV_MODE=staging
```

#### Production (.env.production)
```bash
NODE_ENV=production
NEXT_PUBLIC_API_URL=https://dop.datanest.vn/v1
NEXT_PUBLIC_USE_MOCK_API=false
NEXT_PUBLIC_ENV_MODE=production
NEXT_PUBLIC_GA_ID=G-DGJ1SB5SHK
```

### Lưu ý bảo mật

- **Biến client-side** (NEXT_PUBLIC_*) được hiển thị trên trình duyệt
- **Biến server-side** chỉ có sẵn trên máy chủ
- Lưu trữ dữ liệu nhạy cảm (auth tokens, API keys) dưới dạng biến server-side khi có thể
- Thường xuyên xoay vòng authentication tokens
- Không bao giờ commit các tệp môi trường vào version control

## Hướng dẫn thiết lập

### Điều kiện tiên quyết

- **Node.js**: Phiên bản 18.17+ hoặc 20+ (khuyến nghị LTS)
- **Package Manager**: npm (mặc định) hoặc yarn
- **Git**: Đối với version control và hooks Husky
- **IDE**: VS Code với extension Biome được khuyến nghị

### Các bước cài đặt

1. **Clone repository**:
   ```bash
   git clone <repository-url>
   cd dop-fe
   ```

2. **Cài đặt dependencies**:
   ```bash
   npm install
   # hoặc
   yarn install
   ```

3. **Thiết lập biến môi trường**:
   ```bash
   cp .env.example .env.local
   # Chỉnh sửa .env.local với các giá trị phù hợp
   ```

4. **Khởi tạo git hooks**:
   ```bash
   npm run prepare
   ```

5. **Khởi động development server**:
   ```bash
   npm run dev
   ```

6. **Truy cập ứng dụng**:
   - Main app: [http://localhost:3000](http://localhost:3000)
   - Storybook: [http://localhost:6006](http://localhost:6006)

### Quy trình phát triển

```bash
# Khởi động development server với Turbopack
npm run dev

# Khởi động Storybook để phát triển component
npm run storybook

# Chạy linting (Biome)
npm run lint

# Định dạng code (Biome)
npm run format

# Tạo API types từ OpenAPI schema
npm run gen:api
```

## Công cụ phát triển

### Linting và Formatting với Biome

Dự án sử dụng Biome cho cả linting và formatting, thay thế ESLint và Prettier:

```json
// biome.json
{
  "$schema": "https://biomejs.dev/schemas/2.2.0/schema.json",
  "formatter": {
    "indentWidth": 2,
    "indentStyle": "space"
  },
  "linter": {
    "rules": {
      "recommended": true,
      "suspicious": {
        "noUnknownAtRules": "off"
      }
    },
    "domains": {
      "next": "recommended",
      "react": "recommended"
    }
  }
}
```

### Framework Testing

- **Unit Testing**: Vitest với React Testing Library
- **Component Testing**: Storybook với test addon
- **E2E Testing**: Playwright (cấu hình sẽ được thêm)

```bash
# Chạy unit tests
npm run test

# Chạy tests với coverage
npm run test:coverage

# Chạy tests ở chế độ watch
npm run test:watch
```

### Phát triển Component với Storybook

Storybook được cấu hình cho phát triển và tài liệu hóa component:

```typescript
// .storybook/main.ts
import type { StorybookConfig } from '@storybook/nextjs';

const config: StorybookConfig = {
  stories: ['../src/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
  addons: [
    '@storybook/addon-onboarding',
    '@storybook/addon-essentials',
    '@chromatic-com/storybook',
    '@storybook/addon-interactions',
  ],
  framework: {
    name: '@storybook/nextjs',
    options: {},
  },
};

export default config;
```

### Hệ thống Theme

Dự án hỗ trợ nhiều theme sử dụng CSS variables:

```css
/* src/app/globals.css */
@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-primary: var(--primary);
  --color-secondary: var(--secondary);
  /* ... nhiều màu hơn */
}
```

## Build và Triển khai

### Quy trình Build

```bash
# Production build với TypeScript check
npm run build

# Xuất khẩu tĩnh cho static hosting
npm run build:static

# Khởi động production server
npm run start
```

### Cấu hình Next.js

```typescript
// next.config.ts
import type { NextConfig } from "next";
import withNextIntl from "next-intl/plugin";

const nextConfig: NextConfig = {
  turbopack: {
    root: process.cwd(),
  },
  output: "export",
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  generateBuildId: async () => "build",
};

const withNextIntlConfig = withNextIntl("./src/i18n/request.ts");

export default withNextIntlConfig(nextConfig);
```

### Tùy chọn Triển khai

1. **Vercel** (Khuyến nghị cho Next.js)
2. **Netlify** (Đối với static export)
3. **AWS S3 + CloudFront** (Đối với CDN tùy chỉnh)
4. **Docker** (Đối với triển khai containerized)

#### Cấu hình Docker

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

## Ghi chú chuyển đổi

### Từ cấu hình dự án cũ

| Component cũ | Component mới | Ghi chú chuyển đổi |
|---------------|----------------|-----------------|
| ESLint | Biome | Thay thế hoàn toàn, hiệu suất nhanh hơn |
| Prettier | Biome | Định dạng và linting thống nhất |
| Jest | Vitest | Thực thi test nhanh hơn, hỗ trợ TypeScript tốt hơn |
| Next.js 13 | Next.js 15.5.4 | Turbopack, hiệu suất cải tiến |
| React 18 | React 19.1.0 | Tính năng và tối ưu hóa mới nhất |
| Custom CSS | Tailwind CSS + shadcn/ui | Framework CSS utility-first hiện đại |
| Redux | Zustand | Quản lý state đơn giản hơn |
| Custom forms | React Hook Form + Zod | Xác thực form an toàn kiểu |
| Custom API client | TanStack Query | Lấy dữ liệu và caching nâng cao |

### Cải tiến chính

1. **Hiệu suất**: Turbopack cho builds và phát triển nhanh hơn
2. **Type Safety**: TypeScript toàn diện với xác thực Zod
3. **Trải nghiệm nhà phát triển**: Biome cho linting/formatting nhanh, Storybook cho phát triển component
4. **Stack hiện đại**: React 19, Next.js 15 và các công cụ hệ sinh thái mới nhất
5. **Chất lượng code**: Pre-commit hooks với Husky, định dạng tự động
6. **Testing**: Vitest cho unit tests nhanh hơn, Playwright cho E2E testing
7. **Styling**: Tailwind CSS với components shadcn/ui
8. **Quản lý State**: Zustand cho quản lý state đơn giản và hiệu quả hơn

### Thực hành tốt nhất cho cấu hình

1. **Biến môi trường**: Sử dụng `.env.local` cho phát triển, tệp riêng cho mỗi môi trường
2. **Chất lượng code**: Biome xử lý cả linting và formatting tự động
3. **Phát triển Component**: Sử dụng Storybook cho phát triển component cô lập
4. **Testing**: Viết tests cùng với components, sử dụng Vitest cho unit tests
5. **Hiệu suất**: Tận dụng Turbopack cho phát triển và builds
6. **Bảo mật**: Giữ dữ liệu nhạy cảm ở server-side, xoay vòng token thường xuyên
7. **Tài liệu**: Tài liệu hóa components với Storybook stories và MDX

## Khắc phục sự cố

### Vấn đề phổ biến

1. **Build Failures**:
   ```bash
   # Xóa cache và build lại
   rm -rf .next
   npm run build
   ```

2. **Vấn đề Dependencies**:
   ```bash
   # Cài đặt sạch
   rm -rf node_modules package-lock.json
   npm install
   ```

3. **Biến môi trường không tải**:
   - Đảm bảo `.env.local` nằm trong thư mục gốc
   - Khởi động lại development server sau khi thay đổi biến
   - Xác minh tên biến có tiền tố `NEXT_PUBLIC_` để truy cập client-side

4. **Vấn đề Formatting Biome**:
   ```bash
   # Kiểm tra cấu hình Biome
   npx biome check --write .
   ```

5. **Vấn đề Storybook**:
   ```bash
   # Build lại Storybook
   npm run build-storybook
   ```

### Tối ưu hóa hiệu suất

1. **Phân tích Bundle**:
   ```bash
   npm run analyze
   ```

2. **Tối ưu hóa Image**: Cần tối ưu hóa thủ công cho chế độ xuất khẩu tĩnh
3. **Code Splitting**: Sử dụng dynamic imports cho các components lớn
4. **Caching**: Tận dụng cơ chế caching tích hợp của Next.js

### Các bước tiếp theo

1. Thiết lập cấu hình Playwright cho E2E testing
2. Triển khai pipeline CI/CD với automated testing
3. Thêm performance monitoring và error tracking
4. Cấu hình deployment automation
5. Thiết lập monitoring cho môi trường production
6. Triển khai logging và debugging tools phù hợp
7. Thêm tài liệu toàn diện cho các API endpoints