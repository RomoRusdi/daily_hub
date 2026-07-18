import { useMemo, useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ChevronRight, MapPin, Plus } from 'lucide-react'
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

// Label bagian gaya Graphite: monospace uppercase + link "Lihat semua".
function SectionTitle({ children, to }) {
  return (
    <div className="mb-2.5 flex items-center justify-between px-1">
      <h2 className="section-label">{children}</h2>
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

// Left "rail" of an event card: jam monospace di chip aksen lembut.
function EventRail({ time, duration }) {
  return (
    <div className="bg-brand-soft flex w-14 shrink-0 flex-col items-center justify-center rounded-xl py-2">
      <span className="text-brand font-mono text-xs font-semibold leading-none">
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

      {/* Progress card (Graphite): ring + "N dari M selesai" + meta Next. */}
      <Reveal delay={0.07}>
      <Card className="mb-6 flex items-center gap-3.5 p-4">
        <ProgressRing value={progress} size={54} />
        <div className="min-w-0 flex-1">
          <p className="text-[15px] font-semibold">
            {doneCount} dari {todaysTasks.length} selesai
          </p>
          <p className="mt-1 truncate text-xs text-subtle">
            {nextEvent ? (
              <>
                Next ·{' '}
                <span className="text-brand font-mono font-semibold">
                  {nextEvent.time || '—'}
                </span>{' '}
                {nextEvent.title}
              </>
            ) : (
              'Tidak ada acara berikutnya'
            )}
          </p>
        </div>
      </Card>
      </Reveal>

      {/* Today's tasks */}
      <Reveal delay={0.14} className="mb-6">
      <section>
        <SectionTitle to="/tasks">Tugas · Hari ini</SectionTitle>
        <Card className="overflow-hidden">
          {todaysTasks.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted">
              Tidak ada tugas untuk hari ini.
            </p>
          ) : (
            <div className="divide-y divide-line-soft dark:divide-line-soft-dark">
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
