// Shared animation vocabulary — one set of durations/easings so every
// animation in Hub feels like part of the same system. Only transform and
// opacity are animated (GPU-friendly, no layout thrash).
//
// Reduced motion: the app is wrapped in <MotionConfig reducedMotion="user">
// (see main.jsx), so framer-motion automatically disables transform/layout
// animations for users with `prefers-reduced-motion`.

/** Gentle ease-out for fades/slides. */
export const EASE = [0.32, 0.72, 0, 1]

/** Base duration (seconds) for small transitions. */
export const DUR = 0.22

/** Soft spring for sheets, FAB, and checkmarks. */
export const SPRING = { type: 'spring', stiffness: 420, damping: 34, mass: 0.9 }

/** Page-level route transition: fade + slight rise. */
export const pageVariants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0, transition: { duration: DUR, ease: EASE } },
  exit: { opacity: 0, y: -6, transition: { duration: 0.15, ease: EASE } },
}

/** List item: subtle enter/exit. Pass a custom index for stagger delay. */
export const listItem = {
  initial: { opacity: 0, y: 6 },
  animate: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: DUR, ease: EASE, delay: Math.min(i * 0.035, 0.25) },
  }),
  exit: { opacity: 0, scale: 0.97, transition: { duration: 0.15, ease: EASE } },
}
