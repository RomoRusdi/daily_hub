import { motion } from 'framer-motion'
import { EASE, VIEWPORT } from '../lib/motion'

/**
 * Scroll-triggered reveal (dreiraum-style): fade in + gentle rise when the
 * element enters the viewport. Runs once per element (no replay on scroll
 * up/down); `delay` staggers siblings. Uses IntersectionObserver under the
 * hood via framer-motion's whileInView — transform/opacity only.
 *
 * Usage: <Reveal delay={0.08}><Card>…</Card></Reveal>
 */
export default function Reveal({ children, delay = 0, y = 20, className = '' }) {
  return (
    <motion.div
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={VIEWPORT}
      transition={{ duration: 0.5, ease: EASE, delay }}
      className={className}
    >
      {children}
    </motion.div>
  )
}
