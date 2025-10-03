"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

export interface BenefitItemProps {
  icon: LucideIcon | React.ReactNode;
  title: string;
  description?: string;
  variant?: "default" | "compact" | "highlight" | "minimal";
  size?: "sm" | "md" | "lg";
  iconPosition?: "left" | "top" | "right";
  className?: string;
  iconClassName?: string;
  titleClassName?: string;
  descriptionClassName?: string;
  onClick?: () => void;
  disabled?: boolean;
  badge?: string;
  highlight?: boolean;
}

export function BenefitItem({
  icon,
  title,
  description,
  variant = "default",
  size = "md",
  iconPosition = "left",
  className,
  iconClassName,
  titleClassName,
  descriptionClassName,
  onClick,
  disabled = false,
  badge,
  highlight = false,
}: BenefitItemProps) {
  const isClickable = !!onClick;
  const Component = isClickable ? "button" : "div";

  const variantStyles = {
    default: {
      container:
        "flex gap-3 p-4 rounded-lg border bg-card text-card-foreground transition-colors",
      icon: "text-primary shrink-0",
      title: "font-semibold text-foreground",
      description: "text-muted-foreground mt-1",
    },
    compact: {
      container: "flex gap-2 p-2 rounded transition-colors",
      icon: "text-primary shrink-0",
      title: "font-medium text-foreground",
      description: "text-muted-foreground text-sm mt-0.5",
    },
    highlight: {
      container:
        "flex gap-3 p-4 rounded-lg border-2 border-primary bg-primary/5 text-foreground transition-colors",
      icon: "text-primary shrink-0",
      title: "font-bold text-foreground",
      description: "text-muted-foreground mt-1",
    },
    minimal: {
      container: "flex gap-2 transition-colors",
      icon: "text-primary shrink-0",
      title: "font-medium text-foreground",
      description: "text-muted-foreground text-sm",
    },
  };

  const sizeStyles = {
    sm: {
      container: "",
      icon: "w-4 h-4",
      title: "text-sm",
      description: "text-xs",
    },
    md: {
      container: "",
      icon: "w-5 h-5",
      title: "text-base",
      description: "text-sm",
    },
    lg: {
      container: "",
      icon: "w-6 h-6",
      title: "text-lg",
      description: "text-base",
    },
  };

  const positionStyles = {
    left: "flex-row items-start",
    top: "flex-col items-center text-center",
    right: "flex-row-reverse items-start text-right",
  };

  const styles = variantStyles[variant];
  const sizes = sizeStyles[size];

  const renderIcon = () => {
    if (React.isValidElement(icon)) {
      return React.cloneElement(icon as React.ReactElement, {
        className: cn(styles.icon, sizes.icon, iconClassName),
      });
    }

    if (typeof icon === "function") {
      const IconComponent = icon as LucideIcon;
      return (
        <IconComponent className={cn(styles.icon, sizes.icon, iconClassName)} />
      );
    }

    return icon;
  };

  return (
    <Component
      className={cn(
        styles.container,
        sizes.container,
        positionStyles[iconPosition],
        highlight && "ring-2 ring-primary ring-offset-2",
        isClickable && [
          "cursor-pointer hover:bg-accent hover:text-accent-foreground",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        ],
        disabled && "opacity-50 cursor-not-allowed",
        className,
      )}
      onClick={!disabled ? onClick : undefined}
      disabled={disabled}
      role={isClickable ? "button" : undefined}
      tabIndex={isClickable && !disabled ? 0 : undefined}
    >
      <div className="relative shrink-0">
        {renderIcon()}
        {badge && (
          <span className="absolute -top-1 -right-1 inline-flex items-center justify-center w-4 h-4 text-xs font-bold text-white bg-red-500 rounded-full">
            {badge}
          </span>
        )}
      </div>

      <div
        className={cn(
          "space-y-1",
          iconPosition === "top" && "mt-2",
          iconPosition === "right" && "text-right",
        )}
      >
        <div className={cn(styles.title, sizes.title, titleClassName)}>
          {title}
        </div>

        {description && (
          <div
            className={cn(
              styles.description,
              sizes.description,
              descriptionClassName,
            )}
          >
            {description}
          </div>
        )}
      </div>
    </Component>
  );
}
