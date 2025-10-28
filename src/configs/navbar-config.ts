export interface NavbarItem {
  id: string;
  label: string;
  type: "link" | "dropdown" | "button";
  href?: string;
  icon?: string;
  target?: "_blank" | "_self";
  onClick?: string; // Event tracking or custom action
  children?: NavbarItem[];
  isVisible?: boolean;
}

export interface NavbarConfig {
  company: string;
  logo: {
    text: string;
    href: string;
    iconColor: string;
    iconLetter: string;
  };
  navigation: NavbarItem[];
  mobileNavigation?: NavbarItem[]; // Optional separate mobile nav
  showOnPaths?: string[]; // Paths where navbar should be shown
  hideOnPaths?: string[]; // Paths where navbar should be hidden
}

// Default Fin Zone configuration
export const finZoneNavbarConfig: NavbarConfig = {
  company: "finzone",
  logo: {
    text: "Fin Zone",
    href: "/",
    iconColor: "#017848",
    iconLetter: "F",
  },
  navigation: [
    {
      id: "about",
      label: "Về Fin Zone",
      type: "dropdown",
      children: [
        {
          id: "about-intro",
          label: "Giới thiệu",
          type: "link",
          href: "/gioi-thieu",
          onClick: "top_navigation_click_about_us",
        },
        {
          id: "about-contact",
          label: "Liên hệ",
          type: "link",
          href: "/lien-he",
          onClick: "top_navigation_click_contact_us",
        },
      ],
    },
    {
      id: "products",
      label: "Sản phẩm",
      type: "dropdown",
      children: [
        {
          id: "products-lending",
          label: "Vay tiêu dùng",
          type: "link",
          href: "/vay-tieu-dung",
          onClick: "top_navigation_click_product_lending",
        },
        {
          id: "products-credit-card",
          label: "Thẻ tín dụng",
          type: "link",
          href: "/the-tin-dung",
          onClick: "top_navigation_click_product_credit_card",
        },
        {
          id: "products-insurance",
          label: "Bảo hiểm",
          type: "link",
          href: "/bao-hiem",
          onClick: "top_navigation_click_product_insurance",
        },
      ],
    },
    {
      id: "tools",
      label: "Công cụ",
      type: "dropdown",
      children: [
        {
          id: "tools-loan-calculator",
          label: "Tính toán khoản vay",
          type: "link",
          href: "/cong-cu/tinh-toan-khoan-vay",
        },
        {
          id: "tools-deposit-calculator",
          label: "Tính lãi tiền gửi",
          type: "link",
          href: "/cong-cu/tinh-lai-tien-gui",
        },
        {
          id: "tools-gross-net-salary",
          label: "Tính lương Gross - Net",
          type: "link",
          href: "/cong-cu/tinh-luong-gross-net",
        },
        {
          id: "tools-net-gross-salary",
          label: "Tính lương Net - Gross",
          type: "link",
          href: "/cong-cu/tinh-luong-net-gross",
        },
      ],
    },
    {
      id: "support",
      label: "Hỗ trợ",
      type: "link",
      href: "/lien-he",
      onClick: "top_navigation_click_support",
    },
    {
      id: "blog",
      label: "Blog",
      type: "link",
      href: "/blog", // This would be FINZONE_BLOG_BASE_PATH
      onClick: "top_navigation_click_financial_knowledge",
      target: "_blank",
    },
  ],
  hideOnPaths: ["/thong-tin-vay/", "/tim-kiem-vay/", "/ket-qua-vay/"],
};

// Example configuration for another company
export const exampleCompanyNavbarConfig: NavbarConfig = {
  company: "example-corp",
  logo: {
    text: "Example Corp",
    href: "/",
    iconColor: "#3b82f6",
    iconLetter: "E",
  },
  navigation: [
    {
      id: "services",
      label: "Services",
      type: "dropdown",
      children: [
        {
          id: "consulting",
          label: "Consulting",
          type: "link",
          href: "/consulting",
        },
        {
          id: "development",
          label: "Development",
          type: "link",
          href: "/development",
        },
      ],
    },
    {
      id: "about",
      label: "About",
      type: "link",
      href: "/about",
    },
    {
      id: "contact",
      label: "Contact",
      type: "link",
      href: "/contact",
    },
  ],
};

// Configuration registry
export const navbarConfigs = {
  finzone: finZoneNavbarConfig,
  "example-corp": exampleCompanyNavbarConfig,
};

// Function to get configuration - uses static config by default
export function getNavbarConfig(company?: string): NavbarConfig {
  const configKey = company || "finzone";

  if (configKey in navbarConfigs) {
    return navbarConfigs[configKey as keyof typeof navbarConfigs];
  }

  // Default fallback
  return finZoneNavbarConfig;
}

// Function to fetch configuration from server using your API client pattern
// This would be implemented when server-side config is needed
export async function fetchNavbarConfigFromServer(
  company: string,
): Promise<NavbarConfig> {
  try {
    // This would use your apiClient from @/lib/api/client
    // Example implementation:
    // const { data, error } = await apiClient.GET("/navbar-config/{company}", {
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
      "Failed to fetch navbar config from server, using static config",
      error,
    );
    // Fallback to static config
    return getNavbarConfig(company);
  }
}
