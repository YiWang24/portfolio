"use client";

import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import ReactMarkdown from "react-markdown";
import rehypeSanitize from "rehype-sanitize";
import { useChat } from "@ai-sdk/react";
import {
  DefaultChatTransport,
  lastAssistantMessageIsCompleteWithToolCalls,
  type UIMessage,
} from "ai";
import { createMessageId } from "../../utils/terminal";
import {
  processLocalCommand,
  getCommandAction,
} from "../../lib/command-processor";
import ThinkingChain from "./ThinkingChain";
import { TerminalInput, TerminalInputRef } from "./TerminalInput";
import { shouldShowThinking } from "@/utils/thinking";
import { uiMessageToTerminal } from "@/utils/uiMessageToTerminal";
import type { MessageStatus, TerminalMessage } from "@/types/message";
import { TerminalBio } from "./TerminalBio";
import { motion, useAnimation } from "framer-motion";
import { safeOpenUrl } from "@/lib/utils/validation";

export type TerminalConversationRef = {
  focus: () => void;
};

type TerminalConversationProps = {
  sessionId?: string;
  isMatrixActive: boolean;
  setMatrixActive: (active: boolean) => void;
  onOpenContact: () => void;
  onInputFocusChange?: (focused: boolean) => void;
};

const ASCII_LOGO = `
██╗   ██╗██╗    █████╗  ██████╗ ███████╗███╗   ██╗████████╗
╚██╗ ██╔╝██║    ██╔══██╗██╔════╝ ██╔════╝████╗  ██║╚══██╔══╝
 ╚████╔╝ ██║    ███████║██║  ███╗█████╗  ██╔██╗ ██║   ██║
  ╚██╔╝  ██║    ██╔══██║██║   ██║██╔══╝  ██║╚██╗██║   ██║
   ██║   ██║    ██║  ██║╚██████╔╝███████╗██║ ╚████║   ██║
   ╚═╝   ╚═╝    ╚═╝  ╚═╝ ╚═════╝ ╚══════╝╚═╝  ╚═══╝   ╚═╝`;

function NeonFlickerLogo() {
  const controls = useAnimation();

  useEffect(() => {
    const sequence = async () => {
      await controls.start({
        opacity: [0, 1, 0, 1, 0.1, 1, 0, 0.8, 0.2, 1],
        filter: [
          "brightness(0) blur(2px)",
          "brightness(3) blur(0px)",
          "brightness(0) blur(2px)",
          "brightness(2.5) blur(0px)",
          "brightness(0.2) blur(1px)",
          "brightness(2) blur(0px)",
          "brightness(0) blur(2px)",
          "brightness(1.5) blur(0px) drop-shadow(0 0 10px rgba(16, 185, 129, 0.8))",
          "brightness(0.5) blur(0.5px)",
          "brightness(1.2) blur(0px) drop-shadow(0 0 8px rgba(16, 185, 129, 0.8))",
        ],
        scale: [0.99, 1.02, 0.99, 1.01, 1, 1.01, 0.99, 1.02, 1, 1],
        transition: {
          duration: 0.8,
          times: [0, 0.1, 0.2, 0.3, 0.35, 0.5, 0.6, 0.7, 0.9, 1],
          ease: "easeInOut",
        },
      });

      while (true) {
        const waitTime = Math.random() * 7000 + 3000;
        await new Promise((resolve) => setTimeout(resolve, waitTime));

        await controls.start({
          opacity: [1, 0.8, 1, 0.5, 1],
          filter: [
            "brightness(1.2) blur(0px) drop-shadow(0 0 8px rgba(16, 185, 129, 0.8))",
            "brightness(0.8) blur(0.5px)",
            "brightness(1.5) blur(0px) drop-shadow(0 0 12px rgba(16, 185, 129, 1))",
            "brightness(0.6) blur(1px)",
            "brightness(1.2) blur(0px) drop-shadow(0 0 8px rgba(16, 185, 129, 0.8))",
          ],
          scale: [1, 1.01, 0.995, 1],
          transition: { duration: 0.15, ease: "linear" },
        });
      }
    };

    sequence();
  }, [controls]);

  return (
    <motion.div
      initial={{ opacity: 0, filter: "brightness(0) blur(1px)" }}
      animate={controls}
      className="cli-ascii-logo relative"
    >
      <pre className="relative z-10 bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-500 text-transparent bg-clip-text font-bold">
        {ASCII_LOGO}
      </pre>
      <pre className="absolute inset-0 text-emerald-500/20 blur-sm select-none z-0">
        {ASCII_LOGO}
      </pre>
    </motion.div>
  );
}

const TerminalConversation = forwardRef<
  TerminalConversationRef,
  TerminalConversationProps
