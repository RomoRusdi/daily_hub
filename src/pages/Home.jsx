import { useMemo, useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ChevronRight, MapPin, CalendarClock, Plus } from 'lucide-react'
import Header from '../components/Header'
import Card from '../components/Card'
import Reveal from '../components/Reveal'
import AIPrompt from '../components/AIPrompt'
import TaskRow from '../components/TaskRow'
import ProgressRing from '../components/ProgressRing'
import { Field, inputClass } from '../components/Field'
import Button from '../components/Button'
import { useData } from '../store/DataContext'
import { useToast } from '../components/Toast'
import { todayKey, shortDate } from '../utils/date'

// Small labelled section header with an optional "see all" link.
function SectionTitle({ children, to }) {
  return (
    <div className="mb-2 flex items-center justify-between px-1">
      <h2 className="text-sm font-medium text-subtle">{children}</h2>
      {to && (
        <Link
          to={to}
          className="flex items-center text-xs text-muted hover:text-ink dark:hover:text-ink-dark"
        >
          Lihat semua <ChevronRight size={14} />
        </Link>
      )}
    </div>
  )
}

// Left "rail" of an event card: big time + small duration, brand-tinted so
// the timeline reads as a rail of glowing time chips (Ember Glow mockup).
function EventRail({ time, duration }) {
  return (
    <div className="bg-brand-soft flex w-14 shrink-0 flex-col items-center justify-center rounded-xl py-2">
      <span className="text-brand text-sm font-semibold leading-none">
        {time || '—'}
      </span>
      {duration && (
        <span className="mt-1 text-[10px] text-muted">{duration}</span>
      )}
    </div>
  )
}

export default function Home() {
  const { tasks, events, toggleTask, addNote } = useData()
  const toast = useToast()
  const [quickNote, setQuickNote] = useState('')
  const today = todayKey()

  const todaysTasks = useMemo(
    () => tasks.filter((t) => t.date === today),
    [tasks, today],
  )
  const remaining = todaysTasks.filter((t) => !t.done)
  const doneCount = todaysTasks.length - remaining.length
  const progress = todaysTasks.length
    ? (doneCount / todaysTasks.length) * 100
    : 0

  // Upcoming events, soonest first. Today's events that already passed
  // (by clock time) are dropped so "next" stays meaningful.
  const upcoming = useMemo(() => {
    const nowHM = new Date().toTimeString().slice(0, 5)
    return [...events]
      .filter((e) => e.date > today || (e.date === today && (e.time || '99:99') >= nowHM))
      .sort((a, b) =>
        a.date === b.date
          ? (a.time || '').localeCompare(b.time || '')
          : a.date.localeCompare(b.date),
      )
  }, [events, today])
  const nextEvent = upcoming[0]

  const saveQuickNote = (e) => {
    e.preventDefault()
    if (!quickNote.trim()) return
    addNote({ title: 'Catatan cepat', body: quickNote.trim() })
    setQuickNote('')
    toast('Catatan tersimpan')
  }

  return (
    <div>
      <Header />

      {/* AI assistant — hero input */}
      <Reveal className="mb-5">
        <AIPrompt />
      </Reveal>

      {/* Today summary + next event, merged into one card (mockup 1b):
          progress on the left, next-event tile on the right. */}
      <Reveal delay={0.07}>
      <Card className="mb-6 p-3">
        <div className="flex items-stretch gap-3">
          <div className="flex shrink-0 items-center gap-3 py-1 pl-1">
            <ProgressRing value={progress} size={52} />
            <div>
              <p className="text-lg font-semibold leading-tight">
                {remaining.length}
                <span className="text-sm font-normal text-muted">
                  {' '}/ {todaysTasks.length}
                </span>
              </p>
              <p className="text-xs text-subtle">tugas tersisa</p>
            </div>
          </div>
          <div className="min-w-0 flex-1 rounded-xl bg-white/40 p-2.5 dark:bg-white/5">
            <p className="flex items-center gap-1.5 text-[11px] text-subtle">
              <CalendarClock size={13} strokeWidth={1.75} className="shrink-0" />
              Berikutnya
              {nextEvent?.time && (
                <span className="text-brand font-semibold">· {nextEvent.time}</span>
              )}
            </p>
            {nextEvent ? (
              <>
                <p className="mt-1 truncate text-sm font-medium">
                  {nextEvent.title}
                </p>
                {nextEvent.location && (
                  <p className="mt-0.5 truncate text-[11px] text-muted">
                    {nextEvent.location}
                  </p>
                )}
              </>
            ) : (
              <p className="mt-1 text-sm text-muted">Tidak ada acara</p>
            )}
          </div>
        </div>
      </Card>
      </Reveal>

      {/* Today's tasks */}
      <Reveal delay={0.14} className="mb-6">
      <section>
        <SectionTitle to="/tasks">Tugas hari ini</SectionTitle>
        <Card className="px-4 py-1">
          {todaysTasks.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted">
              Tidak ada tugas untuk hari ini.
            </p>
          ) : (
            <div className="divide-y divide-ink/5 dark:divide-white/10">
              <AnimatePresence initial={false}>
                {todaysTasks.slice(0, 5).map((task) => (
                  <TaskRow key={task.id} task={task} onToggle={toggleTask} />
                ))}
              </AnimatePresence>
            </div>
          )}
        </Card>
      </section>
      </Reveal>

      {/* Next up */}
      <Reveal delay={0.2} className="mb-6">
      <section>
        <SectionTitle to="/calendar">Jadwal berikutnya</SectionTitle>
        <div className="space-y-2">
          {upcoming.slice(0, 2).map((ev) => (
            <Card key={ev.id} className="flex items-center gap-3 p-3">
              <EventRail time={ev.time} duration={ev.duration} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-[15px] font-medium">{ev.title}</p>
                <div className="mt-0.5 flex items-center gap-2 text-xs text-subtle">
                  {ev.date !== today && (
                    <span className="text-muted">{shortDate(ev.date)}</span>
                  )}
                  {ev.location && (
                    <span className="inline-flex items-center gap-1 truncate">
                      <MapPin size={12} /> {ev.location}
                    </span>
                  )}
                </div>
              </div>
            </Card>
          ))}
          {upcoming.length === 0 && (
            <Card className="p-4 text-center text-sm text-muted">
              Tidak ada acara mendatang.
            </Card>
          )}
        </div>
      </section>
      </Reveal>

      {/* Quick note */}
      <Reveal delay={0.26} className="mb-4">
      <section>
        <SectionTitle to="/notes">Catatan cepat</SectionTitle>
        <Card className="p-3">
          <form onSubmit={saveQuickNote} className="space-y-3">
            <Field>
              <textarea
                value={quickNote}
                onChange={(e) => setQuickNote(e.target.value)}
                rows={2}
                placeholder="Tulis sesuatu yang ingin diingat…"
                className={`${inputClass} resize-none`}
              />
            </Field>
            <div className="flex justify-end">
              <Button
                type="submit"
                variant="secondary"
                disabled={!quickNote.trim()}
              >
                <Plus size={16} /> Simpan
              </Button>
            </div>
          </form>
        </Card>
      </section>
      </Reveal>
    </div>
  )
}
