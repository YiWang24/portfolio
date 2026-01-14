"use client";

type HeroData = {
  name: string;
  role: string;
  intro: string;
  avatar?: string;
  github?: string;
  linkedin?: string;
  email?: string;
};

type Props = {
  hero: HeroData;
};

export default function TerminalHero({ hero }: Props) {
  return (
    <div className="cli-motd">
      {/* Bio */}
      <p className="cli-hero-bio">{hero.intro}</p>
    </div>
  );
}
