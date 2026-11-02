import type { ReactNode, CSSProperties } from 'react'
import { cn } from '@/lib/utils'

export type TechBadgeVariant = 'default' | 'cyan' | 'violet' | 'ghost' | 'active'

interface TechBadgeProps {
    children: ReactNode
    variant?: TechBadgeVariant
    dot?: boolean             // show status dot
    className?: string
    style?: CSSProperties
    onClick?: () => void
}

const variants: Record<TechBadgeVariant, CSSProperties> = {
    default: {
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.08)',
        color: 'var(--color-text-secondary)',
    },
    cyan: {
        background: 'rgba(56,189,248,0.08)',
        border: '1px solid rgba(56,189,248,0.22)',
        color: 'var(--color-accent-cyan-bright)',
    },
    violet: {
        background: 'rgba(167,139,250,0.08)',
        border: '1px solid rgba(167,139,250,0.20)',
        color: 'var(--color-accent-violet-bright)',
    },
    ghost: {
        background: 'transparent',
        border: '1px solid var(--color-border-subtle)',
        color: 'var(--color-text-tertiary)',
    },
    active: {
        background: 'rgba(56,189,248,0.14)',
        border: '1px solid rgba(56,189,248,0.40)',
        color: 'var(--color-accent-cyan-bright)',
        boxShadow: '0 0 10px rgba(56,189,248,0.15)',
    },
}

/**
 * Compact pill tag for technologies, skills, or status flags.
 */
export function TechBadge({
    children,
    variant = 'default',
    dot = false,
    className,
    style,
    onClick,
}: TechBadgeProps) {
    return (
        <span
            role={onClick ? 'button' : undefined}
            tabIndex={onClick ? 0 : undefined}
            onClick={onClick}
            onKeyDown={onClick ? (e) => e.key === 'Enter' && onClick() : undefined}
            className={cn(className)}
            style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                height: 'var(--tech-badge-height)',
                padding: '0 8px',
                borderRadius: 'var(--radius-sm)',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.65rem',
                letterSpacing: '0.10em',
                textTransform: 'uppercase',
                lineHeight: 1,
                cursor: onClick ? 'pointer' : 'default',
                transition: 'border-color 200ms, background 200ms, box-shadow 200ms',
                whiteSpace: 'nowrap',
                userSelect: 'none',
                ...variants[variant],
                ...style,
            }}
        >
            {dot && (
                <span
                    style={{
                        width: 4,
                        height: 4,
                        borderRadius: '50%',
                        background: 'currentColor',
                        opacity: 0.7,
                        flexShrink: 0,
                    }}
                />
            )}
            {children}
        </span>
    )
}
