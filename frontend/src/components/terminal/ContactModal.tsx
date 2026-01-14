"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Send, X, Loader2, CheckCircle2 } from "lucide-react";
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

  const canSubmit = useMemo(() => {
    return email.trim().length > 0 && message.trim().length > 0;
  }, [email, message]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setEmail("");
    setMessage("");
    setStatus("idle");
    setError(null);
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
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to send message.";
      setError(errorMessage);
      setStatus("idle");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-md"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Container */}
      <div
        className="relative w-full max-w-2xl animate-[fadeIn_0.2s_ease-out]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="contact-modal-title"
        style={{
          animation: "fadeIn 0.2s ease-out, slideUp 0.3s ease-out",
        }}
      >
        {/* Main Card */}
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-slate-900/95 to-slate-950/95 shadow-2xl shadow-emerald-500/10 backdrop-blur-xl">
          {/* Top Accent Line */}
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-400/50 to-transparent" />
          
          {/* Glow Effects */}
          <div className="absolute -top-32 -right-32 h-64 w-64 rounded-full bg-emerald-500/20 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-32 -left-32 h-64 w-64 rounded-full bg-teal-500/15 blur-3xl pointer-events-none" />

          {/* Content Container with explicit padding */}
          <div style={{ padding: '48px' }}>
            {/* Header */}
            <div className="relative flex items-start justify-between mb-12">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-5">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400" />
                  </span>
                  <span className="text-[11px] font-mono uppercase tracking-[0.2em] text-emerald-400/80">
                    Secure Connection
                  </span>
                </div>
                <h2
                  id="contact-modal-title"
                  className="text-3xl font-semibold tracking-tight text-white"
                >
                  Send a Message
                </h2>
                <p className="mt-4 text-base text-slate-400">
                  I&apos;ll respond to your email within 24 hours.
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl p-3 text-slate-500 transition-all hover:bg-white/5 hover:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 -mr-2 -mt-2"
                aria-label="Close contact modal"
              >
                <X size={22} />
              </button>
            </div>

            {/* Divider */}
            <div className="h-px bg-gradient-to-r from-transparent via-white/15 to-transparent mb-14" />

            {/* Form */}
            <form onSubmit={handleSubmit} className="relative">
              <div className="space-y-12">
              {/* Email Field */}
              <div className="space-y-4">
                <label
                  htmlFor="contact-email"
                  className="block text-sm font-medium uppercase tracking-wider text-slate-400"
                >
                  Your Email
                </label>
                <input
                  id="contact-email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-5 py-4 text-base text-white placeholder:text-slate-500 transition-all duration-200 focus:border-emerald-400/50 focus:bg-white/[0.07] focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  placeholder="your@email.com"
                  required
                  disabled={status === "sending" || status === "sent"}
                />
              </div>

              {/* Message Field */}
              <div className="space-y-4">
                <label
                  htmlFor="contact-message"
                  className="block text-sm font-medium uppercase tracking-wider text-slate-400"
                >
                  Message
                </label>
                <textarea
                  id="contact-message"
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  rows={6}
                  className="w-full resize-none rounded-xl border border-white/10 bg-white/5 px-5 py-4 text-base text-white placeholder:text-slate-500 transition-all duration-200 focus:border-emerald-400/50 focus:bg-white/[0.07] focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  placeholder="What would you like to discuss?"
                  required
                  disabled={status === "sending" || status === "sent"}
                />
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mt-6 flex items-center gap-3 rounded-xl border border-red-500/30 bg-red-500/10 px-5 py-4 text-base text-red-200">
                <span className="flex-shrink-0">⚠️</span>
                <span>{error}</span>
              </div>
            )}

            {/* Success Message */}
            {status === "sent" && (
              <div className="mt-6 flex items-center gap-4 rounded-xl border border-emerald-400/30 bg-emerald-500/10 px-5 py-4">
                <CheckCircle2 size={22} className="flex-shrink-0 text-emerald-400" />
                <div className="text-base text-emerald-100">
                  <strong>Message sent!</strong> I&apos;ll get back to you soon.
                </div>
              </div>
            )}

            {/* Submit Button */}
            <div className="mt-14">
              <button
                type="submit"
                disabled={!canSubmit || status === "sending" || status === "sent"}
                className="group relative flex w-full items-center justify-center gap-3 overflow-hidden rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-8 py-4.5 text-lg font-medium text-white shadow-lg shadow-emerald-500/25 transition-all duration-300 hover:shadow-xl hover:shadow-emerald-500/30 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:shadow-lg"
              >
                {/* Button Shine Effect */}
                <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-full group-disabled:hidden" />
                
                {status === "sending" ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    <span>Sending...</span>
                  </>
                ) : status === "sent" ? (
                  <>
                    <CheckCircle2 size={20} />
                    <span>Message Sent</span>
                  </>
                ) : (
                  <>
                    <Send size={20} className="transition-transform group-hover:translate-x-0.5" />
                    <span>Send Message</span>
                  </>
                )}
              </button>
            </div>

            {/* Footer Note */}
            <p className="mt-6 text-center text-sm text-slate-500">
              Your email will only be used to respond to this message.
            </p>
          </form>
          </div>
        </div>
      </div>

      {/* Animation Keyframes */}
      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { transform: translateY(10px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
