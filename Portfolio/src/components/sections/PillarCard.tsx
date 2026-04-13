import { useId, useRef, useState } from 'react'
import { useReducedMotion } from 'motion/react'
import type { LucideIcon } from 'lucide-react'

type PillarCardProps = {
  anchorId: string
  title: string
  description: string
  icon: LucideIcon
  accent: 'violet' | 'cyan'
}

export function PillarCard({
  anchorId,
  title,
  description,
  icon: Icon,
  accent,
}: PillarCardProps) {
  const reduce = useReducedMotion()
  const labelId = useId()
  const ref = useRef<HTMLButtonElement>(null)
  const [tilt, setTilt] = useState({ x: 0, y: 0 })
  const [hover, setHover] = useState(false)

  function onMove(e: React.MouseEvent<HTMLButtonElement>) {
    const el = ref.current
    if (!el) return
    const r = el.getBoundingClientRect()
    el.style.setProperty('--mx', `${((e.clientX - r.left) / r.width) * 100}%`)
    el.style.setProperty('--my', `${((e.clientY - r.top) / r.height) * 100}%`)

    const cx = r.width / 2
    const cy = r.height / 2
    const px = e.clientX - r.left - cx
    const py = e.clientY - r.top - cy
    const deg = (Math.atan2(py, px) * 180) / Math.PI
    el.style.setProperty('--angle', `${deg}deg`)

    if (reduce) return
    const nx = (e.clientX - r.left) / r.width - 0.5
    const ny = (e.clientY - r.top) / r.height - 0.5
    setTilt({ x: ny * -9, y: nx * 9 })
  }

  function onLeave() {
    const el = ref.current
    if (el) {
      el.style.setProperty('--mx', '50%')
      el.style.setProperty('--my', '45%')
      el.style.setProperty('--angle', '0deg')
    }
    setTilt({ x: 0, y: 0 })
    setHover(false)
  }

  return (
    <button
      ref={ref}
      id={anchorId}
      type="button"
      className={`pillar-card pillar-card--${accent}`}
      aria-labelledby={labelId}
      data-hover={hover ? 'true' : undefined}
      onMouseMove={onMove}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={onLeave}
      style={{
        transform: reduce
          ? undefined
          : `perspective(1200px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) translateZ(${hover ? 10 : 0}px)`,
      }}
    >
      <span className="pillar-card__edge" aria-hidden />
      <span className="pillar-card__border-glow" aria-hidden />
      <span className="pillar-card__glow" aria-hidden />
      <span className="pillar-card__icon-wrap" aria-hidden>
        <Icon className="pillar-card__icon" strokeWidth={1.35} />
      </span>
      <h3 id={labelId} className="pillar-card__title">
        {title}
      </h3>
      <p className="pillar-card__body">{description}</p>
    </button>
  )
}
