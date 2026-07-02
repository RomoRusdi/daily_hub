import { useCallback, useEffect } from 'react'
import { useLocalStorage } from './useLocalStorage'

/**
 * Theme controller. Persists an explicit choice ('light' | 'dark') to
 * localStorage, or 'system' to follow the OS preference (the default).
 */
export function useTheme() {
  const [theme, setTheme] = useLocalStorage('hub:theme', 'system')

  const apply = useCallback((value) => {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    const isDark = value === 'dark' || (value === 'system' && prefersDark)
    document.documentElement.classList.toggle('dark', isDark)
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute('content', isDark ? '#0C0A09' : '#ECE7F8')
  }, [])

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
