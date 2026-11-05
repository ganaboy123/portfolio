import { useEffect, useRef, useCallback, useState } from 'react'
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
import { CONTEXTUAL_PROMPTS } from '@/data/portfolioKnowledge'
import { novaRespond, isLLMConfigured } from '@/lib/novaEngine'
import { useFocusTrap } from '@/hooks/useFocusTrap'
import { personalInfo } from '@/data/content'

// ── Mode labels ───────────────────────────────────────────────────────────────
const MODE_LABELS = {
    assistant: { label: 'ASSISTANT', color: '#38bdf8' },
    casual: { label: 'CASUAL', color: '#a78bfa' },
    technical: { label: 'TECHNICAL', color: '#34d399' },
    creative: { label: 'CREATIVE', color: '#e879f9' },
} as const

// ── Capability pills shown in empty state ─────────────────────────────────────
const CAPABILITIES = [
    { icon: '◈', label: 'Portfolio knowledge' },
    { icon: '⬡', label: 'Services & pricing' },
    { icon: '◎', label: 'General tech Q&A' },
    { icon: '⌘', label: 'Code help & review' },
    { icon: '◉', label: 'Casual conversation' },
    { icon: '⎔', label: 'World knowledge' },
    { icon: '⬥', label: 'Creative writing' },
    { icon: '◆', label: 'Slash commands' },
]

// ── Suggested prompt chips ────────────────────────────────────────────────────
function PromptChips({ section, onSelect }: { section: string; onSelect: (p: string) => void }) {
    const cursor = useCursor()
    const prompts = CONTEXTUAL_PROMPTS[section] ?? CONTEXTUAL_PROMPTS.hero

    return (
        <div style={{ padding: '8px 12px 10px', borderTop: '1px solid rgba(255,255,255,0.04)', display: 'flex', flexDirection: 'column', gap: 5 }}>
            <HUDLabel variant="dim" style={{ fontSize: '0.46rem', letterSpacing: '0.18em' }}>SUGGESTED</HUDLabel>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                {prompts.map((p) => (
                    <button key={p} onClick={() => onSelect(p)}
                        onMouseEnter={() => cursor.set('hover', p)}
                        onMouseLeave={cursor.reset}
                        style={{
                            fontFamily: 'var(--font-mono)', fontSize: '0.54rem',
                            letterSpacing: '0.05em', padding: '4px 9px',
                            background: 'rgba(56,189,248,0.05)',
                            border: '1px solid rgba(56,189,248,0.15)',
                            borderRadius: 2, color: 'var(--color-accent-cyan)',
                            cursor: 'none', textAlign: 'left',
                            transition: 'background 140ms, border-color 140ms',
                            lineHeight: 1.4,
                        }}
                    >{p}</button>
                ))}
            </div>
        </div>
    )
}

