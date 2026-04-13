import { AboutSection } from '../components/sections/AboutSection'
import { GalaxySection } from '../components/sections/GalaxySection'
import { HeroSection } from '../components/sections/HeroSection'
import { PillarsSection } from '../components/sections/PillarsSection'
import { ThemeStrip } from '../components/sections/ThemeStrip'

export function HomePage() {
  return (
    <main className="page-main">
      <HeroSection />
      <PillarsSection />
      <ThemeStrip />
      <AboutSection />
      <GalaxySection />
    </main>
  )
}
