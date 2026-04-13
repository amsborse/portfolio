import { useEffect, useRef } from 'react'
import {
  bindCanvasRunState,
  canvasBackingDpr,
} from '../../lib/canvasAnimationGuard'
import {
  createGalaxyFieldViewport,
  createGalaxyParticleField,
  stepGalaxyParticleField,
  type GalaxyHue,
  type GalaxyLayer,
  type GalaxyParticle,
} from '../../lib/galaxyParticleField'

type GalaxyParticleCanvasProps = {
  active: boolean
  reduceMotion?: boolean
}

const MIN_COUNT = 560
const MAX_COUNT = 1380
const VIRTUAL_WIDTH = 1000
const VIRTUAL_HEIGHT = 820

type ViewTransform = {
  cssW: number
  cssH: number
  scale: number
  offsetX: number
  offsetY: number
}

function particleCountForSurface(cssW: number, cssH: number) {
  const area = Math.max(1, cssW * cssH)
  const estimated = Math.floor(area / 78)
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

/** Cool white / pale ice blue — reference galaxy; no warm lavender. */
function colorsForGalaxy(
  layer: GalaxyLayer,
  hue: GalaxyHue,
  alpha: number,
): { glow: string; core: string } {
  const a = (k: number) => Math.min(1, alpha * k)

  if (layer === 'core') {
    if (hue === 'cyan') {
      return {
        glow: `rgba(140, 195, 235, ${a(0.46)})`,
        core: `rgba(232, 248, 255, ${a(0.9)})`,
      }
    }
    if (hue === 'ice') {
      return {
        glow: `rgba(175, 205, 238, ${a(0.44)})`,
        core: `rgba(248, 252, 255, ${a(0.88)})`,
      }
    }
    return {
      glow: `rgba(200, 218, 242, ${a(0.45)})`,
      core: `rgba(255, 255, 255, ${a(0.9)})`,
    }
  }

  if (layer === 'mid') {
    if (hue === 'cyan') {
      return {
        glow: `rgba(95, 150, 205, ${a(0.3)})`,
        core: `rgba(200, 230, 255, ${a(0.76)})`,
      }
    }
    if (hue === 'ice') {
      return {
        glow: `rgba(120, 155, 200, ${a(0.28)})`,
        core: `rgba(215, 232, 252, ${a(0.74)})`,
      }
    }
    return {
      glow: `rgba(105, 130, 168, ${a(0.26)})`,
      core: `rgba(210, 225, 245, ${a(0.72)})`,
    }
  }

  if (hue === 'cyan') {
    return {
      glow: `rgba(70, 110, 165, ${a(0.2)})`,
      core: `rgba(165, 200, 240, ${a(0.52)})`,
    }
  }
  if (hue === 'ice') {
    return {
      glow: `rgba(78, 105, 145, ${a(0.19)})`,
      core: `rgba(175, 200, 235, ${a(0.48)})`,
    }
  }
  return {
    glow: `rgba(72, 88, 118, ${a(0.18)})`,
    core: `rgba(188, 202, 228, ${a(0.52)})`,
  }
}

function glowScaleForLayer(layer: GalaxyLayer): number {
  if (layer === 'core') return 3.55
  if (layer === 'mid') return 2.75
  return 1.95
}

export function GalaxyParticleCanvas({
  active,
  reduceMotion = false,
}: GalaxyParticleCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const particlesRef = useRef<GalaxyParticle[] | null>(null)
  const numArmsRef = useRef(4)
  const galaxyRotationRef = useRef(0)
  const pointerClientRef = useRef<{ clientX: number; clientY: number } | null>(
    null,
  )
  const rafRef = useRef(0)
  const lastRef = useRef(0)
  const shouldAnimRef = useRef(true)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !active) return

    const ctx = canvas.getContext('2d', { alpha: true })
    if (!ctx) return

    const surface = canvas
    const context = ctx
    const dpr = canvasBackingDpr()

    const disposeRun = bindCanvasRunState(
      surface,
      (run) => {
        shouldAnimRef.current = run
        if (run && !reduceMotion) {
          cancelAnimationFrame(rafRef.current)
          rafRef.current = requestAnimationFrame(draw)
        }
      },
      { rootMargin: '160px 0px' },
    )

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
        const created = createGalaxyParticleField(
          VIRTUAL_WIDTH,
          VIRTUAL_HEIGHT,
          desiredCount,
        )
        particlesRef.current = created.particles
        numArmsRef.current = created.numArms
      } else {
        const ratio = desiredCount / Math.max(1, existing.length)
        if (ratio < 0.82 || ratio > 1.18) {
          const created = createGalaxyParticleField(
            VIRTUAL_WIDTH,
            VIRTUAL_HEIGHT,
            desiredCount,
          )
          particlesRef.current = created.particles
          numArmsRef.current = created.numArms
          galaxyRotationRef.current = 0
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

    const viewport = createGalaxyFieldViewport(VIRTUAL_WIDTH, VIRTUAL_HEIGHT)

    function draw(ts: number) {
      if (!shouldAnimRef.current) return

      const last = lastRef.current || ts
      const rawDt = ts - last
      lastRef.current = ts
      const dt = Math.min(40, rawDt) / 16.67

      const list = particlesRef.current
      if (!list) {
        if (!reduceMotion && shouldAnimRef.current) {
          rafRef.current = requestAnimationFrame(draw)
        }
        return
      }

      const rect = getSurfaceRect()
      const cssW = rect.width
      const cssH = rect.height
      if (cssW <= 0 || cssH <= 0) {
        if (!reduceMotion && shouldAnimRef.current) {
          rafRef.current = requestAnimationFrame(draw)
        }
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

      stepGalaxyParticleField(
        list,
        numArmsRef.current,
        virtualPointer,
        dt,
        rawDt,
        ts,
        viewport,
        galaxyRotationRef,
        { reduceMotion },
      )

      context.clearRect(0, 0, cssW, cssH)
      context.save()
      context.translate(view.offsetX, view.offsetY)
      context.scale(view.scale, view.scale)

      const cx = VIRTUAL_WIDTH * 0.5
      const cy = VIRTUAL_HEIGHT * 0.5
      const glowR = Math.min(VIRTUAL_WIDTH, VIRTUAL_HEIGHT) * 0.58

      const bgBreath = 0.96 + 0.04 * Math.sin(ts * 0.000058)
      const haze = context.createRadialGradient(cx, cy, 0, cx, cy, glowR * 1.12)
      haze.addColorStop(0, `rgba(12, 18, 36, ${0.28 * bgBreath})`)
      haze.addColorStop(0.22, `rgba(10, 14, 30, ${0.14 * bgBreath})`)
      haze.addColorStop(0.48, `rgba(8, 10, 22, ${0.06 * bgBreath})`)
      haze.addColorStop(1, 'rgba(2, 4, 10, 0)')
      context.fillStyle = haze
      context.beginPath()
      context.arc(cx, cy, glowR * 1.12, 0, Math.PI * 2)
      context.fill()

      const lift = context.createRadialGradient(cx, cy, 0, cx, cy, glowR * 0.52)
      lift.addColorStop(0, `rgba(55, 95, 155, ${0.1 * bgBreath})`)
      lift.addColorStop(0.28, `rgba(38, 58, 105, ${0.055 * bgBreath})`)
      lift.addColorStop(0.55, `rgba(22, 32, 58, ${0.028 * bgBreath})`)
      lift.addColorStop(1, 'rgba(0, 0, 0, 0)')
      context.fillStyle = lift
      context.beginPath()
      context.arc(cx, cy, glowR * 0.52, 0, Math.PI * 2)
      context.fill()

      const coolVeil = context.createRadialGradient(cx, cy, glowR * 0.08, cx, cy, glowR * 0.88)
      coolVeil.addColorStop(0, `rgba(100, 140, 210, ${0.06 * bgBreath})`)
      coolVeil.addColorStop(0.35, `rgba(70, 100, 165, ${0.035 * bgBreath})`)
      coolVeil.addColorStop(0.65, `rgba(40, 55, 95, ${0.015 * bgBreath})`)
      coolVeil.addColorStop(1, 'rgba(0, 0, 0, 0)')
      context.fillStyle = coolVeil
      context.beginPath()
      context.arc(cx, cy, glowR * 0.88, 0, Math.PI * 2)
      context.fill()

      context.globalCompositeOperation = 'lighter'

      const breathGlobal = 0.96 + 0.04 * Math.sin(ts * 0.00007)
      const glowBreath = 1 + 0.03 * Math.sin(ts * 0.00006 + 0.9)

      const layers: GalaxyLayer[] = ['dust', 'mid', 'core']

      for (const layer of layers) {
        for (const p of list) {
          if (p.layer !== layer) continue

          const twinkleBase =
            0.94 + 0.06 * Math.sin(ts * 0.00011 + p.phase * 1.2)
          const sparkle =
            layer === 'dust'
              ? 1
              : 1 +
                0.04 *
                  Math.sin(ts * 0.00016 + p.phase * 2.3) *
                  (layer === 'core' ? 1.06 : 1)

          const twinkle = twinkleBase * sparkle
          const toneScale = 0.91 + 0.1 * (0.5 + 0.5 * Math.sin(p.phase * 2.1))
          /** Oblique disc: slightly brighter on the near side (reference MW tilt). */
          const depthMul = 0.88 + 0.24 * ((p.sinPhi + 1) * 0.5)
          const alpha =
            p.alpha * twinkle * breathGlobal * toneScale * depthMul
          const { glow, core } = colorsForGalaxy(p.layer, p.hue, alpha)
          const gs = glowScaleForLayer(p.layer) * glowBreath
          const glowSize = p.size * gs * (layer === 'core' ? 1.03 : 1)

          context.fillStyle = glow
          context.beginPath()
          context.arc(p.x, p.y, glowSize, 0, Math.PI * 2)
          context.fill()

          context.fillStyle = core
          context.beginPath()
          context.arc(p.x, p.y, p.size, 0, Math.PI * 2)
          context.fill()

          if (layer === 'core') {
            const glint = 0.3 + 0.22 * Math.sin(ts * 0.00013 + p.phase)
            const glintA = alpha * 0.2 * glint
            context.fillStyle = `rgba(240, 248, 255, ${glintA})`
            context.beginPath()
            context.arc(p.x, p.y, p.size * 0.38, 0, Math.PI * 2)
            context.fill()
          }
        }
      }

      const coreShimmer =
        0.045 +
        0.02 * Math.sin(ts * 0.000082) +
        0.014 * Math.sin(ts * 0.00014 + 0.6)
      context.save()
      const sg = context.createRadialGradient(cx, cy, 0, cx, cy, 72)
      sg.addColorStop(0, `rgba(220, 235, 255, ${coreShimmer * 0.16})`)
      sg.addColorStop(0.22, `rgba(180, 205, 245, ${coreShimmer * 0.08})`)
      sg.addColorStop(0.5, `rgba(120, 150, 210, ${coreShimmer * 0.035})`)
      sg.addColorStop(1, 'rgba(0, 0, 0, 0)')
      context.fillStyle = sg
      context.beginPath()
      context.arc(cx, cy, 72, 0, Math.PI * 2)
      context.fill()
      context.restore()

      context.globalCompositeOperation = 'source-over'
      const voidGrad = context.createRadialGradient(
        cx,
        cy,
        0,
        cx,
        cy,
        viewport.scale * 0.078,
      )
      voidGrad.addColorStop(0, 'rgba(2, 4, 10, 0.55)')
      voidGrad.addColorStop(0.42, 'rgba(4, 8, 16, 0.09)')
      voidGrad.addColorStop(1, 'rgba(0, 0, 0, 0)')
      context.fillStyle = voidGrad
      context.beginPath()
      context.arc(cx, cy, viewport.scale * 0.082, 0, Math.PI * 2)
      context.fill()

      context.globalCompositeOperation = 'lighter'
      const rim = context.createRadialGradient(
        cx,
        cy,
        viewport.scale * 0.042,
        cx,
        cy,
        viewport.scale * 0.12,
      )
      rim.addColorStop(0, 'rgba(200, 225, 255, 0)')
      rim.addColorStop(0.52, 'rgba(170, 200, 245, 0.045)')
      rim.addColorStop(1, 'rgba(0, 0, 0, 0)')
      context.fillStyle = rim
      context.beginPath()
      context.arc(cx, cy, viewport.scale * 0.12, 0, Math.PI * 2)
      context.fill()

      const edgeR = Math.min(VIRTUAL_WIDTH, VIRTUAL_HEIGHT) * 0.64
      context.save()
      context.translate(cx, cy)
      context.scale(1.04, 0.88)
      context.globalCompositeOperation = 'destination-in'
      const edgeFade = context.createRadialGradient(0, 0, edgeR * 0.22, 0, 0, edgeR)
      edgeFade.addColorStop(0, 'rgba(0, 0, 0, 1)')
      edgeFade.addColorStop(0.5, 'rgba(0, 0, 0, 0.97)')
      edgeFade.addColorStop(0.72, 'rgba(0, 0, 0, 0.68)')
      edgeFade.addColorStop(1, 'rgba(0, 0, 0, 0)')
      context.fillStyle = edgeFade
      context.beginPath()
      context.arc(0, 0, edgeR, 0, Math.PI * 2)
      context.fill()
      context.restore()

      context.globalCompositeOperation = 'source-over'
      context.restore()

      if (!reduceMotion && shouldAnimRef.current) {
        rafRef.current = requestAnimationFrame(draw)
      }
    }

    rafRef.current = requestAnimationFrame(draw)
    return () => {
      disposeRun()
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
      className="galaxy-particle-canvas"
      aria-hidden
    />
  )
}
