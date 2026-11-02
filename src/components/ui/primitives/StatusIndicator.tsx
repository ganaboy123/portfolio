import type { CSSProperties } from 'react'
import { cn } from '@/lib/utils'

export type StatusState = 'online' | 'standby' | 'offline' | 'processing' | 'alert'

interface StatusIndicatorProps {
    status: StatusState
    label?: string
    showPing?: boolean       // animated ping ring on online/processing
    size?: 'sm' | 'md'
    className?: string
    style?: CSSProperties
}

const statusConfig: Record<StatusState, { color: string; label: string }> = {
    online: { color: '#38bdf8', label: 'ONLINE' },
    standby: { color: '#a78bfa', label: 'STANDBY' },
    offline: { color: '#4a5370', label: 'OFFLINE' },
    processing: { color: '#fbbf24', label: 'PROCESSING' },
    alert: { color: '#f87171', label: 'ALERT' },
}

const sizeDot = { sm: 6, md: 8 }

/**
 * Dot + label system status indicator.
 * Used in system status bars, navigation, and HUD overlays.
 */
export function StatusIndicator({
    status,
    label,
    showPing = false,
    size = 'sm',
    className,
    style,
}: StatusIndicatorProps) {
    const cfg = statusConfig[status]
    const dotSize = sizeDot[size]
    const shouldPing = showPing && (status === 'online' || status === 'processing')

    return (
        <div
            className={cn(className)}
            style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                ...style,
            }}
        >
            {/* dot container */}
            <div style={{ position: 'relative', width: dotSize, height: dotSize, flexShrink: 0 }}>
                {/* ping ring */}
                {shouldPing && (
                    <span
                        aria-hidden
                        style={{
                            position: 'absolute',
                            inset: -2,
                            borderRadius: '50%',
                            border: `1px solid ${cfg.color}`,
                            animation: 'ping-out 1.8s ease-out infinite',
                            opacity: 0,
                        }}
                    />
                )}
                {/* core dot */}
                <span
                    aria-label={`Status: ${cfg.label}`}
                    style={{
                        display: 'block',
                        width: '100%',
                        height: '100%',
                        borderRadius: '50%',
                        background: cfg.color,
                        boxShadow: `0 0 ${dotSize}px ${cfg.color}`,
                        animation: status === 'processing' ? 'pulse 1.4s ease-in-out infinite' : undefined,
                    }}
                />
            </div>

            {/* label */}
            {(label || true) && (
                <span
                    style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.60rem',
                        letterSpacing: '0.18em',
                        textTransform: 'uppercase',
                        color: cfg.color,
                        opacity: 0.85,
                        lineHeight: 1,
                    }}
                >
                    {label ?? cfg.label}
                </span>
            )}
        </div>
    )
}
