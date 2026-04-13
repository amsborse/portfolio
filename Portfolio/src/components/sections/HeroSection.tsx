import { motion, useReducedMotion } from 'motion/react'
import { Network, PenLine } from 'lucide-react'
import { homeContent } from '../../content/home'
import { getHeroStagger, heroItem } from '../../lib/motion-variants'
import { MagneticButton } from '../ui/MagneticButton'
import { HeroInfinityScene } from './HeroInfinityScene'

export function HeroSection() {
  const reduce = useReducedMotion()

  return (
    <header className="hero-section">
      <div className="hero-section__haze" aria-hidden />

      <HeroInfinityScene />

      <div className="hero-section__content hero-section__content--below-scene">
        <motion.div
          className="hero-section__copy"
          variants={getHeroStagger(!!reduce)}
          initial={reduce ? false : 'hidden'}
          animate="visible"
        >
          <motion.div variants={heroItem}>
            <p className="hero-section__eyebrow">{homeContent.roles}</p>
          </motion.div>
          <motion.div variants={heroItem}>
            <h1 id="hero-name" className="hero-section__name">
              {homeContent.name}
            </h1>
          </motion.div>
          <motion.p className="hero-section__tagline" variants={heroItem}>
            {homeContent.tagline}
          </motion.p>
          <motion.p className="hero-section__support" variants={heroItem}>
            {homeContent.heroDescription}
          </motion.p>
          <motion.div className="hero-section__ctas" variants={heroItem}>
            {homeContent.ctas.map((cta) => (
              <MagneticButton
                key={cta.id}
                className="btn btn--primary"
                href={cta.href}
              >
                {cta.id === 'writing' ? (
                  <PenLine className="btn__icon" strokeWidth={1.75} aria-hidden />
                ) : (
                  <Network className="btn__icon" strokeWidth={1.75} aria-hidden />
                )}
                {cta.label}
              </MagneticButton>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </header>
  )
}
