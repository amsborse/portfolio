import { homeContent } from '../../content/home'
import { Reveal } from '../ui/Reveal'
import { SectionLabel } from '../ui/SectionLabel'

export function AboutSection() {
  return (
    <section className="about-section" aria-labelledby="about-heading">
      <Reveal>
        <SectionLabel id="about-heading">Authority</SectionLabel>
      </Reveal>
      <Reveal delay={0.06}>
        <blockquote className="about-section__quote">
          <p className="about-section__text">{homeContent.about}</p>
        </blockquote>
      </Reveal>
    </section>
  )
}
