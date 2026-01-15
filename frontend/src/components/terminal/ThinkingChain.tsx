"use client";

import {
  Bot,
  Database,
  Globe,
  Search,
  Sparkles,
  FileText,
  Code,
  Cpu,
} from "lucide-react";
import type { FunctionStep, ItemStatus } from "@/types/message";

type Props = {
  steps: FunctionStep[];
};

// 根据函数名称获取对应的图标和显示名称
function getFunctionMeta(name: string): { icon: typeof Search; label: string } {
  const nameLower = name.toLowerCase();

  if (nameLower.includes("search") || nameLower.includes("query")) {
    if (nameLower.includes("web")) {
      return { icon: Globe, label: "Web Search" };
    }
    if (nameLower.includes("semantic")) {
      return { icon: Search, label: "Semantic Search" };
    }
    return { icon: Search, label: "Searching" };
  }

  if (nameLower.includes("profile") || nameLower.includes("developer")) {
    return { icon: Bot, label: "Load Profile" };
  }

  if (nameLower.includes("database") || nameLower.includes("db")) {
    return { icon: Database, label: "Query Database" };
  }

  if (
    nameLower.includes("file") ||
    nameLower.includes("read") ||
    nameLower.includes("document")
  ) {
    return { icon: FileText, label: "Read Document" };
  }

  if (nameLower.includes("code") || nameLower.includes("analyze")) {
    return { icon: Code, label: "Analyze Code" };
  }

  if (nameLower.includes("process") || nameLower.includes("compute")) {
    return { icon: Cpu, label: "Processing" };
  }

  // 默认：将 camelCase 转换为可读格式
  const readable = name
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (str) => str.toUpperCase())
    .trim();

  return { icon: Sparkles, label: readable };
}

// 将ItemStatus映射到CSS类名
function getStatusClass(status: ItemStatus): string {
  switch (status) {
    case "running":
      return "calling";
    case "completed":
      return "complete";
    case "failed":
      return "error";
    default:
      return "calling";
  }
}

export default function ThinkingChain({ steps }: Props) {
  if (!steps || steps.length === 0) {
    return (
      <div className="thinking-chain">
        <div className="thinking-card">
          <div className="thinking-header">
            <Sparkles className="thinking-header-icon" />
            <span>Thinking</span>
          </div>
          <div className="thinking-step calling">
            <div className="thinking-step-icon calling">
              <div className="thinking-spinner" />
            </div>
            <div className="thinking-step-content">
              <span className="thinking-step-label">Initializing</span>
            </div>
            <span className="thinking-step-dots">...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="thinking-chain">
      <div className="thinking-card">
        <div className="thinking-header">
          <Sparkles className="thinking-header-icon" />
          <span>Thinking</span>
        </div>
        <div className="thinking-steps">
          {steps.map((step) => {
            const { icon: Icon, label } = getFunctionMeta(step.name);
            const isRunning = step.status === "running";
            const statusClass = getStatusClass(step.status);

            return (
              <div key={step.id} className={`thinking-step ${statusClass}`}>
                <div className={`thinking-step-icon ${statusClass}`}>
                  {isRunning ? (
                    <div className="thinking-spinner" />
                  ) : (
                    <Icon size={12} />
                  )}
                </div>
                <div className="thinking-step-content">
                  <span className="thinking-step-label">{label}</span>
                  <span className="thinking-step-name">{step.name}</span>
                </div>
                {step.status === "completed" && (
                  <span className="thinking-step-check">✓</span>
                )}
                {step.status === "failed" && (
                  <span className="thinking-step-error">✗</span>
                )}
                {isRunning && <span className="thinking-step-dots">...</span>}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
