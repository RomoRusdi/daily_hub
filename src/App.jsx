import { useEffect, useState } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import LoadingScene from './components/LoadingScene'
import BottomNav from './components/BottomNav'
import Home from './pages/Home'
import Tasks from './pages/Tasks'
import Calendar from './pages/Calendar'
import Notes from './pages/Notes'
import NoteEditor from './pages/NoteEditor'
import Settings from './pages/Settings'
import Login from './pages/Login'
import { useAuth } from './store/AuthContext'
import { pageVariants } from './lib/motion'

/**
 * App shell: a centered, mobile-first content column with a fixed bottom nav.
 * Routes cross-fade (+ slight rise) via AnimatePresence keyed on location.
 * In cloud mode this gates on the Supabase session; in local mode (no
 * credentials) it renders straight through.
 *
 * On first mount we hold a splash for at least SPLASH_MS so the loader always
 * gets a moment on screen (auth checks often resolve too fast to see) — the
 * real app shows once the splash minimum has elapsed AND auth is ready.
 */
const SPLASH_MS = 3000

export default function App() {
  const { configured, loading, session } = useAuth()
  const location = useLocation()

  // Splash gate: true until the minimum display time has passed.
  const [splash, setSplash] = useState(true)
  useEffect(() => {
    const t = setTimeout(() => setSplash(false), SPLASH_MS)
    return () => clearTimeout(t)
  }, [])

  const showLoader = splash || (configured && loading)

  // Resolved screen once loading is done: either the auth wall or the app shell.
  const content =
    configured && !session ? (
      <Login />
    ) : (
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
                <Route path="/settings" element={<Settings />} />
              </Routes>
            </motion.div>
          </AnimatePresence>
        </div>
        <BottomNav />
      </div>
    )

  return (
    <>
      {/* The app fades up as the loader fades out — a soft hand-off rather than
          a hard swap. Rendered underneath so the cross-fade layers cleanly. */}
      {!showLoader && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
          {content}
        </motion.div>
      )}

      {/* Loader overlay: transparent (the themed backdrop shows through), fades
          out on exit to reveal the app that's already mounted beneath it. */}
      <AnimatePresence>
        {showLoader && (
          <motion.div
            key="loader"
            className="fixed inset-0 z-50"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: 'easeInOut' }}
          >
            <LoadingScene />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
