"use client";

import { useMemo, useRef, useState, useEffect, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import { Mail, Download } from "lucide-react";
import { streamChat } from "@/services/sse";
import type { StreamHandlers } from "@/types/stream";
import { createMessageId } from "../../utils/terminal";
import { processLocalCommand, getCommandAction } from "../../lib/command-processor";
import { TypewriterQueue } from "@/utils/typewriter";
import ThinkingChain from "./ThinkingChain";
import { StatusBar } from "./StatusBar";
import { TerminalInput, TerminalInputRef } from "./TerminalInput";
import ContactModal from "./ContactModal";
import { useUIStore } from "@/store/ui-store";
import {
  extractThinkingPreview,
  finalizeThinkingMessage,
  shouldShowThinking,
} from "@/utils/thinking";
import type {
  TerminalMessage,
  MessageStatus,
  ItemStatus,
} from "@/types/message";

// ASCII Logo - Agent (centered, no leading spaces)
const ASCII_LOGO = `
█████╗  ██████╗ ███████╗███╗   ██╗████████╗
██╔══██╗██╔════╝ ██╔════╝████╗  ██║╚══██╔══╝
███████║██║  ███╗█████╗  ██╔██╗ ██║   ██║
██╔══██║██║   ██║██╔══╝  ██║╚██╗██║   ██║
██║  ██║╚██████╔╝███████╗██║ ╚████║   ██║
╚═╝  ╚═╝ ╚═════╝ ╚══════╝╚═╝  ╚═══╝   ╚═╝`;

export default function TerminalPanel() {
  const sessionId = useMemo(
    () => globalThis.crypto?.randomUUID?.() ?? `session-${Date.now()}`,
    []
  );
  const [messages, setMessages] = useState<TerminalMessage[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFocused, setIsFocused] = useState(true);
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [userIp, setUserIp] = useState("...");
  const streamingIdRef = useRef<string | null>(null);
  const inputRef = useRef<TerminalInputRef>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const setMatrixActive = useUIStore((state) => state.setMatrixActive);
  const isMatrixActive = useUIStore((state) => state.isMatrixActive);
  
  // Typewriter queue for gradual text display
  const typewriterRef = useRef<TypewriterQueue | null>(null);
  const fullContentRef = useRef<string>("");

  const scrollToBottom = useCallback(() => {
    if (contentRef.current) {
      contentRef.current.scrollTop = contentRef.current.scrollHeight;
    }
  }, []);

  // Fetch user IP on mount
  useEffect(() => {
    fetch("https://api.ipify.org?format=json")
      .then((res) => res.json())
      .then((data) => setUserIp(data.ip))
      .catch(() => setUserIp("127.0.0.1"));
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const handleContainerClick = () => {
    inputRef.current?.focus();
  };

  const handleFunctionCall = useCallback(
    (fn: { name: string; status: ItemStatus }) => {
      const streamingId = streamingIdRef.current;
      if (!streamingId) return;

      setMessages((prev) =>
        prev.map((msg) => {
          if (msg.id !== streamingId) return msg;
          const steps = msg.functionSteps || [];
          const existingIndex = steps.findIndex((s) => s.name === fn.name);

          if (existingIndex >= 0) {
            const updatedSteps = [...steps];
            updatedSteps[existingIndex] = {
              ...updatedSteps[existingIndex],
              status: fn.status,
            };
            return { ...msg, functionSteps: updatedSteps };
          } else {
            return {
              ...msg,
              functionSteps: [
                ...steps,
                { id: `fn-${steps.length}`, name: fn.name, status: fn.status },
              ],
            };
          }
        })
      );
    },
    []
  );

  const handleThinkingComplete = useCallback(() => {
    const streamingId = streamingIdRef.current;
    if (!streamingId) return;
    setMessages((prev) =>
      prev.map((msg) => {
        if (msg.id !== streamingId) return msg;
        return finalizeThinkingMessage(msg);
      })
    );
  }, []);

  const handleStatus = useCallback(
    (status: { phase: "start" | "thinking" | "thinking_complete" }) => {
      const streamingId = streamingIdRef.current;
      if (!streamingId) return;

      if (status.phase === "thinking_complete") {
        handleThinkingComplete();
        return;
      }

      if (status.phase === "thinking") {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === streamingId
              ? { ...msg, status: "thinking" as MessageStatus }
              : msg
          )
        );
      }
    },
    [handleThinkingComplete]
  );

  const handleThought = useCallback(
    (thought: { message: string; status?: ItemStatus }) => {
      const streamingId = streamingIdRef.current;
      if (!streamingId) return;

      const preview = extractThinkingPreview(thought.message);
      if (!preview) return;

      setMessages((prev) =>
        prev.map((msg) => {
          if (msg.id !== streamingId) return msg;
          const thoughts = msg.thoughts || [];
          return {
            ...msg,
            thoughts: [
              ...thoughts,
              {
                id: `thought-${thoughts.length}`,
                message: preview,
                status: thought.status || "completed",
              },
            ],
          };
        })
      );
    },
    []
  );

  const updateMessageContent = useCallback((content: string) => {
    const streamingId = streamingIdRef.current;
    if (!streamingId) return;

    setMessages((prev) =>
      prev.map((msg) => {
        if (msg.id !== streamingId) return msg;
        if (msg.status === "thinking") {
          return {
            ...msg,
            content: content,
            status: "streaming" as MessageStatus,
          };
        }
        return { ...msg, content: content };
      })
    );
  }, []);

  const handleToken = useCallback((token: string) => {
    fullContentRef.current += token;
    
    // Initialize typewriter if not exists
    if (!typewriterRef.current) {
      typewriterRef.current = new TypewriterQueue(
        (content) => updateMessageContent(content),
        { speed: 60, naturalVariation: true }
      );
    }
    
    // Enqueue the new token for typewriter effect
    typewriterRef.current.enqueue(token);
  }, [updateMessageContent]);


  // Handler for TerminalInput component
  const handleSendMessage = async (message: string) => {
    if (!message.trim() || isStreaming) return;
    const trimmed = message.trim();
    setError(null);

    // 1. 检查是否是本地命令
    const localResponse = processLocalCommand(trimmed, { userIp });

    if (localResponse) {
      // 添加用户消息
      const userId = createMessageId("user");
      setMessages((prev) => [
        ...prev,
        { id: userId, role: "user", content: trimmed, status: "completed" as MessageStatus },
      ]);

      // 检查是否需要触发特殊操作
      const action = getCommandAction(localResponse);

      if (action === 'clear-screen') {
        // 清屏
        setMessages([]);
        return;
      }

      if (action === 'contact-modal') {
        // 打开联系弹窗
        setTimeout(() => setIsContactOpen(true), 300);
        return;
      }

      if (action === 'resume-download') {
        // 触发下载（可以在这里添加实际的下载逻辑）
        window.open('/resume.pdf', '_blank');
        return;
      }

      if (action === 'matrix-trigger') {
        // 触发 Matrix 数字雨特效 - 阻塞效果
        // 立即显示特效和所有提示信息
        setMatrixActive(true);

        // 显示所有提示信息（包括运行中和退出提示）
        const runningMsgId = createMessageId("system");
        setMessages((prev) => [
          ...prev,
          {
            id: runningMsgId,
            role: "system",
            content: localResponse.content, // 直接显示完整的提示信息
            status: "completed" as MessageStatus,
          },
        ]);
        return;
      }

      // 添加系统响应
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          localResponse,
        ]);
      }, 100);

      return;
    }

    // 2. 不是本地命令，发送给 AI
    const userId = createMessageId("user");
    const agentId = createMessageId("agent");
    streamingIdRef.current = agentId;

    setMessages((prev) => [
      ...prev,
      { id: userId, role: "user", content: trimmed, status: "completed" as MessageStatus },
      {
        id: agentId,
        role: "agent",
        content: "",
        status: "thinking" as MessageStatus,
        functionSteps: [],
      },
    ]);

    setIsStreaming(true);

    // Create stream handlers
    const handlers: StreamHandlers = {
      onThinkingStart: () => {
        handleStatus({ phase: "thinking" });
      },
      onThinkingDelta: (content) => {
        handleThought({ message: content, status: "running" });
      },
      onThinkingEnd: () => {
        handleThinkingComplete();
      },
      onToolStart: (tool) => {
        handleFunctionCall({ name: tool.toolName, status: "running" });
      },
      onToolEnd: (tool) => {
        handleFunctionCall({ name: tool.toolName, status: tool.status });
      },
      onResponseDelta: (content) => {
        handleToken(content);
      },
      onResponseEnd: () => {
        // Will be completed in onComplete
      },
      onComplete: () => {
        const id = streamingIdRef.current;
        const finalContent = fullContentRef.current;
        
        const finalizeMessage = () => {
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === id
                ? {
                  ...msg,
                  content: finalContent,
                  status: "completed" as MessageStatus,
                }
              : msg
            )
          );
          setIsStreaming(false);
          streamingIdRef.current = null;
          fullContentRef.current = "";
          typewriterRef.current = null;
        };
        
        // Complete the typewriter animation and then finalize
        if (typewriterRef.current) {
          typewriterRef.current.completeWithCallback(finalizeMessage);
        } else {
          finalizeMessage();
        }
      },
      onError: (message) => {
        // Cancel any ongoing typewriter animation
        if (typewriterRef.current) {
          typewriterRef.current.cancel();
        }
        
        const id = streamingIdRef.current;
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === id
              ? {
                  ...msg,
                  status: "error" as MessageStatus,
                }
              : msg
          )
        );
        setIsStreaming(false);
        setError(message);
        streamingIdRef.current = null;
        fullContentRef.current = "";
        typewriterRef.current = null;
      },
    };

    await streamChat(trimmed, sessionId, handlers);
  };

  return (
    <div className="cli-terminal" onClick={handleContainerClick}>
      <div className="crt-overlay" />

      <div className="cli-header">
        <div className="cli-traffic-lights">
          <span className="light red" />
          <span className="light yellow" />
          <span className="light green" />
        </div>

        <div className="cli-header-center">
          <div className="cli-hero-badge">
            <span className="cli-status-dot-inline" />
            <span>Full Stack Agent Engineer</span>
          </div>
        </div>

        <div className="cli-header-spacer" />
        <div className="cli-header-actions">
          <button
            type="button"
            className="cli-btn cli-btn-primary cli-btn-small"
            onClick={() => setIsContactOpen(true)}
          >
            <Mail size={14} />
            <span>Contact</span>
          </button>
          <button
            type="button"
            className="cli-btn cli-btn-secondary cli-btn-small"
          >
            <Download size={14} />
            <span>Resume</span>
          </button>
        </div>
      </div>

      <div className="cli-content" ref={contentRef}>
        {/* ASCII Logo */}
        <pre className="cli-ascii-logo">{ASCII_LOGO}</pre>

        {/* Terminal Hero - MOTD Section */}
        <div className="cli-motd">
          {/* Bio */}
          <p className="cli-hero-bio">
            Building AI-powered interfaces and backend systems. Passionate about
            clean code, elegant solutions, and the intersection of design and
            engineering.
          </p>
        </div>

        {messages.map((msg) => (
          <div key={msg.id} className="cli-message">
            {msg.role === "user" ? (
              <div className="cli-user-line">
                <span className="cli-arrow">➜</span>
                <span className="cli-path">~</span>
                <span className="cli-command terminal-text">{msg.content}</span>
              </div>
            ) : msg.role === "system" ? (
              <div className="cli-system-line">{msg.content}</div>
            ) : (
              <div className="cli-agent-response">
                {/* Show thinking chain above content while it exists */}
                {shouldShowThinking(msg) && msg.functionSteps && (
                  <ThinkingChain steps={msg.functionSteps} />
                )}

                {/* Show thoughts above content while they exist */}
                {shouldShowThinking(msg) &&
                  msg.thoughts &&
                  msg.thoughts.length > 0 && (
                    <div className="cli-thoughts">
                      {msg.thoughts.map((t) => (
                        <div
                          key={t.id}
                          className={`cli-thought-line ${t.status}`}
                        >
                          <span className="cli-thought-bullet">›</span>
                          <span className="cli-thought-msg">{t.message}</span>
                          {t.status === "running" && (
                            <span className="cli-thought-dots">...</span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                {/* Show content when streaming or completed */}
                {msg.content && (
                  <div className="cli-response-content terminal-text">
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>
                )}

                {msg.status === "streaming" && (
                  <span className="cli-streaming-cursor">▊</span>
                )}
              </div>
            )}
          </div>
        ))}

        {error && (
          <div className="cli-error-line">
            <span className="cli-error-prefix">[ERROR]</span>
            <span className="cli-error-msg">{error}</span>
          </div>
        )}

        {!isStreaming && !isMatrixActive && (
          <TerminalInput
            ref={inputRef}
            onSend={handleSendMessage}
            isStreaming={isStreaming}
            onFocusChange={setIsFocused}
          />
        )}
      </div>

      <StatusBar isInputFocused={isFocused} />
      <ContactModal
        isOpen={isContactOpen}
        onClose={() => setIsContactOpen(false)}
      />
    </div>
  );
}
