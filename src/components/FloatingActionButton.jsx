import { motion } from 'framer-motion'
import { Plus } from 'lucide-react'
import { SPRING } from '../lib/motion'

/**
 * Floating action button, pinned above the bottom nav. Centered within the
 * app column so it stays reachable on both mobile and desktop. Enters with a
 * soft spring and scales down on press.
 */
export default function FloatingActionButton({ onClick, label = 'Tambah', icon: Icon = Plus }) {
  return (
    <div className="px-safe pointer-events-none fixed inset-x-0 bottom-0 z-40">
      <div className="mx-auto max-w-app px-4">
        <div className="flex justify-end pb-[calc(4.75rem+var(--safe-bottom))]">
          <motion.button
            type="button"
            onClick={onClick}
            aria-label={label}
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            whileTap={{ scale: 0.88 }}
            transition={SPRING}
            className="bg-brand shadow-brand pointer-events-auto flex h-14 w-14 items-center justify-center rounded-full"
          >
            <Icon size={22} strokeWidth={2} />
          </motion.button>
        </div>
      </div>
    </div>
  )
}
