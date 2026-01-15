# Education List Design

## Goal
Create a minimalist Education section that displays a vertical list of academic entries using shadcn/ui Avatar and Separator components. The list should feel clean and unobtrusive, with a clear information hierarchy and mobile-friendly stacking for the graduation year.

## Layout and Components
The UI is a simple list of rows rendered from a local data array. Each row is a flex container with three visual regions: (1) a left Avatar that displays the university logo from a real URL and falls back to an initial, (2) a middle text block with the school name as the primary line (font-medium) and the degree/major as a muted secondary line (text-sm), and (3) the graduation year aligned to the right on larger screens. The list uses a Separator between rows (not after the last item). No cards or borders are used beyond the subtle separator line.

## Responsiveness
On mobile, the row still aligns items center, but the content block stacks vertically so the year appears under the degree. This is handled with `flex-col` on small screens and `sm:flex-row` on larger screens, with spacing adjustments to preserve readability.

## Data Flow
The component maps over a local `educationData` array with two mock entries (master's and bachelor's). Each item includes school name, degree, major, year, and logo URL. The list uses the school name as the stable key for rendering.

## Error Handling
If a logo fails to load, the Avatar fallback shows the first letter of the school name. This avoids layout shifts or broken images.

## Testing
Basic render tests would assert that both school names and years appear, the degree line uses the muted style class, and exactly one separator is rendered between two items. Visual verification should confirm that the year stacks under the degree on mobile and aligns right on larger screens.