// ── Empty / welcome state ─────────────────────────────────────────────────────
function EmptyState({ section, onSelect }: { section: string; onSelect: (p: string) => void }) {
    const cursor = useCursor()
    return (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '18px 16px 8px', gap: 0, textAlign: 'center', overflowY: 'auto' }}>
            {/* NOVA sigil */}
            <div aria-hidden style={{
                width: 48, height: 48, borderRadius: '50%', marginBottom: 10,
                background: 'radial-gradient(circle, rgba(56,189,248,0.14) 0%, transparent 70%)',
                border: '1px solid rgba(56,189,248,0.28)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 0 20px rgba(56,189,248,0.08)',
            }}>
                <svg width="22" height="22" viewBox="0 0 20 20" fill="none" aria-hidden>
                    <circle cx="10" cy="10" r="3" fill="rgba(56,189,248,0.9)" />
                    <circle cx="10" cy="10" r="7" stroke="rgba(56,189,248,0.35)" strokeWidth="0.75" />
                    <line x1="10" y1="1.5" x2="10" y2="5" stroke="rgba(56,189,248,0.5)" strokeWidth="1" />
                    <line x1="10" y1="15" x2="10" y2="18.5" stroke="rgba(56,189,248,0.5)" strokeWidth="1" />
                    <line x1="1.5" y1="10" x2="5" y2="10" stroke="rgba(56,189,248,0.5)" strokeWidth="1" />
                    <line x1="15" y1="10" x2="18.5" y2="10" stroke="rgba(56,189,248,0.5)" strokeWidth="1" />
                    <circle cx="10" cy="10" r="9" stroke="rgba(56,189,248,0.10)" strokeWidth="0.5" strokeDasharray="2 3" />
                </svg>
            </div>

            <HUDLabel variant="cyan" style={{ fontSize: '0.68rem', letterSpacing: '0.24em', display: 'block', marginBottom: 4 }}>
                NOVA ONLINE
            </HUDLabel>
            <p style={{
                fontFamily: 'var(--font-sans)', fontSize: '0.78rem',
                color: 'var(--color-text-tertiary)', lineHeight: 1.6,
                maxWidth: 260, margin: '0 0 12px',
            }}>
                {isLLMConfigured()
                    ? `Advanced AI assistant — ask me anything. Portfolio info, general knowledge, coding help, creative tasks, or just a chat.`
                    : `AI assistant for ${personalInfo.name}'s portfolio. Ask about projects, skills, services, or anything tech.`
                }
            </p>

            {/* Capability grid */}
            <div style={{
                display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 5,
                width: '100%', marginBottom: 14,
            }}>
                {CAPABILITIES.map((c) => (
                    <div key={c.label} style={{
                        padding: '6px 8px',
                        background: 'rgba(255,255,255,0.02)',
                        border: '1px solid rgba(255,255,255,0.06)',
                        borderRadius: 4,
                        display: 'flex', alignItems: 'center', gap: 6,
                        textAlign: 'left',
                    }}>
                        <span style={{ color: '#38bdf8', fontSize: '0.70rem', flexShrink: 0 }}>{c.icon}</span>
                        <span style={{ fontFamily: 'var(--font-sans)', fontSize: '0.64rem', color: 'var(--color-text-tertiary)', lineHeight: 1.3 }}>{c.label}</span>
                    </div>
                ))}
            </div>

            {/* Quick start prompts */}
            <div style={{ width: '100%' }}>
                <HUDLabel variant="dim" style={{ fontSize: '0.44rem', letterSpacing: '0.18em', marginBottom: 6, display: 'block' }}>
                    QUICK START · {section.toUpperCase()}
                </HUDLabel>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {(CONTEXTUAL_PROMPTS[section] ?? CONTEXTUAL_PROMPTS.hero).map((p) => (
                        <button key={p} onClick={() => onSelect(p)}
                            onMouseEnter={() => cursor.set('hover', p)}
                            onMouseLeave={cursor.reset}
                            style={{
                                fontFamily: 'var(--font-sans)', fontSize: '0.72rem',
                                padding: '7px 10px', textAlign: 'left',
                                background: 'rgba(56,189,248,0.04)',
                                border: '1px solid rgba(56,189,248,0.12)',
                                borderRadius: 4, color: 'var(--color-text-secondary)',
                                cursor: 'none', lineHeight: 1.4,
                                transition: 'background 140ms, border-color 140ms',
                                display: 'flex', alignItems: 'center', gap: 8,
                            }}
                        >
                            <span style={{ color: '#38bdf8', opacity: 0.6, fontSize: '0.60rem' }}>▸</span>
                            {p}
                        </button>
                    ))}
                </div>
            </div>

            <HUDLabel variant="dim" style={{ fontSize: '0.44rem', marginTop: 12, opacity: 0.5 }}>
                ⌘K TO TOGGLE · ESC TO CLOSE · / FOR COMMANDS
            </HUDLabel>
        </div>
    )
}

// ── Status bar ────────────────────────────────────────────────────────────────
function StatusBar({ status, activeSection, msgCount }: { status: string; activeSection: string; msgCount: number }) {
    const statusColors: Record<string, string> = {
        online: '#34d399', thinking: '#38bdf8', searching: '#f472b6', idle: '#94a3b8',
    }
    const color = statusColors[status] ?? '#38bdf8'
    return (
        <div style={{
            padding: '4px 12px 5px',
            background: 'rgba(0,0,0,0.18)',
            display: 'flex', alignItems: 'center', gap: 8,
            borderTop: '1px solid rgba(255,255,255,0.03)',
        }}>
            <div style={{ width: 3, height: 3, borderRadius: '50%', background: color, boxShadow: `0 0 5px ${color}`, flexShrink: 0 }} />
            <HUDLabel variant="dim" style={{ fontSize: '0.43rem', letterSpacing: '0.13em', flex: 1 }}>
                {status.toUpperCase()} · SECTION: {activeSection.toUpperCase()} · {msgCount} MSG
            </HUDLabel>
            <HUDLabel variant="dim" style={{ fontSize: '0.43rem', letterSpacing: '0.10em', opacity: 0.5 }}>
                ENTER ↵ SEND
            </HUDLabel>
        </div>
    )
}

