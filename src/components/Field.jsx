// Shared form-field styling so modals stay visually consistent.
export const inputClass =
  'input-glass w-full rounded-xl px-3.5 py-2.5 text-sm text-ink ' +
  'placeholder:text-muted focus:outline-none ring-brand ' +
  'dark:text-ink-dark'

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
