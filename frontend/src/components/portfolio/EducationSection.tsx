/**
 * EducationSection Component
 * Displays academic background with school logos and highlights
 * Borderless design with horizontal layout and staggered animations
 */

"use client";

import { TimelineItem } from "@/types/portfolio";
import { StaggeredList, StaggeredItem } from "./ScrollReveal";
import Image from "next/image";

interface EducationSectionProps {
  items: TimelineItem[];
}

/**
 * Extract domain from school name for Clearbit logo fetch
 * Falls back to first letter of school name
 */
function extractDomain(schoolName: string): string {
  // Simple heuristic: convert to lowercase and remove spaces
  // e.g., "York University" -> "yorkuniversity.com"
  const base = schoolName.toLowerCase().replace(/\s+/g, "").replace(/[^a-z0-9]/g, "");

  // Special cases for common schools
  const domainMap: Record<string, string> = {
    yorkuniversity: "yorku.ca",
    york: "yorku.ca",
    universityoftoronto: "utoronto.ca",
    uoft: "utoronto.ca",
    stanford: "stanford.edu",
    harvard: "harvard.edu",
    mit: "mit.edu",
    amazon: "amazon.com",
    aws: "amazon.com",
    google: "google.com",
  };

  return domainMap[base] || `${base}.com`;
}

/**
 * AvatarCircle Component
 * Displays school logo with white circular background
 * Falls back to first letter if logo fails to load
 */
interface AvatarCircleProps {
  schoolName: string;
  domain?: string;
}

function AvatarCircle({ schoolName, domain }: AvatarCircleProps) {
  const [imgError, setImgError] = React.useState(false);
  const logoUrl = domain
    ? `https://logo.clearbit.com/${domain}?size=128`
    : undefined;

  const firstLetter = schoolName.charAt(0).toUpperCase();

  if (!logoUrl || imgError) {
    // Fallback: Show first letter in white circle
    return (
      <div className="flex-shrink-0 w-16 h-16 bg-white rounded-full flex items-center justify-center">
        <span className="text-2xl font-bold text-gray-900">{firstLetter}</span>
      </div>
    );
  }

  return (
    <div className="flex-shrink-0 w-16 h-16 bg-white rounded-full overflow-hidden relative">
      <Image
        src={logoUrl}
        alt={schoolName}
        fill
        className="object-cover"
        onError={() => setImgError(true)}
        unoptimized
      />
    </div>
  );
}

const React = require("react"); // For useState

export default function EducationSection({ items }: EducationSectionProps) {
  if (!items || items.length === 0) {
    return null;
  }

  return (
    <StaggeredList className="space-y-0">
      {items.map((item, index) => (
        <StaggeredItem
          key={index}
          className="flex items-center gap-6 py-8 border-b border-white/5 transition-all duration-300 hover:bg-white/[0.02] -mx-6 px-6"
        >
          {/* Avatar with school logo */}
          <AvatarCircle schoolName={item.heading} domain={item.domain} />

          {/* Text Details */}
          <div className="flex-1 min-w-0">
            {/* School Name */}
            <h3 className="text-2xl font-bold text-white mb-1">
              {item.heading}
            </h3>

            {/* Degree */}
            <p className="text-lg text-white/60 mb-1">{item.subheading}</p>

            {/* Period */}
            <p className="text-sm font-mono text-white/40 mt-1">
              {item.period}
            </p>

            {/* Highlights (optional) */}
            {item.bullets && item.bullets.length > 0 && (
              <ul className="mt-3 space-y-1">
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
