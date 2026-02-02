import React from "react";
import { render } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";

vi.mock("framer-motion", () => ({
  motion: {
    div: (props: React.HTMLAttributes<HTMLDivElement>) => <div {...props} />,
  },
  useScroll: () => ({
    scrollY: {
      on: () => {},
      get: () => 0,
    },
  }),
  useTransform: () => 1,
}));

vi.mock("@/components/NavBar", () => ({
  default: () => <div data-testid="nav" />,
}));

vi.mock("@/components/terminal/TerminalPanel", () => ({
  default: () => <div data-testid="terminal-panel" />,
}));

vi.mock("@/components/effects/MatrixRain", () => ({
  MatrixRain: () => null,
}));

vi.mock("@/components/ui/HyperTunnel", () => ({
  default: () => <div data-testid="hyper-tunnel" />,
}));

vi.mock("@/components/portfolio/PortfolioSections", () => ({
  default: () => <div data-testid="portfolio-sections" />,
}));

vi.mock("@/components/terminal/ContactModal", () => ({
  default: () => null,
}));

vi.mock("@/components/ui/ScrollProgress", () => ({
  ScrollProgress: () => null,
}));

vi.mock("@/lib/utils/scroll", () => ({
  smoothScrollTo: vi.fn(),
}));

import Home from "./page";

describe("Home hero layout", () => {
  test("hero container should not shrink to keep terminal visible", () => {
    const { container } = render(<Home />);
    const hero = container.querySelector(".mobile-hero-no-blur");

    expect(hero).toBeInTheDocument();
    expect(hero).toHaveClass("shrink-0");
  });

  test("hero container uses tighter top padding on mobile", () => {
    const { container } = render(<Home />);
    const hero = container.querySelector(".mobile-hero-no-blur");

    expect(hero).toBeInTheDocument();
    expect(hero).toHaveClass("pt-20");
  });
});
