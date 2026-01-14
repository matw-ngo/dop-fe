# DOP-FE - Digital Onboarding Platform Frontend

## Overview
DOP-FE là một Next.js 15.5.4 application với TypeScript, được thiết kế cho digital onboarding platform với eKYC integration, dynamic forms, và admin management system.

## Key Features
- **Dynamic Multi-step Forms**: Backend-driven form rendering với real-time validation
- **eKYC Integration**: VNPT SDK integration cho identity verification
- **Admin Flow Management**: Comprehensive admin interface cho flow configuration
- **Internationalization**: Full i18n support (Vietnamese/English)
- **Modern Tech Stack**: Next.js 15, React 19, TypeScript 5, Tailwind CSS 4
- **Component-driven Architecture**: shadcn/ui với atomic design patterns

## Quick Start
```bash
# Clone repository
git clone https://github.com/your-org/dop-fe.git
cd dop-fe

# Install dependencies
npm install

# Setup environment
cp .env.example .env
# Edit .env với your configuration

# Start development
npm run dev
```

## Documentation
- **[Project Architecture](docs/project-architecture-overview.md)** - Comprehensive architecture overview
- **[Business Flows](docs/business-flows-and-processes.md)** - User journeys và process flows
- **[Data Models](docs/data-models-and-structures.md)** - Type definitions và data structures
- **[Dependencies](docs/dependencies-and-integrations.md)** - Dependencies và third-party integrations
- **[Components](src/docs/application-pages-and-components.tsx)** - Pages và component architecture
- **[Configuration](docs/configuration-and-environment-setup.md)** - Setup và configuration guide
- **[Replication Guide](docs/application-replication-guide.md)** - Step-by-step replication instructions
- **[API Documentation](docs/api-documentation.md)** - Complete API reference
- **[Contributing](docs/contributing.md)** - Development guidelines và contribution process
- **[Deployment](docs/deployment-guide.md)** - Deployment strategies và configurations
- **[Performance](docs/performance-optimization.md)** - Performance optimization guide
- **[Security](docs/security-best-practices.md)** - Security best practices

## Technology Stack
- **Framework**: Next.js 15.5.4 (App Router) với Turbopack
- **UI Library**: React 19.1.0 với shadcn/ui (Radix UI + Tailwind CSS 4)
- **Language**: TypeScript 5.x với strict mode
- **State Management**: Zustand 5.0.8 + TanStack Query 5.90.2
- **Forms**: react-hook-form 7.63.0 + Zod 4.1.11 validation
- **Styling**: Tailwind CSS 4 với CSS-in-JS
- **Testing**: Vitest 3.2.4 + Playwright 1.55.1
- **Build Tools**: Biome 2.2.0 (linting/formatting) + Husky 9.1.7

## API Configuration

### Timeout & Retry Settings
- **Default Timeout**: 30 giây cho các API request thông thường
- **Retry Logic**: Tự động retry tối đa 3 lần với exponential backoff
- **Retry Delays**: 3000ms → 6000ms → 10000ms (được giới hạn bởi max delay 10 giây)
- **Retryable Errors**: Chỉ retry các lỗi timeout tự động (API_TIMEOUT), không retry lỗi do user cancel
- **Special Endpoints**: File upload và streaming endpoints có timeout dài hơn (2-10 phút)

## Project Structure
```
src/
├── app/                    # Next.js App Router
│   ├── [locale]/          # Internationalization routes
│   │   ├── user-onboarding/
│   │   └── (protected)/
│   │       └── admin/
├── components/              # Component library
│   ├── ui/               # shadcn/ui components
│   ├── organisms/         # Complex components
│   ├── features/          # Feature-specific components
│   ├── wrappers/           # Custom wrappers
│   └── renderer/          # Dynamic form rendering
├── lib/                   # Utilities và configurations
│   ├── api/               # OpenAPI client
│   ├── builders/           # Form builders
│   └── ekyc/              # VNPT eKYC integration
├── store/                  # Zustand stores
├── types/                  # TypeScript definitions
├── hooks/                  # Custom React hooks
└── mappers/                 # Data transformation
```

## Development
- **Development Server**: `npm run dev` (http://localhost:3000)
- **Build**: `npm run build` (Static export)
- **Test**: `npm run test` (Vitest + Playwright)
- **Lint**: `npm run lint` (Biome)
- **Storybook**: `npm run storybook` (Component development)

## License
MIT License - see [LICENSE](LICENSE) file for details.
