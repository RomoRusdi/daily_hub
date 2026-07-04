import { useEffect, useRef, useState } from 'react'
import { LogOut, Sparkles } from 'lucide-react'
import ThemeToggle from './ThemeToggle'
import { useAuth } from '../store/AuthContext'
import { greeting, headerDate } from '../utils/date'

// Avatar button that opens an account menu when signed in (cloud mode).
function AccountButton({ fallbackInitial }) {
  const { configured, user, username, signOut } = useAuth()
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const onClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  const canManage = configured && user
  const initial = (username?.[0] ?? fallbackInitial).toUpperCase()

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        aria-label="Akun"
        onClick={() => canManage && setOpen((o) => !o)}
        className="glass flex h-9 w-9 items-center justify-center rounded-xl text-sm font-medium text-ink dark:text-ink-dark"
      >
        {initial}
      </button>

      {open && canManage && (
        <div className="glass-strong absolute right-0 top-11 z-50 w-52 overflow-hidden rounded-xl shadow-xl">
          <div className="border-b border-ink/10 px-3 py-2.5 dark:border-white/10">
            <p className="text-[11px] text-muted">Masuk sebagai</p>
            <p className="truncate text-sm font-medium text-ink dark:text-ink-dark">
              {username}
            </p>
          </div>
          <button
            type="button"
            onClick={signOut}
            className="flex w-full items-center gap-2 px-3 py-2.5 text-sm text-subtle hover:bg-white/40 hover:text-ink dark:hover:bg-white/10 dark:hover:text-ink-dark"
          >
            <LogOut size={16} /> Keluar
          </button>
        </div>
      )}
    </div>
  )
}

/**
 * Lightweight page header: personal greeting + today's date on the left,
 * theme toggle + account avatar on the right.
 */
export default function Header({ name = 'Arya', title, showDate = true, action }) {
  const { username } = useAuth()
  const displayName = username || name

  return (
    <header className="flex items-start justify-between gap-3 pb-5 pt-3">
      <div className="min-w-0">
        <h1 className="text-2xl font-semibold tracking-tight">
          {title ?? (
            <>
              <span className="block truncate">{greeting()},</span>
              {/* Brand-coloured name + sparkle — the "brand moment" from the
                  Ember Glow mockup. */}
              <span className="text-brand flex items-center gap-1.5">
                <span className="truncate capitalize">{displayName}</span>
                <Sparkles size={17} strokeWidth={2} className="shrink-0" />
              </span>
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
        <AccountButton fallbackInitial={displayName.charAt(0)} />
      </div>
    </header>
  )
}
