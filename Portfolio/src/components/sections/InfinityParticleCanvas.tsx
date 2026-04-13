import { useEffect, useRef } from 'react'
import {
  createInfinityFieldViewport,
  createInfinityParticleField,
  stepInfinityParticleField,
  type InfinityParticle,
  type ParticleTier,
} from '../../lib/infinityParticleField'

type InfinityParticleCanvasProps = {
  active: boolean
  reduceMotion?: boolean
}

const MIN_COUNT = 1100
const MAX_COUNT = 2200
const VIRTUAL_WIDTH = 1000
const VIRTUAL_HEIGHT = 620

type ViewTransform = {
  cssW: number
  cssH: number
  scale: number
  offsetX: number
  offsetY: number
}

function particleCountForSurface(cssW: number, cssH: number) {
  const area = Math.max(1, cssW * cssH)
  const estimated = Math.floor(area / 54)
  return Math.max(MIN_COUNT, Math.min(MAX_COUNT, estimated))
}

function computeViewTransform(cssW: number, cssH: number): ViewTransform {
  const scale = Math.min(cssW / VIRTUAL_WIDTH, cssH / VIRTUAL_HEIGHT)
  const offsetX = (cssW - VIRTUAL_WIDTH * scale) * 0.5
  const offsetY = (cssH - VIRTUAL_HEIGHT * scale) * 0.5

  return {
    cssW,
    cssH,
    scale,
    offsetX,
    offsetY,
  }
}

/** Extra lift for additive blending on dark hero (keeps palette, adds presence). */
const LUMINANCE_LIFT = 1.32

/**
 * Amber / violet — tuned for clear silhouette + soft bloom on screen blend.
 */
function colorsForParticle(
  side: InfinityParticle['side'],
  tier: ParticleTier,
  alpha: number,
): { glow: string; core: string } {
  const a = (k: number) => Math.min(1, alpha * k * LUMINANCE_LIFT)

  if (tier === 'core') {
    if (side === 'left') {
      return {
        glow: `rgba(225, 145, 95, ${a(0.48)})`,
        core: `rgba(255, 235, 218, ${a(0.9)})`,
      }
    }
    if (side === 'right') {
      return {
        glow: `rgba(165, 108, 215, ${a(0.5)})`,
        core: `rgba(245, 230, 255, ${a(0.9)})`,
      }
    }
    return {
      glow: `rgba(215, 165, 200, ${a(0.48)})`,
      core: `rgba(255, 248, 252, ${a(0.92)})`,
    }
  }

  if (side === 'right') {
    if (tier === 'bright') {
      return {
        glow: `rgba(150, 102, 195, ${a(0.4)})`,
        core: `rgba(220, 205, 245, ${a(0.8)})`,
      }
    }
    return {
      glow: `rgba(88, 72, 135, ${a(0.3)})`,
      core: `rgba(185, 175, 220, ${a(0.68)})`,
    }
  }

  if (side === 'left') {
    if (tier === 'bright') {
      return {
        glow: `rgba(220, 140, 88, ${a(0.38)})`,
        core: `rgba(248, 218, 185, ${a(0.8)})`,
      }
    }
    return {
      glow: `rgba(130, 88, 68, ${a(0.28)})`,
      core: `rgba(218, 190, 165, ${a(0.68)})`,
    }
  }

  if (tier === 'bright') {
    return {
      glow: `rgba(175, 138, 210, ${a(0.36)})`,
      core: `rgba(235, 222, 248, ${a(0.76)})`,
    }
  }
  return {
    glow: `rgba(105, 102, 138, ${a(0.3)})`,
    core: `rgba(195, 198, 225, ${a(0.72)})`,
  }
}

function glowScaleForTier(tier: ParticleTier): number {
  if (tier === 'core') return 4.55
  if (tier === 'bright') return 3.55
  return 2.92
}

