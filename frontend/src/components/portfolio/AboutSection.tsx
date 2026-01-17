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
    image?: string;
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
      className="group relative flex items-center justify-center w-12 h-12 rounded-xl border border-border text-muted-foreground hover:text-emerald-400 hover:border-emerald-500/50 hover:shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all duration-300"
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

// Focus Area Feature Card - Refined Light/Dark Mode
function FocusAreaCard({
  area,
  index,
}: {
  area: AboutData["focusAreas"][number];
  index: number;
}) {
  const IconComponent = focusAreaIcons[area.icon] || Bot;
  const bgImage = area.image || "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?q=80&w=800&auto=format&fit=crop";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      whileHover={{ y: -6, scale: 1.02 }}
      className="h-full min-h-[200px]"
    >
      <Card className="group relative h-full flex flex-col overflow-hidden border border-slate-200 dark:border-white/10 bg-white dark:bg-zinc-900 shadow-sm hover:shadow-lg hover:-translate-y-1 dark:hover:shadow-2xl transition-all duration-500">

        {/* Background Image Layer - Visible ONLY in Dark Mode */}
        <div className="hidden dark:block absolute inset-0 z-0 overflow-hidden">
          <img
            src={bgImage}
            alt={area.title}
            className="w-full h-full object-cover opacity-40 transition-transform duration-700 ease-out group-hover:scale-110 grayscale-[30%] group-hover:grayscale-0"
          />
          {/* Cinematic Overlay - Gradient for Text Readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent opacity-90 transition-opacity duration-300 group-hover:opacity-80" />
        </div>

        <CardHeader className="relative z-10 p-5 pb-2">
          {/* Icon container */}
          <div className="flex items-center justify-between mb-3">
            <motion.div
              className="w-10 h-10 rounded-lg flex items-center justify-center transition-colors duration-300
                         bg-slate-100 border border-slate-200 text-teal-700
                         dark:bg-white/10 dark:backdrop-blur-md dark:border-white/20 dark:text-zinc-100 dark:group-hover:text-teal-300"
              whileHover={{ rotate: 5 }}
            >
              <IconComponent className="w-5 h-5" />
            </motion.div>
          </div>

          <CardTitle className="text-lg font-bold tracking-tight transition-colors duration-300
                                text-slate-900 group-hover:text-teal-600
                                dark:text-white dark:drop-shadow-md dark:group-hover:text-teal-200">
            {area.title}
          </CardTitle>
        </CardHeader>

        <CardContent className="relative z-10 flex-1 flex flex-col p-5 pt-1">
          <CardDescription className="text-sm mb-4 line-clamp-2 font-medium transition-colors
                                      text-slate-500
                                      dark:text-zinc-300 dark:drop-shadow-sm">
            {area.description}
          </CardDescription>

          {/* Tech Stack Badges */}
          <div className="mt-auto flex flex-wrap gap-1.5">
            {area.tags.map((tag) => (
              <Badge
                key={tag}
                variant="secondary"
                className="text-[10px] font-mono px-2 py-0.5 transition-all duration-300
                           bg-white border border-slate-200 text-slate-600 hover:border-teal-500
                           dark:bg-white/10 dark:backdrop-blur-sm dark:text-zinc-200 dark:border-white/10 dark:hover:bg-teal-500/30 dark:hover:text-white dark:hover:border-teal-400/50"
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
            <div className="relative p-4 rounded-2xl border border-slate-200 dark:border-border flex flex-col gap-2 bg-white dark:bg-transparent shadow-lg shadow-slate-200/50 dark:shadow-none">
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
                      <AvatarFallback className="bg-card text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-br from-emerald-300 to-emerald-500 font-['Outfit']">
                        {about.name.split(" ").map(n => n[0]).join("")}
                      </AvatarFallback>
                    </Avatar>
                  </div>

                  {/* Online status indicator with pulse ring */}
                  <div className="absolute bottom-2 right-2">
                    <div className="absolute inset-0 w-5 h-5 rounded-full bg-emerald-500 animate-pulse-ring" />
                    <div className="relative w-5 h-5 rounded-full bg-emerald-500 border-4 border-background" />
                  </div>
                </div>
              </motion.div>

              {/* Name & Role */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <h1 className="text-2xl font-bold tracking-tight text-foreground">
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
                className="text-sm text-muted-foreground leading-relaxed"
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
                <span className="font-sans text-sm text-muted-foreground/80">
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
            className="p-6 rounded-2xl border border-border"
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
                  <div className="w-12 h-12 rounded-xl bg-card border border-border flex items-center justify-center flex-shrink-0 overflow-hidden group-hover:border-emerald-500/30 transition-colors duration-300">
                    <img
                      src={edu.logo}
                      alt={edu.school}
                      className="w-8 h-8 object-contain mix-blend-multiply dark:mix-blend-normal"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-semibold text-foreground mb-0.5 group-hover:text-emerald-300 transition-colors duration-300">
                      {edu.degree}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {edu.school}
                    </p>
                    <p className="font-sans text-xs text-muted-foreground/80 mt-0.5">
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
              <span className="text-zinc-900 dark:text-transparent dark:bg-clip-text dark:bg-gradient-to-b dark:from-foreground dark:via-foreground dark:to-muted-foreground">
                Building intelligent AI systems that bridge robust backend architecture with{" "}
              </span>
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-teal-600 via-cyan-500 to-teal-500 dark:from-emerald-400 dark:via-cyan-400 dark:to-emerald-400 animate-shimmer">
                adaptive agent solutions
              </span>
              <span className="text-zinc-900 dark:text-transparent dark:bg-clip-text dark:bg-gradient-to-b dark:from-foreground dark:via-foreground dark:to-muted-foreground">
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
            <p className="font-sans text-lg text-muted-foreground leading-7">
              {about.bio}
            </p>
          </motion.div>

          {/* Focus Areas Label */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <h3 className="font-sans text-sm font-medium text-muted-foreground uppercase tracking-wider mb-4">
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
