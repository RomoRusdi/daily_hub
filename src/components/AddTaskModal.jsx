import { useState } from 'react'
import { CalendarDays, Flag, Bell } from 'lucide-react'
import Modal from './Modal'
import Button from './Button'
import { todayKey } from '../utils/date'

// Reminder = minute offset before the task's time (null = off). Stored as a
// number so the backend can compute an exact remind_at timestamp.
const REMINDERS = [
  { value: '', label: 'Tidak ada' },
  { value: '0', label: 'Saat waktunya' },
  { value: '10', label: '10 menit sebelum' },
  { value: '30', label: '30 menit sebelum' },
  { value: '60', label: '1 jam sebelum' },
  { value: '1440', label: '1 hari sebelum' },
]

// A settings-style row: leading icon + label on the left, control on the right.
function Row({ icon: Icon, label, children }) {
  return (
    <div className="flex items-center gap-3 py-3">
      <Icon size={18} strokeWidth={1.75} className="shrink-0 text-subtle" />
      <span className="text-sm text-ink dark:text-ink-dark">{label}</span>
      <div className="ml-auto flex items-center gap-2">{children}</div>
    </div>
  )
}

// Bottom-sheet form to create a task — row-based layout per the mockup.
export default function AddTaskModal({ open, onClose, onSubmit, defaultDate }) {
  const [title, setTitle] = useState('')
  const [date, setDate] = useState(defaultDate || todayKey())
  const [time, setTime] = useState('')
  const [priority, setPriority] = useState('normal')
  const [reminder, setReminder] = useState('')

  // A reminder needs a time to anchor to ("10 menit sebelum" what?), so the
  // form requires a time whenever a reminder is chosen.
  const reminderNeedsTime = reminder !== '' && !time
  const canSubmit = title.trim() && !reminderNeedsTime

  const reset = () => {
    setTitle('')
    setDate(defaultDate || todayKey())
    setTime('')
    setPriority('normal')
    setReminder('')
  }

  const submit = (e) => {
    e.preventDefault()
    if (!canSubmit) return
    onSubmit({
      title,
      date,
      time,
      priority,
      reminderMinutes: reminder === '' ? null : Number(reminder),
    })
    reset()
    onClose()
  }

  const bareInput =
    'bg-transparent text-sm text-ink focus:outline-none dark:text-ink-dark ' +
    '[color-scheme:light] dark:[color-scheme:dark]'

  return (
    <Modal open={open} onClose={onClose} title="Tugas baru">
      <form onSubmit={submit} className="space-y-1">
        {/* Title — large borderless input */}
        <input
          autoFocus
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Nama tugas"
          className="w-full bg-transparent pb-3 text-lg font-medium placeholder:text-muted focus:outline-none"
        />

        <div className="divide-y divide-ink/5 dark:divide-white/10 border-y border-ink/10 dark:border-white/10">
          <Row icon={CalendarDays} label="Tanggal & waktu">
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className={`${bareInput} text-right`}
            />
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className={`${bareInput} w-[4.5rem] text-right text-subtle`}
            />
          </Row>

          <Row icon={Flag} label="Prioritas">
            {[
              { key: 'high', label: 'Tinggi' },
              { key: 'normal', label: 'Sedang' },
            ].map((p) => (
              <button
                key={p.key}
                type="button"
                onClick={() => setPriority(p.key)}
                className={
                  'rounded-lg px-2.5 py-1 text-xs font-medium transition-colors ' +
                  (priority === p.key
                    ? p.key === 'high'
                      ? 'bg-accent/15 text-accent'
                      : 'bg-brand'
                    : 'text-muted hover:text-subtle')
                }
              >
                {p.label}
              </button>
            ))}
          </Row>

          <Row icon={Bell} label="Reminder">
            <select
              value={reminder}
              onChange={(e) => setReminder(e.target.value)}
              className={`${bareInput} text-right text-subtle`}
            >
              {REMINDERS.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </Row>
        </div>

        {reminderNeedsTime && (
          <p className="pt-2 text-xs text-accent">
            Isi waktu dulu supaya reminder tahu kapan harus mengingatkan.
          </p>
        )}

        <div className="pt-4">
          <Button type="submit" className="w-full" disabled={!canSubmit}>
            + Tambah tugas
          </Button>
        </div>
      </form>
    </Modal>
  )
}
