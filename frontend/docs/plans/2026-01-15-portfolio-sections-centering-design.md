# Portfolio Sections Centering Design

**Goal:** Wrap `PortfolioSections` in a dedicated container that vertically centers the component in the viewport while keeping it full width, and subtly modernize the presentation without breaking the existing visual language.

**Context:** The homepage already uses strong ambient effects (Matrix rain + hyper tunnel) and a layered layout. The portfolio content is currently constrained by a `max-w-5xl` wrapper. The request is to keep a full-width layout, center the component vertically on the screen, and preserve a modern UI feel.

**Design Approach:**
- Add a wrapper `div` around `PortfolioSections` in `src/app/page.tsx` that provides full width and vertical centering (`min-h-[100svh]`, `flex`, `items-center`, `justify-center`). This ensures the component sits in the visual center of the viewport, while still allowing the page to scroll naturally when content height exceeds the viewport.
- Apply light structural styling on the wrapper to reinforce a modern look without clashing with existing effects: a subtle translucent background, backdrop blur, and soft border accents aligned with the existing emerald/cyan palette.
- Remove the `max-w-5xl` constraint inside `src/components/portfolio/PortfolioSections.tsx` and replace it with `w-full` plus responsive horizontal padding. This preserves breathing room while honoring the full-width requirement.

**Impact & Risks:** Layout changes are limited to container classes; data flow and component structure remain unchanged. The primary risk is visual density on very large screens, mitigated by consistent padding and existing section spacing.

**Validation:** Manually verify desktop and mobile layouts: (1) the portfolio content appears vertically centered on first load, (2) content spans full width with consistent padding, and (3) ambient effects remain visible and unobstructed.
