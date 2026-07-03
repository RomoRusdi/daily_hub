/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Monochrome design tokens. Each token has a light + dark value,
        // consumed via the `dark:` variant in components.
        bg: {
          DEFAULT: '#FAFAFA',
          dark: '#1A1613', // warm charcoal, matches the atmospheric backdrop
        },
        surface: {
          DEFAULT: '#FFFFFF',
          dark: '#26221B', // clearly lighter than bg → real elevation
        },
        line: {
          DEFAULT: '#EAEAEA',
          dark: '#3A322A',
        },
        ink: {
          DEFAULT: '#1A1A1A', // primary text
          dark: '#F4EFE7', // warm off-white
        },
        // Secondary text reads CSS vars (see index.css) so it swaps to warm
        // greys in dark mode without per-component `dark:` classes.
        subtle: 'var(--text-subtle)',
        muted: 'var(--text-muted)',
        accent: '#D97706', // amber — reserved for urgent / today
      },
      fontFamily: {
        sans: [
          'Inter',
          'ui-sans-serif',
          'system-ui',
          '-apple-system',
          'Segoe UI',
          'Roboto',
          'sans-serif',
        ],
      },
      borderRadius: {
        xl: '0.875rem', // ~14px soft corners
        '2xl': '1rem',
      },
      maxWidth: {
        app: '28rem', // mobile-first content column (~max-w-md)
      },
    },
  },
  plugins: [],
}
