import { createContext, useContext, useMemo } from 'react'
import { useAuth } from './AuthContext'
import { useCollection, newId } from './useCollection'
import { seedTasks, seedEvents, seedNotes, dateKey } from '../data/seed'

/**
 * Single source of truth for tasks / events / notes.
 *
 * Storage is transparent: in local mode it's localStorage, in cloud mode it's
 * Supabase (with a localStorage cache). The public API below never changes, so
 * pages don't know or care which backend is active. See useCollection.js.
 */
const DataContext = createContext(null)

// --- Row <-> app-shape mappers (snake_case DB columns <-> camelCase app) ---
// `toRow` only maps keys present in the input, so it works for both full
// inserts and partial patches.

const tasksToRow = (t, userId) => {
  const r = {}
  if ('id' in t) r.id = t.id
  if ('title' in t) r.title = t.title
  if ('date' in t) r.due_date = t.date
  if ('time' in t) r.due_time = t.time
  if ('priority' in t) r.priority = t.priority
  if ('reminder' in t) r.reminder = t.reminder
  if ('deadline' in t) r.deadline = t.deadline
  if ('done' in t) r.done = t.done
  if (userId) r.user_id = userId
  return r
}
const tasksFromRow = (r) => ({
  id: r.id,
  title: r.title,
  date: r.due_date,
  time: r.due_time || '',
  priority: r.priority || 'normal',
  reminder: r.reminder || '',
  deadline: !!r.deadline,
  done: !!r.done,
})

const eventsToRow = (e, userId) => {
  const r = {}
  if ('id' in e) r.id = e.id
  if ('title' in e) r.title = e.title
  if ('date' in e) r.event_date = e.date
  if ('time' in e) r.event_time = e.time
  if ('duration' in e) r.duration = e.duration
  if ('location' in e) r.location = e.location
  if ('accent' in e) r.accent = e.accent
  if (userId) r.user_id = userId
  return r
}
const eventsFromRow = (r) => ({
  id: r.id,
  title: r.title,
  date: r.event_date,
  time: r.event_time || '',
  duration: r.duration || '',
  location: r.location || '',
  accent: !!r.accent,
})

const notesToRow = (n, userId) => {
  const r = {}
  if ('id' in n) r.id = n.id
  if ('title' in n) r.title = n.title
  if ('body' in n) r.body = n.body
  if ('updatedAt' in n) r.updated_at = new Date(n.updatedAt).toISOString()
  if (userId) r.user_id = userId
  return r
}
const notesFromRow = (r) => ({
  id: r.id,
  title: r.title || '',
  body: r.body || '',
  updatedAt: r.updated_at ? new Date(r.updated_at).getTime() : Date.now(),
})

export function DataProvider({ children }) {
  const { user } = useAuth()
  const userId = user?.id // undefined => local mode

  const tasksCol = useCollection({
    key: 'tasks',
    table: 'tasks',
    seed: seedTasks,
    fromRow: tasksFromRow,
    toRow: tasksToRow,
    order: (a, b) => (b.date || '').localeCompare(a.date || ''),
    userId,
  })

  const eventsCol = useCollection({
    key: 'events',
    table: 'events',
    seed: seedEvents,
    fromRow: eventsFromRow,
    toRow: eventsToRow,
    order: (a, b) =>
      a.date === b.date
        ? (a.time || '').localeCompare(b.time || '')
        : (a.date || '').localeCompare(b.date || ''),
    userId,
  })

  const notesCol = useCollection({
    key: 'notes',
    table: 'notes',
    seed: seedNotes,
    fromRow: notesFromRow,
    toRow: notesToRow,
    order: (a, b) => b.updatedAt - a.updatedAt,
    userId,
  })

  const api = useMemo(() => {
    return {
      tasks: tasksCol.items,
      events: eventsCol.items,
      notes: notesCol.items,

      // ---- Tasks ----
      addTask: ({ title, date, time = '', priority = 'normal', reminder = '' }) =>
        tasksCol.insert({
          id: newId(),
          title: title.trim(),
          date,
          time,
          priority,
          reminder,
          deadline: priority === 'high' && !!time,
          done: false,
        }),
      toggleTask: (id) => {
        const t = tasksCol.items.find((x) => x.id === id)
        if (t) tasksCol.update(id, { done: !t.done })
      },
      removeTask: (id) => tasksCol.remove(id),

      // ---- Events ----
      addEvent: ({ title, date, time = '', duration = '', location = '' }) =>
        eventsCol.insert({
          id: newId(),
          title: title.trim(),
          date,
          time,
          duration,
          location,
          accent: false,
        }),
      removeEvent: (id) => eventsCol.remove(id),

      // ---- Notes ----
      addNote: ({ title = '', body = '' } = {}) => {
        const id = newId()
        notesCol.insert({ id, title, body, updatedAt: Date.now() })
        return id
      },
      updateNote: (id, patch) =>
        notesCol.update(id, { ...patch, updatedAt: Date.now() }),
      removeNote: (id) => notesCol.remove(id),
    }
  }, [tasksCol, eventsCol, notesCol])

  return <DataContext.Provider value={api}>{children}</DataContext.Provider>
}

export function useData() {
  const ctx = useContext(DataContext)
  if (!ctx) throw new Error('useData must be used within <DataProvider>')
  return ctx
}

export { dateKey }
