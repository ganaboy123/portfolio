import { useEffect, useRef, useState, useCallback } from 'react'
import { useDevice } from '@/hooks/useDevice'
import { gsap } from '@/lib/animation'
import { useScrollSection } from '@/hooks/useScrollSection'
import {
    personalInfo,
    profile,
    communicationChannels,
    PROJECT_TYPES,
    BUDGET_RANGES,
    TIMELINES,
    type ProjectType,
    type BudgetRange,
    type Timeline,
} from '@/data/content'
import { HUDLabel } from '@/components/ui/primitives/HUDLabel'
import { GlowLine } from '@/components/ui/primitives/GlowLine'
import { SectionMarker } from '@/components/ui/primitives/SectionMarker'
import { StatusIndicator } from '@/components/ui/primitives/StatusIndicator'
import { CommandButton } from '@/components/ui/primitives/CommandButton'
import { useCursor } from '@/hooks/useCursor'
import { useAudioFeedback } from '@/store/useAudioStore'

// ── Types ─────────────────────────────────────────────────────────────────────

interface FormValues {
    name: string
    email: string
    message: string
    projectType: ProjectType | ''
    budget: BudgetRange | ''
    timeline: Timeline | ''
}

interface FormErrors {
    name?: string
    email?: string
    message?: string
}

type SubmitPhase = 'idle' | 'encrypting' | 'establishing' | 'sent' | 'error'

// ── Validation ────────────────────────────────────────────────────────────────

function validate(values: FormValues): FormErrors {
    const errors: FormErrors = {}
    if (!values.name.trim()) errors.name = 'Name is required'
    if (!values.email.trim()) {
        errors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
        errors.email = 'Enter a valid email address'
    }
    if (!values.message.trim()) errors.message = 'Message is required'
    else if (values.message.trim().length < 20) errors.message = 'Message must be at least 20 characters'
    return errors
}

// ── Transmission sequence ─────────────────────────────────────────────────────

const TRANSMISSION_STEPS = [
    { phase: 'encrypting' as SubmitPhase, label: 'ENCRYPTING MESSAGE…', duration: 900 },
    { phase: 'establishing' as SubmitPhase, label: 'ESTABLISHING CHANNEL…', duration: 800 },
    { phase: 'sent' as SubmitPhase, label: 'TRANSMISSION COMPLETE', duration: 0 },
]

