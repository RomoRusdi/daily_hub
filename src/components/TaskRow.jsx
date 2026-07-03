import { motion } from 'framer-motion'
import { Trash2 } from 'lucide-react'
import Checkbox from './Checkbox'
import { listItem } from '../lib/motion'
import { todayKey, weekdayDate } from '../utils/date'

// Build the muted subtitle under a task title.
function subtitleFor(task) {
  if (task.date > todayKey()) return weekdayDate(task.date)
  if (task.time) return task.deadline ? `${task.time} · Deadline` : task.time
  return ''
}

/**
 * A single task row: circular checkbox + title + optional subtitle.
 * Shared between Home and the Tasks page.
 *
 * @param {'badge'|'dot'|'none'} [indicator] how to flag urgent (high) tasks
 * @param {fn} [onDelete] when provided, a trash button appears on hover
 */
export default function TaskRow({ task, onToggle, onDelete, indicator = 'dot' }) {
  const urgent = task.priority === 'high' && !task.done
  const subtitle = subtitleFor(task)

  return (
    <motion.div
      layout="position"
      variants={listItem}
      initial="initial"
      animate="animate"
      exit="exit"
      className="group flex items-center gap-3 py-2.5"
    >
      <Checkbox
        checked={task.done}
        accent={urgent}
        label={task.title}
        onChange={() => onToggle?.(task.id)}
      />
      <div className="min-w-0 flex-1">
        <p
          className={
            'truncate text-[15px] ' +
            (task.done
              ? 'text-muted line-through'
              : 'text-ink dark:text-ink-dark')
          }
        >
          {task.title}
        </p>
        {subtitle && (
          <span className="mt-0.5 block truncate text-xs text-subtle">
            {subtitle}
          </span>
        )}
      </div>

      {urgent && indicator === 'badge' && (
        <span className="shrink-0 rounded-full bg-accent/10 px-2 py-0.5 text-[11px] font-medium text-accent">
          Urgent
        </span>
      )}
      {urgent && indicator === 'dot' && (
        <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-accent group-hover:hidden" />
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
