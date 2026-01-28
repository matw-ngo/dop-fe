"use client";

import { AnimatePresence, motion, type Variants } from "framer-motion";
import type React from "react";
import {
  getResponsivePadding,
  getResponsiveWidth,
} from "@/components/renderer/constants/responsive-classnames";
import { cn } from "@/lib/utils";
import type { AnimationVariant, ResponsiveValue } from "./types/ui-theme";

interface AnimatedStepContainerProps {
  /** Step content to render */
  children: React.ReactNode;

  /** Whether this step is currently active */
  isActive: boolean;

  /** Animation configuration for the step */
  animation?: AnimationVariant;

  /** Responsive configuration for the container */
  responsive?: {
    container?: ResponsiveValue<string>;
    fields?: ResponsiveValue<string>;
  };

  /** Custom className */
  className?: string;

  /** Custom inline styles */
  style?: React.CSSProperties;

  /** Unique identifier for the step */
  stepId: string;

  /** Direction of navigation (for animation) */
  direction?: "forward" | "backward";
}

/**
 * Default animation variants for step transitions
 */
const defaultVariants = {
  fade: {
    enter: { opacity: 0 },
    center: { opacity: 1 },
    exit: { opacity: 0 },
  },
  slide: {
    enter: { x: 300, opacity: 0 },
    center: { x: 0, opacity: 1 },
    exit: { x: -300, opacity: 0 },
  },
  scale: {
    enter: { scale: 0.95, opacity: 0 },
    center: { scale: 1, opacity: 1 },
    exit: { scale: 1.05, opacity: 0 },
  },
};

/**
 * Helper function to get animation direction based on navigation
 */
function getAnimationVariant(
  type: AnimationVariant["type"] = "fade",
  direction: AnimationVariant["direction"] = "up",
) {
  switch (type) {
    case "slide":
      switch (direction) {
        case "left":
          return {
            enter: { x: 300, opacity: 0 },
            center: { x: 0, opacity: 1 },
            exit: { x: -300, opacity: 0 },
          };
        case "right":
          return {
            enter: { x: -300, opacity: 0 },
            center: { x: 0, opacity: 1 },
            exit: { x: 300, opacity: 0 },
          };
        case "down":
          return {
            enter: { y: -50, opacity: 0 },
            center: { y: 0, opacity: 1 },
            exit: { y: 50, opacity: 0 },
          };
        default:
          return {
            enter: { y: 50, opacity: 0 },
            center: { y: 0, opacity: 1 },
            exit: { y: -50, opacity: 0 },
          };
      }

    case "scale":
      return defaultVariants.scale;

    case "bounce":
      return {
        enter: { scale: 0.8, opacity: 0 },
        center: {
          scale: 1,
          opacity: 1,
          transition: {
            type: "spring" as const,
            stiffness: 400,
            damping: 10,
          },
        },
        exit: { scale: 0.8, opacity: 0 },
      };

    case "flip":
      return {
        enter: { rotateY: 90, opacity: 0 },
        center: { rotateY: 0, opacity: 1 },
        exit: { rotateY: -90, opacity: 0 },
      };
    default:
      return defaultVariants.fade;
  }
}

/**
 * Get animation duration in seconds
 */
function getAnimationDuration(duration?: number): number {
  if (!duration) return 0.3;
  return duration / 1000; // Convert ms to seconds
}

/**
 * Get easing function
 */
function getEasing(easing?: string): string {
  switch (easing) {
    case "in":
      return "ease-in";
    case "out":
      return "ease-out";
    case "in-out":
      return "ease-in-out";
    case "bounce-in":
      return "cubic-bezier(0.68, -0.55, 0.265, 1.55)";
    case "smooth":
      return "cubic-bezier(0.25, 0.1, 0.25, 1)";
    default:
      return "ease-in-out";
  }
}

export const AnimatedStepContainer: React.FC<AnimatedStepContainerProps> = ({
  children,
  isActive,
  animation,
  responsive,
  className,
  style,
  stepId,
  direction = "forward",
}) => {
  // Simplified state management - no need for isVisible
  // Just use isActive directly

  // Build responsive classes
  const containerClasses = cn(
    // Container responsive styles
    responsive?.container && getResponsiveWidth(responsive.container),
    responsive?.container && getResponsivePadding(responsive.container),
    className,
  );

  // If not active and no animation, return null
  if (!isActive) {
    return null;
  }

  // If no animation is specified, just render the container
  if (!animation) {
    return (
      <div className={containerClasses} style={style}>
        {children}
      </div>
    );
  }

  // Get animation configuration
  const variants = getAnimationVariant(animation.type, animation.direction);
  const duration = getAnimationDuration(animation.duration);
  const easing = getEasing(animation.easing);
  const delay = (animation.delay || 0) / 1000; // Convert ms to seconds

  return (
    <AnimatePresence mode="wait">
      {isActive && (
        <motion.div
          key={stepId}
          className={containerClasses}
          style={style}
          initial={false}
          animate="center"
          exit="exit"
          variants={variants as Variants}
          transition={{
            duration,
            delay,
            ease: easing as any,
          }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AnimatedStepContainer;
