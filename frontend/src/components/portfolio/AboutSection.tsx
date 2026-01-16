/**
 * AboutSection Component
 *
 * Asymmetric split layout with balanced columns.
 * Left: Bio/Background Sidebar - Profile Card + Education Card + Availability
 * Right: Narrative Column - Tagline, bio, and Focus Areas grid
 * 
 * Uses shadcn Card components for consistent styling.
 */

"use client";


import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SectionBadge } from "@/components/portfolio/SectionBadge";
import { motion } from "framer-motion";
import {
  Github,
  Linkedin,
  Mail,
  Twitter,
  Download,
  ExternalLink,
  GraduationCap,
  Bot,
  Server,
  Cloud,
  Brain,
  LucideIcon,
} from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

interface AboutData {
  name: string;
  role: string;
  avatar: string;
  location: string;
  experience: string;
  tagline: string;
  bio: string;
  focusAreas: Array<{
    title: string;
    icon: string;
    description: string;
    tags: string[];
  }>;
  socials: {
    github?: string;
    linkedin?: string;
    email?: string;
    twitter?: string;
  };
}

export interface EducationItem {
  degree: string;
  school: string;
  period: string;
  logo: string;
}

interface AboutSectionProps {
  about: AboutData;
  education: EducationItem[];
}

// Social link component with glowing border effect
function SocialLink({
  href,
  icon: Icon,
  label,
}: {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}) {
  return (
    <motion.a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      whileHover={{ y: -2, scale: 1.08 }}
      whileTap={{ scale: 0.95 }}
      className="group relative flex items-center justify-center w-12 h-12 rounded-xl border border-white/10 text-zinc-400 hover:text-emerald-400 hover:border-emerald-500/50 hover:shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all duration-300"
    >
      {/* Glow effect on hover */}
      <div className="absolute inset-0 rounded-xl bg-emerald-500/0 group-hover:bg-emerald-500/5 transition-all duration-300" />
      <Icon className="relative z-10 w-5 h-5" />
    </motion.a>
  );
}

// Icon mapping for focus areas
const focusAreaIcons: Record<string, LucideIcon> = {
  Bot,
  Server,
  Cloud,
  Brain,
};

