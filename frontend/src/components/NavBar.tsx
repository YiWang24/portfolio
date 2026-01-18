"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { ModeToggle } from "./mode-toggle";
import { smoothScrollTo } from "@/lib/utils/scroll";

type NavbarProfile = {
  name: string;
  avatar: string;
};

type Props = { about: NavbarProfile };

export default function Navbar({ about }: Props) {
  // Simulated latency for tech feel
  const [latency, setLatency] = useState(12);
  const [activeSection, setActiveSection] = useState("");

  useEffect(() => {
    const interval = setInterval(() => {
      setLatency(Math.floor(Math.random() * 20) + 8);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Track active section based on scroll position
  useEffect(() => {
    const container = document.getElementById('main-scroll-container') || document.documentElement;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.id.replace('-section', '');
            setActiveSection(id);
          }
        });
      },
      { root: container, threshold: 0.5 }
    );

    // Observe all sections
    ['about', 'experience', 'projects', 'stack', 'licenses', 'contact'].forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
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
      className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-screen-xl px-4"
    >
      <nav className="flex items-center justify-between px-3 py-2 md:px-6 md:py-3 rounded-full border border-slate-200 dark:border-border bg-white/80 dark:bg-background/80 backdrop-blur-xl shadow-sm shadow-slate-200/50 dark:shadow-lg dark:shadow-none supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-background/60">
        {/* Brand */}
        <motion.div
          className="flex items-center gap-3 cursor-pointer"
          onClick={() => {
            const container = document.getElementById('main-scroll-container');
            if (container) {
              container.scrollTo({ top: 0, behavior: 'smooth' });
            } else {
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }
          }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="w-8 h-8 rounded-lg overflow-hidden border border-slate-200 dark:border-border bg-slate-50 dark:bg-muted">
            {about.avatar ? (
              <img src={about.avatar} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center text-black font-bold text-sm">AI</div>
            )}
          </div>
          <span className="font-semibold text-slate-800 dark:text-foreground text-sm tracking-wide hidden sm:block whitespace-nowrap">
            {about.name}
          </span>
        </motion.div>

        {/* Navigation Links - IDE Tab Style */}
        <div className="hidden md:flex items-center gap-0.5 lg:gap-1">
          {navLinks.map((link) => (
            <motion.button
              key={link.href}
              onClick={(e) => {
                e.preventDefault();
                smoothScrollTo(link.href, { duration: 1000, easing: 'ios' });
              }}
              className={`px-3 lg:px-4 py-2 font-mono text-xs uppercase tracking-wider rounded-lg transition-all duration-300 relative whitespace-nowrap ${activeSection === link.href.replace('#', '')
                ? 'text-slate-900 bg-slate-100 dark:text-foreground dark:bg-accent'
                : 'text-slate-600 hover:text-teal-600 hover:bg-slate-50 dark:text-muted-foreground dark:hover:bg-accent/50 dark:hover:text-accent-foreground'
                }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {activeSection === link.href.replace('#', '') && (
                <motion.div
                  layoutId="activeNavIndicator"
                  className="absolute inset-0 bg-slate-100 dark:bg-accent rounded-lg"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              <span className="relative z-10">{link.label}</span>
            </motion.button>
          ))}
        </div>

        {/* Right Section: Actions + Status */}
        <div className="flex items-center gap-2 lg:gap-3">

          {/* Separator Line */}
          <div className="hidden sm:block h-4 w-px bg-slate-200 dark:bg-border" />

          {/* Docs Button - Technical Manual Style */}
          <motion.a
            href={process.env.NEXT_PUBLIC_DOCS_URL || '/docs'}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-3 lg:px-4 py-2 rounded-lg font-mono text-xs uppercase tracking-wider bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200 dark:bg-slate-800 dark:text-amber-400 dark:border-slate-700 dark:hover:bg-slate-700 transition-all duration-200 whitespace-nowrap"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <span className="hidden sm:inline">Docs</span>
          </motion.a>

          <ModeToggle />

          {/* Resume Button */}
          <motion.a
            href="/resume.pdf"
            target="_blank"
            className="hidden sm:flex items-center gap-2 px-3 lg:px-4 py-2 rounded-lg font-mono text-xs uppercase tracking-wider bg-slate-100 text-slate-700 hover:bg-slate-200 border-transparent dark:text-muted-foreground border dark:border-border dark:bg-secondary/50 dark:hover:bg-accent dark:hover:text-accent-foreground transition-all duration-200 whitespace-nowrap"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span className="hidden lg:inline">Resume</span>
          </motion.a>

          {/* Contact Button - Primary CTA */}
          <motion.button
            onClick={() => window.dispatchEvent(new CustomEvent('openContact'))}
            className="flex items-center gap-2 px-3 lg:px-4 py-2 rounded-lg font-mono text-xs uppercase tracking-wider font-semibold bg-teal-600 text-white hover:bg-teal-700 border-transparent shadow-md shadow-teal-600/20 dark:text-black dark:bg-gradient-to-r dark:from-emerald-400 dark:to-cyan-400 dark:hover:from-emerald-300 dark:hover:to-cyan-300 transition-all duration-200 dark:shadow-[0_0_20px_rgba(16,185,129,0.3)] whitespace-nowrap"
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
