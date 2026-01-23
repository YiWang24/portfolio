"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useMemo } from "react";
import { ModeToggle } from "./mode-toggle";
import { smoothScrollTo } from "@/lib/utils/scroll";
import { Menu, X } from "lucide-react";

type NavbarProfile = {
  name: string;
  avatar: string;
};

type Props = { about: NavbarProfile };

export default function Navbar({ about }: Props) {
  // Simulated latency for tech feel
  const [latency, setLatency] = useState(12);
  const [activeSection, setActiveSection] = useState("");
  // Mobile menu state
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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

  const navLinks = useMemo(() => [
    { href: "#about", label: "About" },
    { href: "#experience", label: "Experience" },
    { href: "#projects", label: "Projects" },
    { href: "#stack", label: "Stack" },
    { href: "#licenses", label: "Credentials" },
  ], []);

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
              className="min-h-[44px] min-w-[44px] px-3 lg:px-4 py-2 font-mono text-xs uppercase tracking-wider rounded-lg transition-all duration-300 relative whitespace-nowrap cursor-pointer"
              style={{
                color: activeSection === link.href.replace('#', '')
                  ? 'rgb(15, 23, 42)'
                  : 'rgb(71, 85, 105)',
                backgroundColor: activeSection === link.href.replace('#', '')
                  ? 'rgb(241, 245, 249)'
                  : 'transparent'
              }}
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

        {/* Mobile Menu Button - Show only on mobile, positioned on right */}
        <motion.button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="md:hidden min-h-[44px] min-w-[44px] flex items-center justify-center p-3 rounded-lg border border-slate-200 dark:border-border bg-white/80 dark:bg-background/80 backdrop-blur-xl shadow-sm cursor-pointer z-10 relative"
          whileTap={{ scale: 0.95 }}
          aria-label="Toggle menu"
        >
          <AnimatePresence mode="wait" initial={false}>
            {isMobileMenuOpen ? (
              <motion.div
                key="close"
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <X className="w-5 h-5 text-slate-800 dark:text-foreground" />
              </motion.div>
            ) : (
              <motion.div
                key="menu"
                initial={{ rotate: 90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: -90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <Menu className="w-5 h-5 text-slate-800 dark:text-foreground" />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>

        {/* Right Section: Actions + Status - Hide on mobile when menu is open */}
        <div className={`hidden md:flex items-center gap-2 lg:gap-3 ${isMobileMenuOpen ? 'invisible' : ''}`}>

          {/* Separator Line */}
          <div className="hidden sm:block h-4 w-px bg-slate-200 dark:bg-border" />

          {/* Docs Button - Technical Manual Style */}
          <motion.a
            href={process.env.NEXT_PUBLIC_DOCS_URL || '/documentation/'}
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

      {/* Mobile Menu Dropdown */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -20, height: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="fixed top-[72px] left-1/2 -translate-x-1/2 z-40 w-full max-w-screen-xl px-4"
          >
            <nav className="flex flex-col gap-2 p-4 mt-2 rounded-2xl border border-slate-200 dark:border-border bg-white/95 dark:bg-background/95 backdrop-blur-xl shadow-lg shadow-slate-200/50 dark:shadow-lg">
              {navLinks.map((link) => (
                <motion.button
                  key={link.href}
                  onClick={(e) => {
                    e.preventDefault();
                    setIsMobileMenuOpen(false);
                    smoothScrollTo(link.href, { duration: 1000, easing: 'ios' });
                  }}
                  className="min-h-[48px] w-full text-left px-4 py-3 font-mono text-sm uppercase tracking-wider rounded-xl transition-all duration-200 cursor-pointer flex items-center justify-between"
                  style={{
                    color: activeSection === link.href.replace('#', '')
                      ? 'rgb(13, 148, 136)'
                      : 'rgb(71, 85, 105)',
                    backgroundColor: activeSection === link.href.replace('#', '')
                      ? 'rgb(240, 253, 250)'
                      : 'transparent'
                  }}
                  whileHover={{ scale: 1.02, x: 4 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span>{link.label}</span>
                  {activeSection === link.href.replace('#', '') && (
                    <motion.div
                      layoutId="activeMobileNav"
                      className="w-2 h-2 rounded-full bg-teal-600"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                </motion.button>
              ))}

              {/* Divider */}
              <div className="h-px bg-slate-200 dark:border-border my-2" />

              {/* Mobile Action Buttons */}
              <div className="flex flex-col gap-2">
                <motion.a
                  href={process.env.NEXT_PUBLIC_DOCS_URL || '/documentation/'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="min-h-[48px] flex items-center justify-between px-4 py-3 font-mono text-sm uppercase tracking-wider rounded-xl bg-amber-50 text-amber-700 dark:bg-slate-800 dark:text-amber-400 border border-amber-200 dark:border-slate-700 cursor-pointer"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span className="flex items-center gap-3">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                    Docs
                  </span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </motion.a>

                <motion.a
                  href="/resume.pdf"
                  target="_blank"
                  className="min-h-[48px] flex items-center justify-between px-4 py-3 font-mono text-sm uppercase tracking-wider rounded-xl bg-slate-100 text-slate-700 dark:bg-secondary/50 dark:text-muted-foreground border border-transparent dark:border-border cursor-pointer"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span className="flex items-center gap-3">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Resume
                  </span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </motion.a>

                <motion.button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    window.dispatchEvent(new CustomEvent('openContact'));
                  }}
                  className="min-h-[48px] flex items-center justify-between px-4 py-3 font-mono text-sm uppercase tracking-wider font-semibold rounded-xl bg-teal-600 text-white dark:bg-gradient-to-r dark:from-emerald-400 dark:to-cyan-400 dark:text-black shadow-md shadow-teal-600/20 dark:shadow-[0_0_20px_rgba(16,185,129,0.3)] cursor-pointer"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span className="flex items-center gap-3">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    Contact
                  </span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </motion.button>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
