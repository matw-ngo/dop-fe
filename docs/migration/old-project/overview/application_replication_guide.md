# Finzone Frontend - Application Replication Guide

## Table of Contents
- [Introduction and Overview](#introduction-and-overview)
- [Prerequisites](#prerequisites)
- [Detailed Steps](#detailed-steps)
  - [Part 1: Clone and Setup Project](#part-1-clone-and-setup-project)
  - [Part 2: Run Development](#part-2-run-development)
  - [Part 3: Build and Test](#part-3-build-and-test)
  - [Part 4: Mock APIs and Offline Development](#part-4-mock-apis-and-offline-development)
  - [Part 5: Deployment](#part-5-deployment)
- [Verification Steps](#verification-steps)
- [Troubleshooting](#troubleshooting)
- [Advanced Configuration](#advanced-configuration)

## Introduction and Overview

This guide provides comprehensive instructions for replicating the Finzone Frontend application, a Vietnamese financial platform that helps users compare and register for financial products such as credit cards, consumer loans, and insurance.

### What is Finzone Frontend?

Finzone Frontend is a Next.js-based web application that:
- Provides comparison tools for credit cards, loans, and insurance products
- Offers financial calculators and utilities
- Integrates with multiple financial service providers
- Supports both Vietnamese and English languages
- Implements responsive design for desktop and mobile devices

### Key Features

- **Credit Card Comparison**: Compare features, fees, and benefits of various credit cards
- **Loan Calculator**: Calculate loan payments and eligibility
- **Insurance Products**: Browse and compare insurance options
- **Financial Tools**: Interest rate calculators, salary converters, etc.
- **Blog Section**: Financial education and news content
- **User Authentication**: Secure login and registration system
- **Lead Generation**: Capture and process user inquiries

## Prerequisites

### System Requirements

- **Operating System**: Windows 10+, macOS 10.15+, or Linux (Ubuntu 18.04+)
- **Node.js**: Version 16.0.0 or higher
- **npm**: Version 7.0.0 or higher (or yarn 1.22.0+)
- **Git**: Version 2.20.0 or higher
- **RAM**: Minimum 4GB, recommended 8GB or more
- **Storage**: Minimum 5GB free disk space

### Required Software

1. **Node.js and npm**: Download from [nodejs.org](https://nodejs.org/)
2. **Git**: Download from [git-scm.com](https://git-scm.com/)
3. **Code Editor**: Visual Studio Code (recommended) with extensions:
   - ES7+ React/Redux/React-Native snippets
   - Prettier - Code formatter
   - ESLint
   - Auto Rename Tag
   - Bracket Pair Colorizer

### Optional Software

- **Docker**: For containerized development
- **Postman**: For API testing
- **Chrome DevTools**: For debugging and performance analysis

### Account Requirements

- **Git Account**: For cloning the repository
- **API Access**: Credentials for Finzone backend APIs (provided separately)
- **Domain Name**: For production deployment

## Detailed Steps

### Part 1: Clone and Setup Project

#### Step 1: Clone the Repository

1. Open your terminal or command prompt
2. Navigate to your desired working directory
3. Clone the repository using Git:

```bash
git clone https://github.com/your-org/finzone-frontend.git
cd finzone-frontend
```

#### Step 2: Install Dependencies

1. Using npm (recommended):

```bash
npm install
```

2. Or using yarn:

```bash
yarn install
```

This will install all dependencies listed in [`package.json`](package.json), including:
- Next.js framework
- React and related libraries
- UI component libraries (Bulma, Mantine)
- Development tools (ESLint, Prettier, Jest)

#### Step 3: Set Up Environment Variables

1. Copy the example environment file:

```bash
cp .env.example .env.development
```

2. Edit the `.env.development` file with your configuration:

```bash
# Environment mode
NEXT_PUBLIC_ENV_MODE=dev

# API configuration
NEXT_PUBLIC_API_HOST=https://api-finzone-dev.datanest.vn
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# Google Analytics (optional for development)
NEXT_PUBLIC_GA_ID=

# reCAPTCHA (test key for development)
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=6Le7HZocAAAAANgMkWiDGi9znf9xVkK2sW0HeZVw

# FingerprintJS API key
NEXT_PUBLIC_FINGERPRINTJS_API_KEY=your_test_api_key
```

#### Step 4: Verify Configuration

1. Check that Node.js is installed correctly:

```bash
node --version
npm --version
```

2. Verify that all dependencies are installed:

```bash
npm list --depth=0
```

### Part 2: Run Development

#### Step 5: Start Development Server

1. Run the development server:

```bash
npm run dev
```

2. The server will start on [http://localhost:3000](http://localhost:3000)

3. You should see output similar to:

```
ready - started server on 0.0.0.0:3000, url: http://localhost:3000
info  - Loaded env from /path/to/project/.env.development
```

#### Step 6: Verify Application is Running

1. Open your web browser
2. Navigate to [http://localhost:3000](http://localhost:3000)
3. You should see the Finzone homepage
4. Check browser console for any errors

#### Step 7: Explore the Application

1. Navigate through different sections:
   - Home page
   - Credit cards (/the-tin-dung)
   - Loans (/vay-tieu-dung)
   - Insurance (/bao-hiem)
   - Tools (/cong-cu)
   - Blog (/blog)

2. Test responsive design by:
   - Using browser dev tools to simulate mobile devices
   - Resizing the browser window

### Part 3: Build and Test

#### Step 8: Run Tests

1. Run the test suite:

```bash
npm test
```

2. For test coverage:

```bash
npm run test:coverage
```

3. Tests should pass without errors

#### Step 9: Code Quality Checks

1. Run ESLint for code quality:

```bash
npm run lint
```

2. Fix any linting errors automatically:

```bash
npm run lint:fix
```

3. Format code with Prettier:

```bash
npm run format
```

#### Step 10: Build for Production

1. Create production build:

```bash
npm run build
```

2. If successful, you'll see output like:

```
info  - Creating an optimized production build...
info  - Compiled successfully
info  - Collecting page data...
info  - Generating static pages (5/5)
info  - Finalizing page optimization...

Route (pages)                              Size     First Load JS
┌ ○ /                                      5.42 kB         92.1 kB
├ ○ /404                                   194 B           77.3 kB
├ ○ /blog                                  2.48 kB         89.2 kB
└ ○ /the-tin-dung                          4.12 kB         90.8 kB
+ First Load JS shared by all              86.7 kB
  ├ chunks/framework-7a4632d4c8e3c8a7.js   45.1 kB
  ├ chunks/main-4145ab965a2e0b3e.js      24.7 kB
  ├ chunks/webpack-6d4a5f3c3b5f4b4a.js   750 B
  └ css/8d3344258d4e4c7d7b9a.css         16.2 kB
```

#### Step 11: Test Production Build Locally

1. Start production server:

```bash
npm run start
```

2. Open [http://localhost:3000](http://localhost:3000) to verify production build

### Part 4: Mock APIs and Offline Development

#### Step 12: Set Up Mock Data

For offline development or when backend is unavailable:

1. Mock data is already configured in [`configs/mock_data.ts`](configs/mock_data.ts)

2. To enable mock mode, update environment variables:

```bash
NEXT_PUBLIC_USE_MOCK_API=true
```

3. Restart development server:

```bash
npm run dev
```

#### Step 13: Configure API Mocking

1. Mock API responses are handled in the API layer
2. You can customize mock data by editing files in the `configs/` directory:
   - [`configs/mock_data.ts`](configs/mock_data.ts): General mock data
   - [`configs/card_data.js`](configs/card_data.js): Credit card mock data
   - [`configs/insurance_data.js`](configs/insurance_data.js): Insurance mock data
   - [`configs/tool_data.ts`](configs/tool_data.ts): Tools mock data

#### Step 14: Test with Mock Data

1. Navigate through the application
2. Verify that mock data is displayed correctly
3. Test all forms and interactions with mock responses

### Part 5: Deployment

#### Step 15: Prepare for Deployment

1. Update production environment variables:

```bash
# Create .env.production
NEXT_PUBLIC_ENV_MODE=production
NEXT_PUBLIC_API_HOST=https://api-finzone.datanest.vn
NEXT_PUBLIC_BASE_URL=https://your-domain.com
NEXT_PUBLIC_GA_ID=G-DGJ1SB5SHK
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=your_production_recaptcha_key
NEXT_PUBLIC_FINGERPRINTJS_API_KEY=your_production_fingerprint_key
```

2. Build for production:

```bash
npm run build
```

#### Step 16: Deploy to Netlify (Recommended)

1. Create a Netlify account at [netlify.com](https://www.netlify.com/)
2. Connect your Git repository to Netlify
3. Configure build settings:
   - Build command: `npm run build`
   - Publish directory: `out`
   - Node version: 16
4. Add environment variables in Netlify dashboard
5. Deploy!

#### Step 17: Deploy to Vercel (Alternative)

1. Create a Vercel account at [vercel.com](https://vercel.com/)
2. Install Vercel CLI:

```bash
npm i -g vercel
```

3. Deploy:

```bash
vercel --prod
```

#### Step 18: Configure Custom Domain

1. In your hosting provider dashboard:
   - Add your custom domain
   - Configure DNS settings
   - Set up SSL certificate
2. Update environment variables with correct domain

## Verification Steps

### Functional Testing

1. **Navigation**:
   - [ ] All menu items work correctly
   - [ ] Breadcrumb navigation functions properly
   - [ ] Mobile navigation is responsive

2. **Pages**:
   - [ ] Home page loads correctly
   - [ ] Credit card pages display data
   - [ ] Loan pages function properly
   - [ ] Insurance pages load correctly
   - [ ] Tools pages work as expected
   - [ ] Blog pages display content

3. **Forms**:
   - [ ] Contact form submits correctly
   - [ ] Loan application forms validate properly
   - [ ] Registration forms work correctly

4. **Responsive Design**:
   - [ ] Desktop view displays correctly
   - [ ] Tablet view adapts properly
   - [ ] Mobile view is fully functional

### Performance Testing

1. **Load Time**:
   - [ ] Initial page load under 3 seconds
   - [ ] Navigation between pages is fast
   - [ ] Images load optimally

2. **Core Web Vitals**:
   - [ ] LCP (Largest Contentful Paint) < 2.5s
   - [ ] FID (First Input Delay) < 100ms
   - [ ] CLS (Cumulative Layout Shift) < 0.1

### Security Testing

1. **Authentication**:
   - [ ] Login/logout functions correctly
   - [ ] Sessions expire properly
   - [ ] Passwords are handled securely

2. **Data Protection**:
   - [ ] Sensitive data is not exposed
   - [ ] HTTPS is enforced in production
   - [ ] CSP headers are configured

## Troubleshooting

### Common Issues and Solutions

#### Installation Issues

**Problem**: npm install fails with permission errors
**Solution**:
```bash
# Clear npm cache
npm cache clean --force

# Use npx to install
npx npm install

# Or use yarn instead
yarn install
```

**Problem**: Node modules installation is very slow
**Solution**:
```bash
# Increase npm timeout
npm config set timeout 60000

# Use npm registry mirror
npm config set registry https://registry.npm.taobao.org
```

#### Development Server Issues

**Problem**: Development server fails to start
**Solution**:
1. Check if port 3000 is in use:
   ```bash
   lsof -i :3000
   ```
2. Kill the process using the port:
   ```bash
   kill -9 <PID>
   ```
3. Restart the server:
   ```bash
   npm run dev
   ```

**Problem**: Hot reload is not working
**Solution**:
1. Clear Next.js cache:
   ```bash
   rm -rf .next
   ```
2. Restart development server

#### Build Issues

**Problem**: Production build fails
**Solution**:
1. Check for TypeScript errors:
   ```bash
   npx tsc --noEmit
   ```
2. Fix any TypeScript errors
3. Try building again:
   ```bash
   npm run build
   ```

**Problem**: Build is successful but pages are blank
**Solution**:
1. Check for JavaScript errors in browser console
2. Verify environment variables are correctly set
3. Check API connectivity

#### API Issues

**Problem**: API calls are failing
**Solution**:
1. Verify API host in environment variables
2. Check network connectivity
3. Use browser dev tools to inspect API requests
4. Enable mock mode for testing:
   ```bash
   NEXT_PUBLIC_USE_MOCK_API=true
   ```

#### Styling Issues

**Problem**: Styles are not loading correctly
**Solution**:
1. Check CSS imports in components
2. Verify SCSS compilation:
   ```bash
   npm run build
   ```
3. Clear browser cache

### Debug Mode

Enable debug mode for detailed logging:

```bash
DEBUG=* npm run dev
```

### Performance Issues

**Problem**: Application is slow
**Solution**:
1. Analyze bundle size:
   ```bash
   npm run analyze
   ```
2. Optimize images:
   - Use Next.js Image component
   - Compress images before adding
3. Implement code splitting for large components

## Advanced Configuration

### Custom Domain Configuration

1. **DNS Settings**:
   ```
   A record: @ -> your-server-ip
   CNAME: www -> your-domain.com
   ```

2. **SSL Certificate**:
   - Use Let's Encrypt for free SSL
   - Configure automatic renewal

3. **CDN Configuration**:
   - Set up Cloudflare for performance
   - Configure caching rules

### Environment-Specific Configurations

1. **Development**:
   - Use mock APIs
   - Enable debug mode
   - Disable analytics

2. **Staging**:
   - Use staging APIs
   - Enable all features
   - Test analytics

3. **Production**:
   - Use production APIs
   - Optimize for performance
   - Enable full monitoring

### Monitoring and Analytics

1. **Error Tracking**:
   - Set up Sentry for error monitoring
   - Configure alerts for critical errors

2. **Performance Monitoring**:
   - Implement Core Web Vitals tracking
   - Set up performance budgets

3. **User Analytics**:
   - Configure Google Analytics
   - Set up custom event tracking

### CI/CD Configuration

1. **GitHub Actions**:
   ```yaml
   name: Build and Deploy
   on:
     push:
       branches: [ main ]
   jobs:
     build:
       runs-on: ubuntu-latest
       steps:
       - uses: actions/checkout@v2
       - name: Setup Node.js
         uses: actions/setup-node@v2
         with:
           node-version: '16'
       - name: Install dependencies
         run: npm install
       - name: Run tests
         run: npm test
       - name: Build
         run: npm run build
   ```

2. **Docker Configuration**:
   ```dockerfile
   FROM node:16-alpine
   WORKDIR /app
   COPY package*.json ./
   RUN npm ci --only=production
   COPY . .
   RUN npm run build
   EXPOSE 3000
   CMD ["npm", "start"]
   ```

### Security Hardening

1. **Content Security Policy**:
   ```javascript
   const ContentSecurityPolicy = `
     default-src 'self';
     script-src 'self' 'unsafe-eval' 'unsafe-inline';
     style-src 'self' 'unsafe-inline';
     img-src 'self' data: https:;
     font-src 'self';
   `;
   ```

2. **Security Headers**:
   ```javascript
   const securityHeaders = [
     {
       key: 'X-DNS-Prefetch-Control',
       value: 'on'
     },
     {
       key: 'Strict-Transport-Security',
       value: 'max-age=63072000; includeSubDomains; preload'
     },
     {
       key: 'X-XSS-Protection',
       value: '1; mode=block'
     },
     {
       key: 'X-Frame-Options',
       value: 'DENY'
     },
     {
       key: 'X-Content-Type-Options',
       value: 'nosniff'
     }
   ];
   ```

## Conclusion

This guide provides comprehensive instructions for replicating the Finzone Frontend application. Following these steps will ensure a successful setup and deployment of the application.

For additional support or questions, please refer to:
- Project documentation in the `/docs` directory
- Code comments and README files
- GitHub issues for bug reports and feature requests

Remember to:
1. Keep dependencies updated regularly
2. Monitor performance and security
3. Test thoroughly before deploying to production
4. Follow best practices for code quality and maintainability