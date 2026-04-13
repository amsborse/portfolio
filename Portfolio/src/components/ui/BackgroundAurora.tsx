import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react'

export function BackgroundAurora() {
  const reduce = useReducedMotion()
  const { scrollY } = useScroll()
  const driftDown = useTransform(scrollY, [0, 700], [0, 56])
  const driftUp = useTransform(scrollY, [0, 700], [0, -44])

  if (reduce) {
    return (
      <div className="aurora aurora--static" aria-hidden>
        <div className="aurora__blob aurora__blob--violet" />
        <div className="aurora__blob aurora__blob--cyan" />
        <div className="aurora__blob aurora__blob--indigo" />
      </div>
    )
  }

  return (
    <div className="aurora" aria-hidden>
      <motion.div
        className="aurora__blob aurora__blob--violet"
        style={{ y: driftDown }}
        animate={{ x: [0, 28, -18, 0], y: [0, -22, 14, 0] }}
        transition={{ duration: 28, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="aurora__blob aurora__blob--cyan"
        style={{ y: driftUp }}
        animate={{ x: [0, -32, 24, 0], y: [0, 26, -16, 0] }}
        transition={{ duration: 32, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="aurora__blob aurora__blob--indigo"
        animate={{ x: [0, 20, -26, 0], y: [0, 18, -22, 0] }}
        transition={{ duration: 36, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="aurora__blob aurora__blob--amber"
        style={{ y: driftDown }}
        animate={{ x: [0, -14, 18, 0], y: [0, -12, 10, 0] }}
        transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
      />
      <div className="aurora__vignette" />
    </div>
  )
}
