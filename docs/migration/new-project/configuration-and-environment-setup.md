# DOP-FE Configuration and Environment Setup

## Configuration Files

### Package Configuration (package.json)
- **Project Metadata**: 
  - Name: `dop-fe`
  - Version: `0.1.0`
  - Private: true (không publish lên npm)
- **Dependencies**: 
  - **Production**: 59 dependencies bao gồm React 19.1.0, Next.js 15.5.4, Radix UI components, TanStack Query, Zustand, và các thư viện UI khác
  - **Development**: 25 dependencies bao gồm Biome 2.2.0, Storybook 8.6.14, TypeScript 5, Vitest, Playwright, và testing tools
- **Scripts**: 
  - `dev`: Start development server với Turbopack
  - `build`: Build production với TypeScript check và Turbopack
  - `build:static`: Build cho static export
  - `start`: Start production server
  - `lint`: Run Biome linting
  - `format`: Format code với Biome
  - `gen:api`: Generate TypeScript types từ OpenAPI schema
  - `prepare`: Setup Husky git hooks
  - `storybook`: Start Storybook development server
  - `build-storybook`: Build Storybook cho production
- **Engines**: Không có engines specified, nhưng yêu cầu Node.js version tương thích với Next.js 15.5.4

### Next.js Configuration (next.config.ts)
- **Build Configuration**: 
  - Sử dụng Turbopack cho build performance
  - Static export mode (`output: "export"`)
  - Trailing slashes enabled cho static hosting
  - Custom build ID: "build"
- **Environment Variables**: 
  - Hỗ trợ build-time environment variables
  - Asset prefix có thể configure cho production
- **Export Configuration**: 
  - Static export enabled
  - Image optimization disabled cho static export
  - Dynamic routes hỗ trợ on-demand generation
- **Experimental Features**: 
  - Turbopack cho development và build
  - next-intl plugin cho internationalization

### TypeScript Configuration (tsconfig.json)
- **Compiler Options**: 
  - Target: ES2017
  - Lib: dom, dom.iterable, esnext
  - Strict mode enabled
  - Module: esnext với bundler resolution
  - JSX preserve
  - Incremental builds enabled
- **Path Mapping**: 
  - `@/*`: `./src/*` (import alias cho source directory)
- **Include/Exclude**: 
  - Include: next-env.d.ts, tất cả .ts/.tsx files, .next/types
  - Exclude: node_modules, docs
- **Strict Mode Settings**: 
  - Strict mode fully enabled
  - No implicit any, strict null checks, và các strict rules khác

### Biome Configuration (biome.json)
- **Linting Rules**: 
  - Recommended rules enabled
  - Next.js và React domains recommended
  - Suspicious rules với noUnknownAtRules disabled
- **Formatting Rules**: 
  - 2 space indentation
  - Space indentation style
  - Auto-format on save
- **JavaScript/TypeScript**: 
  - ES modules support
  - JSX support
  - Import organization enabled
- **JSON/CSS**: 
  - JSON formatting support
  - CSS formatting với unknown rules disabled

### shadcn/ui Configuration (components.json)
- **Component Library**: 
  - Style: "new-york"
  - RSC (React Server Components) enabled
  - TSX enabled
- **Style Configuration**: 
  - Base color: slate
  - CSS variables enabled
  - Custom CSS path: src/app/globals.css
- **Component Path**: 
  - Components: `@/components`
  - UI components: `@/components/ui`
  - Utils: `@/lib/utils`
  - Hooks: `@/hooks`
  - Lib: `@/lib`
- **Tailwind Configuration**: 
  - Tailwind CSS v4 integration
  - CSS variables cho theming
  - Custom prefix không được sử dụng

## Environment Variables

