package com.portfolio.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.adk.events.Event;
import com.portfolio.model.StreamEvents;
import com.portfolio.service.AgentService;
import com.portfolio.service.RateLimitService;
import io.reactivex.rxjava3.core.Flowable;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicBoolean;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * Enhanced streaming chat controller with real SSE streaming
 * Uses SseEmitter (Spring MVC) instead of Sinks.Many (WebFlux)
 */
@RestController
@RequestMapping("/api/v1/chat")
public class ChatController {

    private static final Logger log = LoggerFactory.getLogger(ChatController.class);
    private final AgentService agentService;
    private final RateLimitService rateLimitService;
    private final ObjectMapper objectMapper;

    public ChatController(AgentService agentService, RateLimitService rateLimitService) {
        this.agentService = agentService;
        this.rateLimitService = rateLimitService;
        this.objectMapper = new ObjectMapper();
    }

    @GetMapping(value = "/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter streamChatGet(
            @RequestParam("message") String message,
            @RequestParam(value = "sessionId", required = false) String sessionId) {
        String resolvedSessionId = sessionId != null ? sessionId : "session-" + System.currentTimeMillis();
        String truncatedMessage = truncateMessage(message);
        return streamChatInternal(resolvedSessionId, truncatedMessage);
    }

    @PostMapping(value = "/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter streamChatPost(@RequestBody ChatRequest request) {
        String sessionId = request.getSessionId() != null ? request.getSessionId() : "session-" + System.currentTimeMillis();
        String message = truncateMessage(request.getMessage());
        return streamChatInternal(sessionId, message);
    }

    private SseEmitter streamChatInternal(String sessionId, String message) {
        // Create SSE emitter with 30 minute timeout
        SseEmitter emitter = new SseEmitter(30 * 60 * 1000L);

        // Phase tracking
        AtomicBoolean thinkingPhaseSent = new AtomicBoolean(false);
        AtomicBoolean thinkingContentSent = new AtomicBoolean(false);
        AtomicBoolean responsePhaseStarted = new AtomicBoolean(false);
        AtomicBoolean responseCompleteSent = new AtomicBoolean(false);

        // Content tracking
        StringBuilder thinkingContent = new StringBuilder();
        StringBuilder responseContent = new StringBuilder();

        // Tool tracking
        Map<String, ToolCallState> activeTools = new ConcurrentHashMap<>();
        AtomicInteger toolCallCounter = new AtomicInteger(0);

        // Error handler
        emitter.onError((ex) -> {
            log.error("SSE emitter error for session: {}", sessionId, ex);
        });

        // Completion handler
        emitter.onCompletion(() -> {
            log.debug("SSE emitter completed for session: {}", sessionId);
        });

        // Timeout handler
        emitter.onTimeout(() -> {
            log.warn("SSE emitter timeout for session: {}", sessionId);
        });

        // Start async processing in a separate thread
        Thread.ofVirtual().start(() -> {
            try {
                // Send session start
                sendEvent(emitter, new StreamEvents.SessionStartEvent(sessionId));

                // Get event stream from agent
                Flowable<Event> events = agentService.processMessageStream(sessionId, message);

                // Subscribe to events and send to emitter
                events.blockingForEach(event -> {
                    try {
                        // PHASE 1: THINKING
                        if (event.partial().orElse(false)) {
                            if (thinkingPhaseSent.compareAndSet(false, true)) {
                                sendEvent(emitter, new StreamEvents.ThinkingStartEvent());
                            }

                            String content = extractTextContent(event);
                            if (content != null && !content.isEmpty()) {
                                String delta = diffFromLast(thinkingContent, content);
                                if (!delta.isEmpty()) {
                                    sendEvent(emitter, new StreamEvents.ThinkingDeltaEvent(delta));
                                    thinkingContentSent.set(true);
                                }
                            }
                        }

                        // PHASE 2: TOOL CALLS
                        if (event.functionCalls() != null && !event.functionCalls().isEmpty()) {
                            if (thinkingContentSent.get() && thinkingPhaseSent.get()) {
                                sendEvent(emitter, new StreamEvents.ThinkingEndEvent());
                                thinkingPhaseSent.set(false);
                            }

                            event.functionCalls().forEach(call -> {
                                try {
                                    String toolId = "tool_" + toolCallCounter.incrementAndGet();
                                    String toolName = call.name().orElse("unknown");
                                    String args = call.args().map(Object::toString).orElse("{}");

                                    activeTools.put(toolId, new ToolCallState(toolId, toolName));
                                    sendEvent(emitter, new StreamEvents.ToolCallStartEvent(toolId, toolName, args));
                                } catch (Exception e) {
                                    log.error("Error sending tool start event", e);
                                }
                            });
                        }

                        // PHASE 3: TOOL RESULTS
                        if (event.functionResponses() != null && !event.functionResponses().isEmpty()) {
                            event.functionResponses().forEach(response -> {
                                String toolName = response.name().orElse("unknown");
                                String result = response.response().map(Object::toString).orElse("Success");

                                activeTools.entrySet().stream()
                                        .filter(entry -> entry.getValue().toolName.equals(toolName))
                                        .filter(entry -> !entry.getValue().completed)
                                        .findFirst()
                                        .ifPresent(entry -> {
                                            try {
                                                entry.getValue().completed = true;
                                                sendEvent(emitter, new StreamEvents.ToolCallEndEvent(
                                                        entry.getKey(),
                                                        toolName,
                                                        truncateResult(result),
                                                        true
                                                ));
                                            } catch (Exception e) {
                                                log.error("Error sending tool end event", e);
                                            }
                                        });
                            });
                        }

                        // PHASE 4: FINAL RESPONSE
                        if (!event.partial().orElse(false)) {
                            String content = extractTextContent(event);
                            if (content != null && !content.isEmpty()) {
                                if (thinkingPhaseSent.get()) {
                                    sendEvent(emitter, new StreamEvents.ThinkingEndEvent());
                                    thinkingPhaseSent.set(false);
                                }

                                if (responsePhaseStarted.compareAndSet(false, true)) {
                                    sendEvent(emitter, new StreamEvents.ResponseStartEvent());
                                }

                                String delta = diffFromLast(responseContent, content);
                                if (!delta.isEmpty()) {
                                    sendEvent(emitter, new StreamEvents.ResponseDeltaEvent(delta));
                                }
                            }
                        }

                        // Check if turn is complete
                        if (event.turnComplete().orElse(false)) {
                            if (thinkingPhaseSent.get()) {
                                sendEvent(emitter, new StreamEvents.ThinkingEndEvent());
                                thinkingPhaseSent.set(false);
                            }

                            if (responsePhaseStarted.get() && responseCompleteSent.compareAndSet(false, true)) {
                                sendEvent(emitter, new StreamEvents.ResponseEndEvent());
                            }
                        }

                    } catch (Exception e) {
                        log.error("Error processing streaming event", e);
                        try {
                            sendEvent(emitter, new StreamEvents.ErrorEvent(
                                    e.getMessage(),
                                    "STREAM_ERROR"
                            ));
                        } catch (IOException ioException) {
                            log.error("Failed to send error event", ioException);
                        }
                    }
                });

                // Stream completed
                if (thinkingPhaseSent.get()) {
                    sendEvent(emitter, new StreamEvents.ThinkingEndEvent());
                }
                if (responsePhaseStarted.get() && !responseCompleteSent.get()) {
                    sendEvent(emitter, new StreamEvents.ResponseEndEvent());
                }

                sendEvent(emitter, new StreamEvents.CompleteEvent());
                emitter.complete();

            } catch (Exception e) {
                log.error("Error in stream processing", e);
                try {
                    sendEvent(emitter, new StreamEvents.ErrorEvent(
                            e.getMessage(),
                            "PROCESSING_ERROR"
                    ));
                    emitter.completeWithError(e);
                } catch (IOException ioException) {
                    log.error("Failed to send error and complete", ioException);
                }
            }
        });

        return emitter;
    }

