"use client";

import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { StatusBar } from "./StatusBar";
import TerminalConversation, {
  TerminalConversationRef,
} from "./TerminalConversation";
import { useUIStore } from "@/stores/ui-store";

const SESSION_STORAGE_KEY = "portfolio-chat-session";
const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default function TerminalPanel() {
  const [sessionId] = useState<string | null>(() => {
    if (typeof window === "undefined") return null;
    try {
      let id = window.localStorage.getItem(SESSION_STORAGE_KEY);
      if (!id || !UUID_RE.test(id)) {
        id = crypto.randomUUID();
        window.localStorage.setItem(SESSION_STORAGE_KEY, id);
      }
      return id;
    } catch {
      return globalThis.crypto?.randomUUID?.() ?? null;
    }
  });
  const [isFocused, setIsFocused] = useState(true);
  const setMatrixActive = useUIStore((state) => state.setMatrixActive);
  const isMatrixActive = useUIStore((state) => state.isMatrixActive);
  const conversationRef = useRef<TerminalConversationRef>(null);

  const handleContainerClick = () => {
    conversationRef.current?.focus();
  };

  // Open contact modal via global event
  const handleOpenContact = () => {
    window.dispatchEvent(new CustomEvent('openContact'));
  };

  return (
    <motion.div
      className="cli-terminal"
      onClick={handleContainerClick}
      initial={{ opacity: 0, scale: 0.95, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{
        duration: 0.6,
        ease: [0.22, 1, 0.36, 1], // Custom cubic-bezier for smooth "Apple-like" easing
        delay: 0.1
      }}
    >
      <div className="crt-overlay"></div>

      <div className="cli-header">
        <div className="cli-traffic-lights" aria-hidden="true">
          <span className="light red" />
          <span className="light yellow" />
          <span className="light green" />
        </div>
        <div className="cli-header-center flex items-center justify-center">
          <span className="font-mono text-xs text-zinc-600 tracking-wide">
            yiwang@dev: ~/portfolio
          </span>
        </div>
        {/* Spacer for balanced layout */}
        <div className="cli-header-spacer" />
      </div>

      <TerminalConversation
        key={sessionId ?? "pending"}
        ref={conversationRef}
        sessionId={sessionId ?? undefined}
        isMatrixActive={isMatrixActive}
        setMatrixActive={setMatrixActive}
        onOpenContact={handleOpenContact}
        onInputFocusChange={setIsFocused}
      />

      <StatusBar isInputFocused={isFocused} />
    </motion.div>
  );
}