### Required Environment Variables
- **API Configuration**: 
  - `NEXT_PUBLIC_API_URL`: Base URL cho API calls (https://dop-stg.datanest.vn/v1)
  - `NEXT_PUBLIC_USE_MOCK_API`: Toggle giữa mock và real API ("true"/"false")
- **Authentication**: 
  - `NEXT_PUBLIC_EKYC_AUTH_TOKEN`: VNPT authorization token (sensitive)
  - `NEXT_PUBLIC_EKYC_TOKEN_KEY`: eKYC token key
  - `NEXT_PUBLIC_EKYC_TOKEN_ID`: eKYC token ID
- **Feature Flags**: 
  - Mock API toggle cho development/testing
  - Environment toggle cho eKYC
- **External Services**: 
  - `NEXT_PUBLIC_EKYC_BACKEND_URL`: Backend proxy URL cho eKYC
  - VNPT eKYC service configuration

### Optional Environment Variables
- **Development Tools**: 
  - `EKYC_ENVIRONMENT`: Environment override (development/staging/production)
  - `EKYC_BACKEND_URL`: Server-side eKYC backend URL
  - `EKYC_AUTH_TOKEN`: Server-side eKYC auth token
- **Analytics**: 
  - `@vercel/analytics` integration sẵn có trong dependencies
- **Logging**: 
  - Không có specific logging environment variables
- **Performance**: 
  - Turbopack enabled mặc định trong scripts

### Environment-Specific Configuration
- **Development**: 
  - `NODE_ENV="development"`
  - Mock API enabled mặc định
  - Hot reload với Turbopack
  - Storybook available trên port 6006
- **Staging**: 
  - Sử dụng staging API URL
  - Mock API có thể disabled
  - Build optimizations enabled
- **Production**: 
  - Static export mode
  - Image optimization disabled
  - Asset prefix có thể configure
  - Analytics tracking enabled
- **Testing**: 
  - Vitest configuration cho unit tests
  - Playwright cho E2E tests
  - Storybook testing integration

### Security Considerations
- **Secret Management**: 
  - eKYC auth tokens nên được server-side
  - Environment variables không nên commit vào repo
  - Sensitive data có prefix NEXT_PUBLIC sẽ exposed client-side
- **Client-Side Variables**: 
  - Tất cả variables với NEXT_PUBLIC prefix
  - API URLs và feature flags
  - Public configuration values
- **Server-Side Variables**: 
  - eKYC backend URLs (server-side version)
  - Auth tokens (server-side version)
  - Internal service configurations
- **Best Practices**: 
  - Sử dụng server-side variables cho sensitive data
  - Environment-specific configuration files
  - Regular rotation của auth tokens

## Setup Instructions

### Prerequisites
- **System Requirements**: 
  - Node.js 18+ (tương thích với Next.js 15.5.4)
  - npm hoặc yarn package manager
  - Git cho version control
- **Node.js Version**: 
  - Recommendation: Node.js 18.17+ hoặc 20+
  - LTS version được khuyến nghị
- **Package Manager**: 
  - npm được sử dụng trong scripts
  - yarn cũng compatible
- **Additional Tools**: 
  - Git cho Husky hooks
  - VS Code hoặc IDE tương thích
  - Browser cho development

### Installation Steps
- **Clone Repository**: 
  ```bash
  git clone <repository-url>
  cd dop-fe
  ```
- **Install Dependencies**: 
  ```bash
  npm install
  # hoặc
  yarn install
  ```
- **Environment Setup**: 
  ```bash
  cp .env.example .env.local
  # Edit .env.local với appropriate values
  ```
- **Database Setup**: 
  - Không có database setup required cho frontend-only
  - API endpoints configured qua environment variables

### Development Server
- **Start Development**: 
  ```bash
  npm run dev
  # Server chạy trên http://localhost:3000
  ```
- **Available Scripts**: 
  - `npm run dev`: Development server với Turbopack
  - `npm run storybook`: Component development server
  - `npm run lint`: Code quality checks
  - `npm run format`: Code formatting
- **Hot Reload**: 
  - Turbopack provides fast hot reload
  - Component changes reflect immediately
  - Theme changes apply dynamically
- **Debug Setup**: 
  - VS Code debugging configuration có thể thêm
  - Browser DevTools available
  - React DevTools extension recommended

### Build Process
- **Production Build**: 
  ```bash
  npm run build
  # TypeScript check + Turbopack build
  ```
- **Static Export**: 
  ```bash
  npm run build:static
  # Tạo static files trong /out directory
  ```
- **Optimization**: 
  - Turbopack cho build performance
  - Static export cho deployment flexibility
  - Image optimization disabled cho static hosting
- **Asset Handling**: 
  - Static assets trong /public directory
  - Automatic optimization không available trong static mode
  - Manual optimization required cho images

## Development Tools

### Linting and Formatting
- **Biome Setup**: 
  - Configuration trong biome.json
  - 2-space indentation
  - Auto-import organization
  - React và Next.js specific rules
- **Pre-commit Hooks**: 
  - Husky configured với prepare script
  - lint-staged runs trên pre-commit
  - Automatic formatting trước commit
- **IDE Integration**: 
  - VS Code Biome extension recommended
  - Format on save có thể enable
  - Real-time linting feedback
- **Custom Rules**: 
  - Suspicious rules với exceptions
  - CSS unknown rules disabled
  - Next.js và React best practices

### Testing Framework
- **Unit Testing**: 
  - Vitest configuration trong vitest.config.ts
  - Storybook integration cho component tests
  - Browser testing với Playwright provider
- **Integration Testing**: 
  - Storybook tests cho component integration
  - API testing có thể implement
  - Form flow testing capabilities
- **E2E Testing**: 
  - Playwright dependency available
  - Configuration file cần tạo
  - Browser automation ready
- **Test Scripts**: 
  - Vitest integration với Storybook
  - Browser-based testing
  - Coverage reporting với v8

### Component Development
- **Storybook Setup**: 
  - Configuration trong .storybook/main.ts
  - Custom viewports cho responsive testing
  - Theme switching integration
  - Internationalization support
- **Component Stories**: 
  - Stories trong src/**/*.stories.@(js|jsx|mjs|ts|tsx)
  - MDX documentation support
  - Interactive controls và props
- **Design System**: 
  - shadcn/ui components base
  - Custom theme system
  - Multiple theme variants (default, corporate, creative, medical)
- **Component Testing**: 
  - Storybook test addon
  - Accessibility testing
  - Visual regression testing capabilities

### Debug Configuration
- **Source Maps**: 
  - Enabled trong development
  - TypeScript source mapping
  - Build-time source maps available
- **Debug Scripts**: 
  - Development server với debugging
  - Storybook debugging mode
  - Test debugging với Vitest
- **Browser DevTools**: 
  - React DevTools integration
  - Component inspection
  - Performance profiling
- **VS Code Debug**: 
  - Configuration có thể thêm
  - Breakpoint debugging
  - Extension integration available

## Troubleshooting

### Common Issues
- **Installation Issues**: 
  - Node.js version compatibility
  - Permission errors với global packages
  - Network connectivity issues
- **Build Failures**: 
  - TypeScript compilation errors
  - Missing environment variables
  - Memory issues với large builds
- **Environment Issues**: 
  - Missing .env.local file
  - Incorrect API URLs
  - eKYC token expiration
- **Performance Issues**: 
  - Slow development startup
  - Memory usage với Turbopack
  - Large bundle sizes

### Solutions
- **Dependency Conflicts**: 
  ```bash
  rm -rf node_modules package-lock.json
  npm install
  ```
- **Cache Issues**: 
  ```bash
  npm run build -- --no-cache
  # Hoặc
  rm -rf .next
  ```
- **Port Conflicts**: 
  ```bash
  npm run dev -- --port 3001
  ```
- **Permission Issues**: 
  ```bash
  sudo chown -R $(whoami) node_modules
  # Hoặc sử dụng nvm cho Node.js management
  ```

### Debug Techniques
- **Logging**: 
  - Console logging trong development
  - React DevTools Profiler
  - Network tab cho API debugging
- **Breakpoints**: 
  - VS Code debugging breakpoints
  - Browser devtools breakpoints
  - React component debugging
- **Network Inspection**: 
  - API request/response inspection
  - CORS issues debugging
  - Mock vs real API switching
- **Performance Profiling**: 
  - React Profiler cho component performance
  - Bundle analysis với webpack-bundle-analyzer
  - Memory leak detection

## Key Observations
- **Configuration Strengths**: 
  - Modern toolchain với Turbopack và Biome
  - Comprehensive TypeScript setup
  - Well-structured component system với shadcn/ui
  - Multi-theme support với CSS variables
  - Internationalization ready với next-intl
- **Setup Complexity**: 
  - Moderate complexity với nhiều tools
  - Environment variables cần careful management
  - eKYC integration增加了复杂性
  - Static export mode có limitations
- **Potential Improvements**: 
  - Add Playwright configuration file
  - Implement proper Tailwind config file
  - Add more comprehensive testing setup
  - Consider monorepo structure cho scalability
  - Add deployment automation scripts
- **Maintenance Considerations**: 
  - Regular dependency updates required
  - eKYC token rotation procedures needed
  - Environment variable documentation
  - Component library versioning strategy
  - Performance monitoring setup
- **Developer Experience Notes**: 
  - Fast development với Turbopack
  - Excellent component development với Storybook
  - Good code quality enforcement với Biome
  - Theme switching enhances development
  - Internationalization adds complexity but improves UX