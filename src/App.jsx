import { Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Loader2 } from 'lucide-react'
import BottomNav from './components/BottomNav'
import Home from './pages/Home'
import Tasks from './pages/Tasks'
import Calendar from './pages/Calendar'
import Notes from './pages/Notes'
import NoteEditor from './pages/NoteEditor'
import Login from './pages/Login'
import { useAuth } from './store/AuthContext'
import { pageVariants } from './lib/motion'

/**
 * App shell: a centered, mobile-first content column with a fixed bottom nav.
 * Routes cross-fade (+ slight rise) via AnimatePresence keyed on location.
 * In cloud mode this gates on the Supabase session; in local mode (no
 * credentials) it renders straight through.
 */
export default function App() {
  const { configured, loading, session } = useAuth()
  const location = useLocation()

  if (configured && loading) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <Loader2 className="animate-spin text-muted" size={22} />
      </div>
    )
  }
  if (configured && !session) return <Login />

  return (
    // pt-safe/px-safe keep content clear of the notch (portrait) and of the
    // rounded corners/notch in landscape; they add to the inner px-4/pt-3.
    <div className="pt-safe px-safe min-h-dvh">
      {/* Bottom padding clears the floating pill nav: its offset
          (max(safe,12px)) + pill height + breathing room. */}
      <div className="mx-auto min-h-dvh max-w-app px-4 pb-[calc(max(var(--safe-bottom),0.75rem)+6.5rem)] sm:max-w-xl">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={location.pathname}
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <Routes location={location}>
              <Route path="/" element={<Home />} />
              <Route path="/tasks" element={<Tasks />} />
              <Route path="/calendar" element={<Calendar />} />
              <Route path="/notes" element={<Notes />} />
              <Route path="/notes/:id" element={<NoteEditor />} />
            </Routes>
          </motion.div>
        </AnimatePresence>
      </div>
      <BottomNav />
    </div>
  )
}
