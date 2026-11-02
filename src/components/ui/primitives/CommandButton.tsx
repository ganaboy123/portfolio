import type { ReactNode, CSSProperties, ButtonHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'
import { useAppStore } from '@/store/useAppStore'

export type CommandButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'
export type CommandButtonSize = 'sm' | 'md' | 'lg'

interface CommandButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
    children: ReactNode
    variant?: CommandButtonVariant
    size?: CommandButtonSize
    icon?: ReactNode         // leading icon/symbol
    trailing?: ReactNode     // trailing element (arrow, count)
    loading?: boolean
    className?: string
    style?: CSSProperties
}

const variantStyles: Record<CommandButtonVariant, CSSProperties> = {
    primary: {
        background: 'rgba(56,189,248,0.10)',
        border: '1px solid rgba(56,189,248,0.35)',
        color: 'var(--color-accent-cyan-bright)',
    },
    secondary: {
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid var(--color-border-default)',
        color: 'var(--color-text-secondary)',
    },
    ghost: {
        background: 'transparent',
        border: '1px solid transparent',
        color: 'var(--color-text-secondary)',
    },
    danger: {
        background: 'rgba(248,113,113,0.08)',
        border: '1px solid rgba(248,113,113,0.25)',
        color: '#f87171',
    },
}

const sizeStyles: Record<CommandButtonSize, CSSProperties> = {
    sm: { height: 28, padding: '0 10px', fontSize: '0.65rem', gap: 5, letterSpacing: '0.12em' },
    md: { height: 36, padding: '0 14px', fontSize: '0.70rem', gap: 7, letterSpacing: '0.12em' },
    lg: { height: 44, padding: '0 20px', fontSize: '0.75rem', gap: 9, letterSpacing: '0.10em' },
}

const hoverStyles: Record<CommandButtonVariant, CSSProperties> = {
    primary: { background: 'rgba(56,189,248,0.16)', borderColor: 'rgba(56,189,248,0.55)', boxShadow: 'var(--glow-cyan-sm)' },
    secondary: { background: 'rgba(255,255,255,0.07)', borderColor: 'var(--color-border-strong)' },
    ghost: { background: 'rgba(255,255,255,0.04)', borderColor: 'var(--color-border-default)' },
    danger: { background: 'rgba(248,113,113,0.14)', borderColor: 'rgba(248,113,113,0.40)' },
}

/**
 * Futuristic action button.
 * Uses monospace font, technical tracking, and HUD-style geometry.
 */
export function CommandButton({
    children,
    variant = 'secondary',
    size = 'md',
    icon,
    trailing,
    loading = false,
    className,
    style,
    disabled,
    ...rest
}: CommandButtonProps) {
    const setCursor = useAppStore((s) => s.setCursor)

    return (
        <button
            {...rest}
            disabled={disabled || loading}
            className={cn('command-btn', className)}
            onMouseEnter={() => setCursor('hover')}
            onMouseLeave={() => setCursor('default')}
            style={{
                position: 'relative',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: 'var(--font-mono)',
                fontWeight: 'var(--weight-medium)' as unknown as number,
                textTransform: 'uppercase',
                borderRadius: 'var(--radius-sm)',
                cursor: disabled || loading ? 'not-allowed' : 'pointer',
                opacity: disabled ? 0.45 : 1,
                transition: 'background 160ms, border-color 160ms, box-shadow 160ms, opacity 160ms',
                outline: 'none',
                userSelect: 'none',
                overflow: 'hidden',
                ...variantStyles[variant],
                ...sizeStyles[size],
                ...style,
            }}
            // CSS hover via style tag below is not possible, so we use inline events
            onMouseDown={(e) => {
                e.currentTarget.style.transform = 'scale(0.97)'
                rest.onMouseDown?.(e)
            }}
            onMouseUp={(e) => {
                e.currentTarget.style.transform = 'scale(1)'
                rest.onMouseUp?.(e)
            }}
        >
            {/* left accent line */}
            <span
                aria-hidden
                style={{
                    position: 'absolute',
                    left: 0, top: '20%', bottom: '20%',
                    width: 1,
                    background: 'currentColor',
                    opacity: 0.3,
                }}
            />

            {loading ? (
                <span
                    style={{
                        width: 10, height: 10,
                        border: '1px solid currentColor',
                        borderTopColor: 'transparent',
                        borderRadius: '50%',
                        animation: 'spin-slow 0.8s linear infinite',
                    }}
                    aria-label="Loading"
                />
            ) : (
                <>
                    {icon && <span aria-hidden style={{ display: 'flex', flexShrink: 0 }}>{icon}</span>}
                    <span>{children}</span>
                    {trailing && <span aria-hidden style={{ display: 'flex', flexShrink: 0, marginLeft: 'auto' }}>{trailing}</span>}
                </>
            )}
        </button>
    )
}

// Export hover styles so consuming code can apply on focus-visible
export { hoverStyles as commandButtonHoverStyles }
