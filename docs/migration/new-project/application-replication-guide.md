# DOP-FE Application Replication Guide

## Prerequisites

### System Requirements
- **Operating System**: Windows 10+, macOS 10.15+, hoặc Linux (Ubuntu 18.04+)
- **Node.js Version**: 18.17.0+ hoặc 20.x LTS (khuyến nghị dùng LTS version)
- **Memory Requirements**: Tối thiểu 8GB RAM, khuyến nghị 16GB cho development hiệu quả
- **Storage Requirements**: Tối thiểu 5GB disk space cho project và dependencies

### Required Software
- **Version Control**: Git 2.30+ cho version control và Husky hooks
- **Code Editor**: VS Code (khuyến nghị) với các extensions:
  - Biome extension cho linting và formatting
  - TypeScript và React extensions
  - Tailwind CSS IntelliSense
- **Browser**: Chrome 90+, Firefox 88+, Safari 14+ cho development và testing
- **Additional Tools**: 
  - npm 9+ hoặc yarn 1.22+
  - nvm (khuyến nghị) cho Node.js version management

### Account Requirements
- **Git Repository**: Access đến DOP-FE repository qua GitHub/GitLab
- **API Keys**: 
  - VNPT eKYC authorization token
  - API endpoints configuration
- **Third-party Services**: 
  - VNPT eKYC service account (nếu cần production)
  - Vercel/Netlify account (nếu deploy)
- **Development Tools**: 
  - Storybook account (optional)
  - Vercel Analytics (nếu cần tracking)

### Hardware Requirements
- **CPU**: Dual-core 2.0GHz+, khuyến nghị quad-core cho build performance
- **RAM**: 8GB+, khuyến nghị 16GB cho Turbopack và development tools
- **Graphics**: Không yêu cầu GPU đặc biệt, nhưng integrated graphics hỗ trợ hiển thị tốt
- **Network**: Internet connection ổn định cho package installation và API calls

## Detailed Setup Steps

### Step 1: Repository Setup
- **Clone Repository**: 
  ```bash
  git clone <repository-url>
  cd dop-fe
  ```
- **Branch Strategy**: 
  - `main`/`master`: Production-ready code
  - `develop`: Development branch
  - `feature/*`: Feature-specific branches
- **Repository Structure**: 
  - `src/`: Source code chính
  - `public/`: Static assets
  - `docs/`: Documentation
  - `messages/`: Internationalization files
- **Initial Configuration**: 
  ```bash
  # Kiểm tra Node.js version
  node --version  # Should be 18.17+ or 20.x
  
  # Kiểm tra npm version
  npm --version  # Should be 9+
  ```

### Step 2: Environment Preparation
- **Node.js Installation**: 
  ```bash
  # Sử dụng nvm (khuyến nghị)
  nvm install 20
  nvm use 20
  nvm alias default 20
  
  # Hoặc download từ nodejs.org
  ```
- **Package Manager**: 
  ```bash
  # npm được sử dụng trong scripts
  npm install -g npm@latest
  
  # yarn cũng compatible (optional)
  npm install -g yarn
  ```
- **Environment Variables**: 
  ```bash
  # Copy environment template
  cp .env.example .env.local
  
  # Edit với appropriate values
  # Đừng commit .env.local vào repository
  ```
- **Global Packages**: 
  ```bash
  # Required cho development
  npm install -g @biomejs/biome
  
  # Optional cho testing
  npm install -g @storybook/cli
  ```

### Step 3: Dependency Installation
- **Install Dependencies**: 
  ```bash
  npm install
  # Hoặc
  yarn install
  ```
- **Verification**: 
  ```bash
  # Kiểm tra package.json scripts
  npm run --help
  
  # Verify TypeScript compilation
  npx tsc --noEmit
  ```
- **Common Issues**: 
  - Node.js version incompatible: Upgrade/downgrade Node.js
  - Permission errors: Sử dụng nvm hoặc fix permissions
  - Network issues: Sử dụng npm registry mirror
- **Solutions**: 
  ```bash
  # Clean install nếu có issues
  rm -rf node_modules package-lock.json
  npm install
  
  # Sử dụng registry mirror nếu network slow
  npm config set registry https://registry.npmmirror.com
  ```

