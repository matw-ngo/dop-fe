"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LucideIcon } from "lucide-react";
import Image from "next/image";

export interface FeatureCardProps {
  image?: string | React.ReactNode;
  icon?: LucideIcon | React.ReactNode;
  title: string;
  description: string;
  badge?: string;
  buttonText?: string;
  buttonVariant?: "default" | "outline" | "ghost" | "link";
  onButtonClick?: () => void;
  variant?: "default" | "horizontal" | "compact" | "image-top" | "icon-only";
  size?: "sm" | "md" | "lg";
  className?: string;
  imageClassName?: string;
  contentClassName?: string;
  hover?: boolean;
  clickable?: boolean;
  onClick?: () => void;
  features?: string[];
  highlight?: boolean;
  imageAspectRatio?: "square" | "video" | "portrait";
}

export function FeatureCard({
  image,
  icon,
  title,
  description,
  badge,
  buttonText,
  buttonVariant = "outline",
  onButtonClick,
  variant = "default",
  size = "md",
  className,
  imageClassName,
  contentClassName,
  hover = true,
  clickable = false,
  onClick,
  features = [],
  highlight = false,
  imageAspectRatio = "video",
}: FeatureCardProps) {
  const isClickable = clickable || !!onClick;
  const Component = isClickable ? "button" : "div";

  const variantStyles = {
    default: {
      container: "h-full",
      layout: "flex flex-col",
      imageContainer: "relative overflow-hidden rounded-t-lg",
      content: "flex-1 flex flex-col justify-between",
    },
    horizontal: {
      container: "h-full",
      layout: "flex flex-row",
      imageContainer:
        "relative overflow-hidden rounded-l-lg w-1/3 flex-shrink-0",
      content: "flex-1 flex flex-col justify-between p-4",
    },
    compact: {
      container: "h-full",
      layout: "flex flex-col",
      imageContainer: "relative overflow-hidden rounded-t-lg",
      content: "flex-1 p-3",
    },
    "image-top": {
      container: "h-full",
      layout: "flex flex-col",
      imageContainer: "relative overflow-hidden rounded-t-lg mb-4",
      content: "flex-1 text-center",
    },
    "icon-only": {
      container: "h-full",
      layout: "flex flex-col text-center",
      imageContainer: "flex justify-center mb-4",
      content: "flex-1",
    },
  };

  const sizeStyles = {
    sm: {
      container: "max-w-sm",
      image: "h-32",
      icon: "w-8 h-8",
      title: "text-base font-semibold",
      description: "text-sm",
      button: "text-xs px-3 py-1.5",
    },
    md: {
      container: "max-w-md",
      image: "h-48",
      icon: "w-12 h-12",
      title: "text-lg font-semibold",
      description: "text-sm",
      button: "text-sm px-4 py-2",
    },
    lg: {
      container: "max-w-lg",
      image: "h-64",
      icon: "w-16 h-16",
      title: "text-xl font-bold",
      description: "text-base",
      button: "text-base px-6 py-3",
    },
  };

  const aspectRatioStyles = {
    square: "aspect-square",
    video: "aspect-video",
    portrait: "aspect-[3/4]",
  };

  const styles = variantStyles[variant];
  const sizes = sizeStyles[size];

  const renderImage = () => {
    if (!image && !icon) return null;

    if (variant === "icon-only" && icon) {
      if (React.isValidElement(icon)) {
        return React.cloneElement(icon as React.ReactElement<any>, {
          className: cn(sizes.icon, "text-primary"),
        });
      }

      if (typeof icon === "function") {
        const IconComponent = icon as LucideIcon;
        return <IconComponent className={cn(sizes.icon, "text-primary")} />;
      }

      return icon;
    }

    if (image) {
      if (typeof image === "string") {
        return (
          <div
            className={cn(
              styles.imageContainer,
              sizes.image,
              aspectRatioStyles[imageAspectRatio],
              imageClassName,
            )}
          >
            <Image
              src={image}
              alt={title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
            {badge && <Badge className="absolute top-2 right-2">{badge}</Badge>}
          </div>
        );
      } else {
        return (
          <div
            className={cn(
              styles.imageContainer,
              sizes.image,
              aspectRatioStyles[imageAspectRatio],
              imageClassName,
            )}
          >
            {image}
            {badge && <Badge className="absolute top-2 right-2">{badge}</Badge>}
          </div>
        );
      }
    }

    return null;
  };

  const renderIcon = () => {
    if (!icon || variant === "icon-only") return null;

    if (React.isValidElement(icon)) {
      return React.cloneElement(icon as React.ReactElement<any>, {
        className: cn(sizes.icon, "text-primary mb-3"),
      });
    }

    if (typeof icon === "function") {
      const IconComponent = icon as LucideIcon;
      return <IconComponent className={cn(sizes.icon, "text-primary mb-3")} />;
    }

    return icon;
  };

  const cardContent = (
    <>
      {variant !== "icon-only" && renderImage()}

      <CardContent
        className={cn(
          styles.content,
          variant === "horizontal" && "border-0 p-0",
          contentClassName,
        )}
      >
        {variant === "icon-only" && (
          <div className={styles.imageContainer}>{renderIcon()}</div>
        )}

        {variant !== "icon-only" && icon && (
          <div className="flex justify-center mb-3">{renderIcon()}</div>
        )}

        <div className="space-y-3">
          <div>
            <CardTitle className={cn(sizes.title, "mb-2")}>
              {title}
              {badge && variant === "icon-only" && (
                <Badge className="ml-2" variant="secondary">
                  {badge}
                </Badge>
              )}
            </CardTitle>
            <CardDescription className={sizes.description}>
              {description}
            </CardDescription>
          </div>

          {features.length > 0 && (
            <ul className="space-y-1">
              {features.map((feature, index) => (
                <li
                  key={index}
                  className="flex items-center text-sm text-muted-foreground"
                >
                  <span className="mr-2 text-primary">✓</span>
                  {feature}
                </li>
              ))}
            </ul>
          )}

          {buttonText && (
            <Button
              variant={buttonVariant}
              className={cn("w-full", sizes.button)}
              onClick={onButtonClick}
            >
              {buttonText}
            </Button>
          )}
        </div>
      </CardContent>
    </>
  );

  if (isClickable) {
    return (
      <Component
        className={cn(
          "group text-left",
          styles.container,
          sizes.container,
          className,
        )}
        onClick={onClick}
      >
        <Card
          className={cn(
            styles.layout,
            hover &&
              "transition-all duration-200 hover:shadow-lg hover:-translate-y-1",
            highlight && "ring-2 ring-primary ring-offset-2",
            isClickable && "cursor-pointer",
            "h-full",
          )}
        >
          {cardContent}
        </Card>
      </Component>
    );
  }

  return (
    <div className={cn("group", styles.container, sizes.container, className)}>
      <Card
        className={cn(
          styles.layout,
          hover &&
            "transition-all duration-200 hover:shadow-lg hover:-translate-y-1",
          highlight && "ring-2 ring-primary ring-offset-2",
          "h-full",
        )}
      >
        {cardContent}
      </Card>
    </div>
  );
}
