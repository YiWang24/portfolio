# Experience (Aceternity Timeline) Design

## Goal
Refactor the Experience section into an Aceternity-style Timeline with a system execution log metaphor. The timeline should feel like a flowing, energized log stream rather than a static resume list.

## Visual Metaphor
- Left: version-style time anchors (mono, e.g. v2024.0) that feel like build tags.
- Center: a vertical energy bus that lights up as the user scrolls (muted -> emerald).
- Right: floating content (company, role, achievements) with no card borders.

## Component Architecture
- Add `src/components/ui/Timeline.tsx` (Aceternity-style, reusable).
- Replace `src/components/portfolio/ExperienceSection.tsx` to map `TimelineItem[]` into timeline entries.
- Keep `PortfolioSections` mapping; only adjust spacing between sections.

## Layout Structure
- 3-column grid per entry: left sticky label, center dot/line, right content.
- Sticky label uses `position: sticky` with top offset so the current version tag stays visible for long entries.
- Center column uses a fixed width to keep the energy line aligned across entries.

## Motion and Interaction
- Use `framer-motion` with `useScroll` to drive a gradient line that grows with scroll progress.
- Base line stays muted; energized line is emerald and increases in height with scroll.
- Entry dot switches to emerald when its entry is in view (simple `useInView`).

## Data Handling
- Derive label from `item.period` by extracting the start year and formatting as `vYYYY.0`.
- If parsing fails, fall back to `v????.0` or a safe `v{period}`.
- Bullets render only when present.

## Spacing and Typographic Rules
- Titles remain sans; metadata must be mono.
- Large vertical spacing between Experience and Projects (100-150px) instead of separators.

## Out of Scope
- Projects Bento Grid refactor and global glue changes are not implemented in this phase.

## Implementation Notes
- Ensure the timeline wrapper has `relative` positioning for line layering.
- Keep background transparent; rely on the line to define structure.
- No additional tests required in this phase.
