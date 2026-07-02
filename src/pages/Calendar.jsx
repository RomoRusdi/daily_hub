import { useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight, MapPin, Trash2, CalendarDays } from 'lucide-react'
import Header from '../components/Header'
import Card from '../components/Card'
import EmptyState from '../components/EmptyState'
import FloatingActionButton from '../components/FloatingActionButton'
import AddEventModal from '../components/AddEventModal'
import { useData } from '../store/DataContext'
import { MONTHS, WEEKDAYS_SHORT, toKey, todayKey, weekdayDate } from '../utils/date'

export default function Calendar() {
  const { events, addEvent, removeEvent } = useData()
  const today = todayKey()
  const now = new Date()

  const [view, setView] = useState({ year: now.getFullYear(), month: now.getMonth() })
  const [selected, setSelected] = useState(today)
  const [modalOpen, setModalOpen] = useState(false)

  // Set of date keys that have at least one event (for the dot markers).
  const eventDays = useMemo(() => new Set(events.map((e) => e.date)), [events])

  // Build the calendar grid (leading blanks + days of month).
  const cells = useMemo(() => {
    const first = new Date(view.year, view.month, 1)
    const startPad = first.getDay() // 0 = Sunday
    const daysInMonth = new Date(view.year, view.month + 1, 0).getDate()
    const arr = []
    for (let i = 0; i < startPad; i++) arr.push(null)
    for (let d = 1; d <= daysInMonth; d++) {
      arr.push(toKey(new Date(view.year, view.month, d)))
    }
    return arr
  }, [view])

  const selectedEvents = useMemo(
    () =>
      events
        .filter((e) => e.date === selected)
        .sort((a, b) => (a.time || '').localeCompare(b.time || '')),
    [events, selected],
  )

  const shiftMonth = (delta) =>
    setView(({ year, month }) => {
      const d = new Date(year, month + delta, 1)
      return { year: d.getFullYear(), month: d.getMonth() }
    })

  return (
    <div>
      <Header title="Calendar" showDate={false} />

      {/* Month header + grouped nav */}
      <div className="mb-3 flex items-center justify-between px-1">
        <h2 className="text-xl font-semibold tracking-tight">
          {MONTHS[view.month]} {view.year}
        </h2>
        <div className="flex items-center gap-1 rounded-full border border-line p-0.5 dark:border-line-dark">
          <button
            type="button"
            onClick={() => shiftMonth(-1)}
            aria-label="Bulan sebelumnya"
            className="rounded-full p-1.5 text-subtle hover:bg-line/50 dark:hover:bg-line-dark/50"
          >
            <ChevronLeft size={17} />
          </button>
          <button
            type="button"
            onClick={() => shiftMonth(1)}
            aria-label="Bulan berikutnya"
            className="rounded-full p-1.5 text-subtle hover:bg-line/50 dark:hover:bg-line-dark/50"
          >
            <ChevronRight size={17} />
          </button>
        </div>
      </div>

      {/* Month grid */}
      <Card className="mb-6 p-3">
        <div className="mb-1 grid grid-cols-7">
          {WEEKDAYS_SHORT.map((d) => (
            <div key={d} className="py-1 text-center text-[11px] font-medium text-muted">
              {d}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-y-1">
          {cells.map((key, i) => {
            if (!key) return <div key={`pad-${i}`} />
            const day = Number(key.split('-')[2])
            const isToday = key === today
            const isSelected = key === selected
            const hasEvent = eventDays.has(key)
            return (
              <button
                key={key}
                type="button"
                onClick={() => setSelected(key)}
                className="flex flex-col items-center py-0.5"
              >
                <span
                  className={
                    'flex h-9 w-9 items-center justify-center rounded-full text-sm transition-colors ' +
                    (isSelected
                      ? 'bg-ink text-white dark:bg-ink-dark dark:text-bg-dark'
                      : isToday
                        ? 'font-semibold text-accent'
                        : 'text-ink hover:bg-line/50 dark:text-ink-dark dark:hover:bg-line-dark/50')
                  }
                >
                  {day}
                </span>
                <span
                  className={
                    'mt-0.5 h-1 w-1 rounded-full ' +
                    (hasEvent
                      ? isSelected
                        ? 'bg-ink dark:bg-ink-dark'
                        : 'bg-accent'
                      : 'bg-transparent')
                  }
                />
              </button>
            )
          })}
        </div>
      </Card>

      {/* Agenda for the selected day */}
      <div className="mb-2 flex items-baseline justify-between px-1">
        <h3 className="text-sm font-medium capitalize">
          {selected === today ? 'Hari ini' : weekdayDate(selected)}
        </h3>
        <span className="text-xs text-muted">
          {selectedEvents.length} acara
        </span>
      </div>

      {selectedEvents.length === 0 ? (
        <EmptyState
          icon={CalendarDays}
          title="Tidak ada acara"
          description="Belum ada acara di tanggal ini."
        />
      ) : (
        <div className="pl-1">
          {selectedEvents.map((ev) => (
            <div key={ev.id} className="group flex gap-3">
              {/* Time rail + timeline */}
              <div className="flex w-12 shrink-0 flex-col items-end pt-0.5 text-right">
                <span className="text-sm font-semibold leading-none">
                  {ev.time || '—'}
                </span>
                {ev.duration && (
                  <span className="mt-1 text-[10px] text-muted">{ev.duration}</span>
                )}
              </div>
              <div className="flex flex-col items-center">
                <span
                  className={
                    'mt-1 h-2 w-2 rounded-full ' +
                    (ev.accent ? 'bg-accent' : 'bg-ink dark:bg-ink-dark')
                  }
                />
                <span className="w-px flex-1 bg-line dark:bg-line-dark" />
              </div>

              {/* Event card */}
              <Card
                className={
                  'mb-3 flex flex-1 items-center gap-3 p-3 ' +
                  (ev.accent ? 'border-l-2 border-l-accent' : '')
                }
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[15px] font-medium">{ev.title}</p>
                  {ev.location && (
                    <span className="mt-0.5 inline-flex items-center gap-1 truncate text-xs text-subtle">
                      <MapPin size={12} /> {ev.location}
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => removeEvent(ev.id)}
                  aria-label="Hapus acara"
                  className="hidden shrink-0 rounded-lg p-1 text-muted hover:text-accent group-hover:block"
                >
                  <Trash2 size={16} />
                </button>
              </Card>
            </div>
          ))}
        </div>
      )}

      <FloatingActionButton onClick={() => setModalOpen(true)} label="Tambah acara" />
      <AddEventModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={addEvent}
        defaultDate={selected}
      />
    </div>
  )
}
