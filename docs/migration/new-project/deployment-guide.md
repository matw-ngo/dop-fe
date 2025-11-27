# DOP-FE Deployment Guide

## Build Process

### Development Build
- **Command**: `npm run dev`
- **Server**: Next.js development server with Turbopack
- **Features**: 
  - Hot reload for fast development
  - Source maps for debugging
  - Error overlay for development
  - TypeScript checking on-the-fly
- **Port**: Default 3000 (configurable with `--port` flag)

#### Development Features
```bash
# Start development server
npm run dev

# Custom port
npm run dev -- --port 3001

# Enable debug mode
DEBUG=* npm run dev

# Turbopack enabled by default
# Provides faster builds and hot reload
```

### Production Build
- **Command**: `npm run build`
- **Process**: TypeScript compilation + Next.js build with Turbopack
- **Output**: Static files in `/out` directory
- **Optimizations**: 
  - Code minification
  - Tree shaking
  - Asset optimization
  - Static HTML generation

#### Build Configuration
```typescript
// next.config.ts
const nextConfig: NextConfig = {
  turbopack: {
    root: process.cwd(),
  },
  output: "export",           // Static export
  trailingSlash: true,         // Proper trailing slashes
  images: {
    unoptimized: true,       // Disabled for static export
  },
  generateBuildId: async () => "build", // Consistent build ID
};
```

### Static Export
- **Command**: `npm run build:static`
- **Purpose**: Generate static files for deployment
- **Output Structure**: 
  ```
  out/
  ├── [locale]/
  │   ├── index.html
  │   ├── admin/
  │   ├── user-onboarding/
  │   └── _next/static/
  ├── _next/
  └── robots.txt
  ```

#### Static Export Benefits
- **Hosting Flexibility**: Can be deployed to any static hosting
- **Performance**: No server-side processing required
- **CDN Friendly**: Easy to distribute via CDN
- **Security**: Reduced attack surface

## Deployment Platforms

### Vercel Deployment

#### Project Setup
1. **Connect Repository**:
   - Login to Vercel dashboard
   - Click "New Project"
   - Connect Git repository
   - Import DOP-FE project

2. **Configuration**:
   ```json
   {
     "name": "dop-fe",
     "buildCommand": "npm run build:static",
     "outputDirectory": "out",
     "installCommand": "npm install",
     "framework": "nextjs"
   }
   ```

3. **Environment Variables**:
   ```bash
   NEXT_PUBLIC_API_URL=https://your-api-domain.com/v1
   NEXT_PUBLIC_USE_MOCK_API=false
   EKYC_ENVIRONMENT=production
   EKYC_AUTH_TOKEN=your-ekyc-token
   ```

#### Vercel Specific Features
- **Automatic Deployments**: On every push to main branch
- **Preview Deployments**: For pull requests
- **Analytics**: Built-in performance monitoring
- **Custom Domains**: Easy domain configuration

#### Vercel Configuration Files
```json
// vercel.json
{
  "buildCommand": "npm run build:static",
  "outputDirectory": "out",
  "installCommand": "npm install",
  "framework": "nextjs",
  "functions": {},
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/$1"
    }
  ]
}
```

### Netlify Deployment

#### Site Configuration
1. **Create Site**:
   - Login to Netlify dashboard
   - Click "New site from Git"
   - Connect repository
   - Select DOP-FE

2. **Build Settings**:
   ```bash
   # Build settings
   Build command: npm run build:static
   Publish directory: out
   Node version: 18
   
   # Environment variables
   NEXT_PUBLIC_API_URL=https://your-api-domain.com/v1
   NEXT_PUBLIC_USE_MOCK_API=false
   ```

3. **Redirect Rules**:
   ```bash
   # netlify.toml
   [[redirects]]
     from = "/*"
     to = "/index.html"
     status = 200
   ```

