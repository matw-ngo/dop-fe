# Configuration and Environment Setup

This document describes in detail the configuration files, environment variables, and setup instructions for the Finzone Frontend project.

## Table of Contents
- [Configuration Files](#configuration-files)
- [Environment Variables](#environment-variables)
- [Setup Instructions](#setup-instructions)
- [Detailed Configuration](#detailed-configuration)
- [API Management](#api-management)
- [Responsive Design](#responsive-design)
- [Tracking and Analytics](#tracking-and-analytics)
- [Security](#security)

## Configuration Files

| File | Purpose | Main Settings |
|------|---------|---------------|
| [`.env.development`](.env.development) | Environment variables for development | `NEXT_PUBLIC_ENV_MODE=dev`, `NEXT_PUBLIC_API_HOST=https://api-finzone-dev.datanest.vn` |
| [`package.json`](package.json) | Dependency management and scripts | Dependencies, build scripts, project metadata |
| [`.eslintrc.json`](.eslintrc.json) | ESLint configuration | Code linting rules and settings |
| [`.prettierrc`](.prettierrc) | Prettier configuration | Code formatting rules |
| [`postcss.config.js`](postcss.config.js) | PostCSS configuration | CSS processing configuration |
| [`jest.config.ts`](jest.config.ts) | Jest testing configuration | Test environment settings |
| [`nginx.conf`](nginx.conf) | Nginx configuration | Web server settings |
| [`tsconfig.json`](tsconfig.json) | TypeScript configuration | TypeScript compiler options |
| [`tailwind.config.js`](tailwind.config.js) | Tailwind CSS configuration | CSS framework settings |
| [`configs/ApiConfig.js`](configs/ApiConfig.js) | API configuration | API endpoints and settings |
| [`configs/mock_data.ts`](configs/mock_data.ts) | Mock data configuration | Development data mocking |

## Environment Variables

### Development Environment (.env.development)

```bash
NEXT_PUBLIC_ENV_MODE=dev
NEXT_PUBLIC_API_HOST=https://api-finzone-dev.datanest.vn
```

### Production Environment (.env.production)

```bash
NEXT_PUBLIC_ENV_MODE=production
NEXT_PUBLIC_API_HOST=https://api-finzone.datanest.vn
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=your_recaptcha_site_key
NEXT_PUBLIC_GA_ID=your_google_analytics_id
NEXT_PUBLIC_FINGERPRINTJS_API_KEY=your_fingerprintjs_api_key
```

### Environment Variables Table

| Variable | Purpose | Development Value | Production Value |
|----------|---------|-------------------|------------------|
| `NEXT_PUBLIC_ENV_MODE` | Environment mode | `dev` | `production` |
| `NEXT_PUBLIC_API_HOST` | API base URL | `https://api-finzone-dev.datanest.vn` | `https://api-finzone.datanest.vn` |
| `NEXT_PUBLIC_BASE_URL` | Application base URL | `http://localhost:3000` | `https://finzone.vn` |
| `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` | reCAPTCHA site key | Test key | Production key |
| `NEXT_PUBLIC_GA_ID` | Google Analytics ID | Empty or test ID | Production GA ID |
| `NEXT_PUBLIC_FINGERPRINTJS_API_KEY` | FingerprintJS API key | Test key | Production key |

## Setup Instructions

### Prerequisites

- Node.js (version 16 or higher)
- npm or yarn package manager
- Git for version control

### Installation Steps

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-org/finzone-frontend.git
   cd finzone-frontend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Set up environment variables**:
   ```bash
   cp .env.example .env.development
   # Edit .env.development with appropriate values
   ```

4. **Run the development server**:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. **Access the application**:
   Open [http://localhost:3000](http://localhost:3000) in your browser

### Build and Deployment

1. **Build for production**:
   ```bash
   npm run build
   # or
   yarn build
   ```

2. **Start production server**:
   ```bash
   npm run start
   # or
   yarn start
   ```

3. **Export static files**:
   ```bash
   npm run export
   # or
   yarn export
   ```

## Detailed Configuration

### Package.json Scripts

| Script | Command | Purpose |
|--------|---------|---------|
| `dev` | `next dev` | Start development server |
| `build` | `next build && next export` | Build and export for production |
| `start` | `next start` | Start production server |
| `lint` | `next lint` | Run ESLint for code quality |
| `test` | `jest` | Run Jest test suite |

### ESLint Configuration ([`.eslintrc.json`](.eslintrc.json))

```json
{
  "extends": ["next/core-web-vitals"],
  "rules": {
    "react/no-unescaped-entities": "off",
    "@next/next/no-page-custom-font": "off"
  }
}
```

### Prettier Configuration ([`.prettierrc`](.prettierrc))

```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2
}
```

### PostCSS Configuration ([`postcss.config.js`](postcss.config.js))

```javascript
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

### Jest Configuration ([`jest.config.ts`](jest.config.ts))

```typescript
const nextJest = require('next/jest')

const createJestConfig = nextJest({
  dir: './',
})

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapping: {
    '^@/components/(.*)$': '<rootDir>/components/$1',
    '^@/pages/(.*)$': '<rootDir>/pages/$1',
  },
  testEnvironment: 'jest-environment-jsdom',
}

module.exports = createJestConfig(customJestConfig)
```

### Nginx Configuration ([`nginx.conf`](nginx.conf))

```nginx
server {
    listen 80;
    server_name finzone.vn;
    root /var/www/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

## API Management

### API Configuration ([`configs/ApiConfig.js`](configs/ApiConfig.js))

The API configuration file centralizes all API endpoints and settings:

```javascript
export const BASE_API_URL = process.env.NEXT_PUBLIC_API_HOST || "https://api-dev.finzone.vn";

export const ApiUrl = {
  // Lead Management
  LEAD_STATUS: `${BASE_API_URL}/lead/${LEAD_ID_TAG}/status`,
  SUBMIT_OTP: `${BASE_API_URL}/otp/submit`,
  NEW_LEAD: `${BASE_API_URL}/upl/new${isDevMode ? "?test_otp=1234" : ""}`,
  
  // Credit Cards
  GET_ALL_CARD_CATS: `${BASE_API_URL}/cat/all`,
  GET_ALL_CARDS: `${BASE_API_URL}/cards/all`,
  GET_CARDS: `${BASE_API_URL}/cards/card`,
  GET_CARD_BY_ID: `${BASE_API_URL}/cards/by-id`,
  
  // Insurance
  GET_ALL_INSURS: `${BASE_API_URL}/insurance/all`,
  
  // Tools
  GET_SAVINGS: `${BASE_API_URL}/tools/saving`,
  GET_SALARY_CONV: `${BASE_API_URL}/tools/salary`,
  GET_IR_CALC: `${BASE_API_URL}/tools/ir`,
  
  // Tracking
  TRACKING_EVENT: `${BASE_API_URL}/tr_e`,
  TRACKING_SESSION: `${BASE_API_URL}/tr_s`,
};
```

### API Error Codes

The application defines specific error codes for handling API responses:

```javascript
export const ApiErrorCode = {
  UnknownError: 1,
  InvalidBodyRequest: 2,
  InvalidLeadID: 3,
  InvalidExpectedAmount: 4,
  InvalidLoanPeriod: 5,
  MissingLoanPurpose: 6,
  // ... more error codes
};
```

## Responsive Design

### Breakpoints Configuration

The application uses responsive design with the following breakpoints:

| Breakpoint | Min Width | Max Width | Devices |
|------------|-----------|------------|----------|
| Mobile | 320px | 767px | Phones |
| Tablet | 768px | 1023px | Tablets |
| Desktop | 1024px | - | Laptops/Desktops |

### Tailwind CSS Configuration ([`tailwind.config.js`](tailwind.config.js))

```javascript
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#007bff',
        secondary: '#6c757d',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
```

## Tracking and Analytics

### Google Analytics Configuration

Google Analytics is configured through environment variables:

```javascript
const GA_IDS = {
  dev: "",
  staging: "G-V4LJVSWHK0",
  production: "G-DGJ1SB5SHK",
};

export const GA_ID = process.env.NEXT_PUBLIC_ENV_MODE
  ? GA_IDS[process.env.NEXT_PUBLIC_ENV_MODE]
  : GA_IDS["staging"];
```

### FingerprintJS Configuration

FingerprintJS is used for device identification:

```javascript
export const FINGERPRINTJS_API_KEY = process.env.NEXT_PUBLIC_FINGERPRINTJS_API_KEY;
```

### Event Tracking

The application includes comprehensive event tracking for user interactions:

```javascript
// Example tracking implementation
import { eventTracking } from '@/helpers/user-tracking';

const handleCardClick = (cardId) => {
  eventTracking('credit_card_click', {
    card_id: cardId,
    page_location: window.location.pathname,
  });
};
```

## Security

### reCAPTCHA Configuration

reCAPTCHA is configured for form protection:

```javascript
export const RECAPTCHA_CLIENT_KEY = "6Le7HZocAAAAANgMkWiDGi9znf9xVkK2sW0HeZVw";
```

### Security Best Practices

1. **Environment Variables**: Sensitive data is stored in environment variables
2. **Content Security Policy**: CSP headers are configured for XSS protection
3. **HTTPS**: All production communications use HTTPS
4. **Input Validation**: All user inputs are validated on both client and server
5. **API Rate Limiting**: API endpoints implement rate limiting

### CORS Configuration

Cross-Origin Resource Sharing is configured to allow only trusted origins:

```javascript
// Example CORS configuration
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://finzone.vn', 'https://www.finzone.vn']
    : ['http://localhost:3000'],
  credentials: true,
};
```

## Development Tools

### Mock Data Configuration ([`configs/mock_data.ts`](configs/mock_data.ts))

For development, the application uses mock data:

```typescript
export const mockCreditCards = [
  {
    id: '1',
    name: 'Card Name',
    bank: 'Bank Name',
    image: '/images/card-image.jpg',
    // ... more properties
  },
  // ... more cards
];
```

### Testing Setup

The application uses Jest and React Testing Library for testing:

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

### Code Quality Tools

- **ESLint**: For code linting and consistency
- **Prettier**: For code formatting
- **TypeScript**: For type checking
- **Husky**: For Git hooks (pre-commit, pre-push)

## Performance Optimization

### Bundle Analysis

To analyze the bundle size:

```bash
npm run analyze
```

### Image Optimization

The application uses Next.js Image component for automatic optimization:

```javascript
import Image from 'next/image';

<Image
  src="/path/to/image.jpg"
  alt="Description"
  width={500}
  height={300}
  priority
/>
```

### Code Splitting

The application implements dynamic imports for code splitting:

```javascript
import dynamic from 'next/dynamic';

const DynamicComponent = dynamic(() => import('../components/HeavyComponent'), {
  loading: () => <p>Loading...</p>,
});
```

## Deployment Configuration

### Environment-Specific Builds

The application supports different build configurations based on environment:

```javascript
// next.config.js
module.exports = {
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
  // ... other configuration
};
```

### Static Export Configuration

For static hosting, the application is configured with:

```javascript
// next.config.js
module.exports = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
};
```

### Deployment Platforms

The application can be deployed to:

1. **Vercel**: Recommended for Next.js applications
2. **Netlify**: For static site deployment
3. **AWS S3 + CloudFront**: For custom CDN setup
4. **Docker**: For containerized deployment

### Docker Configuration

```dockerfile
# Dockerfile
FROM node:16-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

## Troubleshooting

### Common Issues

1. **Environment Variables Not Loading**:
   - Ensure `.env` file is in the root directory
   - Restart the development server after changing variables

2. **API Connection Issues**:
   - Check `NEXT_PUBLIC_API_HOST` is correctly set
   - Verify API server is running and accessible

3. **Build Errors**:
   - Clear the `.next` directory: `rm -rf .next`
   - Delete `node_modules` and reinstall: `rm -rf node_modules && npm install`

4. **Styling Issues**:
   - Ensure CSS imports are properly structured
   - Check for conflicting global styles

### Debug Mode

To enable debug mode:

```bash
DEBUG=* npm run dev
```

### Performance Monitoring

The application includes performance monitoring:

```javascript
// Example performance monitoring
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

function sendToAnalytics(metric) {
  // Send metrics to analytics service
}

getCLS(sendToAnalytics);
getFID(sendToAnalytics);
getFCP(sendToAnalytics);
getLCP(sendToAnalytics);
getTTFB(sendToAnalytics);