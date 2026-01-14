export type ProfileData = {
  hero: {
    name: string;
    role: string;
    intro: string;
    avatar: string;
    status: string;
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
    achievements: string[];
  }[];
  projects: {
    title: string;
    summary: string;
    tech: string[];
    links: {
      demo?: string;
      repo?: string;
    };
    metrics: {
      stars: string;
      users: string;
    };
  }[];
  techStack: {
    category: string;
    items: string[];
  }[];
};
