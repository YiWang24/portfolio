package com.portfolio.controller;

import com.google.adk.events.Event;
import com.portfolio.service.AgentService;
import com.google.genai.types.Content;
import io.reactivex.rxjava3.core.Flowable;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;
import reactor.core.publisher.FluxSink;

import java.time.Duration;
import java.util.Map;
import java.util.concurrent.atomic.AtomicBoolean;

@RestController
@RequestMapping("/api/v1/chat")
public class ChatController {

    private static final Logger log = LoggerFactory.getLogger(ChatController.class);
    private final AgentService agentService;

    public ChatController(AgentService agentService) {
        this.agentService = agentService;
    }

    @PostMapping("/message")
    public ResponseEntity<Map<String, String>> sendMessage(@RequestBody ChatRequest request) {
        String sessionId = request.getSessionId() != null ? request.getSessionId() : "session-" + System.currentTimeMillis();
        String message = truncateMessage(request.getMessage());
        String response = agentService.processMessage(sessionId, message);
        return ResponseEntity.ok(Map.of("sessionId", sessionId, "response", response));
    }

    @PostMapping(value = "/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public Flux<String> streamMessage(@RequestBody ChatRequest request) {
        String sessionId = request.getSessionId() != null ? request.getSessionId() : "session-" + System.currentTimeMillis();
        String message = truncateMessage(request.getMessage());
        return streamMessageInternal(sessionId, message);
    }

    @GetMapping(value = "/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public Flux<String> streamMessageGet(
            @RequestParam("message") String message,
            @RequestParam(value = "sessionId", required = false) String sessionId) {
        String resolvedSessionId = sessionId != null ? sessionId : "session-" + System.currentTimeMillis();
        String truncatedMessage = truncateMessage(message);
        return streamMessageInternal(resolvedSessionId, truncatedMessage);
    }
    
    private String truncateMessage(String message) {
        if (message == null) return "";
        if (message.length() <= 500) return message;
        log.warn("Message truncated from {} to 500 characters", message.length());
        return message.substring(0, 500);
    }

    private Flux<String> streamMessageInternal(String sessionId, String message) {
        Flowable<Event> events = agentService.processMessageStream(sessionId, message);

        return Flux.create(sink -> {
            AtomicBoolean thinkingSent = new AtomicBoolean(false);
            AtomicBoolean thinkingCompleteSent = new AtomicBoolean(false);
            StringBuilder emitted = new StringBuilder();
            sink.next(toSse("status", toJson(Map.of("type", "status", "phase", "start"))));

            events.subscribe(
                    event -> {
                        try {
                            // Tool calls - send immediately
                            if (event.functionCalls() != null && !event.functionCalls().isEmpty()) {
                                event.functionCalls().forEach(call -> {
                                    String toolName = call.name().orElse("unknown");
                                    String json = toJson(Map.of(
                                        "type", "function_call",
                                        "name", toolName,
                                        "status", "running"
                                    ));
                                    sink.next(toSse("function_call", json));
                                });
                            }

                            // Tool results - send immediately
                            if (event.functionResponses() != null && !event.functionResponses().isEmpty()) {
                                event.functionResponses().forEach(response -> {
                                    String toolName = response.name().orElse("unknown");
                                    String json = toJson(Map.of(
                                        "type", "function_call",
                                        "name", toolName,
                                        "status", "completed"
                                    ));
                                    sink.next(toSse("function_call", json));
                                });
                            }

                            // Extract text content and stream deltas
                            String content = extractTextContent(event);
                            if (content != null && !content.isEmpty()) {
                                boolean isPartial = event.partial().orElse(false);
                                if (isPartial && thinkingSent.compareAndSet(false, true)) {
                                    String json = toJson(Map.of("type", "status", "phase", "thinking"));
                                    sink.next(toSse("status", json));
                                }

                                String delta = diffFromLast(emitted, content);
                                if (!delta.isEmpty()) {
                                    String tokenJson = toJson(Map.of("type", "delta", "content", delta));
                                    sink.next(toSse("delta", tokenJson));
                                }
                            }

                            if (event.turnComplete().orElse(false) && thinkingCompleteSent.compareAndSet(false, true)) {
                                String json = toJson(Map.of("type", "status", "phase", "thinking_complete"));
                                sink.next(toSse("status", json));
                            }

                            if (event.finalResponse()) {
                                String completeJson = toJson(Map.of("type", "complete"));
                                sink.next(toSse("complete", completeJson));
                            }
                        } catch (Exception e) {
                            log.error("Error processing event", e);
                            sink.error(e);
                        }
                    },
                    error -> {
                        log.error("Stream error", error);
                        String errorJson = toJson(Map.of("type", "error", "message", error.getMessage()));
                        sink.next(toSse("error", errorJson));
                        sink.complete();
                    },
                    () -> {
                        log.debug("Stream completed");
                        sink.complete();
                    }
            );
        }, FluxSink.OverflowStrategy.BUFFER);
    }

    private String extractTextContent(Event event) {
        return event.content()
                .map(Content::text)
                .filter(text -> !text.isBlank())
                .orElse(null);
    }

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
        emitted.setLength(0);
        emitted.append(content);
        return content;
    }

    private String toJson(Map<String, String> map) {
        StringBuilder json = new StringBuilder("{");
        boolean first = true;
        for (Map.Entry<String, String> entry : map.entrySet()) {
            if (!first) json.append(",");
            json.append("\"").append(entry.getKey()).append("\":\"")
                .append(escapeJson(entry.getValue())).append("\"");
            first = false;
        }
        json.append("}");
        return json.toString();
    }

    private String toSse(String eventName, String json) {
        if (eventName == null || eventName.isBlank()) {
            return "data: " + json + "\n\n";
        }
        return "event: " + eventName + "\n" + "data: " + json + "\n\n";
    }

    @DeleteMapping("/session/{sessionId}")
    public ResponseEntity<Void> clearSession(@PathVariable String sessionId) {
        agentService.clearSession(sessionId);
        return ResponseEntity.ok().build();
    }

    private String escapeJson(String text) {
        if (text == null) return "";
        return text.replace("\\", "\\\\")
                .replace("\"", "\\\"")
                .replace("\n", "\\n")
                .replace("\r", "\\r")
                .replace("\t", "\\t");
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
