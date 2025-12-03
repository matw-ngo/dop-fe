# Configuration and Environment Setup

This document provides a comprehensive guide for configuring and setting up the DOP-FE project, which has been migrated to use Next.js 19, shadcn/ui, TypeScript, Zod, eKYC, TanStack Query, Zustand, Tailwind CSS, Biome, and Storybook.

## Table of Contents
- [Configuration Files](#configuration-files)
- [Environment Variables](#environment-variables)
- [Setup Instructions](#setup-instructions)
- [Development Tools](#development-tools)
- [Build and Deployment](#build-and-deployment)
- [Migration Notes](#migration-notes)

## Configuration Files

### Core Configuration Files

| File | Purpose | Key Settings |
|------|---------|--------------|
| [`package.json`](package.json) | Dependency management and scripts | Next.js 15.5.4, React 19.1.0, Biome 2.2.0, Storybook 8.6.14 |
| [`next.config.ts`](next.config.ts) | Next.js configuration | Turbopack enabled, static export mode, next-intl plugin |
| [`tsconfig.json`](tsconfig.json) | TypeScript configuration | Strict mode enabled, path mapping (`@/*` → `./src/*`) |
| [`biome.json`](biome.json) | Biome linting and formatting | 2-space indentation, React/Next.js rules |
| [`components.json`](components.json) | shadcn/ui configuration | New York style, CSS variables, RSC enabled |
| [`tailwind.config.js`](tailwind.config.js) | Tailwind CSS configuration | Custom themes, CSS variables integration |
| [`postcss.config.js`](postcss.config.js) | PostCSS configuration | Tailwind CSS and autoprefixer plugins |
| [`.env.example`](.env.example) | Environment variables template | API URLs, eKYC tokens, feature flags |

### Legacy Configuration (Optional)

| File | Purpose | Migration Status |
|------|---------|------------------|
| [`.eslintrc.json`](.eslintrc.json) | ESLint configuration | Replaced by Biome |
| [`.prettierrc`](.prettierrc) | Prettier configuration | Replaced by Biome |
| [`jest.config.ts`](jest.config.ts) | Jest testing configuration | Replaced by Vitest |
| [`nginx.conf`](nginx.conf) | Nginx configuration | Still relevant for deployment |

## Environment Variables

### Required Environment Variables

```bash
# API Configuration
NEXT_PUBLIC_API_URL=https://dop-stg.datanest.vn/v1
NEXT_PUBLIC_USE_MOCK_API=true

# eKYC Configuration
NEXT_PUBLIC_EKYC_AUTH_TOKEN=your_ekyc_auth_token
NEXT_PUBLIC_EKYC_TOKEN_KEY=your_ekyc_token_key
NEXT_PUBLIC_EKYC_TOKEN_ID=your_ekyc_token_id
NEXT_PUBLIC_EKYC_BACKEND_URL=your_ekyc_backend_url
```

### Optional Environment Variables

```bash
# Development
EKYC_ENVIRONMENT=development
EKYC_BACKEND_URL=server_side_ekyc_url
EKYC_AUTH_TOKEN=server_side_ekyc_token

# Analytics
NEXT_PUBLIC_GA_ID=your_google_analytics_id
NEXT_PUBLIC_FINGERPRINTJS_API_KEY=your_fingerprintjs_api_key
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=your_recaptcha_site_key
```

### Environment-Specific Configuration

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

### Security Considerations

- **Client-side variables** (NEXT_PUBLIC_*) are exposed to the browser
- **Server-side variables** are only available on the server
- Store sensitive data (auth tokens, API keys) as server-side variables when possible
- Regularly rotate authentication tokens
- Never commit environment files to version control

## Setup Instructions

### Prerequisites

- **Node.js**: Version 18.17+ or 20+ (LTS recommended)
- **Package Manager**: npm (default) or yarn
- **Git**: For version control and Husky hooks
- **IDE**: VS Code with Biome extension recommended

### Installation Steps

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd dop-fe
   ```

2. **Install dependencies**:
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Set up environment variables**:
   ```bash
   cp .env.example .env.local
   # Edit .env.local with appropriate values
   ```

4. **Initialize git hooks**:
   ```bash
   npm run prepare
   ```

5. **Start the development server**:
   ```bash
   npm run dev
   ```

6. **Access the application**:
   - Main app: [http://localhost:3000](http://localhost:3000)
   - Storybook: [http://localhost:6006](http://localhost:6006)

### Development Workflow

```bash
# Start development server with Turbopack
npm run dev

# Start Storybook for component development
npm run storybook

# Run linting (Biome)
npm run lint

# Format code (Biome)
npm run format

# Generate API types from OpenAPI schema
npm run gen:api
```

## Development Tools

### Linting and Formatting with Biome

The project uses Biome for both linting and formatting, replacing ESLint and Prettier:

```json
// biome.json
{
  "$schema": "https://biomejs.dev/schemas/1.9.4/schema.json",
  "formatter": {
    "indentWidth": 2,
    "indentStyle": "space"
  },
  "javascript": {
    "formatter": {
      "quoteStyle": "single",
      "trailingCommas": "es5"
    }
  },
  "linter": {
    "rules": {
      "recommended": true,
      "suspicious": {
        "noUnknownAtRules": "off"
      }
    }
  }
}
```

### Testing Framework

- **Unit Testing**: Vitest with React Testing Library
- **Component Testing**: Storybook with test addon
- **E2E Testing**: Playwright (configuration to be added)

```bash
# Run unit tests
npm run test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

### Component Development with Storybook

Storybook is configured for component development and documentation:

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

### Theme System

The project supports multiple themes using CSS variables:

```typescript
// Available themes
const themes = {
  default: {
    colors: {
      primary: 'hsl(222.2 84% 4.9%)',
      // ... more colors
    }
  },
  corporate: {
    colors: {
      primary: 'hsl(210 40% 12%)',
      // ... more colors
    }
  },
  creative: {
    colors: {
      primary: 'hsl(280 100% 50%)',
      // ... more colors
    }
  },
  medical: {
    colors: {
      primary: 'hsl(160 84% 39%)',
      // ... more colors
    }
  }
};
```

## Build and Deployment

### Build Process

```bash
# Production build with TypeScript check
npm run build

# Static export for static hosting
npm run build:static

# Start production server
npm run start
```

### Next.js Configuration

```typescript
// next.config.ts
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  experimental: {
    turbopack: true,
  },
  transpilePackages: ['@tanstack/react-query'],
};

export default nextConfig;
```

### Deployment Options

1. **Vercel** (Recommended for Next.js)
2. **Netlify** (For static export)
3. **AWS S3 + CloudFront** (For custom CDN)
4. **Docker** (For containerized deployment)

#### Docker Configuration

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

## Migration Notes

### From Old Project Configuration

| Old Component | New Component | Migration Notes |
|---------------|----------------|-----------------|
| ESLint | Biome | Complete replacement, faster performance |
| Prettier | Biome | Unified formatting and linting |
| Jest | Vitest | Faster test execution, better TypeScript support |
| Next.js 13 | Next.js 15.5.4 | Turbopack, improved performance |
| React 18 | React 19.1.0 | Latest features and optimizations |
| Custom CSS | Tailwind CSS + shadcn/ui | Modern utility-first CSS framework |
| Redux | Zustand | Simpler state management |
| Custom forms | React Hook Form + Zod | Type-safe form validation |
| Custom API client | TanStack Query | Advanced data fetching and caching |

### Key Improvements

1. **Performance**: Turbopack for faster builds and development
2. **Type Safety**: Comprehensive TypeScript with Zod validation
3. **Developer Experience**: Biome for fast linting/formatting, Storybook for component development
4. **Modern Stack**: React 19, Next.js 15, and latest ecosystem tools
5. **Code Quality**: Pre-commit hooks with Husky, automated formatting
6. **Testing**: Vitest for faster unit tests, Playwright for E2E testing
7. **Styling**: Tailwind CSS with shadcn/ui components
8. **State Management**: Zustand for simpler, more efficient state management

### Configuration Best Practices

1. **Environment Variables**: Use `.env.local` for development, separate files for each environment
2. **Code Quality**: Biome handles both linting and formatting automatically
3. **Component Development**: Use Storybook for isolated component development
4. **Testing**: Write tests alongside components, use Vitest for unit tests
5. **Performance**: Leverage Turbopack for development and builds
6. **Security**: Keep sensitive data server-side, rotate tokens regularly
7. **Documentation**: Document components with Storybook stories and MDX

### Troubleshooting

#### Common Issues

1. **Build Failures**:
   ```bash
   # Clear cache and rebuild
   rm -rf .next
   npm run build
   ```

2. **Dependency Issues**:
   ```bash
   # Clean install
   rm -rf node_modules package-lock.json
   npm install
   ```

3. **Environment Variables Not Loading**:
   - Ensure `.env.local` is in the root directory
   - Restart the development server after changing variables
   - Verify variable names have `NEXT_PUBLIC_` prefix for client-side access

4. **Biome Formatting Issues**:
   ```bash
   # Check Biome configuration
   npx biome check --write .
   ```

5. **Storybook Issues**:
   ```bash
   # Rebuild Storybook
   npm run build-storybook
   ```

#### Performance Optimization

1. **Bundle Analysis**:
   ```bash
   npm run analyze
   ```

2. **Image Optimization**: Manual optimization required for static export mode
3. **Code Splitting**: Use dynamic imports for large components
4. **Caching**: Leverage Next.js built-in caching mechanisms

### Next Steps

1. Set up Playwright configuration for E2E testing
2. Implement CI/CD pipeline with automated testing
3. Add performance monitoring and error tracking
4. Configure deployment automation
5. Set up monitoring for production environment
6. Implement proper logging and debugging tools
7. Add comprehensive documentation for API endpoints