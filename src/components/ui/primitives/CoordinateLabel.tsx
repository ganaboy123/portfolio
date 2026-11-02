import type { CSSProperties } from 'react'
import { cn } from '@/lib/utils'

interface CoordinateLabelProps {
    x?: number | string
    y?: number | string
    z?: number | string
    label?: string          // custom display string instead of x/y/z
    variant?: 'default' | 'cyan' | 'dim'
    className?: string
    style?: CSSProperties
}

const variantColor = {
    default: 'var(--color-text-tertiary)',
    cyan: 'var(--color-accent-cyan)',
    dim: 'rgba(74,83,112,0.55)',
}

function AxisValue({ axis, value, color }: { axis: string; value: number | string; color: string }) {
    return (
        <span style={{ display: 'inline-flex', alignItems: 'baseline', gap: '2px' }}>
            <span style={{ color: 'rgba(255,255,255,0.20)', fontSize: '0.85em' }}>{axis}</span>
            <span style={{ color }}>{typeof value === 'number' ? value.toFixed(2) : value}</span>
        </span>
    )
}

/**
 * Coordinate / position readout in spacecraft HUD style.
 * Renders X Y Z values or a custom label string.
 */
export function CoordinateLabel({
    x,
    y,
    z,
    label,
    variant = 'default',
    className,
    style,
}: CoordinateLabelProps) {
    const color = variantColor[variant]

    return (
        <div
            className={cn(className)}
            style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.63rem',
                letterSpacing: '0.12em',
                lineHeight: 1,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                ...style,
            }}
        >
            {label ? (
                <span style={{ color }}>{label}</span>
            ) : (
                <>
                    {x !== undefined && <AxisValue axis="X" value={x} color={color} />}
                    {y !== undefined && <AxisValue axis="Y" value={y} color={color} />}
                    {z !== undefined && <AxisValue axis="Z" value={z} color={color} />}
                </>
            )}
        </div>
    )
}