function TransmissionSequence({ phase }: { phase: SubmitPhase }) {
    const ref = useRef<HTMLDivElement>(null)
    const barRef = useRef<HTMLDivElement>(null)

    const activeStep = TRANSMISSION_STEPS.findIndex((s) => s.phase === phase)
    const progress = phase === 'sent' ? 100 : phase === 'establishing' ? 66 : phase === 'encrypting' ? 33 : 0

    useEffect(() => {
        if (ref.current) {
            gsap.fromTo(ref.current, { opacity: 0 }, { opacity: 1, duration: 0.3 })
        }
        if (barRef.current) {
            gsap.to(barRef.current, { width: `${progress}%`, duration: 0.6, ease: 'expo.out' })
        }
    }, [phase, progress])

    return (
        <div
            ref={ref}
            role="status"
            aria-live="polite"
            aria-label={`Transmission status: ${phase}`}
            style={{
                padding: '14px 18px',
                background: 'rgba(56,189,248,0.05)',
                border: '1px solid rgba(56,189,248,0.15)',
                borderRadius: 'var(--radius-sm)',
                marginTop: 8,
            }}
        >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                <div style={{
                    width: 6, height: 6, borderRadius: '50%',
                    background: phase === 'sent' ? '#34d399' : '#38bdf8',
                    boxShadow: `0 0 6px ${phase === 'sent' ? '#34d399' : '#38bdf8'}`,
                    animation: phase !== 'sent' ? 'pulse 1s ease-in-out infinite' : 'none',
                }} />
                <span style={{
                    fontFamily: 'var(--font-mono)', fontSize: '0.60rem',
                    letterSpacing: '0.18em',
                    color: phase === 'sent' ? '#34d399' : 'var(--color-accent-cyan)',
                }}>
                    {TRANSMISSION_STEPS[Math.max(0, activeStep)]?.label ?? 'TRANSMISSION COMPLETE'}
                </span>
            </div>

            {/* progress bar */}
            <div style={{
                height: 2, background: 'rgba(255,255,255,0.06)',
                borderRadius: 1, overflow: 'hidden', marginBottom: 10,
            }}>
                <div
                    ref={barRef}
                    style={{
                        height: '100%', width: '0%',
                        background: phase === 'sent'
                            ? 'linear-gradient(90deg, #34d399, #38bdf8)'
                            : '#38bdf8',
                        boxShadow: '0 0 6px rgba(56,189,248,0.6)',
                    }}
                />
            </div>

            {/* step indicators */}
            <div style={{ display: 'flex', gap: 8 }}>
                {TRANSMISSION_STEPS.map((s, i) => {
                    const done = i <= activeStep
                    return (
                        <div key={s.phase} style={{
                            display: 'flex', alignItems: 'center', gap: 5,
                        }}>
                            <div style={{
                                width: 5, height: 5, borderRadius: '50%',
                                background: done ? (phase === 'sent' ? '#34d399' : '#38bdf8') : 'rgba(255,255,255,0.1)',
                                transition: 'background 0.3s',
                            }} />
                            <span style={{
                                fontFamily: 'var(--font-mono)', fontSize: '0.44rem',
                                letterSpacing: '0.14em',
                                color: done ? 'rgba(56,189,248,0.7)' : 'var(--color-text-tertiary)',
                                textTransform: 'uppercase',
                            }}>
                                {s.phase.replace('-', ' ')}
                            </span>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

// ── Success state ─────────────────────────────────────────────────────────────

function TransmissionSuccess({ onReset }: { onReset: () => void }) {
    const ref = useRef<HTMLDivElement>(null)
    const cursor = useCursor()

    useEffect(() => {
        if (!ref.current) return
        const ctx = gsap.context(() => {
            const tl = gsap.timeline()
            tl.fromTo(ref.current, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.6, ease: 'expo.out' })
            tl.fromTo('[data-success-item]',
                { y: 12, opacity: 0 },
                { y: 0, opacity: 1, duration: 0.45, stagger: 0.10, ease: 'expo.out' }, '-=0.3')
        }, ref)
        return () => ctx.revert()
    }, [])

    return (
        <div
            ref={ref}
            role="alert"
            aria-live="assertive"
            style={{
                padding: '32px 28px',
                background: 'rgba(52,211,153,0.04)',
                border: '1px solid rgba(52,211,153,0.20)',
                borderRadius: 'var(--radius-md)',
                position: 'relative', overflow: 'hidden',
            }}
        >
            {/* Top shimmer */}
            <div aria-hidden style={{
                position: 'absolute', top: 0, left: 0, right: 0, height: 1,
                background: 'linear-gradient(90deg, transparent, rgba(52,211,153,0.5), transparent)',
            }} />

            {/* Corner brackets */}
            {[
                { top: 0, left: 0, d: 'M0 14 L0 0 L14 0' },
                { top: 0, right: 0, d: 'M0 0 L14 0 L14 14' },
                { bottom: 0, left: 0, d: 'M0 0 L0 14 L14 14' },
                { bottom: 0, right: 0, d: 'M14 0 L14 14 L0 14' },
            ].map(({ d, ...pos }, i) => (
                <svg key={i} aria-hidden width={14} height={14} style={{ position: 'absolute', ...pos as React.CSSProperties }}>
                    <path d={d} stroke="rgba(52,211,153,0.45)" strokeWidth={1} fill="none" />
                </svg>
            ))}

            <div data-success-item style={{ display: 'flex', justifyContent: 'center', marginBottom: 18 }}>
                <StatusIndicator status="online" showPing size="md" label="TRANSMISSION RECEIVED" />
            </div>

            <GlowLine color="cyan" animated style={{ marginBottom: 20 }} />

            <h3 data-success-item style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(1.25rem, 2vw, 1.5rem)',
                fontWeight: 300, letterSpacing: '-0.025em',
                color: 'var(--color-text-primary)',
                textAlign: 'center', marginBottom: 10,
            }}>
                Message Received
            </h3>

            <p data-success-item style={{
                fontFamily: 'var(--font-sans)', fontSize: '0.875rem',
                color: 'var(--color-text-secondary)', lineHeight: 1.7,
                textAlign: 'center', marginBottom: 24, maxWidth: 360, margin: '0 auto 24px',
            }}>
                Your transmission has been logged. A response will follow within 24–48 hours via the provided channel.
            </p>

            <div data-success-item style={{ display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <HUDLabel variant="dim" style={{ fontSize: '0.54rem' }}>CHANNEL OPEN</HUDLabel>
                    <div style={{ width: 4, height: 4, borderRadius: '50%', background: '#34d399', boxShadow: '0 0 4px #34d399' }} />
                    <HUDLabel variant="dim" style={{ fontSize: '0.54rem' }}>AWAITING RESPONSE</HUDLabel>
                </div>
            </div>

            <div data-success-item style={{ display: 'flex', justifyContent: 'center', marginTop: 20 }}>
                <CommandButton
                    variant="ghost" size="sm"
                    onClick={onReset}
                    onMouseEnter={() => cursor.set('hover', 'NEW MESSAGE')}
                    onMouseLeave={cursor.reset}
                >
                    SEND ANOTHER MESSAGE
                </CommandButton>
            </div>
        </div>
    )
}

// ── Form field ────────────────────────────────────────────────────────────────

interface FieldProps {
    id: string
    label: string
    value: string
    onChange: (v: string) => void
    error?: string
    placeholder?: string
    type?: string
    multiline?: boolean
    required?: boolean
    rows?: number
    onBlur?: () => void
}

function Field({ id, label, value, onChange, error, placeholder, type = 'text', multiline, required, rows = 5, onBlur: onBlurProp }: FieldProps) {
    const [focused, setFocused] = useState(false)
    const cursor = useCursor()

    const borderColor = error
        ? 'rgba(248,113,113,0.45)'
        : focused
            ? 'rgba(56,189,248,0.40)'
            : 'rgba(255,255,255,0.08)'

    const baseStyle: React.CSSProperties = {
        width: '100%',
        background: focused ? 'rgba(6,8,16,0.8)' : 'rgba(6,8,16,0.5)',
        border: `1px solid ${borderColor}`,
        borderRadius: 'var(--radius-sm)',
        padding: '10px 13px',
        fontFamily: 'var(--font-mono)',
        fontSize: '0.75rem',
        letterSpacing: '0.04em',
        color: 'var(--color-text-primary)',
        outline: 'none',
        transition: 'border-color 180ms, background 180ms, box-shadow 180ms',
        cursor: 'text',
        boxShadow: focused && !error ? '0 0 0 1px rgba(56,189,248,0.08), 0 0 12px rgba(56,189,248,0.06)' : 'none',
        resize: multiline ? 'vertical' as const : 'none' as const,
        minHeight: multiline ? rows * 22 + 24 : undefined,
    }

    return (
        <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                <label
                    htmlFor={id}
                    style={{
                        fontFamily: 'var(--font-mono)', fontSize: '0.56rem',
                        letterSpacing: '0.18em', textTransform: 'uppercase',
                        color: error ? '#f87171' : focused ? 'var(--color-accent-cyan)' : 'rgba(74,83,112,0.7)',
                        transition: 'color 180ms',
                        display: 'flex', alignItems: 'center', gap: 5,
                    }}
                >
                    {required && (
                        <span style={{ width: 4, height: 4, borderRadius: '50%', background: error ? '#f87171' : 'currentColor', flexShrink: 0 }} />
                    )}
                    {label}
                </label>
                {error && (
                    <span
                        role="alert"
                        style={{
                            fontFamily: 'var(--font-mono)', fontSize: '0.52rem',
                            letterSpacing: '0.08em', color: '#f87171',
                        }}
                    >
                        {error}
                    </span>
                )}
            </div>

            {multiline ? (
                <textarea
                    id={id}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder}
                    aria-required={required}
                    aria-invalid={!!error}
                    aria-describedby={error ? `${id}-error` : undefined}
                    rows={rows}
                    onFocus={() => { setFocused(true); cursor.set('text') }}
                    onBlur={() => { setFocused(false); cursor.reset(); onBlurProp?.() }}
                    style={baseStyle}
                />
            ) : (
                <input
                    id={id}
                    type={type}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder}
                    aria-required={required}
                    aria-invalid={!!error}
                    aria-describedby={error ? `${id}-error` : undefined}
                    onFocus={() => { setFocused(true); cursor.set('text') }}
                    onBlur={() => { setFocused(false); cursor.reset(); onBlurProp?.() }}
                    style={baseStyle}
                />
            )}
        </div>
    )
}

// ── Select field ──────────────────────────────────────────────────────────────

interface SelectFieldProps {
    id: string
    label: string
    value: string
    onChange: (v: string) => void
    options: Record<string, string>
    placeholder?: string
}

function SelectField({ id, label, value, onChange, options, placeholder = 'SELECT…' }: SelectFieldProps) {
    const [focused, setFocused] = useState(false)
    const cursor = useCursor()

    return (
        <div>
            <label
                htmlFor={id}
                style={{
                    display: 'block', marginBottom: 6,
                    fontFamily: 'var(--font-mono)', fontSize: '0.56rem',
                    letterSpacing: '0.18em', textTransform: 'uppercase',
                    color: focused ? 'var(--color-accent-cyan)' : 'rgba(74,83,112,0.7)',
                    transition: 'color 180ms',
                }}
            >
                {label}
            </label>
            <select
                id={id}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                onFocus={() => { setFocused(true); cursor.set('text') }}
                onBlur={() => { setFocused(false); cursor.reset() }}
                style={{
                    width: '100%',
                    background: 'rgba(6,8,16,0.6)',
                    border: `1px solid ${focused ? 'rgba(56,189,248,0.35)' : 'rgba(255,255,255,0.08)'}`,
                    borderRadius: 'var(--radius-sm)',
                    padding: '10px 13px',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.72rem',
                    letterSpacing: '0.04em',
                    color: value ? 'var(--color-text-primary)' : 'var(--color-text-tertiary)',
                    outline: 'none',
                    cursor: 'pointer',
                    transition: 'border-color 180ms',
                    appearance: 'none',
                    WebkitAppearance: 'none',
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' fill='none'%3E%3Cpath d='M1 1l4 4 4-4' stroke='rgba(56,189,248,0.4)' stroke-width='1.5' stroke-linecap='round'/%3E%3C/svg%3E")`,
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right 12px center',
                    paddingRight: 32,
                }}
            >
                <option value="" disabled>{placeholder}</option>
                {Object.entries(options).map(([k, v]) => (
                    <option key={k} value={k} style={{ background: '#0a0d18', color: '#e2e8f0' }}>{v}</option>
                ))}
            </select>
        </div>
    )
}

// ── Communication channel node ────────────────────────────────────────────────

function ChannelNode({ channel }: { channel: typeof communicationChannels[number] }) {
    const [hovered, setHovered] = useState(false)
    const nodeRef = useRef<HTMLAnchorElement>(null)
    const cursor = useCursor()

    const handleEnter = () => {
        setHovered(true)
        cursor.set('hover', channel.label)
        gsap.to(nodeRef.current, { y: -4, duration: 0.35, ease: 'expo.out' })
    }
    const handleLeave = () => {
        setHovered(false)
        cursor.reset()
        gsap.to(nodeRef.current, { y: 0, duration: 0.4, ease: 'expo.out' })
    }

    return (
        <a
            ref={nodeRef}
            href={channel.url}
            target={channel.id !== 'email' ? '_blank' : undefined}
            rel="noopener noreferrer"
            onMouseEnter={handleEnter}
            onMouseLeave={handleLeave}
            aria-label={`${channel.label} — ${channel.description}`}
            style={{
                display: 'flex', flexDirection: 'column', gap: 10,
                padding: '16px 18px',
                background: hovered ? `${channel.color}0a` : 'rgba(255,255,255,0.02)',
                border: `1px solid ${hovered ? channel.color + '30' : 'rgba(255,255,255,0.07)'}`,
                borderRadius: 'var(--radius-sm)',
                textDecoration: 'none',
                cursor: 'none',
                transition: 'border-color 250ms, background 250ms',
                position: 'relative', overflow: 'hidden',
            }}
        >
            {/* Top edge glow on hover */}
            <div aria-hidden style={{
                position: 'absolute', top: 0, left: 0, right: 0, height: 1,
                background: `linear-gradient(90deg, transparent, ${channel.color}60, transparent)`,
                opacity: hovered ? 1 : 0, transition: 'opacity 250ms',
            }} />

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{
                        width: 8, height: 8, borderRadius: '50%',
                        background: channel.color,
                        boxShadow: hovered ? `0 0 8px ${channel.color}` : 'none',
                        transition: 'box-shadow 250ms',
                        flexShrink: 0,
                    }} />
                    <span style={{
                        fontFamily: 'var(--font-mono)', fontSize: '0.64rem',
                        letterSpacing: '0.14em', textTransform: 'uppercase',
                        color: hovered ? channel.color : 'var(--color-text-secondary)',
                        transition: 'color 250ms',
                    }}>
                        {channel.label}
                    </span>
                </div>
                <span style={{
                    fontFamily: 'var(--font-mono)', fontSize: '0.58rem',
                    color: hovered ? channel.color : 'var(--color-text-tertiary)',
                    transition: 'color 250ms, transform 250ms',
                    transform: hovered ? 'translateX(2px)' : 'none',
                }}>
                    →
                </span>
            </div>

            <span style={{
                fontFamily: 'var(--font-mono)', fontSize: '0.58rem',
                letterSpacing: '0.06em',
                color: hovered ? `${channel.color}cc` : 'var(--color-text-tertiary)',
                transition: 'color 250ms',
                wordBreak: 'break-all',
            }}>
                {channel.handle}
            </span>

            <span style={{
                fontFamily: 'var(--font-sans)', fontSize: '0.72rem',
                color: 'var(--color-text-tertiary)',
                lineHeight: 1.4,
            }}>
                {channel.description}
            </span>
        </a>
    )
}

// ── Main ContactSection ───────────────────────────────────────────────────────

export function ContactSection() {
    const sectionRef = useScrollSection('contact')
    const headRef = useRef<HTMLDivElement>(null)
    const formColRef = useRef<HTMLDivElement>(null)
    const channelsRef = useRef<HTMLDivElement>(null)
    const audio = useAudioFeedback()
    const { isMobile } = useDevice()

    const [values, setValues] = useState<FormValues>({
        name: '', email: '', message: '',
        projectType: '', budget: '', timeline: '',
    })
    const [errors, setErrors] = useState<FormErrors>({})
    const [touched, setTouched] = useState<Partial<Record<keyof FormValues, boolean>>>({})
    const [submitPhase, setSubmitPhase] = useState<SubmitPhase>('idle')

    const set = useCallback(<K extends keyof FormValues>(key: K, val: FormValues[K]) => {
        setValues((v) => ({ ...v, [key]: val }))
        if (touched[key]) {
            setErrors((e) => ({ ...e, [key]: validate({ ...values, [key]: val })[key as keyof FormErrors] }))
        }
    }, [values, touched])

    const handleBlur = (key: keyof FormValues) => {
        setTouched((t) => ({ ...t, [key]: true }))
        setErrors((e) => ({ ...e, [key]: validate(values)[key as keyof FormErrors] }))
    }

    // Entrance animations
    useEffect(() => {
        const ctx = gsap.context(() => {
            const st = { trigger: headRef.current, scroller: '#main-scroll', start: 'top 70%', once: true }
            gsap.fromTo(headRef.current, { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.9, ease: 'expo.out', scrollTrigger: st })
            gsap.fromTo(formColRef.current, { y: 22, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, ease: 'expo.out', delay: 0.15, scrollTrigger: st })
            gsap.fromTo(channelsRef.current ? Array.from(channelsRef.current.children) : [],
                { y: 14, opacity: 0 },
                { y: 0, opacity: 1, duration: 0.5, stagger: 0.08, ease: 'expo.out', delay: 0.3, scrollTrigger: st })
        })
        return () => ctx.revert()
    }, [])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        const allTouched = { name: true, email: true, message: true }
        setTouched(allTouched)
        const errs = validate(values)
        setErrors(errs)
        if (Object.keys(errs).length > 0) {
            audio.error()
            return
        }

        // ── Transmission sequence ─────────────────
        setSubmitPhase('encrypting')
        await sleep(900)
        setSubmitPhase('establishing')
        await sleep(800)

        // Replace this block with your real endpoint:
        // try {
        //   await fetch('/api/contact', { method: 'POST', body: JSON.stringify(values), headers: { 'Content-Type': 'application/json' } })
        //   setSubmitPhase('sent')
        //   audio.confirm()
        // } catch {
        //   setSubmitPhase('error')
        //   audio.error()
        // }
        audio.confirm()
        setSubmitPhase('sent')
    }

    const handleReset = () => {
        setValues({ name: '', email: '', message: '', projectType: '', budget: '', timeline: '' })
        setErrors({})
        setTouched({})
        setSubmitPhase('idle')
    }

    const isSubmitting = submitPhase === 'encrypting' || submitPhase === 'establishing'
    const isComplete = submitPhase === 'sent'

    const availColor = profile.availability === 'open' ? '#34d399' : profile.availability === 'limited' ? '#fbbf24' : '#f87171'
    const availLabel = profile.availability === 'open' ? 'AVAILABLE FOR WORK' : profile.availability === 'limited' ? 'LIMITED AVAILABILITY' : 'NOT AVAILABLE'

    return (
        <section
            ref={sectionRef as React.RefObject<HTMLElement>}
            id="contact"
            style={{
                minHeight: '100vh',
                display: 'flex', alignItems: 'center',
                padding: isMobile
                    ? 'clamp(80px,10vw,100px) 16px clamp(80px,10vw,100px)'
                    : 'clamp(80px,8vw,100px) clamp(60px,8vw,120px) clamp(80px,8vw,100px) clamp(100px,10vw,160px)',
                position: 'relative',
                zIndex: 'var(--z-sections)' as unknown as number,
                background: 'radial-gradient(ellipse 70% 55% at 60% 40%, rgba(220,60,120,0.14) 0%, transparent 55%), radial-gradient(ellipse 60% 45% at 15% 80%, rgba(180,40,180,0.10) 0%, transparent 55%), linear-gradient(180deg, #150511 0%, #190714 100%)',
            }}
        >
            <div style={{ width: '100%', maxWidth: isMobile ? '100%' : 1000 }}>

                {/* ── Header ────────────────────────── */}
                <div ref={headRef} style={{ marginBottom: 48 }}>
                    <GlowLine color="cyan" animated length="120px" style={{ marginBottom: 20 }} />
                    <SectionMarker index="06" label="COMMUNICATION CHANNEL" sublabel="STATUS: OPEN" active />

                    <div style={{
                        display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between',
                        flexWrap: 'wrap', gap: 16, marginTop: 24, marginBottom: 8,
                    }}>
                        <div>
                            <h2 style={{
                                fontFamily: 'var(--font-display)',
                                fontSize: 'clamp(1.875rem, 4vw, 3rem)',
                                fontWeight: 300, letterSpacing: '-0.03em',
                                color: 'var(--color-text-primary)', lineHeight: 1.1, marginBottom: 8,
                            }}>
                                Initialize Transmission
                            </h2>
                            <p style={{
                                fontFamily: 'var(--font-sans)', fontSize: '0.875rem',
                                color: 'var(--color-text-secondary)', lineHeight: 1.65, maxWidth: 460,
                            }}>
                                Send a message or connect through any available channel. All transmissions are responded to within 24–48 hours.
                            </p>
                        </div>

                        {/* Status badge */}
                        <div style={{
                            display: 'flex', alignItems: 'center', gap: 10,
                            padding: '10px 16px',
                            background: `${availColor}0a`,
                            border: `1px solid ${availColor}25`,
                            borderRadius: 'var(--radius-sm)',
                            flexShrink: 0,
                        }}>
                            <div style={{
                                width: 7, height: 7, borderRadius: '50%',
                                background: availColor,
                                boxShadow: `0 0 6px ${availColor}`,
                                animation: profile.availability === 'open' ? 'pulse 2s ease-in-out infinite' : 'none',
                            }} />
                            <HUDLabel style={{ fontSize: '0.58rem', letterSpacing: '0.18em', color: availColor }}>
                                {availLabel}
                            </HUDLabel>
                        </div>
                    </div>
                </div>

                {/* ── Layout ────────────────────────── */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: isMobile ? '1fr' : 'minmax(0,1.4fr) minmax(0,1fr)',
                    gap: 28, alignItems: 'start',
                }}>

                    {/* ── Form column ───────────────── */}
                    <div ref={formColRef}>
                        {isComplete ? (
                            <TransmissionSuccess onReset={handleReset} />
                        ) : (
                            <div style={{
                                background: 'rgba(10,13,24,0.80)',
                                border: '1px solid rgba(255,255,255,0.07)',
                                borderRadius: 'var(--radius-md)',
                                overflow: 'hidden',
                                backdropFilter: 'blur(12px)',
                                WebkitBackdropFilter: 'blur(12px)',
                                position: 'relative',
                            }}>
                                {/* Top shimmer */}
                                <div aria-hidden style={{
                                    position: 'absolute', top: 0, left: 0, right: 0, height: 1,
                                    background: 'linear-gradient(90deg, transparent, rgba(56,189,248,0.35), transparent)',
                                }} />

                                {/* Form header bar */}
                                <div style={{
                                    padding: '12px 20px',
                                    borderBottom: '1px solid rgba(255,255,255,0.05)',
                                    display: 'flex', alignItems: 'center', gap: 12,
                                    background: 'rgba(56,189,248,0.03)',
                                }}>
                                    <StatusIndicator status="online" showPing size="sm" />
                                    <HUDLabel variant="cyan" style={{ fontSize: '0.58rem', letterSpacing: '0.20em', flex: 1 }}>
                                        NEW TRANSMISSION
                                    </HUDLabel>
                                    <HUDLabel variant="dim" style={{ fontSize: '0.50rem' }}>
                                        {personalInfo.email}
                                    </HUDLabel>
                                </div>

                                <form
                                    onSubmit={handleSubmit}
                                    noValidate
                                    aria-label="Contact form"
                                    style={{ padding: '22px 20px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}
                                >
                                    {/* Name + Email row */}
                                    <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 12 }}>
                                        <Field
                                            id="contact-name"
                                            label="NAME"
                                            value={values.name}
                                            onChange={(v) => set('name', v)}
                                            error={errors.name}
                                            placeholder="Your name"
                                            required
                                            onBlur={() => handleBlur('name')}
                                        />
                                        <Field
                                            id="contact-email"
                                            label="EMAIL"
                                            type="email"
                                            value={values.email}
                                            onChange={(v) => set('email', v)}
                                            error={errors.email}
                                            placeholder="your@email.com"
                                            required
                                            onBlur={() => handleBlur('email')}
                                        />
                                    </div>

                                    {/* Message */}
                                    <Field
                                        id="contact-message"
                                        label="MESSAGE"
                                        value={values.message}
                                        onChange={(v) => set('message', v)}
                                        error={errors.message}
                                        placeholder="Describe your project or inquiry…"
                                        multiline
                                        required
                                        rows={5}
                                        onBlur={() => handleBlur('message')}
                                    />

                                    {/* Optional fields */}
                                    <div style={{
                                        paddingTop: 12, borderTop: '1px solid rgba(255,255,255,0.05)',
                                        display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr 1fr', gap: 12,
                                    }}>
                                        <SelectField
                                            id="contact-project-type"
                                            label="PROJECT TYPE"
                                            value={values.projectType}
                                            onChange={(v) => set('projectType', v as ProjectType)}
                                            options={PROJECT_TYPES}
                                            placeholder="SELECT TYPE"
                                        />
                                        <SelectField
                                            id="contact-budget"
                                            label="BUDGET RANGE"
                                            value={values.budget}
                                            onChange={(v) => set('budget', v as BudgetRange)}
                                            options={BUDGET_RANGES}
                                            placeholder="SELECT RANGE"
                                        />
                                        <SelectField
                                            id="contact-timeline"
                                            label="TIMELINE"
                                            value={values.timeline}
                                            onChange={(v) => set('timeline', v as Timeline)}
                                            options={TIMELINES}
                                            placeholder="SELECT"
                                        />
                                    </div>

                                    {/* Transmission sequence */}
                                    {isSubmitting && <TransmissionSequence phase={submitPhase} />}

                                    {/* Error summary */}
                                    {submitPhase === 'error' && (
                                        <div role="alert" style={{
                                            padding: '10px 14px',
                                            background: 'rgba(248,113,113,0.07)',
                                            border: '1px solid rgba(248,113,113,0.25)',
                                            borderRadius: 'var(--radius-sm)',
                                            fontFamily: 'var(--font-mono)', fontSize: '0.62rem',
                                            letterSpacing: '0.08em', color: '#f87171',
                                        }}>
                                            TRANSMISSION FAILED — Please try again or email directly at {personalInfo.email}
                                        </div>
                                    )}

                                    {/* Submit */}
                                    <div style={{
                                        display: 'flex', alignItems: 'center',
                                        justifyContent: 'space-between', flexWrap: 'wrap', gap: 12,
                                        paddingTop: 8,
                                    }}>
                                        <HUDLabel variant="dim" style={{ fontSize: '0.52rem' }}>
                                            * REQUIRED FIELDS
                                        </HUDLabel>
                                        <CommandButton
                                            variant="primary"
                                            size="md"
                                            type="submit"
                                            loading={isSubmitting}
                                            disabled={isSubmitting}
                                        >
                                            INITIALIZE TRANSMISSION ↑
                                        </CommandButton>
                                    </div>
                                </form>
                            </div>
                        )}
                    </div>

                    {/* ── Channels column ───────────── */}
                    <div className="contact-communication" style={{ display: 'none' }}>

                        {/* Section label */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                            <HUDLabel variant="dim" style={{ fontSize: '0.56rem', letterSpacing: '0.20em' }}>
                                COMMUNICATION NODES
                            </HUDLabel>
                            <GlowLine color="dim" style={{ flex: 1 }} />
                        </div>

                        {/* Channel nodes */}
                        <div ref={channelsRef} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                            {communicationChannels.map((ch) => (
                                <ChannelNode key={ch.id} channel={ch} />
                            ))}
                        </div>

                        {/* Location block */}
                        <div style={{
                            marginTop: 4, padding: '14px 18px',
                            background: 'rgba(255,255,255,0.02)',
                            border: '1px solid rgba(255,255,255,0.07)',
                            borderRadius: 'var(--radius-sm)',
                        }}>
                            <HUDLabel variant="dim" style={{ display: 'block', marginBottom: 8, fontSize: '0.54rem', letterSpacing: '0.20em' }}>
                                LOCATION
                            </HUDLabel>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#38bdf8', boxShadow: '0 0 4px #38bdf8', flexShrink: 0 }} />
                                <span style={{
                                    fontFamily: 'var(--font-mono)', fontSize: '0.68rem',
                                    letterSpacing: '0.08em', color: 'var(--color-text-secondary)',
                                }}>
                                    {personalInfo.location}
                                </span>
                            </div>
                            <HUDLabel variant="dim" style={{ display: 'block', marginTop: 8, fontSize: '0.50rem' }}>
                                AVAILABLE FOR REMOTE · OPEN TO RELOCATION
                            </HUDLabel>
                        </div>

                        {/* Response time */}
                        <div style={{
                            padding: '14px 18px',
                            background: 'rgba(56,189,248,0.03)',
                            border: '1px solid rgba(56,189,248,0.10)',
                            borderRadius: 'var(--radius-sm)',
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                                <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#34d399', animation: 'pulse 2s ease-in-out infinite' }} />
                                <HUDLabel variant="dim" style={{ fontSize: '0.54rem', letterSpacing: '0.18em' }}>
                                    RESPONSE TIME
                                </HUDLabel>
                            </div>
                            <span style={{
                                fontFamily: 'var(--font-display)', fontSize: '1.25rem',
                                fontWeight: 300, letterSpacing: '-0.02em',
                                color: 'var(--color-text-primary)',
                            }}>
                                24–48h
                            </span>
                            <HUDLabel variant="dim" style={{ display: 'block', marginTop: 2, fontSize: '0.50rem' }}>
                                TYPICAL REPLY WINDOW
                            </HUDLabel>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function sleep(ms: number) {
    return new Promise<void>((resolve) => setTimeout(resolve, ms))
}
