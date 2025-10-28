export interface FooterLink {
  id: string;
  label: string;
  href: string;
  target?: "_blank" | "_self";
  onClick?: string; // Event tracking identifier
}

export interface FooterSection {
  id: string;
  title: string;
  links: FooterLink[];
}

export interface SocialMediaLink {
  id: string;
  platform:
    | "facebook"
    | "twitter"
    | "instagram"
    | "youtube"
    | "linkedin"
    | "tiktok";
  href: string;
  ariaLabel?: string;
}

export interface CompanyInfo {
  name: string;
  description: string;
  addresses: string[];
  businessRegistration?: string[];
  copyright: string;
  disclaimer?: string;
}

export interface FooterLogo {
  text: string;
  href: string;
  iconColor: string;
  iconBgColor: string;
  iconLetter: string;
}

export interface FooterConfig {
  company: string;
  logo: FooterLogo;
  companyInfo: CompanyInfo;
  sections: FooterSection[];
  socialMedia: SocialMediaLink[];
  theme?: {
    backgroundColor: string;
    textColor: string;
    textSecondaryColor: string;
    borderColor: string;
    socialButtonColor: string;
    socialButtonHoverColor: string;
  };
  showOnPaths?: string[]; // Paths where footer should be shown
  hideOnPaths?: string[]; // Paths where footer should be hidden
}

// Default Fin Zone configuration
export const finZoneFooterConfig: FooterConfig = {
  company: "finzone",
  logo: {
    text: "Fin Zone",
    href: "/",
    iconColor: "#0f766e", // teal-700
    iconBgColor: "#ffffff",
    iconLetter: "F",
  },
  companyInfo: {
    name: "Fin Zone",
    description:
      "Công ty cổ phần Công nghệ Data Nest - Data Nest Technologies JSC",
    addresses: [
      "Trụ sở: Tầng 7, HITC Building, 239 Xuân Thuỷ, Q. Cầu Giấy, Hà Nội.",
      "Chi nhánh HCM: Tòa nhà Viettel, 285 Cách Mạng Tháng 8, Quận 10, Hồ Chí Minh.",
    ],
    businessRegistration: [
      "Giấy chứng nhận Đăng ký Kinh doanh số 0108201417 cấp bởi Sở Kế hoạch và Đầu tư TP Hà Nội ngày 27/03/2018",
      "Giấy phép Thiết lập Mạng Xã Hội trên mạng số 26/GP-BTTT cấp bởi Bộ Thông Tin và Truyền Thông ngày 06/02/2024",
    ],
    copyright: "Copyright © 2023 Fin Zone, All rights reserved",
    disclaimer:
      "Fin Zone không phải đơn vị cung cấp vay và không phát hành các khoản vay. Dịch vụ của Fin Zone giúp đánh giá các đối tác vay uy tín với các sản phẩm tài chính da dạng, thời gian trả nợ linh hoạt từ 91 đến 180 ngày, với lãi suất APR tối thiểu là 0% với đa lựa chọn. Fin Zone không tính phí sử dụng dịch vụ. Chi phí cuối cùng của người vay được tính toán khoản vay. Người dùng được thông tin đầy đủ và chính xác về APR, cũng như tất cả các khoản phí trước khi ký hợp đồng vay.",
  },
  sections: [
    {
      id: "management",
      title: "ĐƠN VỊ CHỦ QUẢN",
      links: [
        {
          id: "about-mgmt",
          label: "Giới thiệu",
          href: "/gioi-thieu",
        },
        {
          id: "blog-mgmt",
          label: "Blog",
          href: "/blog",
          target: "_blank",
        },
        {
          id: "contact-mgmt",
          label: "Liên hệ",
          href: "/lien-he",
        },
        {
          id: "terms-mgmt",
          label: "Điều khoản",
          href: "/dieu-khoan",
        },
      ],
    },
    {
      id: "information",
      title: "THÔNG TIN",
      links: [
        {
          id: "about-info",
          label: "Giới thiệu",
          href: "/gioi-thieu",
        },
        {
          id: "blog-info",
          label: "Blog",
          href: "/blog",
          target: "_blank",
        },
        {
          id: "contact-info",
          label: "Liên hệ",
          href: "/lien-he",
        },
        {
          id: "faq",
          label: "FAQ",
          href: "/faq",
        },
        {
          id: "terms-info",
          label: "Điều khoản",
          href: "/dieu-khoan",
        },
      ],
    },
    {
      id: "products",
      title: "SẢN PHẨM",
      links: [
        {
          id: "consumer-loan",
          label: "Vay tiêu dùng",
          href: "/vay-tieu-dung",
        },
        {
          id: "credit-card",
          label: "Thẻ tín dụng",
          href: "/the-tin-dung",
        },
        {
          id: "insurance",
          label: "Bảo hiểm",
          href: "/bao-hiem",
        },
      ],
    },
    {
      id: "tools",
      title: "CÔNG CỤ",
      links: [
        {
          id: "loan-calculator",
          label: "Tính toán khoản vay",
          href: "/cong-cu/tinh-toan-khoan-vay",
        },
        {
          id: "deposit-calculator",
          label: "Tính lãi tiền gửi",
          href: "/cong-cu/tinh-lai-tien-gui",
        },
        {
          id: "gross-net-salary",
          label: "Tính lương Gross - Net",
          href: "/cong-cu/tinh-luong-gross-net",
        },
        {
          id: "net-gross-salary",
          label: "Tính lương Net - Gross",
          href: "/cong-cu/tinh-luong-net-gross",
        },
      ],
    },
  ],
  socialMedia: [
    {
      id: "facebook",
      platform: "facebook",
      href: "https://facebook.com/finzone",
      ariaLabel: "Facebook",
    },
    {
      id: "twitter",
      platform: "twitter",
      href: "https://twitter.com/finzone",
      ariaLabel: "Twitter",
    },
    {
      id: "instagram",
      platform: "instagram",
      href: "https://instagram.com/finzone",
      ariaLabel: "Instagram",
    },
    {
      id: "youtube",
      platform: "youtube",
      href: "https://youtube.com/finzone",
      ariaLabel: "YouTube",
    },
  ],
  theme: {
    backgroundColor: "#0f766e", // teal-700
    textColor: "#ffffff",
    textSecondaryColor: "#ccfbf1", // teal-100
    borderColor: "#0d9488", // teal-600
    socialButtonColor: "#0d9488", // teal-600
    socialButtonHoverColor: "#14b8a6", // teal-500
  },
};

