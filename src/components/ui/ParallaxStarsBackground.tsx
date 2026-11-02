import { useMemo } from 'react'

interface ParallaxStarsBackgroundProps {
  reducedMotion?: boolean
}

function createStarMap(count: number, seed: number) {
  let value = seed
  const next = () => {
    value = (value * 1664525 + 1013904223) >>> 0
    return value / 4294967296
  }

  return Array.from({ length: count }, () => {
    const x = Math.floor(next() * 2200)
    const y = Math.floor(next() * 2200)
    const alpha = (0.34 + next() * 0.6).toFixed(2)
    return `${x}px ${y}px rgba(216, 239, 255, ${alpha})`
  }).join(',')
}

/** Lightweight site-wide star field that replaces the WebGL environment. */
export function ParallaxStarsBackground({ reducedMotion = false }: ParallaxStarsBackgroundProps) {
  const stars = useMemo(() => ({
    far: createStarMap(180, 71),
    mid: createStarMap(80, 191),
    near: createStarMap(28, 401),
  }), [])

  return (
    <div
      className={`parallax-stars${reducedMotion ? ' parallax-stars--static' : ''}`}
      aria-hidden="true"
    >
      <div className="parallax-stars__atmosphere" />
      <div className="parallax-stars__layer parallax-stars__layer--far" style={{ boxShadow: stars.far }} />
      <div className="parallax-stars__layer parallax-stars__layer--mid" style={{ boxShadow: stars.mid }} />
      <div className="parallax-stars__layer parallax-stars__layer--near" style={{ boxShadow: stars.near }} />
    </div>
  )
}
