// Progress ring (Graphite): indikator flat indigo di atas track ring-track,
// angka % monospace di tengah. Fill memakai --brand-from (#5b63e0, sama di
// kedua mode) sesuai spek — --brand dipakai untuk teks/ikon saja.
export default function ProgressRing({ value = 0, size = 54, stroke = 6, label }) {
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
          className="stroke-ring-track dark:stroke-ring-track-dark"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth={stroke}
          strokeDasharray={c}
          strokeDashoffset={offset}
          style={{ stroke: 'var(--brand-from)' }}
          className="transition-all duration-500"
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center font-mono text-xs font-semibold">
        {label ?? `${Math.round(pct)}%`}
      </span>
    </div>
  )
}
