/**
 * Typewriter Effect Utility
 * Simulates a typing animation by progressively revealing text content
 */

export interface TypewriterOptions {
  /** Characters per second (default: 30) */
  speed?: number;
  /** Callback for each character chunk */
  onChunk: (chunk: string) => void;
  /** Callback when typing is complete */
  onComplete?: () => void;
  /** Whether to use random delay variation (more natural feel) */
  naturalVariation?: boolean;
}

/**
 * Creates a typewriter effect for the given text
 * Returns object with cancel function and getRemainingText function
 */
export function typewriterEffect(
  text: string,
  options: TypewriterOptions
): { cancel: () => void; getRemainingText: () => string } {
  const { speed = 30, onChunk, onComplete, naturalVariation = true } = options;

  let cancelled = false;
  let currentIndex = 0;
  const baseDelay = 1000 / speed;

  function getDelay(): number {
    if (!naturalVariation) return baseDelay;
    // Add some randomness: 70% to 130% of base delay
    return baseDelay * (0.7 + Math.random() * 0.6);
  }

  function typeNextChar() {
    if (cancelled || currentIndex >= text.length) {
      if (!cancelled && onComplete) {
        onComplete();
      }
      return;
    }

    // Handle word/punctuation-based chunking for more natural feel
    let chunkSize = 1;
    const char = text[currentIndex];

    // Type faster through whitespace
    if (char === " " || char === "\n" || char === "\t") {
      chunkSize = 1;
    }
    // Pause slightly after punctuation
    else if (".,!?;:".includes(char)) {
      chunkSize = 1;
    }

    const chunk = text.slice(currentIndex, currentIndex + chunkSize);
    currentIndex += chunkSize;
    onChunk(chunk);

    // Schedule next character
    const delay = ".,!?".includes(char) ? getDelay() * 2 : getDelay();
    setTimeout(typeNextChar, delay);
  }

  // Start typing
  setTimeout(typeNextChar, 0);

  // Return control object
  return {
    cancel: () => {
      cancelled = true;
    },
    getRemainingText: () => {
      return text.slice(currentIndex);
    }
  };
}

/**
 * Typewriter queue for handling multiple text chunks
 * Useful when receiving streaming content that arrives in bursts
 */
export class TypewriterQueue {
  private queue: string[] = [];
  private isTyping = false;
  private currentControl: { cancel: () => void; getRemainingText: () => string } | null = null;
  private displayedContent = "";
  private pendingContent = ""; // Content that has been enqueued but not yet typed
  private currentTypingText = ""; // The text currently being typed

  constructor(
    private onUpdate: (content: string) => void,
    private options: Omit<TypewriterOptions, "onChunk" | "onComplete"> = {}
  ) {}

  /**
   * Add text to the queue for typing
   */
  enqueue(text: string) {
    this.queue.push(text);
    this.pendingContent += text;
    this.processQueue();
  }

  /**
   * Immediately append text (skip animation)
   */
  appendImmediate(text: string) {
    this.displayedContent += text;
    this.onUpdate(this.displayedContent);
  }

  /**
   * Get current displayed content
   */
  getContent(): string {
    return this.displayedContent;
  }

  /**
   * Get all content (displayed + pending)
   */
  getFullContent(): string {
    return this.displayedContent + this.pendingContent;
  }

  /**
   * Reset the queue and content
   */
  reset() {
    this.cancel();
    this.queue = [];
    this.displayedContent = "";
    this.pendingContent = "";
    this.currentTypingText = "";
    this.isTyping = false;
  }

  /**
   * Cancel current typing animation but keep already-typed content
   */
  cancel() {
    if (this.currentControl) {
      this.currentControl.cancel();
      this.currentControl = null;
    }
  }

  /**
   * Complete all queued text immediately
   * This properly includes remaining characters from current typing
   */
  complete() {
    // Get remaining text from current animation
    let remaining = "";
    if (this.currentControl) {
      remaining = this.currentControl.getRemainingText();
      this.currentControl.cancel();
      this.currentControl = null;
    }

    // Add remaining from current animation
    this.displayedContent += remaining;

    // Add all remaining queued text
    while (this.queue.length > 0) {
      const text = this.queue.shift();
      if (text) {
        this.displayedContent += text;
      }
    }

    // Clear pending content
    this.pendingContent = "";
    this.currentTypingText = "";
    this.isTyping = false;
    this.onUpdate(this.displayedContent);
  }

  /**
   * Complete with callback - ensures the UI is updated before calling back
   */
  completeWithCallback(callback: () => void) {
    this.complete();
    // Use setTimeout to ensure the update has been processed
    setTimeout(callback, 0);
  }

  private processQueue() {
    if (this.isTyping || this.queue.length === 0) return;

    this.isTyping = true;
    const text = this.queue.shift()!;
    this.currentTypingText = text;

    this.currentControl = typewriterEffect(text, {
      ...this.options,
      onChunk: (chunk) => {
        this.displayedContent += chunk;
        // Remove typed chunk from pending
        this.pendingContent = this.pendingContent.slice(chunk.length);
        this.onUpdate(this.displayedContent);
      },
      onComplete: () => {
        this.isTyping = false;
        this.currentControl = null;
        this.currentTypingText = "";
        this.processQueue();
      },
    });
  }
}
