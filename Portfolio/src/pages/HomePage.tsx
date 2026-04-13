import { lazy, Suspense } from 'react'
import { AboutSection } from '../components/sections/AboutSection'
import { HeroSection } from '../components/sections/HeroSection'
import { PillarsSection } from '../components/sections/PillarsSection'
import { ThemeStrip } from '../components/sections/ThemeStrip'

const GalaxySection = lazy(() =>
  import('../components/sections/GalaxySection').then((m) => ({
    default: m.GalaxySection,
  })),
)

export function HomePage() {
  return (
    <main className="page-main">
      <HeroSection />
      <PillarsSection />
      <ThemeStrip />
      <AboutSection />
      <Suspense
        fallback={
          <section
            className="galaxy-section"
            aria-hidden
            style={{ minHeight: 'min(78vh, 92vh)' }}
          />
        }
      >
        <GalaxySection />
      </Suspense>
    </main>
  )
}
