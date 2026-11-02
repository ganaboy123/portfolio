import { useEffect, useRef } from 'react'
import { gsap } from '@/lib/animation'
import type { Message } from '@/store/useAssistantStore'

interface AIMessageProps {
    message: Message
    accentColor?: string
}

/**
 * A single message bubble in the NOVA conversation.
 * Animates in on mount. Renders bold/newlines from response text.
 */
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

    // Parse **bold** and newlines
    const renderContent = (text: string) => {
        return text.split('\n').map((line, li) => {
            const parts = line.split(/(\*\*[^*]+\*\*)/g)
            const rendered = parts.map((part, pi) => {
                if (part.startsWith('**') && part.endsWith('**')) {
                    return (
                        <strong key={pi} style={{ color: 'var(--color-text-primary)', fontWeight: 500 }}>
                            {part.slice(2, -2)}
                        </strong>
                    )
                }
                return <span key={pi}>{part}</span>
            })
            return (
                <span key={li}>
                    {rendered}
                    {li < text.split('\n').length - 1 && <br />}
                </span>
            )
        })
    }

    return (
        <div
            ref={ref}
            style={{
                display: 'flex',
                justifyContent: isAssistant ? 'flex-start' : 'flex-end',
                gap: 8,
                alignItems: 'flex-start',
            }}
        >
            {/* NOVA avatar dot */}
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

            <div style={{
                maxWidth: '84%',
                padding: '9px 12px',
                borderRadius: isAssistant ? '2px 10px 10px 10px' : '10px 2px 10px 10px',
                background: isAssistant
                    ? 'rgba(255,255,255,0.04)'
                    : `${accentColor}12`,
                border: `1px solid ${isAssistant ? 'rgba(255,255,255,0.07)' : accentColor + '28'}`,
                fontSize: '0.82rem',
                color: isAssistant ? 'var(--color-text-secondary)' : accentColor,
                lineHeight: 1.65,
                fontFamily: 'var(--font-sans)',
                wordBreak: 'break-word',
            }}>
                {renderContent(message.content)}
                <div style={{
                    marginTop: 5,
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.46rem',
                    letterSpacing: '0.10em',
                    color: 'rgba(255,255,255,0.18)',
                    textAlign: isAssistant ? 'left' : 'right',
                }}>
                    {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
            </div>
        </div>
    )
}
