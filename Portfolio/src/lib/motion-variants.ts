import type { Variants } from 'motion/react'

export function getHeroStagger(reduce: boolean): Variants {
  return {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: reduce ? 0 : 0.07,
        delayChildren: reduce ? 0 : 0.08,
      },
    },
  }
}

export const heroItem: Variants = {
  hidden: { opacity: 0, y: 22 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  },
}
