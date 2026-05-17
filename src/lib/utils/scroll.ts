/**
 * Smooth Scroll Utilities
 * Provides buttery smooth scrolling with custom easing for navigation
 */

// Custom easing function for smooth, natural feeling scroll
// Uses ease-out-cubic for deceleration effect
function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

// More sophisticated easing - ease-out-quint for even smoother deceleration
function easeOutQuint(t: number): number {
  return 1 - Math.pow(1 - t, 5);
}

// Apple-like smooth easing (similar to iOS scroll)
function easeInOutCubic(t: number): number {
  return t < 0.5
    ? 4 * t * t * t
    : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

export interface SmoothScrollOptions {
  duration?: number; // Duration in ms (default: 1200 for extra smooth feel)
  offset?: number; // Offset from top (for fixed navbar, etc.)
  easing?: 'cubic' | 'quint' | 'ios' | 'linear';
  container?: HTMLElement | null; // Custom scroll container
}

/**
 * Smooth scroll to an element with custom easing
 */
export function smoothScrollTo(
  targetId: string,
  options: SmoothScrollOptions = {}
): Promise<void> {
  return new Promise((resolve) => {
    const {
      duration = 1200,
      offset = 80,
      easing = 'ios',
      container = null
    } = options;

    // Find target element
    const target = document.getElementById(targetId.replace('#', ''));
    if (!target) {
      console.warn(`Element with id "${targetId}" not found`);
      resolve();
      return;
    }

    // Determine scroll container (custom or main container or window)
    const scrollContainer = container ||
      document.getElementById('main-scroll-container') ||
      document.documentElement;

    // Get current scroll position and target position
    const containerRect = scrollContainer.getBoundingClientRect();
    const targetRect = target.getBoundingClientRect();
    const currentScroll = scrollContainer.scrollTop ||
      (scrollContainer === document.documentElement ? window.scrollY : 0);

    // Calculate target scroll position
    const targetScroll = currentScroll + targetRect.top - offset;

    // Use native smooth scroll for better performance (fallback)
    if (supportsNativeSmoothScroll()) {
      scrollContainer.scrollTo({
        top: targetScroll,
        behavior: 'smooth'
      });
      // Estimate duration for promise resolution
      setTimeout(resolve, duration);
      return;
    }

    // Custom animated scroll with easing
    const startTime = performance.now();
    const startScroll = currentScroll;
    const scrollDistance = targetScroll - startScroll;

    // Select easing function
    const easingFn = easing === 'quint' ? easeOutQuint
      : easing === 'cubic' ? easeOutCubic
      : easing === 'ios' ? easeInOutCubic
      : (t: number) => t; // linear

    function animateScroll(currentTime: number) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Apply easing
      const easedProgress = easingFn(progress);
      const newPosition = startScroll + (scrollDistance * easedProgress);

      scrollContainer.scrollTop = newPosition;

      if (progress < 1) {
        requestAnimationFrame(animateScroll);
      } else {
        resolve();
      }
    }

    requestAnimationFrame(animateScroll);
  });
}

/**
 * Check if browser supports native smooth scroll
 */
function supportsNativeSmoothScroll(): boolean {
  return 'scrollBehavior' in document.documentElement.style;
}

/**
 * React hook for smooth scrolling
 */
export function useSmoothScroll() {
  const scrollTo = (targetId: string, options?: SmoothScrollOptions) => {
    return smoothScrollTo(targetId, options);
  };

  const scrollToTop = (options?: Omit<SmoothScrollOptions, 'offset'>) => {
    const container = options?.container ||
      document.getElementById('main-scroll-container') ||
      document.documentElement;

    if (supportsNativeSmoothScroll()) {
      container.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      container.scrollTop = 0;
    }
  };

  return { scrollTo, scrollToTop };
}

/**
 * Get all section IDs for navigation
 */
export const SECTION_IDS = [
  'about',
  'experience',
  'projects',
  'stack',
  'licenses',
  'contact'
] as const;

/**
 * Get next section ID
 */
export function getNextSection(currentId: string): string | null {
  const currentIndex = SECTION_IDS.indexOf(currentId as any);
  if (currentIndex < 0 || currentIndex >= SECTION_IDS.length - 1) {
    return null;
  }
  return SECTION_IDS[currentIndex + 1];
}

/**
 * Get previous section ID
 */
export function getPreviousSection(currentId: string): string | null {
  const currentIndex = SECTION_IDS.indexOf(currentId as any);
  if (currentIndex <= 0) {
    return null;
  }
  return SECTION_IDS[currentIndex - 1];
}
