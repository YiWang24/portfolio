"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Send, Copy, Terminal, CheckCircle2, Github, Linkedin, Mail, Signal, GitBranch, Cpu, Twitter } from "lucide-react";
import { SectionBadge } from "./SectionBadge";
import { cn } from "@/lib/utils";
import { sendContactMessage } from "@/services/contact";

interface ContactSectionProps {
    email?: string;
    name?: string;
}

export function ContactSection({ email, name }: ContactSectionProps) {
    const [formState, setFormState] = useState({ email: "", message: "" });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSent, setIsSent] = useState(false);
    const [copied, setCopied] = useState(false);
    const [focusedField, setFocusedField] = useState<string | null>(null);

    const currentYear = new Date().getFullYear();
    const developerName = name || "Yi Wang";
    const contactEmail = email || "yi@example.com";

    const handleCopyEmail = () => {
        navigator.clipboard.writeText(contactEmail);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            await sendContactMessage({
                email: formState.email,
                message: formState.message
            });
            setIsSent(true);
            setFormState({ email: "", message: "" });
        } catch (error) {
            console.error("Failed to send message:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <section className="relative w-full min-h-screen flex flex-col items-center justify-center py-20 px-4 overflow-hidden selection:bg-emerald-500/30">

            {/* Background Effects */}
            <div className="absolute inset-0 z-0">
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:50px_50px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_80%)]" />
            </div>

            <div className="w-full max-w-5xl relative z-10 flex flex-col gap-12 mb-12">

                {/* Header */}
                <div className="text-center space-y-4">
                    <div className="flex justify-center">
                        <SectionBadge icon={Signal}>Communication</SectionBadge>
                    </div>
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-4xl md:text-5xl font-bold font-mono tracking-tight"
                    >
                        <span className="text-white">INITIATE_</span>
                        <span className="text-emerald-400">UPLINK</span>
                    </motion.h2>
                    <p className="text-zinc-500 font-mono text-sm">
                        // Establish secure connection. Send a transmission.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 bg-zinc-900/40 backdrop-blur-sm border border-white/5 rounded-2xl p-2 lg:p-4">
                    {/* Left: Terminal Form (3 cols) */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="lg:col-span-3 h-full"
                    >
                        <div className="h-full bg-zinc-950/80 border border-white/10 rounded-xl overflow-hidden flex flex-col">
                            {/* Terminal Toolbar */}
                            <div className="flex items-center justify-between px-4 py-3 bg-white/5 border-b border-white/5">
                                <div className="flex items-center gap-2">
                                    <Terminal className="w-4 h-4 text-emerald-500" />
                                    <span className="text-xs font-mono text-zinc-400">bash — 80x24</span>
                                </div>
                                <div className="flex gap-1.5">
                                    <div className="w-2.5 h-2.5 rounded-full bg-red-500/50" />
                                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/50" />
                                    <div className="w-2.5 h-2.5 rounded-full bg-green-500/50" />
                                </div>
                            </div>

                            {/* Form Area with Line Numbers */}
                            <div className="flex-1 flex relative font-mono text-sm leading-relaxed p-4 md:p-6">
                                {/* Line Numbers */}
                                <div className="hidden sm:flex flex-col text-right text-zinc-700 pr-4 select-none border-r border-white/5 mr-4 font-mono text-xs md:text-sm leading-loose py-1">
                                    {Array.from({ length: 12 }).map((_, i) => (
                                        <span key={i}>{(i + 1).toString().padStart(2, '0')}</span>
                                    ))}
                                </div>

                                {/* Form Content */}
                                <div className="flex-1">
                                    {!isSent ? (
                                        <form onSubmit={handleSubmit} className="space-y-6">

                                            {/* Email Field */}
                                            <div className="group">
                                                <label className={cn("block mb-1 text-xs transition-colors", focusedField === 'email' ? "text-cyan-400" : "text-zinc-500")}>
                                                    ~/user/contact <span className="text-zinc-600">&gt;</span> enter_email:
                                                </label>
                                                <div className="relative flex items-center">
                                                    <span className="text-emerald-500 font-bold mr-2">&gt;</span>
                                                    <input
                                                        type="email"
                                                        required
                                                        value={formState.email}
                                                        onChange={e => setFormState({ ...formState, email: e.target.value })}
                                                        onFocus={() => setFocusedField('email')}
                                                        onBlur={() => setFocusedField(null)}
                                                        className="w-full bg-transparent border-none outline-none text-emerald-400 placeholder-zinc-800 focus:ring-0 p-0 caret-emerald-500"
                                                        placeholder="identifier@domain.com"
                                                    />
                                                </div>
                                            </div>

                                            {/* Message Field */}
                                            <div className="group">
                                                <label className={cn("block mb-1 text-xs transition-colors", focusedField === 'message' ? "text-cyan-400" : "text-zinc-500")}>
                                                    ~/user/data <span className="text-zinc-600">&gt;</span> transmission_content:
                                                </label>
                                                <div className="relative flex items-start">
                                                    <span className="text-emerald-500 font-bold mr-2 mt-0.5">&gt;</span>
                                                    <textarea
                                                        required
                                                        rows={4}
                                                        value={formState.message}
                                                        onChange={e => setFormState({ ...formState, message: e.target.value })}
                                                        onFocus={() => setFocusedField('message')}
                                                        onBlur={() => setFocusedField(null)}
                                                        className="w-full bg-transparent border-none outline-none text-emerald-400 placeholder-zinc-800 focus:ring-0 p-0 resize-none leading-relaxed caret-emerald-500"
                                                        placeholder="Initializing handshake protocol..."
                                                    />
                                                </div>
                                            </div>

                                            {/* Submit Button */}
                                            <button
                                                type="submit"
                                                disabled={isSubmitting}
                                                className="w-full py-3 mt-4 border border-emerald-500/30 text-emerald-500 font-mono text-sm uppercase tracking-widest transition-all hover:bg-emerald-600 hover:text-black hover:border-emerald-600 hover:shadow-[0_0_20px_rgba(16,185,129,0.4)] disabled:opacity-50 disabled:cursor-not-allowed group relative overflow-hidden"
                                            >
                                                <span className="relative z-10 flex items-center justify-center gap-2">
                                                    {isSubmitting ? (
                                                        <>
                                                            <span className="animate-spin">/</span> UPLOADING...
                                                        </>
                                                    ) : (
                                                        <>
                                                            EXECUTE_TRANSMISSION <Send className="w-4 h-4 ml-1" />
                                                        </>
                                                    )}
                                                </span>
                                            </button>
                                        </form>
                                    ) : (
                                        <motion.div
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            className="h-full flex flex-col items-center justify-center text-center space-y-6 py-12"
                                        >
                                            <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/50">
                                                <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                                            </div>
                                            <div className="space-y-2">
                                                <h3 className="text-lg font-bold text-white">TRANSMISSION_COMPLETE</h3>
                                                <p className="text-zinc-500 text-xs max-w-[200px] mx-auto">
                                                    packet_id: {Math.random().toString(36).substring(7).toUpperCase()}
                                                    <br />
                                                    status: 200 OK
                                                </p>
                                            </div>
                                            <button
                                                onClick={() => setIsSent(false)}
                                                className="text-xs text-emerald-500 hover:underline font-mono"
                                            >
                                                [ Reset Connection ]
                                            </button>
                                        </motion.div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Right: Direct Contact & Socials (2 cols) */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        className="lg:col-span-2 flex flex-col gap-6"
                    >
                        {/* Copy Email Box - Kept Distinct */}
                        <div
                            onClick={handleCopyEmail}
                            className="bg-zinc-950/50 border border-white/10 p-6 rounded-xl cursor-pointer hover:border-emerald-500/50 hover:bg-zinc-900/80 transition-all group relative overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                            <h3 className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                                <Terminal className="w-3 h-3" /> Manual Override
                            </h3>
                            <div className="flex items-center justify-between p-3 bg-black/60 rounded-lg border border-white/5 font-mono text-xs sm:text-sm group-hover:border-emerald-500/30 transition-colors">
                                <span className="text-emerald-400 truncate">$ cp {contactEmail} ./clipboard</span>
                                <Copy className={cn("w-4 h-4 text-zinc-500 transition-colors", copied ? "text-emerald-500" : "group-hover:text-white")} />
                            </div>
                            <div className="mt-2 h-4">
                                {copied && (
                                    <motion.span
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="text-[10px] text-emerald-500 font-mono flex items-center gap-1"
                                    >
                                        <CheckCircle2 className="w-3 h-3" /> Copied to buffer
                                    </motion.span>
                                )}
                            </div>
                        </div>

                        {/* Social Links - Compact 2x2 Grid */}
                        <div className="grid grid-cols-2 gap-3">
                            {[
                                { name: "GitHub", icon: Github, href: "https://github.com", color: "hover:text-white group-hover:border-white/20" },
                                { name: "LinkedIn", icon: Linkedin, href: "https://linkedin.com", color: "hover:text-blue-400 group-hover:border-blue-400/30" },
                                { name: "Twitter", icon: Twitter, href: "https://twitter.com", color: "hover:text-sky-400 group-hover:border-sky-400/30" },
                                { name: "Email", icon: Mail, href: `mailto:${contactEmail}`, color: "hover:text-emerald-400 group-hover:border-emerald-400/30" },
                            ].map((social) => (
                                <a
                                    key={social.name}
                                    href={social.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={cn(
                                        "flex items-center justify-center gap-2 h-12 bg-zinc-950/30 border border-white/5 rounded-lg transition-all hover:bg-white/5",
                                        "text-zinc-400 group",
                                        social.color
                                    )}
                                >
                                    <social.icon className="w-4 h-4 transition-colors" />
                                    <span className="font-mono text-xs transition-colors">{social.name}</span>
                                </a>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* System Footer (Vim Status Bar) */}
            <div className="absolute bottom-0 inset-x-0 h-8 bg-zinc-950 border-t border-white/10 flex items-center justify-between px-4 text-[10px] font-mono text-zinc-500 uppercase tracking-wider z-20">
                <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1.5 hover:text-emerald-400 cursor-help transition-colors">
                        <GitBranch className="w-3 h-3" />
                        <span className="hidden sm:inline">branch:</span>main
                    </span>
                    <span className="flex items-center gap-1.5 text-emerald-500/80">
                        <CheckCircle2 className="w-3 h-3" />
                        <span className="hidden sm:inline">build:</span>passing
                    </span>
                    <span className="hidden md:flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 bg-yellow-500/50 rounded-full animate-pulse" />
                        node: v20.10
                    </span>
                </div>

                <div className="absolute left-1/2 -translate-x-1/2 hidden md:block opacity-50 hover:opacity-100 transition-opacity">
                    © {currentYear} {developerName}. <span className="hidden lg:inline">Encoded with Next.js</span>
                </div>

                <div className="flex items-center gap-4 text-right">
                    <span className="hidden sm:inline hover:text-white transition-colors">Ln 1421, Col 84</span>
                    <span className="hover:text-cyan-400 transition-colors flex items-center gap-1.5">
                        <Cpu className="w-3 h-3" />
                        UTF-8
                    </span>
                    <span className="flex items-center gap-1.5 text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                        SYSTEM ONLINE
                    </span>
                </div>
            </div>

        </section>
    );
}
