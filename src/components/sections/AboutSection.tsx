import { useEffect, useRef, useState } from 'react'
import { gsap } from '@/lib/animation'
import { useScrollSection } from '@/hooks/useScrollSection'
import { personalInfo, profile } from '@/data/content'
import { HUDLabel } from '@/components/ui/primitives/HUDLabel'
import { GlowLine } from '@/components/ui/primitives/GlowLine'
import { GlassPanel } from '@/components/ui/primitives/GlassPanel'
import { SectionMarker } from '@/components/ui/primitives/SectionMarker'
import { CoordinateLabel } from '@/components/ui/primitives/CoordinateLabel'
import { StatusIndicator } from '@/components/ui/primitives/StatusIndicator'
import { TechBadge } from '@/components/ui/primitives/TechBadge'
import { OrbitalIndicator } from '@/components/ui/primitives/OrbitalIndicator'
import { useDevice } from '@/hooks/useDevice'

// ── Animated stat counter ─────────────────────────────────────────────────────

function StatCounter({
    value, label, unit, delay = 0, triggered,
}: {
    value: string; label: string; unit: string; delay?: number; triggered: boolean
}) {
    const numRef = useRef<HTMLSpanElement>(null)
    const hasPlus = value.endsWith('+')
    const numeric = parseInt(value.replace('+', ''), 10)

    useEffect(() => {
        if (!triggered || !numRef.current) return
        const el = numRef.current
        const obj = { val: 0 }
        gsap.fromTo(obj, { val: 0 }, {
            val: numeric, duration: 1.6, delay, ease: 'power2.out',
            onUpdate: () => { el.textContent = Math.round(obj.val) + (hasPlus ? '+' : '') },
        })
    }, [triggered, numeric, hasPlus, delay])

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                <span
                    ref={numRef}
                    style={{
                        fontFamily: 'var(--font-display)',
                        fontSize: 'clamp(1.75rem, 3.5vw, 2.5rem)',
                        fontWeight: 300,
                        letterSpacing: '-0.03em',
                        color: 'var(--color-text-primary)',
                        lineHeight: 1,
                    }}
                >
                    0{hasPlus ? '+' : ''}
                </span>
                <HUDLabel variant="cyan" style={{ fontSize: '0.56rem', letterSpacing: '0.20em' }}>
                    {unit}
                </HUDLabel>
            </div>
            <HUDLabel variant="dim" style={{ fontSize: '0.58rem', letterSpacing: '0.16em' }}>
                {label}
            </HUDLabel>
        </div>
    )
}

// ── System Profile panel ──────────────────────────────────────────────────────

