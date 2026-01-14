/**
 * 统一的消息流状态定义
 * 前后端共享的统一状态规范
 */

/**
 * 消息生命周期状态
 */
export type MessageStatus =
  | "thinking"      // 正在思考（工具调用、思维链等）
  | "streaming"     // 正在流式输出内容
  | "completed"     // 完成
  | "error";        // 错误

/**
 * SSE流事件类型（后端发送）
 */
export type StreamEventType =
  | "token"              // 文本内容
  | "delta"              // 增量文本内容
  | "function_call"      // 工具调用事件（用于思维链）
  | "thought"            // 思维日志
  | "status"             // 阶段状态
  | "thinking_complete"  // 思考阶段完成
  | "complete"           // 整体完成
  | "error";             // 错误

/**
 * 子项状态（用于function_call和thought）
 */
export type ItemStatus =
  | "running"     // 执行中
  | "completed"   // 已完成
  | "failed";     // 失败

/**
 * 工具调用步骤
 */
export type FunctionStep = {
  id: string;
  name: string;
  status: ItemStatus;
};

/**
 * 思维日志
 */
export type ThoughtLog = {
  id: string;
  message: string;
  status: ItemStatus;
};

/**
 * 终端消息
 */
export type TerminalMessage = {
  id: string;
  role: "user" | "agent" | "system";
  content: string;
  status: MessageStatus;
  functionSteps?: FunctionStep[];
  thoughts?: ThoughtLog[];
};

/**
 * SSE事件结构
 */
export type StreamEvent =
  | { type: "token"; content: string }
  | { type: "delta"; content: string }
  | { type: "function_call"; name: string; status: ItemStatus }
  | { type: "thought"; message: string; status?: ItemStatus }
  | { type: "status"; phase: "start" | "thinking" | "thinking_complete" }
  | { type: "thinking_complete" }
  | { type: "complete" }
  | { type: "error"; message: string };

/**
 * 流处理回调
 */
export type StreamHandlers = {
  onToken: (token: string) => void;
  onFunctionCall?: (fn: { name: string; status: ItemStatus }) => void;
  onThought?: (thought: { message: string; status?: ItemStatus }) => void;
  onStatus?: (status: { phase: "start" | "thinking" | "thinking_complete" }) => void;
  onThinkingComplete?: () => void;
  onComplete: () => void;
  onError: (message: string) => void;
};