#### Netlify Configuration
```toml
# netlify.toml
[build]
  base = "/"
  command = "npm run build:static"
  publish = "out"
  
[build.environment]
  NODE_VERSION = "18"
  
[[redirects]]
  from = "/admin/*"
  to = "/admin/index.html"
  status = 200
  
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### Static Hosting

#### File Upload Deployment
1. **Build Process**:
   ```bash
   npm run build:static
   # Output generated in /out directory
   ```

2. **Upload Files**:
   ```bash
   # Using rsync for efficient upload
   rsync -avz --delete out/ user@server:/var/www/html/
   
   # Using scp for simple upload
   scp -r out/* user@server:/var/www/html/
   ```

3. **Server Configuration**:
   ```apache
   # Apache .htaccess
   <IfModule mod_rewrite.c>
     RewriteEngine On
     RewriteCond %{REQUEST_FILENAME} !-f
     RewriteCond %{REQUEST_FILENAME} !-d
     RewriteRule ^(.*)$ index.html [QSA,L]
   </IfModule>
   ```

   ```nginx
   # Nginx configuration
   server {
     listen 80;
     server_name your-domain.com;
     root /var/www/html;
     index index.html;
     
     location / {
       try_files $uri $uri/ /index.html;
     }
     
     location /_next/static/ {
       expires 1y;
       add_header Cache-Control "public, immutable";
     }
   }
   ```

#### CDN Configuration
```bash
# Cloudflare example
# 1. Add domain to Cloudflare
# 2. Set up page rules for caching
# 3. Configure SSL/TLS
# 4. Set up DNS records

# Cache rules for static assets
_cache-control: public, max-age=31536000, immutable
```

## Environment Configuration

### Production Variables
- **Required Variables**:
  ```bash
  NEXT_PUBLIC_API_URL=https://your-api-domain.com/v1
  NEXT_PUBLIC_USE_MOCK_API=false
  ```

- **Optional Variables**:
  ```bash
  # eKYC Configuration
  EKYC_ENVIRONMENT=production
  EKYC_BACKEND_URL=https://ekyc-backend.com
  EKYC_AUTH_TOKEN=your-production-token
  EKYC_TOKEN_KEY=your-token-key
  EKYC_TOKEN_ID=your-token-id
  
  # Analytics
  NEXT_PUBLIC_ANALYTICS_ID=your-analytics-id
  
  # Feature Flags
  NEXT_PUBLIC_ENABLE_ANALYTICS=true
  NEXT_PUBLIC_ENABLE_DEBUG=false
  ```

- **Security Variables**:
  ```bash
  # Never expose in client-side code
  API_SECRET_KEY=your-secret-key
  DATABASE_URL=your-database-url
  ```

### Build-time Configuration
- **API Endpoints**:
  ```typescript
  // Configured via NEXT_PUBLIC_API_URL
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://dop-stg.datanest.vn/v1';
  ```

- **Feature Flags**:
  ```typescript
  // Build-time feature toggles
  const ENABLE_ANALYTICS = process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === 'true';
  const ENABLE_DEBUG = process.env.NEXT_PUBLIC_ENABLE_DEBUG === 'true';
  ```

- **Optimization Flags**:
  ```typescript
  // Turbopack configuration
  const USE_TURBOPACK = true;  // Enabled in all builds
  
  // Static export mode
  const IS_STATIC_EXPORT = true;  // Always enabled for this project
  ```

### Environment Detection
```typescript
// Client-side environment detection
const isDevelopment = process.env.NODE_ENV === 'development';
const isProduction = process.env.NODE_ENV === 'production';
const isTest = process.env.NODE_ENV === 'test';

// API URL selection
const getApiUrl = () => {
  if (isDevelopment) {
    return 'https://dop-stg.datanest.vn/v1';
  }
  return process.env.NEXT_PUBLIC_API_URL || 'https://dop.datanest.vn/v1';
};
```

## Monitoring and Maintenance

### Performance Monitoring
- **Core Web Vitals**:
  ```typescript
  // Built-in Next.js monitoring
  import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';
  
  function sendToAnalytics(metric) {
    // Send to your analytics service
    gtag('event', metric.name, {
      value: Math.round(metric.value),
      event_category: 'Web Vitals',
    });
  }
  
  getCLS(sendToAnalytics);
  getFID(sendToAnalytics);
  getFCP(sendToAnalytics);
  getLCP(sendToAnalytics);
  getTTFB(sendToAnalytics);
  ```

- **Vercel Analytics** (if using Vercel):
  ```typescript
  import { Analytics } from '@vercel/analytics/react';
  
  function App() {
    return (
      <>
        <Analytics />
        {/* Your app content */}
      </>
    );
  }
  ```

- **Error Tracking**:
  ```typescript
  // Global error boundary
  class ErrorBoundary extends React.Component {
    componentDidCatch(error, errorInfo) {
      // Log error to monitoring service
      console.error('Error caught by boundary:', error, errorInfo);
      
      // Send to error tracking service
      trackError(error, errorInfo);
    }
  }
  ```

### Log Management
- **Application Logs**:
  ```typescript
  // Structured logging
  const logger = {
    info: (message, data) => {
      console.log(JSON.stringify({
        level: 'info',
        message,
        data,
        timestamp: new Date().toISOString()
      }));
    },
    error: (message, error) => {
      console.error(JSON.stringify({
        level: 'error',
        message,
        error: error?.stack || error,
        timestamp: new Date().toISOString()
      }));
    }
  };
  ```

- **Error Logs**:
  ```typescript
  // API error logging
  const logApiError = (endpoint, error, response) => {
    logger.error('API Error', {
      endpoint,
      status: response?.status,
      message: error.message,
      timestamp: new Date().toISOString()
    });
  };
  ```

- **Performance Logs**:
  ```typescript
  // Performance monitoring
  const measurePerformance = (name, fn) => {
    const start = performance.now();
    const result = fn();
    const end = performance.now();
    
    logger.info('Performance Metric', {
      name,
      duration: end - start,
      timestamp: new Date().toISOString()
    });
    
    return result;
  };
  ```

## Deployment Checklist

### Pre-deployment
- [ ] **Code Quality**:
  - [ ] All tests passing (`npm test`)
  - [ ] Linting clean (`npm run lint`)
  - [ ] TypeScript compilation successful
  - [ ] No console errors in development

- [ ] **Environment Setup**:
  - [ ] Production environment variables configured
  - [ ] API endpoints updated for production
  - [ ] Feature flags set appropriately
  - [ ] SSL certificates configured

- [ ] **Build Verification**:
  - [ ] Production build successful (`npm run build:static`)
  - [ ] Static files generated correctly
  - [ ] Asset optimization working
  - [ ] Bundle size within acceptable limits

### Post-deployment
- [ ] **Functionality Testing**:
  - [ ] All pages load correctly
  - [ ] Navigation works properly
  - [ ] Forms submit successfully
  - [ ] API integration functioning
  - [ ] Authentication flows working

- [ ] **Performance Verification**:
  - [ ] Page load times acceptable
  - [ ] Core Web Vitals within thresholds
  - [ ] No layout shifts (CLS)
  - [ ] Fast first contentful paint (FCP)

- [ ] **Security Checks**:
  - [ ] HTTPS properly configured
  - [ ] No mixed content warnings
  - [ ] Security headers present
  - [ ] Sensitive data not exposed

- [ ] **Monitoring Setup**:
  - [ ] Error tracking configured
  - [ ] Analytics properly installed
  - [ ] Performance monitoring active
  - [ ] Log aggregation working

## Troubleshooting

### Common Deployment Issues

#### Build Failures
```bash
# Clear build cache
rm -rf .next
rm -rf node_modules/.cache

