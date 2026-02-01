/**
 * URL validation utilities for security
 * Prevents open redirect vulnerabilities
 */

/**
 * Validates if a URL string is safe to open
 * @param url - URL string to validate
 * @returns true if URL is safe, false otherwise
 */
export function isValidUrl(url: string): boolean {
  try {
    // Handle mailto links
    if (url.startsWith('mailto:')) {
      // Basic validation for mailto links
      const email = url.replace('mailto:', '');
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    // Parse URL for http/https links
    const parsed = new URL(url);

    // Only allow http and https protocols
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return false;
    }

    // Additional check: prevent javascript: and data: URLs
    if (url.startsWith('javascript:') || url.startsWith('data:')) {
      return false;
    }

    return true;
  } catch {
    // Invalid URL
    return false;
  }
}

/**
 * Safely opens a URL in a new tab
 * @param url - URL to open
 */
export function safeOpenUrl(url: string): void {
  if (isValidUrl(url)) {
    window.open(url, '_blank', 'noopener,noreferrer');
  } else {
    console.warn('Blocked potentially unsafe URL:', url);
  }
}
