import { MotionConfig, motion } from "framer-motion";
import React from "react";

/**
 * Framer Motion global configuration
 * Sets up default animation behaviors for the entire application
 */
export const framerConfig: React.ComponentProps<typeof MotionConfig> = {
  // Reduce motion for users who prefer it
  reducedMotion: "user",

  // Default transition settings
  transition: {
    type: "tween",
    duration: 0.2,
    ease: [0.25, 0.1, 0.25, 1],
  },

  // Set up performance optimizations
  transformPageCoords: true,
};

/**
 * Component to wrap the application with Framer Motion configuration
 */
export function FramerProvider({ children }: { children: React.ReactNode }) {
  return <MotionConfig {...framerConfig}>{children}</MotionConfig>;
}

/**
 * Common animation presets for components
 */
export const commonAnimations = {
  // Button hover animations
  button: {
    whileHover: { scale: 1.02 },
    whileTap: { scale: 0.98 },
    transition: { type: "spring", stiffness: 400, damping: 17 },
  },

  // Card hover animations
  card: {
    whileHover: { y: -2, boxShadow: "0 10px 20px rgba(0,0,0,0.1)" },
    transition: { type: "spring", stiffness: 300, damping: 20 },
  },

  // Input focus animations
  input: {
    whileFocus: { scale: 1.01 },
    transition: { type: "spring", stiffness: 500, damping: 30 },
  },

  // Modal animations
  modal: {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.95 },
    transition: { type: "spring", stiffness: 300, damping: 30 },
  },

  // Drawer animations
  drawer: {
    initial: { x: "100%" },
    animate: { x: 0 },
    exit: { x: "100%" },
    transition: { type: "spring", stiffness: 300, damping: 30 },
  },

  // Tooltip animations
  tooltip: {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.95 },
    transition: { duration: 0.15 },
  },

  // List item animations
  listItem: {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 20 },
    transition: { duration: 0.2 },
  },
} as const;

/**
 * Higher-order component to add animations to any component
 */
export function withAnimation<P extends object>(
  Component: React.ComponentType<P>,
  animationConfig: Partial<typeof commonAnimations> = {},
) {
  return React.forwardRef<any, P>((props, ref) => {
    const animConfig = { ...commonAnimations.button, ...animationConfig };

    return (
      <motion.div ref={ref} {...animConfig}>
        <Component {...(props as P)} />
      </motion.div>
    );
  });
}

/**
 * Create a stagger animation for lists
 */
export function createStaggerAnimation(delay: number = 0.1) {
  return {
    initial: { opacity: 0 },
    animate: {
      opacity: 1,
      transition: {
        staggerChildren: delay,
      },
    },
    exit: {
      opacity: 0,
      transition: {
        staggerChildren: delay,
        staggerDirection: -1,
      },
    },
  };
}

/**
 * Animated list container component
 */
export function AnimatedList({
  children,
  delay = 0.1,
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      variants={createStaggerAnimation(delay)}
      initial="hidden"
      animate="visible"
      exit="hidden"
    >
      {React.Children.map(children, (child, index) => (
        <motion.div
          key={index}
          variants={commonAnimations.listItem}
          style={{ originY: 0 }}
        >
          {child}
        </motion.div>
      ))}
    </motion.div>
  );
}

/**
 * Page transition animation
 */
export const pageTransition = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  transition: {
    type: "spring",
    stiffness: 300,
    damping: 30,
    duration: 0.3,
  },
};

/**
 * Layout animation for changing layouts
 */
export const layoutAnimation = {
  layout: true,
  layoutId: undefined,
  transition: {
    type: "spring",
    stiffness: 350,
    damping: 30,
  },
};

/**
 * Quick presets for common use cases
 */
export const quickPresets = {
  // Simple fade
  fade: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  },

  // Quick slide
  slide: {
    initial: { x: -10, opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: 10, opacity: 0 },
  },

  // Quick scale
  scale: {
    initial: { scale: 0.95, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    exit: { scale: 0.95, opacity: 0 },
  },

  // Quick bounce
  bounce: {
    initial: { scale: 0.9, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    exit: { scale: 0.9, opacity: 0 },
    transition: { type: "spring", stiffness: 400, damping: 10 },
  },
} as const;

/**
 * Hook to get animation props based on user preferences
 */
export function useAnimatedProps(userPrefersReduced = false) {
  const shouldReduceMotion =
    userPrefersReduced ||
    (typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches);

  return {
    // Disable animations for users who prefer reduced motion
    initial: shouldReduceMotion ? "visible" : "hidden",
    animate: "visible",
    transition: shouldReduceMotion ? { duration: 0 } : undefined,
    whileHover: shouldReduceMotion ? undefined : { scale: 1.02 },
    whileTap: shouldReduceMotion ? undefined : { scale: 0.98 },
  };
}
