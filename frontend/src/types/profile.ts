export interface TechItem {
  name: string;
  version: string;
  status: string;
  icon?: string;
}

export interface TechDomain {
  category: string;
  path: string;
  items: TechItem[];
}

export type ProfileData = {
  hero: {
    name: string;
    role: string;
    intro: string;
    avatar: string;
    status: string;
    github?: string;
  };
  about: {
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
    educationList: Array<{
      degree: string;
      school: string;
      period: string;
      logo: string;
    }>;
  };
  education: {
    school: string;
    degree: string;
    period: string;
    highlights: string[];
  }[];
  experience: {
    company: string;
    title: string;
    period: string;
    location: string;
    achievements: string[];
    tech: string[];
  }[];
  projects: {
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
  }[];
  modules: TechDomain[];
};
