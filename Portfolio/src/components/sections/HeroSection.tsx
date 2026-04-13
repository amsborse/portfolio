import * as m from 'motion/react-m'
import { useReducedMotion } from 'motion/react'
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
        <m.div
          className="hero-section__copy"
          variants={getHeroStagger(!!reduce)}
          initial={reduce ? false : 'hidden'}
          animate="visible"
        >
          <m.div variants={heroItem}>
            <p className="hero-section__eyebrow">{homeContent.roles}</p>
          </m.div>
          <m.div variants={heroItem}>
            <h1 id="hero-name" className="hero-section__name">
              {homeContent.name}
            </h1>
          </m.div>
          <m.p className="hero-section__tagline" variants={heroItem}>
            {homeContent.tagline}
          </m.p>
          <m.p className="hero-section__support" variants={heroItem}>
            {homeContent.heroDescription}
          </m.p>
          <m.div className="hero-section__ctas" variants={heroItem}>
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
          </m.div>
        </m.div>
      </div>
    </header>
  )
}
