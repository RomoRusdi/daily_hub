/**
 * Full-screen loading state. The animation is a REC indicator → laptop closing
 * → morphing check/pin cycle (CSS lives in index.css under `.rec-loader`).
 * Its accent (--c) follows the app brand token, so it's violet in light mode
 * and amber in dark — matching the rest of the UI.
 *
 * `label` shows an optional caption beneath the loader.
 */
export default function Loader({ label = 'Menyiapkan…' }) {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-6">
      <div className="rec-loader" role="status" aria-label={label}>
        {/* Phase 1 — recording indicator */}
        <div className="ph1">
          <span className="record" />
          <span className="record-text">REC</span>
        </div>

        {/* Phase 2 — laptop lid closing */}
        <div className="ph2">
          <svg
            className="laptop-t"
            viewBox="0 0 44 28"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <path
              d="M3 26V4a2 2 0 0 1 2-2h34a2 2 0 0 1 2 2v22"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span className="laptop-b" />
        </div>

        {/* Phase 3 — check / pin morph */}
        <span className="icon" />
      </div>

      {label && <p className="text-sm text-subtle">{label}</p>}
    </div>
  )
}
