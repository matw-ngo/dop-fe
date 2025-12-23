# How to Add a New Tenant

This guide explains the step-by-step process for onboarding a new tenant (company) to the platform using our refined multi-tenant and i18n architecture.

## Overview
Architecture relies on a clear split:
- **Config**: Non-translatable data (numbers, URLs, flags) in `src/configs/tenants/`.
- **I18n**: Translatable content in `messages/{locale}/tenants/{tenantId}/`.
- **Theme**: Visual styling in `src/configs/themes/`.

---

## Step 1: Create Theme (Optional)
If the new tenant requires unique branding (colors, spacing), create a new theme.

1. Create `src/configs/themes/{tenantId}-theme.ts`:
   ```typescript
   import { FormTheme } from "./types";
   export const newTenantTheme: FormTheme = {
     colors: { primary: "#your-color", ... },
     // ... other theme properties
   };
   ```
2. Export it from `src/configs/themes/index.ts`.

---

## Step 2: Create Tenant Configuration
Define the data for the new tenant.

1. Create `src/configs/tenants/{tenantId}.ts`:
   ```typescript
   import { newTenantTheme } from "@/configs/themes";
   import { TenantConfig } from "./types";

   export const newTenantConfig: TenantConfig = {
     id: "newtenant",
     name: "New Company Name",
     theme: newTenantTheme,
     i18nNamespace: "tenants.newtenant",
     branding: { logoUrl: "/images/new-logo.png" },
     products: {
       loan: { minAmount: 1000000, maxAmount: 50000000, ... },
       creditCard: { enabled: true },
       insurance: { enabled: false }
     },
     stats: { partnersCount: 5, ... },
     features: { socialMedia: { facebook: "...", ... } },
     legal: { businessLicense: "123456789" }
   };
   ```
2. Register the tenant in `src/configs/tenants/index.ts`:
   ```typescript
   import { newTenantConfig } from "./newtenant";
   export const tenantRegistry: Record<string, TenantConfig> = {
     finzone: finzoneConfig,
     newtenant: newTenantConfig,
   };
   ```

---

## Step 3: Add Translatable Content
Create the message files for all supported locales.

1. Create folder `messages/vi/tenants/{tenantId}/`.
2. Create JSON files matching the namespaces used in components:
   - `company.json`: `fullName`, `addresses.headquarters`, etc.
   - `products.json`: `loan.title`, `loan.benefits.lowRate`, etc.
   - `legal.json`: `disclaimer`, `businessLicense`, etc.
3. Repeat for other locales (e.g., `messages/en/tenants/{tenantId}/`).

---

## Step 4: Verification
1. Start the dev server: `npm run dev`.
2. Access the site via the tenant's domain (or simulate by modifying `useTenant.ts` logic).
3. Verify that:
   - Colors and logos match the new theme.
   - Statistics and product limits show the new values.
   - All text is correctly localized based on the new JSON files.
