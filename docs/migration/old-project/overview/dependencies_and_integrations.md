# Dependencies and Integrations Analysis

## Table of Contents
1. [NPM Dependencies](#npm-dependencies)
2. [External Integrations](#external-integrations)
3. [API Endpoints](#api-endpoints)
4. [Security Considerations](#security-considerations)

## NPM Dependencies

### Core Framework & Runtime

| Package | Version | Purpose | Usage |
|----------|----------|---------|--------|
| next | 13.5.2 | React framework with App Router/SSR | Application framework, routing, SSR |
| react | 18.2.0 | UI library | Core UI components |
| react-dom | 18.2.0 | React DOM renderer | DOM manipulation |
| typescript | 5.0.4 | TypeScript compiler | Type safety |

### UI Components & Styling

| Package | Version | Purpose | Usage |
|----------|----------|---------|--------|
| @mantine/core | 6.0.16 | UI component library | Form components, modals, layouts |
| @mantine/hooks | 6.0.16 | React hooks library | Custom hooks for UI interactions |
| @emotion/react | 11.11.0 | CSS-in-JS library | Styling for Mantine components |
| bulma | 0.9.4 | CSS framework | Additional styling utilities |
| sass | 1.62.1 | Sass/SCSS compiler | CSS preprocessing |
| node-sass | 8.0.0 | Sass compiler for Node.js | Build-time CSS compilation |

### State Management

| Package | Version | Purpose | Usage |
|----------|----------|---------|--------|
| zustand | 4.3.8 | Lightweight state management | Global state for loan, card, insurance data |
| immer | 10.0.2 | Immutable state updates | Used with Zustand for state immutability |

### Data Fetching & HTTP

| Package | Version | Purpose | Usage |
|----------|----------|---------|--------|
| axios | 1.4.0 | HTTP client | API calls to backend endpoints |

### Form & Input Components

| Package | Version | Purpose | Usage |
|----------|----------|---------|--------|
| react-select | 5.7.3 | Select dropdown component | Form select inputs |
| react-input-slider | 6.0.1 | Slider input component | Range inputs for loan amounts |
| react-paginate | 8.2.0 | Pagination component | Paginated data display |

### Media & Content

| Package | Version | Purpose | Usage |
|----------|----------|---------|--------|
| react-slick | 0.29.0 | Carousel/slider component | Image carousels, card galleries |
| react-content-loader | 6.2.1 | Skeleton loading components | Loading states for async content |

### Utilities & Helpers

| Package | Version | Purpose | Usage |
|----------|----------|---------|--------|
| query-string | 7.1.3 | URL query parsing | Extract URL parameters for tracking |
| uuid | 10.0.0 | Unique ID generation | Generate consent IDs, tracking IDs |
| md5 | 2.3.0 | MD5 hashing | Data integrity checks |
| react-responsive | 9.0.2 | Responsive design utilities | Device-specific UI rendering |
| react-toastify | 9.1.3 | Toast notifications | User feedback messages |

### Development Dependencies

| Package | Version | Purpose | Usage |
|----------|----------|---------|--------|
| @types/node | 20.1.3 | Node.js type definitions | TypeScript support for Node.js APIs |
| @types/react | 18.2.6 | React type definitions | TypeScript support for React |
| @types/react-dom | 18.2.4 | React DOM type definitions | TypeScript support for React DOM |
| @types/react-slick | 0.23.10 | React Slick type definitions | TypeScript support for react-slick |
| @types/uuid | 10.0.0 | UUID type definitions | TypeScript support for uuid |
| eslint | 8.40.0 | JavaScript linter | Code quality checks |
| eslint-config-next | 13.4.2 | Next.js ESLint configuration | ESLint rules for Next.js |
| jest | 29.7.0 | Testing framework | Unit and integration tests |
| @testing-library/jest-dom | 6.4.5 | Jest DOM matchers | DOM testing utilities |
| @testing-library/react | 15.0.7 | React testing utilities | Component testing |
| jest-environment-jsdom | 29.7.0 | Jest DOM environment | DOM simulation for tests |
| tailwindcss | 3.3.2 | Utility-first CSS framework | Additional styling system |
| autoprefixer | 10.4.14 | CSS vendor prefixer | CSS compatibility |
| postcss | 8.4.24 | CSS transformation | CSS processing pipeline |
| ts-node | 10.9.2 | TypeScript execution | Direct TypeScript file execution |

## External Integrations

### Device Fingerprinting

| Service | Purpose | Implementation |
|---------|---------|----------------|
| FingerprintJS | Device identification and fraud prevention | [`external/fingerprint.js`](external/fingerprint.js:1) generates unique device IDs using browser characteristics |
| FingerprintJS API Key | Environment variable (`NEXT_PUBLIC_FINGERPRINTJS_API_KEY`) | API key for FingerprintJS service |

### Authentication & Security

| Service | Purpose | Implementation |
|---------|---------|----------------|
| reCAPTCHA | Bot protection and form security | Client key: `6Le7HZocAAAAANgMkWiDGi9znf9xVkK2sW0HeZVw` |
| CFP (Cloudflare Pages) Authentication | Password protection for staging/preview | [`functions/_middleware.ts`](functions/_middleware.ts:1), [`functions/cfp_login.ts`](functions/cfp_login.ts:1) with SHA-256 password hashing |

### Analytics & Tracking

| Service | Purpose | Implementation |
|---------|---------|----------------|
| Google Analytics | User behavior tracking | GA IDs: dev (none), staging (`G-V4LJVSWHK0`), production (`G-DGJ1SB5SHK`) |
| Custom tracking endpoints | Event and session tracking | `/tr_e` (events), `/tr_s` (sessions), `/lead/[LEAD_ID]/click-link` (referral clicks) |

### Third-Party APIs

| Service | Purpose | Implementation |
|---------|---------|----------------|
| Finzone API | Primary backend API | Base URL: `https://api-dev.finzone.vn` (configurable via `NEXT_PUBLIC_API_HOST`) |
| Telco Providers | OTP delivery | Integration with Viettel, Mobifone, Vinaphone for SMS verification |
| Financial Institutions | Partner redirects | 30+ banks and financial institutions for loan applications |
| Insurance Providers | Policy sales integration | Multiple insurance companies for insurance products |

### Serverless Functions

| Function | Purpose | Implementation |
|----------|---------|----------------|
| CFP Authentication | Password protection for preview environments | [`functions/_middleware.ts`](functions/_middleware.ts:1) - Middleware for route protection |
| CFP Login | Authentication endpoint | [`functions/cfp_login.ts`](functions/cfp_login.ts:1) - Handles login with SHA-256 hashing |
| Constants | Authentication constants | [`functions/constants.ts`](functions/constants.ts:1) - Cookie settings, allowed paths |
| Template | HTML template for login page | [`functions/template.ts`](functions/template.ts:1) - PicoCSS-based login form |
| Utils | Authentication utilities | [`functions/utils.ts`](functions/utils.ts:1) - SHA-256 hashing, cookie management |

## API Endpoints

### Lead Management

| Endpoint | Method | Purpose |
|----------|---------|---------|
| `/upl/new` | POST | Create new lead with test OTP in dev mode |
| `/upl/submit-info` | POST | Submit additional lead information |
| `/upl/forward` | POST | Forward lead to financial institution |
| `/lead/[LEAD_ID]/status` | GET | Check lead status |
| `/lead/[LEAD_ID]/click-link` | POST | Track referral link clicks |

### OTP Authentication

| Endpoint | Method | Purpose |
|----------|---------|---------|
| `/otp/submit` | POST | Verify OTP for loan application |
| `/otp/renew` | POST | Request new OTP with test OTP in dev mode |

### Card Products

| Endpoint | Method | Purpose |
|----------|---------|---------|
| `/cards/all` | GET | Get all available credit cards |
| `/cards/by-id` | POST | Get card details by ID |
| `/cards/by-ids` | POST | Get multiple cards by IDs |
| `/cards/card` | GET | Get filtered card list |
| `/cards/click-link` | POST | Save card redirect transaction |
| `/cat/all` | GET | Get all card categories |

### Insurance Products

| Endpoint | Method | Purpose |
|----------|---------|---------|
| `/insurance/all` | GET | Get all available insurance products |

### Financial Tools

| Endpoint | Method | Purpose |
|----------|---------|---------|
| `/tools/saving` | POST | Calculate savings returns |
| `/tools/saving/all` | POST | Get saving interest rates |
| `/tools/saving/interest` | POST | Save saving opening request |
| `/tools/salary` | POST | Calculate salary conversions |
| `/tools/ir` | POST | Calculate interest rates |

### Document Management

| Endpoint | Method | Purpose |
|----------|---------|---------|
| `/documents/presigned/upload` | GET | Get document upload URL |
| `/documents/presigned/download` | GET | Get document download URL |

### Consent Management

| Endpoint | Method | Purpose |
|----------|---------|---------|
| `/consent/submit` | POST | Submit user consent |
| `/consent/check` | POST | Check consent status |
| `/consent/latest` | GET | Get latest consent content |

### Partner Integration

| Endpoint | Method | Purpose |
|----------|---------|---------|
| `/partner/redirect` | POST | Redirect to partner application |

### Tracking

| Endpoint | Method | Purpose |
|----------|---------|---------|
| `/tr_e` | POST | Track user events |
| `/tr_s` | POST | Track user sessions |

## Security Considerations

### Authentication & Authorization
- SHA-256 password hashing for CFP authentication
- JWT token-based authentication for OTP submission
- reCAPTCHA integration for bot protection
- Device fingerprinting for fraud prevention

### Data Protection
- HTTPS-only API communication
- Secure cookie handling with HttpOnly and Secure flags
- Environment variable configuration for sensitive data
- Test OTP bypass in development mode only

### API Security
- Lead ID validation in endpoints
- Request validation with specific error codes
- Rate limiting for OTP requests (MaximumOTPRequest: 50)
- CORS handling through Next.js configuration

### Third-Party Security
- FingerprintJS API key stored in environment variables
- Google Analytics with environment-specific IDs
- reCAPTCHA client key exposed (standard practice)
- Partner redirects with validation

## Summary

The finzone-frontend application utilizes a comprehensive set of 80+ NPM dependencies centered around Next.js, React, Mantine UI, and Zustand for state management. External integrations include device fingerprinting, authentication systems, analytics, and connections to 30+ financial institutions. The API layer consists of 25+ endpoints covering lead management, OTP verification, financial products, and partner integrations, with security measures including SHA-256 hashing, JWT authentication, and reCAPTCHA protection.