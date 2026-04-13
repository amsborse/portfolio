import * as m from 'motion/react-m'
import { useReducedMotion } from 'motion/react'
import { GalaxyParticleCanvas } from './GalaxyParticleCanvas'

/**
 * Full-bleed spiral galaxy field — second signature interaction aligned with the
 * infinity particle system (calm drift, soft repel, layered glow).
 */
export function GalaxySection() {
  const reduce = useReducedMotion()

  return (
    <section className="galaxy-section" aria-label="Spiral galaxy visualization">
      <div className="galaxy-section__backdrop" aria-hidden />
      <div className="galaxy-section__ambient" aria-hidden />
      <div className="galaxy-section__scene">
        <m.div
          className="galaxy-section__field-wrap"
          initial={reduce ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="galaxy-section__bloom" aria-hidden />
          <GalaxyParticleCanvas active reduceMotion={!!reduce} />
          <div className="galaxy-section__veil" aria-hidden />
          <div className="galaxy-section__edge-fade" aria-hidden />
          <div className="galaxy-section__grain" aria-hidden />
        </m.div>
      </div>
    </section>
  )
}
