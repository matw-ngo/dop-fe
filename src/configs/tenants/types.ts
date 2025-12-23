import { FormTheme } from "@/components/form-generation/themes/types";

export interface Address {
  type: "headquarters" | "branch";
  city: string;
  address: string;
}

export interface SocialMediaLinks {
  instagram?: string;
  facebook?: string;
  tiktok?: string;
  youtube?: string;
  zalo?: string;
}

export interface TenantConfig {
  id: string;
  name: string;
  domain: string;
  theme: FormTheme;

  /**
   * i18n namespace for tenant-specific translations
   * e.g., "tenants.finzone" will load messages/vi/tenants/finzone/*.json
   */
  i18nNamespace: string;

  branding: {
    logoUrl?: string;
    favicon?: string;
  };

  /**
   * Product specifications and limits
   */
  products: {
    loan: {
      minAmount: number; // VND
      maxAmount: number; // VND
      minTerm: number; // months
      maxTerm: number; // months
      minRate: number; // % per month
      maxRate: number; // % per month
      approvalTime: number; // seconds
    };
    creditCard: {
      enabled: boolean;
    };
    insurance: {
      enabled: boolean;
    };
  };

  /**
   * Statistics for homepage display
   */
  stats: {
    partnersCount: number;
    connectionsCount: number;
    registrationsCount: number;
    successfulLoansCount: number;
  };

  features: {
    enableBlog?: boolean;
    socialMedia: SocialMediaLinks;
  };

  legal: {
    companyName: string; // Keep for non-i18n contexts (e.g., API calls)
    businessLicense: string;
    socialLicense?: string;
    addresses: Address[];
    disclaimer: string; // Long text, will be in i18n
  };
}
