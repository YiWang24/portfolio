# Enhanced Streaming Chat System (V2)

## Overview

Production-grade streaming chat implementation similar to OpenAI o1/Gemini with real-time thinking phases, tool execution display, and typewriter-style response streaming.

## Architecture

### Backend (Spring Boot)

#### Event Model
- **File**: `backend/src/main/java/com/portfolio/model/StreamEvents.java`
- Contains all event types as nested static classes
- Uses Jackson for JSON serialization

#### Controller
- **File**: `backend/src/main/java/com/portfolio/controller/ChatControllerV2.java`
- **Endpoint**: `/api/v2/chat/stream`
- **Methods**: GET and POST supported
- **Response Type**: `text/event-stream` (SSE)

### Frontend (React/TypeScript)

#### Types
- **File**: `frontend/src/types/stream-v2.ts`
- TypeScript types matching backend events
- Type guards and parsers

#### SSE Service
- **File**: `frontend/src/services/sse-v2.ts`
- EventSource-based streaming client
- Event routing to handlers

#### Components
- **ThinkingProcess**: Collapsible thinking phase display
- **ToolExecutionList**: Tool calls with status and results
- **ChatMessage**: Unified message component
- **ChatPanelV2**: Complete chat interface

#### Hook
- **File**: `frontend/src/hooks/useStreamingChatV2.ts`
- Manages streaming state
- Handles all event types

## Event Protocol

### 1. session_start
```json
{
  "type": "session_start",
  "session_id": "session-1234567890"
}
```

### 2. thinking_start
```json
{
  "type": "thinking_start"
}
```

### 3. thinking_delta
```json
{
  "type": "thinking_delta",
  "content": "Analyzing user request..."
}
```

### 4. thinking_end
```json
{
  "type": "thinking_end"
}
```

### 5. tool_call_start
```json
{
  "type": "tool_call_start",
  "tool_id": "tool_1",
  "tool_name": "getGitHubStats",
  "arguments": "{\"username\": \"example\"}"
}
```

### 6. tool_call_end
```json
{
  "type": "tool_call_end",
  "tool_id": "tool_1",
  "tool_name": "getGitHubStats",
  "result": "{\"repos\": 42}",
  "success": true
}
```

### 7. response_start
```json
{
  "type": "response_start"
}
```

### 8. response_delta
```json
{
  "type": "response_delta",
  "content": "Hello"
}
```

### 9. response_end
```json
{
  "type": "response_end"
}
```

### 10. error
```json
{
  "type": "error",
  "message": "Rate limit exceeded",
  "code": "RATE_LIMIT"
}
```

### 11. complete
```json
{
  "type": "complete"
}
```

## Usage

### Backend

```java
@RestController
@RequestMapping("/api/v2/chat")
public class ChatControllerV2 {

    @GetMapping(value = "/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public Flux<ServerSentEvent<String>> streamChatGet(
            @RequestParam("message") String message,
            @RequestParam(value = "sessionId", required = false) String sessionId) {
        // Implementation
    }

    @PostMapping(value = "/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public Flux<ServerSentEvent<String>> streamChatPost(@RequestBody ChatRequest request) {
        // Implementation
    }
}
```

### Frontend

#### Using the Hook

```typescript
import { useStreamingChatV2 } from "@/hooks/useStreamingChatV2";

function MyComponent() {
  const { messages, currentMessage, isLoading, sendMessage } = useStreamingChatV2({
    onError: (error) => console.error(error),
  });

  const handleSend = async () => {
    await sendMessage("What is your experience?", "session-123");
  };

  return (
    <div>
      {messages.map((msg) => (
        <ChatMessage key={msg.id} message={msg} />
      ))}
      {currentMessage && <ChatMessage message={currentMessage} />}
    </div>
  );
}
```

#### Using the Service Directly

