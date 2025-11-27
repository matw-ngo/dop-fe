# Finzone Frontend Project Architecture Overview

## Technology Stack

### Core Frameworks and Languages
- **Next.js** [`13.5.2`](package.json:27) - App Router for routing, SSR, static export (scripts: "next dev", "next build && next export")
- **React** [`18.2.0`](package.json:30) with **TypeScript** [`5.0.4`](package.json:40)
- **Node.js** (dev deps like ts-node)

### UI and Styling
- **SCSS** with CSS Modules (e.g., [`style.module.scss`](components/Button/style.module.scss))
- **Tailwind CSS** [`3.3.2`](package.json:52) via PostCSS [`postcss.config.js`]
- **Bulma** CSS framework [`^0.9.4`](package.json:21)
- **Mantine** UI components (`@mantine/core`, `@mantine/hooks`)
- **React Slick** for sliders/carousels

### State Management and Utilities
- **Zustand** [`^4.3.8`](package.json:42) (likely in `states/`)
- **Axios** [`^1.4.0`](package.json:20) for API requests
- **React Toastify**, **React Select**, **React Paginate**
- **Immer**, **UUID**, **MD5**, **Query-string**
- **FingerprintJS** for tracking (external/fingerprint.js)

### Testing, Linting, Formatting
- **Jest** [`^29.7.0`](package.json:49) with JSDOM, Testing Library ([`jest.config.ts`](jest.config.ts))
- **ESLint** Next.js config ([`.eslintrc.json`](.eslintrc.json))
- **Prettier** ([`.prettierrc`](.prettierrc))

### Build, Deployment, Config
- **Docker** (Dockerfile, Dockerfile.dev)
- **Nginx** ([`nginx.conf`](nginx.conf))
- **PostCSS/Autoprefixer**
- Env vars (`.env.development`, NEXT_PUBLIC_API_HOST etc.)

### Backend API
- Base: [`https://api-dev.finzone.vn`](configs/ApiConfig.js:4)
- Features: Leads/OTP, Credit Cards, Insurance, Tools (savings, salary, interest), Tracking ([`configs/ApiConfig.js`](configs/ApiConfig.js))

## Directory Structure and Purposes

### Root Configuration
```
.
├── package.json          # Dependencies, scripts
├── next.config.js        # Next.js config
├── postcss.config.js     # PostCSS/Tailwind config
├── jest.config.ts        # Jest setup
├── .eslintrc.json        # ESLint
├── .prettierrc           # Prettier
├── nginx.conf            # Deployment
├── Dockerfile*           # Containerization
└── .env.development      # Env vars
```

### App Router (Next.js 13+ App Directory)
```
app/
├── layout.tsx            # Root layout
├── page.tsx              # Home page
├── not-found.tsx         # 404 handler
├── the-tin-dung/         # Credit Cards (/the-tin-dung)
│   ├── page.tsx
│   ├── error.tsx
│   ├── chi-tiet/         # Detail (/chi-tiet)
│   ├── so-sanh/          # Compare (/so-sanh)
│   └── chuyen-tiep/      # Redirect (/chuyen-tiep)
├── bao-hiem/             # Insurance (/bao-hiem)
├── bao-hiem-xe/          # Vehicle Insurance
├── vay-tieu-dung/        # Consumer Loans (/vay-tieu-dung)
├── ket-qua-vay/          # Loan Results (/ket-qua-vay)
├── cong-cu/              # Tools/Calculators (/cong-cu)
│   ├── tinh-lai-tien-gui/   # Savings Interest Calc
│   ├── tinh-luong-gross-net/ # Salary Gross-Net
│   ├── tinh-luong-net-gross/
│   └── tinh-toan-khoan-vay/ # Loan Calculator
├── blog/                 # Blog ([id])
├── gioi-thieu/           # About
└── dieu-khoan-su-dung/   # Terms of Service
```
*Purpose*: Dynamic/static routes for financial features, Vietnamese slugs.

### UI Components
```
components/
├── Button/, Modal/, Slider/, TabDisplay/ etc.  # Generic reusable components
├── NavBar/index.js     # Navigation (open in VSCode)
└── style.module.scss   # Scoped styles for each
```
*Purpose*: Atomic design reusable UI elements.

### Feature Modules
```
modules/
├── CreditCardModule/    # Credit card listing, search, detail, compare, redirect
├── InsuranceModule/     # Insurance listing
├── LoanModule/          # Loan application, recommendation, result, OTP form
│   ├── LoanResult/
│   ├── OtpForm/
│   └── ApplyLoanForm/
├── Tools/               # Tool UIs: InterestRate, SalaryConversion, Saving
├── HomePage/            # Homepage sections: BlogSection, Community
└── ConsentPopup/        # Consent/Privacy popup
```
*Purpose*: Self-contained feature components, subcomponents, styles.

### Supporting Directories
```
├── configs/             # API endpoints ([ApiConfig.js]), mock data, constants
├── helpers/             # Utils: format, validate, localStorage, location, etc.
├── hooks/               # Custom hooks (useIntersection)
├── states/              # Zustand stores
├── styles/              # Global styles
├── types/               # TS types
├── public/              # Static assets (images, favicon)
├── functions/           # Server functions: _middleware.ts, cfp_login.ts
├── external/            # 3rd-party: fingerprint.js
└── blogs/               # Blog data/content
```
*Purpose*: Separation of concerns - config, utils, state, assets.

## Key Observations
- **Financial Marketplace**: Credit cards, loans, insurance comparison; lead gen with OTP/consent.
- **Vietnamese Focus**: Route slugs (the-tin-dung=credit cards), provinces, telcos (Viettel etc.).
- **Responsive**: Bulma helpers, react-responsive.
- **Mixed JS/TS**: Gradual TS adoption.
- **No Pages Router**: Pure App Router.
- **Monorepo-like Modules**: Feature slices.
- **Tracking/Analytics**: GA, FingerprintJS, session tracking.

This overview derived from file structure, package.json, configs, without code duplication.