### Step 4: Configuration Setup
- **Environment Variables**: 
  ```bash
  # .env.local configuration
  # eKYC Configuration
  NEXT_PUBLIC_EKYC_BACKEND_URL=""  # Leave empty để call VNPT directly
  NEXT_PUBLIC_EKYC_TOKEN_KEY="+=="
  NEXT_PUBLIC_EKYC_TOKEN_ID="b85b"
  NEXT_PUBLIC_EKYC_AUTH_TOKEN="your-vnpt-authorization-token"
  
  # API Configuration
  NEXT_PUBLIC_USE_MOCK_API="true"  # Set "false" cho production
  NEXT_PUBLIC_API_URL="https://dop-stg.datanest.vn/v1"
  
  # Environment
  NODE_ENV="development"
  ```
- **API Configuration**: 
  - Mock API enabled mặc định cho development
  - Real API URL configured trong environment variables
  - eKYC endpoints configured qua VNPT SDK
- **Service Configuration**: 
  - VNPT eKYC SDK integration trong `src/lib/ekyc/`
  - Mock responses trong `src/lib/api/mock-responses.ts`
  - OpenAPI schema trong `src/lib/api/schema.yaml`
- **Development Settings**: 
  - Turbopack enabled trong development scripts
  - Hot reload với Next.js dev server
  - Storybook trên port 6006

### Step 5: Development Server
- **Start Development**: 
  ```bash
  npm run dev
  # Server chạy trên http://localhost:3000
  ```
- **Available Scripts**: 
  ```bash
  npm run dev          # Development server với Turbopack
  npm run build        # Production build
  npm run build:static # Static export build
  npm run start        # Production server
  npm run lint         # Biome linting
  npm run format       # Biome formatting
  npm run storybook    # Component development server
  npm run gen:api      # Generate API types
  ```
- **Port Configuration**: 
  ```bash
  # Default port 3000
  npm run dev
  
  # Custom port nếu conflict
  npm run dev -- --port 3001
  ```
- **Hot Reload**: 
  - Turbopack provides fast hot reload
  - Component changes reflect immediately
  - Theme changes apply dynamically

### Step 6: Mock Services Setup
- **Mock API Setup**: 
  ```bash
  # Mock API enabled mặc định
  # Toggle trong .env.local
  NEXT_PUBLIC_USE_MOCK_API="true"
  ```
- **Database Mocking**: 
  - Mock responses trong `src/lib/api/mock-responses.ts`
  - Admin flow mock data
  - User onboarding mock data
- **Authentication Mocking**: 
  - Mock auth state trong `src/store/use-auth-store.ts`
  - Development auth bypass
- **External Service Mocking**: 
  - VNPT eKYC mock trong development
  - Mock responses cho API endpoints
  - Development data fixtures

## Verification Steps

### Functional Testing
- **Homepage Verification**: 
  ```bash
  # Start development server
  npm run dev
  
  # Navigate to http://localhost:3000
  # Verify:
  # - Hero section renders correctly
  # - Features section displays
  # - Onboarding card functional
  # - Language switching works (vi/en)
  ```
- **Onboarding Flow**: 
  ```bash
  # Navigate to http://localhost:3000/user-onboarding
  # Verify:
  # - Multi-step form renders
  # - Form validation works
  # - Data persistence between steps
  # - Success page redirects correctly
  ```
- **Admin Interface**: 
  ```bash
  # Navigate to http://localhost:3000/admin
  # Verify:
  # - Login page renders
  # - Admin dashboard accessible
  # - Flow management interface works
  # - Data tables render correctly
  ```
- **eKYC Integration**: 
  ```bash
  # Test trong development mode
  # Verify:
  # - VNPT SDK loads correctly
  # - Camera access works
  # - OCR processing functional
  # - Data mapping works
  ```

### Performance Testing
- **Load Time**: 
  ```bash
  # Use browser DevTools
  # Check:
  # - First Contentful Paint < 2s
  # - Largest Contentful Paint < 2.5s
  # - Time to Interactive < 3.5s
  ```
- **Bundle Size**: 
  ```bash
  # Build và analyze
  npm run build
  
  # Check .next/build-manifest.json
  # Verify:
  # - Main bundle size < 500KB gzipped
  # - Vendor chunks properly split
  # - Dynamic imports working
  ```