>(
  (
    {
      sessionId: sessionIdProp,
      isMatrixActive,
      setMatrixActive,
      onOpenContact,
      onInputFocusChange,
    },
    ref
  ) => {
    const sessionId = useMemo(
      () =>
        sessionIdProp ??
        (globalThis.crypto?.randomUUID?.() ?? `session-${Date.now()}`),
      [sessionIdProp]
    );

    const [localMessages, setLocalMessages] = useState<TerminalMessage[]>([]);
    const [userIp, setUserIp] = useState("...");
    const inputRef = useRef<TerminalInputRef>(null);
    const contentRef = useRef<HTMLDivElement>(null);

    const transport = useMemo(
      () => new DefaultChatTransport<UIMessage>({ api: "/api/chat" }),
      []
    );

    const {
      messages: aiMessages,
      sendMessage,
      setMessages,
      addToolResult,
      status,
      error,
    } = useChat({
      id: sessionId,
      transport,
      sendAutomaticallyWhen: lastAssistantMessageIsCompleteWithToolCalls,
    });

    const isStreaming = status === "submitted" || status === "streaming";

    const historyLoadedRef = useRef(false);
    useEffect(() => {
      if (!sessionIdProp || historyLoadedRef.current) return;
      historyLoadedRef.current = true;
      fetch(`/api/chat/history?sessionId=${encodeURIComponent(sessionIdProp)}`)
        .then((res) => (res.ok ? res.json() : { messages: [] }))
        .then((data: { messages?: UIMessage[] }) => {
          const restored = data.messages ?? [];
          if (restored.length === 0) return;
          setMessages(restored);
          setLocalMessages(
            restored.map((m) =>
              m.role === "user"
                ? {
                    id: m.id,
                    role: "user" as const,
                    content: m.parts
                      .filter(
                        (p): p is { type: "text"; text: string } =>
                          p.type === "text"
                      )
                      .map((p) => p.text)
                      .join(""),
                    status: "completed" as MessageStatus,
                  }
                : uiMessageToTerminal(m, "completed")
            )
          );
        })
        .catch(() => {});
    }, [sessionIdProp, setMessages]);

    type PendingApproval = {
      toolCallId: string;
      message?: string;
      replyTo?: string;
    };

    const findPendingApproval = (): PendingApproval | null => {
      const last = aiMessages[aiMessages.length - 1];
      if (!last || last.role !== "assistant") return null;
      for (const part of last.parts) {
        if (part.type !== "tool-sendContactMessage") continue;
        const toolPart = part as {
          state?: string;
          toolCallId?: string;
          input?: { message?: string; replyTo?: string };
        };
        if (toolPart.state === "input-available" && toolPart.toolCallId) {
          return {
            toolCallId: toolPart.toolCallId,
            message: toolPart.input?.message,
            replyTo: toolPart.input?.replyTo,
          };
        }
      }
      return null;
    };
    const pendingApproval = findPendingApproval();

    const handleApproval = async (approved: boolean) => {
      if (!pendingApproval) return;
      await addToolResult({
        tool: "sendContactMessage",
        toolCallId: pendingApproval.toolCallId,
        output: approved ? "approve" : "deny",
      });
    };

    useImperativeHandle(ref, () => ({
      focus: () => {
        inputRef.current?.focus();
      },
    }));

    const scrollToBottom = useCallback(() => {
      if (contentRef.current) {
        contentRef.current.scrollTop = contentRef.current.scrollHeight;
      }
    }, []);

    useEffect(() => {
      fetch("https://api.ipify.org?format=json")
        .then((res) => res.json())
        .then((data) => setUserIp(data.ip))
        .catch(() => setUserIp("127.0.0.1"));
    }, []);

    useEffect(() => {
      scrollToBottom();
    }, [localMessages, aiMessages, scrollToBottom]);

    // Sync AI assistant messages into local terminal message list
    useEffect(() => {
      setLocalMessages((prev) => {
        let next = prev;
        for (const ai of aiMessages) {
          if (ai.role !== "assistant") continue;
          const isLast =
            aiMessages[aiMessages.length - 1]?.id === ai.id;
          const messageStatus: MessageStatus =
            status === "error" && isLast
              ? "error"
              : isStreaming && isLast
                ? ai.parts.some((p) => p.type === "text")
                  ? "streaming"
                  : "thinking"
                : "completed";

          const derived = uiMessageToTerminal(ai, messageStatus);
          const idx = next.findIndex((m) => m.id === ai.id);
          if (idx === -1) {
            next = [...next, derived];
          } else if (
            next[idx].content !== derived.content ||
            next[idx].status !== derived.status ||
            JSON.stringify(next[idx].functionSteps) !==
              JSON.stringify(derived.functionSteps) ||
            JSON.stringify(next[idx].thoughts) !==
              JSON.stringify(derived.thoughts)
          ) {
            const replaced = [...next];
            replaced[idx] = derived;
            next = replaced;
          }
        }
        return next;
      });
    }, [aiMessages, status, isStreaming]);

    const handleSendMessage = async (message: string) => {
      if (!message.trim() || isStreaming) return;
      const trimmed = message.trim();

      const localResponse = processLocalCommand(trimmed, { userIp });
      if (localResponse) {
        const userId = createMessageId("user");
        setLocalMessages((prev) => [
          ...prev,
          {
            id: userId,
            role: "user",
            content: trimmed,
            status: "completed" as MessageStatus,
          },
        ]);

        const action = getCommandAction(localResponse);

        if (action === "clear-screen") {
          setLocalMessages([]);
          return;
        }
        if (action === "contact-modal") {
          setTimeout(() => onOpenContact(), 300);
          return;
        }
        if (action === "resume-download") {
          safeOpenUrl("/resume.pdf");
          return;
        }
        if (action === "matrix-trigger") {
          setMatrixActive(true);
          setLocalMessages((prev) => [
            ...prev,
            {
              id: createMessageId("system"),
              role: "system",
              content: localResponse.content,
              status: "completed" as MessageStatus,
            },
          ]);
          return;
        }

        setTimeout(() => {
          setLocalMessages((prev) => [...prev, localResponse]);
        }, 100);
        return;
      }

      // AI path — append user message locally, then trigger useChat send
      setLocalMessages((prev) => [
        ...prev,
        {
          id: createMessageId("user"),
          role: "user",
          content: trimmed,
          status: "completed" as MessageStatus,
        },
      ]);

      try {
        await sendMessage({ text: trimmed });
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to send message";
        setLocalMessages((prev) => [
          ...prev,
          {
            id: createMessageId("error"),
            role: "system",
            content: `Error: ${errorMessage}`,
            status: "error",
          },
        ]);
      }
    };

    const displayError = error?.message ?? null;

    return (
      <div className="cli-content" ref={contentRef}>
        <NeonFlickerLogo />
        <TerminalBio />

        {localMessages.map((msg) => (
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
                {msg.functionSteps && msg.functionSteps.length > 0 ? (
                  <ThinkingChain steps={msg.functionSteps} />
                ) : msg.status === "thinking" &&
                  !msg.content &&
                  !msg.thoughts?.length ? (
                  <ThinkingChain steps={[]} />
                ) : null}

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
                          <span className="cli-thought-msg">
                            Think: {t.message}
                          </span>
                          {t.status === "running" && (
                            <span className="cli-thought-dots">...</span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                {msg.content && (
                  <div className="cli-response-content terminal-text">
                    <ReactMarkdown rehypePlugins={[rehypeSanitize]}>
                      {msg.content}
                    </ReactMarkdown>
                  </div>
                )}

                {msg.status === "streaming" && (
                  <span className="cli-streaming-cursor">▊</span>
                )}
              </div>
            )}
          </div>
        ))}

        {isStreaming &&
          localMessages[localMessages.length - 1]?.role !== "agent" && (
            <div className="cli-message">
              <div className="cli-agent-response">
                <ThinkingChain steps={[]} />
              </div>
            </div>
          )}

        {pendingApproval && (
          <div className="cli-message">
            <div className="cli-agent-response">
              <div className="border border-emerald-500/40 rounded p-3 my-2 font-mono text-sm">
                <div className="text-emerald-400 mb-1">
                  Confirm: send this message to Yi Wang?
                </div>
                {pendingApproval.message && (
                  <div className="text-zinc-300 mb-1">
                    &quot;{pendingApproval.message}&quot;
                  </div>
                )}
                {pendingApproval.replyTo && (
                  <div className="text-zinc-500 mb-1">
                    reply-to: {pendingApproval.replyTo}
                  </div>
                )}
                <div className="flex gap-4 mt-2">
                  <button
                    type="button"
                    className="text-emerald-400 hover:text-emerald-300 underline"
                    onClick={() => handleApproval(true)}
                  >
                    [Y] Send it
                  </button>
                  <button
                    type="button"
                    className="text-red-400 hover:text-red-300 underline"
                    onClick={() => handleApproval(false)}
                  >
                    [N] Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {displayError && (
          <div className="cli-error-line">
            <span className="cli-error-prefix">[ERROR]</span>
            <span className="cli-error-msg">{displayError}</span>
          </div>
        )}

        {!isStreaming && !isMatrixActive && !pendingApproval && (
          <TerminalInput
            ref={inputRef}
            onSend={handleSendMessage}
            isStreaming={isStreaming}
            onFocusChange={onInputFocusChange}
          />
        )}
      </div>
    );
  }
);

TerminalConversation.displayName = "TerminalConversation";

export default TerminalConversation;
