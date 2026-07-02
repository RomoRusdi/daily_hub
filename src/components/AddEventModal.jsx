import { useState, useEffect } from 'react'
import Modal from './Modal'
import Button from './Button'
import { Field, inputClass } from './Field'
import { todayKey } from '../utils/date'

// Bottom-sheet form to create a calendar event.
export default function AddEventModal({ open, onClose, onSubmit, defaultDate }) {
  const [title, setTitle] = useState('')
  const [date, setDate] = useState(defaultDate || todayKey())
  const [time, setTime] = useState('')
  const [duration, setDuration] = useState('')
  const [location, setLocation] = useState('')

  // Keep the date field in sync with the currently selected calendar day.
  useEffect(() => {
    if (open) setDate(defaultDate || todayKey())
  }, [open, defaultDate])

  const submit = (e) => {
    e.preventDefault()
    if (!title.trim()) return
    onSubmit({ title, date, time, duration, location })
    setTitle('')
    setTime('')
    setDuration('')
    setLocation('')
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title="Acara baru">
      <form onSubmit={submit} className="space-y-4">
        <Field label="Judul">
          <input
            autoFocus
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Nama acara"
            className={inputClass}
          />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Tanggal">
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className={inputClass}
            />
          </Field>
          <Field label="Waktu (opsional)">
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className={inputClass}
            />
          </Field>
        </div>

        <Field label="Durasi (opsional)">
          <input
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            placeholder="mis. 1 jam"
            className={inputClass}
          />
        </Field>

        <Field label="Lokasi (opsional)">
          <input
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Di mana?"
            className={inputClass}
          />
        </Field>

        <Button type="submit" className="w-full" disabled={!title.trim()}>
          Simpan acara
        </Button>
      </form>
    </Modal>
  )
}
