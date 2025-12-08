import type { AnimationVariant, ThemeAnimations } from "../types/ui-theme";

// Animation directions
export type AnimationDirection = "up" | "down" | "left" | "right" | "center";

// Animation types
export type AnimationType =
  | "fade"
  | "slide"
  | "scale"
  | "bounce"
  | "flip"
  | "rotate";

// Animation configuration
export interface AnimationConfig {
  type: AnimationType;
  direction?: AnimationDirection;
  duration?: keyof ThemeAnimations["duration"];
  delay?: keyof ThemeAnimations["duration"];
  easing?: keyof ThemeAnimations["easing"];
  spring?: {
    stiffness?: number;
    damping?: number;
    mass?: number;
  };
  repeat?: number | "loop" | "reverse";
  repeatDelay?: number;
  repeatType?: "loop" | "reverse" | "mirror";
}

// Transition configuration
export interface TransitionConfig {
  type: "spring" | "tween" | "keyframes" | "inertia";
  duration?: number | string;
  delay?: number | string;
  ease?: string | number[];
  bounce?: number;
  stiffness?: number;
  damping?: number;
  mass?: number;
  velocity?: number;
  power?: number;
  timeConstant?: number;
  restDelta?: number;
  restSpeed?: number;
  min?: number;
  max?: number;
}

// Stagger configuration for lists
export interface StaggerConfig {
  staggerDirection?: "forward" | "backward" | "center";
  staggerChildren?: number;
  delayChildren?: number;
  when?: "beforeChildren" | "afterChildren";
}

// Animation presets
export const ANIMATION_PRESETS: Record<string, AnimationConfig> = {
  // Fade animations
  "fade-in": {
    type: "fade",
    direction: "center",
    duration: 200,
    easing: "in-out",
  },
  "fade-out": {
    type: "fade",
    direction: "center",
    duration: 200,
    easing: "in-out",
  },
  "fade-in-up": {
    type: "fade",
    direction: "up",
    duration: 300,
    easing: "out",
  },
  "fade-in-down": {
    type: "fade",
    direction: "down",
    duration: 300,
    easing: "out",
  },
  "fade-in-left": {
    type: "fade",
    direction: "left",
    duration: 300,
    easing: "out",
  },
  "fade-in-right": {
    type: "fade",
    direction: "right",
    duration: 300,
    easing: "out",
  },

  // Slide animations
  "slide-up": {
    type: "slide",
    direction: "up",
    duration: 300,
    easing: "out",
  },
  "slide-down": {
    type: "slide",
    direction: "down",
    duration: 300,
    easing: "out",
  },
  "slide-left": {
    type: "slide",
    direction: "left",
    duration: 300,
    easing: "out",
  },
  "slide-right": {
    type: "slide",
    direction: "right",
    duration: 300,
    easing: "out",
  },

  // Scale animations
  "scale-in": {
    type: "scale",
    direction: "center",
    duration: 200,
    easing: "bounce-in",
  },
  "scale-out": {
    type: "scale",
    direction: "center",
    duration: 200,
    easing: "in",
  },
  "scale-up": {
    type: "scale",
    direction: "up",
    duration: 300,
    easing: "out",
  },
  "scale-down": {
    type: "scale",
    direction: "down",
    duration: 300,
    easing: "out",
  },

  // Bounce animations
  "bounce-in": {
    type: "bounce",
    direction: "center",
    duration: 500,
    easing: "bounce-in",
  },
  "bounce-in-up": {
    type: "bounce",
    direction: "up",
    duration: 700,
    easing: "bounce-in",
  },
  "bounce-in-down": {
    type: "bounce",
    direction: "down",
    duration: 700,
    easing: "bounce-in",
  },

  // Flip animations
  "flip-in": {
    type: "flip",
    direction: "center",
    duration: 300,
    easing: "in-out",
  },
  "flip-in-x": {
    type: "flip",
    direction: "left",
    duration: 300,
    easing: "in-out",
  },
  "flip-in-y": {
    type: "flip",
    direction: "down",
    duration: 300,
    easing: "in-out",
  },

  // Rotate animations
  "rotate-in": {
    type: "rotate",
    direction: "center",
    duration: 300,
    easing: "in-out",
  },
  "rotate-in-left": {
    type: "rotate",
    direction: "left",
    duration: 500,
    easing: "out",
  },
  "rotate-in-right": {
    type: "rotate",
    direction: "right",
    duration: 500,
    easing: "out",
  },
} as const;

// Transition presets
export const TRANSITION_PRESETS: Record<string, TransitionConfig> = {
  // Spring transitions
  "spring-gentle": {
    type: "spring",
    stiffness: 300,
    damping: 30,
  },
  "spring-bouncy": {
    type: "spring",
    stiffness: 400,
    damping: 10,
  },
  "spring-stiff": {
    type: "spring",
    stiffness: 600,
    damping: 50,
  },

  // Tween transitions
  default: {
    type: "tween",
    duration: 0.2,
    ease: "easeInOut",
  },
  gentle: {
    type: "tween",
    duration: 0.3,
    ease: [0.25, 0.1, 0.25, 1],
  },
  fast: {
    type: "tween",
    duration: 0.1,
    ease: "easeInOut",
  },
  slow: {
    type: "tween",
    duration: 0.5,
    ease: "easeInOut",
  },

  // Special transitions
  bouncy: {
    type: "spring",
    stiffness: 400,
    damping: 10,
  },
  smooth: {
    type: "tween",
    duration: 0.4,
    ease: [0.25, 0.1, 0.25, 1],
  },
  dramatic: {
    type: "tween",
    duration: 0.6,
    ease: [0.25, 0.46, 0.45, 0.94],
  },
} as const;

// Stagger presets
export const STAGGER_PRESETS: Record<string, StaggerConfig> = {
  "stagger-children": {
    staggerChildren: 0.1,
    delayChildren: 0,
    staggerDirection: "forward",
  },
  "stagger-fast": {
    staggerChildren: 0.05,
    delayChildren: 0,
    staggerDirection: "forward",
  },
  "stagger-slow": {
    staggerChildren: 0.2,
    delayChildren: 0,
    staggerDirection: "forward",
  },
  "stagger-from-center": {
    staggerChildren: 0.1,
    delayChildren: 0,
    staggerDirection: "center",
  },
  "stagger-reverse": {
    staggerChildren: 0.1,
    delayChildren: 0,
    staggerDirection: "backward",
  },
} as const;
