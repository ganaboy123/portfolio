import { useEffect, useRef, useCallback } from 'react'
import { gsap } from '@/lib/animation'
import { useAssistantStore } from '@/store/useAssistantStore'
import { useAppStore } from '@/store/useAppStore'
import { useCursor } from '@/hooks/useCursor'
import { useDevice } from '@/hooks/useDevice'
import { HUDLabel } from '@/components/ui/primitives/HUDLabel'
import { GlowLine } from '@/components/ui/primitives/GlowLine'
import { StatusIndicator } from '@/components/ui/primitives/StatusIndicator'
import { AIConversation } from './AIConversation'
import { AIInput } from './AIInput'
import { CONTEXTUAL_PROMPTS, buildLocalResponse } from '@/data/portfolioKnowledge'
import { useFocusTrap } from '@/hooks/useFocusTrap'

// ── Suggested prompt chips ────────────────────────────────────────────────────
function PromptChips({
    section,
    onSelect,
}: {
    section: string
    onSelect: (p: string) => void
}) {
    const cursor = useCursor()
    const prompts = CONTEXTUAL_PROMPTS[section] ?? CONTEXTUAL_PROMPTS.hero

    return (
        <div style={{
            padding: '10px 12px 12px',
            borderTop: '1px solid rgba(255,255,255,0.05)',
            display: 'flex', flexDirection: 'column', gap: 6,
        }}>
            <HUDLabel variant="dim" style={{ fontSize: '0.48rem', letterSpacing: '0.18em' }}>
                SUGGESTED
            </HUDLabel>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                {prompts.map((p) => (
                    <button
                        key={p}
                        onClick={() => onSelect(p)}
                        onMouseEnter={() => cursor.set('hover', p)}
                        onMouseLeave={cursor.reset}
                        style={{
                            fontFamily: 'var(--font-mono)', fontSize: '0.55rem',
                            letterSpacing: '0.06em', padding: '4px 9px',
                            background: 'rgba(56,189,248,0.06)',
                            border: '1px solid rgba(56,189,248,0.18)',
                            borderRadius: 2, color: 'var(--color-accent-cyan)',
                            cursor: 'none', textAlign: 'left',
                            transition: 'background 150ms, border-color 150ms',
                            lineHeight: 1.3,
                        }}
                    >
                        {p}
                    </button>
                ))}
            </div>
        </div>
    )
}

