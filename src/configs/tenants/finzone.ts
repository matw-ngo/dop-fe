import { finzoneTheme } from "@/configs/themes";
import { TenantConfig } from "./types";

export const finzoneConfig: TenantConfig = {
  id: "finzone",
  name: "Fin Zone",
  theme: finzoneTheme,
  i18nNamespace: "tenants.finzone",

  branding: {
    logoUrl: "/images/logo.png",
  },

  products: {
    loan: {
      minAmount: 1_000_000, // 1 million VND
      maxAmount: 100_000_000, // 100 million VND
      minTerm: 3, // 3 months
      maxTerm: 24, // 24 months
      minRate: 0.8, // 0.8% per month
      maxRate: 2.17, // 2.17% per month
      approvalTime: 30, // 30 seconds
    },
    creditCard: {
      enabled: true,
    },
    insurance: {
      enabled: true,
    },
  },

  stats: {
    partnersCount: 16,
    connectionsCount: 100_000,
    registrationsCount: 10_000,
    successfulLoansCount: 1_000,
  },

  features: {
    enableBlog: true,
    socialMedia: {
      instagram: "https://www.instagram.com/finzone.vietnam",
      facebook: "https://www.facebook.com/finzonevietnam/",
      tiktok: "https://www.tiktok.com/@finzone.vn",
      youtube: "https://www.youtube.com/channel/UCekh_IetVHbSzmUwuyh16Gw",
    },
  },

  legal: {
    businessLicense: "0108201417",
    socialLicense: "26/GP-BTTTT",
  },
};
