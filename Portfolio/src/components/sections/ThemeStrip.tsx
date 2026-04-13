import { homeContent } from '../../content/home'
import { Reveal } from '../ui/Reveal'

export function ThemeStrip() {
  return (
    <Reveal delay={0.04}>
      <div
        className="theme-strip"
        role="list"
        aria-label="Recurring themes"
      >
        {homeContent.themes.map((label) => (
          <span key={label} className="theme-strip__chip" role="listitem">
            {label}
          </span>
        ))}
      </div>
    </Reveal>
  )
}
