import { useState } from 'react'
import { Sparkles, ArrowUp, Loader2, X } from 'lucide-react'
import { useToast } from './Toast'
import { useData } from '../store/DataContext'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
import { todayKey } from '../utils/date'

/**
 * Hero AI assistant. Sends the prompt (plus a compact snapshot of the user's
 * tasks/events and the current local time) to the `ai-assistant` Edge
 * Function — the AI API key (Gemini) lives only there. The function returns
 * a reply and structured actions; actions are executed HERE through the
 * normal DataContext mutations, so inserts carry the user's session and RLS
 * applies.
 */
export default function AIPrompt() {
  const [value, setValue] = useState('')
  const [busy, setBusy] = useState(false)
  const [reply, setReply] = useState('')
  const toast = useToast()
  const { tasks, events, addTask, addEvent, addNote } = useData()

  const runAction = ({ tool, input }) => {
    if (tool === 'create_task') {
      addTask({
        title: input.title,
        date: input.date,
        time: input.time || '',
        priority: input.priority === 'high' ? 'high' : 'normal',
        reminderMinutes: input.time ? (input.reminder_minutes ?? null) : null,
      })
      return 'tugas'
    }
    if (tool === 'create_event') {
      addEvent({
        title: input.title,
        date: input.date,
        time: input.time || '',
        duration: input.duration || '',
        location: input.location || '',
      })
      return 'acara'
    }
    if (tool === 'create_note') {
      addNote({ title: input.title, body: input.body })
      return 'catatan'
    }
    return null
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!value.trim() || busy) return
    if (!isSupabaseConfigured) {
      toast('Fitur AI butuh mode cloud (Supabase) — lihat SUPABASE.md')
      return
    }

    setBusy(true)
    setReply('')
    try {
      const now = new Date()
      const { data, error } = await supabase.functions.invoke('ai-assistant', {
        body: {
          prompt: value.trim(),
          context: {
            today: todayKey(),
            weekday: now.toLocaleDateString('id-ID', { weekday: 'long' }),
            now: now.toLocaleString('id-ID'),
            // Compact snapshot so the assistant can answer "jadwalku besok?"
            tasks: tasks.slice(0, 50).map(({ title, date, time, done }) => ({ title, date, time, done })),
            events: events.slice(0, 50).map(({ title, date, time, location }) => ({ title, date, time, location })),
          },
        },
      })
      if (error) {
        // Non-2xx: pesan asli ada di body respons, bukan di error.message.
        const body = await error.context?.json?.().catch(() => null)
        throw new Error(body?.error || error.message)
      }
      if (data?.error) throw new Error(data.error)

      const made = (data.actions || []).map(runAction).filter(Boolean)
      if (made.length) {
        const counts = made.reduce((m, k) => ((m[k] = (m[k] || 0) + 1), m), {})
        toast(
          '✓ ' +
            Object.entries(counts)
              .map(([k, n]) => `${n} ${k}`)
              .join(', ') +
            ' dibuat',
        )
      }
      if (data.reply) setReply(data.reply)
      setValue('')
    } catch (err) {
      console.warn('[ai]', err)
      setReply(`⚠️ ${err.message || 'Asisten lagi bermasalah, coba lagi ya.'}`)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div>
      {/* Input bersih gaya Graphite: surface + border tipis, sparkle aksen,
          chip ⌘K saat kosong ↔ tombol kirim saat ada teks. */}
      <form
        onSubmit={handleSubmit}
        className="input-glass flex items-center gap-2.5 rounded-xl px-3.5 py-3"
      >
        <Sparkles size={17} strokeWidth={2} className="text-brand shrink-0" />
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={busy ? 'Sebentar…' : 'Tanya asisten…'}
          disabled={busy}
          className="min-w-0 flex-1 bg-transparent text-[13.5px] text-ink placeholder:text-muted focus:outline-none disabled:opacity-60 dark:text-ink-dark"
          aria-label="Tanya asisten AI"
        />
        {busy ? (
          <Loader2 size={16} className="shrink-0 animate-spin text-muted" />
        ) : value.trim() ? (
          <button
            type="submit"
            aria-label="Kirim"
            className="bg-brand flex h-7 w-7 shrink-0 items-center justify-center rounded-lg"
          >
            <ArrowUp size={15} strokeWidth={2.25} />
          </button>
        ) : (
          <kbd className="shrink-0 rounded-[5px] border border-line px-1.5 py-0.5 font-mono text-[10.5px] text-muted dark:border-line-dark">
            ⌘K
          </kbd>
        )}
      </form>

      {/* Assistant reply, dismissible */}
      {reply && (
        <div className="glass-lite mt-2 flex items-start gap-2.5 rounded-xl p-3">
          <Sparkles size={14} className="text-brand mt-0.5 shrink-0" />
          <p className="min-w-0 flex-1 whitespace-pre-wrap text-sm leading-relaxed text-ink dark:text-ink-dark">
            {reply}
          </p>
          <button
            type="button"
            aria-label="Tutup jawaban"
            onClick={() => setReply('')}
            className="shrink-0 rounded-lg p-1 text-muted hover:text-subtle"
          >
            <X size={14} />
          </button>
        </div>
      )}
    </div>
  )
}
