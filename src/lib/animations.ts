/**
 * Animation Configuration System
 *
 * Centralized animation timing, easing, and spring settings
 * Following Remotion's best practices for consistent, professional motion design
 *
 * @see https://www.remotion.dev/docs/timing
 */

/**
 * Spring Physics Configurations
 *
 * Springs create more natural, organic motion than fixed-duration tweens.
 * Based on Remotion's proven spring configurations.
 *
 * Damping: Controls how bouncy the spring is (higher = less bounce)
 * Stiffness: Controls how quickly the spring reaches its destination (higher = faster)
 * Mass: Controls the "weight" being animated (higher = slower/heavier)
 *
 * @see https://www.remotion.dev/docs/spring
 */
export const springs = {
  /**
   * Smooth, no bounce - perfect for subtle reveals and transitions
   * Use for: Fade-ins, subtle slides, content reveals
   */
  smooth: { damping: 200 } as const,

  /**
   * Snappy UI feel - quick with minimal overshoot
   * Use for: Buttons, cards, UI elements that need to feel responsive
   */
  snappy: { damping: 20, stiffness: 200 } as const,

  /**
   * Playful entrance - noticeable bounce for attention-grabbing
   * Use for: Hero elements, call-to-action buttons, featured content
   */
  bouncy: { damping: 8 } as const,

  /**
   * Heavy, slow motion - for large or weighty elements
   * Use for: Full-screen transitions, large cards, heavyweight UI
   */
  heavy: { damping: 15, stiffness: 80, mass: 2 } as const,

  /**
   * Gentle spring - balanced feel with subtle bounce
   * Use for: Modal animations, panel slides, tooltips
   */
  gentle: { damping: 25, stiffness: 150 } as const,
} as const;

/**
 * Cubic Bezier Easing Functions
 *
 * Pre-defined easing curves for tween animations.
 * Cubic bezier format: [x1, y1, x2, y2]
 *
 * @see https://easings.net / https://cubic-bezier.com
 */
export const easings = {
  /**
   * Apple-like ease (currently used in ScrollReveal)
   * iOS/macOS style smooth deceleration
   */
  apple: [0.22, 1, 0.36, 1] as const,

  /**
   * Standard cubic bezier curves
   */
  outCubic: [0.215, 0.61, 0.355, 1] as const,
  inOutCubic: [0.645, 0.045, 0.355, 1] as const,

  /**
   * Material Design inspired easings
   */
  easeOut: [0, 0, 0.2, 1] as const,
  easeInOut: [0.4, 0, 0.2, 1] as const,

  /**
   * Custom easing for specific effects
   */
  dramatic: [0.87, 0, 0.13, 1] as const, // Strong overshoot
  subtle: [0.33, 1, 0.68, 1] as const, // Minimal overshoot
} as const;

/**
 * Animation Durations (in seconds)
 *
 * Following Remotion's philosophy: frame-based timing for consistency
 * 60fps = 16.67ms per frame
 *
 * @see https://www.remotion.dev/docs/the-basics#working-with-time
 */
export const durations = {
  /**
   * Fast interactions - UI feedback
   * 300ms = ~18 frames at 60fps
   */
  fast: 0.3 as const,

  /**
   * Standard transitions - content reveals
   * 500ms = ~30 frames at 60fps
   */
  normal: 0.5 as const,

  /**
   * Slow, deliberate motion - emphasis
   * 800ms = ~48 frames at 60fps
   */
  slow: 0.8 as const,

  /**
   * Very slow - cinematic or hero animations
   * 1200ms = ~72 frames at 60fps
   */
  verySlow: 1.2 as const,

  /**
   * Instant - for layout corrections
   * 150ms = ~9 frames at 60fps
   */
  instant: 0.15 as const,
} as const;

/**
 * Stagger Delays (in seconds)
 *
 * Time between each child's animation start
 */
export const staggerDelays = {
  rapid: 0.03 as const,   // ~2 frames - very fast cascade
  fast: 0.05 as const,    // ~3 frames - quick cascade
  normal: 0.1 as const,   // ~6 frames - standard cascade
  slow: 0.15 as const,    // ~9 frames - relaxed cascade
  verySlow: 0.2 as const, // ~12 frames - dramatic cascade
} as const;

/**
 * Common Animation Combinations
 *
 * Pre-composed animation configs for frequent use cases
 */
export const presets = {
  /**
   * Quick UI feedback
   */
  uiHover: {
    type: "spring" as const,
    stiffness: 400,
    damping: 17,
  },

  /**
   * Button press
   */
  buttonPress: {
    type: "spring" as const,
    stiffness: 400,
    damping: 10,
  },

  /**
   * Smooth page transition
   */
  pageTransition: {
    duration: durations.normal,
    ease: easings.apple,
  },

  /**
   * Content reveal
   */
  contentReveal: {
    duration: durations.slow,
    ease: easings.apple,
  },
} as const;

/**
 * Reduced Motion Configs
 *
 * Alternative animations for users who prefer reduced motion
 * @see https://www.w3.org/WAI/WCAG21/Understanding/animation-from-interactions
 */
export const reducedMotion = {
  duration: 0.01, // Nearly instant for reduced motion
  ease: easings.easeOut,
} as const;
