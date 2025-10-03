"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { FeatureCard } from "@/components/molecules/feature-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowRight,
  Zap,
  Shield,
  Star,
  TrendingUp,
  Users,
  Award,
} from "lucide-react";

export interface Feature {
  id?: string;
  title: string;
  description: string;
  image?: string;
  icon?: React.ReactNode;
  badge?: string;
  features?: string[];
  buttonText?: string;
  buttonHref?: string;
  onButtonClick?: () => void;
  highlight?: boolean;
}

export interface FeaturesSectionProps {
  title?: string;
  subtitle?: string;
  description?: string;
  features: Feature[];
  variant?: "default" | "grid" | "carousel" | "staggered" | "minimal";
  layout?: "3-column" | "2-column" | "4-column" | "mixed";
  size?: "sm" | "md" | "lg";
  className?: string;
  headerClassName?: string;
  contentClassName?: string;
  showHeader?: boolean;
  showCTA?: boolean;
  ctaText?: string;
  ctaHref?: string;
  onCTAClick?: () => void;
  background?: "none" | "muted" | "gradient" | "primary";
  spacing?: "tight" | "normal" | "loose";
}

export function FeaturesSection({
  title = "Tính năng nổi bật",
  subtitle,
  description = "Khám phá những tính năng làm nên sự khác biệt của chúng tôi",
  features,
  variant = "default",
  layout = "3-column",
  size = "md",
  className,
  headerClassName,
  contentClassName,
  showHeader = true,
  showCTA = false,
  ctaText = "Xem tất cả tính năng",
  ctaHref,
  onCTAClick,
  background = "none",
  spacing = "normal",
}: FeaturesSectionProps) {
  const variantStyles = {
    default: {
      container: "py-16",
      header: "text-center space-y-4 mb-12",
      grid: "grid gap-6",
      card: "h-full",
    },
    grid: {
      container: "py-12",
      header: "text-center space-y-3 mb-10",
      grid: "grid gap-4",
      card: "h-full",
    },
    carousel: {
      container: "py-16",
      header: "text-center space-y-4 mb-12",
      grid: "flex gap-6 overflow-x-auto pb-4",
      card: "min-w-[300px] flex-shrink-0",
    },
    staggered: {
      container: "py-16",
      header: "text-center space-y-4 mb-12",
      grid: "grid gap-6",
      card: "h-full",
    },
    minimal: {
      container: "py-8",
      header: "space-y-2 mb-8",
      grid: "grid gap-4",
      card: "h-full",
    },
  };

  const layoutStyles = {
    "2-column": "grid-cols-1 md:grid-cols-2",
    "3-column": "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
    "4-column": "grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
    mixed: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
  };

  const sizeStyles = {
    sm: {
      title: "text-2xl font-bold",
      subtitle: "text-sm font-medium text-primary",
      description: "text-sm text-muted-foreground",
      container: "max-w-4xl",
    },
    md: {
      title: "text-3xl font-bold",
      subtitle: "text-base font-medium text-primary",
      description: "text-base text-muted-foreground",
      container: "max-w-6xl",
    },
    lg: {
      title: "text-4xl font-bold",
      subtitle: "text-lg font-medium text-primary",
      description: "text-lg text-muted-foreground",
      container: "max-w-7xl",
    },
  };

  const backgroundStyles = {
    none: "",
    muted: "bg-muted/50",
    gradient: "bg-gradient-to-br from-primary/5 via-background to-secondary/5",
    primary: "bg-primary text-primary-foreground",
  };

  const spacingStyles = {
    tight: "gap-4",
    normal: "gap-6",
    loose: "gap-8",
  };

  const styles = variantStyles[variant];
  const sizes = sizeStyles[size];
  const bgStyle = backgroundStyles[background];

  // Handle mixed layout (featured + regular)
  const getMixedLayoutClasses = (index: number) => {
    if (layout === "mixed" && features.length > 2) {
      if (index === 0) return "md:col-span-2 lg:col-span-2"; // Featured
      return ""; // Regular
    }
    return "";
  };

  const getStaggeredClasses = (index: number) => {
    if (variant === "staggered") {
      const delays = ["delay-0", "delay-100", "delay-200", "delay-300"];
      return `animate-fade-in-up ${delays[index % delays.length]}`;
    }
    return "";
  };

  const renderHeader = () => {
    if (!showHeader) return null;

    return (
      <div className={cn(styles.header, headerClassName)}>
        {subtitle && (
          <div className="flex items-center justify-center gap-2">
            <Badge variant="secondary" className={sizes.subtitle}>
              {subtitle}
            </Badge>
          </div>
        )}

        <h2 className={sizes.title}>{title}</h2>

        {description && (
          <p className={cn("max-w-3xl mx-auto", sizes.description)}>
            {description}
          </p>
        )}
      </div>
    );
  };

  const renderFeatures = () => {
    const gridClasses = cn(
      styles.grid,
      variant !== "carousel" && layoutStyles[layout],
      spacingStyles[spacing],
    );

    return (
      <div className={cn(gridClasses, contentClassName)}>
        {features.map((feature, index) => (
          <div
            key={feature.id || index}
            className={cn(
              getMixedLayoutClasses(index),
              getStaggeredClasses(index),
            )}
          >
            <FeatureCard
              title={feature.title}
              description={feature.description}
              image={feature.image}
              icon={feature.icon}
              badge={feature.badge}
              features={feature.features}
              buttonText={feature.buttonText}
              onButtonClick={feature.onButtonClick}
              variant={
                layout === "mixed" && index === 0 ? "featured" : "default"
              }
              size={size}
              highlight={feature.highlight}
              className={styles.card}
              onClick={
                feature.buttonHref
                  ? () => window.open(feature.buttonHref, "_self")
                  : undefined
              }
            />
          </div>
        ))}
      </div>
    );
  };

  const renderCTA = () => {
    if (!showCTA) return null;

    return (
      <div className="text-center mt-12">
        <Button
          size="lg"
          variant={background === "primary" ? "secondary" : "default"}
          onClick={onCTAClick}
          asChild={!!ctaHref}
        >
          {ctaHref ? (
            <a href={ctaHref}>
              {ctaText}
              <ArrowRight className="w-4 h-4 ml-2" />
            </a>
          ) : (
            <>
              {ctaText}
              <ArrowRight className="w-4 h-4 ml-2" />
            </>
          )}
        </Button>
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
        <div className={styles.container}>
          {renderHeader()}
          {renderFeatures()}
          {renderCTA()}
        </div>
      </div>
    </section>
  );
}
