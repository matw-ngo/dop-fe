"use client";

import React, { useState } from "react";
import { useFormTheme } from "@/components/form-generation/themes";
import { cn } from "@/lib/utils";

interface ProductTab {
  id: string;
  displayName: string;
  component: React.ReactNode;
  disabled: boolean;
  icon: React.ReactNode;
  activeIcon: React.ReactNode;
}

interface ProductTabsProps {
  tabList: ProductTab[];
  activeTab?: number;
}

export const ProductTabs = ({ tabList, activeTab = 0 }: ProductTabsProps) => {
  const { theme } = useFormTheme();
  const [currentTab, setCurrentTab] = useState(tabList[activeTab]?.id);

  const handleTabClick = (id: string, disabled: boolean) => {
    if (!disabled) {
      setCurrentTab(id);
    }
  };

  const currentComponent = tabList.find(
    (tab) => tab.id === currentTab,
  )?.component;

  return (
    <div className="w-full space-y-8 md:space-y-12">
      {/* Tabs Navigation */}
      <div className="flex flex-wrap justify-center gap-3 md:gap-4 px-4">
        {tabList.map((tab) => {
          const isActive = currentTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.id, tab.disabled)}
              disabled={tab.disabled}
              className={cn(
                "relative flex items-center justify-center gap-2 md:gap-3",
                "w-[163px] h-[56px] md:w-[270px] md:h-[80px]",
                "rounded-lg font-medium",
                "text-sm md:text-lg leading-relaxed",
                "transition-all duration-200",
                "disabled:cursor-default",
                isActive
                  ? "text-white shadow-lg"
                  : "bg-gray-100 hover:bg-gray-200",
              )}
              style={{
                backgroundColor: isActive ? theme.colors.primary : undefined,
                color: isActive ? "white" : theme.colors.primary,
              }}
            >
              {/* Icon */}
              <div className="flex-shrink-0">
                {isActive ? tab.activeIcon : tab.icon}
              </div>

              {/* Label */}
              <span className="font-sans">{tab.displayName}</span>

              {/* Coming Soon Badge */}
              {tab.disabled && (
                <div className="absolute -top-2 px-3 py-0.5 rounded-full bg-gray-200 text-[#073126] text-[11px] font-normal">
                  Coming soon
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="w-full">{currentComponent}</div>
    </div>
  );
};
