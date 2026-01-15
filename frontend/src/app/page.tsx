"use client";

import { useState, useEffect, useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { ChevronsDown } from "lucide-react";
import profile from "../data/profile.json";
import NavBar from "../components/NavBar";
import TerminalPanel from "../components/terminal/TerminalPanel";
import { MatrixRain } from "../components/effects/MatrixRain";
import HyperTunnel from "../components/ui/HyperTunnel";
import PortfolioSections from "../components/portfolio/PortfolioSections";
import ContactModal from "../components/terminal/ContactModal";

export default function Home() {
  const [isContactOpen, setIsContactOpen] = useState(false);
  const containerRef = useRef<HTMLElement>(null);
  const { scrollY } = useScroll({ container: containerRef });

  // Parallax exit effect for Hero
  const heroOpacity = useTransform(scrollY, [0, 400], [1, 0]);
  const heroScale = useTransform(scrollY, [0, 400], [1, 0.9]);
  const heroFilter = useTransform(scrollY, [0, 400], ["blur(0px)", "blur(10px)"]);

  // Listen for custom event from NavBar
  useEffect(() => {
    const handleOpenContact = () => setIsContactOpen(true);
    window.addEventListener('openContact', handleOpenContact);
    return () => window.removeEventListener('openContact', handleOpenContact);
  }, []);

  return (
    <>
      {/* === Matrix Rain Effect === */}
      <MatrixRain />

      {/* === 4面时空隧道背景 === */}
      <div className="fixed inset-0 z-[-1] h-full w-full">
        {/* 时空隧道 - 4个面全部指向中心消失点 */}
        <HyperTunnel />
      </div>

      {/* === Desktop Navbar (仅桌面端) === */}
      {/* === Navbar === */}
      <NavBar hero={profile.hero} />

      {/* === 内容层 === */}
      <main
        id="main-scroll-container"
        ref={containerRef}
        className="relative w-full z-10 h-screen overflow-y-scroll snap-y snap-proximity scroll-smooth"

      >
        {/* Hero Section - Full viewport fixed height with Parallax Exit */}
        <motion.div
          style={{ opacity: heroOpacity, scale: heroScale, filter: heroFilter }}
          className="relative w-full h-screen flex items-start justify-center pt-8 md:pt-12 overflow-hidden snap-start shrink-0"
        >
          <section className="hero-frame w-[95%] md:w-[85%] lg:w-[80%] h-[calc(100vh-160px)] md:h-[calc(100vh-200px)] mt-16 md:mt-0">
            <div className="hero-terminal h-full">
              <TerminalPanel />
            </div>
          </section>

          {/* Scroll Down Indicator - Neon Chevron Style */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 1 }}
            className="absolute bottom-4 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 cursor-pointer z-10"
            onClick={() => {
              const nextSection = document.getElementById('about');
              if (nextSection) {
                nextSection.scrollIntoView({ behavior: 'smooth' });
              } else {
                window.scrollBy({ top: window.innerHeight, behavior: 'smooth' });
              }
            }}
          >
            <div className="relative">
              <div className="absolute inset-0 bg-cyan-400 blur-lg opacity-20 animate-pulse rounded-full" />
              <ChevronsDown className="w-6 h-6 text-cyan-400 animate-bounce relative z-10 drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
            </div>
          </motion.div>
        </motion.div>

        {/* Portfolio Sections */}
        <PortfolioSections data={profile} />
      </main>

      {/* === Global Contact Modal === */}
      <ContactModal
        isOpen={isContactOpen}
        onClose={() => setIsContactOpen(false)}
      />
    </>
  );
}
