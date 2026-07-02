// Shared form-field styling so modals stay visually consistent.
export const inputClass =
  'w-full rounded-xl border border-line bg-bg px-3.5 py-2.5 text-sm text-ink ' +
  'placeholder:text-muted focus:border-subtle focus:outline-none ' +
  'dark:border-line-dark dark:bg-bg-dark dark:text-ink-dark'

export function Field({ label, children }) {
  return (
    <label className="block">
      {label && (
        <span className="mb-1.5 block text-xs font-medium text-subtle">
          {label}
        </span>
      )}
      {children}
    </label>
  )
}
