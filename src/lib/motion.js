// Shared animation vocabulary — one set of durations/easings so every
// animation in Hub feels like part of the same system. Only transform and
// opacity are animated (GPU-friendly, no layout thrash).
//
// Reduced motion: the app is wrapped in <MotionConfig reducedMotion="user">
// (see main.jsx), so framer-motion automatically disables transform/layout
// animations for users with `prefers-reduced-motion`.

/** Gentle ease-out for fades/slides. */
export const EASE = [0.22, 0.61, 0.36, 1]

/** Base duration (seconds) for small transitions. */
export const DUR = 0.3

/** Soft spring for sheets and the nav pill — smooth, no harsh snap. */
export const SPRING = { type: 'spring', stiffness: 240, damping: 28, mass: 1 }

/** Snappier spring reserved for tiny elements (checkmark pop). */
export const SPRING_SNAPPY = { type: 'spring', stiffness: 480, damping: 30 }

/** Page-level route transition: fade + slight rise. */
export const pageVariants = {
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0, transition: { duration: DUR, ease: EASE } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.18, ease: EASE } },
}

/**
 * List item enter/exit. Intentionally has NO per-index delay: a delay inside
 * the `animate` variant re-applies on every list change (delete/toggle) and
 * makes rows re-stagger — the jank we're avoiding. Section-level stagger is
 * handled by <Reveal> instead.
 */
export const listItem = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.25, ease: EASE } },
  exit: { opacity: 0, scale: 0.97, transition: { duration: 0.16, ease: EASE } },
}

/** Scroll-reveal viewport config: fire once, slightly before fully visible. */
export const VIEWPORT = { once: true, margin: '0px 0px -48px 0px' }
