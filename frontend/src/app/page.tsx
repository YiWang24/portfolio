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
import { ScrollProgress } from "../components/ui/ScrollProgress";
import { smoothScrollTo } from "@/lib/utils/scroll";

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

  // Detect mobile to disable blur effect on keyboard open
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
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

      {/* === Scroll Progress Indicator === */}
      <ScrollProgress containerRef={containerRef} />

      {/* === Desktop Navbar (仅桌面端) === */}
      {/* === Navbar === */}
      <NavBar about={profile.about} />

      {/* === 内容层 === */}
      <main
        id="main-scroll-container"
        ref={containerRef}
        className="relative w-full z-10 h-screen overflow-y-scroll"
      >
        {/* Hero Section */}
        <motion.div
          style={{
            opacity: heroOpacity,
            scale: heroScale,
            filter: isMobile ? "none" : heroFilter
          }}
          // 修改 1: 使用 flex-col, items-center (水平居中), justify-center (垂直居中)
          // pt-32 (increased from pt-16) to prevent overlap with navbar on mobile
          className="mobile-hero-no-blur relative w-full h-screen shrink-0 flex flex-col items-center justify-center pt-20 md:pt-16 overflow-hidden"
        >

          {/* Terminal Frame */}
          <section
            // Removed 'hidden' to show on mobile
            className="hero-frame flex w-full md:w-full max-w-[1800px] h-[90vh] relative z-20"
          >
            <div className="hero-terminal h-full w-full">
              <TerminalPanel />
            </div>
          </section>

          {/* Scroll Down Indicator */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 1 }}
            className="absolute bottom-2 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 cursor-pointer z-10 group"
            onClick={() => {
              smoothScrollTo('#about', { duration: 1200, easing: 'ios', offset: 60 });
            }}
          >
            <motion.div
              className="relative"
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            >
              <div className="absolute inset-0 bg-primary blur-xl opacity-20 group-hover:opacity-40 transition-opacity rounded-full" />
              <ChevronsDown className="w-8 h-8 text-primary drop-shadow-[0_0_10px_rgba(var(--primary),0.8)]" />
            </motion.div>
          </motion.div>

        </motion.div>

        {/* 其他 Sections... */}
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
