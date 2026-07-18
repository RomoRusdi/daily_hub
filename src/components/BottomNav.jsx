import { NavLink } from 'react-router-dom'
import { Home, CheckSquare, Calendar, StickyNote } from 'lucide-react'

const tabs = [
  { to: '/', label: 'Home', icon: Home },
  { to: '/tasks', label: 'Tasks', icon: CheckSquare },
  { to: '/calendar', label: 'Calendar', icon: Calendar },
  { to: '/notes', label: 'Notes', icon: StickyNote },
]

/**
 * Bottom nav gaya Graphite: bar mengambang radius 14px (bukan pill penuh),
 * surface semi-opak + blur + border tipis. Semua tab menampilkan ikon +
 * label; tab aktif berwarna aksen indigo, sisanya muted. NavLink memberi
 * aria-current="page" pada tab aktif.
 *
 * Wrapper pointer-events-none supaya area kosong di samping bar tidak
 * menelan tap; offset bawah max(safe-area, 16px) untuk home indicator.
 */
export default function BottomNav() {
  return (
    <nav
      aria-label="Navigasi utama"
      className="px-safe pointer-events-none fixed inset-x-0 bottom-0 z-40"
    >
      <div className="mx-auto max-w-app px-4 pb-[max(var(--safe-bottom),1rem)] sm:max-w-xl">
        <div className="glass-strong pointer-events-auto flex items-center justify-around rounded-2xl p-2.5">
          {tabs.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className="flex flex-1 flex-col items-center gap-[3px] py-0.5"
            >
              {({ isActive }) => (
                <>
                  <Icon
                    size={20}
                    strokeWidth={isActive ? 2 : 1.8}
                    className={isActive ? 'text-brand' : 'text-muted'}
                  />
                  <span
                    className={
                      'text-[9.5px] ' +
                      (isActive ? 'text-brand font-semibold' : 'font-medium text-muted')
                    }
                  >
                    {label}
                  </span>
                </>
              )}
            </NavLink>
          ))}
        </div>
      </div>
    </nav>
  )
}
