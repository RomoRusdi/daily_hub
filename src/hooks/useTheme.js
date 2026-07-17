import { useCallback, useEffect } from 'react'
import { useLocalStorage } from './useLocalStorage'

const THEME_KEY = 'hub:theme'

/**
 * Resolve + apply a theme value ('light' | 'dark' | 'system') to <html>.
 * Standalone so it can run before React paints (see main.jsx) — that's what
 * keeps the splash/loader on the right theme from the very first frame.
 */
export function applyTheme(value) {
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
  const isDark = value === 'dark' || (value === 'system' && prefersDark)
  document.documentElement.classList.toggle('dark', isDark)
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute('content', isDark ? '#1A1613' : '#EFE8FB')
}

/** Read the persisted choice and apply it. Safe to call at module load. */
export function applyStoredTheme() {
  let value = 'system'
  try {
    const raw = localStorage.getItem(THEME_KEY)
    if (raw != null) value = JSON.parse(raw)
  } catch {
    /* fall back to system */
  }
  applyTheme(value)
}

/**
 * Theme controller. Persists an explicit choice ('light' | 'dark') to
 * localStorage, or 'system' to follow the OS preference (the default).
 */
export function useTheme() {
  const [theme, setTheme] = useLocalStorage(THEME_KEY, 'system')

  const apply = useCallback((value) => applyTheme(value), [])

  // Apply on mount + whenever the stored choice changes.
  useEffect(() => {
    apply(theme)
  }, [theme, apply])

  // React to OS changes while in 'system' mode.
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const onChange = () => theme === 'system' && apply(theme)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [theme, apply])

  const isDark = () => document.documentElement.classList.contains('dark')

  // Toggle flips to the opposite of what's currently shown (explicit choice).
  const toggleTheme = useCallback(() => {
    setTheme(isDark() ? 'light' : 'dark')
  }, [setTheme])

  return { theme, setTheme, toggleTheme, isDark: isDark() }
}
