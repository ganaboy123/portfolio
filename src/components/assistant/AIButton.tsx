import { useEffect, useRef } from 'react'
import { gsap } from '@/lib/animation'
import { useAssistantStore } from '@/store/useAssistantStore'
import { useCursor } from '@/hooks/useCursor'
import { HUDLabel } from '@/components/ui/primitives/HUDLabel'

/**
 * NOVA activation HUD element.
 * Resting state: compact "AI CORE ● ONLINE" panel.
 * Click: toggles the full assistant interface.
 * Pulses to indicate the assistant is alive.
 */
export function AIButton() {
    const { isOpen, setOpen, isTyping, messages } = useAssistantStore()
    const cursor = useCursor()
    const orbRef = useRef<HTMLButtonElement>(null)
    const pulseRef = useRef<HTMLDivElement>(null)
    const tlRef = useRef<gsap.core.Timeline | null>(null)

    // Idle pulse animation
    useEffect(() => {
        if (!pulseRef.current) return
        tlRef.current?.kill()
        const tl = gsap.timeline({ repeat: -1 })
        tl.to(pulseRef.current, {
            boxShadow: '0 0 0 4px rgba(56,189,248,0.12), 0 0 16px rgba(56,189,248,0.25)',
            duration: 2.0, ease: 'power2.inOut',
        })
        tl.to(pulseRef.current, {
            boxShadow: '0 0 0 1px rgba(56,189,248,0.04), 0 0 6px rgba(56,189,248,0.08)',
            duration: 2.0, ease: 'power2.inOut',
        })
        tlRef.current = tl
        return () => { tl.kill() }
    }, [])

    // Glow brighter when typing
    useEffect(() => {
        if (!pulseRef.current) return
        if (isTyping) {
            gsap.to(pulseRef.current, {
                boxShadow: '0 0 0 5px rgba(56,189,248,0.18), 0 0 24px rgba(56,189,248,0.4)',
                duration: 0.4,
            })
        }
    }, [isTyping])

    const unread = !isOpen && messages.length > 0

    return (
        <button
            ref={orbRef}
            className="nova-trigger"
            onClick={() => setOpen(!isOpen)}
            onMouseEnter={() => cursor.set('hover', isOpen ? 'CLOSE NOVA' : 'OPEN NOVA')}
            onMouseLeave={cursor.reset}
            aria-label={isOpen ? 'Close NOVA assistant' : 'Open NOVA assistant'}
            aria-expanded={isOpen}
            aria-haspopup="dialog"
            style={{
                position: 'fixed',
                bottom: 28, right: 28,
                zIndex: 'var(--z-assistant)' as unknown as number,
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '8px 12px 8px 10px',
                background: isOpen ? 'rgba(56,189,248,0.10)' : 'rgba(6,8,16,0.88)',
                border: `1px solid ${isOpen ? 'rgba(56,189,248,0.45)' : 'rgba(56,189,248,0.22)'}`,
                borderRadius: 'var(--radius-sm)',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                cursor: 'none',
                transition: 'background 250ms, border-color 250ms',
            }}
        >
            {/* Pulsing status dot */}
            <div
                ref={pulseRef}
                aria-hidden
                style={{
                    width: 20, height: 20, borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(56,189,248,0.18) 0%, transparent 70%)',
                    border: '1px solid rgba(56,189,248,0.35)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0, position: 'relative',
                }}
            >
                <div style={{
                    width: 6, height: 6, borderRadius: '50%',
                    background: isTyping ? '#a78bfa' : '#38bdf8',
                    transition: 'background 0.4s',
                    boxShadow: `0 0 5px ${isTyping ? '#a78bfa' : '#38bdf8'}`,
                }} />
                {/* ping ring */}
                <div aria-hidden style={{
                    position: 'absolute', inset: -2, borderRadius: '50%',
                    border: '1px solid rgba(56,189,248,0.18)',
                    animation: 'ping-out 2.4s ease-out infinite',
                }} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <HUDLabel variant="cyan" style={{ fontSize: '0.56rem', letterSpacing: '0.20em', lineHeight: 1 }}>
                    NOVA
                </HUDLabel>
                <HUDLabel variant="dim" style={{ fontSize: '0.46rem', letterSpacing: '0.14em', lineHeight: 1 }}>
                    {isTyping ? 'PROCESSING…' : isOpen ? 'ACTIVE' : 'ONLINE'}
                </HUDLabel>
            </div>

            {/* Unread indicator */}
            {unread && (
                <div aria-label="Unread messages" style={{
                    width: 6, height: 6, borderRadius: '50%',
                    background: '#a78bfa',
                    boxShadow: '0 0 4px #a78bfa',
                    marginLeft: 2,
                }} />
            )}

            {/* Close X or chevron */}
            <div aria-hidden style={{
                marginLeft: 2,
                fontFamily: 'var(--font-mono)',
                fontSize: '0.60rem',
                color: isOpen ? 'rgba(56,189,248,0.7)' : 'rgba(56,189,248,0.35)',
                transition: 'color 200ms, transform 200ms',
                transform: isOpen ? 'rotate(180deg)' : 'none',
            }}>
                {isOpen ? '✕' : '▲'}
            </div>
        </button>
    )
}
