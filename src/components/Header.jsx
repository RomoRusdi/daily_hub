import ThemeToggle from './ThemeToggle'
import { greeting, headerDate } from '../utils/date'

/**
 * Lightweight page header: personal greeting + today's date on the left,
 * theme toggle + avatar on the right.
 */
export default function Header({ name = 'Arya', title, showDate = true, action }) {
  return (
    <header className="flex items-start justify-between gap-3 pb-5 pt-3">
      <div className="min-w-0">
        <h1 className="truncate text-2xl font-semibold tracking-tight">
          {title ?? (
            <>
              {greeting()}, <span>{name}</span>
            </>
          )}
        </h1>
        {showDate && (
          <p className="mt-0.5 text-sm capitalize text-subtle">{headerDate()}</p>
        )}
      </div>
      <div className="flex shrink-0 items-center gap-1.5">
        {action}
        <ThemeToggle />
        <span
          aria-hidden
          className="glass flex h-9 w-9 items-center justify-center rounded-xl text-sm font-medium text-ink dark:text-ink-dark"
        >
          {name.charAt(0).toUpperCase()}
        </span>
      </div>
    </header>
  )
}
