"use client";

import React from "react";
import { motion, AnimatePresence, Variants, Transition } from "framer-motion";
import {
  AnimationConfig,
  TransitionConfig,
  StaggerConfig,
  AnimationType,
  AnimationDirection,
  ANIMATION_PRESETS,
  TRANSITION_PRESETS,
  STAGGER_PRESETS,
} from "./transition-types";

// Animation variant properties interface
export interface AnimationVariants extends Variants {
  hidden: Record<string, any>;
  visible: Record<string, any>;
  exit?: Record<string, any>;
}

// Transition component props
export interface AnimatedProps extends React.HTMLAttributes<HTMLDivElement> {
  as?: React.ElementType;
  children: React.ReactNode;
  animation?: string | AnimationConfig;
  transition?: string | TransitionConfig;
  stagger?: string | StaggerConfig;
  variants?: AnimationVariants;
  initial?: boolean | "hidden";
  animate?: boolean | "visible";
  exit?: boolean | "exit";
  whileHover?: string | AnimationConfig;
  whileTap?: string | AnimationConfig;
  whileFocus?: string | AnimationConfig;
  layout?: boolean;
  layoutId?: string;
}

/**
 * Create animation variants from animation config
 */
export function createVariants(config: AnimationConfig): AnimationVariants {
  const { type, direction = "center", duration, delay, easing } = config;

  // Create hidden state (initial)
  const hidden: Record<string, any> = {};

  // Create visible state
  const visible: Record<string, any> = {};

  // Create exit state (reverse of entrance)
  const exit: Record<string, any> = {};

  // Configure based on animation type
  switch (type) {
    case "fade":
      hidden.opacity = 0;
      visible.opacity = 1;
      if (direction !== "center") {
        applyDirectionOffset(hidden, direction, 20);
        applyDirectionOffset(visible, "center", 0);
      }
      break;

    case "slide":
      hidden.opacity = 0;
      visible.opacity = 1;
      applyDirectionOffset(hidden, direction, 50);
      applyDirectionOffset(visible, "center", 0);
      break;

    case "scale":
      hidden.opacity = 0;
      hidden.scale = 0.8;
      visible.opacity = 1;
      visible.scale = 1;
      break;

    case "bounce":
      hidden.opacity = 0;
      hidden.scale = 0.3;
      visible.opacity = 1;
      visible.scale = 1;
      break;

    case "flip":
      if (direction === "center") {
        hidden.rotateY = -90;
        visible.rotateY = 0;
      } else if (direction === "left" || direction === "right") {
        hidden.rotateY = direction === "left" ? -90 : 90;
        visible.rotateY = 0;
      } else {
        hidden.rotateX = direction === "up" ? -90 : 90;
        visible.rotateX = 0;
      }
      break;

    case "rotate":
      hidden.opacity = 0;
      hidden.rotate =
        direction === "left" ? -180 : direction === "right" ? 180 : 0;
      visible.opacity = 1;
      visible.rotate = 0;
      break;
  }

  // Exit state is typically the reverse of hidden
  Object.assign(exit, hidden);

  // Add transition configuration
  const transitionConfig = createTransition(config);

  return {
    hidden,
    visible,
    exit,
    transition: transitionConfig,
  };
}

/**
 * Apply directional offset for slide animations
 */
function applyDirectionOffset(
  state: Record<string, any>,
  direction: AnimationDirection,
  offset: number,
) {
  switch (direction) {
    case "up":
      state.y = offset;
      break;
    case "down":
      state.y = -offset;
      break;
    case "left":
      state.x = offset;
      break;
    case "right":
      state.x = -offset;
      break;
    case "center":
    default:
      state.x = 0;
      state.y = 0;
      break;
  }
}

/**
 * Create transition configuration from animation config
 */
export function createTransition(config?: AnimationConfig): Transition {
  if (!config) return TRANSITION_PRESETS.default as Transition;

  const { duration, delay, easing, spring } = config;

  // Handle spring animations
  if (config.type === "bounce" || config.type === "scale") {
    return {
      type: "spring",
      stiffness: spring?.stiffness || 400,
      damping: spring?.damping || 30,
      mass: spring?.mass || 1,
      duration: duration ? parseFloat(duration) / 1000 : undefined,
      delay: delay ? parseFloat(delay) / 1000 : undefined,
    } as Transition;
  }

  // Handle regular transitions
  return {
    type: "tween",
    duration: duration ? parseFloat(duration) / 1000 : 0.2,
    delay: delay ? parseFloat(delay) / 1000 : 0,
    ease: easing ? getEasingFunction(easing) : [0.25, 0.1, 0.25, 1],
  } as Transition;
}

/**
 * Get easing function from easing key
 */
function getEasingFunction(easing: string): string | number[] {
  const easingMap: Record<string, string | number[]> = {
    linear: "linear",
    in: "easeIn",
    out: "easeOut",
    "in-out": "easeInOut",
    "bounce-in": [0.68, -0.55, 0.265, 1.55],
    smooth: [0.25, 0.1, 0.25, 1],
  };

  return easingMap[easing] || easing;
}

