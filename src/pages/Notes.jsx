import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { StickyNote, Trash2, Search } from 'lucide-react'
import Header from '../components/Header'
import Card from '../components/Card'
import Reveal from '../components/Reveal'
import EmptyState from '../components/EmptyState'
import FloatingActionButton from '../components/FloatingActionButton'
import Button from '../components/Button'
import { inputClass } from '../components/Field'
import { useData } from '../store/DataContext'
import { shortDate, toKey } from '../utils/date'

export default function Notes() {
  const { notes, addNote, removeNote } = useData()
  const navigate = useNavigate()
  const [searching, setSearching] = useState(false)
  const [query, setQuery] = useState('')

  const createNote = () => {
    const id = addNote({ title: '', body: '' })
    navigate(`/notes/${id}`)
  }

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return notes
    return notes.filter(
      (n) =>
        n.title.toLowerCase().includes(q) || n.body.toLowerCase().includes(q),
    )
  }, [notes, query])

  return (
    <div>
      <Header
        title="Notes"
        showDate={false}
        action={
          <button
            type="button"
            onClick={() => setSearching((s) => !s)}
            aria-label="Cari catatan"
            className={
              'rounded-full p-2 transition-colors ' +
              (searching
                ? 'text-ink dark:text-ink-dark'
                : 'text-subtle hover:bg-line/50 dark:hover:bg-line-dark/50')
            }
          >
            <Search size={19} strokeWidth={1.75} />
          </button>
        }
      />

      {searching && (
        <input
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Cari catatan…"
          className={`${inputClass} mb-3`}
        />
      )}

      {notes.length === 0 ? (
        <EmptyState
          icon={StickyNote}
          title="Belum ada catatan"
          description="Simpan ide, daftar, atau apa pun yang ingin kamu ingat."
          action={<Button onClick={createNote}>+ Buat catatan</Button>}
        />
      ) : visible.length === 0 ? (
        <p className="px-1 py-10 text-center text-sm text-muted">
          Tidak ada catatan yang cocok.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {visible.map((note, i) => (
            <Reveal key={note.id} delay={Math.min(i * 0.06, 0.3)} y={16}>
            <Card
              lite
              className="group relative flex h-full cursor-pointer flex-col p-3.5 transition-colors hover:border-subtle"
              onClick={() => navigate(`/notes/${note.id}`)}
            >
              <p className="line-clamp-1 text-sm font-medium">
                {note.title || 'Tanpa judul'}
              </p>
              <p className="mt-1 line-clamp-4 whitespace-pre-wrap text-xs leading-relaxed text-subtle">
                {note.body || 'Catatan kosong'}
              </p>
              <span className="mt-3 text-[11px] text-muted">
                {shortDate(toKey(new Date(note.updatedAt)))}
              </span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  removeNote(note.id)
                }}
                aria-label="Hapus catatan"
                className="absolute right-2 top-2 hidden rounded-lg p-1.5 text-muted hover:text-accent group-hover:block"
              >
                <Trash2 size={15} />
              </button>
            </Card>
            </Reveal>
          ))}
        </div>
      )}

      <FloatingActionButton onClick={createNote} label="Catatan baru" />
    </div>
  )
}