// Focus Area Feature Card - Tech Bento Style
function FocusAreaCard({
  area,
  index,
}: {
  area: AboutData["focusAreas"][number];
  index: number;
}) {
  const IconComponent = focusAreaIcons[area.icon] || Bot;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      whileHover={{ y: -6, scale: 1.02 }}
      className="h-full"
    >
      <Card className="group h-full flex flex-col bg-gradient-to-b from-zinc-900 via-zinc-900/95 to-zinc-950 border border-white/10 hover:border-emerald-500/40 hover:from-zinc-800/90 transition-all duration-300 hover:shadow-lg hover:shadow-emerald-500/5">
        <CardHeader className="p-4 pb-2">
          {/* Icon container with rotation on hover */}
          <motion.div
            className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center mb-3 group-hover:bg-emerald-500/20 transition-colors duration-300"
            whileHover={{ scale: 1.1, rotate: 5 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            <IconComponent className="w-6 h-6 text-emerald-400 group-hover:text-emerald-300 transition-colors duration-300" />
          </motion.div>
          <CardTitle className="text-base font-semibold text-zinc-100 group-hover:text-emerald-300 transition-colors duration-300">
            {area.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col p-4 pt-0">
          <CardDescription className="text-xs text-zinc-400 leading-relaxed mb-3 line-clamp-2">
            {area.description}
          </CardDescription>
          {/* Tech Stack Badges - fills bottom space */}
          <div className="mt-auto flex flex-wrap gap-1.5">
            {area.tags.map((tag) => (
              <Badge
                key={tag}
                variant="secondary"
                className="bg-black/50 text-[10px] font-mono text-zinc-400 border border-zinc-700/50 hover:text-white hover:border-emerald-500/40 transition-colors duration-200 px-2 py-0.5"
              >
                {tag}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div >
  );
}

export function AboutSection({ about, education }: AboutSectionProps) {
  const socialLinks = [
    about.socials.github && { icon: Github, href: about.socials.github, label: "GitHub" },
    about.socials.linkedin && { icon: Linkedin, href: about.socials.linkedin, label: "LinkedIn" },
    about.socials.email && { icon: Mail, href: about.socials.email, label: "Email" },
    about.socials.twitter && { icon: Twitter, href: about.socials.twitter, label: "Twitter" },
  ].filter(Boolean) as Array<{ icon: React.ComponentType<{ className?: string }>; href: string; label: string }>;

  return (
    <section className="relative w-full min-h-[calc(100vh-100px)] flex items-center justify-center overflow-hidden py-4 md:py-8">
      {/* Main Container - Asymmetric Split */}
      <div className="relative z-10 w-full max-w-[95%] xl:max-w-[1300px] grid lg:grid-cols-[340px_1fr] gap-8 lg:gap-12 items-start">
        {/* ===== Left Column: Profile Sidebar ===== */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-4"
        >
          {/* Profile Section */}
          <div className="relative">
            <div className="relative p-4 rounded-2xl border border-zinc-800/50 flex flex-col gap-2">
              {/* Avatar with status indicator */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <div className="relative w-32 h-32">
                  {/* Gradient ring */}
                  <div className="absolute inset-0 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 p-[3px]">
                    <Avatar className="w-full h-full">
                      <AvatarImage
                        src={about.avatar}
                        alt={about.name}
                        className="object-cover"
                      />
                      <AvatarFallback className="bg-zinc-900 text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-br from-emerald-300 to-emerald-500 font-['Outfit']">
                        {about.name.split(" ").map(n => n[0]).join("")}
                      </AvatarFallback>
                    </Avatar>
                  </div>

                  {/* Online status indicator with pulse ring */}
                  <div className="absolute bottom-2 right-2">
                    <div className="absolute inset-0 w-5 h-5 rounded-full bg-emerald-500 animate-pulse-ring" />
                    <div className="relative w-5 h-5 rounded-full bg-emerald-500 border-4 border-zinc-950" />
                  </div>
                </div>
              </motion.div>

              {/* Name & Role */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <h1 className="text-2xl font-bold tracking-tight text-white">
                  {about.name}
                </h1>
                <p className="font-medium bg-gradient-to-r from-emerald-400 to-cyan-500 bg-clip-text text-transparent">
                  {about.role}
                </p>
              </motion.div>

              {/* Short bio */}
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="text-sm text-zinc-500 leading-relaxed"
              >
                Helping startups build resilient systems and delightful user experiences through engineering excellence.
              </motion.p>

              {/* Availability Status */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.45 }}
                className="flex items-center gap-3"
              >
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="font-sans text-sm text-zinc-400">
                  Available for new opportunities
                </span>
              </motion.div>

              {/* Download Resume Button */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
              >
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="h-10 px-8 rounded-full bg-transparent border border-emerald-500/50 text-emerald-400 hover:bg-emerald-500/10 hover:border-emerald-400 font-sans text-sm font-medium transition-colors duration-300 flex items-center"
                >
                  <Download className="mr-2 w-4 h-4" />
                  Download Resume
                </motion.button>
              </motion.div>

              {/* Social Links */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.55 }}
                className="flex items-center gap-4"
              >
                {socialLinks.map((social) => (
                  <SocialLink
                    key={social.label}
                    href={social.href}
                    icon={social.icon}
                    label={social.label}
                  />
                ))}
              </motion.div>
            </div>
          </div>

          {/* Education Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="p-6 rounded-2xl border border-zinc-800/50"
          >
            {/* Education Header */}
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-emerald-400" />
              </div>
              <span className="font-sans text-sm font-semibold text-emerald-400 uppercase tracking-wider">
                Education
              </span>
            </div>

            {/* Education List */}
            <div className="space-y-5">
              {education && education.map((edu, index) => (
                <motion.div
                  key={edu.school}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.7 + index * 0.1 }}
                  className="flex items-start gap-4 group"
                >
                  {/* University Logo */}
                  <div className="w-12 h-12 rounded-xl bg-zinc-800/50 border border-zinc-700/50 flex items-center justify-center flex-shrink-0 overflow-hidden group-hover:border-emerald-500/30 transition-colors duration-300">
                    <img
                      src={edu.logo}
                      alt={edu.school}
                      className="w-8 h-8 object-contain"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-semibold text-white mb-0.5 group-hover:text-emerald-300 transition-colors duration-300">
                      {edu.degree}
                    </h3>
                    <p className="text-sm text-zinc-400">
                      {edu.school}
                    </p>
                    <p className="font-sans text-xs text-zinc-500 mt-0.5">
                      {edu.period}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </motion.div>

        {/* ===== Right Column: Narrative & Skills ===== */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="space-y-6"
        >
          {/* Section Badge */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.25 }}
          >
            <SectionBadge icon="about">About Me</SectionBadge>
          </motion.div>

          {/* Tagline / Headline */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.35 }}
          >
            <h2 className="font-sans text-3xl md:text-4xl lg:text-5xl font-bold leading-tight">
              <span className="bg-clip-text text-transparent bg-gradient-to-b from-white via-white to-zinc-400">
                Building intelligent AI systems that bridge robust backend architecture with{" "}
              </span>
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 via-cyan-400 to-emerald-400 animate-shimmer">
                adaptive agent solutions
              </span>
              <span className="bg-clip-text text-transparent bg-gradient-to-b from-white via-white to-zinc-400">
                .
              </span>
            </h2>
          </motion.div>

          {/* Bio */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.45 }}
            className="max-w-2xl"
          >
            <p className="font-sans text-lg text-zinc-400 leading-7">
              {about.bio}
            </p>
          </motion.div>

          {/* Focus Areas Label */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <h3 className="font-sans text-sm font-medium text-zinc-500 uppercase tracking-wider mb-4">
              Focus Areas
            </h3>
          </motion.div>

          {/* Focus Areas Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {about.focusAreas.map((area, index) => (
              <FocusAreaCard key={area.title} area={area} index={index} />
            ))}
          </div>
        </motion.div>
      </div>


    </section>
  );
}