export function InfinityParticleCanvas({
  active,
  reduceMotion = false,
}: InfinityParticleCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const particlesRef = useRef<InfinityParticle[] | null>(null)
  /** Pointer in viewport space — drives physics only (no visible cursor overlay). */
  const pointerClientRef = useRef<{ clientX: number; clientY: number } | null>(
    null,
  )
  const rafRef = useRef(0)
  const lastRef = useRef(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !active) return

    const ctx = canvas.getContext('2d', { alpha: true })
    if (!ctx) return

    const surface = canvas
    const context = ctx
    const dpr = Math.min(window.devicePixelRatio || 1, 2)

    const getSurfaceRect = () => surface.getBoundingClientRect()

    function resize() {
      const rect = getSurfaceRect()
      const cssW = rect.width
      const cssH = rect.height
      if (cssW <= 0 || cssH <= 0) return

      const bw = Math.max(1, Math.round(cssW * dpr))
      const bh = Math.max(1, Math.round(cssH * dpr))
      if (surface.width !== bw || surface.height !== bh) {
        surface.width = bw
        surface.height = bh
      }
      surface.style.width = `${cssW}px`
      surface.style.height = `${cssH}px`
      context.setTransform(dpr, 0, 0, dpr, 0, 0)

      const existing = particlesRef.current
      const desiredCount = particleCountForSurface(cssW, cssH)
      if (!existing) {
        particlesRef.current = createInfinityParticleField(
          VIRTUAL_WIDTH,
          VIRTUAL_HEIGHT,
          desiredCount,
        )
      } else {
        const ratio = desiredCount / Math.max(1, existing.length)
        if (ratio < 0.82 || ratio > 1.18) {
          particlesRef.current = createInfinityParticleField(
            VIRTUAL_WIDTH,
            VIRTUAL_HEIGHT,
            desiredCount,
          )
        }
      }
    }

    function onPointerMove(e: PointerEvent) {
      pointerClientRef.current = { clientX: e.clientX, clientY: e.clientY }
    }

    function onPointerLeave() {
      pointerClientRef.current = null
    }

    let ro: ResizeObserver | null = null
    const onWindowResize = () => resize()
    if (typeof ResizeObserver !== 'undefined') {
      ro = new ResizeObserver(resize)
      ro.observe(surface)
    } else {
      window.addEventListener('resize', onWindowResize)
    }

    surface.addEventListener('pointermove', onPointerMove, { passive: true })
    surface.addEventListener('pointerleave', onPointerLeave)
    surface.addEventListener('pointerdown', onPointerMove, { passive: true })

    resize()
    lastRef.current = 0

    const viewport = createInfinityFieldViewport(VIRTUAL_WIDTH, VIRTUAL_HEIGHT)

    function draw(ts: number) {
      const last = lastRef.current || ts
      const rawDt = ts - last
      lastRef.current = ts
      const dt = Math.min(40, rawDt) / 16.67

      const list = particlesRef.current
      if (!list) {
        rafRef.current = requestAnimationFrame(draw)
        return
      }

      const rect = getSurfaceRect()
      const cssW = rect.width
      const cssH = rect.height
      if (cssW <= 0 || cssH <= 0) {
        rafRef.current = requestAnimationFrame(draw)
        return
      }

      const view = computeViewTransform(cssW, cssH)

      let virtualPointer: { x: number; y: number } | null = null
      if (pointerClientRef.current && !reduceMotion) {
        const pc = pointerClientRef.current
        const localX = pc.clientX - rect.left
        const localY = pc.clientY - rect.top
        virtualPointer = {
          x: (localX - view.offsetX) / Math.max(1e-9, view.scale),
          y: (localY - view.offsetY) / Math.max(1e-9, view.scale),
        }
      }

      stepInfinityParticleField(
        list,
        virtualPointer,
        dt,
        rawDt,
        ts,
        viewport,
      )

      context.clearRect(0, 0, cssW, cssH)
      context.save()
      context.translate(view.offsetX, view.offsetY)
      context.scale(view.scale, view.scale)
      context.globalCompositeOperation = 'lighter'

      const breathGlobal = 0.98 + 0.02 * Math.sin(ts * 0.000088)
      const glowBreath = 1 + 0.028 * Math.sin(ts * 0.000076 + 1.05)

      const tiers: ParticleTier[] = ['base', 'bright', 'core']

      for (const tier of tiers) {
        for (const p of list) {
          if (p.tier !== tier) continue

          const twinkleBase =
            0.97 + 0.03 * Math.sin(ts * 0.00015 + p.phase * 1.3)
          const sparkle =
            tier === 'base'
              ? 1
              : 1 +
                0.022 *
                  Math.sin(ts * 0.00021 + p.phase * 2.8) *
                  (tier === 'core' ? 1.04 : 1)

          const twinkle = twinkleBase * sparkle

          const toneScale = 0.94 + 0.08 * (0.5 + 0.5 * Math.sin(p.phase * 2.2))
          const alpha = p.alpha * twinkle * breathGlobal * toneScale * 1.08
          const { glow, core } = colorsForParticle(p.side, p.tier, alpha)
          const gs = glowScaleForTier(p.tier)
          const glowSize =
            p.size * gs * glowBreath * (tier === 'core' ? 1.06 : 1)

          context.fillStyle = glow
          context.beginPath()
          context.arc(p.x, p.y, glowSize, 0, Math.PI * 2)
          context.fill()

          context.fillStyle = core
          context.beginPath()
          context.arc(p.x, p.y, p.size, 0, Math.PI * 2)
          context.fill()

          if (tier === 'core') {
            const glint = 0.36 + 0.22 * Math.sin(ts * 0.00018 + p.phase)
            const glintA =
              alpha * 0.22 * glint * (p.side === 'center' ? 1.12 : 1)
            const glintColor =
              p.side === 'center'
                ? `rgba(255, 245, 250, ${glintA})`
                : p.side === 'left'
                  ? `rgba(255, 230, 210, ${glintA})`
                  : `rgba(235, 220, 250, ${glintA})`
            context.fillStyle = glintColor
            context.beginPath()
            context.arc(p.x, p.y, p.size * 0.38, 0, Math.PI * 2)
            context.fill()
          }
        }
      }

      const cx = VIRTUAL_WIDTH * 0.5
      const cy = VIRTUAL_HEIGHT * 0.5
      const shimmer =
        0.075 +
        0.026 * Math.sin(ts * 0.000104) +
        0.02 * Math.sin(ts * 0.000171 + 0.7)
      context.save()
      context.globalCompositeOperation = 'lighter'
      const sg = context.createRadialGradient(cx, cy, 0, cx, cy, 64)
      sg.addColorStop(0, `rgba(255, 250, 255, ${shimmer * 0.2})`)
      sg.addColorStop(0.2, `rgba(240, 210, 230, ${shimmer * 0.11})`)
      sg.addColorStop(0.4, `rgba(220, 165, 150, ${shimmer * 0.07})`)
      sg.addColorStop(0.52, `rgba(185, 130, 220, ${shimmer * 0.075})`)
      sg.addColorStop(0.72, `rgba(140, 105, 175, ${shimmer * 0.04})`)
      sg.addColorStop(1, 'rgba(0, 0, 0, 0)')
      context.fillStyle = sg
      context.beginPath()
      context.arc(cx, cy, 64, 0, Math.PI * 2)
      context.fill()

      const beam = context.createLinearGradient(cx, cy - 88, cx, cy + 92)
      beam.addColorStop(0, `rgba(245, 235, 252, ${shimmer * 0.038})`)
      beam.addColorStop(0.48, `rgba(235, 210, 235, ${shimmer * 0.062})`)
      beam.addColorStop(0.54, `rgba(255, 254, 255, ${shimmer * 0.07})`)
      beam.addColorStop(0.66, `rgba(220, 195, 245, ${shimmer * 0.045})`)
      beam.addColorStop(1, 'rgba(0, 0, 0, 0)')
      context.fillStyle = beam
      context.beginPath()
      context.ellipse(cx, cy + 5, 32, 92, 0, 0, Math.PI * 2)
      context.fill()
      context.restore()

      const r = Math.min(VIRTUAL_WIDTH, VIRTUAL_HEIGHT) * 0.62
      context.save()
      context.translate(VIRTUAL_WIDTH * 0.5, VIRTUAL_HEIGHT * 0.5)
      context.scale(1.08, 0.86)
      context.globalCompositeOperation = 'destination-in'
      const edgeFade = context.createRadialGradient(0, 0, r * 0.24, 0, 0, r)
      edgeFade.addColorStop(0, 'rgba(0, 0, 0, 1)')
      edgeFade.addColorStop(0.52, 'rgba(0, 0, 0, 0.99)')
      edgeFade.addColorStop(0.78, 'rgba(0, 0, 0, 0.52)')
      edgeFade.addColorStop(1, 'rgba(0, 0, 0, 0)')
      context.fillStyle = edgeFade
      context.beginPath()
      context.arc(0, 0, r, 0, Math.PI * 2)
      context.fill()
      context.restore()

      context.globalCompositeOperation = 'source-over'
      context.restore()

      if (!reduceMotion) {
        rafRef.current = requestAnimationFrame(draw)
      }
    }

    rafRef.current = requestAnimationFrame(draw)
    return () => {
      cancelAnimationFrame(rafRef.current)
      surface.removeEventListener('pointermove', onPointerMove)
      surface.removeEventListener('pointerleave', onPointerLeave)
      surface.removeEventListener('pointerdown', onPointerMove)
      if (ro) ro.disconnect()
      else window.removeEventListener('resize', onWindowResize)
    }
  }, [active, reduceMotion])

  if (!active) return null

  return (
    <canvas
      ref={canvasRef}
      className="infinity-particle-canvas"
      aria-hidden
    />
  )
}
