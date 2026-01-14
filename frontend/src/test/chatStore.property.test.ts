import { describe, it, expect, beforeEach } from "vitest";
import * as fc from "fast-check";
import { useChatStore } from "../stores/chatStore";

/**
 * Property-Based Tests for Chat Store
 * Feature: digital-twin-dashboard
 */

describe("Chat Store Properties", () => {
  beforeEach(() => {
    // Reset store state before each test
    useChatStore.getState().clearMessages();
    useChatStore.setState({ isStreaming: false, currentSessionId: null });
  });

  /**
   * Property 1: Message Addition Invariant
   * For any valid message object (with role and content), calling addMessage
   * on the Chat_Store SHALL result in the messages array length increasing by
   * exactly 1, and the new message SHALL contain the provided role and content
   * along with auto-generated id and timestamp fields.
   *
   * **Validates: Requirements 6.2, 6.4**
   */
  it("Property 1: Message addition invariant", () => {
    fc.assert(
      fc.property(
        fc.record({
          role: fc.constantFrom("user", "assistant", "system") as fc.Arbitrary<
            "user" | "assistant" | "system"
          >,
          content: fc.string(),
        }),
        (message) => {
          const store = useChatStore.getState();
          const initialLength = store.messages.length;

          // Add the message
          store.addMessage(message);

          const newState = useChatStore.getState();
          const newLength = newState.messages.length;
          const addedMessage = newState.messages[newLength - 1];

          // Invariant 1: Length increases by exactly 1
          expect(newLength).toBe(initialLength + 1);

          // Invariant 2: New message contains provided role
          expect(addedMessage.role).toBe(message.role);

          // Invariant 3: New message contains provided content
          expect(addedMessage.content).toBe(message.content);

          // Invariant 4: New message has auto-generated id (non-empty string)
          expect(typeof addedMessage.id).toBe("string");
          expect(addedMessage.id.length).toBeGreaterThan(0);

          // Invariant 5: New message has auto-generated timestamp (valid Date)
          expect(addedMessage.timestamp).toBeInstanceOf(Date);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 2: Streaming State Toggle
   * For any boolean value passed to setStreaming, the Chat_Store's isStreaming
   * state SHALL equal that exact boolean value after the action completes.
   *
   * **Validates: Requirements 6.3, 6.5**
   */
  it("Property 2: Streaming state toggle", () => {
    fc.assert(
      fc.property(fc.boolean(), (streamingValue) => {
        const store = useChatStore.getState();

        // Set the streaming state
        store.setStreaming(streamingValue);

        const newState = useChatStore.getState();

        // Invariant: isStreaming equals the exact boolean value passed
        expect(newState.isStreaming).toBe(streamingValue);
      }),
      { numRuns: 100 }
    );
  });
});
