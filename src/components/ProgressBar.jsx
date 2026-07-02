// Slim monochrome progress bar (0–100).
export default function ProgressBar({ value = 0, className = '' }) {
  const pct = Math.max(0, Math.min(100, value))
  return (
    <div
      className={`h-1.5 w-full overflow-hidden rounded-full bg-line dark:bg-line-dark ${className}`}
      role="progressbar"
      aria-valuenow={pct}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className="bg-brand h-full rounded-full transition-all duration-500"
        style={{ width: `${pct}%` }}
      />
    </div>
  )
}
