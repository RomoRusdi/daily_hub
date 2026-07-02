import { Plus } from 'lucide-react'

/**
 * Floating action button, pinned above the bottom nav. Centered within the
 * app column so it stays reachable on both mobile and desktop.
 */
export default function FloatingActionButton({ onClick, label = 'Tambah', icon: Icon = Plus }) {
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40">
      <div className="mx-auto max-w-app px-4">
        <div className="flex justify-end pb-[calc(4.75rem+var(--safe-bottom))]">
          <button
            type="button"
            onClick={onClick}
            aria-label={label}
            className="bg-brand shadow-brand pointer-events-auto flex h-14 w-14 items-center justify-center rounded-full transition-transform hover:scale-105 active:scale-95"
          >
            <Icon size={22} strokeWidth={2} />
          </button>
        </div>
      </div>
    </div>
  )
}
