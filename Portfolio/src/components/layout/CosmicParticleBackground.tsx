import { useEffect, useRef } from 'react'
import { useReducedMotion } from 'motion/react'

type Pointer = { x: number; y: number } | null

type CosmicParticle = {
  baseX: number
  baseY: number
  x: number
  y: number
  vx: number
  vy: number
  size: number
  alpha: number
  depth: number
  phase: number
  hue: 'white' | 'violet' | 'blue' | 'amber'
  layer: 'micro' | 'mid' | 'hero' | 'dust'
}

const REPEL_RADIUS = 128
const REPEL_FORCE = 0.32
const SPRING = 0.02
const DAMP = 0.92
const INTEGRATE = 0.66

function gaussian() {
  let u = 0
  let v = 0
  while (u === 0) u = Math.random()
  while (v === 0) v = Math.random()
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v)
}

function clamp(min: number, value: number, max: number) {
  return Math.max(min, Math.min(max, value))
}

function colorForParticle(p: CosmicParticle, alpha: number) {
  if (p.hue === 'violet') return `rgba(210, 150, 255, ${alpha})`
  if (p.hue === 'blue') return `rgba(170, 210, 255, ${alpha})`
  if (p.hue === 'amber') return `rgba(255, 170, 96, ${alpha})`
  return `rgba(248, 250, 255, ${alpha})`
}

function countsForViewport(width: number, height: number) {
  const area = Math.max(1, width * height)
  return {
    micro: clamp(120, Math.floor(area / 14000), 420),
    mid: clamp(46, Math.floor(area / 36000), 170),
    hero: clamp(10, Math.floor(area / 120000), 40),
    dust: clamp(34, Math.floor(area / 42000), 120),
  }
}

function makeParticle(
  layer: CosmicParticle['layer'],
  width: number,
  height: number,
): CosmicParticle {
  const x = Math.random() * width
  const ySpread = layer === 'dust' ? 0.1 : 0.14
  const bandY = height * 0.16 + (x / Math.max(1, width)) * height * 0.58
  const inBand = Math.random() < (layer === 'micro' ? 0.44 : 0.62)
  const y = inBand ? bandY + gaussian() * (height * ySpread) : Math.random() * height

  const focusX = width * 0.72
  const focusY = height * 0.46
  const fx = x - focusX
  const fy = y - focusY
  const focusNorm = Math.sqrt(fx * fx + fy * fy) / (Math.min(width, height) * 0.4)
  const focusFalloff = Math.max(0, 1 - focusNorm)
  const pull = focusFalloff * (layer === 'micro' ? 0.08 : 0.14)

  const rx = x + (focusX - x) * pull
  const ry = y + (focusY - y) * pull
  const hueRoll = Math.random()
  const hue: CosmicParticle['hue'] =
    hueRoll < 0.6 ? 'white' : hueRoll < 0.78 ? 'blue' : hueRoll < 0.92 ? 'violet' : 'amber'

  const depthBase =
    layer === 'hero' ? 1.2 : layer === 'mid' ? 0.92 : layer === 'dust' ? 0.72 : 0.52
  const depth = depthBase + Math.random() * 0.75

  const size =
    layer === 'hero'
      ? 1.3 + Math.random() * 1.8
      : layer === 'mid'
        ? 0.7 + Math.random() * 1.2
        : layer === 'dust'
          ? 0.9 + Math.random() * 1.7
          : 0.35 + Math.random() * 0.6

  const alpha =
    layer === 'hero'
      ? 0.17 + Math.random() * 0.18
      : layer === 'mid'
        ? 0.08 + Math.random() * 0.13
        : layer === 'dust'
          ? 0.028 + Math.random() * 0.05
          : 0.02 + Math.random() * 0.04

  return {
    baseX: rx,
    baseY: clamp(-height * 0.2, ry, height * 1.2),
    x: rx,
    y: ry,
    vx: 0,
    vy: 0,
    size,
    alpha,
    depth,
    phase: Math.random() * Math.PI * 2,
    hue,
    layer,
  }
}

function createCosmicParticles(width: number, height: number): CosmicParticle[] {
  const counts = countsForViewport(width, height)
  const particles: CosmicParticle[] = []

  for (let i = 0; i < counts.micro; i++) particles.push(makeParticle('micro', width, height))
  for (let i = 0; i < counts.mid; i++) particles.push(makeParticle('mid', width, height))
  for (let i = 0; i < counts.hero; i++) particles.push(makeParticle('hero', width, height))
  for (let i = 0; i < counts.dust; i++) particles.push(makeParticle('dust', width, height))

  return particles
}

