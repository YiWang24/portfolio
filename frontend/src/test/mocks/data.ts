/**
 * Mock Data for Tests
 * Provides realistic test data for components
 */

import type { TerminalMessage } from "@/types/message";
import type { ProfileData } from "@/types/profile";

/**
 * Mock terminal messages
 */
export const mockTerminalMessages: TerminalMessage[] = [
  {
    id: "msg-1",
    role: "user",
    content: "Tell me about your experience",
    status: "completed",
  },
  {
    id: "msg-2",
    role: "agent",
    content: "I'm a full-stack developer with experience in building AI-powered applications...",
    status: "completed",
  },
  {
    id: "msg-3",
    role: "system",
    content: "Screen cleared.",
    status: "completed",
  },
];

/**
 * Mock thinking message (with function steps)
 */
export const mockThinkingMessage: TerminalMessage = {
  id: "msg-thinking",
  role: "agent",
  content: "",
  status: "thinking",
  functionSteps: [
    { id: "fn-1", name: "Initializing", status: "completed" },
    { id: "fn-2", name: "Searching knowledge base", status: "running" },
    { id: "fn-3", name: "Generating response", status: "running" },
  ],
};

/**
 * Mock streaming message
 */
export const mockStreamingMessage: TerminalMessage = {
  id: "msg-streaming",
  role: "agent",
  content: "This is a streaming response",
  status: "streaming",
};

/**
 * Mock error message
 */
export const mockErrorMessage: TerminalMessage = {
  id: "msg-error",
  role: "agent",
  content: "",
  status: "error",
};

/**
 * Mock profile data
 */
export const mockProfileData: ProfileData = {
  about: {
    name: "Yi Wang",
    role: "Full-Stack AI Developer",
    avatar: "https://example.com/avatar.jpg",
    location: "San Francisco, CA",
    experience: "5+ years",
    tagline: "Building intelligent AI systems",
    bio: "I'm a full-stack developer specializing in AI-powered applications using Next.js, React, and Spring Boot.",
    focusAreas: [
      {
        title: "AI Agent Development",
        icon: "Bot",
        description: "Building autonomous AI agents with reasoning capabilities",
        tags: ["LangChain", "OpenAI", "Vector DBs"],
      },
      {
        title: "Backend Architecture",
        icon: "Server",
        description: "Scalable microservices with Spring Boot and Kafka",
        tags: ["Spring Boot", "Kafka", "PostgreSQL"],
      },
      {
        title: "Frontend Engineering",
        icon: "Cloud",
        description: "Modern React applications with Next.js",
        tags: ["Next.js", "React", "TypeScript"],
      },
    ],
    socials: {
      email: "yi@example.com",
      github: "https://github.com/yiwang",
      linkedin: "https://linkedin.com/in/yiwang",
      twitter: "https://twitter.com/yiwang",
    },
  },
  education: [
    {
      school: "Stanford University",
      degree: "BS Computer Science",
      period: "2015 - 2019",
      logo: "https://example.com/stanford-logo.png",
    },
  ],
  modules: [],
  experience: [
    {
      company: "Tech Corp",
      title: "Senior Software Engineer",
      period: "2022 - Present",
      location: "San Francisco, CA",
      achievements: [
        "Leading AI agent development initiatives",
        "Built scalable microservices architecture",
      ],
      tech: ["Python", "LangChain", "FastAPI"],
    },
  ],
  projects: [
    {
      title: "AI Chat Platform",
      summary: "Real-time AI chat with streaming responses",
      tech: ["Next.js", "Spring Boot", "OpenAI"],
      links: {
        demo: "https://demo.example.com",
        repo: "https://github.com/yiwang/chat",
        website: "https://chat.example.com",
      },
      metrics: {
        stars: "123",
      },
    },
    {
      title: "Resume Parser",
      summary: "AI-powered resume parsing and analysis",
      tech: ["Python", "NLP", "FastAPI"],
      links: {
        repo: "https://github.com/yiwang/resume-parser",
      },
    },
  ],
  certifications: [
    {
      id: "cert-1",
      name: "AWS Solutions Architect",
      provider: "Amazon Web Services",
      date: "2023-01",
      validUntil: "2026-01",
      logo: "https://example.com/aws-logo.png",
      link: "https://aws.amazon.com/certification/",
      color: "bg-gradient-to-br from-orange-500/20 to-red-500/20",
      iconColor: "text-orange-500",
    },
  ],
  coursework: [
    {
      id: "course-1",
      name: "Machine Learning",
      provider: "Stanford",
      type: "Online",
      date: "2023",
      grade: "A",
    },
  ],
};

/**
 * Mock contact form data
 */
export const mockContactData = {
  valid: {
    email: "test@example.com",
    message: "This is a test message",
  },
  invalidEmail: {
    email: "not-an-email",
    message: "This is a test message",
  },
  emptyMessage: {
    email: "test@example.com",
    message: "",
  },
  longMessage: {
    email: "test@example.com",
    message: "A".repeat(2000), // Very long message
  },
};

/**
 * Mock chat messages for terminal testing
 */
export const mockChatMessages = {
  simple: "Tell me about yourself",
  complex: "What projects have you built and what technologies did you use?",
  command: "help",
  multiLine: "Tell me about:\n1. Your experience\n2. Your skills\n3. Your projects",
};
