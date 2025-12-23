"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useTenant } from "@/hooks/useTenant";
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
    <div className="w-full bg-white">
      <div className="max-w-[1200px] mx-auto px-4">
        {/* Tab List */}
        <div className="flex overflow-x-auto no-scrollbar border-b border-gray-100">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => !tab.disabled && setActiveTab(tab.id)}
              className={`flex items-center gap-3 px-6 py-4 md:py-6 border-b-2 transition-all whitespace-nowrap ${
                tab.disabled
                  ? "opacity-50 cursor-not-allowed"
                  : "cursor-pointer"
              } ${
                activeTab === tab.id
                  ? "border-current font-bold"
                  : "border-transparent text-gray-400 hover:text-gray-600"
              }`}
              style={{
                color: activeTab === tab.id ? primaryColor : undefined,
                borderColor: activeTab === tab.id ? primaryColor : undefined,
              }}
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                  activeTab === tab.id ? "" : "bg-gray-50"
                }`}
                style={{
                  backgroundColor:
                    activeTab === tab.id ? primaryColor : undefined,
                }}
              >
                {tab.icon}
              </div>
              <span className="text-sm md:text-base">{tab.label}</span>
              {tab.disabled && (
                <span className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded uppercase font-normal">
                  {t_common("comingSoon")}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="py-8 md:py-12">{children[activeTab]}</div>
      </div>
    </div>
  );
}
