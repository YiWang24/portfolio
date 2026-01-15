/**
 * ExperienceSection Component
 * Displays work experience with flowing timeline layout
 * Left: Year/Period | Right: Company, Title, Achievements
 * Borderless design with hairline dividers and hover effects
 */

"use client";

import { TimelineItem } from "@/types/portfolio";
import { StaggeredList, StaggeredItem } from "./ScrollReveal";

interface ExperienceSectionProps {
  items: TimelineItem[];
}

export default function ExperienceSection({ items }: ExperienceSectionProps) {
  if (!items || items.length === 0) {
    return null;
  }

  return (
    <StaggeredList className="space-y-0">
      {items.map((item, index) => (
        <StaggeredItem
          key={index}
          className="group flex flex-col md:flex-row gap-6 py-8 border-b border-white/5 transition-all duration-200 -mx-6 px-6 hover:bg-white/[0.02]"
        >
          {/* Left column: Period (25% on desktop) */}
          <div className="w-full md:w-1/4">
            <p className="font-mono text-sm text-white/50 group-hover:text-emerald-400 transition-colors duration-200">
              {item.period}
            </p>
          </div>

          {/* Right column: Details (75% on desktop) */}
          <div className="w-full md:w-3/4">
            {/* Company Name */}
            <h3 className="text-xl font-semibold text-white mb-1">
              {item.heading}
            </h3>

            {/* Job Title */}
            <p className="text-white/70 mb-3">{item.subheading}</p>

            {/* Achievement Bullets (optional) */}
            {item.bullets && item.bullets.length > 0 && (
              <ul className="space-y-1">
                {item.bullets.map((bullet, bulletIndex) => (
                  <li
                    key={bulletIndex}
                    className="text-sm text-white/60 flex items-start"
                  >
                    <span className="mr-2 text-emerald-500">•</span>
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </StaggeredItem>
      ))}
    </StaggeredList>
  );
}
