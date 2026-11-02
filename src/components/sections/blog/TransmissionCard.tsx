import { useRef, useState } from 'react'
import { gsap } from '@/lib/animation'
import type { SignalEntry } from '@/data/signal-log'
import { SIGNAL_CATEGORIES, SIGNAL_TYPES, formatSignalDate } from '@/data/signal-log'
import { HUDLabel } from '@/components/ui/primitives/HUDLabel'
import { GlowLine } from '@/components/ui/primitives/GlowLine'
import { useCursor } from '@/hooks/useCursor'

interface TransmissionCardProps {
    entry: SignalEntry
    onOpen: () => void
    variant?: 'featured' | 'compact'
}

/**
 * Featured transmission card — large format with cover image support.
 * Used in the primary featured row.
 */
export function TransmissionCard({ entry, onOpen, variant = 'featured' }: TransmissionCardProps) {
    const cardRef = useRef<HTMLDivElement>(null)
    const glowEdgeRef = useRef<HTMLDivElement>(null)
    const metaRef = useRef<HTMLDivElement>(null)
    const [active, setActive] = useState(false)
    const cursor = useCursor()

    const catMeta = SIGNAL_CATEGORIES[entry.category]
    const color = catMeta.color

    const handleEnter = () => {
        setActive(true)
        cursor.set('hover', 'READ')
        gsap.to(cardRef.current, { y: -3, duration: 0.3, ease: 'power2.out' })
        gsap.to(glowEdgeRef.current, {
            scaleX: 1, opacity: 1, duration: 0.45, ease: 'expo.out',
            transformOrigin: 'left center',
        })
        gsap.to(metaRef.current, { opacity: 1, y: 0, duration: 0.3, ease: 'expo.out' })
    }

    const handleLeave = () => {
        setActive(false)
        cursor.reset()
        gsap.to(cardRef.current, { y: 0, duration: 0.3, ease: 'power2.out' })
        gsap.to(glowEdgeRef.current, { scaleX: 0, opacity: 0, duration: 0.3, transformOrigin: 'left center' })
        gsap.to(metaRef.current, { opacity: 0, y: 4, duration: 0.25 })
    }

    if (variant === 'compact') {
        return (
            <button
                onClick={onOpen}
                onMouseEnter={handleEnter}
                onMouseLeave={handleLeave}
                style={{
                    width: '100%', background: 'none', border: 'none', cursor: 'none',
                    padding: '13px 0', textAlign: 'left',
                    borderBottom: '1px solid rgba(255,255,255,0.05)',
                    display: 'grid',
                    gridTemplateColumns: '68px 1fr auto',
                    gap: 16, alignItems: 'center',
                    transition: 'background 180ms',
                }}
            >
                {/* ID */}
                <div style={{
                    fontFamily: 'var(--font-mono)', fontSize: '0.54rem',
                    letterSpacing: '0.18em',
                    color: active ? color : 'var(--color-text-tertiary)',
                    transition: 'color 200ms',
                }}>
                    {entry.transmissionId}
                </div>

                {/* Title area */}
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3, flexWrap: 'wrap' }}>
                        <span style={{
                            fontFamily: 'var(--font-display)',
                            fontSize: 'clamp(0.875rem, 1.3vw, 1rem)',
                            fontWeight: 400, letterSpacing: '-0.01em',
                            color: active ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
                            transition: 'color 200ms', lineHeight: 1.3,
                        }}>
                            {entry.title}
                        </span>
                        <span style={{
                            fontFamily: 'var(--font-mono)', fontSize: '0.50rem',
                            letterSpacing: '0.14em', color, textTransform: 'uppercase',
                            background: `${color}10`, border: `1px solid ${color}22`,
                            borderRadius: 2, padding: '2px 6px', flexShrink: 0,
                        }}>
                            {SIGNAL_TYPES[entry.type]}
                        </span>
                    </div>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        <span style={{
                            fontFamily: 'var(--font-mono)', fontSize: '0.50rem',
                            color: catMeta.color + '70', letterSpacing: '0.12em',
                            textTransform: 'uppercase',
                        }}>
                            {catMeta.label}
                        </span>
                        {entry.tags.slice(0, 2).map((t) => (
                            <span key={t} style={{
                                fontFamily: 'var(--font-mono)', fontSize: '0.48rem',
                                color: 'var(--color-text-tertiary)', letterSpacing: '0.06em',
                            }}>
                                · {t}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Right meta */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 3, flexShrink: 0 }}>
                    <span style={{
                        fontFamily: 'var(--font-mono)', fontSize: '0.52rem',
                        letterSpacing: '0.10em', color: 'var(--color-text-tertiary)',
                    }}>
                        {formatSignalDate(entry.date)}
                    </span>
                    <span style={{
                        fontFamily: 'var(--font-mono)', fontSize: '0.50rem',
                        letterSpacing: '0.10em',
                        color: active ? color : 'var(--color-text-tertiary)',
                        transition: 'color 200ms',
                    }}>
                        {entry.readTime}m READ
                    </span>
                </div>
            </button>
        )
    }

    // Featured card
    return (
        <div
            ref={cardRef}
            onClick={onOpen}
            onMouseEnter={handleEnter}
            onMouseLeave={handleLeave}
            style={{
                position: 'relative',
                background: 'var(--color-bg-surface)',
                border: `1px solid ${active ? color + '24' : 'var(--color-border-subtle)'}`,
                borderRadius: 'var(--radius-md)',
                overflow: 'hidden',
                cursor: 'pointer',
                transition: 'border-color 0.3s',
                willChange: 'transform',
            }}
        >
            {/* Top glow edge */}
            <div
                ref={glowEdgeRef}
                aria-hidden
                style={{
                    position: 'absolute', top: 0, left: 0, right: 0, height: 1,
                    background: `linear-gradient(90deg, transparent, ${color}70, transparent)`,
                    transform: 'scaleX(0)', opacity: 0,
                    transformOrigin: 'left center',
                    zIndex: 2, pointerEvents: 'none',
                }}
            />

            {/* Corner brackets */}
            {[
                { top: 0, left: 0, d: 'M0 10 L0 0 L10 0' },
                { top: 0, right: 0, d: 'M0 0 L10 0 L10 10' },
                { bottom: 0, left: 0, d: 'M0 0 L0 10 L10 10' },
                { bottom: 0, right: 0, d: 'M10 0 L10 10 L0 10' },
            ].map(({ d, ...pos }, i) => (
                <svg key={i} aria-hidden width={10} height={10} style={{
                    position: 'absolute', ...pos as React.CSSProperties,
                    opacity: active ? 0.7 : 0.2, transition: 'opacity 0.3s', zIndex: 2,
                }}>
                    <path d={d} stroke={color} strokeWidth={1} fill="none" />
                </svg>
            ))}

            {/* Cover image area */}
            <div style={{
                position: 'relative', height: 160, overflow: 'hidden',
                background: entry.coverImage ? '#000' : `radial-gradient(ellipse at 50% 50%, ${color}12 0%, transparent 70%)`,
                borderBottom: `1px solid ${color}18`,
            }}>
                {/* Grid bg */}
                <div aria-hidden style={{
                    position: 'absolute', inset: 0,
                    backgroundImage: `linear-gradient(${color}07 1px, transparent 1px), linear-gradient(90deg, ${color}07 1px, transparent 1px)`,
                    backgroundSize: '28px 28px',
                }} />

                {entry.coverImage ? (
                    <img src={entry.coverImage} alt={entry.title}
                        style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: active ? 0.85 : 0.55, transition: 'opacity 0.4s' }}
                    />
                ) : (
                    <div style={{
                        position: 'absolute', inset: 0,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                        <div style={{
                            fontFamily: 'var(--font-display)',
                            fontSize: '3.5rem', fontWeight: 200,
                            color: `${color}12`, userSelect: 'none',
                            letterSpacing: '-0.04em',
                        }}>
                            {entry.transmissionId}
                        </div>
                    </div>
                )}

                {/* Scan line */}
                {active && (
                    <div aria-hidden style={{
                        position: 'absolute', left: 0, right: 0, height: 1, top: '50%',
                        background: `linear-gradient(90deg, transparent, ${color}50, transparent)`,
                        animation: 'scan-sweep 2.4s ease-in-out infinite',
                    }} />
                )}

                {/* Category badge */}
                <div style={{
                    position: 'absolute', top: 10, left: 12, zIndex: 3,
                    fontFamily: 'var(--font-mono)', fontSize: '0.50rem',
                    letterSpacing: '0.18em', color: `${color}99`,
                    textTransform: 'uppercase',
                }}>
                    {catMeta.label}
                </div>

                {/* Type badge */}
                <div style={{
                    position: 'absolute', top: 10, right: 12, zIndex: 3,
                    fontFamily: 'var(--font-mono)', fontSize: '0.50rem',
                    letterSpacing: '0.14em', color: `${color}66`,
                    background: `${color}12`, border: `1px solid ${color}20`,
                    borderRadius: 2, padding: '2px 7px',
                    textTransform: 'uppercase',
                }}>
                    {SIGNAL_TYPES[entry.type]}
                </div>

                {/* Bottom gradient */}
                <div aria-hidden style={{
                    position: 'absolute', inset: 0,
                    background: 'linear-gradient(to bottom, transparent 50%, rgba(10,13,24,0.9) 100%)',
                }} />
            </div>

            {/* Card body */}
            <div style={{ padding: '16px 20px 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                {/* Date + read time */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <HUDLabel variant="dim" style={{ fontSize: '0.52rem' }}>
                        {formatSignalDate(entry.date)}
                    </HUDLabel>
                    <HUDLabel style={{ fontSize: '0.52rem', color: `${color}88` }}>
                        {entry.readTime} MIN
                    </HUDLabel>
                </div>

                <h3 style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: 'clamp(0.95rem, 1.4vw, 1.075rem)',
                    fontWeight: 400, letterSpacing: '-0.02em',
                    color: 'var(--color-text-primary)', lineHeight: 1.25, marginTop: 2,
                }}>
                    {entry.title}
                </h3>

                <p style={{
                    fontFamily: 'var(--font-mono)', fontSize: '0.60rem',
                    letterSpacing: '0.08em', textTransform: 'uppercase',
                    color, lineHeight: 1, opacity: 0.85,
                }}>
                    {entry.subtitle}
                </p>

                <GlowLine color="dim" intensity="subtle" />

                <p style={{
                    fontSize: '0.78rem', color: 'var(--color-text-secondary)',
                    lineHeight: 1.65, flex: 1,
                }}>
                    {entry.excerpt}
                </p>

                {/* Tags */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginTop: 2 }}>
                    {entry.tags.slice(0, 3).map((t) => (
                        <span key={t} style={{
                            fontFamily: 'var(--font-mono)', fontSize: '0.54rem',
                            letterSpacing: '0.08em', textTransform: 'uppercase',
                            color: `${color}aa`, background: `${color}0c`,
                            border: `1px solid ${color}22`,
                            borderRadius: 2, padding: '2px 7px',
                        }}>
                            {t}
                        </span>
                    ))}
                </div>

                {/* Hover reveal */}
                <div ref={metaRef} style={{ opacity: 0, transform: 'translateY(4px)', marginTop: 2 }}>
                    <div style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
                        paddingTop: 10, borderTop: `1px solid ${color}18`,
                    }}>
                        <span style={{
                            fontFamily: 'var(--font-mono)', fontSize: '0.58rem',
                            color, letterSpacing: '0.12em',
                        }}>
                            READ TRANSMISSION →
                        </span>
                    </div>
                </div>
            </div>
        </div>
    )
}
