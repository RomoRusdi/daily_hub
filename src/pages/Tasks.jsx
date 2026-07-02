import { useMemo, useState } from 'react'
import { CheckCheck, Search, SlidersHorizontal } from 'lucide-react'
import Header from '../components/Header'
import Card from '../components/Card'
import TaskRow from '../components/TaskRow'
import EmptyState from '../components/EmptyState'
import FloatingActionButton from '../components/FloatingActionButton'
import AddTaskModal from '../components/AddTaskModal'
import Button from '../components/Button'
import { inputClass } from '../components/Field'
import { useData } from '../store/DataContext'
import { todayKey } from '../utils/date'

// Uppercase, letter-spaced section label with a count — matches the mockup.
function GroupLabel({ children, count }) {
  return (
    <div className="mb-1.5 mt-5 flex items-center gap-2 px-1 first:mt-0">
      <h2 className="text-[11px] font-semibold uppercase tracking-wider text-muted">
        {children}
      </h2>
      <span className="text-[11px] text-muted">{count}</span>
    </div>
  )
}

function TaskGroup({ label, items, ...handlers }) {
  if (items.length === 0) return null
  return (
    <>
      <GroupLabel count={items.length}>{label}</GroupLabel>
      <Card className="px-4 py-1">
        <div className="divide-y divide-ink/5 dark:divide-white/10">
          {items.map((t) => (
            <TaskRow key={t.id} task={t} {...handlers} />
          ))}
        </div>
      </Card>
    </>
  )
}

export default function Tasks() {
  const { tasks, toggleTask, removeTask, addTask } = useData()
  const [modalOpen, setModalOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [hideCompleted, setHideCompleted] = useState(false)
  const today = todayKey()

  const { todayList, upcomingList, doneList } = useMemo(() => {
    const q = query.trim().toLowerCase()
    const match = (t) => !q || t.title.toLowerCase().includes(q)
    const byTime = (a, b) => (a.time || '').localeCompare(b.time || '')
    const visible = tasks.filter(match)
    const active = visible.filter((t) => !t.done)
    return {
      todayList: active.filter((t) => t.date <= today).sort(byTime),
      upcomingList: active
        .filter((t) => t.date > today)
        .sort((a, b) =>
          a.date === b.date ? byTime(a, b) : a.date.localeCompare(b.date),
        ),
      doneList: visible.filter((t) => t.done),
    }
  }, [tasks, today, query])

  const noTasksAtAll = tasks.length === 0
  const allDoneToday = !noTasksAtAll && todayList.length === 0 && upcomingList.length === 0

  const handlers = { onToggle: toggleTask, onDelete: removeTask, indicator: 'dot' }

  return (
    <div>
      <Header
        title="Tasks"
        showDate={false}
        action={
          <button
            type="button"
            onClick={() => setHideCompleted((v) => !v)}
            aria-label="Filter"
            aria-pressed={hideCompleted}
            className={
              'rounded-full p-2 transition-colors ' +
              (hideCompleted
                ? 'text-ink dark:text-ink-dark'
                : 'text-subtle hover:bg-line/50 dark:hover:bg-line-dark/50')
            }
          >
            <SlidersHorizontal size={19} strokeWidth={1.75} />
          </button>
        }
      />

      {/* Search */}
      <div className="relative mb-2">
        <Search
          size={16}
          className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted"
        />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Cari tugas…"
          className={`${inputClass} pl-9`}
        />
      </div>

      {noTasksAtAll ? (
        <EmptyState
          icon={CheckCheck}
          title="Belum ada tugas"
          description="Tambahkan tugas pertamamu dan mulai atur harimu."
          action={<Button onClick={() => setModalOpen(true)}>+ Tambah tugas</Button>}
        />
      ) : allDoneToday && doneList.length && !query ? (
        <EmptyState
          icon={CheckCheck}
          title="Semua beres 🎉"
          description="Tidak ada tugas hari ini. Nikmati waktumu, atau tambahkan sesuatu yang baru."
          action={<Button onClick={() => setModalOpen(true)}>+ Tambah tugas</Button>}
        />
      ) : (
        <>
          <TaskGroup label="Hari ini" items={todayList} {...handlers} />
          <TaskGroup label="Mendatang" items={upcomingList} {...handlers} />
          {!hideCompleted && (
            <TaskGroup label="Selesai" items={doneList} {...handlers} />
          )}
          {todayList.length === 0 &&
            upcomingList.length === 0 &&
            (hideCompleted || !doneList.length) && (
              <p className="px-1 py-10 text-center text-sm text-muted">
                {query ? 'Tidak ada tugas yang cocok.' : 'Semua tugas aktif sudah beres. 🎉'}
              </p>
            )}
        </>
      )}

      <FloatingActionButton onClick={() => setModalOpen(true)} label="Tambah tugas" />
      <AddTaskModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={addTask}
      />
    </div>
  )
}
