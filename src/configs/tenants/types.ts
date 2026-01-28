import type { FormTheme } from "@/components/form-generation/themes/types";

// Address interface removed as addresses are now handled by i18n

export interface SocialMediaLinks {
  instagram?: string;
  facebook?: string;
  tiktok?: string;
  youtube?: string;
  zalo?: string;
}

export interface TenantConfig {
  id: string;
  uuid: string; // UUID for API requests (e.g., V1 API tenant field)
  theme: FormTheme;
  name: string; // System name / identifier

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
    businessLicense: string;
    socialLicense?: string;
  };
}
