import type { ReactNode, CSSProperties } from 'react'
import { cn } from '@/lib/utils'

export type GlassPanelVariant = 'default' | 'inset' | 'elevated' | 'modal'

interface GlassPanelProps {
    children: ReactNode
    variant?: GlassPanelVariant
    glow?: 'none' | 'cyan' | 'violet'
    scanlines?: boolean
    corners?: boolean
    className?: string
    style?: CSSProperties
    // Use string so we can pass any valid HTML tag without ElementType inference issues
    as?: string
    onClick?: () => void
    onMouseEnter?: () => void
    onMouseLeave?: () => void
}

const panelStyles: Record<GlassPanelVariant, CSSProperties> = {
    default: {
        background: 'var(--color-bg-surface)',
        border: '1px solid var(--color-glass-border)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
    },
    inset: {
        background: 'var(--color-bg-subtle)',
        border: '1px solid var(--color-border-subtle)',
        backdropFilter: 'blur(5px)',
        WebkitBackdropFilter: 'blur(5px)',
    },
    elevated: {
        background: 'var(--color-bg-elevated)',
        border: '1px solid var(--color-border-default)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        boxShadow: '0 14px 36px rgba(0,0,0,0.24)',
    },
    modal: {
        background: 'var(--color-bg-elevated)',
        border: '1px solid var(--color-border-strong)',
        backdropFilter: 'blur(14px)',
        WebkitBackdropFilter: 'blur(14px)',
        boxShadow: '0 24px 70px rgba(0,0,0,0.42)',
    },
}

const glowMap: Record<string, string> = {
    none: '',
    cyan: 'inset 2px 0 0 var(--color-accent-cyan)',
    violet: 'inset 2px 0 0 var(--color-accent-violet)',
}

function CornerBrackets() {
    const c = 'rgba(56,189,248,0.35)'
    const s = 14
    const t = 1
    return (
        <>
            <svg width={s} height={s} style={{ position: 'absolute', top: 0, left: 0 }} aria-hidden>
                <path d={`M0 ${s} L0 0 L${s} 0`} stroke={c} strokeWidth={t} fill="none" />
            </svg>
            <svg width={s} height={s} style={{ position: 'absolute', top: 0, right: 0 }} aria-hidden>
                <path d={`M0 0 L${s} 0 L${s} ${s}`} stroke={c} strokeWidth={t} fill="none" />
            </svg>
            <svg width={s} height={s} style={{ position: 'absolute', bottom: 0, left: 0 }} aria-hidden>
                <path d={`M0 0 L0 ${s} L${s} ${s}`} stroke={c} strokeWidth={t} fill="none" />
            </svg>
            <svg width={s} height={s} style={{ position: 'absolute', bottom: 0, right: 0 }} aria-hidden>
                <path d={`M${s} 0 L${s} ${s} L0 ${s}`} stroke={c} strokeWidth={t} fill="none" />
            </svg>
        </>
    )
}

/**
 * Glassmorphism surface with optional atmospheric glow and HUD corner brackets.
 * Used sparingly — panels, cards, modals.
 */
export function GlassPanel({
    children,
    variant = 'default',
    glow = 'none',
    scanlines = false,
    corners = false,
    className,
    style,
    as = 'div',
    onClick,
    onMouseEnter,
    onMouseLeave,
}: GlassPanelProps) {
    const base = panelStyles[variant]
    const glowShadow = glowMap[glow]

    // merge box-shadow from variant + glow
    const boxShadow = [base.boxShadow, glowShadow].filter(Boolean).join(', ') || undefined

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const Tag = as as any

    return (
        <Tag
            onClick={onClick}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
            className={cn(scanlines ? 'scanlines' : '', 'atmo-surface', 'surface-hover', className)}
            style={{
                position: 'relative',
                borderRadius: 'var(--radius-md)',
                overflow: 'hidden',
                ...base,
                ...(boxShadow ? { boxShadow } : {}),
                ...style,
            }}
        >
            {corners && <CornerBrackets />}
            {children}
        </Tag>
    )
}
