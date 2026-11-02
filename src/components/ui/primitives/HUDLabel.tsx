import type { ReactNode, CSSProperties } from 'react'
import { cn } from '@/lib/utils'

export type HUDLabelVariant = 'default' | 'cyan' | 'violet' | 'dim' | 'active'

interface HUDLabelProps {
    children: ReactNode
    variant?: HUDLabelVariant
    prefix?: string           // e.g. "◈" or "›"
    className?: string
    style?: CSSProperties
    as?: 'span' | 'div' | 'label' | 'p'
}

const variantColors: Record<HUDLabelVariant, string> = {
    default: 'var(--color-text-tertiary)',
    cyan: 'var(--color-accent-cyan)',
    violet: 'var(--color-accent-violet)',
    dim: 'rgba(74, 83, 112, 0.6)',
    active: 'var(--color-accent-cyan-bright)',
}

/**
 * Tiny uppercase monospace label — the atomic HUD text unit.
 * Used for coordinates, system labels, metadata, section markers.
 */
export function HUDLabel({
    children,
    variant = 'default',
    prefix,
    className,
    style,
    as: Tag = 'span',
}: HUDLabelProps) {
    return (
        <Tag
            className={cn('meta-label', className)}
            style={{
                color: variantColors[variant],
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4em',
                ...style,
            }}
        >
            {prefix && (
                <span style={{ opacity: 0.6, fontSize: '0.85em' }}>{prefix}</span>
            )}
            {children}
        </Tag>
    )
}
