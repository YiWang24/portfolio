"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Terminal, X, Loader2, CheckCircle2, Send } from "lucide-react";
import { toast } from "sonner";
import { sendContactMessage } from "../../services/contact";

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

type Status = "idle" | "sending" | "sent";

export default function ContactModal({ isOpen, onClose }: Props) {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const [terminalLines, setTerminalLines] = useState<string[]>([]);

  const canSubmit = useMemo(() => {
    return email.trim().length > 0 && message.trim().length > 0;
  }, [email, message]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    // Reset form and state
    setEmail("");
    setMessage("");
    setStatus("idle");
    setError(null);

    // Reset terminal logs first
    setTerminalLines([]);

    // Terminal boot sequence animation
    const bootSequence = [
      "INITIALIZING SECURE CHANNEL...",
      "LOADING ENCRYPTION MODULES...",
      "ESTABLISHING CONNECTION...",
      "READY.",
    ];

    let delay = 0;

    bootSequence.forEach((line, index) => {
      setTimeout(() => {
        setTerminalLines((prev) => [...prev, line]);
      }, delay);
      delay += 150;
    });
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!canSubmit || status === "sending") {
      return;
    }

    setStatus("sending");
    setError(null);

    try {
      await sendContactMessage({
        email: email.trim(),
        message: message.trim(),
      });
      setStatus("sent");
      setTerminalLines((prev) => [
        ...prev,
        "✓ MESSAGE TRANSMITTED SUCCESSFULLY",
      ]);
      toast.success("Transmission complete", {
        description: "Your message has been securely delivered.",
      });
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to send message.";
      setError(errorMessage);
      setStatus("idle");
      setTerminalLines((prev) => [...prev, `✗ ERROR: ${errorMessage}`]);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Container with proper spacing */}
      <div
        className="fixed  inset-0 z-50 flex items-center justify-center"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="w-full  max-w-4xl mx-4 sm:mx-6 md:mx-8 lg:mx-auto pointer-events-auto">
          {/* Terminal Window */}
          <div
            className="relative animate-[boot-scale_0.3s_ease-out]"
            role="dialog"
            aria-modal="true"
            aria-labelledby="contact-modal-title"
          >
            {/* Main Terminal Container */}
            <div className="relative rounded-2xl overflow-hidden border border-slate-300 dark:border-white/10 bg-white dark:bg-[#0d1117] shadow-2xl shadow-slate-300 dark:shadow-black font-['JetBrains_Mono',monospace]">
              {/* CRT Scanline Overlay - Dark Mode Only */}
              <div className="pointer-events-none absolute inset-0 z-20 opacity-0 dark:opacity-40">
                <div className="absolute inset-0 bg-[linear-gradient(hsl(var(--background)/0)_50%,hsl(var(--foreground)/0.15)_50%),linear-gradient(90deg,hsl(var(--destructive)/0.03),hsl(var(--success)/0.015),hsl(var(--primary)/0.03))] bg-[length:100%_2px,3px_100%]" />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent animate-[scanline_8s_linear_infinite]" />
              </div>

              {/* Terminal Header */}
              <div
                className="relative flex items-center justify-between bg-slate-100 dark:bg-white/5 border-b border-slate-200 dark:border-white/5 py-2 px-4"
              >
                {/* Traffic Lights */}
                <div className="flex  items-center gap-2.5">
                  <button
                    onClick={onClose}
                    className="w-3 h-3 rounded-full bg-[#ff5f56] hover:bg-[#ff5f56]/80 transition-colors"
                    aria-label="Close terminal"
                  />
                  <div className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
                  <div className="w-3 h-3 rounded-full bg-[#27c93f]" />
                </div>

                {/* Title */}
                <div className="flex items-center gap-2 text-xs">
                  <Terminal size={14} className="text-slate-500 dark:text-primary" />
                  <span className="text-slate-600 dark:text-primary font-semibold">
                    secure-contact@portfolio:~
                  </span>
                </div>

                {/* Close Button */}
                <button
                  onClick={onClose}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="Close"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Terminal Body */}
              <div className="relative space-y-4" style={{ padding: "10px" }}>
                {/* Boot Sequence */}
                <div className="space-y-2 mb-8">
                  {terminalLines.map((line, index) => (
                    <div
                      key={index}
                      className="text-xs text-slate-500 dark:text-primary/80 font-['IBM_Plex_Mono',monospace]"
                    >
                      <span className="text-slate-400 dark:text-primary/50">
                        [
                        {new Date().toLocaleTimeString("en-US", {
                          hour12: false,
                        })}
                        ]
                      </span>
                      <span className="ml-2">{line}</span>
                    </div>
                  ))}
                </div>

                {/* ASCII Art Header */}
                <pre
                  style={{ marginBottom: "8px" }}
                  className="text-[10px] leading-tight text-slate-300 dark:text-white/20 mb-8 select-none"
                >
                  {`
██████╗ ██╗   ██╗ █████╗ ███╗   ██╗██╗ ██████╗ █████╗ ██████╗
██╔══██╗╚██╗ ██╔╝██╔══██╗████╗  ██║██║██╔════╝██╔══██╗██╔══██╗
██████╔╝ ╚████╔╝ ███████║██╔██╗ ██║██║██║     ███████║██████╔╝
██╔══██╗  ╚██╔╝  ██╔══██║██║╚██╗██║██║██║     ██╔══██║██╔══██╗
██║  ██║   ██║   ██║  ██║██║ ╚████║██║╚██████╗██║  ██║██║  ██║
╚═╝  ╚═╝   ╚═╝   ╚═╝  ╚═╝╚═╝  ╚═══╝╚═╝ ╚═════╝╚═╝  ╚═╝╚═╝  ╚═╝
                    SECURE TRANSMISSION PROTOCOL v2.0
`}
                </pre>

                {/* Form */}
                <form
                  onSubmit={handleSubmit}
                  className="space-y-7 relative z-10"
                  style={{ position: "relative", zIndex: 10 }}
                >
                  {/* Status Bar */}
                  <div
                    className="flex items-center justify-between px-4 py-3 bg-slate-50 dark:bg-primary/10 rounded text-[10px] font-['IBM_Plex_Mono',monospace] border border-slate-200 dark:border-transparent"
                    style={{ marginBottom: "8px", padding: "4px" }}
                  >
                    <div
                      className="flex items-center gap-2"
                      style={{ margin: "2px" }}
                    >
                      <span className="w-2 h-2 rounded-full bg-emerald-500 dark:bg-primary animate-pulse"></span>
                      <span className="text-slate-600 dark:text-primary">ENCRYPTED</span>
                    </div>
                    <div className="flex items-center gap-4 text-slate-500 dark:text-primary/70">
                      <span>SSH-RSA 4096</span>
                      <span>AES-256</span>
                    </div>
                  </div>

                  {/* Email Field */}
                  <div
                    className="flex flex-col gap-3 mt-4"
                    style={{ marginBottom: "12px" }}
                  >
                    <label
                      htmlFor="contact-email"
                      className="flex items-center gap-2 text-xs font-['IBM_Plex_Mono',monospace] text-slate-500 dark:text-primary/80 uppercase tracking-wider"
                    >
                      <span className="text-purple-600 dark:text-pink-400 font-bold">$</span>
                      <span className="text-blue-600 dark:text-cyan-400 font-bold">var sender_email =</span>
                    </label>
                    <div className="relative">
                      <input
                        id="contact-email"
                        type="email"
                        autoComplete="email"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        className="w-full bg-slate-50 dark:bg-black/30 border border-slate-200 dark:border-white/5 rounded px-5 py-4 text-base text-slate-800 dark:text-zinc-200 placeholder:text-slate-400 dark:placeholder:text-zinc-700 focus:bg-white dark:focus:bg-black/50 focus:outline-none focus:border-purple-500 dark:focus:border-primary/40 font-['JetBrains_Mono',monospace] transition-all duration-200"
                        placeholder='"your@email.com";'
                        required
                        disabled={status === "sending" || status === "sent"}
                        style={{
                          padding: "4px",
                          boxShadow:
                            "0 0 0 1px hsl(var(--border)), 0 0 30px hsl(var(--primary)/0.05)",
                        }}
                      />
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-primary/50 pointer-events-none select-none">
                        ;
                      </div>
                    </div>
                  </div>

                  {/* Message Field */}
                  <div
                    className="flex flex-col gap-3 mt-4"
                    style={{ marginBottom: "12px" }}
                  >
                    <label
                      htmlFor="contact-message"
                      className="flex items-center gap-2 text-xs font-['IBM_Plex_Mono',monospace] text-slate-500 dark:text-primary/80 uppercase tracking-wider"
                    >
                      <span className="text-purple-600 dark:text-pink-400 font-bold">$</span>
                      <span className="text-blue-600 dark:text-cyan-400 font-bold">const payload =</span>
                    </label>
                    <div className="relative">
                      <textarea
                        id="contact-message"
                        value={message}
                        onChange={(event) => setMessage(event.target.value)}
                        rows={6}
                        className="w-full resize-none bg-slate-50 dark:bg-black/30 border border-slate-200 dark:border-white/5 rounded px-5 py-4 text-base text-slate-800 dark:text-zinc-200 placeholder:text-slate-400 dark:placeholder:text-zinc-700 focus:bg-white dark:focus:bg-black/50 focus:outline-none focus:border-purple-500 dark:focus:border-primary/40 font-['JetBrains_Mono',monospace] transition-all duration-200"
                        placeholder={`\`Your message here...\`;`}
                        required
                        disabled={status === "sending" || status === "sent"}
                        style={{
                          padding: "12px",
                        }}
                      />
                      <div className="absolute right-3 bottom-3 text-xs text-primary/50 pointer-events-none select-none">
                        ;
                      </div>
                    </div>
                  </div>

                  {/* Error Message */}
                  {error && (
                    <div className="flex items-start gap-3 p-3 bg-red-950/30 border border-red-500/40 rounded text-sm font-['IBM_Plex_Mono',monospace] ">
                      <span className="text-red-400 flex-shrink-0 mt-0.5">
                        ✗
                      </span>
                      <div>
                        <div className="text-red-300 font-semibold">
                          TRANSMISSION FAILED
                        </div>
                        <div className="text-red-400/80 mt-1">{error}</div>
                      </div>
                    </div>
                  )}

                  {/* Submit Button */}
                  <div className="flex justify-end pt-2">
                    <button
                      type="submit"
                      disabled={!canSubmit || status === "sending" || status === "sent"}
                      className="relative group disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <div className="absolute inset-0 bg-purple-500/20 dark:bg-primary/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      <div className="relative flex items-center gap-3 px-8 py-3 bg-slate-900 dark:bg-black/40 hover:bg-slate-800 dark:hover:bg-primary/10 border border-transparent dark:border-primary/50 text-white dark:text-primary font-bold font-['JetBrains_Mono',monospace] tracking-wider uppercase rounded overflow-hidden transition-all duration-300 group-hover:shadow-[0_0_20px_rgba(168,85,247,0.3)] dark:group-hover:shadow-[0_0_20px_rgba(6,182,212,0.3)]">
                        {status === "sending" ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Transmitting...</span>
                          </>
                        ) : status === "sent" ? (
                          <>
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Sent</span>
                          </>
                        ) : (
                          <>
                            <span>Send Message</span>
                            <Send className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                          </>
                        )}
                      </div>
                    </button>
                  </div>

                  {/* Footer */}
                  <div className="pt-4 pb-3">
                    <div className="flex items-center justify-between text-[10px] font-['IBM_Plex_Mono',monospace]">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
                        <span>CONNECTION: SECURE</span>
                      </div>
                      <div className="text-muted-foreground">Press ESC to close</div>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Custom Animations */}
      <style jsx global>{`
        @keyframes scanline {
          0% {
            transform: translateY(-100%);
          }
          100% {
            transform: translateY(100%);
          }
        }

        @keyframes boot-scale {
          0% {
            opacity: 0;
            transform: scale(0.95) translateY(10px);
          }
          100% {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
      `}</style>
    </>
  );
}
