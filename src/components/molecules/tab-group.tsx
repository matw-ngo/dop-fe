"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export interface TabItem {
  id: string;
  label: string;
  content?: React.ReactNode;
  disabled?: boolean;
  badge?: string | number;
}

export interface TabGroupProps {
  items: TabItem[];
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  variant?: "default" | "pills" | "underline";
  size?: "sm" | "md" | "lg";
  className?: string;
  tabListClassName?: string;
  tabContentClassName?: string;
  orientation?: "horizontal" | "vertical";
}

export function TabGroup({
  items,
  defaultValue,
  value,
  onValueChange,
  variant = "default",
  size = "md",
  className,
  tabListClassName,
  tabContentClassName,
  orientation = "horizontal",
}: TabGroupProps) {
  const [activeTab, setActiveTab] = React.useState(
    value || defaultValue || items[0]?.id,
  );

  React.useEffect(() => {
    if (value !== undefined) {
      setActiveTab(value);
    }
  }, [value]);

  const handleTabChange = (tabId: string) => {
    if (value === undefined) {
      setActiveTab(tabId);
    }
    onValueChange?.(tabId);
  };

  const activeTabContent = items.find((item) => item.id === activeTab)?.content;

  const tabVariants = {
    default: {
      list: "inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground",
      tab: "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm",
    },
    pills: {
      list: "inline-flex items-center justify-center gap-1",
      tab: "inline-flex items-center justify-center whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-muted data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm",
    },
    underline: {
      list: "inline-flex items-center justify-center border-b",
      tab: "inline-flex items-center justify-center whitespace-nowrap px-4 py-2 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border-b-2 border-transparent hover:text-foreground data-[state=active]:border-primary data-[state=active]:text-foreground",
    },
  };

  const sizeVariants = {
    sm: "text-xs px-2 py-1",
    md: "text-sm px-3 py-1.5",
    lg: "text-base px-4 py-2",
  };

  return (
    <div
      className={cn(
        "w-full",
        orientation === "vertical" && "flex gap-4",
        className,
      )}
    >
      {/* Tab List */}
      <div
        className={cn(
          tabVariants[variant].list,
          orientation === "vertical" && "flex-col h-auto w-auto",
          tabListClassName,
        )}
        role="tablist"
        aria-orientation={orientation}
      >
        {items.map((item) => (
          <button
            key={item.id}
            className={cn(
              tabVariants[variant].tab,
              sizeVariants[size],
              item.disabled && "opacity-50 cursor-not-allowed",
            )}
            onClick={() => !item.disabled && handleTabChange(item.id)}
            disabled={item.disabled}
            role="tab"
            aria-selected={activeTab === item.id}
            data-state={activeTab === item.id ? "active" : "inactive"}
            tabIndex={activeTab === item.id ? 0 : -1}
          >
            <span>{item.label}</span>
            {item.badge && (
              <span className="ml-2 inline-flex items-center justify-center w-5 h-5 text-xs font-bold rounded-full bg-primary/20 text-primary">
                {item.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTabContent && (
        <div
          className={cn(
            "mt-4 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            orientation === "vertical" && "mt-0 flex-1",
            tabContentClassName,
          )}
          role="tabpanel"
          tabIndex={0}
        >
          {activeTabContent}
        </div>
      )}
    </div>
  );
}

// Individual Tab Item component for more granular control
export interface TabItemProps {
  children: React.ReactNode;
  value: string;
  className?: string;
  disabled?: boolean;
}

export function TabItem({ children, className, disabled }: TabItemProps) {
  return (
    <div className={cn("w-full", className)} data-disabled={disabled}>
      {children}
    </div>
  );
}
