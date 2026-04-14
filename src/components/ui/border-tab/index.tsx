"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { useFormTheme } from "@/components/form-generation/themes";

export interface BorderTabItem {
  id: string;
  name: string;
  displayName: string;
  component: React.ReactNode;
  disabled?: boolean;
  eventName?: string;
  eventData?: Record<string, any>;
}

export interface BorderTabProps {
  tabList: BorderTabItem[];
  activeTab?: number;
  onChange?: (tabIndex: number) => void;
  className?: string;
}

export const BorderTab = ({
  tabList,
  activeTab: controlledActiveTab,
  onChange,
  className,
}: BorderTabProps) => {
  const { theme } = useFormTheme();
  const [internalActiveTab, setInternalActiveTab] = useState(0);

  const activeTab =
    controlledActiveTab !== undefined ? controlledActiveTab : internalActiveTab;

  const handleTabClick = (index: number) => {
    if (tabList[index].disabled) return;

    if (onChange) {
      onChange(index);
    } else {
      setInternalActiveTab(index);
    }
  };

  return (
    <div className={cn("w-full", className)}>
      {/* Tabs - Use generic tokens */}
      <div
        className="flex border-b"
        style={{
          borderColor: theme.colors.border,
          gap: theme.spacing.xs,
          marginBottom: theme.spacing.lg,
        }}
      >
        {tabList.map((tab, index) => (
          <button
            key={tab.id}
            onClick={() => handleTabClick(index)}
            disabled={tab.disabled}
            className={cn(
              "flex-1 text-center cursor-pointer transition-colors border-b-2 -mb-px",
              "disabled:opacity-60 disabled:cursor-default",
            )}
            style={{
              fontSize: theme.typography.fontSizes.sm,
              lineHeight: theme.typography.lineHeights.snug,
              paddingBottom: theme.spacing.md,
              fontWeight:
                activeTab === index
                  ? theme.typography.fontWeights.semibold
                  : theme.typography.fontWeights.normal,
              color:
                activeTab === index
                  ? theme.colors.primary
                  : theme.colors.iconSubtle,
              borderColor:
                activeTab === index ? theme.colors.primary : "transparent",
            }}
          >
            {tab.displayName}
          </button>
        ))}
      </div>

      {/* Content - Use generic tokens with scrolling */}
      <div
        className="overflow-y-auto"
        style={{
          height: "152px",
          fontSize: theme.typography.fontSizes.sm,
          fontWeight: theme.typography.fontWeights.normal,
          lineHeight: theme.typography.lineHeights.snug,
        }}
      >
        {tabList[activeTab]?.component}
      </div>
    </div>
  );
};
