import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Existing dark palette (legacy — preserved for internal surfaces)
        ink: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          400: '#94a3b8',
          600: '#475569',
          800: '#1e293b',
          900: '#0f172a',
        },
        accent: {
          50: '#eef4ff',
          500: '#3b6cf7',
          600: '#2554d8',
          700: '#1c40a6',
        },
        // Marketing light palette — consumed by tf-marketing wrapper.
        m: {
          black: '#0E0F0D',
          white: '#FAFAF8',
          cream: '#F5F3EE',
          green: '#1A6B4A',
          'green-light': '#E8F4EE',
          'green-dark': '#0F4530',
          amber: '#92681A',
          'amber-light': '#FDF3DC',
          red: '#8B2020',
          'red-light': '#FDEAEA',
          border: 'rgba(14,15,13,0.10)',
          'border-mid': 'rgba(14,15,13,0.18)',
          muted: '#5A5C56',
          subtle: '#8A8C84',
        },
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        serif: ['var(--font-serif)', 'Georgia', 'Times New Roman', 'serif'],
        mono: ['var(--font-mono)', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      letterSpacing: {
        tightish: '-0.02em',
        wideish: '0.08em',
        widest2: '0.12em',
      },
      maxWidth: {
        prose: '64ch',
        site: '1200px',
      },
      borderRadius: {
        sm: '6px',
        md: '10px',
        lg: '16px',
        xl: '24px',
      },
      transitionTimingFunction: {
        'editorial': 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
    },
  },
  plugins: [],
};

export default config;