```typescript
import { streamChatV2 } from "@/services/sse-v2";

await streamChatV2(message, sessionId, {
  onSessionStart: (sessionId) => console.log("Session:", sessionId),
  onThinkingStart: () => console.log("Thinking started"),
  onThinkingDelta: (content) => console.log("Thinking:", content),
  onThinkingEnd: () => console.log("Thinking ended"),
  onToolStart: (tool) => console.log("Tool started:", tool.toolName),
  onToolEnd: (tool) => console.log("Tool ended:", tool.toolName),
  onResponseStart: () => console.log("Response started"),
  onResponseDelta: (content) => console.log("Response:", content),
  onResponseEnd: () => console.log("Response ended"),
  onComplete: () => console.log("Complete"),
  onError: (message, code) => console.error("Error:", message, code),
});
```

#### Using the ChatPanel Component

```typescript
import { ChatPanelV2 } from "@/components/chat/ChatPanelV2";

function App() {
  return <ChatPanelV2 />;
}
```

## Phase Flow

```
User Message
    ↓
session_start
    ↓
thinking_start
    ↓
thinking_delta (repeated)
    ↓
thinking_end
    ↓
tool_call_start (for each tool, optional)
    ↓
tool_call_end (for each tool, optional)
    ↓
response_start
    ↓
response_delta (repeated)
    ↓
response_end
    ↓
complete
```

## Component Features

### ThinkingProcess
- Collapsible display
- Brain icon with animation
- Status indicator (thinking/completed)
- Markdown support

### ToolExecutionList
- Tool name and status
- Arguments display
- Result display
- Status icons (running/completed/failed)
- Color-coded results

### ChatMessage
- User/Agent differentiation
- Phase indicator
- Thinking section
- Tools section
- Response content
- Streaming cursor
- Error handling

### ChatPanelV2
- Auto-scroll
- Session management
- Clear chat functionality
- Keyboard shortcuts (Enter/Shift+Enter)
- Loading states

## Styling

### Tailwind Classes Used

- Colors: `purple-*`, `blue-*`, `green-*`, `red-*`, `gray-*`
- Spacing: `gap-*`, `p-*`, `m-*`, `px-*`, `py-*`
- Layout: `flex`, `grid`, `space-*`
- Typography: `text-*`, `font-*`
- Effects: `animate-*`, `transition-*`, `hover:*`
- States: `disabled:*`, `dark:`

### Custom Animations

- Pulse (thinking indicator)
- Spin (loading spinner)
- Blink (cursor)

## Error Handling

### Connection Errors
- Timeout after 30 seconds
- Automatic retry logic
- User-friendly error messages

### Stream Errors
- Graceful degradation
- Error events with codes
- Partial result preservation

### Rate Limiting
- Handled by existing RateLimitService
- Error code: `RATE_LIMIT`
- Retry-after support

## Performance

### Backend
- Reactive streams (Flux)
- Non-blocking I/O
- Efficient memory usage
- Backpressure support

### Frontend
- React.memo for components
- useCallback for handlers
- Efficient re-renders
- Minimal DOM manipulation

## Testing

### Backend Tests
```bash
mvn test
```

### Frontend Tests
```bash
npm test
```

### Manual Testing
1. Start backend server
2. Start frontend server
3. Open ChatPanelV2
4. Send a message that triggers tool calls
5. Verify thinking phase displays
6. Verify tool execution displays
7. Verify response streams correctly

## Migration from V1

### Backend
1. Replace `ChatController` with `ChatControllerV2`
2. Update endpoint from `/api/v1/chat/stream` to `/api/v2/chat/stream`
3. Update client to handle new event types

### Frontend
1. Replace `streamChat` with `streamChatV2`
2. Update message types to use `ChatMessage`
3. Replace old components with V2 components
4. Update handlers for new event types

## Future Enhancements

- [ ] Markdown rendering in responses
- [ ] Code syntax highlighting
- [ ] Multi-language support
- [ ] File uploads
- [ ] Voice input/output
- [ ] Session persistence
- [ ] Export chat history
- [ ] Streaming metrics dashboard
- [ ] A/B testing support
- [ ] Analytics integration

## License

MIT License - See LICENSE file for details
