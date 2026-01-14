import { create } from "zustand";
import type { ChatStore, Message, ToolLog } from "../types";

export const useChatStore = create<ChatStore>((set) => ({
  messages: [],
  isStreaming: false,
  currentSessionId: null,

  addMessage: (message: Omit<Message, "id" | "timestamp">) =>
    set((state) => ({
      messages: [
        ...state.messages,
        {
          ...message,
          id: crypto.randomUUID(),
          timestamp: new Date(),
        },
      ],
    })),

  updateLastMessage: (content: string) =>
    set((state) => {
      const messages = [...state.messages];
      if (messages.length > 0) {
        messages[messages.length - 1] = {
          ...messages[messages.length - 1],
          content: messages[messages.length - 1].content + content,
        };
      }
      return { messages };
    }),

  setStreaming: (streaming: boolean) => set({ isStreaming: streaming }),

  addToolLog: (messageId: string, log: Omit<ToolLog, "id">) =>
    set((state) => ({
      messages: state.messages.map((msg) =>
        msg.id === messageId
          ? {
              ...msg,
              toolLogs: [
                ...(msg.toolLogs || []),
                { ...log, id: crypto.randomUUID() },
              ],
            }
          : msg
      ),
    })),

  updateToolLog: (
    messageId: string,
    logId: string,
    status: ToolLog["status"]
  ) =>
    set((state) => ({
      messages: state.messages.map((msg) =>
        msg.id === messageId
          ? {
              ...msg,
              toolLogs: msg.toolLogs?.map((log) =>
                log.id === logId ? { ...log, status } : log
              ),
            }
          : msg
      ),
    })),

  clearMessages: () => set({ messages: [] }),

  setSessionId: (sessionId: string) => set({ currentSessionId: sessionId }),
}));
