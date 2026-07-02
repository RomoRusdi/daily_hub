import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  Trash2,
  Share2,
  Type,
  List,
  ListChecks,
  Image as ImageIcon,
  Sparkles,
  Check,
} from 'lucide-react'
import { useData } from '../store/DataContext'
import { useToast } from '../components/Toast'
import { fullDateTime } from '../utils/date'

// Rounded, subtle icon button used in the editor top bar.
function RoundBtn({ label, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="glass flex h-9 w-9 items-center justify-center rounded-full text-subtle transition-colors hover:text-ink dark:hover:text-ink-dark"
    >
      {children}
    </button>
  )
}

/**
 * Focused single-note editor. Title + body auto-save to localStorage
 * (debounced) as you type, with a bottom formatting toolbar.
 */
export default function NoteEditor() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { notes, updateNote, removeNote } = useData()
  const toast = useToast()
  const bodyRef = useRef(null)

  const note = useMemo(() => notes.find((n) => n.id === id), [notes, id])

  const [title, setTitle] = useState(note?.title ?? '')
  const [body, setBody] = useState(note?.body ?? '')
  const [saved, setSaved] = useState(true)
  const timer = useRef(null)

  // Debounced auto-save whenever title/body change.
  useEffect(() => {
    if (!note) return
    if (title === note.title && body === note.body) return
    setSaved(false)
    clearTimeout(timer.current)
    timer.current = setTimeout(() => {
      updateNote(id, { title, body })
      setSaved(true)
    }, 500)
    return () => clearTimeout(timer.current)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title, body])

  // Insert a line prefix (bullet / checkbox) at the cursor.
  const insertPrefix = (prefix) => {
    const el = bodyRef.current
    const pos = el ? el.selectionStart : body.length
    const before = body.slice(0, pos)
    const after = body.slice(pos)
    const atLineStart = before === '' || before.endsWith('\n')
    const next = `${before}${atLineStart ? '' : '\n'}${prefix}${after}`
    setBody(next)
    requestAnimationFrame(() => el?.focus())
  }

  // Note was deleted or never existed → bounce back to the list.
  if (!note) {
    return (
      <div className="pt-3">
        <RoundBtn label="Kembali" onClick={() => navigate('/notes')}>
          <ArrowLeft size={18} />
        </RoundBtn>
        <p className="mt-6 px-1 text-sm text-muted">Catatan tidak ditemukan.</p>
      </div>
    )
  }

  const handleDelete = () => {
    removeNote(id)
    navigate('/notes')
  }

  const toolbar = [
    { icon: Type, label: 'Judul', onClick: () => insertPrefix('# ') },
    { icon: List, label: 'Daftar', onClick: () => insertPrefix('• ') },
    { icon: ListChecks, label: 'Checklist', onClick: () => insertPrefix('☐ ') },
    { icon: ImageIcon, label: 'Gambar', onClick: () => toast('Sisip gambar segera hadir') },
  ]

  return (
    <div className="flex min-h-[calc(100dvh-7rem)] flex-col pt-3">
      {/* Top bar */}
      <div className="mb-4 flex items-center justify-between">
        <RoundBtn label="Kembali" onClick={() => navigate('/notes')}>
          <ArrowLeft size={18} />
        </RoundBtn>
        <div className="flex items-center gap-2">
          <span className="mr-1 flex items-center gap-1 text-xs text-muted">
            {saved ? (
              <>
                <Check size={13} /> Tersimpan
              </>
            ) : (
              'Menyimpan…'
            )}
          </span>
          <RoundBtn label="Bagikan" onClick={() => toast('Bagikan segera hadir')}>
            <Share2 size={16} />
          </RoundBtn>
          <RoundBtn label="Hapus" onClick={handleDelete}>
            <Trash2 size={16} />
          </RoundBtn>
        </div>
      </div>

      {/* Meta + title + body */}
      <p className="mb-1 text-xs text-muted">{fullDateTime(note.updatedAt)}</p>
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Judul"
        className="w-full bg-transparent text-2xl font-semibold placeholder:text-muted focus:outline-none"
      />
      <textarea
        ref={bodyRef}
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="Mulai menulis…"
        className="mt-3 min-h-[40dvh] w-full flex-1 resize-none bg-transparent text-[15px] leading-relaxed text-ink placeholder:text-muted focus:outline-none dark:text-ink-dark"
      />

      {/* Bottom formatting toolbar */}
      <div className="glass-strong sticky bottom-24 mt-4 flex items-center justify-between rounded-2xl px-3 py-2">
        <div className="flex items-center gap-1">
          {toolbar.map(({ icon: Icon, label, onClick }) => (
            <button
              key={label}
              type="button"
              onClick={onClick}
              aria-label={label}
              className="rounded-lg p-2 text-subtle hover:bg-white/50 hover:text-ink dark:hover:bg-white/10 dark:hover:text-ink-dark"
            >
              <Icon size={18} strokeWidth={1.75} />
            </button>
          ))}
        </div>
        {/* TODO: AI integration — summarise / continue the note with the assistant. */}
        <button
          type="button"
          onClick={() => toast('Fitur AI segera hadir ✨')}
          aria-label="Asisten AI"
          className="text-brand bg-brand-soft rounded-lg p-2"
        >
          <Sparkles size={18} strokeWidth={1.75} />
        </button>
      </div>
    </div>
  )
}
