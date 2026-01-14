# Profile Social Links Design

## Goal
Make the Social Links section in `ProfilePanel` data-driven from `profile.json` so links come from the hero profile and render only when present.

## Scope
- Add `hero.linkedin` and `hero.email` fields in `src/data/profile.json` alongside the existing `hero.github`.
- Update `HeroData` in `src/components/ProfilePanel.tsx` to include these optional fields.
- Render Social Links based on available fields with safe URL normalization.

## Data Model
- `hero.github`: string, either a username ("YiWang24") or a full URL ("https://github.com/YiWang24").
- `hero.linkedin`: string, either a handle/slug ("yi-wang") or a full URL ("https://www.linkedin.com/in/yi-wang").
- `hero.email`: string, an email address ("hi@example.com").

## Rendering Behavior
- Build an array of link descriptors for GitHub, LinkedIn, and Email by checking each field.
- For GitHub and LinkedIn, if the value starts with "http" use it directly; otherwise prefix with:
  - GitHub: `https://github.com/`
  - LinkedIn: `https://www.linkedin.com/in/`
- For email, always generate `mailto:`.
- Only render icons for links that exist.

## UI
Keep the existing styling and hover states for the Social Links buttons to preserve the current visual language.

## Testing / Verification
- Visual check: Social Links renders only when fields are populated.
- Confirm that username and full URL variants both work for GitHub and LinkedIn.
- Confirm email opens mail client via `mailto:`.
