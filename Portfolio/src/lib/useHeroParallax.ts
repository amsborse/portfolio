import { useEffect, useRef, useState } from 'react'

type Offset = { x: number; y: number }

export function useHeroParallax(enabled: boolean, strength = 0.035) {
  const ref = useRef<HTMLDivElement>(null)
  const [offset, setOffset] = useState<Offset>({ x: 0, y: 0 })

  useEffect(() => {
    if (!enabled) return

    const onMove = (e: MouseEvent) => {
      const el = ref.current
      if (!el) return
      const rect = el.getBoundingClientRect()
      const cx = rect.left + rect.width / 2
      const cy = rect.top + rect.height / 2
      setOffset({
        x: (e.clientX - cx) * strength,
        y: (e.clientY - cy) * strength,
      })
    }

    const onLeave = () => setOffset({ x: 0, y: 0 })

    window.addEventListener('mousemove', onMove, { passive: true })
    window.addEventListener('mouseleave', onLeave)
    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseleave', onLeave)
    }
  }, [enabled, strength])

  return { ref, offset }
}
