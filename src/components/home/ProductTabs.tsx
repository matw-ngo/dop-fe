"use client";

import { useState } from "react";
import { useFormTheme } from "@/components/form-generation/themes/ThemeProvider";
import {
  SearchMoneyIcon,
  CardsIcon,
  CarInsurIcon,
} from "@/components/icons/home";

/**
 * Product Tabs Component
 *
 * Reference: docs/old-code/components/TabDisplay/index.tsx
 * Tab navigation for different products with theme-aware colors
 */

interface Tab {
  id: string;
  displayName: string;
  icon: React.ReactNode;
  activeIcon: React.ReactNode;
  disabled: boolean;
}

interface ProductTabsProps {
  children: React.ReactNode[];
  defaultTab?: number;
}

export function ProductTabs({ children, defaultTab = 0 }: ProductTabsProps) {
  const { theme } = useFormTheme();
  const primaryColor = theme.colors.primary;
  const [currentTabIndex, setCurrentTabIndex] = useState(defaultTab);

  const tabs: Tab[] = [
    {
      id: "lending",
      displayName: "Vay tiêu dùng",
      icon: <SearchMoneyIcon color={primaryColor} width={24} height={24} />,
      activeIcon: <SearchMoneyIcon color="#fff" width={24} height={24} />,
      disabled: false,
    },
    {
      id: "credit-card",
      displayName: "Thẻ tín dụng",
      icon: <CardsIcon color={primaryColor} width={24} height={24} />,
      activeIcon: <CardsIcon color="#fff" width={24} height={24} />,
      disabled: false,
    },
    {
      id: "insurance",
      displayName: "Bảo hiểm",
      icon: <CarInsurIcon color={primaryColor} width={24} height={24} />,
      activeIcon: <CarInsurIcon color="#fff" width={24} height={24} />,
      disabled: false,
    },
    {
      id: "securities",
      displayName: "Chứng khoán",
      icon: <SearchMoneyIcon color="#999" width={24} height={24} />,
      activeIcon: <SearchMoneyIcon color="#999" width={24} height={24} />,
      disabled: true,
    },
  ];

  return (
    <section className="w-full mb-12 md:mb-12">
      <div className="max-w-[1170px] mx-auto pt-[30px] px-4 md:px-4">
        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-2 md:gap-4 mb-8">
          {tabs.map((tab, index) => (
            <button
              key={tab.id}
              onClick={() => !tab.disabled && setCurrentTabIndex(index)}
              disabled={tab.disabled}
              className={`
                flex items-center gap-3 px-6 py-4 rounded-lg transition-all
                ${
                  currentTabIndex === index
                    ? "shadow-lg"
                    : "bg-white border border-gray-200"
                }
                ${tab.disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:shadow-md"}
              `}
              style={{
                backgroundColor:
                  currentTabIndex === index ? primaryColor : undefined,
                color: currentTabIndex === index ? "#fff" : primaryColor,
              }}
            >
              <div className="w-6 h-6">
                {currentTabIndex === index ? tab.activeIcon : tab.icon}
              </div>
              <span className="font-semibold text-sm md:text-base">
                {tab.displayName}
              </span>
              {tab.disabled && (
                <span className="text-xs opacity-70">Coming soon</span>
              )}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="tab-content">{children[currentTabIndex]}</div>
      </div>
    </section>
  );
}
