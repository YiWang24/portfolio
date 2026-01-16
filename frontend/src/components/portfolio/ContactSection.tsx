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
        <section className="relative w-full min-h-screen flex flex-col items-center justify-center py-20 px-4 overflow-hidden selection:bg-primary/30">

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
                        <span className="text-slate-900 dark:text-white">INITIATE_</span>
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-500 to-teal-500 dark:from-emerald-400 dark:to-cyan-400 ">UPLINK</span>
                    </motion.h2>
                    <p className="text-muted-foreground font-mono text-sm">
                        // Establish secure connection. Send a transmission.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 bg-white dark:bg-card/40 backdrop-blur-sm border border-slate-300 dark:border-border rounded-2xl p-2 lg:p-4 shadow-sm dark:shadow-none">
                    {/* Left: Terminal Form (3 cols) */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="lg:col-span-3 h-full"
                    >
                        <div className="h-full bg-slate-50 dark:bg-card/80 border border-slate-300 dark:border-border rounded-xl overflow-hidden flex flex-col transition-all duration-500 hover:shadow-lg dark:hover:shadow-[0_0_30px_rgba(16,185,129,0.1)] hover:border-slate-400 dark:hover:border-primary/50">
                            {/* Terminal Toolbar */}
                            <div className="flex items-center justify-between px-4 py-3 bg-slate-100 dark:bg-muted/50 border-b border-slate-300 dark:border-border">
                                <div className="flex items-center gap-2">
                                    <Terminal className="w-4 h-4 text-primary" />
                                    <span className="text-xs font-mono text-muted-foreground">bash — 80x24</span>
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
                                <div className="hidden sm:flex flex-col text-right text-slate-400 dark:text-muted-foreground pr-4 select-none border-r border-slate-300 dark:border-border mr-4 font-mono text-xs md:text-sm leading-loose py-1">
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
                                                <label className={cn("block mb-1 text-xs transition-colors", focusedField === 'email' ? "text-primary" : "text-muted-foreground")}>
                                                    ~/user/contact <span className="text-muted-foreground">&gt;</span> enter_email:
                                                </label>
                                                <div className="relative flex items-center">
                                                    <span className="text-primary font-bold mr-2">&gt;</span>
                                                    <input
                                                        type="email"
                                                        required
                                                        value={formState.email}
                                                        onChange={e => setFormState({ ...formState, email: e.target.value })}
                                                        onFocus={() => setFocusedField('email')}
                                                        onBlur={() => setFocusedField(null)}
                                                        className="w-full bg-transparent border-b border-white/10 dark:border-zinc-700 light:border-slate-300 outline-none text-slate-800 dark:text-zinc-100 placeholder-slate-400 dark:placeholder-zinc-600 focus:border-emerald-500 dark:focus:border-emerald-500 dark:focus:shadow-[0_10px_20px_-10px_rgba(16,185,129,0.5)] transition-all duration-300 p-1 caret-emerald-500 dark:caret-emerald-400"
                                                        placeholder="identifier@domain.com"
                                                    />
                                                </div>
                                            </div>

                                            {/* Message Field */}
                                            <div className="group">
                                                <label className={cn("block mb-1 text-xs transition-colors", focusedField === 'message' ? "text-primary" : "text-muted-foreground")}>
                                                    ~/user/data <span className="text-muted-foreground">&gt;</span> transmission_content:
                                                </label>
                                                <div className="relative flex items-start">
                                                    <span className="text-primary font-bold mr-2 mt-0.5">&gt;</span>
                                                    <textarea
                                                        required
                                                        rows={4}
                                                        value={formState.message}
                                                        onChange={e => setFormState({ ...formState, message: e.target.value })}
                                                        onFocus={() => setFocusedField('message')}
                                                        onBlur={() => setFocusedField(null)}
                                                        className="w-full bg-transparent border-b border-white/10 dark:border-zinc-700 light:border-slate-300 outline-none text-slate-800 dark:text-zinc-100 placeholder-slate-400 dark:placeholder-zinc-600 focus:border-emerald-500 dark:focus:border-emerald-500 dark:focus:shadow-[0_10px_20px_-10px_rgba(16,185,129,0.5)] transition-all duration-300 p-1 resize-none leading-relaxed caret-emerald-500 dark:caret-emerald-400"
                                                        placeholder="Initializing handshake protocol..."
                                                    />
                                                </div>
                                            </div>

                                            {/* Submit Button */}
                                            <button
                                                type="submit"
                                                disabled={isSubmitting}
                                                className="w-full py-3 mt-4 border border-teal-600/30 dark:border-emerald-500/50 text-teal-700 dark:text-emerald-500 bg-teal-50 dark:bg-emerald-500/10 font-mono text-sm uppercase tracking-widest font-bold transition-all hover:bg-teal-600 dark:hover:bg-emerald-500 hover:text-white dark:hover:text-black hover:border-teal-600 dark:hover:border-emerald-500 hover:shadow-lg dark:hover:shadow-[0_0_20px_rgba(16,185,129,0.4)] disabled:opacity-50 disabled:cursor-not-allowed group relative overflow-hidden rounded-md"
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
                                            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center border border-primary/50">
                                                <CheckCircle2 className="w-8 h-8 text-primary" />
                                            </div>
                                            <div className="space-y-2">
                                                <h3 className="text-lg font-bold text-foreground">TRANSMISSION_COMPLETE</h3>
                                                <p className="text-muted-foreground text-xs max-w-[200px] mx-auto">
                                                    packet_id: {Math.random().toString(36).substring(7).toUpperCase()}
                                                    <br />
                                                    status: 200 OK
                                                </p>
                                            </div>
                                            <button
                                                onClick={() => setIsSent(false)}
                                                className="text-xs text-primary hover:underline font-mono"
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
                            className="bg-white dark:bg-zinc-900/30 border border-slate-300 dark:border-border p-6 rounded-xl cursor-pointer hover:border-teal-500/50 dark:hover:border-primary/50 hover:bg-slate-50 dark:hover:bg-zinc-900/50 transition-all group relative overflow-hidden shadow-sm hover:shadow-md dark:shadow-none"
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                            <h3 className="text-[10px] font-mono text-slate-500 dark:text-muted-foreground uppercase tracking-widest mb-4 flex items-center gap-2">
                                <Terminal className="w-3 h-3" /> Manual Override
                            </h3>
                            <div className="flex items-center justify-between p-3 bg-slate-100 dark:bg-black rounded-lg border border-slate-200 dark:border-zinc-800 font-mono text-xs sm:text-sm group-hover:border-teal-500/30 dark:group-hover:border-primary/30 transition-colors">
                                <span className="text-teal-700 dark:text-emerald-400 truncate">$ cp {contactEmail} ./clipboard</span>
                                <Copy className={cn("w-4 h-4 text-slate-400 dark:text-zinc-500 transition-colors", copied ? "text-teal-600 dark:text-emerald-400" : "group-hover:text-slate-700 dark:group-hover:text-zinc-300")} />
                            </div>
                            <div className="mt-2 h-4">
                                {copied && (
                                    <motion.span
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="text-[10px] text-primary font-mono flex items-center gap-1"
                                    >
                                        <CheckCircle2 className="w-3 h-3" /> Copied to buffer
                                    </motion.span>
                                )}
                            </div>
                        </div>

                        {/* Social Links - Compact 2x2 Grid */}
                        <div className="grid grid-cols-2 gap-3">
                            {[
                                { name: "GitHub", icon: Github, href: "https://github.com", color: "hover:text-foreground group-hover:border-foreground/20" },
                                { name: "LinkedIn", icon: Linkedin, href: "https://linkedin.com", color: "hover:text-blue-400 group-hover:border-blue-400/30" },
                                { name: "Twitter", icon: Twitter, href: "https://twitter.com", color: "hover:text-sky-400 group-hover:border-sky-400/30" },
                                { name: "Email", icon: Mail, href: `mailto:${contactEmail}`, color: "hover:text-primary group-hover:border-primary/30" },
                            ].map((social) => (
                                <a
                                    key={social.name}
                                    href={social.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={cn(
                                        "flex items-center justify-center gap-2 h-12 bg-white dark:bg-zinc-900/50 border border-slate-300 dark:border-border rounded-lg transition-all hover:bg-slate-50 dark:hover:bg-zinc-800 shadow-sm dark:shadow-none hover:shadow-md dark:hover:border-emerald-500/30",
                                        "text-slate-600 dark:text-zinc-400 group",
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
            <div className="absolute bottom-0 inset-x-0 h-8 bg-slate-100 dark:bg-[#0d1117] border-t border-slate-300 dark:border-white/10 flex items-center justify-between px-4 text-[10px] font-mono text-slate-600 dark:text-zinc-400 uppercase tracking-widest z-20">
                <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1.5 hover:text-primary cursor-help transition-colors">
                        <GitBranch className="w-3 h-3" />
                        <span className="hidden sm:inline">branch:</span>main
                    </span>
                    <span className="flex items-center gap-1.5 text-primary/80">
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
                    <span className="hidden sm:inline hover:text-foreground transition-colors">Ln 1421, Col 84</span>
                    <span className="hover:text-cyan-400 transition-colors flex items-center gap-1.5">
                        <Cpu className="w-3 h-3" />
                        UTF-8
                    </span>
                    <span className="flex items-center gap-2 px-2 py-0.5 rounded font-bold border transition-all duration-500
                        bg-emerald-50/80 text-emerald-600 border-emerald-200 shadow-[0_0_8px_rgba(16,185,129,0.2)]
                        dark:bg-primary/10 dark:text-primary dark:border-primary/20 dark:shadow-[0_0_10px_rgba(6,182,212,0.3)]">
                        <span className="relative flex h-1.5 w-1.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 dark:bg-cyan-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500 dark:bg-cyan-500"></span>
                        </span>
                        <span className="animate-pulse">SYSTEM ONLINE</span>
                    </span>
                </div>
            </div>

        </section>
    );
}
