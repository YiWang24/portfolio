// Message Types
export interface ToolLog {
  id: string;
  name: string;
  status: "executing" | "success" | "error";
  message?: string;
}

export interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
  toolLogs?: ToolLog[];
}

// Chat Store Interface
export interface ChatStore {
  messages: Message[];
  isStreaming: boolean;
  currentSessionId: string | null;

  // Actions
  addMessage: (message: Omit<Message, "id" | "timestamp">) => void;
  updateLastMessage: (content: string) => void;
  setStreaming: (streaming: boolean) => void;
  addToolLog: (messageId: string, log: Omit<ToolLog, "id">) => void;
  updateToolLog: (
    messageId: string,
    logId: string,
    status: ToolLog["status"]
  ) => void;
  clearMessages: () => void;
  setSessionId: (sessionId: string) => void;
}

// Bio Data Interface
export interface BioData {
  name: string;
  role: string;
  bio: string;
  avatar?: string;
  stats: {
    yearsExp: string;
    projects: string;
    commits: string;
    stars: string;
  };
  links: {
    github?: string;
    linkedin?: string;
    email?: string;
  };
}

// Suggestion Chip Interface
export interface SuggestionChip {
  icon: string;
  label: string;
  command: string;
}
