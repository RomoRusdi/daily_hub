// Button — primary / secondary / ghost / icon variants.
const base =
  'inline-flex items-center justify-center gap-2 font-medium transition ' +
  'ring-brand disabled:opacity-40 disabled:cursor-not-allowed'

const variants = {
  primary:
    'bg-brand shadow-brand hover:opacity-95 active:scale-[0.99] ' +
    'rounded-xl px-4 py-2.5 text-sm',
  secondary:
    'glass text-ink hover:bg-surface-2 dark:hover:bg-surface-2-dark dark:text-ink-dark ' +
    'rounded-xl px-4 py-2.5 text-sm',
  ghost:
    'text-subtle hover:text-ink hover:bg-line-soft dark:hover:text-ink-dark ' +
    'dark:hover:bg-line-soft-dark rounded-xl px-3 py-2 text-sm',
  icon:
    'text-subtle hover:text-ink hover:bg-line-soft dark:hover:text-ink-dark ' +
    'dark:hover:bg-line-soft-dark rounded-full p-2',
}

export default function Button({
  variant = 'primary',
  className = '',
  type = 'button',
  children,
  ...props
}) {
  return (
    <button
      type={type}
      className={`${base} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
