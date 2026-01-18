import type { SidebarsConfig } from "@docusaurus/plugin-content-docs";

const sidebars: SidebarsConfig = {
  // CS Core Sidebar
  csSidebar: [
    {
      type: "doc",
      id: "cs/index",
      label: "🧠 CS Core Overview",
    },
    {
      type: "category",
      label: "📊 Algorithms & DS",
      collapsed: false,
      items: [
        {
          type: "doc",
          id: "cs/algorithms/index",
          label: "Overview",
        },
        // Add more algorithm topics here as they are created
      ],
    },
    {
      type: "category",
      label: "🏛️ System Design",
      collapsed: false,
      items: [
        {
          type: "doc",
          id: "cs/system-design/index",
          label: "Overview",
        },
        // Add more system design topics here
      ],
    },
    {
      type: "category",
      label: "🗄️ Database Internals",
      collapsed: false,
      items: [
        {
          type: "doc",
          id: "cs/database/index",
          label: "Overview",
        },
        // Add more database topics here
      ],
    },
    {
      type: "category",
      label: "🌐 Network & OS",
      collapsed: false,
      items: [
        {
          type: "doc",
          id: "cs/network-os/index",
          label: "Overview",
        },
        // Add more network/OS topics here
      ],
    },
  ],

  // AI & Agents Sidebar
  aiSidebar: [
    {
      type: "doc",
      id: "ai/index",
      label: "🤖 AI & Agents Overview",
    },
    {
      type: "category",
      label: "🧠 LLM Fundamentals",
      collapsed: false,
      items: [
        {
          type: "doc",
          id: "ai/llm-fundamentals/index",
          label: "Overview",
        },
        // Add more LLM topics here
      ],
    },
    {
      type: "category",
      label: "📚 RAG Systems",
      collapsed: false,
      items: [
        {
          type: "doc",
          id: "ai/rag/index",
          label: "Overview",
        },
        // Add more RAG topics here
      ],
    },
    {
      type: "category",
      label: "🤝 Agents & Tools",
      collapsed: false,
      items: [
        {
          type: "doc",
          id: "ai/agents/index",
          label: "Overview",
        },
        // Add more agent topics here
      ],
    },
    {
      type: "category",
      label: "🍃 Spring AI",
      collapsed: false,
      items: [
        {
          type: "doc",
          id: "ai/spring-ai/index",
          label: "Overview",
        },
        // Add more Spring AI topics here
      ],
    },
  ],

  // Engineering Sidebar
  engineeringSidebar: [
    {
      type: "doc",
      id: "engineering/index",
      label: "🛠️ Engineering Overview",
    },
    {
      type: "category",
      label: "☕ Backend (Java)",
      collapsed: false,
      items: [
        {
          type: "doc",
          id: "engineering/backend/index",
          label: "Overview",
        },
        // Add more backend topics here
      ],
    },
    {
      type: "category",
      label: "⚛️ Frontend",
      collapsed: false,
      items: [
        {
          type: "doc",
          id: "engineering/frontend/index",
          label: "Overview",
        },
        // Add more frontend topics here
      ],
    },
    {
      type: "category",
      label: "☁️ DevOps & Cloud",
      collapsed: false,
      items: [
        {
          type: "doc",
          id: "engineering/devops/index",
          label: "Overview",
        },
        // Add more DevOps topics here
      ],
    },
    {
      type: "category",
      label: "🧰 Dev Tools",
      collapsed: false,
      items: [
        {
          type: "doc",
          id: "engineering/tools/index",
          label: "Overview",
        },
        // Add more tool topics here
      ],
    },
  ],

  // Case Studies Sidebar
  projectsSidebar: [
    {
      type: "doc",
      id: "projects/index",
      label: "🚀 Case Studies Overview",
    },
    {
      type: "doc",
      id: "projects/rag-knowledge-base",
      label: "📚 RAG Knowledge Base",
    },
    {
      type: "doc",
      id: "projects/ecommerce-refactor",
      label: "🛒 E-commerce Refactor",
    },
    // Add more case studies here
  ],

  // Legacy sidebar for existing docs
  tutorialSidebar: [
    {
      type: "doc",
      id: "intro/index",
      label: "🚀 Introduction",
    },
    {
      type: "doc",
      id: "react-playground/index",
      label: "🎮 React Playground",
    },
    {
      type: "doc",
      id: "diagrams/index",
      label: "📊 Diagrams",
    },
    {
      type: "doc",
      id: "api/index",
      label: "📚 API Reference",
    },
  ],
};

export default sidebars;
