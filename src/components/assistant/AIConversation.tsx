import { useEffect, useRef } from 'react'
import type { Message } from '@/store/useAssistantStore'
import { AIMessage } from './AIMessage'

interface AIConversationProps {
    messages: Message[]
    isTyping: boolean
    accentColor?: string
    emptyState?: React.ReactNode
}

/**
 * Scrollable message thread with typing indicator.
 * Auto-scrolls to the latest message.
 */
export function AIConversation({
    messages,
    isTyping,
    accentColor = '#38bdf8',
    emptyState,
}: AIConversationProps) {
    const endRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        endRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages, isTyping])

    return (
        <div style={{
            flex: 1, overflowY: 'auto', minHeight: 0,
            padding: '14px 14px 8px',
            display: 'flex', flexDirection: 'column', gap: 10,
        }}>
            {messages.length === 0 && emptyState}

            {messages.map((msg) => (
                <AIMessage key={msg.id} message={msg} accentColor={accentColor} />
            ))}

            {/* Typing indicator */}
            {isTyping && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div aria-hidden style={{
                        width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
                        background: `radial-gradient(circle, ${accentColor}20 0%, transparent 70%)`,
                        border: `1px solid ${accentColor}30`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                        <div style={{ width: 6, height: 6, borderRadius: '50%', background: accentColor, opacity: 0.8 }} />
                    </div>
                    <div style={{
                        display: 'flex', gap: 4, alignItems: 'center',
                        padding: '9px 12px',
                        background: 'rgba(255,255,255,0.04)',
                        border: '1px solid rgba(255,255,255,0.07)',
                        borderRadius: '2px 10px 10px 10px',
                    }}>
                        {[0, 1, 2].map((i) => (
                            <div
                                key={i}
                                aria-hidden
                                style={{
                                    width: 5, height: 5, borderRadius: '50%',
                                    background: accentColor,
                                    opacity: 0.5,
                                    animation: 'typing-bounce 1.3s ease-in-out infinite',
                                    animationDelay: `${i * 0.18}s`,
                                }}
                            />
                        ))}
                    </div>
                    <span className="sr-only">NOVA is typing</span>
                </div>
            )}

            <div ref={endRef} />
        </div>
    )
}
