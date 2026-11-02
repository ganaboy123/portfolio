import type { CSSProperties } from 'react'
import { cn } from '@/lib/utils'

interface OrbitalIndicatorProps {
    /** 0–1 fill progress for the orbital arc */
    progress?: number
    size?: 'sm' | 'md' | 'lg'
    color?: 'cyan' | 'violet'
    spin?: boolean
    label?: string
    sublabel?: string
    className?: string
    style?: CSSProperties
}

const sizeMap = {
    sm: { outer: 48, ring1: 44, ring2: 36, dot: 4, font: '0.58rem', labelFont: '0.62rem' },
    md: { outer: 80, ring1: 74, ring2: 60, dot: 5, font: '0.65rem', labelFont: '0.72rem' },
    lg: { outer: 120, ring1: 112, ring2: 92, dot: 7, font: '0.72rem', labelFont: '0.85rem' },
}

const colorMap = {
    cyan: { primary: 'rgba(56,189,248,0.55)', secondary: 'rgba(56,189,248,0.18)', dot: '#38bdf8', text: 'var(--color-accent-cyan-bright)' },
    violet: { primary: 'rgba(167,139,250,0.50)', secondary: 'rgba(167,139,250,0.15)', dot: '#a78bfa', text: 'var(--color-accent-violet-bright)' },
}

/** SVG arc path for progress ring */
function describeArc(cx: number, cy: number, r: number, startAngle: number, endAngle: number) {
    const start = polarToCartesian(cx, cy, r, endAngle)
    const end = polarToCartesian(cx, cy, r, startAngle)
    const large = endAngle - startAngle > 180 ? 1 : 0
    return `M ${start.x} ${start.y} A ${r} ${r} 0 ${large} 0 ${end.x} ${end.y}`
}

function polarToCartesian(cx: number, cy: number, r: number, angle: number) {
    const rad = ((angle - 90) * Math.PI) / 180
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) }
}

/**
 * Concentric orbital rings with optional progress arc.
 * Decorative system clock / section progress indicator.
 */
export function OrbitalIndicator({
    progress = 0,
    size = 'md',
    color = 'cyan',
    spin = false,
    label,
    sublabel,
    className,
    style,
}: OrbitalIndicatorProps) {
    const s = sizeMap[size]
    const c = colorMap[color]
    const cx = s.outer / 2
    const cy = s.outer / 2

    const r1 = s.ring1 / 2
    const r2 = s.ring2 / 2

    const arcAngle = Math.min(progress, 0.9999) * 359.9
    const arcPath = arcAngle > 0 ? describeArc(cx, cy, r1, 0, arcAngle) : ''

    // dot position on outer ring at progress
    const dotAngle = progress * 360
    const dotPos = polarToCartesian(cx, cy, r1, dotAngle)

    return (
        <div
            className={cn(className)}
            style={{
                position: 'relative',
                width: s.outer,
                height: s.outer,
                flexShrink: 0,
                ...style,
            }}
        >
            {/* SVG rings */}
            <svg
                width={s.outer}
                height={s.outer}
                style={{
                    position: 'absolute', inset: 0,
                    animation: spin ? 'orbital-spin 12s linear infinite' : undefined,
                }}
                aria-hidden
            >
                {/* outer ring dashes */}
                <circle
                    cx={cx} cy={cy} r={r1}
                    fill="none"
                    stroke={c.secondary}
                    strokeWidth={0.75}
                    strokeDasharray="3 6"
                />
                {/* progress arc */}
                {arcPath && (
                    <path
                        d={arcPath}
                        fill="none"
                        stroke={c.primary}
                        strokeWidth={1}
                        strokeLinecap="round"
                    />
                )}
                {/* progress dot */}
                {progress > 0 && (
                    <circle cx={dotPos.x} cy={dotPos.y} r={s.dot / 2} fill={c.dot}
                        style={{ filter: `drop-shadow(0 0 3px ${c.dot})` }} />
                )}
            </svg>

            {/* inner ring */}
            <svg
                width={s.outer}
                height={s.outer}
                style={{
                    position: 'absolute', inset: 0,
                    animation: spin ? 'orbital-spin-reverse 8s linear infinite' : undefined,
                }}
                aria-hidden
            >
                <circle
                    cx={cx} cy={cy} r={r2}
                    fill="none"
                    stroke={c.secondary}
                    strokeWidth={0.5}
                    strokeDasharray="1 8"
                />
                {/* 4 tick marks */}
                {[0, 90, 180, 270].map((a) => {
                    const inner = polarToCartesian(cx, cy, r2 - 4, a)
                    const outer = polarToCartesian(cx, cy, r2 + 4, a)
                    return (
                        <line key={a}
                            x1={inner.x} y1={inner.y} x2={outer.x} y2={outer.y}
                            stroke={c.secondary} strokeWidth={0.75} />
                    )
                })}
            </svg>

            {/* center label */}
            {(label || sublabel) && (
                <div
                    style={{
                        position: 'absolute', inset: 0,
                        display: 'flex', flexDirection: 'column',
                        alignItems: 'center', justifyContent: 'center',
                        gap: 2,
                    }}
                >
                    {label && (
                        <span style={{
                            fontFamily: 'var(--font-mono)',
                            fontSize: s.labelFont,
                            letterSpacing: '0.08em',
                            color: c.text,
                            lineHeight: 1,
                        }}>
                            {label}
                        </span>
                    )}
                    {sublabel && (
                        <span style={{
                            fontFamily: 'var(--font-mono)',
                            fontSize: s.font,
                            letterSpacing: '0.10em',
                            color: 'var(--color-text-tertiary)',
                            lineHeight: 1,
                            textTransform: 'uppercase',
                        }}>
                            {sublabel}
                        </span>
                    )}
                </div>
            )}
        </div>
    )
}
