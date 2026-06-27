/**
 * Vaayu design tokens — single source of truth for the brand, consumed by the
 * web Tailwind config and by React Native styles so the two stay in sync.
 * Brand personality: authentic, quietly confident, reverent, modern, warm.
 * Constraints: no drop shadows, no gradients, no emojis, generous whitespace.
 *
 * NOTE: These are placeholder defaults; a formal brand guidelines doc will
 * replace them later. Keep everything driven from this file so a rebrand is
 * a one-file change.
 */

export const COLORS = {
  /** Primary — deep ink black. */
  ink: '#1A0A05',
  /** Background — off-white cream. */
  cream: '#FFFDF8',
  /** Accent — warm gold. */
  gold: '#C8A84B',
  /** Secondary text. */
  muted: '#5C5C5C',
  /** Borders / hairlines. */
  border: '#D8CFC0',
} as const;

export const FONTS = {
  /** Headlines — serif, editorial. */
  heading: 'Georgia, "Times New Roman", serif',
  /** Body — Inter on web, system sans on mobile. */
  body: 'Inter, system-ui, -apple-system, sans-serif',
} as const;

export const RADII = {
  sm: 8,
  md: 12,
  lg: 16,
} as const;

/** Spacing scale in pixels: 4, 8, 12, 16, 24, 32, 48, 64. */
export const SPACING = [4, 8, 12, 16, 24, 32, 48, 64] as const;
