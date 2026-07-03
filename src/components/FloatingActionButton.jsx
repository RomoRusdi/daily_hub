import { createPortal } from 'react-dom'
import { motion } from 'framer-motion'
import { Plus } from 'lucide-react'
import { SPRING_SNAPPY } from '../lib/motion'

/**
 * Floating action button, pinned above the bottom nav.
 *
 * Rendered through a portal to <body>: the route transition wrapper animates
 * `transform`, and a transformed ancestor re-anchors `position: fixed`
 * children to itself — which made the FAB ride up/down with page
 * transitions. Portaling out of that subtree keeps it truly fixed.
 */
export default function FloatingActionButton({ onClick, label = 'Tambah', icon: Icon = Plus }) {
  return createPortal(
    <div className="px-safe pointer-events-none fixed inset-x-0 bottom-0 z-40">
      <div className="mx-auto max-w-app px-4 sm:max-w-xl">
        {/* Sits above the floating pill nav: its bottom offset
            (max(safe,12px)) + pill height (~58px) + a small gap. */}
        <div className="flex justify-end pb-[calc(max(var(--safe-bottom),0.75rem)+4.5rem)]">
          <motion.button
            type="button"
            onClick={onClick}
            aria-label={label}
            whileTap={{ scale: 0.88 }}
            transition={SPRING_SNAPPY}
            className="bg-brand shadow-brand pointer-events-auto flex h-14 w-14 items-center justify-center rounded-full"
          >
            <Icon size={22} strokeWidth={2} />
          </motion.button>
        </div>
      </div>
    </div>,
    document.body,
  )
}
