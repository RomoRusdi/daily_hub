// EmptyState — calm placeholder shown when a list has no items yet.
export default function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
      {Icon && (
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-line bg-surface text-muted dark:border-line-dark dark:bg-surface-dark">
          <Icon size={24} strokeWidth={1.5} />
        </div>
      )}
      <h3 className="text-sm font-medium text-ink dark:text-ink-dark">{title}</h3>
      {description && (
        <p className="mt-1 max-w-xs text-sm text-subtle">{description}</p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}
