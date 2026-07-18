import { AnimatePresence, motion } from 'framer-motion'
import { Check } from 'lucide-react'
import { SPRING_SNAPPY } from '../lib/motion'

/**
 * Checkbox kotak membulat (Graphite): 20×20, radius 6px. Belum dicentang =
 * border aksen indigo; selesai = fill indigo + centang putih. Fill memakai
 * --brand-from (flat #5b63e0 di kedua mode) lewat kelas bg-brand.
 */
export default function Checkbox({ checked, onChange, label }) {
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
        'flex h-5 w-5 shrink-0 items-center justify-center rounded-[6px] transition-colors ' +
        (checked
          ? 'bg-brand'
          : 'border-brand border-[1.5px] bg-transparent')
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
            <Check size={12} strokeWidth={3.5} />
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  )
}
