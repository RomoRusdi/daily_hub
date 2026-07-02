import { Check } from 'lucide-react'

// Custom monochrome checkbox. `accent` tints the checked fill amber (urgent).
export default function Checkbox({ checked, onChange, accent = false, label }) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      aria-label={label}
      onClick={onChange}
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
      {checked && <Check size={13} strokeWidth={3} />}
    </button>
  )
}
