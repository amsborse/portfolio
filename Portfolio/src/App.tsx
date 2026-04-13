import { ImmersiveBackground } from './components/layout/ImmersiveBackground'
import { HomePage } from './pages/HomePage'

export default function App() {
  return (
    <div className="site-root">
      <ImmersiveBackground />
      <div className="app-shell">
        <HomePage />
      </div>
    </div>
  )
}
