import * as m from 'motion/react-m'
import { useReducedMotion, useScroll, useTransform } from 'motion/react'
import { useHeroParallax } from '../../lib/useHeroParallax'
import { InfinityParticleCanvas } from './InfinityParticleCanvas'

/**
 * Full-width interactive infinity field. Owns canvas bounds and pointer mapping
 * independently of hero text layout (see HeroSection).
 */
export function HeroInfinityScene() {
  const reduce = useReducedMotion()
  const { ref, offset } = useHeroParallax(!reduce, 0.034)

  const { scrollY } = useScroll()
  const yAmbient = useTransform(scrollY, (v) =>
    reduce ? 0 : Math.min(v, 600) * 0.032,
  )
  const ySymbol = useTransform(scrollY, (v) =>
    reduce ? 0 : Math.min(v, 600) * -0.017,
  )

  return (
    <div className="hero-infinity-scene">
      <div
        ref={ref}
        className="hero-infinity-scene__surface"
        style={{
          transform: reduce ? undefined : `translate3d(${offset.x}px, ${offset.y}px, 0)`,
        }}
      >
        <div className="hero-infinity-scene__parallax">
          <m.div
            className="hero-infinity-scene__ambient"
            style={{ y: yAmbient }}
            aria-hidden
          />

          <m.div
            className="hero-infinity-scene__field-wrap"
            style={{ y: ySymbol }}
          >
            <div className="hero-infinity-scene__bloom" aria-hidden />
            <InfinityParticleCanvas active reduceMotion={!!reduce} />
            <div className="hero-infinity-scene__veil" aria-hidden />
            <div className="hero-infinity-scene__edge-fade" aria-hidden />
            <div className="hero-infinity-scene__grain hero-infinity-scene__grain--infinity" />
          </m.div>
        </div>
      </div>
    </div>
  )
}
