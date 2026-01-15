"use client";

type HeroData = {
  name: string;
  status: string;
};

type Props = { hero: HeroData };

export default function Navbar({ hero }: Props) {
  return (
    <div className="command-bar">
      <div className="command-brand">
        <span className="brand-mark">AI</span>
        <span className="brand-name">{hero.name}</span>
      </div>
      <nav className="command-nav">
        <a href="#education">Education</a>
        <a href="#experience">Experience</a>
        <a href="#projects">Projects</a>
        <a href="#stack">Stack</a>
      </nav>

      {/* 知识库按钮 */}
      <a
        href="/docs"
        className="group relative inline-flex items-center gap-2 px-5 py-2 rounded-lg font-['IBM_Plex_Mono',monospace] text-xs font-semibold uppercase tracking-wider transition-all duration-300"
        style={{
          background: 'linear-gradient(135deg, rgba(93, 220, 255, 0.15), rgba(123, 125, 255, 0.15))',
          border: '1px solid rgba(93, 220, 255, 0.3)',
          color: '#5ddcff',
          boxShadow: '0 0 20px rgba(93, 220, 255, 0.1)'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'linear-gradient(135deg, rgba(93, 220, 255, 0.25), rgba(123, 125, 255, 0.25))'
          e.currentTarget.style.borderColor = 'rgba(93, 220, 255, 0.5)'
          e.currentTarget.style.boxShadow = '0 0 30px rgba(93, 220, 255, 0.2)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'linear-gradient(135deg, rgba(93, 220, 255, 0.15), rgba(123, 125, 255, 0.15))'
          e.currentTarget.style.borderColor = 'rgba(93, 220, 255, 0.3)'
          e.currentTarget.style.boxShadow = '0 0 20px rgba(93, 220, 255, 0.1)'
        }}
      >
        {/* 发光效果 */}
        <span
          className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{
            background: 'radial-gradient(circle at center, rgba(93, 220, 255, 0.15), transparent 70%)',
            filter: 'blur(8px)'
          }}
        />

        <span className="relative flex items-center gap-2">
          {/* 书本图标 */}
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
          <span>Docs</span>
        </span>
      </a>

      <div className="command-status">
        <span className="status-dot" />
        <span>{hero.status}</span>
      </div>
    </div>
  );
}