- **Memory Usage**: 
  ```bash
  # Monitor với browser DevTools
  # Check:
  # - Initial memory usage < 50MB
  # - No memory leaks during navigation
  # - Garbage collection working
  ```
- **Network Requests**: 
  ```bash
  # Use Network tab trong DevTools
  # Verify:
  # - No unnecessary requests
  # - Proper caching headers
  # - API calls optimized
  ```

### Security Testing
- **Authentication**: 
  ```bash
  # Test auth flows
  # Verify:
  # - Protected routes secure
  # - Auth state persists
  # - Logout functionality works
  ```
- **Data Protection**: 
  ```bash
  # Check data handling
  # Verify:
  # - Sensitive data not in localStorage
  # - API calls use HTTPS
  # - Input validation working
  ```
- **XSS Prevention**: 
  ```bash
  # Test XSS protection
  # Verify:
  # - User input sanitized
  # - Script injection blocked
  # - CSP headers present
  ```
- **CORS Configuration**: 
  ```bash
  # Test CORS setup
  # Verify:
  # - Proper CORS headers
  # - Cross-origin requests controlled
  # - Preflight requests handled
  ```

### Cross-browser Testing
- **Supported Browsers**: 
  - Chrome 90+ (primary development)
  - Firefox 88+
  - Safari 14+
  - Edge 90+
- **Testing Tools**: 
  - BrowserStack (optional)
  - Local browser testing
  - Responsive DevTools
- **Known Issues**: 
  - Safari: WebRTC compatibility issues với eKYC
  - Firefox: CSS Grid rendering differences
  - IE: Not supported
- **Fallbacks**: 
  - Polyfills cho older browsers
  - Graceful degradation cho unsupported features
  - Alternative UI components

## Deployment Options

### Static Export Deployment
- **Build Process**: 
  ```bash
  # Build static files
  npm run build:static
  
  # Output trong /out directory
  ```
- **File Structure**: 
  ```
  out/
  ├── _next/static/          # Static assets
  ├── [locale]/             # Localized routes
  │   ├── index.html
  │   ├── user-onboarding/
  │   └── admin/
  ├── index.html            # Root page
  └── ...                   # Other static files
  ```
- **Configuration**: 
  - `next.config.ts` với `output: "export"`
  - `trailingSlash: true` cho proper URLs
  - `images: { unoptimized: true }`
- **Optimization**: 
  - Manual image optimization required
  - Asset compression recommended
  - CDN integration beneficial

### Vercel Deployment
- **Vercel Setup**: 
  ```bash
  # Install Vercel CLI
  npm install -g vercel
  
  # Deploy project
  vercel
  
  # Configure project settings
  ```
- **Environment Variables**: 
  ```bash
  # Set trong Vercel dashboard
  # Hoặc via CLI
  vercel env add NEXT_PUBLIC_API_URL
  vercel env add NEXT_PUBLIC_EKYC_AUTH_TOKEN
  ```
- **Build Configuration**: 
  ```json
  // vercel.json
  {
    "buildCommand": "npm run build",
    "outputDirectory": ".next",
    "framework": "nextjs"
  }
  ```
- **Domain Setup**: 
  ```bash
  # Custom domain configuration
  vercel domains add yourdomain.com
  
  # SSL automatic với Vercel
  ```

### Netlify Deployment
- **Netlify Setup**: 
  ```bash
  # Connect repository
  # Configure build settings
  ```
- **Build Commands**: 
  ```
  Build command: npm run build:static
  Publish directory: out
  ```
- **Redirect Rules**: 
  ```toml
  # netlify.toml
  [[redirects]]
    from = "/*"
    to = "/index.html"
    status = 200
  ```
- **Forms Handling**: 
  ```html
  <!-- Netlify forms -->
  <form name="contact" netlify>
    <!-- Form fields -->
  </form>
  ```

### Custom Server Deployment
- **Server Requirements**: 
  - Node.js 18.17+
  - Nginx hoặc Apache
  - SSL certificate
  - PM2 cho process management
- **Nginx Configuration**: 
  ```nginx
  server {
    listen 80;
    server_name yourdomain.com;
    
    location / {
      root /var/www/dop-fe/out;
      try_files $uri $uri.html $uri/ =404;
    }
    
    # Static asset caching
    location /_next/static/ {
      expires 1y;
      add_header Cache-Control "public, immutable";
    }
  }
  ```
