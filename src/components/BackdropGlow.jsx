import { useEffect } from 'react'

/**
 * Floating atmospheric glows — the moving counterpart of the static radial
 * glows that used to live in body::before (which now keeps only the base
 * linear gradient + vignette; the grain stays in body::after, above this).
 *
 * Three blurred blobs drift slowly and independently (translate-only, GPU
 * cheap). The frosted .glass surfaces pick the motion up for free via
 * backdrop-filter, so nothing else animates. Styles live in index.css
 * (.glow-field / .glow-blob).
 *
 * Rendered once at the root; sits behind all UI and never captures input.
 */
export default function BackdropGlow() {
  // Battery saver: freeze the drift while the tab/app is in the background.
  // CSS side: `.backdrop-paused .glow-blob { animation-play-state: paused }`.
  useEffect(() => {
    const sync = () =>
      document.documentElement.classList.toggle('backdrop-paused', document.hidden)
    sync()
    document.addEventListener('visibilitychange', sync)
    return () => document.removeEventListener('visibilitychange', sync)
  }, [])

  return (
    <div className="glow-field" aria-hidden="true">
      <div className="glow-blob glow-blob-1" />
      <div className="glow-blob glow-blob-2" />
      <div className="glow-blob glow-blob-3" />
    </div>
  )
}
