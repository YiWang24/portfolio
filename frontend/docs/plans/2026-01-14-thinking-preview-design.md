# Thinking Preview + Stable Ordering (TerminalPanel)

## Summary
Implement a cleaned, first-line-only thinking preview for `thinking_delta` events and keep the thinking UI visible above the streaming response in the terminal UI. This reduces noisy Markdown in the thought stream and avoids thought/output interleaving during response streaming.

## Goals
- Strip Markdown from `thinking_delta` content.
- Only show the first non-empty line for each thinking delta.
- Keep thinking chain and thought logs visible above streamed content while the response is streaming.

## Non-goals
- Reworking the backend event protocol.
- Changing the chat UI (non-terminal) behavior.
- Merging multiple thinking deltas into a single thought line.

## Current Flow
- `TerminalPanel` registers SSE handlers and writes `thinking_delta` into `thoughts`.
- `handleThinkingComplete` clears `functionSteps` and `thoughts`.
- UI only renders thinking chain + thoughts when `status === "thinking"`.

## Proposed Changes
- Add a small utility `extractThinkingPreview(raw: string): string`.
  - Normalize CRLF to `\n`.
  - Strip Markdown using `remove-markdown`.
  - Return the first non-empty line; otherwise return an empty string.
- In `TerminalPanel.onThinkingDelta`, map raw deltas through the utility and ignore empty results.
- Update `handleThinkingComplete` to stop clearing thinking data; keep it until completion.
- Render thinking chain + thoughts whenever they exist, not only during `status === "thinking"`.
  - This keeps thinking above streamed output, matching the desired UX.

## Files to Touch
- `src/utils/thinking.ts` (new)
- `src/components/terminal/TerminalPanel.tsx`
- `package.json` / `package-lock.json` (add `remove-markdown`)
- `src/utils/thinking.test.ts` (new)

## Testing
- Unit tests for `extractThinkingPreview`:
  - Strips Markdown and returns first non-empty line.
  - Handles CRLF and leading empty lines.
  - Returns empty string when no visible content remains.
