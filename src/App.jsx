import { Routes, Route } from 'react-router-dom'
import BottomNav from './components/BottomNav'
import Home from './pages/Home'
import Tasks from './pages/Tasks'
import Calendar from './pages/Calendar'
import Notes from './pages/Notes'
import NoteEditor from './pages/NoteEditor'

/**
 * App shell: a centered, mobile-first content column with a fixed bottom nav.
 * No auth — data comes from the shared store (localStorage or Supabase).
 */
export default function App() {
  return (
    <div className="min-h-dvh bg-bg dark:bg-bg-dark">
      <div className="mx-auto min-h-dvh max-w-app px-4 pb-28 sm:max-w-xl">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/tasks" element={<Tasks />} />
          <Route path="/calendar" element={<Calendar />} />
          <Route path="/notes" element={<Notes />} />
          <Route path="/notes/:id" element={<NoteEditor />} />
        </Routes>
      </div>
      <BottomNav />
    </div>
  )
}
