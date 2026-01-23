import Layout from "@theme/Layout";
import Heading from "@theme/Heading";
import Link from "@docusaurus/Link";
import { Analytics } from "@vercel/analytics/next"
import { JSX } from "react";

export default function Home(): JSX.Element {
  return (
    <Layout title="CS Knowledge Base" description="Computer Science & Engineering Documentation">
      <Analytics />
      <main>
        {/* Hero Section - Compact Knowledge Entry */}
        <section className="hero">
          <div className="container">
            <div className="hero__badge">📚 Knowledge Base</div>
            <Heading as="h1" className="hero__title">
              CS Docs
            </Heading>
            <p className="hero__subtitle">
              A curated collection of Computer Science & Engineering notes.
              <br />
              <span className="hero__highlight">Spring AI • React • System Design • DevOps</span>
            </p>
            <div className="hero__actions">
              <Link
                className="button button--primary button--lg"
                to="/intro">
                🚀 Get Started
              </Link>
              <Link
                className="button button--outline button--lg"
                to="/react-playground">
                🎮 Try Playground
              </Link>
            </div>
            <div className="hero__stats">
              <div className="hero__stat">
                <span className="hero__stat-value">4</span>
                <span className="hero__stat-label">Topics</span>
              </div>
              <div className="hero__stat">
                <span className="hero__stat-value">∞</span>
                <span className="hero__stat-label">Learning</span>
              </div>
              <div className="hero__stat">
                <span className="hero__stat-value">24/7</span>
                <span className="hero__stat-label">Available</span>
              </div>
            </div>
          </div>
        </section>

        {/* Quick Links Grid */}
        <section className="quickLinks">
          <div className="container">
            <h2 className="section__title">Quick Navigation</h2>
            <div className="quickLinks__grid">
              <Link to="/intro" className="quickLink__card">
                <span className="quickLink__icon">🚀</span>
                <h3>Introduction</h3>
                <p>Live code, diagrams, and interactive examples</p>
              </Link>
              <Link to="/react-playground" className="quickLink__card">
                <span className="quickLink__icon">🎮</span>
                <h3>React Playground</h3>
                <p>Interactive React components with live editing</p>
              </Link>
              <Link to="/diagrams" className="quickLink__card">
                <span className="quickLink__icon">📊</span>
                <h3>Diagrams</h3>
                <p>Mermaid flowcharts, sequence diagrams, ER diagrams</p>
              </Link>
              <Link to="/api" className="quickLink__card">
                <span className="quickLink__icon">📚</span>
                <h3>API Reference</h3>
                <p>TypeScript interfaces and REST API documentation</p>
              </Link>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="features">
          <div className="container">
            <h2 className="section__title">Built With Modern Tools</h2>
            <div className="features__grid">
              <div className="feature__card">
                <div className="feature__icon">⚡</div>
                <h3>Live Code Editing</h3>
                <p>Edit React code directly in the browser and see results instantly</p>
              </div>
              <div className="feature__card">
                <div className="feature__icon">📊</div>
                <h3>Mermaid Diagrams</h3>
                <p>Beautiful flowcharts, sequence diagrams, and ER diagrams</p>
              </div>
              <div className="feature__card">
                <div className="feature__icon">📦</div>
                <h3>npm/yarn/pnpm Tabs</h3>
                <p>Auto-generated package manager command tabs</p>
              </div>
              <div className="feature__card">
                <div className="feature__icon">🔍</div>
                <h3>Image Zoom</h3>
                <p>Click any image to view in full-screen detail</p>
              </div>
              <div className="feature__card">
                <div className="feature__icon">📋</div>
                <h3>Copy Page</h3>
                <p>One-click copy entire page as Markdown for AI context</p>
              </div>
              <div className="feature__card">
                <div className="feature__icon">🌙</div>
                <h3>Dark Mode</h3>
                <p>Eye-care dark theme optimized for long reading sessions</p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </Layout>
  );
}
