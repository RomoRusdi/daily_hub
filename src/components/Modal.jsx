import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'
import { SPRING, DUR, EASE } from '../lib/motion'

/**
 * Modal that renders as a bottom sheet on mobile and a centered dialog on
 * larger screens. Backdrop fades, sheet springs up from the bottom, both
 * animate out on close. Closes on backdrop click or Escape.
 */
export default function Modal({ open, onClose, title, children }) {
  useEffect(() => {
    if (!open) return
    const onKey = (e) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: DUR, ease: EASE }}
          />

          {/* Panel */}
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={title}
            initial={{ y: '100%', opacity: 0.8 }}
            animate={{ y: 0, opacity: 1, transition: SPRING }}
            exit={{ y: '100%', opacity: 0, transition: { duration: 0.2, ease: EASE } }}
            className={
              'glass-strong relative w-full max-w-app ' +
              'rounded-t-2xl sm:rounded-2xl p-5 pb-[calc(1.25rem+var(--safe-bottom))] ' +
              'sm:pb-5 shadow-xl'
            }
          >
            {/* Grab handle (mobile) */}
            <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-ink/15 dark:bg-white/15 sm:hidden" />

            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-base font-medium">{title}</h2>
              <button
                type="button"
                onClick={onClose}
                aria-label="Tutup"
                className="rounded-full p-1.5 text-subtle hover:bg-white/50 hover:text-ink dark:hover:bg-white/10 dark:hover:text-ink-dark"
              >
                <X size={18} />
              </button>
            </div>

            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  )
}
