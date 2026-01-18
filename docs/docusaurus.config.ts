// @ts-check
import { themes } from "prism-react-renderer";
const npm2yarn = require("@docusaurus/remark-plugin-npm2yarn");

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: "CS Docs",
  tagline: "Documentation for Full Stack & AI Engineering",
  favicon: "img/favicon.svg",

  // Set the production url of your site here
  url: "https://www.yiw.me",
  // Set the /<baseUrl>/ to <baseUrl>/docs for serving under /docs path
  baseUrl: "/documentation/",

  // GitHub pages deployment config
  organizationName: "YiWang24",
  projectName: "portfolio",
  deploymentBranch: "main",

  onBrokenLinks: "ignore",
  onBrokenMarkdownLinks: "warn",

  // Even if you don't use internalization, you can use this field to set useful
  // metadata like html lang. For example, if your site is Chinese, you may want
  // to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: "en",
    locales: ["en"],
  },

  presets: [
    [
      "classic",
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: require.resolve("./sidebars.ts"),
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          editUrl: "https://github.com/YiWang24/portfolio/tree/main/docs/",
          // npm2yarn: auto-generate npm/yarn/pnpm tabs for install commands
          remarkPlugins: [[npm2yarn, { sync: true }]],
        },
        blog: {
          showReadingTime: true,
          authorsMapPath: "authors.yml",
          feedOptions: {
            type: ["rss", "atom"],
            copyright: `Copyright © ${new Date().getFullYear()} Yi Wang. Built with Docusaurus.`,
          },
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          editUrl: "https://github.com/YiWang24/portfolio/tree/main/docs/",
          remarkPlugins: [[npm2yarn, { sync: true }]],
        },
        theme: {
          customCss: require.resolve("./src/css/custom.css"),
        },
      }),
    ],
  ],

  // Themes for enhanced functionality
  themes: [
    "@docusaurus/theme-live-codeblock", // Live React code editing
    "@docusaurus/theme-mermaid", // Mermaid diagrams support
    // Note: docusaurus-theme-github-codeblock removed due to conflict with live-codeblock
  ],

  // Plugins
  plugins: [
    "docusaurus-plugin-image-zoom", // Click to zoom images
    "docusaurus-plugin-copy-page-button", // Copy entire page as markdown
  ],

  // Markdown settings - enable Mermaid and MDX
  markdown: {
    format: "mdx", // Use MDX for live codeblock support
    mermaid: true, // Enable Mermaid diagram support
  },

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      // Replace with your project's social card
      image: "img/opengraph-image.png",
      navbar: {
        title: "CS Docs",
        logo: {
          alt: "Yi Wang Logo",
          src: "img/favicon.svg",
        },
        items: [
          {
            type: "docSidebar",
            sidebarId: "tutorialSidebar",
            position: "left",
            label: "Documentation",
          },
          { to: "/blog", label: "Blog", position: "left" },
          {
            href: "https://github.com/YiWang24/portfolio",
            label: "GitHub",
            position: "right",
          },
        ],
      },
      footer: {
        style: "dark",
        links: [
          {
            title: "Docs",
            items: [
              {
                label: "Introduction",
                to: "/",
              },
              {
                label: "React Playground",
                to: "/react-playground",
              },
              {
                label: "Diagrams",
                to: "/diagrams",
              },
              {
                label: "API Reference",
                to: "/api",
              },
            ],
          },
          {
            title: "Community",
            items: [
              {
                label: "GitHub",
                href: "https://github.com/YiWang24/portfolio",
              },
              {
                label: "LinkedIn",
                href: "https://www.linkedin.com/in/yiwang2025/",
              },
            ],
          },
          {
            title: "More",
            items: [
              {
                label: "Blog",
                to: "/blog",
              },
              {
                label: "Main Site",
                href: "https://www.yiw.me",
              },
            ],
          },
        ],
        copyright: `Copyright © ${new Date().getFullYear()} Yi Wang. Built with Docusaurus.`,
      },
      prism: {
        theme: themes.github, // Light mode: GitHub (clean, professional)
        darkTheme: themes.dracula, // Dark mode: Dracula (programmer favorite)
        additionalLanguages: [
          "java",
          "typescript",
          "tsx",
          "bash",
          "python",
          "json",
          "yaml",
          "docker",
          "sql",
          "graphql",
          "go",
          "rust",
          "c",
          "cpp",
          "csharp",
          "kotlin",
          "swift",
          "ruby",
          "php",
          "scala",
          "haskell",
          "diff",
          "git",
          "nginx",
          "toml",
          "ini",
          "makefile",
        ],
        magicComments: [
          {
            className: "theme-code-block-highlighted-line",
            line: "highlight-next-line",
            block: { start: "highlight-start", end: "highlight-end" },
          },
          {
            className: "code-block-error-line",
            line: "error-next-line",
          },
          {
            className: "code-block-success-line",
            line: "success-next-line",
          },
        ],
      },
      // Image zoom configuration
      zoom: {
        selector: ".markdown img",
        background: {
          light: "rgb(255, 255, 255)",
          dark: "rgb(20, 20, 20)",
        },
      },
      // Live codeblock configuration
      liveCodeBlock: {
        playgroundPosition: "bottom",
      },
      // Mermaid configuration
      mermaid: {
        theme: { light: "neutral", dark: "dark" },
      },
    }),
};

export default config;

