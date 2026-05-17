/**
 * Reusable Animation Variants
 *
 * Common animation patterns using Framer Motion's Variants API
 * Provides consistent motion language across components
 *
 * @see https://www.framer.com/motion/animation/#variants
 */

import { Variants } from "framer-motion";
import { springs, easings, durations, staggerDelays } from "./animations";

/**
 * Fade + Slide Up Animation
 *
 * Most common reveal pattern - content fades in while sliding up
 */
export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 60 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: durations.normal,
      ease: easings.apple,
    },
  },
};

/**
 * Scale In Animation
 *
 * Elements scale up from smaller size - good for cards, modals
 */
export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: durations.normal,
      ease: easings.outCubic,
    },
  },
};

/**
 * Blur Reveal Animation
 *
 * Content fades in from blur - modern, polished effect
 */
export const blurReveal: Variants = {
  hidden: { opacity: 0, filter: "blur(10px)", y: 50 },
  visible: {
    opacity: 1,
    filter: "blur(0px)",
    y: 0,
    transition: {
      duration: durations.slow,
      ease: easings.apple,
    },
  },
};

/**
 * Fade In Only
 *
 * Simple opacity fade - no movement
 */
export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: durations.normal,
      ease: easings.easeOut,
    },
  },
};

/**
 * Slide From Left
 *
 * Content enters from left side
 */
export const slideInLeft: Variants = {
  hidden: { opacity: 0, x: -60 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: durations.normal,
      ease: easings.apple,
    },
  },
};

/**
 * Slide From Right
 *
 * Content enters from right side
 */
export const slideInRight: Variants = {
  hidden: { opacity: 0, x: 60 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: durations.normal,
      ease: easings.apple,
    },
  },
};

/**
 * Stagger Container
 *
 * Wraps children to animate them in sequence
 *
 * Usage:
 * ```tsx
 * <motion.div variants={staggerContainer} initial="hidden" animate="visible">
 *   <motion.p variants={fadeInUp}>First</motion.p>
 *   <motion.p variants={fadeInUp}>Second</motion.p>
 * </motion.div>
 * ```
 */
export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: staggerDelays.normal,
      delayChildren: 0.2,
    },
  },
};

/**
 * Fast Stagger Container
 *
 * Quick cascade for UI elements
 */
export const staggerContainerFast: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: staggerDelays.fast,
      delayChildren: 0,
    },
  },
};

/**
 * Perspective 3D Reveal
 *
 * 3D rotation with fade - dramatic entrance
 */
export const perspectiveReveal: Variants = {
  hidden: {
    opacity: 0,
    rotateX: 20,
    scale: 0.9,
    y: 60,
  },
  visible: {
    opacity: 1,
    rotateX: 0,
    scale: 1,
    y: 0,
    transition: {
      duration: durations.normal,
      ease: easings.outCubic,
    },
  },
};

/**
 * Scale On Hover
 *
 * Hover effect for interactive elements
 */
export const scaleHover: Variants = {
  rest: { scale: 1 },
  hover: {
    scale: 1.05,
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 17,
    },
  },
};

/**
 * Glow On Hover
 *
 * Shadow/glow effect on hover
 */
export const glowHover: Variants = {
  rest: {
    boxShadow: "0 0 0 rgba(0, 0, 0, 0)",
  },
  hover: {
    boxShadow: "0 0 20px rgba(99, 102, 241, 0.3)",
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 20,
    },
  },
};

/**
 * Character Reveal
 *
 * For animating text character by character
 */
export const characterReveal: Variants = {
  hidden: {
    opacity: 0,
    y: 20,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      damping: 12,
      stiffness: 200,
    },
  },
};

/**
 * Page Transition Variants
 *
 * For route/page transitions
 */
export const pageTransition: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

/**
 * Modal Animation
 *
 * For modal/dialog enter/exit
 */
export const modalAnimation: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.95,
    y: 20,
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: "spring",
      damping: 25,
      stiffness: 300,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: 20,
    transition: {
      duration: durations.fast,
    },
  },
};

/**
 * Link Arrow Animation
 *
 * For hover effects on links with arrows
 */
export const linkArrow: Variants = {
  rest: { x: 0 },
  hover: {
    x: 5,
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 10,
    },
  },
};

/**
 * Vertical Accordion/Expand
 *
 * For expandable content sections
 */
export const expandVertical: Variants = {
  collapsed: {
    height: 0,
    opacity: 0,
    overflow: "hidden",
  },
  expanded: {
    height: "auto",
    opacity: 1,
    transition: {
      height: {
        type: "spring",
        stiffness: 300,
        damping: 30,
      },
      opacity: {
        duration: durations.fast,
      },
    },
  },
};

/**
 * Rotate 3D Card
 *
 * For 3D card flip effects
 */
export const rotate3DCard: Variants = {
  front: {
    rotateY: 0,
  },
  back: {
    rotateY: 180,
  },
};

/**
 * Shimmer Effect
 *
 * For loading skeleton or gradient shimmer
 */
export const shimmerEffect: Variants = {
  rest: { x: "-100%" },
  animate: {
    x: "100%",
    transition: {
      duration: durations.slow,
      ease: easings.easeInOut,
      repeat: Infinity,
      repeatDelay: 1,
    },
  },
};

/**
 * Pulse Glow
 *
 * Subtle pulsing glow effect
 */
export const pulseGlow: Variants = {
  pulse: {
    opacity: [0.5, 1, 0.5],
    transition: {
      duration: durations.verySlow,
      ease: "easeInOut",
      repeat: Infinity,
    },
  },
};

/**
 * Utility: Create custom stagger
 *
 * Allows custom stagger timing
 */
export function createStagger(
  staggerDelay: number = staggerDelays.normal,
  delayChildren: number = 0
): Variants {
  return {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: staggerDelay,
        delayChildren,
      },
    },
  };
}

/**
 * Utility: Create spring-based variant
 *
 * Allows custom spring physics
 */
export function createSpringVariant(
  from: any,
  to: any,
  springConfig: keyof typeof springs = "smooth"
): Variants {
  return {
    hidden: from,
    visible: {
      ...to,
      transition: {
        type: "spring",
        ...springs[springConfig],
      },
    },
  };
}
