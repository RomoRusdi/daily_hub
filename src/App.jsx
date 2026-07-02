import { Routes, Route } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import BottomNav from './components/BottomNav'
import Home from './pages/Home'
import Tasks from './pages/Tasks'
import Calendar from './pages/Calendar'
import Notes from './pages/Notes'
import NoteEditor from './pages/NoteEditor'
import Login from './pages/Login'
import { useAuth } from './store/AuthContext'

/**
 * App shell: a centered, mobile-first content column with a fixed bottom nav.
 * In cloud mode this gates on the Supabase session; in local mode (no
 * credentials) it renders straight through.
 */
export default function App() {
  const { configured, loading, session } = useAuth()

  if (configured && loading) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <Loader2 className="animate-spin text-muted" size={22} />
      </div>
    )
  }
  if (configured && !session) return <Login />

  return (
    <div className="min-h-dvh">
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
