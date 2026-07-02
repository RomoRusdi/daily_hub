// Simple SVG progress ring used on the Home summary card.
export default function ProgressRing({ value = 0, size = 56, stroke = 5, label }) {
  const pct = Math.max(0, Math.min(100, value))
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const offset = c - (pct / 100) * c

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth={stroke}
          className="stroke-line dark:stroke-line-dark"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          className="stroke-brand transition-all duration-500"
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-xs font-semibold">
        {label ?? `${Math.round(pct)}%`}
      </span>
    </div>
  )
}
