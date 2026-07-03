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

/**
 * Floating pill navigation: a fully rounded glass capsule that hovers above
 * the bottom edge instead of a full-bleed bar. Icon-only for a clean read —
 * each tab keeps an sr-only label, and NavLink sets aria-current="page" on
 * the active one.
 *
 * The outer wrapper is pointer-events-none so the gutters beside the pill
 * don't swallow taps; only the capsule itself is interactive. Bottom offset
 * is max(safe-area, 12px) so the pill clears the iPhone home indicator but
 * still floats on devices without one.
 *
 * The soft highlight behind the active icon shares a layoutId, so it glides
 * between tabs on route change (instant under prefers-reduced-motion via
 * <MotionConfig reducedMotion="user"> in main.jsx).
 */
export default function BottomNav() {
  return (
    <nav
      aria-label="Navigasi utama"
      className="px-safe pointer-events-none fixed inset-x-0 bottom-0 z-40"
    >
      <div className="mx-auto max-w-app px-4 pb-[max(var(--safe-bottom),0.75rem)] sm:max-w-xl">
        <div className="glass-strong pointer-events-auto flex items-center justify-around rounded-full p-1.5 shadow-[0_16px_38px_-14px_rgba(31,38,135,0.35)] dark:shadow-[0_16px_38px_-14px_rgba(0,0,0,0.65)]">
          {tabs.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className="group flex flex-1 justify-center"
            >
              {({ isActive }) => (
                <span className="relative flex h-11 w-16 items-center justify-center">
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
                  <span className="sr-only">{label}</span>
                </span>
              )}
            </NavLink>
          ))}
        </div>
      </div>
    </nav>
  )
}
