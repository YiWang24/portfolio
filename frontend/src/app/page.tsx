import profile from "../data/profile.json";
import NavBar from "../components/NavBar";
import TerminalPanel from "../components/terminal/TerminalPanel";
import { MatrixRain } from "../components/effects/MatrixRain";
import HyperTunnel from "../components/ui/HyperTunnel";
import PortfolioSections from "../components/portfolio/PortfolioSections";

export default function Home() {
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
      <main className="relative w-full ">
        {/* Hero Section - Full viewport minus nav */}
        <div className="w-full h-[calc(100vh-60px)]">
          <section className="hero-frame w-full h-full">
            <div className="hero-terminal">
              <TerminalPanel />
            </div>
          </section>
        </div>
        
        {/* Portfolio Sections */}
        <PortfolioSections data={profile} />
      </main>
    </>
  );
}
