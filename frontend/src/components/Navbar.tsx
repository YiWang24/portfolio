"use client";

import { Circle } from "lucide-react";

interface NavbarProps {
  isConnected: boolean;
}

const navLinks = [
  { label: "DASHBOARD", href: "#", active: false },
  { label: "PROJECTS", href: "#", active: false },
  { label: "BIO", href: "#", active: false },
  { label: "DOCUMENTATION", href: "#", active: true },
];

export default function Navbar({ isConnected }: NavbarProps) {
  return (
    <nav className="h-14 flex items-center justify-between px-6 border-b border-border-glass bg-void/80 backdrop-blur-sm">
      {/* Logo */}
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 rounded bg-neon-green/20 flex items-center justify-center">
          <span className="text-neon-green text-xs font-bold">AI</span>
        </div>
        <span className="font-mono text-sm text-white font-semibold tracking-wider">
          DEV_PORTFOLIO
        </span>
      </div>

      {/* Nav Links */}
      <div className="hidden md:flex items-center gap-8">
        {navLinks.map((link) => (
          <a
            key={link.label}
            href={link.href}
            className={`text-xs font-mono tracking-wider transition-colors ${
              link.active ? "text-cyan-400" : "text-text-muted hover:text-white"
            }`}
          >
            {link.label}
          </a>
        ))}
      </div>

      {/* Status */}
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-border-glass bg-white/2">
        <Circle
          size={8}
          className={`${
            isConnected
              ? "fill-neon-green text-neon-green"
              : "fill-red-500 text-red-500"
          }`}
        />
        <span className="text-xs font-mono text-text-muted">
          {isConnected ? "SYSTEM ONLINE" : "OFFLINE"}
        </span>
      </div>
    </nav>
  );
}
