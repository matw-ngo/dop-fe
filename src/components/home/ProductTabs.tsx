"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useTenant } from "@/hooks/tenant/use-tenant";
import { cn } from "@/lib/utils";
import {
  PercentageIcon,
  BankIcon,
  FlashIcon,
  SearchMoneyIcon,
  CardsIcon,
  CarInsurIcon,
} from "@/components/icons/home";

interface ProductTabsProps {
  children: React.ReactNode[];
  defaultTab?: number;
}

export function ProductTabs({ children, defaultTab = 0 }: ProductTabsProps) {
  const t = useTranslations("components.layout.header.nav.products");
  const [activeTab, setActiveTab] = useState(defaultTab);
  const tenant = useTenant();
  const primaryColor = tenant.theme.colors.primary;
  const t_common = useTranslations("common");

  const tabs = [
    {
      id: 0,
      label: t("lending"),
      icon: <BankIcon color={activeTab === 0 ? "white" : primaryColor} />,
    },
    {
      id: 1,
      label: t("creditCard"),
      icon: <CardsIcon color={activeTab === 1 ? "white" : primaryColor} />,
    },
    {
      id: 2,
      label: t("insurance"),
      icon: <CarInsurIcon color={activeTab === 2 ? "white" : primaryColor} />,
    },
    {
      id: 3,
      label: t("securities"),
      icon: (
        <SearchMoneyIcon color={activeTab === 3 ? "white" : primaryColor} />
      ),
      disabled: true,
    },
  ];

  return (
    <div className="w-full bg-white pt-8">
      <div className="max-w-[1200px] mx-auto px-4">
        {/* Tab List - Legacy Card Style */}
        <div className="flex flex-wrap justify-center gap-3 md:gap-4 mb-8 md:mb-12">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => !tab.disabled && setActiveTab(tab.id)}
                disabled={tab.disabled}
                className={cn(
                  "relative flex items-center justify-center gap-2 md:gap-3",
                  "w-[163px] h-[56px] md:w-[270px] md:h-[80px]",
                  "rounded-lg font-medium transition-all duration-200",
                  "text-sm md:text-lg whitespace-nowrap",
                  tab.disabled
                    ? "opacity-100 cursor-default"
                    : "cursor-pointer",
                  isActive
                    ? "text-white shadow-lg"
                    : "bg-gray-100 hover:bg-gray-200 text-gray-500",
                )}
                style={{
                  backgroundColor: isActive ? primaryColor : undefined,
                  color: isActive ? "white" : undefined,
                }}
              >
                {/* Icon */}
                <div className="flex-shrink-0">
                  {/* We clone the icon to inject the white color if active, otherwise it uses primaryColor by default in tabs definition */}
                  {tab.icon}
                </div>

                {/* Label */}
                <span className="font-sans">{tab.label}</span>

                {/* Coming Soon Badge */}
                {tab.disabled && (
                  <div className="absolute -top-2 px-3 py-0.5 rounded-full bg-gray-200 text-[#073126] text-[10px] md:text-[11px] font-normal uppercase">
                    {t_common("comingSoon")}
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div className="py-8 md:py-12">{children[activeTab]}</div>
      </div>
    </div>
  );
}
