type HeroData = {
  name: string;
  status: string;
};

type Props = { hero: HeroData };

export default function CommandBar({ hero }: Props) {
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
      <div className="command-status">
        <span className="status-dot" />
        <span>{hero.status}</span>
      </div>
    </div>
  );
}