# Fresh install
npm install

# Check Node.js version
node --version  # Should be 18.17+ or 20+
```

#### Static Export Issues
```bash
# Check for dynamic routes that can't be exported
npm run build:static

# Review next.config.ts for static export compatibility
# Ensure no API routes are being used
```

#### Environment Variable Issues
```bash
# Verify environment variables
echo $NEXT_PUBLIC_API_URL

# Check for missing variables
npm run build 2>&1 | grep "NEXT_PUBLIC_"

# Test with sample data
NEXT_PUBLIC_USE_MOCK_API=true npm run dev
```

#### Performance Issues
```bash
# Analyze bundle size
npm run build
npx next-bundle-analyzer

# Check for large dependencies
npm ls --depth=0 | grep -E '^\w+@[0-9]+\.[0-9]+\.[0-9]+$'

# Optimize images and assets
# Check for unoptimized assets
```

### Debug Tools

#### Local Testing
```bash
# Production build locally
npm run build:static
npx serve out  # Test static files locally

# Test with production variables
NODE_ENV=production npm run build:static
```

#### Network Analysis
```bash
# Check API connectivity
curl -I $NEXT_PUBLIC_API_URL/health

# Test CORS headers
curl -H "Origin: https://your-domain.com" \
     -H "Access-Control-Request-Method: GET" \
     -H "Access-Control-Request-Headers: X-Requested-With" \
     -X OPTIONS \
     $NEXT_PUBLIC_API_URL
```

#### Performance Debugging
```bash
# Lighthouse audit
npx lighthouse https://your-domain.com --output html --output-path ./lighthouse-report.html

# WebPageTest
# Test from multiple locations
# Check load times and performance scores
```

## Advanced Configuration

### Custom Server Configuration
```nginx
# Advanced Nginx configuration
server {
    listen 443 ssl http2;
    server_name your-domain.com;
    
    # SSL configuration
    ssl_certificate /path/to/certificate.crt;
    ssl_certificate_key /path/to/private.key;
    
    # Security headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains";
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
    
    # Static asset caching
    location /_next/static/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        access_log off;
    }
    
    # Main application
    location / {
        try_files $uri $uri/ /index.html;
        add_header Cache-Control "no-cache";
    }
}
```

### Multi-environment Deployment
```yaml
# GitHub Actions example
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
          cache: 'npm'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Run tests
        run: npm test
        
      - name: Build
        run: npm run build:static
        env:
          NEXT_PUBLIC_API_URL: ${{ secrets.API_URL }}
          NEXT_PUBLIC_USE_MOCK_API: false
          
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
```

This deployment guide covers the essential aspects of deploying DOP-FE to various platforms while maintaining performance, security, and reliability standards.