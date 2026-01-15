/**
 * PortfolioSections Component
 *
 * Main organizer for all portfolio sections.
 */

"use client";

import { ProfileData } from "@/types/profile";
import { AboutSection } from "./AboutSection";
import { SparklesCore } from "@/components/ui/sparkles";
import { DotPattern } from "@/components/ui/dot-pattern";
import { motion } from "framer-motion";

interface PortfolioSectionsProps {
  data: ProfileData;
}

export default function PortfolioSections({ data }: PortfolioSectionsProps) {
  return (
    <div className="relative w-full">
      {/* ===== Content Container - Full Width ===== */}
      <div className="relative z-10 w-full">
        {/* About Section - Full Viewport */}
        <AboutSection about={data.about} />
      </div>
    </div>
  );
}