export function CosmicParticleBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const particlesRef = useRef<CosmicParticle[]>([])
  const pointerRef = useRef<Pointer>(null)
  const scrollRef = useRef(0)
  const rafRef = useRef(0)
  const lastRef = useRef(0)
  const reduce = useReducedMotion()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d', { alpha: true })
    if (!ctx) return
    const surface: HTMLCanvasElement = canvas
    const context: CanvasRenderingContext2D = ctx

    const dpr = Math.min(window.devicePixelRatio || 1, 2)

    function resize() {
      const parent = surface.parentElement
      if (!parent) return
      const width = parent.clientWidth
      const height = parent.clientHeight
      surface.width = Math.floor(width * dpr)
      surface.height = Math.floor(height * dpr)
      surface.style.width = `${width}px`
      surface.style.height = `${height}px`
      context.setTransform(dpr, 0, 0, dpr, 0, 0)
      particlesRef.current = createCosmicParticles(width, height)
    }

    function onMove(e: MouseEvent) {
      pointerRef.current = { x: e.clientX, y: e.clientY }
    }

    function onLeave() {
      pointerRef.current = null
    }

    function onScroll() {
      scrollRef.current = window.scrollY || 0
    }

    const parent = surface.parentElement
    if (!parent) return

    let ro: ResizeObserver | null = null
    if (typeof ResizeObserver !== 'undefined') {
      ro = new ResizeObserver(resize)
      ro.observe(parent)
    } else {
      window.addEventListener('resize', resize)
    }

    window.addEventListener('mousemove', onMove, { passive: true })
    window.addEventListener('mouseleave', onLeave)
    window.addEventListener('scroll', onScroll, { passive: true })
    resize()
    onScroll()
    lastRef.current = 0

    function draw(ts: number) {
      const last = lastRef.current || ts
      const dt = Math.min(36, ts - last) / 16.67
      lastRef.current = ts

      const w = surface.clientWidth
      const h = surface.clientHeight
      if (!w || !h) {
        rafRef.current = requestAnimationFrame(draw)
        return
      }

      const list = particlesRef.current
      const pointer = pointerRef.current
      const pointerActive = pointer && !reduce
      const repel2 = REPEL_RADIUS * REPEL_RADIUS
      const px = pointer?.x ?? 0
      const py = pointer?.y ?? 0
      const parallaxX = pointerActive ? ((px - w * 0.5) / w) * 7.4 : 0
      const parallaxY = pointerActive ? ((py - h * 0.5) / h) * 5.8 : 0
      const scrollY = reduce ? 0 : Math.min(1800, scrollRef.current)

      context.clearRect(0, 0, w, h)

      const band = context.createLinearGradient(0, h * 0.06, w, h * 0.88)
      band.addColorStop(0, 'rgba(80, 116, 245, 0)')
      band.addColorStop(0.31, 'rgba(132, 116, 242, 0.026)')
      band.addColorStop(0.55, 'rgba(255, 178, 110, 0.016)')
      band.addColorStop(1, 'rgba(50, 62, 100, 0)')
      context.fillStyle = band
      context.fillRect(0, 0, w, h)

      for (const p of list) {
        const driftX = Math.sin(ts * 0.00008 * p.depth + p.phase) * 1.8 * p.depth
        const driftY = Math.cos(ts * 0.00006 * p.depth + p.phase * 1.3) * 1.25 * p.depth
        const scrollFactor =
          p.layer === 'hero'
            ? 0.022
            : p.layer === 'mid'
              ? 0.018
              : p.layer === 'dust'
                ? 0.014
                : 0.01
        const scrollDrift = scrollY * scrollFactor
        const targetX = p.baseX + driftX + parallaxX * p.depth * 0.22
        const targetY = p.baseY + driftY + parallaxY * p.depth * 0.22 + scrollDrift

        let fx = (targetX - p.x) * SPRING
        let fy = (targetY - p.y) * SPRING

        if (pointerActive) {
          const dx = p.x - px
          const dy = p.y - py
          const d2 = dx * dx + dy * dy
          if (d2 < repel2 && d2 > 0.2) {
            const d = Math.sqrt(d2)
            const nx = dx / d
            const ny = dy / d
            const falloff = (1 - d / REPEL_RADIUS) ** 2
            const layerForce =
              p.layer === 'hero' ? 0.82 : p.layer === 'mid' ? 0.68 : p.layer === 'dust' ? 0.54 : 0.4
            const force = falloff * REPEL_FORCE * layerForce
            fx += nx * force
            fy += ny * force
          }
        }

        p.vx = (p.vx + fx * dt) * DAMP
        p.vy = (p.vy + fy * dt) * DAMP
        p.x += p.vx * dt * INTEGRATE
        p.y += p.vy * dt * INTEGRATE

        const twinkleStrength = p.layer === 'hero' ? 0.2 : p.layer === 'mid' ? 0.12 : 0.08
        const twinkle = 1 - twinkleStrength + twinkleStrength * Math.sin(ts * 0.00015 + p.phase)
        const alpha = p.alpha * twinkle

        if (p.layer === 'dust') {
          const g = context.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 3.8)
          g.addColorStop(0, colorForParticle(p, alpha * 0.34))
          g.addColorStop(1, colorForParticle(p, 0))
          context.fillStyle = g
          context.beginPath()
          context.arc(p.x, p.y, p.size * 2.8, 0, Math.PI * 2)
          context.fill()
        } else if (p.layer === 'hero') {
          const glow = context.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 4.4)
          glow.addColorStop(0, colorForParticle(p, alpha * 0.34))
          glow.addColorStop(1, colorForParticle(p, 0))
          context.fillStyle = glow
          context.beginPath()
          context.arc(p.x, p.y, p.size * 3.6, 0, Math.PI * 2)
          context.fill()

          context.fillStyle = colorForParticle(p, alpha)
          context.beginPath()
          context.arc(p.x, p.y, p.size, 0, Math.PI * 2)
          context.fill()
        } else {
          context.fillStyle = colorForParticle(p, alpha)
          context.beginPath()
          context.arc(p.x, p.y, p.size, 0, Math.PI * 2)
          context.fill()
        }
      }

      if (!reduce) {
        rafRef.current = requestAnimationFrame(draw)
      }
    }

    rafRef.current = requestAnimationFrame(draw)

    return () => {
      cancelAnimationFrame(rafRef.current)
      if (ro) ro.disconnect()
      else window.removeEventListener('resize', resize)
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseleave', onLeave)
      window.removeEventListener('scroll', onScroll)
    }
  }, [reduce])

  return <canvas ref={canvasRef} className="immersive-bg__particle-canvas" aria-hidden />
}
