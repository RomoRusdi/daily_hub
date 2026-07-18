/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Tema "Graphite" (Linear-style): monokrom tajam + satu aksen indigo.
        // Aksen indigo dipegang CSS var --brand (teks/ikon: #5b63e0 light,
        // #8189f4 dark) dan --brand-from/to (fill flat #5b63e0) — lihat
        // index.css. Token `accent` di bawah = DANGER (penanda prioritas).
        bg: {
          DEFAULT: '#f7f7f9',
          dark: '#0c0d10',
        },
        surface: {
          DEFAULT: '#ffffff',
          dark: '#141519',
        },
        'surface-2': {
          DEFAULT: '#f1f2f5',
          dark: '#16181d',
        },
        line: {
          DEFAULT: '#e7e8ec',
          dark: '#23252b',
        },
        'line-soft': {
          DEFAULT: '#eef0f2',
          dark: '#202227',
        },
        'ring-track': {
          DEFAULT: '#e9eaee',
          dark: '#26282e',
        },
        ink: {
          DEFAULT: '#16181d',
          dark: '#f4f5f7',
        },
        // Secondary text reads CSS vars (see index.css) so dark mode swaps
        // without per-component `dark:` classes.
        subtle: 'var(--text-subtle)',
        muted: 'var(--text-muted)',
        accent: '#e0564a', // danger — prioritas/deadline (dulunya amber)
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
        mono: ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      borderRadius: {
        xl: '0.75rem', // 12px — control (input AI hero)
        '2xl': '0.875rem', // 14px — kartu, list container, nav
      },
      maxWidth: {
        app: '28rem', // mobile-first content column (~max-w-md)
      },
    },
  },
  plugins: [],
}
