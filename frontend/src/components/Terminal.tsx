"use client";

import { useEffect, useRef, useState } from "react";
import { Terminal } from "@xterm/xterm";
import { FitAddon } from "@xterm/addon-fit";
import "@xterm/xterm/css/xterm.css";
import { useChatStore } from "../stores/chatStore";
import SuggestionChips, { defaultChips } from "./SuggestionChips";

interface TerminalProps {
  onCommand?: (
    command: string,
    onToken: (token: string) => void,
    onComplete: () => void,
    onError: (error: string) => void
  ) => void;
}

export default function TerminalComponent({ onCommand }: TerminalProps) {
  const terminalRef = useRef<HTMLDivElement>(null);
  const terminal = useRef<Terminal | null>(null);
  const fitAddon = useRef<FitAddon | null>(null);
  const [currentLine, setCurrentLine] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const { addMessage, setStreaming } = useChatStore();

  useEffect(() => {
    if (!terminalRef.current) return;

    terminal.current = new Terminal({
      cursorBlink: true,
      cursorStyle: "block",
      fontSize: 13,
      fontFamily: "JetBrains Mono, monospace",
      lineHeight: 1.5,
      theme: {
        background: "transparent",
        foreground: "#e5e7eb",
        cursor: "#10B981",
        cursorAccent: "#050505",
        selectionBackground: "#10B98140",
        black: "#1f2937",
        red: "#ef4444",
        green: "#10B981",
        yellow: "#f59e0b",
        blue: "#3b82f6",
        magenta: "#8B5CF6",
        cyan: "#06b6d4",
        white: "#f3f4f6",
      },
    });

    fitAddon.current = new FitAddon();
    terminal.current.loadAddon(fitAddon.current);
    terminal.current.open(terminalRef.current);
    fitAddon.current.fit();

    // Welcome message
    terminal.current.writeln("");
    terminal.current.writeln(
      "\x1b[32m  ╭──────────────────────────────────────╮\x1b[0m"
    );
    terminal.current.writeln(
      "\x1b[32m  │   \x1b[1mDigital Twin Agent v2.0\x1b[0m\x1b[32m           │\x1b[0m"
    );
    terminal.current.writeln(
      "\x1b[32m  │   AI-Powered Portfolio Interface    │\x1b[0m"
    );
    terminal.current.writeln(
      "\x1b[32m  ╰──────────────────────────────────────╯\x1b[0m"
    );
    terminal.current.writeln("");
    terminal.current.writeln(
      "  \x1b[90mType a message or use quick actions above.\x1b[0m"
    );
    terminal.current.writeln("");
    writePrompt();

    terminal.current.onData((data) => {
      if (isProcessing) return;
      const code = data.charCodeAt(0);

      if (code === 13) {
        terminal.current?.writeln("");
        if (currentLine.trim()) {
          handleCommand(currentLine.trim());
        } else {
          writePrompt();
        }
        setCurrentLine("");
      } else if (code === 127) {
        if (currentLine.length > 0) {
          terminal.current?.write("\b \b");
          setCurrentLine((prev) => prev.slice(0, -1));
        }
      } else if (code >= 32) {
        terminal.current?.write(data);
        setCurrentLine((prev) => prev + data);
      }
    });

    const handleResize = () => fitAddon.current?.fit();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      terminal.current?.dispose();
    };
  }, []);

  const writePrompt = () => {
    terminal.current?.write("\x1b[32m❯\x1b[0m ");
  };

  const handleCommand = (command: string) => {
    setIsProcessing(true);
    setStreaming(true);

    // Add user message to store
    addMessage({ role: "user", content: command });

    // Show user input
    terminal.current?.writeln(`\x1b[90m> ${command}\x1b[0m`);
    terminal.current?.writeln("");

    // Show thinking state
    terminal.current?.write("\x1b[35m[⚙️ Processing...]\x1b[0m");

    if (onCommand) {
      let responseContent = "";
      onCommand(
        command,
        (token: string) => {
          if (terminal.current) {
            terminal.current.write("\r\x1b[K");
            terminal.current.write(token);
          }
          responseContent += token;
        },
        () => {
          // Add assistant message to store
          addMessage({ role: "assistant", content: responseContent });
          terminal.current?.writeln("");
          terminal.current?.writeln("");
          writePrompt();
          setIsProcessing(false);
          setStreaming(false);
        },
        (error: string) => {
          terminal.current?.write("\r\x1b[K");
          terminal.current?.writeln(`\x1b[31m[✗ Error: ${error}]\x1b[0m`);
          terminal.current?.writeln("");
          addMessage({ role: "system", content: `Error: ${error}` });
          fallbackResponse(command);
        }
      );
    } else {
      terminal.current?.write("\r\x1b[K");
      fallbackResponse(command);
    }
  };

  const fallbackResponse = (message: string) => {
    const lower = message.toLowerCase();
    let response = "";

    if (
      lower.includes("skill") ||
      lower.includes("tech") ||
      lower.includes("stack")
    ) {
      response =
        "My core stack: Java/Spring Boot, React/Next.js, TypeScript, PostgreSQL, and AI/ML integration. I specialize in building scalable full-stack applications.";
    } else if (lower.includes("project") || lower.includes("work")) {
      response =
        "I've built 50+ projects including AI-powered applications, microservices architectures, and real-time data platforms. This portfolio itself is one of them!";
    } else if (lower.includes("github") || lower.includes("repo")) {
      response =
        "Check out my GitHub for open-source contributions. I have 100+ stars across various repositories focusing on Java, React, and AI tools.";
    } else if (
      lower.includes("contact") ||
      lower.includes("hire") ||
      lower.includes("email")
    ) {
      response =
        "I'm open for opportunities! Reach me at: developer@portfolio.com or connect on LinkedIn.";
    } else if (lower.includes("experience") || lower.includes("year")) {
      response =
        "5+ years of professional experience in full-stack development, with expertise in enterprise Java applications and modern frontend frameworks.";
    } else {
      response =
        "I'm your AI portfolio assistant. Ask me about skills, projects, experience, or how to contact me!";
    }

    typewriterEffect(response);
  };

  const typewriterEffect = (text: string) => {
    let i = 0;
    const timer = setInterval(() => {
      if (i < text.length) {
        terminal.current?.write(text[i]);
        i++;
      } else {
        clearInterval(timer);
        // Add assistant message to store
        addMessage({ role: "assistant", content: text });
        terminal.current?.writeln("");
        terminal.current?.writeln("");
        terminal.current?.writeln("\x1b[32m[✓ Response complete]\x1b[0m");
        terminal.current?.writeln("");
        writePrompt();
        setIsProcessing(false);
        setStreaming(false);
      }
    }, 20);
  };

  const handleChipClick = (command: string) => {
    if (isProcessing) return;
    setCurrentLine(command);
    terminal.current?.write(command);
    setTimeout(() => {
      terminal.current?.writeln("");
      handleCommand(command);
      setCurrentLine("");
    }, 100);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Quick Action Chips */}
      <SuggestionChips
        chips={defaultChips}
        onChipClick={handleChipClick}
        disabled={isProcessing}
      />

      {/* Terminal */}
      <div className="flex-1 overflow-hidden">
        <div ref={terminalRef} className="h-full w-full p-4" />
      </div>

      {/* Ghost placeholder */}
      {!currentLine && !isProcessing && (
        <div className="absolute bottom-4 left-4 pointer-events-none">
          <span className="text-text-muted/30 font-mono text-sm">
            Ask about my Java experience...
          </span>
        </div>
      )}
    </div>
  );
}