/**
 * Get animation config from preset or custom config
 */
function getAnimationConfig(
  animation?: string | AnimationConfig,
): AnimationConfig | undefined {
  if (!animation) return undefined;

  if (typeof animation === "string") {
    return ANIMATION_PRESETS[animation];
  }

  return animation;
}

/**
 * Get transition config from preset or custom config
 */
function getTransitionConfig(
  transition?: string | TransitionConfig,
): Transition | undefined {
  if (!transition) return undefined;

  if (typeof transition === "string") {
    return TRANSITION_PRESETS[transition] as Transition;
  }

  return transition as Transition;
}

/**
 * Get stagger config from preset or custom config
 */
function getStaggerConfig(
  stagger?: string | StaggerConfig,
): StaggerConfig | undefined {
  if (!stagger) return undefined;

  if (typeof stagger === "string") {
    return STAGGER_PRESETS[stagger];
  }

  return stagger;
}

/**
 * Animated container component
 */
export const Animated: React.FC<AnimatedProps> = ({
  as: Component = "div",
  children,
  animation,
  transition,
  stagger,
  variants,
  initial = "hidden",
  animate = "visible",
  exit = "exit",
  whileHover,
  whileTap,
  whileFocus,
  layout = false,
  layoutId,
  ...props
}) => {
  // Get animation configuration
  const animationConfig = getAnimationConfig(animation);
  const animationVariants =
    variants || (animationConfig ? createVariants(animationConfig) : undefined);
  const transitionConfig = getTransitionConfig(transition);
  const staggerConfig = getStaggerConfig(stagger);

  // Handle hover, tap, and focus animations
  const hoverVariants = whileHover
    ? createVariants(getAnimationConfig(whileHover)!)
    : undefined;
  const tapVariants = whileTap
    ? createVariants(getAnimationConfig(whileTap)!)
    : undefined;
  const focusVariants = whileFocus
    ? createVariants(getAnimationConfig(whileFocus)!)
    : undefined;

  return (
    <motion.div
      as={Component}
      variants={animationVariants}
      initial={initial}
      animate={animate}
      exit={exit}
      transition={transitionConfig}
      whileHover={hoverVariants?.visible}
      whileTap={tapVariants?.visible}
      whileFocus={focusVariants?.visible}
      layout={layout}
      layoutId={layoutId}
      {...(staggerConfig && {
        initial: "hidden",
        animate: "visible",
        exit: "hidden",
        variants: {
          hidden: { opacity: 0 },
          visible: {
            opacity: 1,
            transition: {
              staggerChildren: staggerConfig.staggerChildren,
              delayChildren: staggerConfig.delayChildren,
              staggerDirection:
                staggerConfig.staggerDirection === "backward" ? -1 : 1,
            },
          },
        },
      })}
      {...props}
    >
      {children}
    </motion.div>
  );
};

/**
 * AnimatePresence wrapper for enter/exit animations
 */
export interface AnimatedPresenceProps {
  children: React.ReactNode;
  initial?: boolean;
  mode?: "sync" | "wait" | "popLayout";
  onExitComplete?: () => void;
}

export const AnimatedPresence: React.FC<AnimatedPresenceProps> = ({
  children,
  initial = true,
  mode = "sync",
  onExitComplete,
}) => {
  return (
    <AnimatePresence
      initial={initial}
      mode={mode}
      onExitComplete={onExitComplete}
    >
      {children}
    </AnimatePresence>
  );
};

/**
 * List item animation with stagger
 */
export interface AnimatedListItemProps extends Omit<AnimatedProps, "stagger"> {
  index: number;
  total: number;
}

export const AnimatedListItem: React.FC<AnimatedListItemProps> = ({
  children,
  index,
  total,
  animation = "fade-in-up",
  transition = "default",
  ...props
}) => {
  return (
    <Animated
      animation={animation}
      transition={{
        ...getTransitionConfig(transition),
        delay: index * 0.05, // Stagger delay based on index
      }}
      {...props}
    >
      {children}
    </Animated>
  );
};

/**
 * Preset animation components
 */
export const FadeIn = ({
  children,
  ...props
}: Omit<AnimatedProps, "animation">) => (
  <Animated animation="fade-in" {...props}>
    {children}
  </Animated>
);

export const SlideUp = ({
  children,
  ...props
}: Omit<AnimatedProps, "animation">) => (
  <Animated animation="slide-up" {...props}>
    {children}
  </Animated>
);

export const ScaleIn = ({
  children,
  ...props
}: Omit<AnimatedProps, "animation">) => (
  <Animated animation="scale-in" {...props}>
    {children}
  </Animated>
);

export const BounceIn = ({
  children,
  ...props
}: Omit<AnimatedProps, "animation">) => (
  <Animated animation="bounce-in" {...props}>
    {children}
  </Animated>
);

export default Animated;
