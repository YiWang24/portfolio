/**
 * SectionBadge Component
 *
 * Reusable pill-shaped badge for section titles with icons.
 * Designed for use in section headers like "About Me", "Projects", etc.
 */

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  User,
  Code,
  Briefcase,
  GraduationCap,
  Mail,
  FileText,
  Award,
  Heart,
  FolderOpen,
  Cpu,
  Palette,
  Zap,
  type LucideIcon
} from "lucide-react";

/* ============================================================================
 * Icon Mapping
 * ============================================================================ */

export type SectionIconType =
  | "about"
  | "projects"
  | "experience"
  | "education"
  | "contact"
  | "resume"
  | "skills"
  | "blog"
  | "portfolio"
  | "tech"
  | "design"
  | "custom";

const SECTION_ICONS: Record<SectionIconType, LucideIcon> = {
  about: User,
  projects: FolderOpen,
  experience: Briefcase,
  education: GraduationCap,
  contact: Mail,
  resume: FileText,
  skills: Award,
  blog: FileText,
  portfolio: Code,
  tech: Cpu,
  design: Palette,
  custom: Zap,
};

/* ============================================================================
 * Types
 * ============================================================================ */

export interface SectionBadgeProps {
  /**
   * The icon to display before the text
   */
  icon?: SectionIconType | LucideIcon;
  /**
   * The badge text (will be uppercased automatically)
   */
  children: string;
  /**
   * Optional className for additional styling
   */
  className?: string;
  /**
   * Optional custom icon if using icon="custom"
   */
  customIcon?: LucideIcon;
}

/* ============================================================================
 * Component
 * ============================================================================ */

export function SectionBadge({
  icon = "custom",
  children,
  className,
  customIcon,
}: SectionBadgeProps) {
  const IconComponent =
    typeof icon === "string" ? SECTION_ICONS[icon] : icon;

  return (
    <Badge
      variant="outline"
      className={cn(
        // Base shape & size
        "rounded-full px-4 py-1.5",
        // Border
        "border-zinc-800",
        // Background
        "bg-zinc-900/50 backdrop-blur-sm",
        // Typography
        "text-xs font-medium uppercase tracking-widest",
        // Colors
        "text-cyan-400",
        // Spacing & layout
        "gap-2",
        // Transitions
        "transition-all duration-300",
        // Hover effects
        "hover:border-cyan-500/30 hover:bg-zinc-800/70 hover:shadow-[0_0_20px_rgba(34,211,238,0.15)]",
        className
      )}
    >
      {customIcon || <IconComponent className="w-[14px] h-[14px]" />}
      {children}
    </Badge>
  );
}

/* ============================================================================
 * Convenience Presets
 * ============================================================================ */

/**
 * Pre-configured badge for "About Me" section
 */
export function AboutBadge(props?: Omit<SectionBadgeProps, "icon" | "children">) {
  return <SectionBadge icon="about" {...props}>About Me</SectionBadge>;
}

/**
 * Pre-configured badge for "Projects" section
 */
export function ProjectsBadge(props?: Omit<SectionBadgeProps, "icon" | "children">) {
  return <SectionBadge icon="projects" {...props}>Projects</SectionBadge>;
}

/**
 * Pre-configured badge for "Experience" section
 */
export function ExperienceBadge(props?: Omit<SectionBadgeProps, "icon" | "children">) {
  return <SectionBadge icon="experience" {...props}>Experience</SectionBadge>;
}

/**
 * Pre-configured badge for "Education" section
 */
export function EducationBadge(props?: Omit<SectionBadgeProps, "icon" | "children">) {
  return <SectionBadge icon="education" {...props}>Education</SectionBadge>;
}

/**
 * Pre-configured badge for "Contact" section
 */
export function ContactBadge(props?: Omit<SectionBadgeProps, "icon" | "children">) {
  return <SectionBadge icon="contact" {...props}>Contact</SectionBadge>;
}

/**
 * Pre-configured badge for "Skills" section
 */
export function SkillsBadge(props?: Omit<SectionBadgeProps, "icon" | "children">) {
  return <SectionBadge icon="skills" {...props}>Skills</SectionBadge>;
}
