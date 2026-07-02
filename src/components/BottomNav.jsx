import { NavLink } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Home, CheckSquare, Calendar, StickyNote } from 'lucide-react'
import { SPRING } from '../lib/motion'

const tabs = [
  { to: '/', label: 'Home', icon: Home },
  { to: '/tasks', label: 'Tasks', icon: CheckSquare },
  { to: '/calendar', label: 'Calendar', icon: Calendar },
  { to: '/notes', label: 'Notes', icon: StickyNote },
]

// Fixed bottom navigation. The soft pill behind the active icon shares a
// layoutId, so it glides between tabs when the route changes.
export default function BottomNav() {
  return (
    <nav className="glass-strong px-safe fixed inset-x-0 bottom-0 z-40 border-x-0 border-b-0">
      <div className="mx-auto flex max-w-app items-stretch justify-around px-2 pb-[var(--safe-bottom)]">
        {tabs.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className="group flex flex-1 flex-col items-center gap-1 py-2.5"
          >
            {({ isActive }) => (
              <>
                <span className="relative flex h-7 w-12 items-center justify-center">
                  {isActive && (
                    <motion.span
                      layoutId="nav-pill"
                      transition={SPRING}
                      className="bg-brand-soft absolute inset-0 rounded-full"
                    />
                  )}
                  <Icon
                    size={21}
                    strokeWidth={isActive ? 2.2 : 1.75}
                    className={
                      'relative ' +
                      (isActive
                        ? 'text-brand'
                        : 'text-muted group-hover:text-subtle')
                    }
                  />
                </span>
                <span
                  className={
                    'text-[11px] leading-none ' +
                    (isActive
                      ? 'font-medium text-brand'
                      : 'text-muted group-hover:text-subtle')
                  }
                >
                  {label}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