- **SSL Configuration**: 
  ```bash
  # Let's Encrypt certificate
  certbot --nginx -d yourdomain.com
  ```
- **Monitoring**: 
  ```bash
  # PM2 process management
  pm2 start ecosystem.config.js
  
  # Health checks
  curl http://localhost:3000/api/health
  ```

## Troubleshooting

### Common Installation Issues
- **Node.js Version**: 
  ```bash
  # Check version compatibility
  node --version  # Should be 18.17+ or 20.x
  
  # Upgrade nếu cần
  nvm install 20
  nvm use 20
  ```
- **Permission Errors**: 
  ```bash
  # Fix npm permissions
  sudo chown -R $(whoami) ~/.npm
  
  # Hoặc sử dụng nvm
  curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
  ```
- **Network Issues**: 
  ```bash
  # Sử dụng registry mirror
  npm config set registry https://registry.npmmirror.com
  
  # Hoặc sử dụng yarn
  yarn config set registry https://registry.npmmirror.com
  ```
- **Cache Issues**: 
  ```bash
  # Clear npm cache
  npm cache clean --force
  
  # Clear Next.js cache
  rm -rf .next
  ```

### Development Startup Problems
- **Port Conflicts**: 
  ```bash
  # Find process using port
  lsof -i :3000
  
  # Kill process
  kill -9 <PID>
  
  # Hoặc sử dụng different port
  npm run dev -- --port 3001
  ```
- **Environment Variables**: 
  ```bash
  # Verify .env.local exists
  ls -la .env.local
  
  # Check variable names
  grep NEXT_PUBLIC .env.local
  
  # Restart server sau khi thay đổi
  npm run dev
  ```
- **Service Dependencies**: 
  ```bash
  # Check mock API status
  # Verify NEXT_PUBLIC_USE_MOCK_API="true"
  
  # Test API connectivity
  curl $NEXT_PUBLIC_API_URL/health
  ```
- **Module Resolution**: 
  ```bash
  # Check tsconfig.json paths
  cat tsconfig.json | grep -A 5 "paths"
  
  # Verify imports
  grep -r "@/" src/ --include="*.ts" --include="*.tsx"
  ```

### Build Errors
- **TypeScript Errors**: 
  ```bash
  # Check TypeScript compilation
  npx tsc --noEmit
  
  # Fix specific errors
  # Common issues:
  # - Missing type definitions
  # - Incorrect import paths
  # - Type mismatches
  ```
- **Dependency Conflicts**: 
  ```bash
  # Check for conflicts
  npm ls
  
  # Fix conflicts
  npm install --force
  
  # Hoặc use resolutions trong package.json
  ```
- **Build Optimization**: 
  ```bash
  # Check bundle size
  npm run build
  
  # Analyze bundle
  npx webpack-bundle-analyzer .next/static/chunks/
  ```
- **Static Export Issues**: 
  ```bash
  # Check next.config.ts
  cat next.config.ts | grep -A 5 "output"
  
  # Verify dynamic routes
  grep -r "generateStaticParams" src/app/
  ```

### Performance Issues
- **Slow Development**: 
  ```bash
  # Check system resources
  top | grep node
  
  # Optimize imports
  npm run lint
  
  # Enable Turbopack (default)
  npm run dev --turbopack
  ```
- **Memory Leaks**: 
  ```bash
  # Monitor memory usage
  node --inspect src/app/dev-server.js
  
  # Check React DevTools Profiler
  # Profile component rendering
  ```
- **Bundle Size**: 
  ```bash
  # Analyze bundle
  npm run build
  npx next-bundle-analyzer
  
  # Optimize imports
  # Remove unused dependencies
  ```
- **Network Performance**: 
  ```bash
  # Check API response times
  curl -w "@curl-format.txt" $NEXT_PUBLIC_API_URL/health
  
  # Optimize images
  # Enable compression
  ```

## Advanced Configuration

### Custom Development Setup
- **IDE Configuration**: 
  ```json
  // .vscode/settings.json
  {
    "editor.formatOnSave": true,
    "editor.defaultFormatter": "biomejs.biome",
    "typescript.preferences.importModuleSpecifier": "relative",
    "emmet.includeLanguages": {
      "typescript": "html",
      "typescriptreact": "html"
    }
  }
  ```
