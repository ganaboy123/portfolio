import { useEffect, useRef } from 'react'
import { gsap } from '@/lib/animation'
import type { Message, MessageAction } from '@/store/useAssistantStore'
import { useAppStore, type SectionId } from '@/store/useAppStore'
import { useCursor } from '@/hooks/useCursor'

interface AIMessageProps {
    message: Message
    accentColor?: string
}

// ── Inline markdown renderer ──────────────────────────────────────────────────
function RenderContent({ text, isAssistant }: { text: string; isAssistant: boolean }) {
    const lines = text.split('\n')
    const elements: React.ReactNode[] = []
    let i = 0

    while (i < lines.length) {
        const line = lines[i]

        // Code block
        if (line.trim().startsWith('```')) {
            const lang = line.trim().slice(3).trim()
            const codeLines: string[] = []
            i++
            while (i < lines.length && !lines[i].trim().startsWith('```')) {
                codeLines.push(lines[i])
                i++
            }
            elements.push(
                <div key={`code-${i}`} style={{
                    margin: '8px 0',
                    background: 'rgba(0,0,0,0.4)',
                    border: '1px solid rgba(56,189,248,0.15)',
                    borderRadius: 4,
                    overflow: 'hidden',
                }}>
                    {lang && (
                        <div style={{
                            padding: '3px 10px',
                            background: 'rgba(56,189,248,0.08)',
                            borderBottom: '1px solid rgba(56,189,248,0.10)',
                            fontFamily: 'var(--font-mono)',
                            fontSize: '0.50rem',
                            letterSpacing: '0.12em',
                            color: '#38bdf8',
                        }}>{lang.toUpperCase()}</div>
                    )}
                    <pre style={{
                        margin: 0, padding: '10px 12px',
                        fontFamily: 'var(--font-mono)', fontSize: '0.70rem',
                        color: '#e2e8f0', lineHeight: 1.6,
                        overflowX: 'auto', whiteSpace: 'pre',
                    }}>
                        {codeLines.join('\n')}
                    </pre>
                </div>
            )
            i++
            continue
        }

        // Bullet list items
        if (line.trim().startsWith('· ') || line.trim().startsWith('• ')) {
            elements.push(
                <div key={`li-${i}`} style={{
                    display: 'flex', gap: 8, marginBottom: 3,
                    paddingLeft: 4,
                }}>
                    <span style={{ color: '#38bdf8', flexShrink: 0, marginTop: 1 }}>·</span>
                    <span>{renderInline(line.trim().slice(2))}</span>
                </div>
            )
            i++
            continue
        }

        // Empty line → spacer
        if (line.trim() === '') {
            elements.push(<div key={`sp-${i}`} style={{ height: 6 }} />)
            i++
            continue
        }

        // Regular paragraph
        elements.push(
            <p key={`p-${i}`} style={{ margin: 0, lineHeight: 1.65 }}>
                {renderInline(line)}
            </p>
        )
        i++
    }

    return <div style={{ fontSize: '0.82rem', color: isAssistant ? 'var(--color-text-secondary)' : '#38bdf8' }}>{elements}</div>
}

function renderInline(text: string): React.ReactNode[] {
    // Split on **bold**, `code`, and URLs
    const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g)
    return parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) {
            return <strong key={i} style={{ color: 'var(--color-text-primary)', fontWeight: 600 }}>{part.slice(2, -2)}</strong>
        }
        if (part.startsWith('`') && part.endsWith('`')) {
            return (
                <code key={i} style={{
                    fontFamily: 'var(--font-mono)', fontSize: '0.78em',
                    background: 'rgba(56,189,248,0.10)',
                    border: '1px solid rgba(56,189,248,0.18)',
                    borderRadius: 3, padding: '1px 5px',
                    color: '#7dd3fc',
                }}>{part.slice(1, -1)}</code>
            )
        }
        return <span key={i}>{part}</span>
    })
}