// ── Main component ────────────────────────────────────────────────────────────
export function AIAssistant() {
    const {
        isOpen, setOpen, messages, addMessage, isTyping, setTyping,
        clearMessages, status, setStatus, mode, setMode,
    } = useAssistantStore()
    const activeSection = useAppStore((s) => s.activeSection)
    const cursor = useCursor()
    const { isMobile } = useDevice()
    const panelRef = useRef<HTMLDivElement>(null)
    const closeAssistant = useCallback(() => setOpen(false), [setOpen])
    const [showModeMenu, setShowModeMenu] = useState(false)

    useFocusTrap(panelRef, isOpen, closeAssistant)

    // ── Panel animation ───────────────────────────
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

    // ── Keyboard shortcut ─────────────────────────
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); setOpen(!isOpen) }
            if (e.key === 'Escape' && isOpen) closeAssistant()
        }
        window.addEventListener('keydown', handler)
        return () => window.removeEventListener('keydown', handler)
    }, [isOpen, setOpen, closeAssistant])

    // ── Message sender ────────────────────────────
    const handleSend = useCallback(async (text: string) => {
        const trimmed = text.trim()
        if (!trimmed || isTyping) return

        addMessage({ role: 'user', content: trimmed })
        setTyping(true)
        setStatus('thinking')

        const webLike = /\b(latest|current|today|news|weather|trend|2024|2025|2026|who won|what happened|price of|stock)\b/.test(trimmed.toLowerCase())
        if (webLike) setStatus('searching')

        try {
            const { text: response, suggestions, actions } = await novaRespond(trimmed, messages, activeSection)
            addMessage({ role: 'assistant', content: response, suggestions, actions, metadata: { isWeb: webLike } })
        } catch {
            addMessage({ role: 'assistant', content: 'Something went wrong on my end. Try again in a moment.' })
        } finally {
            setTyping(false)
            setStatus('online')
        }
    }, [isTyping, activeSection, addMessage, setTyping, setStatus, messages]) // eslint-disable-line

    // ── Slash commands ────────────────────────────
    const handleCommand = useCallback((cmd: string) => {
        if (cmd === '/clear') { clearMessages(); return }
    }, [clearMessages])

    if (!isOpen) return null

    const modeInfo = MODE_LABELS[mode]

    const panelStyle: React.CSSProperties = isMobile ? {
        position: 'fixed', inset: 0, width: '100%', height: '100%', maxHeight: '100%',
        zIndex: 'var(--z-assistant)' as unknown as number,
        background: 'rgba(5,7,17,0.99)', border: 'none', borderRadius: 0,
        backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
        boxShadow: 'none', display: 'flex', flexDirection: 'column', overflow: 'hidden',
    } : {
        position: 'fixed', bottom: 72, right: 28,
        width: 'min(420px, calc(100vw - 40px))',
        maxHeight: 'min(620px, calc(100vh - 110px))',
        zIndex: 'var(--z-assistant)' as unknown as number,
        background: 'rgba(5,7,17,0.97)',
        border: '1px solid rgba(56,189,248,0.16)',
        borderRadius: 'var(--radius-lg)',
        backdropFilter: 'blur(28px)', WebkitBackdropFilter: 'blur(28px)',
        boxShadow: '0 28px 64px rgba(0,0,0,0.70), 0 0 0 1px rgba(56,189,248,0.05), inset 0 1px 0 rgba(56,189,248,0.08)',
        display: 'flex', flexDirection: 'column', overflow: 'hidden',
    }

    return (
        <div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="nova-assistant-title"
            tabIndex={-1}
            style={panelStyle}
        >
            {/* Top shimmer */}
            <div aria-hidden style={{
                position: 'absolute', top: 0, left: 0, right: 0, height: 1, zIndex: 2,
                background: 'linear-gradient(90deg, transparent 0%, rgba(56,189,248,0.55) 40%, rgba(56,189,248,0.55) 60%, transparent 100%)',
            }} />

            {/* Corner brackets */}
            {[
                { top: 0, left: 0, d: 'M0 12 L0 0 L12 0' },
                { top: 0, right: 0, d: 'M0 0 L12 0 L12 12' },
                { bottom: 0, left: 0, d: 'M0 0 L0 12 L12 12' },
                { bottom: 0, right: 0, d: 'M12 0 L12 12 L0 12' },
            ].map(({ d, ...pos }, i) => (
                <svg key={i} aria-hidden width={12} height={12} style={{ position: 'absolute', ...pos as React.CSSProperties, zIndex: 2 }}>
                    <path d={d} stroke="rgba(56,189,248,0.30)" strokeWidth={1} fill="none" />
                </svg>
            ))}

            {/* ── Header ─────────────────────────── */}
            <div style={{
                padding: '10px 14px',
                borderBottom: '1px solid rgba(255,255,255,0.05)',
                display: 'flex', alignItems: 'center', gap: 9,
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
                    <HUDLabel variant="dim" style={{ fontSize: '0.44rem', letterSpacing: '0.12em', display: 'block' }}>
                        {isLLMConfigured() ? 'LLM · ONLINE' : 'LOCAL · ONLINE'} · {activeSection.toUpperCase()}
                    </HUDLabel>
                </div>

                {/* Mode selector */}
                <div style={{ position: 'relative' }}>
                    <button
                        onClick={() => setShowModeMenu(!showModeMenu)}
                        onMouseEnter={() => cursor.set('hover', 'MODE')}
                        onMouseLeave={cursor.reset}
                        style={{
                            fontFamily: 'var(--font-mono)', fontSize: '0.48rem',
                            letterSpacing: '0.12em',
                            padding: '3px 8px',
                            background: `${modeInfo.color}12`,
                            border: `1px solid ${modeInfo.color}35`,
                            borderRadius: 3,
                            color: modeInfo.color,
                            cursor: 'none',
                        }}
                    >
                        {modeInfo.label}
                    </button>
                    {showModeMenu && (
                        <div style={{
                            position: 'absolute', top: '110%', right: 0,
                            background: 'rgba(5,7,17,0.98)',
                            border: '1px solid rgba(56,189,248,0.20)',
                            borderRadius: 5, overflow: 'hidden',
                            zIndex: 20, minWidth: 120,
                            boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
                        }}>
                            {(Object.entries(MODE_LABELS) as [typeof mode, typeof modeInfo][]).map(([key, info]) => (
                                <button key={key}
                                    onClick={() => { setMode(key); setShowModeMenu(false) }}
                                    onMouseEnter={() => cursor.set('hover', info.label)}
                                    onMouseLeave={cursor.reset}
                                    style={{
                                        width: '100%', textAlign: 'left',
                                        padding: '7px 12px',
                                        background: key === mode ? `${info.color}12` : 'none',
                                        border: 'none',
                                        fontFamily: 'var(--font-mono)', fontSize: '0.52rem',
                                        letterSpacing: '0.10em', color: info.color,
                                        cursor: 'none',
                                        borderBottom: '1px solid rgba(255,255,255,0.04)',
                                    }}
                                >{info.label}</button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Message count */}
                {messages.length > 0 && (
                    <HUDLabel variant="dim" style={{ fontSize: '0.46rem', letterSpacing: '0.10em' }}>
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
                            fontFamily: 'var(--font-mono)', fontSize: '0.48rem',
                            letterSpacing: '0.12em', background: 'none',
                            border: '1px solid rgba(255,255,255,0.08)',
                            borderRadius: 2, color: 'var(--color-text-tertiary)',
                            padding: '2px 7px', cursor: 'none',
                            transition: 'color 150ms, border-color 150ms',
                        }}
                    >CLR</button>
                )}

                {/* ⌘K hint */}
                <HUDLabel variant="dim" style={{ fontSize: '0.44rem', letterSpacing: '0.08em', opacity: 0.4 }}>⌘K</HUDLabel>

                {/* Close */}
                <button
                    onClick={closeAssistant}
                    onMouseEnter={() => cursor.set('hover', 'CLOSE')}
                    onMouseLeave={cursor.reset}
                    aria-label="Close assistant"
                    style={{
                        minWidth: isMobile ? 40 : 26, minHeight: isMobile ? 40 : 26,
                        padding: isMobile ? '0 12px' : '2px 7px',
                        border: '1px solid rgba(56,189,248,0.20)', borderRadius: 4,
                        background: 'transparent', color: 'var(--color-text-secondary)',
                        fontFamily: 'var(--font-mono)', fontSize: isMobile ? '0.70rem' : '0.50rem',
                        letterSpacing: '0.10em', cursor: isMobile ? 'pointer' : 'none',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}
                >{isMobile ? '✕ CLOSE' : '✕'}</button>
            </div>

            <GlowLine color="dim" />

            {/* ── Conversation ───────────────────── */}
            <AIConversation
                messages={messages}
                isTyping={isTyping}
                accentColor="#38bdf8"
                emptyState={<EmptyState section={activeSection} onSelect={handleSend} />}
            />

            {/* ── Suggested chips (after conversation started) ── */}
            {messages.length > 0 && messages.length < 4 && (
                <PromptChips section={activeSection} onSelect={handleSend} />
            )}

            {/* ── Input ──────────────────────────── */}
            <AIInput
                onSend={handleSend}
                onCommand={handleCommand}
                disabled={isTyping}
                accentColor="#38bdf8"
            />

            {/* ── Status bar ──────────────────────── */}
            <StatusBar status={status} activeSection={activeSection} msgCount={messages.length} />
        </div>
    )
}
