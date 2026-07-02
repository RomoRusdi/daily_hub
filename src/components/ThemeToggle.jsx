import { Moon, Sun } from 'lucide-react'
import { useTheme } from '../hooks/useTheme'

// Dark-mode toggle. Preference is persisted by useTheme (localStorage).
export default function ThemeToggle() {
  const { toggleTheme, isDark } = useTheme()
  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? 'Mode terang' : 'Mode gelap'}
      className="rounded-full p-2 text-subtle transition-colors hover:bg-line/50 hover:text-ink dark:hover:bg-line-dark/50 dark:hover:text-ink-dark"
    >
      {isDark ? <Sun size={19} strokeWidth={1.75} /> : <Moon size={19} strokeWidth={1.75} />}
    </button>
  )
}
