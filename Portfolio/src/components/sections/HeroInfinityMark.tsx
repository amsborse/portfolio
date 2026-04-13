import { useId } from 'react'
import * as m from 'motion/react-m'
import { useReducedMotion } from 'motion/react'
import { buildInfinityPathD } from '../../lib/infinityCurve'

const VB = 400
const CX = 200
const CY = 200
const SCALE = 128

export function HeroInfinityMark() {
  const rid = useId().replace(/:/g, '')
  const reduce = useReducedMotion()
  const pathD = buildInfinityPathD(CX, CY, SCALE, 112)

  const gradId = `${rid}-line`
  const blurId = `${rid}-blur`
  const nexusId = `${rid}-nexus`
  const veilId = `${rid}-veil`

  return (
    <svg
      className="hero-infinity__svg"
      viewBox={`0 0 ${VB} ${VB}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <defs>
        <linearGradient
          id={gradId}
          x1="48"
          y1="200"
          x2="352"
          y2="200"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="rgba(139, 92, 246, 0.88)" />
          <stop offset="0.38" stopColor="rgba(34, 211, 238, 0.45)" />
          <stop offset="0.5" stopColor="rgba(224, 242, 254, 0.95)" />
          <stop offset="0.62" stopColor="rgba(34, 211, 238, 0.42)" />
          <stop offset="1" stopColor="rgba(245, 158, 11, 0.82)" />
        </linearGradient>
        <radialGradient id={nexusId} cx="200" cy="200" r="18" gradientUnits="userSpaceOnUse">
          <stop stopColor="rgba(255, 255, 255, 0.55)" />
          <stop offset="0.55" stopColor="rgba(34, 211, 238, 0.25)" />
          <stop offset="1" stopColor="rgba(124, 58, 237, 0)" />
        </radialGradient>
        <radialGradient id={veilId} cx="200" cy="200" r="160" gradientUnits="userSpaceOnUse">
          <stop stopColor="rgba(124, 58, 237, 0.12)" />
          <stop offset="0.45" stopColor="rgba(34, 211, 238, 0.06)" />
          <stop offset="1" stopColor="rgba(5, 6, 10, 0)" />
        </radialGradient>
        <filter id={blurId} x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="3.2" result="b" />
          <feGaussianBlur in="b" stdDeviation="2.4" result="b2" />
          <feMerge>
            <feMergeNode in="b2" />
          </feMerge>
        </filter>
      </defs>

      <ellipse
        cx={CX}
        cy={CY}
        rx="168"
        ry="118"
        fill={`url(#${veilId})`}
        opacity={0.9}
      />

      <g filter={`url(#${blurId})`} opacity={0.55}>
        <path
          d={pathD}
          stroke="rgba(167, 139, 250, 0.45)"
          strokeWidth="10"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d={pathD}
          stroke="rgba(253, 186, 116, 0.35)"
          strokeWidth="7"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity={0.85}
        />
      </g>

      <path
        d={pathD}
        className="hero-infinity__stroke hero-infinity__stroke--mid"
        stroke={`url(#${gradId})`}
        strokeWidth="3.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={0.72}
      />

      <path
        d={pathD}
        className="hero-infinity__stroke hero-infinity__stroke--core"
        stroke={`url(#${gradId})`}
        strokeWidth="1.35"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {!reduce && (
        <m.circle
          cx={CX}
          cy={CY}
          r={9}
          fill={`url(#${nexusId})`}
          style={{ mixBlendMode: 'screen' }}
          animate={{
            r: [8.2, 11.2, 8.2],
            opacity: [0.38, 0.58, 0.38],
          }}
          transition={{
            duration: 6.8,
            repeat: Infinity,
            ease: [0.45, 0, 0.55, 1],
          }}
        />
      )}
      {reduce && (
        <circle
          cx={CX}
          cy={CY}
          r={9}
          fill={`url(#${nexusId})`}
          style={{ mixBlendMode: 'screen' }}
          opacity={0.48}
        />
      )}
    </svg>
  )
}
