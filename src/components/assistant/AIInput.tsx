import { useRef, useState, useEffect } from 'react'
import { useCursor } from '@/hooks/useCursor'

interface AIInputProps {
    onSend: (text: string) => void
    disabled?: boolean
    accentColor?: string
    onCommand?: (cmd: string) => void
}

// Slash commands
const SLASH_COMMANDS = [
    { cmd: '/projects', label: 'Show all projects' },
    { cmd: '/skills', label: 'List all skills' },
    { cmd: '/services', label: 'Show services & pricing' },
    { cmd: '/contact', label: 'Get contact info' },
    { cmd: '/experience', label: 'Show career history' },
    { cmd: '/joke', label: 'Tell me a joke' },
    { cmd: '/clear', label: 'Clear conversation' },
    { cmd: '/help', label: 'Show help' },
]

export function AIInput({ onSend, disabled = false, accentColor = '#38bdf8', onCommand }: AIInputProps) {
    const inputRef = useRef<HTMLInputElement>(null)
    const [value, setValue] = useState('')
    const [focused, setFocused] = useState(false)
    const [showCommands, setShowCommands] = useState(false)
    const [commandFilter, setCommandFilter] = useState('')
    const cursor = useCursor()

    useEffect(() => {
        if (value.startsWith('/')) {
            setShowCommands(true)
            setCommandFilter(value.slice(1).toLowerCase())
        } else {
            setShowCommands(false)
        }
    }, [value])

    const filteredCmds = SLASH_COMMANDS.filter(
        (c) => commandFilter === '' || c.cmd.slice(1).includes(commandFilter) || c.label.toLowerCase().includes(commandFilter)
    )

    const handleSend = () => {
        const trimmed = value.trim()
        if (!trimmed || disabled) return

        if (trimmed.startsWith('/')) {
            const match = SLASH_COMMANDS.find((c) => c.cmd === trimmed)
            if (match) {
                onCommand?.(trimmed)
                onSend(match.label) // send as natural language
            } else {
                onSend(trimmed.slice(1)) // strip slash and send
            }
            setValue('')
            setShowCommands(false)
            return
        }

        onSend(trimmed)
        setValue('')
    }

    const selectCommand = (cmd: typeof SLASH_COMMANDS[0]) => {
        setShowCommands(false)
        onCommand?.(cmd.cmd)
        onSend(cmd.label)
        setValue('')
        inputRef.current?.focus()
    }

    const charCount = value.length

    return (
        <div style={{ position: 'relative', flexShrink: 0 }}>
            {/* Slash command palette */}
            {showCommands && filteredCmds.length > 0 && (
                <div style={{
                    position: 'absolute', bottom: '100%', left: 12, right: 12,
                    background: 'rgba(5,7,17,0.98)',
                    border: `1px solid ${accentColor}30`,
                    borderRadius: 6,
                    marginBottom: 4,
                    overflow: 'hidden',
                    boxShadow: `0 -8px 24px rgba(0,0,0,0.5)`,
                    zIndex: 10,
                }}>
                    <div style={{
                        padding: '5px 10px 3px',
                        fontFamily: 'var(--font-mono)', fontSize: '0.46rem',
                        letterSpacing: '0.14em', color: 'rgba(255,255,255,0.3)',
                        borderBottom: '1px solid rgba(255,255,255,0.05)',
                    }}>COMMANDS</div>
                    {filteredCmds.map((c) => (
                        <button
                            key={c.cmd}
                            onMouseDown={(e) => { e.preventDefault(); selectCommand(c) }}
                            onMouseEnter={() => cursor.set('hover', c.cmd)}
                            onMouseLeave={cursor.reset}
                            style={{
                                width: '100%', textAlign: 'left',
                                padding: '8px 10px',
                                background: 'none',
                                border: 'none',
                                display: 'flex', alignItems: 'center', gap: 10,
                                cursor: 'none',
                                transition: 'background 100ms',
                            }}
                            onMouseOver={(e) => { (e.currentTarget as HTMLButtonElement).style.background = `${accentColor}10` }}
                            onMouseOut={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'none' }}
                        >
                            <span style={{
                                fontFamily: 'var(--font-mono)', fontSize: '0.65rem',
                                color: accentColor, letterSpacing: '0.06em', minWidth: 80,
                            }}>{c.cmd}</span>
                            <span style={{
                                fontFamily: 'var(--font-sans)', fontSize: '0.72rem',
                                color: 'var(--color-text-tertiary)',
                            }}>{c.label}</span>
                        </button>
                    ))}
                </div>
            )}

            {/* Input row */}
            <div style={{
                display: 'flex', gap: 8, padding: '10px 12px',
                borderTop: '1px solid rgba(255,255,255,0.05)',
                background: 'rgba(0,0,0,0.2)',
            }}>
                {/* Slash hint */}
                <div style={{
                    display: 'flex', alignItems: 'center',
                    fontFamily: 'var(--font-mono)', fontSize: '0.56rem',
                    color: focused ? `${accentColor}60` : 'rgba(255,255,255,0.12)',
                    transition: 'color 180ms', flexShrink: 0, paddingTop: 1,
                }}>/</div>

                <div style={{
                    flex: 1, position: 'relative',
                    border: `1px solid ${focused ? accentColor + '44' : 'rgba(255,255,255,0.08)'}`,
                    borderRadius: 'var(--radius-sm)',
                    transition: 'border-color 180ms, box-shadow 180ms',
                    boxShadow: focused ? `0 0 12px ${accentColor}12` : 'none',
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
                            if (e.key === 'Escape') {
                                setShowCommands(false)
                                setValue('')
                            }
                        }}
                        onFocus={() => { setFocused(true); cursor.set('text') }}
                        onBlur={() => { setFocused(false); cursor.reset(); setShowCommands(false) }}
                        placeholder={disabled ? 'NOVA is responding…' : 'Ask anything, or type / for commands…'}
                        disabled={disabled}
                        maxLength={500}
                        aria-label="Message NOVA"
                        autoComplete="off"
                        spellCheck={false}
                        style={{
                            width: '100%',
                            background: 'rgba(6,8,16,0.8)',
                            border: 'none', outline: 'none',
                            borderRadius: 'var(--radius-sm)',
                            padding: '8px 36px 8px 10px',
                            fontFamily: 'var(--font-mono)',
                            fontSize: '0.72rem',
                            letterSpacing: '0.03em',
                            color: disabled ? 'var(--color-text-tertiary)' : 'var(--color-text-primary)',
                            cursor: 'text',
                            opacity: disabled ? 0.6 : 1,
                            boxSizing: 'border-box',
                        }}
                    />
                    {/* Char count */}
                    {charCount > 200 && (
                        <span style={{
                            position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)',
                            fontFamily: 'var(--font-mono)', fontSize: '0.44rem',
                            color: charCount > 450 ? '#f87171' : 'rgba(255,255,255,0.2)',
                            letterSpacing: '0.06em',
                        }}>{500 - charCount}</span>
                    )}
                </div>

                {/* Send button */}
                <button
                    onClick={handleSend}
                    disabled={!value.trim() || disabled}
                    onMouseEnter={() => cursor.set('hover', 'SEND')}
                    onMouseLeave={cursor.reset}
                    aria-label="Send message"
                    style={{
                        width: 34, height: 34, flexShrink: 0,
                        borderRadius: 'var(--radius-sm)',
                        background: (value.trim() && !disabled) ? `${accentColor}18` : 'rgba(255,255,255,0.04)',
                        border: `1px solid ${(value.trim() && !disabled) ? accentColor + '45' : 'rgba(255,255,255,0.07)'}`,
                        color: (value.trim() && !disabled) ? accentColor : 'var(--color-text-tertiary)',
                        cursor: (value.trim() && !disabled) ? 'none' : 'not-allowed',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontFamily: 'var(--font-mono)', fontSize: '0.9rem',
                        transition: 'all 160ms',
                        opacity: (value.trim() && !disabled) ? 1 : 0.4,
                        boxShadow: (value.trim() && !disabled) ? `0 0 8px ${accentColor}15` : 'none',
                    }}
                >↑</button>
            </div>
        </div>
    )
}
