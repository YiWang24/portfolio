package com.portfolio.model;

import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * Streaming event types for AI chat responses
 * Provides structured event protocol similar to OpenAI o1/Gemini
 */
public class StreamEvents {

    private StreamEvents() {}

    /**
     * Base event class
     */
    public static abstract class StreamEvent {
        private final String type;

        protected StreamEvent(String type) {
            this.type = type;
        }

        @JsonProperty("type")
        public String getType() {
            return type;
        }
    }

    /**
     * Session established event
     */
    public static class SessionStartEvent extends StreamEvent {
        private final String sessionId;

        public SessionStartEvent(String sessionId) {
            super("session_start");
            this.sessionId = sessionId;
        }

        @JsonProperty("session_id")
        public String getSessionId() {
            return sessionId;
        }
    }

    /**
     * Thinking phase events
     */
    public static class ThinkingStartEvent extends StreamEvent {
        public ThinkingStartEvent() {
            super("thinking_start");
        }
    }

    public static class ThinkingDeltaEvent extends StreamEvent {
        private final String content;

        public ThinkingDeltaEvent(String content) {
            super("thinking_delta");
            this.content = content;
        }

        @JsonProperty("content")
        public String getContent() {
            return content;
        }
    }

    public static class ThinkingEndEvent extends StreamEvent {
        public ThinkingEndEvent() {
            super("thinking_end");
        }
    }

    /**
     * Tool call events
     */
    public static class ToolCallStartEvent extends StreamEvent {
        private final String toolId;
        private final String toolName;
        private final String arguments;

        public ToolCallStartEvent(String toolId, String toolName, String arguments) {
            super("tool_call_start");
            this.toolId = toolId;
            this.toolName = toolName;
            this.arguments = arguments;
        }

        @JsonProperty("tool_id")
        public String getToolId() {
            return toolId;
        }

        @JsonProperty("tool_name")
        public String getToolName() {
            return toolName;
        }

        @JsonProperty("arguments")
        public String getArguments() {
            return arguments;
        }
    }

    public static class ToolCallEndEvent extends StreamEvent {
        private final String toolId;
        private final String toolName;
        private final String result;
        private final boolean success;

        public ToolCallEndEvent(String toolId, String toolName, String result, boolean success) {
            super("tool_call_end");
            this.toolId = toolId;
            this.toolName = toolName;
            this.result = result;
            this.success = success;
        }

        @JsonProperty("tool_id")
        public String getToolId() {
            return toolId;
        }

        @JsonProperty("tool_name")
        public String getToolName() {
            return toolName;
        }

        @JsonProperty("result")
        public String getResult() {
            return result;
        }

        @JsonProperty("success")
        public boolean isSuccess() {
            return success;
        }
    }

    /**
     * Response phase events
     */
    public static class ResponseStartEvent extends StreamEvent {
        public ResponseStartEvent() {
            super("response_start");
        }
    }

    public static class ResponseDeltaEvent extends StreamEvent {
        private final String content;

        public ResponseDeltaEvent(String content) {
            super("response_delta");
            this.content = content;
        }

        @JsonProperty("content")
        public String getContent() {
            return content;
        }
    }

    public static class ResponseEndEvent extends StreamEvent {
        public ResponseEndEvent() {
            super("response_end");
        }
    }

    /**
     * Error event
     */
    public static class ErrorEvent extends StreamEvent {
        private final String message;
        private final String code;

        public ErrorEvent(String message, String code) {
            super("error");
            this.message = message;
            this.code = code;
        }

        @JsonProperty("message")
        public String getMessage() {
            return message;
        }

        @JsonProperty("code")
        public String getCode() {
            return code;
        }
    }

    /**
     * Complete event
     */
    public static class CompleteEvent extends StreamEvent {
        public CompleteEvent() {
            super("complete");
        }
    }
}
