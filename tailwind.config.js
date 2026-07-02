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
          dark: '#0A0A0A',
        },
        surface: {
          DEFAULT: '#FFFFFF',
          dark: '#141414',
        },
        line: {
          DEFAULT: '#EAEAEA',
          dark: '#262626',
        },
        ink: {
          DEFAULT: '#1A1A1A', // primary text
          dark: '#F5F5F5',
        },
        subtle: '#6B7280', // secondary text
        muted: '#9CA3AF', // muted text
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
