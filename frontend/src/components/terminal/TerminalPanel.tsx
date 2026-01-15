"use client";

import { useMemo, useRef, useState } from "react";
import { Mail, Download } from "lucide-react";
import ContactModal from "./ContactModal";
import { StatusBar } from "./StatusBar";
import TerminalConversation, {
  TerminalConversationRef,
} from "./TerminalConversation";
import { useUIStore } from "@/store/ui-store";

export default function TerminalPanel() {
  const sessionId = useMemo(
    () => globalThis.crypto?.randomUUID?.() ?? `session-${Date.now()}`,
    []
  );
  const [isFocused, setIsFocused] = useState(true);
  const [isContactOpen, setIsContactOpen] = useState(false);
  const setMatrixActive = useUIStore((state) => state.setMatrixActive);
  const isMatrixActive = useUIStore((state) => state.isMatrixActive);
  const conversationRef = useRef<TerminalConversationRef>(null);

  const handleContainerClick = () => {
    conversationRef.current?.focus();
  };

  return (
    <div className="cli-terminal" onClick={handleContainerClick}>
      <div className="crt-overlay"></div>

      <div className="cli-header">
        <div className="cli-title">
          <span className="cli-prompt">$</span> portfolio-terminal
        </div>
        <div className="cli-actions">
          <button
            className="cli-action-btn"
            onClick={(event) => {
              event.stopPropagation();
              setIsContactOpen(true);
            }}
          >
            <Mail size={16} />
            Contact
          </button>
          <button
            className="cli-action-btn"
            onClick={(event) => {
              event.stopPropagation();
              window.open("/resume.pdf", "_blank");
            }}
          >
            <Download size={16} />
            Resume
          </button>
        </div>
      </div>

      <TerminalConversation
        ref={conversationRef}
        sessionId={sessionId}
        isMatrixActive={isMatrixActive}
        setMatrixActive={setMatrixActive}
        onOpenContact={() => setIsContactOpen(true)}
        onInputFocusChange={setIsFocused}
      />

      <StatusBar isInputFocused={isFocused} />

      <ContactModal
        isOpen={isContactOpen}
        onClose={() => setIsContactOpen(false)}
      />
    </div>
  );
}
