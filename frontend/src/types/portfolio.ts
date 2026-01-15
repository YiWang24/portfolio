// Portfolio Types for Borderless Immersive Layout
// These types support the JSON-driven data configuration for portfolio sections

export interface TimelineItem {
  heading: string; // Company name or School name
  subheading: string; // Job title or Degree
  period: string; // "2022 - Present" or "2018 - 2022"
  bullets?: string[]; // Achievement list (optional)
  domain?: string; // For Clearbit logo fetch (e.g., "yorku.ca")
}

export interface ProjectItem {
  title: string;
  summary: string;
  tech: string[];
  links?: {
    demo?: string;
    repo?: string;
  };
  metrics?: {
    stars?: string;
    users?: string;
  };
}

export interface StackGroup {
  category: string;
  items: string[];
}

export interface PortfolioData {
  education: TimelineItem[];
  experience: TimelineItem[];
  projects: ProjectItem[];
  techStack: StackGroup[];
}
