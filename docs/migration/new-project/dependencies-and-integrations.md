# DOP-FE Dependencies and Integrations

## NPM Dependencies Analysis

### Production Dependencies
- **Core Framework Dependencies**: Next.js 15.5.4, React 19.1.0, react-dom 19.1.0, TypeScript (via dev), next-intl 4.3.9
- **UI and Styling Dependencies**: shadcn/ui (New York style), Tailwind CSS v4 (dev), Radix UI suite, lucide-react 0.544.0, class-variance-authority 0.7.1, clsx 2.1.1, tailwind-merge 2.5.4
- **State Management Dependencies**: Zustand 5.0.8, @tanstack/react-query 5.90.2, @tanstack/react-table 8.21.3
- **Form Handling Dependencies**: react-hook-form 7.63.0, @hookform/resolvers 5.2.2, Zod 4.1.11
- **Date and Time Dependencies**: date-fns 4.1.0, react-day-picker 9.11.0
- **Animation and Interaction Dependencies**: framer-motion 12.23.24, tailwindcss-animate 1.0.7
- **Chart and Visualization Dependencies**: recharts 2.15.4
- **Development and Testing Dependencies**: Vitest 3.2.4, Playwright 1.55.1, Storybook 8.6.14

### Development Dependencies
- **Build Tools**: Turbopack (built into Next.js), Biome 2.2.0, PostCSS, TypeScript 5.x
- **Code Quality**: @biomejs/biome, eslint, prettier (replaced by Biome)
- **Testing Frameworks**: @testing-library/react, @testing-library/jest-dom, vitest
- **Documentation Tools**: Storybook 8.6.14, @storybook/addon-essentials
- **Git Hooks**: Husky 9.1.7, lint-staged 16.2.3

## External Integrations

### VNPT eKYC Integration
- **SDK Version**: VNPT Browser SDK v4.0.0
- **Integration Pattern**: Custom wrapper with event handling
- **Files**: 
  - `public/lib/VNPTBrowserSDKAppV4.0.0.js` - Main SDK file
  - `public/lib/VNPTQRBrowserApp.js` - QR code scanner
  - `public/lib/VNPTQRUpload.js` - Document upload
  - `public/lib/mobile-oval.json` - Mobile face detection
  - `public/lib/web-oval.json` - Web face detection
- **Configuration**: 
  - Backend URL configuration via environment variables
  - Token-based authentication with secure key management
  - Error handling with retry mechanisms
- **Security Considerations**:
  - Token rotation procedures
  - Secure data transmission
  - Proper cleanup on component unmount

### OpenAPI Integration
- **Schema Location**: `src/lib/api/schema.yaml`
- **Type Generation**: Auto-generated TypeScript types in `src/lib/api/v1.d.ts`
- **Client Implementation**: `src/lib/api/client.ts` with openapi-fetch
- **Admin API**: Custom implementation in `src/lib/api/admin-api.ts`
- **Mock Responses**: Development mock data in `src/lib/api/mock-responses.ts`
- **Features**:
  - Type-safe API calls
  - Automatic request/response transformation
  - Error handling with toast notifications
  - Request deduplication

### Internationalization Integration
- **Library**: next-intl 4.3.9
- **Translation Files**: `messages/vi.json`, `messages/en.json`
- **Configuration**: `src/i18n/request.ts` with locale detection
- **Features**:
  - Automatic locale detection from browser
  - Dynamic locale switching
  - Namespace support for organized translations
  - Pluralization support

## Security Considerations

### Dependency Security
- **Regular Updates**: Monthly dependency audits with npm audit
- **Vulnerability Scanning**: Automated security scanning in CI/CD
- **Known Vulnerabilities**: No critical vulnerabilities detected in current dependencies
- **Security Headers**: Proper implementation of security headers

### Data Protection
- **PII Handling**: Secure handling of personally identifiable information
- **Token Security**: Secure storage and transmission of authentication tokens
- **Input Validation**: Comprehensive input validation with Zod schemas
- **XSS Prevention**: Proper output encoding and CSP headers

### Environment Security
- **Secret Management**: Secure handling of environment variables
- **Production Hardening**: Production-specific security configurations
- **API Security**: HTTPS-only communication with proper authentication
- **Dependency Isolation**: Proper separation between development and production

## Performance Considerations

### Bundle Optimization
- **Tree Shaking**: Unused dependency elimination
- **Code Splitting**: Route-based and component-based splitting
- **Dynamic Imports**: Lazy loading for heavy components
- **Bundle Analysis**: Regular bundle size monitoring

### Runtime Performance
- **React Optimization**: Proper memoization and state management
- **Image Optimization**: Manual optimization for static export
- **Caching Strategy**: Intelligent caching with React Query
- **Memory Management**: Proper cleanup and memory leak prevention

### Network Performance
- **Request Optimization**: Request batching and deduplication
- **Response Caching**: Intelligent caching strategies
- **Compression**: Gzip/Brotli compression for static assets
- **CDN Integration**: Content delivery network optimization

## Reliability Considerations

### Error Handling
- **Global Error Boundaries**: Comprehensive error catching
- **Retry Mechanisms**: Exponential backoff for failed requests
- **Fallback Strategies**: Graceful degradation for feature failures
- **Error Reporting**: Structured error logging and monitoring

### Availability
- **Service Monitoring**: Health checks for external services
- **Fallback Services**: Alternative services when primary fails
- **Offline Support**: Basic functionality without network connectivity
- **Recovery Mechanisms**: Automatic recovery from transient failures

## Key Observations

### Dependency Management
- **Modern Stack**: Cutting-edge dependencies with regular updates
- **Type Safety**: Full TypeScript integration across all dependencies
- **Minimal Dependencies**: Careful dependency selection to reduce bundle size
- **Compatibility**: Proper version compatibility across all dependencies

### Integration Quality
- **Robust eKYC**: Comprehensive VNPT SDK integration with error handling
- **Type-Safe API**: Full type safety in API integration
- **Flexible i18n**: Comprehensive internationalization support
- **Secure Implementation**: Security-first approach in all integrations

### Performance Optimization
- **Efficient Bundling**: Multiple optimization strategies implemented
- **Smart Caching**: Intelligent caching at multiple levels
- **Resource Optimization**: Proper resource loading and optimization
- **Monitoring**: Comprehensive performance monitoring setup

### Security Implementation
- **Defense in Depth**: Multiple layers of security
- **Regular Updates**: Proactive security maintenance
- **Best Practices**: Industry-standard security practices
- **Compliance**: GDPR and data protection compliance

## Related Documentation
- **[Project Architecture Overview](project-architecture-overview.md)** - Technology stack and architecture patterns
- **[Data Models and Structures](data-models-and-structures.md)** - Type definitions and data structures
- **[Application Pages and Components](../src/docs/application-pages-and-components.tsx)** - Component hierarchy and structure
- **[Configuration and Environment Setup](configuration-and-environment-setup.md)** - Setup and configuration details
- **[Security Best Practices](security-best-practices.md)** - Security implementation details
- **[Performance Optimization](performance-optimization.md)** - Performance optimization strategies