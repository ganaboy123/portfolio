import { useRef, useState } from 'react'
import { useCursor } from '@/hooks/useCursor'

interface AIInputProps {
    onSend: (text: string) => void
    disabled?: boolean
    accentColor?: string
}

/**
 * NOVA message input bar.
 * Enter to send, Shift+Enter for newline (future).
 * Glows on focus, disabled while assistant is typing.
 */
export function AIInput({ onSend, disabled = false, accentColor = '#38bdf8' }: AIInputProps) {
    const inputRef = useRef<HTMLInputElement>(null)
    const [value, setValue] = useState('')
    const [focused, setFocused] = useState(false)
    const cursor = useCursor()

    const handleSend = () => {
        const trimmed = value.trim()
        if (!trimmed || disabled) return
        onSend(trimmed)
        setValue('')
    }

    const canSend = value.trim().length > 0 && !disabled

    return (
        <div style={{
            display: 'flex', gap: 8, padding: '10px 12px',
            borderTop: '1px solid rgba(255,255,255,0.05)',
            background: 'rgba(0,0,0,0.2)',
            flexShrink: 0,
        }}>
            <div style={{
                flex: 1, position: 'relative',
                border: `1px solid ${focused ? accentColor + '44' : 'rgba(255,255,255,0.08)'}`,
                borderRadius: 'var(--radius-sm)',
                transition: 'border-color 180ms',
                boxShadow: focused ? `0 0 10px ${accentColor}10` : 'none',
            }}>
                <input
                    ref={inputRef}
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault()
                            handleSend()
                        }
                    }}
                    onFocus={() => { setFocused(true); cursor.set('text') }}
                    onBlur={() => { setFocused(false); cursor.reset() }}
                    placeholder={disabled ? 'NOVA is responding…' : 'Ask NOVA anything…'}
                    disabled={disabled}
                    aria-label="Message NOVA"
                    style={{
                        width: '100%',
                        background: 'rgba(6,8,16,0.8)',
                        border: 'none', outline: 'none',
                        borderRadius: 'var(--radius-sm)',
                        padding: '8px 10px',
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.72rem',
                        letterSpacing: '0.03em',
                        color: disabled ? 'var(--color-text-tertiary)' : 'var(--color-text-primary)',
                        cursor: 'text',
                        opacity: disabled ? 0.6 : 1,
                    }}
                />
            </div>

            <button
                onClick={handleSend}
                disabled={!canSend}
                onMouseEnter={() => cursor.set('hover', 'SEND')}
                onMouseLeave={cursor.reset}
                aria-label="Send message"
                style={{
                    width: 34, height: 34, flexShrink: 0,
                    borderRadius: 'var(--radius-sm)',
                    background: canSend ? `${accentColor}18` : 'rgba(255,255,255,0.04)',
                    border: `1px solid ${canSend ? accentColor + '45' : 'rgba(255,255,255,0.07)'}`,
                    color: canSend ? accentColor : 'var(--color-text-tertiary)',
                    cursor: canSend ? 'none' : 'not-allowed',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: 'var(--font-mono)', fontSize: '0.8rem',
                    transition: 'all 160ms',
                    opacity: canSend ? 1 : 0.45,
                    boxShadow: canSend ? `0 0 8px ${accentColor}15` : 'none',
                }}
            >
                ↑
            </button>
        </div>
    )
}
