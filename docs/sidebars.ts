import type { SidebarsConfig } from "@docusaurus/plugin-content-docs";

const sidebars: SidebarsConfig = {
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
