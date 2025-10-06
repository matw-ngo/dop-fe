"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

export interface StatItemProps {
  icon?: LucideIcon | React.ReactNode;
  value: string | number;
  label: string;
  description?: string;
  trend?: {
    value: number;
    isPositive: boolean;
    label?: string;
  };
  variant?: "default" | "card" | "minimal" | "highlight";
  size?: "sm" | "md" | "lg" | "xl";
  iconPosition?: "left" | "top" | "right";
  className?: string;
  iconClassName?: string;
  valueClassName?: string;
  labelClassName?: string;
  formatValue?: (value: string | number) => string;
  animateOnView?: boolean;
  suffix?: string;
  prefix?: string;
  color?: "default" | "primary" | "success" | "warning" | "destructive";
}

// Number animation hook
function useCountUp(
  end: number,
  duration: number = 2000,
  start: number = 0,
  enabled: boolean = true,
) {
  const [count, setCount] = React.useState(start);
  const [isComplete, setIsComplete] = React.useState(false);

  React.useEffect(() => {
    if (!enabled) {
      setCount(end);
      setIsComplete(true);
      return;
    }

    let startTime: number;
    let animationFrame: number;

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);

      const easeOutCubic = 1 - Math.pow(1 - progress, 3);
      const currentCount = start + (end - start) * easeOutCubic;

      setCount(currentCount);

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      } else {
        setIsComplete(true);
      }
    };

    animationFrame = requestAnimationFrame(animate);

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [end, duration, start, enabled]);

  return { count, isComplete };
}

// Intersection Observer hook for animation trigger
function useInView(threshold: number = 0.1) {
  const [inView, setInView] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold },
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [threshold]);

  return { ref, inView };
}

export function StatItem({
  icon,
  value,
  label,
  description,
  trend,
  variant = "default",
  size = "md",
  iconPosition = "top",
  className,
  iconClassName,
  valueClassName,
  labelClassName,
  formatValue,
  animateOnView = false,
  suffix = "",
  prefix = "",
  color = "default",
}: StatItemProps) {
  const { ref, inView } = useInView();

  // Extract numeric value for animation
  const numericValue = React.useMemo(() => {
    if (typeof value === "number") return value;
    const match = value.toString().match(/[\d,]+/);
    return match ? parseInt(match[0].replace(/,/g, "")) : 0;
  }, [value]);

  const { count } = useCountUp(numericValue, 2000, 0, animateOnView && inView);

  // Format the animated or static value
  const displayValue = React.useMemo(() => {
    if (animateOnView && typeof value === "number") {
      const animatedValue = Math.floor(count);
      return formatValue
        ? formatValue(animatedValue)
        : `${prefix}${animatedValue.toLocaleString()}${suffix}`;
    }
    return formatValue ? formatValue(value) : `${prefix}${value}${suffix}`;
  }, [count, value, formatValue, animateOnView, prefix, suffix]);

  const variantStyles = {
    default: {
      container: "text-center space-y-2",
      icon: "",
      value: "font-bold text-foreground",
      label: "text-muted-foreground",
      description: "text-muted-foreground text-sm",
    },
    card: {
      container:
        "p-6 rounded-lg border bg-card text-card-foreground text-center space-y-3 hover:shadow-md transition-shadow",
      icon: "",
      value: "font-bold text-foreground",
      label: "text-muted-foreground",
      description: "text-muted-foreground text-sm",
    },
    minimal: {
      container: "space-y-1",
      icon: "",
      value: "font-semibold text-foreground",
      label: "text-muted-foreground text-sm",
      description: "text-muted-foreground text-xs",
    },
    highlight: {
      container:
        "p-4 rounded-lg bg-primary/10 border border-primary/20 text-center space-y-2",
      icon: "text-primary",
      value: "font-bold text-primary",
      label: "text-primary/80",
      description: "text-muted-foreground text-sm",
    },
  };

  const sizeStyles = {
    sm: {
      container: "",
      icon: "w-4 h-4",
      value: "text-lg",
      label: "text-xs",
      description: "text-xs",
    },
    md: {
      container: "",
      icon: "w-5 h-5",
      value: "text-2xl",
      label: "text-sm",
      description: "text-sm",
    },
    lg: {
      container: "",
      icon: "w-6 h-6",
      value: "text-3xl",
      label: "text-base",
      description: "text-base",
    },
    xl: {
      container: "",
      icon: "w-8 h-8",
      value: "text-4xl",
      label: "text-lg",
      description: "text-lg",
    },
  };

  const colorStyles = {
    default: "text-foreground",
    primary: "text-primary",
    success: "text-green-600",
    warning: "text-yellow-600",
    destructive: "text-red-600",
  };

  const positionStyles = {
    left: "flex items-center text-left space-y-0 space-x-3",
    top: "flex flex-col items-center text-center",
    right:
      "flex items-center flex-row-reverse text-right space-y-0 space-x-3 space-x-reverse",
  };

  const styles = variantStyles[variant];
  const sizes = sizeStyles[size];

  const renderIcon = () => {
    if (!icon) return null;

    if (React.isValidElement(icon)) {
      return React.cloneElement(icon as React.ReactElement<any>, {
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

  const renderTrend = () => {
    if (!trend) return null;

    const trendColor = trend.isPositive ? "text-green-600" : "text-red-600";
    const trendIcon = trend.isPositive ? "↗" : "↘";

    return (
      <div
        className={cn(
          "flex items-center justify-center gap-1 text-xs",
          trendColor,
        )}
      >
        <span>{trendIcon}</span>
        <span>{trend.value}%</span>
        {trend.label && (
          <span className="text-muted-foreground">({trend.label})</span>
        )}
      </div>
    );
  };

  return (
    <div
      ref={ref}
      className={cn(
        styles.container,
        sizes.container,
        positionStyles[iconPosition],
        className,
      )}
    >
      {/* Icon */}
      {icon && iconPosition === "top" && (
        <div className="flex justify-center">{renderIcon()}</div>
      )}

      {icon && iconPosition === "left" && renderIcon()}

      {/* Content */}
      <div
        className={cn(
          "space-y-1",
          iconPosition === "left" && "flex-1",
          iconPosition === "right" && "flex-1",
        )}
      >
        {/* Value */}
        <div
          className={cn(
            styles.value,
            sizes.value,
            colorStyles[color],
            valueClassName,
          )}
        >
          {displayValue}
        </div>

        {/* Label */}
        <div className={cn(styles.label, sizes.label, labelClassName)}>
          {label}
        </div>

        {/* Trend */}
        {renderTrend()}

        {/* Description */}
        {description && (
          <div className={cn(styles.description, sizes.description)}>
            {description}
          </div>
        )}
      </div>

      {/* Right Icon */}
      {icon && iconPosition === "right" && renderIcon()}
    </div>
  );
}
