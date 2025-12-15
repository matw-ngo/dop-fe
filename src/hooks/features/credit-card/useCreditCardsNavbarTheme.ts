"use client";

import { useMemo } from "react";
import { useThemeUtils } from "@/components/renderer/theme";
import { NavbarConfig } from "@/configs/navbar-config";

/**
 * Hook to get theme-aware credit cards navbar configuration
 * This hook ensures the navbar colors match the active theme
 */
export function useCreditCardsNavbarTheme(): NavbarConfig {
  const { theme, resolvedTheme } = useThemeUtils();

  return useMemo(() => {
    // Default colors
    let iconColor = "#017848"; // Default finzone green

    // Apply theme-specific colors
    if (theme) {
      if (theme.name === "corporate") {
        // Corporate theme uses professional blue tones
        // Light mode: oklch(0.47 0.13 220) -> hex approx #1e40af
        // Dark mode: oklch(0.67 0.13 220) -> hex approx #2563eb
        iconColor = resolvedTheme === "dark" ? "#2563eb" : "#1e40af";
      } else {
        // Use the theme's primary color based on current mode
        iconColor = theme.colors.primary || "#017848";
      }
    }

    // Return the config with theme-aware colors
    return {
      company: "finzone",
      logo: {
        text: "Fin Zone",
        href: "/",
        iconColor,
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
              id: "products-credit-card",
              label: "Thẻ tín dụng",
              type: "link",
              href: "/credit-cards",
              onClick: "top_navigation_click_product_credit_card",
            },
            {
              id: "products-lending",
              label: "Vay tiêu dùng",
              type: "link",
              href: "/user-onboarding",
              onClick: "top_navigation_click_product_lending",
            },
            {
              id: "products-insurance",
              label: "Bảo hiểm",
              type: "link",
              href: "/insurance",
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
              href: "/tools/loan-calculator",
              onClick: "top_navigation_click_loan_calculator",
            },
            {
              id: "tools-deposit-calculator",
              label: "Tính lãi tiền gửi",
              type: "link",
              href: "/tools/deposit-calculator",
              onClick: "top_navigation_click_deposit_calculator",
            },
            {
              id: "tools-gross-net-salary",
              label: "Tính lương Gross - Net",
              type: "link",
              href: "/tools/salary-converter",
              onClick: "top_navigation_click_salary_converter",
            },
            {
              id: "tools-all",
              label: "Tất cả công cụ",
              type: "link",
              href: "/tools",
              onClick: "top_navigation_click_all_tools",
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
          href: "/blog",
          onClick: "top_navigation_click_financial_knowledge",
          target: "_blank",
        },
      ],
      hideOnPaths: ["/thong-tin-vay/", "/tim-kiem-vay/", "/ket-qua-vay/"],
    };
  }, [theme, resolvedTheme]);
}
