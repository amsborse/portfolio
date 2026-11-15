import { useEffect, useId, useRef, useState } from 'react'
import { useReducedMotion } from 'motion/react'
import type { LucideIcon } from 'lucide-react'

type PillarCardProps = {
  anchorId: string
  title: string
  description: string
  icon: LucideIcon
  accent: 'violet' | 'cyan'
}

/** How long a card stays lit after a touch ends or after a link lands on it. */
const LIT_AFTER_TOUCH_MS = 500
const LIT_ON_ARRIVAL_MS = 1800

export function PillarCard({
  anchorId,
  title,
  description,
  icon: Icon,
  accent,
}: PillarCardProps) {
  const reduce = useReducedMotion()
  const labelId = useId()
  const ref = useRef<HTMLElement>(null)
  const frame = useRef(0)
  const litTimer = useRef(0)
  const arriveFrame = useRef(0)
  const [lit, setLit] = useState<false | 'true' | 'arrive'>(false)

  // The card is a destination, not a control: the hero links scroll here. Light it on arrival
  // so the reader sees where they landed, including when the same link is used twice.
  useEffect(() => {
    function light(ms: number) {
      window.clearTimeout(litTimer.current)
      setLit('arrive')
      litTimer.current = window.setTimeout(() => setLit(false), ms)
    }
    // Lighting repaints the whole card. Doing it in the same frame as the jump made the click
    // itself slower to show (measured), so it starts one frame after the jump has been painted.
    function arrive() {
      cancelAnimationFrame(arriveFrame.current)
      arriveFrame.current = requestAnimationFrame(() => {
        arriveFrame.current = requestAnimationFrame(() => light(LIT_ON_ARRIVAL_MS))
      })
    }
    function onClick(e: MouseEvent) {
      const link = (e.target as Element | null)?.closest?.('a[href]')
      if (link?.getAttribute('href') === `#${anchorId}`) arrive()
    }
    function onHash() {
      if (window.location.hash === `#${anchorId}`) arrive()
    }
    onHash()
    document.addEventListener('click', onClick)
    window.addEventListener('hashchange', onHash)
    return () => {
      document.removeEventListener('click', onClick)
      window.removeEventListener('hashchange', onHash)
      window.clearTimeout(litTimer.current)
      cancelAnimationFrame(frame.current)
      cancelAnimationFrame(arriveFrame.current)
    }
  }, [anchorId])

  // Pointer position is written straight to the element once per frame: no React render per
  // mouse move.
  function onMove(e: React.PointerEvent<HTMLElement>) {
    if (e.pointerType === 'touch') return
    const el = ref.current
    if (!el) return
    const { clientX, clientY } = e
    cancelAnimationFrame(frame.current)
    frame.current = requestAnimationFrame(() => {
      const r = el.getBoundingClientRect()
      const nx = (clientX - r.left) / r.width
      const ny = (clientY - r.top) / r.height
      el.style.setProperty('--mx', `${nx * 100}%`)
      el.style.setProperty('--my', `${ny * 100}%`)
      el.style.setProperty('--angle', `${(Math.atan2(ny - 0.5, nx - 0.5) * 180) / Math.PI}deg`)
      if (reduce) return
      el.style.transform = `perspective(1200px) rotateX(${(ny - 0.5) * -9}deg) rotateY(${(nx - 0.5) * 9}deg) translateZ(10px)`
    })
  }

  function onLeave() {
    cancelAnimationFrame(frame.current)
    const el = ref.current
    if (!el) return
    el.style.setProperty('--mx', '50%')
    el.style.setProperty('--my', '45%')
    el.style.setProperty('--angle', '0deg')
    el.style.transform = ''
  }

  // Touch has no hover: the card lights under the finger and fades shortly after it lifts.
  function onDown(e: React.PointerEvent<HTMLElement>) {
    if (e.pointerType !== 'touch') return
    const el = ref.current
    if (el) {
      const r = el.getBoundingClientRect()
      el.style.setProperty('--mx', `${((e.clientX - r.left) / r.width) * 100}%`)
      el.style.setProperty('--my', `${((e.clientY - r.top) / r.height) * 100}%`)
    }
    window.clearTimeout(litTimer.current)
    setLit('true')
  }

  function onUp(e: React.PointerEvent<HTMLElement>) {
    if (e.pointerType !== 'touch') return
    window.clearTimeout(litTimer.current)
    litTimer.current = window.setTimeout(() => setLit(false), LIT_AFTER_TOUCH_MS)
  }

  return (
    <article
      ref={ref}
      id={anchorId}
      className={`pillar-card pillar-card--${accent}`}
      aria-labelledby={labelId}
      data-lit={lit || undefined}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      onPointerDown={onDown}
      onPointerUp={onUp}
      onPointerCancel={onUp}
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
    </article>
  )
}
