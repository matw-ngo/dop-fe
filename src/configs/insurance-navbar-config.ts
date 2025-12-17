import type { NavbarConfig } from "./navbar-config";

// Insurance-specific navigation configuration
export const baseInsuranceNavbarConfig: NavbarConfig = {
  company: "finzone",
  logo: {
    text: "Fin Zone",
    href: "/",
    iconColor: "#2563eb", // Default blue color
    iconLetter: "F",
  },
  navigation: [
    {
      id: "insurance",
      label: "Bảo hiểm",
      type: "dropdown",
      children: [
        {
          id: "insurance-home",
          label: "Trang chủ",
          type: "link",
          href: "/insurance",
          onClick: "insurance_navigation_click_home",
        },
        {
          id: "insurance-calculator",
          label: "Công cụ tính phí",
          type: "link",
          href: "/insurance/calculator",
          onClick: "insurance_navigation_click_calculator",
        },
        {
          id: "insurance-fee-tables",
          label: "Biểu phí",
          type: "link",
          href: "/insurance/fee-tables",
          onClick: "insurance_navigation_click_fee_tables",
        },
        {
          id: "insurance-compare",
          label: "So sánh",
          type: "link",
          href: "/insurance/compare",
          onClick: "insurance_navigation_click_compare",
        },
        {
          id: "insurance-tutorials",
          label: "Hướng dẫn",
          type: "link",
          href: "/insurance/tutorials",
          onClick: "insurance_navigation_click_tutorials",
        },
        {
          id: "insurance-regulations",
          label: "Quy định",
          type: "link",
          href: "/insurance/regulations",
          onClick: "insurance_navigation_click_regulations",
        },
      ],
    },
    {
      id: "products",
      label: "Sản phẩm khác",
      type: "dropdown",
      children: [
        {
          id: "products-credit-card",
          label: "Thẻ tín dụng",
          type: "link",
          href: "/credit-cards",
          onClick: "insurance_navigation_click_credit_cards",
        },
        {
          id: "products-lending",
          label: "Vay tiêu dùng",
          type: "link",
          href: "/user-onboarding",
          onClick: "insurance_navigation_click_lending",
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
          href: "/tools/loan-calculator",
          onClick: "insurance_navigation_click_loan_calculator",
        },
        {
          id: "tools-deposit-calculator",
          label: "Tính lãi tiền gửi",
          type: "link",
          href: "/tools/deposit-calculator",
          onClick: "insurance_navigation_click_deposit_calculator",
        },
      ],
    },
  ],
  mobileNavigation: [
    {
      id: "mobile-insurance-home",
      label: "Trang chủ bảo hiểm",
      type: "link",
      href: "/insurance",
      icon: "shield",
    },
    {
      id: "mobile-calculator",
      label: "Tính phí bảo hiểm",
      type: "link",
      href: "/insurance/calculator",
      icon: "calculator",
    },
    {
      id: "mobile-compare",
      label: "So sánh sản phẩm",
      type: "link",
      href: "/insurance/compare",
      icon: "compare",
    },
    {
      id: "mobile-tutorials",
      label: "Hướng dẫn",
      type: "link",
      href: "/insurance/tutorials",
      icon: "book-open",
    },
  ],
};

// Function to get insurance navbar config (fallback without theme context)
export function getInsuranceNavbarConfig(): NavbarConfig {
  return baseInsuranceNavbarConfig;
}
