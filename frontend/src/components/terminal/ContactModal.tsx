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
      // Close modal after a short delay to let user see the success state
      setTimeout(() => {
        onClose();
      }, 1500);
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
        className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm"
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
            <div className="relative rounded-2xl  overflow-hidden border border-emerald-500/30 bg-[#0a0a0a] shadow-2xl shadow-emerald-500/20 font-['JetBrains_Mono',monospace]">
              {/* CRT Scanline Overlay */}
              <div className="pointer-events-none absolute inset-0 z-20 opacity-40">
                <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.15)_50%),linear-gradient(90deg,rgba(255,0,0,0.03),rgba(0,255,0,0.015),rgba(0,0,255,0.03))] bg-[length:100%_2px,3px_100%]" />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-emerald-500/5 to-transparent animate-[scanline_8s_linear_infinite]" />
              </div>

              {/* Terminal Header */}
              <div
                className="relative flex items-center justify-between  bg-[#1a1b26] border-b border-emerald-500/20"
                style={{ padding: "8px" }}
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
                  <Terminal size={14} className="text-emerald-400" />
                  <span className="text-emerald-400 font-semibold">
                    secure-contact@portfolio:~
                  </span>
                </div>

                {/* Close Button */}
                <button
                  onClick={onClose}
                  className="text-slate-500 hover:text-white transition-colors"
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
                      className="text-xs text-emerald-400/80 font-['IBM_Plex_Mono',monospace]"
                    >
                      <span className="text-emerald-500/50">
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
                  className="text-[10px] leading-tight text-emerald-400/60 mb-8 select-none"
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
                    className="flex items-center justify-between px-4 py-3 bg-emerald-950/20 rounded text-[10px] font-['IBM_Plex_Mono',monospace]"
                    style={{ marginBottom: "8px", padding: "4px" }}
                  >
                    <div
                      className="flex items-center gap-2"
                      style={{ margin: "2px" }}
                    >
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                      <span className="text-emerald-400">ENCRYPTED</span>
                    </div>
                    <div className="flex items-center gap-4 text-emerald-400/70">
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
                      className="flex items-center gap-2 text-xs font-['IBM_Plex_Mono',monospace] text-emerald-400/80 uppercase tracking-wider"
                    >
                      <span className="text-emerald-500">$</span>
                      <span>var sender_email =</span>
                    </label>
                    <div className="relative">
                      <input
                        id="contact-email"
                        type="email"
                        autoComplete="email"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        className="w-full bg-[#0c0c0c] rounded px-5 py-4 text-base text-emerald-100 placeholder:text-slate-600 focus:bg-[#0f0f0f] focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/40 font-['JetBrains_Mono',monospace] transition-all duration-200"
                        placeholder='"your@email.com";'
                        required
                        disabled={status === "sending" || status === "sent"}
                        style={{
                          padding: "4px",
                          boxShadow:
                            "0 0 0 1px rgba(16,185,129,0.08), 0 0 30px rgba(16,185,129,0.05)",
                        }}
                      />
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-emerald-500/50 pointer-events-none select-none">
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
                      className="flex items-center gap-2 text-xs font-['IBM_Plex_Mono',monospace] text-emerald-400/80 uppercase tracking-wider"
                    >
                      <span className="text-emerald-500">$</span>
                      <span>const payload =</span>
                    </label>
                    <div className="relative">
                      <textarea
                        id="contact-message"
                        value={message}
                        onChange={(event) => setMessage(event.target.value)}
                        rows={6}
                        className="w-full resize-none bg-[#0c0c0c] rounded px-5 py-4 text-base text-emerald-100 placeholder:text-slate-600 focus:bg-[#0f0f0f] focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/40 font-['JetBrains_Mono',monospace] transition-all duration-200"
                        placeholder={`\`Your message here...\`;`}
                        required
                        disabled={status === "sending" || status === "sent"}
                        style={{
                          padding: "4px",
                          boxShadow:
                            "0 0 0 1px rgba(16,185,129,0.08), 0 0 30px rgba(16,185,129,0.05)",
                        }}
                      />
                      <div className="absolute right-3 bottom-3 text-xs text-emerald-500/50 pointer-events-none select-none">
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
                  <div className="pt-4 flex justify-center">
                    <button
                      type="submit"
                      disabled={
                        !canSubmit || status === "sending" || status === "sent"
                      }
                      className="group relative inline-flex items-center justify-center gap-2 bg-emerald-500/10 border border-emerald-500/30 hover:bg-emerald-500/15 hover:border-emerald-400/40 text-emerald-400 px-8 py-2.5 rounded text-xs font-['IBM_Plex_Mono',monospace] font-semibold uppercase tracking-wider transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-emerald-500/10 disabled:hover:border-emerald-500/30 overflow-hidden min-w-[160px]"
                    >
                      {/* Scanline effect on button */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-emerald-400/10 to-transparent translate-x-full group-hover:translate-x-full transition-transform duration-700" />

                      {status === "sending" ? (
                        <>
                          <Loader2 size={14} className="animate-spin" />
                          <span>TRANSMITTING...</span>
                        </>
                      ) : status === "sent" ? (
                        <>
                          <CheckCircle2 size={14} />
                          <span>SENT</span>
                        </>
                      ) : (
                        <>
                          <Send
                            size={14}
                            className="group-hover:translate-x-0.5 transition-transform"
                          />
                          <span>SEND MESSAGE</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Footer */}
                  <div className="pt-4 pb-3">
                    <div className="flex items-center justify-between text-[10px] font-['IBM_Plex_Mono',monospace]">
                      <div className="flex items-center gap-2 text-slate-500">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                        <span>CONNECTION: SECURE</span>
                      </div>
                      <div className="text-slate-600">Press ESC to close</div>
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
