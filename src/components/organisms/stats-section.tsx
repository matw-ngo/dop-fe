"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { StatItem } from "@/components/molecules/stat-item";
import { Badge } from "@/components/ui/badge";

export interface Stat {
  id?: string;
  value: string | number;
  label: string;
  description?: string;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
    label?: string;
  };
  suffix?: string;
  prefix?: string;
  color?: "default" | "primary" | "success" | "warning" | "destructive";
  highlight?: boolean;
}

export interface StatsSectionProps {
  title?: string;
  subtitle?: string;
  description?: string;
  stats: Stat[];
  variant?: "default" | "cards" | "minimal" | "featured" | "compact";
  layout?: "2-column" | "3-column" | "4-column" | "auto";
  size?: "sm" | "md" | "lg";
  className?: string;
  headerClassName?: string;
  statsClassName?: string;
  showHeader?: boolean;
  animateOnView?: boolean;
  background?: "none" | "muted" | "gradient" | "primary";
  alignment?: "left" | "center" | "right";
  spacing?: "tight" | "normal" | "loose";
}

export function StatsSection({
  title = "Số liệu ấn tượng",
  subtitle,
  description = "Những con số minh chứng cho sự tin tưởng của khách hàng",
  stats,
  variant = "default",
  layout = "auto",
  size = "md",
  className,
  headerClassName,
  statsClassName,
  showHeader = true,
  animateOnView = true,
  background = "none",
  alignment = "center",
  spacing = "normal",
}: StatsSectionProps) {
  const variantStyles = {
    default: {
      container: "py-16",
      header: "space-y-4 mb-12",
      statsContainer: "grid gap-8",
      statItem: "text-center",
    },
    cards: {
      container: "py-16",
      header: "space-y-4 mb-12",
      statsContainer: "grid gap-6",
      statItem: "",
    },
    minimal: {
      container: "py-8",
      header: "space-y-2 mb-8",
      statsContainer: "grid gap-4",
      statItem: "text-center",
    },
    featured: {
      container: "py-20",
      header: "space-y-6 mb-16",
      statsContainer: "grid gap-8",
      statItem: "text-center",
    },
    compact: {
      container: "py-6",
      header: "space-y-2 mb-6",
      statsContainer: "flex flex-wrap justify-center gap-6",
      statItem: "",
    },
  };

  const layoutStyles = {
    "2-column": "grid-cols-1 md:grid-cols-2",
    "3-column": "grid-cols-1 md:grid-cols-3",
    "4-column": "grid-cols-2 md:grid-cols-4",
    auto:
      stats.length <= 2
        ? "grid-cols-1 md:grid-cols-2"
        : stats.length === 3
          ? "grid-cols-1 md:grid-cols-3"
          : "grid-cols-2 md:grid-cols-4",
  };

  const sizeStyles = {
    sm: {
      title: "text-2xl font-bold",
      subtitle: "text-sm font-medium text-primary",
      description: "text-sm text-muted-foreground",
      container: "max-w-4xl",
      statSize: "sm" as const,
    },
    md: {
      title: "text-3xl font-bold",
      subtitle: "text-base font-medium text-primary",
      description: "text-base text-muted-foreground",
      container: "max-w-6xl",
      statSize: "md" as const,
    },
    lg: {
      title: "text-4xl font-bold",
      subtitle: "text-lg font-medium text-primary",
      description: "text-lg text-muted-foreground",
      container: "max-w-7xl",
      statSize: "lg" as const,
    },
  };

  const backgroundStyles = {
    none: "",
    muted: "bg-muted/50",
    gradient: "bg-gradient-to-br from-primary/5 via-background to-secondary/5",
    primary: "bg-primary text-primary-foreground",
  };

  const alignmentStyles = {
    left: "text-left",
    center: "text-center",
    right: "text-right",
  };

  const spacingStyles = {
    tight: "gap-4",
    normal: "gap-6 md:gap-8",
    loose: "gap-8 md:gap-12",
  };

  const styles = variantStyles[variant];
  const sizes = sizeStyles[size];
  const bgStyle = backgroundStyles[background];

  const renderHeader = () => {
    if (!showHeader) return null;

    return (
      <div
        className={cn(
          styles.header,
          alignmentStyles[alignment],
          headerClassName,
        )}
      >
        {subtitle && (
          <div
            className={cn(
              "flex gap-2",
              alignment === "center" && "justify-center",
              alignment === "right" && "justify-end",
            )}
          >
            <Badge variant="secondary" className={sizes.subtitle}>
              {subtitle}
            </Badge>
          </div>
        )}

        <h2 className={sizes.title}>{title}</h2>

        {description && (
          <p
            className={cn(
              "max-w-3xl text-muted-foreground",
              sizes.description,
              alignment === "center" && "mx-auto",
              alignment === "right" && "ml-auto",
            )}
          >
            {description}
          </p>
        )}
      </div>
    );
  };

  const renderStats = () => {
    const containerClasses = cn(
      styles.statsContainer,
      variant !== "compact" && layoutStyles[layout],
      spacingStyles[spacing],
      statsClassName,
    );

    return (
      <div className={containerClasses}>
        {stats.map((stat, index) => (
          <div key={stat.id || index} className={styles.statItem}>
            <StatItem
              icon={stat.icon}
              value={stat.value}
              label={stat.label}
              description={stat.description}
              trend={stat.trend}
              variant={
                variant === "cards"
                  ? "card"
                  : variant === "minimal"
                    ? "minimal"
                    : "default"
              }
              size={sizes.statSize}
              animateOnView={animateOnView}
              suffix={stat.suffix}
              prefix={stat.prefix}
              color={stat.color}
              highlight={stat.highlight}
            />
          </div>
        ))}
      </div>
    );
  };

  return (
    <section className={cn(bgStyle, className)}>
      <div
        className={cn(
          "container mx-auto px-4",
          styles.container,
          sizes.container,
        )}
      >
        {renderHeader()}
        {renderStats()}
      </div>
    </section>
  );
}