// Example configuration for another company
export const exampleCompanyFooterConfig: FooterConfig = {
  company: "example-corp",
  logo: {
    text: "Example Corp",
    href: "/",
    iconColor: "#1e40af", // blue-800
    iconBgColor: "#ffffff",
    iconLetter: "E",
  },
  companyInfo: {
    name: "Example Corp",
    description: "Example Corporation - Leading Technology Solutions",
    addresses: [
      "Main Office: 123 Tech Street, Silicon Valley, CA 94000",
      "Branch Office: 456 Innovation Ave, New York, NY 10001",
    ],
    copyright: "Copyright © 2023 Example Corp, All rights reserved",
  },
  sections: [
    {
      id: "company",
      title: "COMPANY",
      links: [
        {
          id: "about",
          label: "About Us",
          href: "/about",
        },
        {
          id: "careers",
          label: "Careers",
          href: "/careers",
        },
        {
          id: "contact",
          label: "Contact",
          href: "/contact",
        },
      ],
    },
    {
      id: "services",
      title: "SERVICES",
      links: [
        {
          id: "consulting",
          label: "Consulting",
          href: "/services/consulting",
        },
        {
          id: "development",
          label: "Development",
          href: "/services/development",
        },
        {
          id: "support",
          label: "Support",
          href: "/services/support",
        },
      ],
    },
  ],
  socialMedia: [
    {
      id: "linkedin",
      platform: "linkedin",
      href: "https://linkedin.com/company/example-corp",
      ariaLabel: "LinkedIn",
    },
    {
      id: "twitter",
      platform: "twitter",
      href: "https://twitter.com/example_corp",
      ariaLabel: "Twitter",
    },
  ],
  theme: {
    backgroundColor: "#1e40af", // blue-800
    textColor: "#ffffff",
    textSecondaryColor: "#dbeafe", // blue-100
    borderColor: "#2563eb", // blue-600
    socialButtonColor: "#2563eb", // blue-600
    socialButtonHoverColor: "#3b82f6", // blue-500
  },
};

// Configuration registry
export const footerConfigs = {
  finzone: finZoneFooterConfig,
  "example-corp": exampleCompanyFooterConfig,
};

// Function to get configuration - uses static config by default
export function getFooterConfig(company?: string): FooterConfig {
  const configKey = company || "finzone";

  if (configKey in footerConfigs) {
    return footerConfigs[configKey as keyof typeof footerConfigs];
  }

  // Default fallback
  return finZoneFooterConfig;
}

// Function to fetch configuration from server using your API client pattern
// This would be implemented when server-side config is needed
export async function fetchFooterConfigFromServer(
  company: string,
): Promise<FooterConfig> {
  try {
    // This would use your apiClient from @/lib/api/client
    // Example implementation:
    // const { data, error } = await apiClient.GET("/footer-config/{company}", {
    //   params: { path: { company } }
    // });
    //
    // if (error) {
    //   throw new Error(`API request failed: ${error.message}`);
    // }
    //
    // return data;

    // For now, throw error to force fallback to static config
    throw new Error("Server-side config not implemented yet");
  } catch (error) {
    console.warn(
      "Failed to fetch footer config from server, using static config",
      error,
    );
    // Fallback to static config
    return getFooterConfig(company);
  }
}
