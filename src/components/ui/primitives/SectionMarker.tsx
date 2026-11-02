import type { CSSProperties } from 'react'
import { HUDLabel } from './HUDLabel'
import { cn } from '@/lib/utils'

interface SectionMarkerProps {
    index: string           // e.g. "01", "02"
    label: string           // e.g. "ABOUT"
    sublabel?: string       // optional secondary label
    active?: boolean
    className?: string
    style?: CSSProperties
}

/**
 * Section identity stamp — combines the section index number with
 * its label in a technical / cinematic layout.
 * Appears at the entry of each section as an anchor.
 */
export function SectionMarker({
    index,
    label,
    sublabel,
    active = false,
    className,
    style,
}: SectionMarkerProps) {
    return (
        <div
            className={cn(className)}
            style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 12,
                ...style,
            }}
        >
            {/* vertical accent line */}
            <div
                aria-hidden
                style={{
                    width: 1,
                    height: 36,
                    background: active
                        ? 'linear-gradient(180deg, transparent, var(--color-accent-cyan), transparent)'
                        : 'linear-gradient(180deg, transparent, var(--color-border-default), transparent)',
                    flexShrink: 0,
                    transition: 'background 400ms',
                }}
            />

            {/* text stack */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <HUDLabel
                    variant={active ? 'cyan' : 'dim'}
                    style={{
                        fontSize: '0.60rem',
                        letterSpacing: '0.22em',
                        transition: 'color 300ms',
                    }}
                >
                    SEC / {index}
                </HUDLabel>
                <span
                    style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.72rem',
                        letterSpacing: '0.20em',
                        textTransform: 'uppercase',
                        color: active ? 'var(--color-accent-cyan-bright)' : 'var(--color-text-secondary)',
                        lineHeight: 1,
                        transition: 'color 300ms',
                    }}
                >
                    {label}
                </span>
                {sublabel && (
                    <HUDLabel variant="dim" style={{ fontSize: '0.58rem', letterSpacing: '0.14em' }}>
                        {sublabel}
                    </HUDLabel>
                )}
            </div>
        </div>
    )
}