- **Debug Configuration**: 
  ```json
  // .vscode/launch.json
  {
    "version": "0.2.0",
    "configurations": [
      {
        "name": "Next.js: debug server-side",
        "type": "node-terminal",
        "request": "launch",
        "command": "npm run dev"
      },
      {
        "name": "Next.js: debug client-side",
        "type": "chrome",
        "request": "launch",
        "url": "http://localhost:3000"
      }
    ]
  }
  ```
- **Extension Recommendations**: 
  - Biome
  - TypeScript Importer
  - Tailwind CSS IntelliSense
  - ES7+ React/Redux/React-Native snippets
  - Auto Rename Tag
  - Prettier (nếu không dùng Biome)
- **Workspace Setup**: 
  ```bash
  # Multi-developer setup
  # Git hooks setup
  npm run prepare
  
  # Shared VS Code settings
  mkdir .vscode
  cp .vscode-example/* .vscode/
  ```

### Production Optimization
- **Bundle Analysis**: 
  ```bash
  # Install analyzer
  npm install --save-dev @next/bundle-analyzer
  
  # Configure next.config.ts
  const withBundleAnalyzer = require('@next/bundle-analyzer')({
    enabled: process.env.ANALYZE === 'true',
  });
  
  # Analyze bundle
  ANALYZE=true npm run build
  ```
- **Image Optimization**: 
  ```bash
  # Manual optimization required cho static export
  # Sử dụng tools như:
  # - ImageOptim CLI
  # - Squoosh CLI
  # - Sharp CLI
  
  # Optimize images trong public/
  find public/ -name "*.jpg" -exec mogrify -quality 85 {} \;
  ```
- **Caching Strategy**: 
  ```bash
  # Static asset caching
  # Configure trong next.config.ts
  
  # Browser caching headers
  # CDN configuration
  
  # Service Worker cho offline support
  ```
- **CDN Configuration**: 
  ```bash
  # Cloudflare setup
  # AWS CloudFront setup
  # Vercel Edge Network
  
  # Asset prefix configuration
  # next.config.ts
  assetPrefix: 'https://cdn.yourdomain.com'
  ```

### Monitoring and Analytics
- **Error Tracking**: 
  ```bash
  # Sentry integration
  npm install @sentry/nextjs
  
  # Configure Sentry
  // sentry.client.config.js
  import * as Sentry from '@sentry/nextjs';
  
  Sentry.init({
    dsn: 'YOUR_DSN',
  });
  ```
- **Performance Monitoring**: 
  ```bash
  # Vercel Analytics (included)
  # Google Analytics
  
  # Web Vitals monitoring
  npm install web-vitals
  ```
- **User Analytics**: 
  ```bash
  # Google Analytics 4
  # Mixpanel
  # Amplitude
  
  # Custom event tracking
  ```
- **Health Checks**: 
  ```bash
  # Custom health endpoint
  // src/app/api/health/route.ts
  export async function GET() {
    return Response.json({ status: 'ok', timestamp: new Date().toISOString() });
  }
  
  # Uptime monitoring
  # Pingdom, UptimeRobot
  ```

## Key Observations

- **Setup Complexity Assessment**: 
  - Moderate complexity với modern toolchain
  - Multiple configuration files cần careful setup
  - eKYC integration增加了technical complexity
  - Static export mode có limitations nhưng simplifies deployment

- **Common Pain Points**: 
  - Node.js version compatibility issues
  - Environment variable management complexity
  - eKYC token rotation và security concerns
  - Bundle size optimization với comprehensive UI library
  - Cross-browser compatibility với eKYC WebRTC features

- **Success Criteria**: 
  - Development server starts without errors
  - All pages render correctly
  - Mock API responses functional
  - eKYC integration works trong development
  - Static export generates proper files
  - Deployment successful trên chosen platform

- **Maintenance Requirements**: 
  - Regular dependency updates (monthly)
  - eKYC token rotation procedures
  - Environment variable documentation updates
  - Bundle size monitoring
  - Performance optimization reviews
  - Security audit quarterly

- **Scalability Considerations**: 
  - Component library scaling với shadcn/ui
  - Multi-theme system expansion
  - Internationalization cho additional languages
  - Admin panel scalability
  - API integration scaling
  - CDN integration cho global deployment
  - Micro-frontend architecture potential