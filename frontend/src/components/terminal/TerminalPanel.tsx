"use client";

import { useMemo, useRef, useState } from "react";
import { Mail, Download } from "lucide-react";
import profile from "@/data/profile.json";
import ContactModal from "./ContactModal";
import { StatusBar } from "./StatusBar";
import TerminalConversation, {
  TerminalConversationRef,
} from "./TerminalConversation";
import { useUIStore } from "@/stores/ui-store";

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
        <div className="cli-traffic-lights" aria-hidden="true">
          <span className="light red" />
          <span className="light yellow" />
          <span className="light green" />
        </div>
        <div className="cli-header-center">
          <div className="cli-hero-info">
            <div className="cli-hero-badge">
              <span className="cli-status-dot-inline" aria-hidden="true" />
              <span>{profile.hero.role}</span>
            </div>
          </div>
        </div>
        <div className="cli-header-actions">
          <button
            className="cli-btn cli-btn-primary cli-btn-small"
            onClick={(event) => {
              event.stopPropagation();
              setIsContactOpen(true);
            }}
          >
            <Mail size={16} />
            Contact
          </button>
          <button
            className="cli-btn cli-btn-secondary cli-btn-small"
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
