import type { Config } from 'tailwindcss';

/**
 * Vaayu web theme.
 *
 * Token values mirror `@vaayu/shared` `constants/design-tokens.ts` — that file
 * is the canonical source of truth (shared with mobile). They are inlined here
 * rather than imported so Tailwind's config loader stays dependency-free.
 * If you change a token, change it in BOTH places (or wire up an import later).
 *
 * Brand constraints: no drop shadows, no gradients, editorial whitespace.
 */
const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Varnam Studio brand. Burgundy is the dark surface + heading colour;
        // warm gold is the accent; cream is the canvas. (Mirror in design-tokens.)
        ink: '#3E1324', // Varnam burgundy (was deep teal #0E3A38)
        cream: '#FFFDF8',
        gold: '#AB8838', // Varnam gold (was #C8A84B)
        muted: '#5C5C5C',
        border: '#E4D9C6',
      },
      fontFamily: {
        heading: ['"Cormorant Garamond"', 'Georgia', '"Times New Roman"', 'serif'],
        body: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      borderRadius: {
        sm: '8px',
        md: '12px',
        lg: '16px',
      },
      spacing: {
        // 4, 8, 12, 16, 24, 32, 48, 64 scale (Tailwind defaults already cover most)
        18: '72px',
      },
      boxShadow: {
        // Brand rule: no drop shadows. Keep `none` as the only sanctioned value.
        none: 'none',
      },
    },
  },
  plugins: [],
};

export default config;
