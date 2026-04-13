import * as m from 'motion/react-m'
import { useReducedMotion, useScroll, useTransform } from 'motion/react'
import { BackgroundAurora } from '../ui/BackgroundAurora'
import { NoiseTexture } from '../ui/NoiseTexture'
import { CosmicParticleBackground } from './CosmicParticleBackground'

export function ImmersiveBackground() {
  const reduce = useReducedMotion()
  const { scrollY } = useScroll()
  const yBack = useTransform(scrollY, (v) => (reduce ? 0 : Math.min(v, 1200) * 0.03))
  const yMid = useTransform(scrollY, (v) => (reduce ? 0 : Math.min(v, 1200) * 0.055))
  const yFront = useTransform(scrollY, (v) => (reduce ? 0 : Math.min(v, 1200) * 0.075))

  return (
    <div className="immersive-bg" aria-hidden>
      <m.div className="immersive-bg__layer immersive-bg__layer--back" style={{ y: yBack }}>
        <div className="immersive-bg__base" />
        <div className="immersive-bg__cosmic-glow" />
      </m.div>
      <m.div className="immersive-bg__layer immersive-bg__layer--mid" style={{ y: yMid }}>
        <div className="immersive-bg__dust" />
        <CosmicParticleBackground />
      </m.div>
      <m.div className="immersive-bg__layer immersive-bg__layer--front" style={{ y: yFront }}>
        <BackgroundAurora />
        <NoiseTexture />
      </m.div>
    </div>
  )
}
