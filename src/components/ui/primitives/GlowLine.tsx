import type { CSSProperties } from 'react'
import { cn } from '@/lib/utils'

interface GlowLineProps {
    direction?: 'horizontal' | 'vertical'
    color?: 'cyan' | 'violet' | 'white' | 'dim'
    intensity?: 'subtle' | 'normal' | 'strong'
    animated?: boolean       // traveling light sweep
    length?: string          // CSS width/height value, default 100%
    className?: string
    style?: CSSProperties
}

const colorMap = {
    cyan: { line: 'rgba(56,189,248,0.25)', glow: 'rgba(56,189,248,0.18)', sweep: 'rgba(56,189,248,0.7)' },
    violet: { line: 'rgba(167,139,250,0.22)', glow: 'rgba(167,139,250,0.15)', sweep: 'rgba(167,139,250,0.7)' },
    white: { line: 'rgba(255,255,255,0.10)', glow: 'rgba(255,255,255,0.06)', sweep: 'rgba(255,255,255,0.6)' },
    dim: { line: 'rgba(255,255,255,0.05)', glow: 'transparent', sweep: 'rgba(255,255,255,0.3)' },
}

const intensityThickness = { subtle: 1, normal: 1, strong: 1 }
const intensityOpacity = { subtle: 0.5, normal: 1, strong: 1.4 }

/**
 * A single-pixel separator line with an optional glow shadow and
 * animated traveling highlight — the vocabulary of spacecraft displays.
 */
export function GlowLine({
    direction = 'horizontal',
    color = 'cyan',
    intensity = 'normal',
    animated = false,
    length = '100%',
    className,
    style,
}: GlowLineProps) {
    const c = colorMap[color]
    const opMult = intensityOpacity[intensity]
    const isH = direction === 'horizontal'

    const base: CSSProperties = isH
        ? { width: length, height: intensityThickness[intensity] }
        : { height: length, width: intensityThickness[intensity] }

    return (
        <div
            className={cn(className)}
            role="separator"
            aria-hidden
            style={{
                position: 'relative',
                flexShrink: 0,
                background: c.line,
                boxShadow: 'none',
                opacity: opMult > 1 ? 1 : opMult,
                overflow: 'hidden',
                ...base,
                ...style,
            }}
        >
            {/* traveling sweep highlight */}
            {animated && (
                <div
                    style={{
                        position: 'absolute',
                        top: 0,
                        width: isH ? '30%' : '100%',
                        height: isH ? '100%' : '30%',
                        background: isH
                            ? `linear-gradient(90deg, transparent, ${c.sweep}, transparent)`
                            : `linear-gradient(180deg, transparent, ${c.sweep}, transparent)`,
                        animation: isH ? 'glow-travel 5s linear infinite' : 'none',
                        opacity: 0.32,
                    }}
                />
            )}
        </div>
    )
}