// ── Action button ─────────────────────────────────────────────────────────────
function ActionButton({ action, accentColor }: { action: MessageAction; accentColor: string }) {
    const setSection = useAppStore((s) => s.setActiveSection)
    const cursor = useCursor()

    const handleClick = () => {
        if (action.type === 'navigate') {
            setSection(action.value as SectionId)
            // Scroll to section
            const el = document.getElementById(action.value)
            if (el) el.scrollIntoView({ behavior: 'smooth' })
        } else if (action.type === 'link') {
            window.open(action.value, '_blank', 'noopener,noreferrer')
        } else if (action.type === 'copy') {
            navigator.clipboard.writeText(action.value).catch(() => { })
        }
    }

    return (
        <button
            onClick={handleClick}
            onMouseEnter={() => cursor.set('hover', action.label)}
            onMouseLeave={cursor.reset}
            style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.50rem',
                letterSpacing: '0.12em',
                padding: '4px 10px',
                background: `${accentColor}10`,
                border: `1px solid ${accentColor}35`,
                borderRadius: 3,
                color: accentColor,
                cursor: 'none',
                transition: 'background 150ms, border-color 150ms',
                display: 'flex',
                alignItems: 'center',
                gap: 5,
                whiteSpace: 'nowrap',
            }}
        >
            {action.type === 'link' && <span style={{ opacity: 0.7 }}>↗</span>}
            {action.type === 'navigate' && <span style={{ opacity: 0.7 }}>→</span>}
            {action.type === 'copy' && <span style={{ opacity: 0.7 }}>⎘</span>}
            {action.label}
        </button>
    )
}

// ── Main message component ────────────────────────────────────────────────────
export function AIMessage({ message, accentColor = '#38bdf8' }: AIMessageProps) {
    const ref = useRef<HTMLDivElement>(null)
    const isAssistant = message.role === 'assistant'

    useEffect(() => {
        if (!ref.current) return
        gsap.fromTo(ref.current,
            { opacity: 0, y: isAssistant ? 8 : -4, scale: 0.97 },
            { opacity: 1, y: 0, scale: 1, duration: 0.35, ease: 'expo.out' },
        )
    }, [isAssistant])

    return (
        <div ref={ref} style={{ display: 'flex', justifyContent: isAssistant ? 'flex-start' : 'flex-end', gap: 8, alignItems: 'flex-start' }}>
            {/* NOVA avatar */}
            {isAssistant && (
                <div aria-hidden style={{
                    width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
                    background: `radial-gradient(circle, ${accentColor}25 0%, transparent 70%)`,
                    border: `1px solid ${accentColor}35`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    marginTop: 2,
                }}>
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: accentColor, opacity: 0.9 }} />
                </div>
            )}

            <div style={{ maxWidth: '88%', display: 'flex', flexDirection: 'column', gap: 6 }}>
                {/* Bubble */}
                <div style={{
                    padding: '10px 13px',
                    borderRadius: isAssistant ? '2px 10px 10px 10px' : '10px 2px 10px 10px',
                    background: isAssistant ? 'rgba(255,255,255,0.04)' : `${accentColor}12`,
                    border: `1px solid ${isAssistant ? 'rgba(255,255,255,0.07)' : accentColor + '28'}`,
                    wordBreak: 'break-word',
                    fontFamily: 'var(--font-sans)',
                }}>
                    <RenderContent text={message.content} isAssistant={isAssistant} />

                    <div style={{
                        marginTop: 6,
                        fontFamily: 'var(--font-mono)', fontSize: '0.44rem',
                        letterSpacing: '0.10em',
                        color: 'rgba(255,255,255,0.18)',
                        textAlign: isAssistant ? 'left' : 'right',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                    }}>
                        <span>{new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        {message.metadata?.isWeb && <span style={{ color: '#34d399' }}>◈ WEB</span>}
                        {message.metadata?.intent && <span style={{ opacity: 0.5 }}>{message.metadata.intent.replace(/_/g, ' ').toUpperCase()}</span>}
                    </div>
                </div>

                {/* Action buttons */}
                {isAssistant && message.actions && message.actions.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, paddingLeft: 2 }}>
                        {message.actions.map((action, i) => (
                            <ActionButton key={i} action={action} accentColor={accentColor} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
