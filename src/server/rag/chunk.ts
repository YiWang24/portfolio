export type ProfileJson = {
  about: {
    name: string;
    role: string;
    location: string;
    experience: string;
    tagline: string;
    bio: string;
    focusAreas?: Array<{
      title: string;
      description: string;
      tags?: string[];
    }>;
    socials?: {
      email?: string;
      github?: string;
      linkedin?: string;
    };
  };
  education?: Array<{
    degree: string;
    school: string;
    period: string;
  }>;
  experience?: Array<{
    title: string;
    company: string;
    period: string;
    location?: string;
    achievements?: string[];
    tech?: string[];
  }>;
  projects?: Array<{
    title: string;
    summary?: string;
    tech?: string[];
    links?: Record<string, string>;
  }>;
  skills?: Record<string, Array<string | { name: string; level?: string }>>;
};

export type DocumentChunk = {
  path: string;
  content: string;
};

export type TextChunk = {
  path: string;
  index: number;
  text: string;
  startPos: number;
  endPos: number;
};

export const CHUNK_SIZE = 1000;
export const CHUNK_OVERLAP = 100;

function joinTags(tags: string[] | undefined): string {
  return Array.isArray(tags) ? tags.join(", ") : "";
}

function convertAbout(about: ProfileJson["about"]): DocumentChunk {
  const lines: string[] = [];
  lines.push("# About Yi Wang", "");
  lines.push(`**Name:** ${about.name}`);
  lines.push(`**Role:** ${about.role}`);
  lines.push(`**Location:** ${about.location}`);
  lines.push(`**Experience:** ${about.experience} years`, "");
  lines.push(`**Tagline:** ${about.tagline}`, "");
  lines.push(`**Bio:** ${about.bio}`, "");

  if (about.focusAreas?.length) {
    lines.push("## Focus Areas", "");
    for (const area of about.focusAreas) {
      lines.push(`### ${area.title}`);
      lines.push(area.description);
      if (area.tags?.length) {
        lines.push(`**Technologies:** ${joinTags(area.tags)}`);
      }
      lines.push("");
    }
  }

  if (about.socials) {
    lines.push("## Contact Information", "");
    if (about.socials.email) lines.push(`**Email:** ${about.socials.email}`);
    if (about.socials.github) lines.push(`**GitHub:** ${about.socials.github}`);
    if (about.socials.linkedin) lines.push(`**LinkedIn:** ${about.socials.linkedin}`);
  }

  return { path: "personal/profile-about.md", content: lines.join("\n") };
}

function convertEducation(education: NonNullable<ProfileJson["education"]>): DocumentChunk {
  const lines: string[] = ["# Education Background", ""];
  for (const edu of education) {
    lines.push(`## ${edu.degree}`);
    lines.push(`**School:** ${edu.school}`);
    lines.push(`**Period:** ${edu.period}`, "");
  }
  return { path: "personal/education.md", content: lines.join("\n") };
}

function convertExperience(experience: NonNullable<ProfileJson["experience"]>): DocumentChunk {
  const lines: string[] = ["# Work Experience", ""];
  for (const job of experience) {
    lines.push(`## ${job.title}`);
    lines.push(`**Company:** ${job.company}`);
    lines.push(`**Period:** ${job.period}`);
    if (job.location) lines.push(`**Location:** ${job.location}`);
    lines.push("", "**Key Achievements:**");
    for (const achievement of job.achievements ?? []) {
      lines.push(`- ${achievement}`);
    }
    if (job.tech?.length) {
      lines.push("", `**Technologies Used:** ${joinTags(job.tech)}`, "");
    }
  }
  return { path: "personal/experience.md", content: lines.join("\n") };
}

function convertProjects(projects: NonNullable<ProfileJson["projects"]>): DocumentChunk {
  const lines: string[] = ["# Project Portfolio", ""];
  for (const project of projects) {
    lines.push(`## ${project.title}`, "");
    if (project.summary) lines.push(project.summary, "");
    if (project.tech?.length) lines.push(`**Tech Stack:** ${joinTags(project.tech)}`, "");
    if (project.links) {
      for (const [label, url] of Object.entries(project.links)) {
        const pretty = label.charAt(0).toUpperCase() + label.slice(1);
        lines.push(`**${pretty}:** ${url}`);
      }
    }
    lines.push("");
  }
  return { path: "projects/portfolio.md", content: lines.join("\n") };
}

function convertSkills(skills: NonNullable<ProfileJson["skills"]>): DocumentChunk {
  const lines: string[] = ["# Skills and Technologies", ""];
  for (const [category, list] of Object.entries(skills)) {
    lines.push(`## ${category}`, "");
    for (const skill of list) {
      if (typeof skill === "string") {
        lines.push(`- ${skill}`);
      } else {
        const level = skill.level ? ` (${skill.level})` : "";
        lines.push(`- ${skill.name}${level}`);
      }
    }
    lines.push("");
  }
  return { path: "personal/skills.md", content: lines.join("\n") };
}

export function profileToDocuments(profile: ProfileJson): DocumentChunk[] {
  const docs: DocumentChunk[] = [];
  docs.push(convertAbout(profile.about));
  if (profile.education?.length) docs.push(convertEducation(profile.education));
  if (profile.experience?.length) docs.push(convertExperience(profile.experience));
  if (profile.projects?.length) docs.push(convertProjects(profile.projects));
  if (profile.skills) docs.push(convertSkills(profile.skills));
  return docs;
}

export function splitText(text: string, path: string): TextChunk[] {
  const chunks: TextChunk[] = [];
  if (!text || !text.trim()) return chunks;

  const length = text.length;
  let chunkIndex = 0;
  const stride = CHUNK_SIZE - CHUNK_OVERLAP;

  for (let start = 0; start < length; start += stride) {
    let end = Math.min(start + CHUNK_SIZE, length);

    if (end < length) {
      const lastSpace = text.lastIndexOf(" ", end);
      if (lastSpace > start) end = lastSpace;
    }

    const slice = text.slice(start, end).trim();
    if (slice.length > 0) {
      chunks.push({ path, index: chunkIndex++, text: slice, startPos: start, endPos: end });
    }

    if (end >= length) break;
  }

  return chunks;
}

export function chunkProfile(profile: ProfileJson): TextChunk[] {
  return profileToDocuments(profile).flatMap((doc) => splitText(doc.content, doc.path));
}
