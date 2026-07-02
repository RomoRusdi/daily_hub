import { useState } from 'react'
import { CalendarDays, Flag, Bell } from 'lucide-react'
import Modal from './Modal'
import Button from './Button'
import { todayKey } from '../utils/date'

const REMINDERS = [
  'Tidak ada',
  '10 menit sebelum',
  '30 menit sebelum',
  '1 jam sebelum',
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
  const [reminder, setReminder] = useState('Tidak ada')

  const reset = () => {
    setTitle('')
    setDate(defaultDate || todayKey())
    setTime('')
    setPriority('normal')
    setReminder('Tidak ada')
  }

  const submit = (e) => {
    e.preventDefault()
    if (!title.trim()) return
    onSubmit({
      title,
      date,
      time,
      priority,
      reminder: reminder === 'Tidak ada' ? '' : reminder,
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

        <div className="divide-y divide-line dark:divide-line-dark border-y border-line dark:border-line-dark">
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
                      ? 'bg-accent/10 text-accent'
                      : 'bg-ink text-white dark:bg-ink-dark dark:text-bg-dark'
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
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </Row>
        </div>

        <div className="pt-4">
          <Button type="submit" className="w-full" disabled={!title.trim()}>
            + Tambah tugas
          </Button>
        </div>
      </form>
    </Modal>
  )
}
