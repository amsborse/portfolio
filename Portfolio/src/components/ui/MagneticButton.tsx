import { useRef, useState } from 'react'
import { useReducedMotion } from 'motion/react'

type MagneticButtonProps = React.ComponentPropsWithoutRef<'a'>

export function MagneticButton({
  className,
  children,
  onMouseMove,
  onMouseLeave,
  ...rest
}: MagneticButtonProps) {
  const ref = useRef<HTMLAnchorElement>(null)
  const reduce = useReducedMotion()
  const [shift, setShift] = useState({ x: 0, y: 0 })
  const [hover, setHover] = useState(false)

  function handleMove(e: React.MouseEvent<HTMLAnchorElement>) {
    onMouseMove?.(e)
    if (!ref.current) return
    const rect = ref.current.getBoundingClientRect()
    ref.current.style.setProperty('--mx', `${((e.clientX - rect.left) / rect.width) * 100}%`)
    ref.current.style.setProperty('--my', `${((e.clientY - rect.top) / rect.height) * 100}%`)
    if (reduce) return
    const cx = rect.left + rect.width / 2
    const cy = rect.top + rect.height / 2
    setShift({
      x: (e.clientX - cx) * 0.1,
      y: (e.clientY - cy) * 0.1,
    })
  }

  function handleLeave(e: React.MouseEvent<HTMLAnchorElement>) {
    onMouseLeave?.(e)
    if (ref.current) {
      ref.current.style.setProperty('--mx', '50%')
      ref.current.style.setProperty('--my', '50%')
    }
    setShift({ x: 0, y: 0 })
    setHover(false)
  }

  return (
    <a
      ref={ref}
      className={className}
      onMouseMove={handleMove}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={handleLeave}
      data-hover={hover ? 'true' : undefined}
      style={{
        transform: reduce ? undefined : `translate(${shift.x}px, ${shift.y}px)`,
      }}
      {...rest}
    >
      {children}
    </a>
  )
}
