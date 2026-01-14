import profile from "../data/profile.json";
import CommandBar from "../components/CommandBar";
import SectionModule from "../components/SectionModule";
import TimelineList from "../components/TimelineList";
import ProjectGrid from "../components/ProjectGrid";
import TechStack from "../components/TechStack";
import TerminalPanel from "../components/terminal/TerminalPanel";
import { MatrixRain } from "../components/effects/MatrixRain";
import HyperTunnel from "../components/ui/HyperTunnel";

const education = profile.education.map((item) => ({
  heading: item.school,
  subheading: item.degree,
  period: item.period,
  bullets: item.highlights,
}));

const experience = profile.experience.map((item) => ({
  heading: item.company,
  subheading: item.title,
  period: item.period,
  bullets: item.achievements,
}));

export default function Home() {
  return (
    <>
      {/* === Matrix Rain Effect === */}
      <MatrixRain />

      {/* === 背景层：时空隧道透视效果 === */}
      <div className="fixed inset-0 z-[-1] h-full w-full">
        {/* 4面 3D 隧道背景 (HyperTunnel) */}
        <HyperTunnel />

        {/* 环境色彩光晕 */}
        <div className="absolute top-0 left-0 h-[500px] w-[500px] bg-purple-500/10 blur-[120px] rounded-full mix-blend-screen pointer-events-none" />
        <div className="absolute bottom-0 right-0 h-[500px] w-[500px] bg-emerald-500/10 blur-[120px] rounded-full mix-blend-screen pointer-events-none" />
      </div>

      {/* === Desktop Navbar (仅桌面端) === */}
      <div className="hidden md:block">
        <CommandBar hero={profile.hero} />
      </div>

      {/* === 内容层 === */}
      <main className="relative w-full selection:bg-emerald-500/30">
        {/* Hero Section - Full viewport minus nav */}
        <div className="w-full h-[calc(100vh-60px)]">
          <section className="hero-frame w-full h-full">
           

            <div className="hero-terminal">
              
              <TerminalPanel />
            </div>
          </section>
        </div>

        {/* Other Sections - Standard width */}
        <div className="w-full max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 pb-14 flex flex-col gap-8">
          <SectionModule id="education" title="Education">
            <TimelineList items={education} />
          </SectionModule>
          <SectionModule id="experience" title="Experience">
            <TimelineList items={experience} />
          </SectionModule>
          <SectionModule id="projects" title="Projects">
            <ProjectGrid projects={profile.projects} />
          </SectionModule>
          <SectionModule id="stack" title="Tech Stack">
            <TechStack stack={profile.techStack} />
          </SectionModule>
        </div>
      </main>
    </>
  );
}
