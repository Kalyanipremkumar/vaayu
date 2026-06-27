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
        ink: '#1A0A05',
        cream: '#FFFDF8',
        gold: '#C8A84B',
        muted: '#5C5C5C',
        border: '#D8CFC0',
      },
      fontFamily: {
        heading: ['Georgia', '"Times New Roman"', 'serif'],
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
