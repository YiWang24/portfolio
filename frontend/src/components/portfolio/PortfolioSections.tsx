/**
 * PortfolioSections Component
 *
 * Main organizer for all portfolio sections.
 */

"use client";

import { ProfileData } from "@/types/profile";
import { AboutSection } from "./AboutSection";
import { ExperienceSection } from "./ExperienceSection";
import { SparklesCore } from "@/components/ui/sparkles";
import { DotPattern } from "@/components/ui/dot-pattern";
import { motion } from "framer-motion";
import ScrollReveal from "../ui/ScrollReveal";
import PerspectiveReveal from "../ui/PerspectiveReveal";

interface PortfolioSectionsProps {
  data: ProfileData;
}

export default function PortfolioSections({ data }: PortfolioSectionsProps) {
  return (
    <div className="relative w-full">
      {/* ===== Content Container - Full Width ===== */}
      <div className="relative z-10 w-full">
        {/* About Section - Full Viewport with Scroll Snap */}
        <ScrollReveal width="full">
          <div id="about" className="min-h-screen w-full flex items-center justify-center snap-start pt-20 relative">
            <AboutSection about={data.about} />

            {/* Connecting Line to Next Section */}
            <div className="absolute bottom-0 left-1/2 w-px h-24 bg-gradient-to-b from-transparent to-cyan-500/50 hidden md:block" />
          </div>
        </ScrollReveal>

        {/* Experience Section - 3D Perspective Entrance */}
        <PerspectiveReveal className="w-full">
          <div id="experience" className="snap-start relative">
            {/* Connecting Line from Previous Section */}
            <div className="absolute top-0 left-1/2 w-px h-24 bg-gradient-to-b from-cyan-500/50 to-transparent hidden md:block" />

            <ExperienceSection experience={data.experience} />
          </div>
        </PerspectiveReveal>
      </div>
    </div>
  );
}
