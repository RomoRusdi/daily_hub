import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { LogOut, Settings as SettingsIcon } from 'lucide-react'
import ThemeToggle from './ThemeToggle'
import { useAuth } from '../store/AuthContext'
import { greeting } from '../utils/date'

// Eyebrow "RAB · 18 JUL" — hari & bulan pendek, uppercase via CSS.
function eyebrowDate() {
  const d = new Date()
  const weekday = d.toLocaleDateString('id-ID', { weekday: 'short' })
  const month = d.toLocaleDateString('id-ID', { month: 'short' })
  return `${weekday} · ${d.getDate()} ${month}`
}

// Avatar button (kotak membulat, gaya Graphite): opens an account menu when
// signed in (cloud mode), or goes straight to Settings in local mode.
function AccountButton({ fallbackInitial }) {
  const { configured, user, username, signOut } = useAuth()
  const navigate = useNavigate()
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
        onClick={() => (canManage ? setOpen((o) => !o) : navigate('/settings'))}
        className="flex h-10 w-10 items-center justify-center rounded-[10px] border border-line bg-surface text-sm font-semibold text-subtle dark:border-line-dark dark:bg-surface-2-dark"
      >
        {initial}
      </button>

      {open && canManage && (
        <div className="glass-strong absolute right-0 top-12 z-50 w-52 overflow-hidden rounded-2xl">
          <div className="border-b border-line-soft px-3 py-2.5 dark:border-line-soft-dark">
            <p className="text-[11px] text-muted">Masuk sebagai</p>
            <p className="truncate text-sm font-medium text-ink dark:text-ink-dark">
              {username}
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setOpen(false)
              navigate('/settings')
            }}
            className="flex w-full items-center gap-2 px-3 py-2.5 text-sm text-subtle hover:bg-line-soft/60 hover:text-ink dark:hover:bg-line-soft-dark/60 dark:hover:text-ink-dark"
          >
            <SettingsIcon size={16} /> Pengaturan
          </button>
          <button
            type="button"
            onClick={signOut}
            className="flex w-full items-center gap-2 px-3 py-2.5 text-sm text-subtle hover:bg-line-soft/60 hover:text-ink dark:hover:bg-line-soft-dark/60 dark:hover:text-ink-dark"
          >
            <LogOut size={16} /> Keluar
          </button>
        </div>
      )}
    </div>
  )
}

/**
 * Page header, gaya Graphite: eyebrow tanggal monospace di atas greeting
 * satu baris, avatar kotak membulat di kanan.
 */
export default function Header({ name = 'Arya', title, showDate = true, action }) {
  const { username } = useAuth()
  const displayName = username || name

  return (
    <header className="flex items-center justify-between gap-3 pb-6 pt-3">
      <div className="min-w-0">
        {showDate && <p className="section-label tracking-[0.12em]">{eyebrowDate()}</p>}
        <h1
          className={
            'truncate text-[23px] font-bold tracking-[-0.03em] ' +
            (showDate ? 'mt-1' : '')
          }
        >
          {title ?? (
            <>
              {greeting()}, <span className="capitalize">{displayName}</span>
            </>
          )}
        </h1>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        {action}
        <ThemeToggle />
        <AccountButton fallbackInitial={displayName.charAt(0)} />
      </div>
    </header>
  )
}
