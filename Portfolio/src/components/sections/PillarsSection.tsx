import { Brain, Cpu } from 'lucide-react'
import { homeContent } from '../../content/home'
import { Reveal } from '../ui/Reveal'
import { SectionLabel } from '../ui/SectionLabel'
import { PillarCard } from './PillarCard'

const icons = {
  'thinking-loops': Brain,
  systems: Cpu,
} as const

export function PillarsSection() {
  return (
    <section
      className="pillars-section"
      aria-labelledby="pillars-heading"
    >
      <Reveal>
        <SectionLabel id="pillars-heading">Core pillars</SectionLabel>
      </Reveal>
      <div className="pillars-section__grid">
        {homeContent.pillars.map((pillar, i) => (
          <Reveal key={pillar.id} delay={i * 0.06}>
            <PillarCard
              anchorId={pillar.anchorId}
              title={pillar.title}
              description={pillar.description}
              accent={pillar.accent}
              icon={icons[pillar.id as keyof typeof icons]}
            />
          </Reveal>
        ))}
      </div>
    </section>
  )
}
