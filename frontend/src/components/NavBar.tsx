"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";

type NavbarProfile = {
  name: string;
  avatar: string;
};

type Props = { about: NavbarProfile };

export default function Navbar({ about }: Props) {
  // Simulated latency for tech feel
  const [latency, setLatency] = useState(12);

  useEffect(() => {
    const interval = setInterval(() => {
      setLatency(Math.floor(Math.random() * 20) + 8);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const navLinks = [
    { href: "#about", label: "About" },
    { href: "#experience", label: "Experience" },
    { href: "#projects", label: "Projects" },
    { href: "#stack", label: "Stack" },
    { href: "#licenses", label: "Credentials" },
  ];

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-5xl px-4"
    >
      <nav className="flex items-center justify-between px-4 py-2 md:px-6 md:py-3 rounded-full border border-white/10 bg-black/60 backdrop-blur-xl shadow-[0_0_30px_rgba(0,0,0,0.5)]">
        {/* Brand */}
        <motion.div
          className="flex items-center gap-3 cursor-pointer"
          onClick={() => {
            const container = document.getElementById('main-scroll-container');
            if (container) container.scrollTo({ top: 0, behavior: 'smooth' });
            else window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="w-8 h-8 rounded-lg overflow-hidden border border-white/20 bg-zinc-900">
            {about.avatar ? (
              <img src={about.avatar} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center text-black font-bold text-sm">AI</div>
            )}
          </div>
          <span className="font-semibold text-white text-sm tracking-wide hidden sm:block">
            {about.name}
          </span>
        </motion.div>

        {/* Navigation Links - IDE Tab Style */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <motion.a
              key={link.href}
              href={link.href}
              className="px-4 py-2 font-mono text-xs uppercase tracking-wider text-zinc-400 rounded-lg hover:bg-white/10 hover:text-emerald-400 transition-all duration-200"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {link.label}
            </motion.a>
          ))}
        </div>

        {/* Right Section: Actions + Status */}
        <div className="flex items-center gap-3">
          {/* Resume Button */}
          <motion.a
            href="/resume.pdf"
            target="_blank"
            className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-lg font-mono text-xs uppercase tracking-wider text-zinc-300 border border-white/10 bg-white/5 hover:bg-white/10 hover:text-white transition-all duration-200"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span>Resume</span>
          </motion.a>

          {/* Contact Button - Primary CTA */}
          <motion.button
            onClick={() => window.dispatchEvent(new CustomEvent('openContact'))}
            className="flex items-center gap-2 px-4 py-2 rounded-lg font-mono text-xs uppercase tracking-wider text-black font-semibold bg-gradient-to-r from-emerald-400 to-cyan-400 hover:from-emerald-300 hover:to-cyan-300 transition-all duration-200 shadow-[0_0_20px_rgba(16,185,129,0.3)]"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <span className="hidden sm:inline">Contact</span>
          </motion.button>
        </div>
      </nav>
    </motion.header>
  );
}