    /**
     * Send event to SSE emitter
     */
    private void sendEvent(SseEmitter emitter, StreamEvents.StreamEvent event) throws IOException {
        String json = objectMapper.writeValueAsString(event);

        // Build SSE event with name and data
        SseEmitter.SseEventBuilder builder = SseEmitter.event()
                .name(event.getType())
                .data(json);

        emitter.send(builder);
    }

    /**
     * Extract text content from event
     */
    private String extractTextContent(Event event) {
        return event.content()
                .map(content -> {
                    String text = content.text();
                    return text != null && !text.isBlank() ? text : null;
                })
                .orElse(null);
    }

    /**
     * Calculate delta from last emitted content
     */
    private String diffFromLast(StringBuilder emitted, String content) {
        if (content == null || content.isEmpty()) {
            return "";
        }

        String previous = emitted.toString();
        if (previous.isEmpty()) {
            emitted.append(content);
            return content;
        }

        if (content.startsWith(previous)) {
            String delta = content.substring(previous.length());
            if (!delta.isEmpty()) {
                emitted.append(delta);
            }
            return delta;
        }

        // Handle non-cumulative chunks
        int commonPrefix = 0;
        int maxLen = Math.min(previous.length(), content.length());
        while (commonPrefix < maxLen && previous.charAt(commonPrefix) == content.charAt(commonPrefix)) {
            commonPrefix++;
        }

        String actualDelta;
        if (commonPrefix > 0) {
            actualDelta = content.substring(commonPrefix);
            emitted.setLength(0);
            emitted.append(content);
        } else {
            actualDelta = content;
            emitted.setLength(0);
            emitted.append(content);
        }

        return actualDelta;
    }

    /**
     * Truncate tool result
     */
    private String truncateResult(String result) {
        if (result == null) return "";
        int maxLen = 1000;
        if (result.length() <= maxLen) return result;
        return result.substring(0, maxLen) + "... (truncated)";
    }

    /**
     * Truncate message
     */
    private String truncateMessage(String message) {
        if (message == null) return "";
        if (message.length() <= 500) return message;
        log.warn("Message truncated from {} to 500 characters", message.length());
        return message.substring(0, 500);
    }

    /**
     * Track tool call state
     */
    private static class ToolCallState {
        final String toolId;
        final String toolName;
        boolean completed = false;

        ToolCallState(String toolId, String toolName) {
            this.toolId = toolId;
            this.toolName = toolName;
        }
    }

    public static class ChatRequest {
        private String sessionId;
        private String message;

        public String getSessionId() { return sessionId; }
        public void setSessionId(String sessionId) { this.sessionId = sessionId; }
        public String getMessage() { return message; }
        public void setMessage(String message) { this.message = message; }
    }
}
