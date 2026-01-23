import type { SidebarsConfig } from "@docusaurus/plugin-content-docs";

const sidebars: SidebarsConfig = {
  // CS Core Sidebar
  csSidebar: [
    {
      type: "doc",
      id: "cs/index",
      label: "CS Core Overview",
    },
    {
      type: "category",
      label: "Algorithms & DS",
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
      label: "System Design",
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
      label: "Database Internals",
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
      label: "Network & OS",
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
      label: "AI & Agents Overview",
    },
    {
      type: "category",
      label: "LLM Foundational",
      collapsed: false,
      items: [
        {
          type: "doc",
          id: "ai/llm-fundamentals/introduction",
          label: "Introduction",
        },
        {
          type: "doc",
          id: "ai/llm-fundamentals/tokenization",
          label: "Tokenization",
        },
        {
          type: "doc",
          id: "ai/llm-fundamentals/embeddings",
          label: "Embeddings",
        },
        {
          type: "doc",
          id: "ai/llm-fundamentals/transformer-architecture",
          label: "Transformer Architecture",
        },
        {
          type: "doc",
          id: "ai/llm-fundamentals/training-pipeline",
          label: "Training Pipeline",
        },
        {
          type: "doc",
          id: "ai/llm-fundamentals/inference",
          label: "Inference",
        },
        {
          type: "doc",
          id: "ai/llm-fundamentals/limitations",
          label: "Cognitive Limitations",
        },
      ],
    },
    {
      type: "category",
      label: "Prompt Engineering",
      collapsed: false,
      items: [
        {
          type: "doc",
          id: "ai/prompt-engineering/index",
          label: "Overview",
        },
        {
          type: "doc",
          id: "ai/prompt-engineering/introduction",
          label: "1. Introduction",
        },
        {
          type: "doc",
          id: "ai/prompt-engineering/prompt-anatomy",
          label: "2.1 Anatomy of a Prompt",
        },
        {
          type: "doc",
          id: "ai/prompt-engineering/reasoning-patterns",
          label: "2.2 Core Reasoning Patterns",
        },
        {
          type: "doc",
          id: "ai/prompt-engineering/structured-output",
          label: "2.3 Structured Output",
        },
        {
          type: "doc",
          id: "ai/prompt-engineering/spring-ai",
          label: "2.4 Spring AI Implementation",
        },
        {
          type: "doc",
          id: "ai/prompt-engineering/evaluation-versioning",
          label: "2.5 Evaluation & Versioning",
        },
        {
          type: "doc",
          id: "ai/prompt-engineering/advanced-techniques",
          label: "3.1 Advanced Techniques",
        },
        {
          type: "doc",
          id: "ai/prompt-engineering/multimodal",
          label: "3.2 Multi-modal Prompting",
        },
        {
          type: "doc",
          id: "ai/prompt-engineering/agent-orchestration",
          label: "3.3 Agent Orchestration",
        },
      ],
    },
    {
      type: "category",
      label: "RAG",
      collapsed: false,
      items: [
        {
          type: "doc",
          id: "ai/rag/index",
          label: "Overview",
        },
      ],
    },
    {
      type: "category",
      label: "Agents",
      collapsed: false,
      items: [
        {
          type: "doc",
          id: "ai/agents/index",
          label: "Overview",
        },
        {
          type: "doc",
          id: "ai/agents/introduction",
          label: "1. Core Concepts & Definition",
        },
        {
          type: "doc",
          id: "ai/agents/architecture",
          label: "2. Architecture Components",
        },
        {
          type: "doc",
          id: "ai/agents/design-patterns",
          label: "3. Design Patterns",
        },
        {
          type: "doc",
          id: "ai/agents/frameworks",
          label: "4. Frameworks & Tech Stack",
        },
        {
          type: "doc",
          id: "ai/agents/engineering",
          label: "5. Engineering & Production",
        },
        {
          type: "doc",
          id: "ai/agents/frontier",
          label: "6. Frontier Trends",
        },
      ],
    },
    {
      type: "category",
      label: "MCP",
      collapsed: false,
      items: [
        {
          type: "doc",
          id: "ai/mcp/index",
          label: "Overview",
        },
        {
          type: "doc",
          id: "ai/mcp/interview-qa",
          label: "Interview Q&A",
        },
      ],
    },
    {
      type: "category",
      label: "Context Engineering",
      collapsed: false,
      items: [
        {
          type: "doc",
          id: "ai/context-engineering/index",
          label: "Overview",
        },
      ],
    },
    {
      type: "category",
      label: "AgentOps and Security",
      collapsed: false,
      items: [
        {
          type: "doc",
          id: "ai/agentops-security/index",
          label: "Overview",
        },
      ],
    },
    {
      type: "doc",
      id: "ai/internship/internship",
      label: "Java & AI Internship Guide",
    },
  ],

  // Engineering Sidebar
  engineeringSidebar: [
    {
      type: "doc",
      id: "engineering/index",
      label: "Engineering Overview",
    },
    {
      type: "category",
      label: "Backend (Java)",
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
      label: "Frontend",
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
      label: "DevOps & Cloud",
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
      label: "Dev Tools",
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
      label: "Case Studies Overview",
    },
    {
      type: "doc",
      id: "projects/rag-knowledge-base",
      label: "RAG Knowledge Base",
    },
    {
      type: "doc",
      id: "projects/ecommerce-refactor",
      label: "E-commerce Refactor",
    },
    // Add more case studies here
  ],
};

export default sidebars;
