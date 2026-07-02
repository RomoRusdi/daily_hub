import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'

/**
 * Modal that renders as a bottom sheet on mobile and a centered dialog on
 * larger screens. Closes on backdrop click or Escape.
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

  if (!open) return null

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={
          'glass-strong relative w-full max-w-app ' +
          'rounded-t-2xl sm:rounded-2xl p-5 pb-[calc(1.25rem+var(--safe-bottom))] ' +
          'sm:pb-5 shadow-xl animate-[slideUp_.2s_ease-out]'
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
            className="rounded-full p-1.5 text-subtle hover:bg-line/50 hover:text-ink dark:hover:bg-line-dark/50 dark:hover:text-ink-dark"
          >
            <X size={18} />
          </button>
        </div>

        {children}
      </div>

      <style>{`@keyframes slideUp{from{transform:translateY(12px);opacity:.6}to{transform:translateY(0);opacity:1}}`}</style>
    </div>,
    document.body,
  )
}
