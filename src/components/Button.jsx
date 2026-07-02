// Button — primary / secondary / ghost / icon variants.
const base =
  'inline-flex items-center justify-center gap-2 font-medium transition-colors ' +
  'focus:outline-none focus-visible:ring-2 focus-visible:ring-ink/20 ' +
  'dark:focus-visible:ring-ink-dark/20 disabled:opacity-40 disabled:cursor-not-allowed'

const variants = {
  primary:
    'bg-ink text-white hover:bg-ink/90 dark:bg-ink-dark dark:text-bg-dark ' +
    'dark:hover:bg-ink-dark/90 rounded-xl px-4 py-2.5 text-sm',
  secondary:
    'bg-surface text-ink border border-line hover:bg-line/40 ' +
    'dark:bg-surface-dark dark:text-ink-dark dark:border-line-dark ' +
    'dark:hover:bg-line-dark/40 rounded-xl px-4 py-2.5 text-sm',
  ghost:
    'text-subtle hover:text-ink hover:bg-line/40 dark:hover:text-ink-dark ' +
    'dark:hover:bg-line-dark/40 rounded-xl px-3 py-2 text-sm',
  icon:
    'text-subtle hover:text-ink hover:bg-line/50 dark:hover:text-ink-dark ' +
    'dark:hover:bg-line-dark/50 rounded-full p-2',
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