function SystemProfile() {
    const rows = [
        { key: 'ROLE', value: profile.role },
        { key: 'SPECIALIZATION', value: profile.specialization },
        { key: 'LOCATION', value: profile.location },
        { key: 'CURRENT FOCUS', value: profile.currentFocus },
        { key: 'AVAILABILITY', value: profile.availability === 'open' ? 'OPEN TO WORK' : profile.availability.toUpperCase() },
    ]

    return (
        <GlassPanel variant="elevated" corners glow="violet" style={{ padding: '20px 22px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                <OrbitalIndicator size="sm" progress={1} color="violet" spin />
                <div>
                    <HUDLabel variant="violet" style={{ display: 'block', fontSize: '0.58rem', letterSpacing: '0.20em' }}>
                        SYSTEM PROFILE
                    </HUDLabel>
                    <HUDLabel variant="dim" style={{ fontSize: '0.52rem' }}>NODE / OPERATOR DATA</HUDLabel>
                </div>
            </div>
            <GlowLine color="violet" intensity="subtle" style={{ marginBottom: 14 }} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {rows.map(({ key, value }) => (
                    <div key={key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                        <HUDLabel variant="dim" style={{ fontSize: '0.56rem', letterSpacing: '0.16em', flexShrink: 0 }}>
                            {key}
                        </HUDLabel>
                        <span style={{
                            fontFamily: 'var(--font-mono)',
                            fontSize: '0.65rem',
                            letterSpacing: '0.08em',
                            color: key === 'AVAILABILITY'
                                ? (profile.availability === 'open' ? 'var(--color-accent-cyan)' : 'var(--color-accent-violet)')
                                : 'var(--color-text-secondary)',
                            textAlign: 'right',
                            lineHeight: 1.4,
                        }}>
                            {value}
                        </span>
                    </div>
                ))}
            </div>
        </GlassPanel>
    )
}

// ── Main AboutSection ─────────────────────────────────────────────────────────

export function AboutSection() {
    const sectionRef = useScrollSection('about')
    const contentRef = useRef<HTMLDivElement>(null)
    const statsRef = useRef<HTMLDivElement>(null)
    const profileRef = useRef<HTMLDivElement>(null)
    const traitsRef = useRef<HTMLDivElement>(null)
    const [statsTriggered, setStatsTriggered] = useState(false)
    const { isMobile, isTablet } = useDevice()
    const isCompact = isMobile || isTablet

    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.fromTo(contentRef.current,
                { y: 24, opacity: 0 },
                {
                    y: 0, opacity: 1, duration: 1.0, ease: 'expo.out',
                    scrollTrigger: { trigger: sectionRef.current, scroller: '#main-scroll', start: 'top 60%', once: true },
                },
            )
            gsap.fromTo(statsRef.current,
                { opacity: 0, y: 16 },
                {
                    opacity: 1, y: 0, duration: 0.8, ease: 'expo.out',
                    scrollTrigger: {
                        trigger: statsRef.current, scroller: '#main-scroll', start: 'top 75%', once: true,
                        onEnter: () => setStatsTriggered(true),
                    },
                },
            )
            gsap.fromTo(
                traitsRef.current?.children ?? [],
                { y: 12, opacity: 0 },
                {
                    y: 0, opacity: 1, duration: 0.5, ease: 'expo.out', stagger: 0.08,
                    scrollTrigger: { trigger: traitsRef.current, scroller: '#main-scroll', start: 'top 78%', once: true },
                },
            )
            gsap.fromTo(profileRef.current,
                { y: 16, opacity: 0 },
                {
                    y: 0, opacity: 1, duration: 0.7, ease: 'expo.out', delay: 0.2,
                    scrollTrigger: { trigger: profileRef.current, scroller: '#main-scroll', start: 'top 80%', once: true },
                },
            )
        })
        return () => ctx.revert()
    }, [sectionRef])

    return (
        <section
            ref={sectionRef as React.RefObject<HTMLElement>}
            id="about"
            style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                padding: isCompact
                    ? 'clamp(60px,8vw,80px) clamp(20px,6vw,32px)'
                    : 'clamp(80px,8vw,100px) clamp(60px,8vw,120px) clamp(80px,8vw,100px) clamp(100px,10vw,160px)',
                position: 'relative',
                zIndex: 'var(--z-sections)' as unknown as number,
                background: 'radial-gradient(ellipse 80% 60% at 90% 20%, rgba(155,92,246,0.18) 0%, transparent 55%), radial-gradient(ellipse 60% 50% at 10% 80%, rgba(120,60,240,0.12) 0%, transparent 55%), linear-gradient(180deg, #0a071e 0%, #0d0926 100%)',
            }}
        >
            <div
                ref={contentRef}
                style={{
                    display: 'grid',
                    gridTemplateColumns: isCompact ? '1fr' : '1fr clamp(280px, 28vw, 340px)',
                    gap: isCompact ? 32 : 'clamp(32px, 5vw, 64px)',
                    width: '100%',
                    maxWidth: 1100,
                    alignItems: 'start',
                }}
            >
                {/* ── LEFT: identity text + stats + traits ─────────── */}
                <div style={{ paddingTop: 8 }}>
                    <GlowLine color="violet" animated length="100px" style={{ marginBottom: 20 }} />
                    <SectionMarker index="01" label="ABOUT" sublabel="IDENTITY / ORIGIN" active style={{ marginBottom: 28 }} />

                    {/* name */}
                    <h2 style={{
                        fontFamily: 'var(--font-display)',
                        fontSize: 'clamp(2rem, 4vw, 3.25rem)',
                        fontWeight: 300,
                        letterSpacing: '-0.035em',
                        lineHeight: 1.1,
                        color: 'var(--color-text-primary)',
                        marginBottom: 8,
                    }}>
                        {personalInfo.name}
                    </h2>

                    {/* title badges */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 22 }}>
                        {personalInfo.title.split(' & ').map((t, i) => (
                            <TechBadge key={i} variant={i === 0 ? 'cyan' : 'violet'}>{t.toUpperCase()}</TechBadge>
                        ))}
                    </div>

                    {/* bio */}
                    <p style={{
                        fontSize: 'clamp(0.9rem, 1.4vw, 1.0rem)',
                        color: 'var(--color-text-secondary)',
                        lineHeight: 1.78,
                        maxWidth: 560,
                        marginBottom: 36,
                    }}>
                        {personalInfo.bio}
                    </p>

                    {/* stats */}
                    <div
                        ref={statsRef}
                        style={{
                            display: 'grid',
                            gridTemplateColumns: isCompact ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
                            gap: 16,
                            marginBottom: 36,
                        }}
                    >
                        {profile.stats.map((s, i) => (
                            <StatCounter key={s.id} value={s.value} label={s.label} unit={s.unit} delay={i * 0.12} triggered={statsTriggered} />
                        ))}
                    </div>

                    <GlowLine color="dim" style={{ marginBottom: 24 }} />

                    {/* traits grid */}
                    <div
                        ref={traitsRef}
                        style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(2, 1fr)',
                            gap: 10,
                            marginBottom: 28,
                        }}
                    >
                        {profile.traits.map((t) => (
                            <GlassPanel key={t.code} variant="inset" style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 6 }}>
                                <HUDLabel variant="cyan" style={{ fontSize: '0.56rem', letterSpacing: '0.22em' }}>{t.code}</HUDLabel>
                                <span style={{ fontFamily: 'var(--font-sans)', fontSize: '0.8125rem', fontWeight: 500, color: 'var(--color-text-primary)' }}>
                                    {t.label}
                                </span>
                                <span style={{ fontFamily: 'var(--font-sans)', fontSize: '0.72rem', color: 'var(--color-text-tertiary)', lineHeight: 1.5 }}>
                                    {t.desc}
                                </span>
                            </GlassPanel>
                        ))}
                    </div>

                    {/* bottom meta */}
                    <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
                        <StatusIndicator
                            status={profile.availability === 'open' ? 'online' : 'standby'}
                            showPing={profile.availability === 'open'}
                            label={profile.availability === 'open' ? 'AVAILABLE FOR WORK' : 'LIMITED AVAILABILITY'}
                        />
                        <GlowLine color="dim" direction="vertical" length="16px" />
                        <CoordinateLabel label={profile.location} variant="dim" />
                        <GlowLine color="dim" direction="vertical" length="16px" />
                        <div style={{ display: 'flex', gap: 5 }}>
                            {Object.keys(personalInfo.social).map((k) => (
                                <TechBadge key={k} variant="ghost">{k.toUpperCase()}</TechBadge>
                            ))}
                        </div>
                    </div>
                </div>

                {/* ── RIGHT: system profile panel ──────────────────── */}
                {!isCompact && (
                    <div ref={profileRef} style={{ paddingTop: isCompact ? 0 : 64 }}>
                        <SystemProfile />
                    </div>
                )}
                {isCompact && (
                    <div ref={profileRef}>
                        <SystemProfile />
                    </div>
                )}
            </div>
        </section>
    )
}
