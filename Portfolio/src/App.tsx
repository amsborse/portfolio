import { domAnimation, LazyMotion } from 'motion/react'
import { ImmersiveBackground } from './components/layout/ImmersiveBackground'
import { HomePage } from './pages/HomePage'

export default function App() {
  return (
    <LazyMotion features={domAnimation} strict>
      <div className="site-root">
        <ImmersiveBackground />
        <div className="app-shell">
          <HomePage />
        </div>
      </div>
    </LazyMotion>
  )
}
