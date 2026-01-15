"use client";

import { useState, useEffect } from "react";
import profile from "../data/profile.json";
import NavBar from "../components/NavBar";
import TerminalPanel from "../components/terminal/TerminalPanel";
import { MatrixRain } from "../components/effects/MatrixRain";
import HyperTunnel from "../components/ui/HyperTunnel";
import PortfolioSections from "../components/portfolio/PortfolioSections";
import ContactModal from "../components/terminal/ContactModal";

export default function Home() {
  const [isContactOpen, setIsContactOpen] = useState(false);

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
      <div className="hidden md:block">
        <NavBar hero={profile.hero} />
      </div>

      {/* === 内容层 === */}
      <main className="relative w-full">
        {/* Hero Section - Full viewport with top padding for fixed nav */}
        <div className="w-full min-h-screen flex items-start justify-center pt-10 md:pt-16">
          <section className="hero-frame w-[90%] md:w-[80%] h-[calc(100vh-80px)]">
            <div className="hero-terminal h-full">
              <TerminalPanel />
            </div>
          </section>
        </div>

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
