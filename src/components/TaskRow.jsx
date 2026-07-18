import { motion } from 'framer-motion'
import { Trash2 } from 'lucide-react'
import Checkbox from './Checkbox'
import { listItem } from '../lib/motion'
import { todayKey, weekdayDate } from '../utils/date'

/**
 * Satu baris tugas (Graphite): checkbox kotak + judul; jam monospace di
 * kanan; titik danger 7×7 untuk tugas prioritas. Dipakai di Home & Tasks —
 * parent-nya menyediakan kartu + divider `line-soft`.
 *
 * @param {fn} [onDelete] when provided, a trash button appears on hover
 */
export default function TaskRow({ task, onToggle, onDelete }) {
  const urgent = task.priority === 'high' && !task.done
  // Untuk tugas di hari lain, tampilkan tanggalnya sebagai meta di bawah judul.
  const dateMeta = task.date > todayKey() ? weekdayDate(task.date) : ''

  return (
    <motion.div
      layout="position"
      variants={listItem}
      initial="initial"
      animate="animate"
      exit="exit"
      className="group flex items-center gap-3 px-3.5 py-[13px]"
    >
      <Checkbox
        checked={task.done}
        label={task.title}
        onChange={() => onToggle?.(task.id)}
      />
      <div className="min-w-0 flex-1">
        <p
          className={
            'truncate text-sm ' +
            (task.done
              ? 'text-muted line-through'
              : 'text-ink dark:text-ink-dark')
          }
        >
          {task.title}
        </p>
        {dateMeta && (
          <span className="mt-0.5 block truncate text-xs text-subtle">
            {dateMeta}
          </span>
        )}
      </div>

      {task.time && (
        <span
          className={
            'shrink-0 font-mono text-[11px] ' +
            (task.done ? 'text-muted' : 'text-subtle')
          }
        >
          {task.time}
        </span>
      )}
      {urgent && (
        <span className="h-[7px] w-[7px] shrink-0 rounded-[2px] bg-accent" />
      )}

      {onDelete && (
        <button
          type="button"
          onClick={() => onDelete(task.id)}
          aria-label="Hapus tugas"
          className="hidden shrink-0 rounded-lg p-1 text-muted hover:text-accent group-hover:block"
        >
          <Trash2 size={16} />
        </button>
      )}
    </motion.div>
  )
}
