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

export interface Certification {
  id: string;
  name: string;
  provider: string;
  date: string;
  validUntil: string;
  logo: string;
  color: string;
  iconColor: string;
  link: string;
}

export interface Coursework {
  id: string;
  name: string;
  provider: string;
  date: string;
  grade: string;
  type: string;
}

export type ProfileData = {
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

  };
  education: {
    school: string;
    degree: string;
    period: string;
    logo: string;
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
      website?: string;
      repo?: string;
    };
    metrics?: {
      stars?: string;
      users?: string;
    };
  }[];
  modules: TechDomain[];
  certifications: Certification[];
  coursework: Coursework[];
};
