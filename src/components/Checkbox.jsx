import { AnimatePresence, motion } from 'framer-motion'
import { Check } from 'lucide-react'
import { SPRING_SNAPPY } from '../lib/motion'

// Custom circular checkbox. `accent` tints the checked fill amber (urgent).
// The check mark pops in with a soft spring; the button gives tap feedback.
export default function Checkbox({ checked, onChange, accent = false, label }) {
  return (
    <motion.button
      type="button"
      role="checkbox"
      aria-checked={checked}
      aria-label={label}
      onClick={onChange}
      whileTap={{ scale: 0.85 }}
      transition={SPRING_SNAPPY}
      className={
        'flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full border ' +
        'transition-colors ' +
        (checked
          ? accent
            ? 'bg-accent border-accent text-white'
            : 'bg-brand border-transparent'
          : accent
            ? 'border-accent/60 hover:border-accent'
            : 'border-ink/25 dark:border-white/25 hover:border-subtle')
      }
    >
      <AnimatePresence>
        {checked && (
          <motion.span
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1, transition: SPRING_SNAPPY }}
            exit={{ scale: 0, opacity: 0, transition: { duration: 0.1 } }}
            className="flex"
          >
            <Check size={13} strokeWidth={3} />
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  )
}
