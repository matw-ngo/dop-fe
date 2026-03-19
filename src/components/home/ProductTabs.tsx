"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import {
  StudentLoanIcon,
  CardsIcon,
  CarInsurIcon,
  SearchMoneyIcon,
} from "@/components/icons/home";
import { useTenant } from "@/hooks/tenant/use-tenant";
import { cn } from "@/lib/utils";

interface ProductTabsProps {
  children: React.ReactNode[];
  defaultTab?: number;
}

export function ProductTabs({ children, defaultTab = 0 }: ProductTabsProps) {
  const t = useTranslations("components.layout.header.nav.products");
  const [activeTab, setActiveTab] = useState(defaultTab);
  const tenant = useTenant();
  const primaryColor = tenant.theme.colors.primary;
  const secondaryBg = tenant.theme.colors.backgroundSecondary || "#eff7f0";
  const accentColor = tenant.theme.colors.accent || "#ffd566";
  const accentTextColor = tenant.theme.colors.accentText || "#073126";
  const t_common = useTranslations("common");

  const tabs = [
    {
      id: 0,
      label: t("lending"),
      icon: (
        <SearchMoneyIcon
          color={activeTab === 0 ? "#fff" : primaryColor}
          width={32}
          height={32}
        />
      ),
    },
    {
      id: 1,
      label: t("creditCard"),
      icon: (
        <CardsIcon
          color={activeTab === 1 ? "#fff" : primaryColor}
          width={32}
          height={32}
        />
      ),
    },
    {
      id: 2,
      label: t("insurance"),
      icon: (
        <CarInsurIcon
          color={activeTab === 2 ? "#fff" : primaryColor}
          width={32}
          height={32}
        />
      ),
    },
    {
      id: 3,
      label: t("securities"),
      icon: (
        <StudentLoanIcon
          color={activeTab === 3 ? "#fff" : primaryColor}
          width={32}
          height={32}
        />
      ),
      disabled: true,
    },
  ];

  return (
    <div className="w-full bg-white pt-8">
      <div className="max-w-[1170px] mx-auto px-4">
        {/* Tab List - Legacy Card Style */}
        <div className="flex flex-wrap md:justify-between justify-center gap-[17px] md:gap-[5px] mb-5 md:px-0 px-[10px]">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => !tab.disabled && setActiveTab(tab.id)}
                disabled={tab.disabled}
                className={cn(
                  "relative flex items-center justify-center",
                  "w-[163px] h-[56px] md:w-[270px] md:h-[80px]",
                  "rounded-lg transition-all duration-200",
                  "text-xs md:text-lg font-normal leading-4 md:leading-7",
                  "md:p-0 p-[10px]",
                  tab.disabled
                    ? "opacity-100 cursor-default"
                    : "cursor-pointer",
                )}
                style={{
                  backgroundColor: isActive ? primaryColor : secondaryBg,
                  color: isActive ? "#fff" : primaryColor,
                  gap: "8px",
                }}
              >
                {/* Icon */}
                <div className="flex-shrink-0 w-6 h-6 md:w-8 md:h-8 flex items-center justify-center">
                  {tab.icon}
                </div>

                {/* Label */}
                <span className="md:w-auto w-14">{tab.label}</span>

                {/* Coming Soon Badge */}
                {tab.disabled && (
                  <div
                    className="absolute -top-2 w-[86px] h-[18px] rounded-full flex items-center justify-center text-[11px] font-normal leading-[14px]"
                    style={{
                      backgroundColor: accentColor,
                      color: accentTextColor,
                    }}
                  >
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