// ── Empty state ───────────────────────────────────────────────────────────────
function EmptyState({ section }: { section: string }) {
    return (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px 16px', gap: 10, textAlign: 'center' }}>
            {/* NOVA sigil */}
            <div aria-hidden style={{
                width: 44, height: 44, borderRadius: '50%', marginBottom: 8,
                background: 'radial-gradient(circle, rgba(56,189,248,0.12) 0%, transparent 70%)',
                border: '1px solid rgba(56,189,248,0.25)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
                    <circle cx="10" cy="10" r="3" fill="rgba(56,189,248,0.9)" />
                    <circle cx="10" cy="10" r="7" stroke="rgba(56,189,248,0.3)" strokeWidth="0.75" />
                    <line x1="10" y1="2" x2="10" y2="5" stroke="rgba(56,189,248,0.4)" strokeWidth="1" />
                    <line x1="10" y1="15" x2="10" y2="18" stroke="rgba(56,189,248,0.4)" strokeWidth="1" />
                    <line x1="2" y1="10" x2="5" y2="10" stroke="rgba(56,189,248,0.4)" strokeWidth="1" />
                    <line x1="15" y1="10" x2="18" y2="10" stroke="rgba(56,189,248,0.4)" strokeWidth="1" />
                </svg>
            </div>
            <HUDLabel variant="cyan" style={{ fontSize: '0.64rem', letterSpacing: '0.20em' }}>
                NOVA ONLINE
            </HUDLabel>
            <p style={{
                fontFamily: 'var(--font-sans)', fontSize: '0.78rem',
                color: 'var(--color-text-tertiary)', lineHeight: 1.6, maxWidth: 240,
            }}>
                Onboard AI assistant. Ask about projects, skills, experience, or how to get in touch.
            </p>
            <HUDLabel variant="dim" style={{ fontSize: '0.50rem', marginTop: 4 }}>
                SECTION: {section.toUpperCase()} · ESC TO CLOSE
            </HUDLabel>
        </div>
    )
}

// ── Main AIAssistant panel ────────────────────────────────────────────────────
export function AIAssistant() {
    const { isOpen, setOpen, messages, addMessage, isTyping, setTyping, clearMessages } = useAssistantStore()
    const activeSection = useAppStore((s) => s.activeSection)
    const cursor = useCursor()
    const { isMobile } = useDevice()

    const panelRef = useRef<HTMLDivElement>(null)
    const closeAssistant = useCallback(() => setOpen(false), [setOpen])

    useFocusTrap(panelRef, isOpen, closeAssistant)

    // ── Panel enter/exit ──────────────────────────
    useEffect(() => {
        if (!panelRef.current) return
        if (isOpen) {
            gsap.fromTo(panelRef.current,
                { opacity: 0, y: 20, scale: 0.97 },
                { opacity: 1, y: 0, scale: 1, duration: 0.45, ease: 'expo.out' },
            )
        } else {
            gsap.to(panelRef.current, { opacity: 0, y: 10, scale: 0.97, duration: 0.22, ease: 'power2.in' })
        }
    }, [isOpen])

    // ── Keyboard shortcut: Cmd/Ctrl+K ────────────
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault()
                setOpen(!isOpen)
            }
            if (e.key === 'Escape' && isOpen) {
                closeAssistant()
            }
        }
        window.addEventListener('keydown', handler)
        return () => window.removeEventListener('keydown', handler)
    }, [isOpen, setOpen, closeAssistant])

    // ── Message handler ───────────────────────────
    const handleSend = useCallback((text: string) => {
        const trimmed = text.trim()
        if (!trimmed || isTyping) return
        addMessage({ role: 'user', content: trimmed })
        setTyping(true)

        // Simulate natural response latency
        const latency = 600 + Math.random() * 600

        // ── API integration point ─────────────────
        // To connect a real AI:
        //   1. Create a server-side endpoint (e.g., /api/nova)
        //   2. Send: { message: trimmed, context: activeSection, history: messages }
        //   3. Return: { response: string }
        //   4. Replace the setTimeout below with your fetch call.
        //   5. Never expose API keys here — proxy through your server.
        // ─────────────────────────────────────────
        setTimeout(() => {
            const { text: response, suggestions } = buildLocalResponse(trimmed, activeSection)
            addMessage({ role: 'assistant', content: response })
            setTyping(false)
            // Auto-add suggestion chips as a follow-up if any
            if (suggestions && suggestions.length > 0) {
                // Suggestions are shown in the input area; no extra message needed
                void suggestions
            }
        }, latency)
    }, [isTyping, activeSection, addMessage, setTyping, messages]) // eslint-disable-line

    if (!isOpen) return null

    return (
        <div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="nova-assistant-title"
            tabIndex={-1}
            style={isMobile ? {
                position: 'fixed',
                inset: 0,
                width: '100%',
                height: '100%',
                maxHeight: '100%',
                zIndex: 'var(--z-assistant)' as unknown as number,
                background: 'rgba(5,7,17,0.99)',
                border: 'none',
                borderRadius: 0,
                backdropFilter: 'blur(24px)',
                WebkitBackdropFilter: 'blur(24px)',
                boxShadow: 'none',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
            } : {
                position: 'fixed',
                bottom: 72, right: 28,
                width: 'min(400px, calc(100vw - 40px))',
                maxHeight: 'min(580px, calc(100vh - 110px))',
                zIndex: 'var(--z-assistant)' as unknown as number,
                background: 'rgba(5,7,17,0.97)',
                border: '1px solid rgba(56,189,248,0.18)',
                borderRadius: 'var(--radius-lg)',
                backdropFilter: 'blur(24px)',
                WebkitBackdropFilter: 'blur(24px)',
                boxShadow: '0 24px 60px rgba(0,0,0,0.65), 0 0 0 1px rgba(56,189,248,0.06), inset 0 1px 0 rgba(56,189,248,0.08)',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
            }}
        >
            {/* Top shimmer edge */}
            <div aria-hidden style={{
                position: 'absolute', top: 0, left: 0, right: 0, height: 1, zIndex: 2,
                background: 'linear-gradient(90deg, transparent 0%, rgba(56,189,248,0.5) 40%, rgba(56,189,248,0.5) 60%, transparent 100%)',
            }} />

            {/* Corner brackets */}
            {[
                { top: 0, left: 0, d: 'M0 12 L0 0 L12 0' },
                { top: 0, right: 0, d: 'M0 0 L12 0 L12 12' },
                { bottom: 0, left: 0, d: 'M0 0 L0 12 L12 12' },
                { bottom: 0, right: 0, d: 'M12 0 L12 12 L0 12' },
            ].map(({ d, ...pos }, i) => (
                <svg key={i} aria-hidden width={12} height={12} style={{ position: 'absolute', ...pos as React.CSSProperties, zIndex: 2 }}>
                    <path d={d} stroke="rgba(56,189,248,0.35)" strokeWidth={1} fill="none" />
                </svg>
            ))}

            {/* ── Header ─────────────────────────── */}
            <div style={{
                padding: '11px 14px',
                borderBottom: '1px solid rgba(255,255,255,0.05)',
                display: 'flex', alignItems: 'center', gap: 10,
                flexShrink: 0,
                background: 'linear-gradient(to bottom, rgba(56,189,248,0.05) 0%, transparent 100%)',
            }}>
                <StatusIndicator status="online" showPing size="sm" />

                <div style={{ flex: 1 }}>
                    <div id="nova-assistant-title">
                        <HUDLabel variant="cyan" style={{ fontSize: '0.60rem', letterSpacing: '0.22em', display: 'block', lineHeight: 1 }}>
                            NOVA
                        </HUDLabel>
                    </div>
                    <HUDLabel variant="dim" style={{ fontSize: '0.46rem', letterSpacing: '0.14em', display: 'block' }}>
                        ONBOARD ASSISTANT · {activeSection.toUpperCase()}
                    </HUDLabel>
                </div>

                {/* Message count badge */}
                {messages.length > 0 && (
                    <HUDLabel variant="dim" style={{ fontSize: '0.48rem', letterSpacing: '0.10em' }}>
                        {messages.length} MSG
                    </HUDLabel>
                )}

                {/* Clear */}
                {messages.length > 0 && (
                    <button
                        onClick={clearMessages}
                        onMouseEnter={() => cursor.set('hover', 'CLEAR')}
                        onMouseLeave={cursor.reset}
                        aria-label="Clear conversation"
                        style={{
                            fontFamily: 'var(--font-mono)', fontSize: '0.50rem',
                            letterSpacing: '0.12em', background: 'none',
                            border: '1px solid rgba(255,255,255,0.08)',
                            borderRadius: 2, color: 'var(--color-text-tertiary)',
                            padding: '2px 7px', cursor: 'none',
                            transition: 'color 150ms, border-color 150ms',
                        }}
                    >
                        CLR
                    </button>
                )}

                {/* Keyboard hint */}
                <HUDLabel variant="dim" style={{ fontSize: '0.46rem', letterSpacing: '0.08em', opacity: 0.5 }}>
                    ⌘K
                </HUDLabel>

                {/* Close button — always visible on mobile */}
                <button
                    onClick={closeAssistant}
                    aria-label="Close assistant"
                    style={{
                        minWidth: isMobile ? 40 : 28,
                        minHeight: isMobile ? 40 : 28,
                        padding: isMobile ? '0 12px' : '2px 8px',
                        border: '1px solid rgba(56,189,248,0.22)',
                        borderRadius: 4,
                        background: 'transparent',
                        color: 'var(--color-text-secondary)',
                        fontFamily: 'var(--font-mono)',
                        fontSize: isMobile ? '0.70rem' : '0.52rem',
                        letterSpacing: '0.10em',
                        cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}
                >
                    {isMobile ? '✕ CLOSE' : '✕'}
                </button>
            </div>

            <GlowLine color="dim" />

            {/* ── Conversation ───────────────────── */}
            <AIConversation
                messages={messages}
                isTyping={isTyping}
                accentColor="#38bdf8"
                emptyState={<EmptyState section={activeSection} />}
            />

            {/* ── Suggested prompts (no messages yet) ── */}
            {messages.length === 0 && (
                <PromptChips section={activeSection} onSelect={handleSend} />
            )}

            {/* ── Input ──────────────────────────── */}
            <AIInput onSend={handleSend} disabled={isTyping} accentColor="#38bdf8" />

            {/* Section indicator strip */}
            <div style={{
                padding: '4px 12px 6px',
                background: 'rgba(0,0,0,0.2)',
                display: 'flex', alignItems: 'center', gap: 8,
            }}>
                <div style={{ width: 3, height: 3, borderRadius: '50%', background: '#38bdf8', boxShadow: '0 0 4px #38bdf8' }} />
                <HUDLabel variant="dim" style={{ fontSize: '0.44rem', letterSpacing: '0.14em' }}>
                    VIEWING: {activeSection.toUpperCase()} · ENTER ↵ TO SEND
                </HUDLabel>
            </div>
        </div>
    )
}
