import { useEffect, useRef, useState } from 'react'
import { gsap } from '@/lib/animation'
import { useScrollSection } from '@/hooks/useScrollSection'
import { missions, missionPeriod, missionDurationMonths } from '@/data/experiences'
import { useSceneStore } from '@/store/useSceneStore'
import { HUDLabel } from '@/components/ui/primitives/HUDLabel'
import { GlowLine } from '@/components/ui/primitives/GlowLine'
import { GlassPanel } from '@/components/ui/primitives/GlassPanel'
import { SectionMarker } from '@/components/ui/primitives/SectionMarker'
import { TechBadge } from '@/components/ui/primitives/TechBadge'
import { StatusIndicator } from '@/components/ui/primitives/StatusIndicator'
import { CommandButton } from '@/components/ui/primitives/CommandButton'
import { CoordinateLabel } from '@/components/ui/primitives/CoordinateLabel'
import { useCursor } from '@/hooks/useCursor'

// ── Trajectory selector — horizontal node strip ───────────────────────────────

function TrajectorySelector({
    active,
    onSelect,
}: {
    active: number
    onSelect: (i: number) => void
}) {
    const cursor = useCursor()
    const lineRef = useRef<HTMLDivElement>(null)

    // animate the connecting line fill as active changes
    useEffect(() => {
        if (!lineRef.current) return
        const pct = active === 0 ? '0%' : active === 1 ? '50%' : '100%'
        gsap.to(lineRef.current, { width: pct, duration: 0.6, ease: 'expo.out' })
    }, [active])

    return (
        <div className="trajectory-selector" style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 48 }}>
            {/* track background */}
            <div
                aria-hidden
                style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: 1, background: 'rgba(255,255,255,0.06)', transform: 'translateY(-50%)' }}
            />
            {/* animated fill */}
            <div
                ref={lineRef}
                aria-hidden
                style={{ position: 'absolute', top: '50%', left: 0, height: 1, width: '0%', background: 'linear-gradient(90deg, var(--color-accent-cyan), rgba(56,189,248,0.3))', transform: 'translateY(-50%)', boxShadow: '0 0 6px rgba(56,189,248,0.4)', transition: 'none' }}
            />

            {missions.map((m, i) => {
                const isActive = active === i
                const accentColor = m.accent === 'cyan' ? 'var(--color-accent-cyan)' : 'var(--color-accent-violet)'
                const accentGlow = m.accent === 'cyan' ? 'rgba(56,189,248,0.3)' : 'rgba(167,139,250,0.3)'

                return (
                    <button
                        key={m.id}
                        onClick={() => onSelect(i)}
                        onMouseEnter={() => cursor.set('hover', m.missionCode)}
                        onMouseLeave={cursor.reset}
                        style={{
                            position: 'relative', zIndex: 1,
                            background: 'none', border: 'none', cursor: 'none',
                            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
                            padding: '4px 8px',
                        }}
                    >
                        {/* node dot */}
                        <div style={{
                            width: isActive ? 14 : 9,
                            height: isActive ? 14 : 9,
                            borderRadius: '50%',
                            background: isActive ? accentColor : 'var(--color-bg-elevated)',
                            border: `1px solid ${isActive ? accentColor : 'rgba(255,255,255,0.15)'}`,
                            boxShadow: isActive ? `0 0 12px ${accentGlow}, 0 0 4px ${accentColor}` : 'none',
                            transition: 'all 0.35s',
                        }} />
                        {/* mission code */}
                        <HUDLabel
                            variant={isActive ? (m.accent === 'cyan' ? 'cyan' : 'violet') : 'dim'}
                            style={{ fontSize: '0.58rem', letterSpacing: '0.18em', transition: 'color 0.3s' }}
                        >
                            {m.missionCode}
                        </HUDLabel>
                        {/* year below node */}
                        <HUDLabel variant="dim" style={{ fontSize: '0.54rem' }}>
                            {m.startDate.slice(0, 4)}
                        </HUDLabel>
                    </button>
                )
            })}
        </div>
    )
}

// ── Mission detail panel ──────────────────────────────────────────────────────

function MissionPanel({ mission }: { mission: typeof missions[number]; index: number }) {
    const panelRef = useRef<HTMLDivElement>(null)
    const headerRef = useRef<HTMLDivElement>(null)
    const descRef = useRef<HTMLParagraphElement>(null)
    const achievementsRef = useRef<HTMLDivElement>(null)
    const techRef = useRef<HTMLDivElement>(null)

    const accentColor = mission.accent === 'cyan'
        ? 'var(--color-accent-cyan)'
        : 'var(--color-accent-violet)'

    // entrance animation whenever mission changes
    useEffect(() => {
        const ctx = gsap.context(() => {
            const tl = gsap.timeline()
            tl.fromTo(panelRef.current,
                { opacity: 0, y: 12 },
                { opacity: 1, y: 0, duration: 0.5, ease: 'expo.out' })
            tl.fromTo(headerRef.current,
                { x: -16, opacity: 0 },
                { x: 0, opacity: 1, duration: 0.5, ease: 'expo.out' }, '-=0.25')
            tl.fromTo(descRef.current,
                { opacity: 0, y: 8 },
                { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out' }, '-=0.3')
            tl.fromTo(achievementsRef.current?.children ?? [],
                { x: -12, opacity: 0 },
                { x: 0, opacity: 1, duration: 0.4, ease: 'expo.out', stagger: 0.06 }, '-=0.25')
            tl.fromTo(techRef.current?.children ?? [],
                { y: 8, opacity: 0 },
                { y: 0, opacity: 1, duration: 0.35, ease: 'expo.out', stagger: 0.04 }, '-=0.25')
        }, panelRef)
        return () => ctx.revert()
    }, [mission.id])

    const duration = missionDurationMonths(mission)
    const durationLabel = duration >= 12
        ? `${Math.floor(duration / 12)}Y ${duration % 12}M`
        : `${duration}M`

    return (
        <div ref={panelRef} style={{ opacity: 0 }}>
            <GlassPanel
                className="career-card"
                variant="elevated"
                glow={mission.accent}
                corners
                style={{ padding: '28px 32px' }}
            >
                {/* shimmer top */}
                <div aria-hidden style={{
                    position: 'absolute', top: 0, left: 0, right: 0, height: 1,
                    background: `linear-gradient(90deg, transparent, ${mission.accent === 'cyan' ? 'rgba(56,189,248,0.35)' : 'rgba(167,139,250,0.30)'}, transparent)`,
                }} />

                {/* ── Header ─────────────────────────────────── */}
                <div ref={headerRef} style={{ marginBottom: 24 }}>
                    {/* top row: mission code + status */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, flexWrap: 'wrap', gap: 10 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <HUDLabel variant={mission.accent === 'cyan' ? 'cyan' : 'violet'} style={{ fontSize: '0.58rem', letterSpacing: '0.22em' }}>
                                {mission.missionCode} / IDX-{mission.index}
                            </HUDLabel>
                            <StatusIndicator
                                status={mission.status === 'active' ? 'online' : 'standby'}
                                showPing={mission.status === 'active'}
                                size="sm"
                                label={mission.status === 'active' ? 'ACTIVE' : 'COMPLETED'}
                            />
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <CoordinateLabel label={mission.locationCode} variant="dim" />
                            <HUDLabel variant="dim" style={{ fontSize: '0.56rem' }}>{durationLabel}</HUDLabel>
                        </div>
                    </div>

                    {/* role */}
                    <h3 style={{
                        fontFamily: 'var(--font-display)',
                        fontSize: 'clamp(1.25rem, 2.5vw, 1.75rem)',
                        fontWeight: 300,
                        letterSpacing: '-0.025em',
                        color: 'var(--color-text-primary)',
                        marginBottom: 6,
                        lineHeight: 1.15,
                    }}>
                        {mission.role}
                    </h3>

                    {/* company / division */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                        <span style={{
                            fontFamily: 'var(--font-mono)',
                            fontSize: '0.78rem',
                            letterSpacing: '0.08em',
                            color: accentColor,
                        }}>
                            {mission.company}
                        </span>
                        <span aria-hidden style={{ color: 'var(--color-border-default)' }}>·</span>
                        <HUDLabel variant="dim" style={{ fontSize: '0.60rem' }}>{mission.division}</HUDLabel>
                        <span aria-hidden style={{ color: 'var(--color-border-default)' }}>·</span>
                        <HUDLabel variant="dim" style={{ fontSize: '0.60rem' }}>{mission.location}</HUDLabel>
                    </div>

                    {/* period */}
                    <div style={{ marginTop: 8 }}>
                        <HUDLabel variant={mission.accent === 'cyan' ? 'cyan' : 'violet'} style={{ fontSize: '0.58rem', letterSpacing: '0.14em' }}>
                            {missionPeriod(mission)}
                        </HUDLabel>
                    </div>
                </div>

                <GlowLine color={mission.accent} intensity="subtle" style={{ marginBottom: 20 }} />

                {/* ── Description ───────────────────────────── */}
                <p
                    ref={descRef}
                    style={{
                        fontSize: 'clamp(0.875rem, 1.4vw, 0.9375rem)',
                        color: 'var(--color-text-secondary)',
                        lineHeight: 1.75,
                        marginBottom: 24,
                        maxWidth: 620,
                    }}
                >
                    {mission.description}
                </p>

                {/* ── Achievements ──────────────────────────── */}
                <div style={{ marginBottom: 24 }}>
                    <HUDLabel variant="dim" style={{ display: 'block', marginBottom: 12, fontSize: '0.58rem', letterSpacing: '0.18em' }}>
                        MISSION OUTCOMES
                    </HUDLabel>
                    <div ref={achievementsRef} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {mission.achievements.map((ach, i) => (
                            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                                {/* accent bullet */}
                                <div style={{
                                    width: 5, height: 5, borderRadius: '50%',
                                    background: accentColor,
                                    boxShadow: `0 0 6px ${accentColor}`,
                                    marginTop: 6, flexShrink: 0,
                                }} />
                                <span style={{
                                    fontFamily: 'var(--font-sans)',
                                    fontSize: '0.8125rem',
                                    color: 'var(--color-text-secondary)',
                                    lineHeight: 1.65,
                                }}>
                                    {ach}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ── Technologies ──────────────────────────── */}
                <div>
                    <HUDLabel variant="dim" style={{ display: 'block', marginBottom: 10, fontSize: '0.58rem', letterSpacing: '0.18em' }}>
                        TECHNOLOGY STACK
                    </HUDLabel>
                    <div ref={techRef} style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                        {mission.technologies.map((tech) => (
                            <TechBadge key={tech} variant={mission.accent === 'cyan' ? 'cyan' : 'violet'} dot>
                                {tech}
                            </TechBadge>
                        ))}
                    </div>
                </div>

                {/* index watermark */}
                <div
                    aria-hidden
                    style={{
                        position: 'absolute', bottom: 20, right: 24,
                        fontFamily: 'var(--font-display)',
                        fontSize: '4rem', fontWeight: 800,
                        color: 'rgba(255,255,255,0.02)',
                        letterSpacing: '-0.05em', lineHeight: 1,
                        userSelect: 'none', pointerEvents: 'none',
                    }}
                >
                    {mission.index}
                </div>
            </GlassPanel>
        </div>
    )
}

// ── Mission navigation controls ───────────────────────────────────────────────

function MissionNav({
    active,
    total,
    onPrev,
    onNext,
}: {
    active: number
    total: number
    onPrev: () => void
    onNext: () => void
}) {
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 20 }}>
            <CommandButton variant="ghost" size="sm" onClick={onPrev} disabled={active === 0}>
                ← PREV
            </CommandButton>
            <HUDLabel variant="dim" style={{ fontSize: '0.56rem', letterSpacing: '0.18em', minWidth: 60, textAlign: 'center' }}>
                {String(active + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
            </HUDLabel>
            <CommandButton variant="ghost" size="sm" onClick={onNext} disabled={active === total - 1}>
                NEXT →
            </CommandButton>
        </div>
    )
}

// ── Main ExperienceSection ────────────────────────────────────────────────────

export function ExperienceSection() {
    const sectionRef = useScrollSection('experience')
    const headRef = useRef<HTMLDivElement>(null)
    const contentRef = useRef<HTMLDivElement>(null)
    const [activeIdx, setActiveIdx] = useState(0)
    const setActiveMissionIndex = useSceneStore((s) => s.setActiveMissionIndex)

    // sync active mission to 3D scene
    useEffect(() => {
        setActiveMissionIndex(activeIdx)
    }, [activeIdx, setActiveMissionIndex])

    // entrance animation
    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.fromTo(headRef.current,
                { y: 28, opacity: 0 },
                {
                    y: 0, opacity: 1, duration: 0.9, ease: 'expo.out',
                    scrollTrigger: { trigger: headRef.current, scroller: '#main-scroll', start: 'top 68%', once: true },
                })
            gsap.fromTo(contentRef.current,
                { y: 20, opacity: 0 },
                {
                    y: 0, opacity: 1, duration: 0.8, ease: 'expo.out', delay: 0.15,
                    scrollTrigger: { trigger: contentRef.current, scroller: '#main-scroll', start: 'top 72%', once: true },
                })
        })
        return () => ctx.revert()
    }, [])

    // keyboard support
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (document.getElementById('experience')?.getBoundingClientRect().top !== undefined) {
                if (e.key === 'ArrowLeft' && activeIdx > 0) setActiveIdx((i) => i - 1)
                if (e.key === 'ArrowRight' && activeIdx < missions.length - 1) setActiveIdx((i) => i + 1)
            }
        }
        window.addEventListener('keydown', onKey)
        return () => window.removeEventListener('keydown', onKey)
    }, [activeIdx])

    const mission = missions[activeIdx]

    return (
        <section
            ref={sectionRef as React.RefObject<HTMLElement>}
            id="experience"
            className="career-section"
            style={{
                minHeight: '100vh',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                padding: 'clamp(80px,8vw,100px) clamp(60px,8vw,120px) clamp(80px,8vw,100px) clamp(100px,10vw,160px)',
                position: 'relative',
                zIndex: 'var(--z-sections)' as unknown as number,
                background: 'radial-gradient(ellipse 65% 50% at 5% 50%, rgba(0,220,180,0.14) 0%, transparent 55%), radial-gradient(ellipse 65% 50% at 95% 50%, rgba(0,200,130,0.10) 0%, transparent 55%), linear-gradient(180deg, #031410 0%, #051a14 100%)',
            }}
        >
            {/* ── Header ─────────────────────────────────────────── */}
            <div ref={headRef} className="career-section__header" style={{ marginBottom: 40 }}>
                <GlowLine color="violet" animated length="120px" style={{ marginBottom: 20 }} />
                <SectionMarker index="03" label="EXPERIENCE" sublabel="MISSION HISTORY" active />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 16, marginTop: 24 }}>
                    <h2 style={{
                        fontFamily: 'var(--font-display)',
                        fontSize: 'clamp(1.875rem, 4vw, 3rem)',
                        fontWeight: 300,
                        letterSpacing: '-0.03em',
                        color: 'var(--color-text-primary)',
                    }}>
                        Career Trajectory
                    </h2>
                    <HUDLabel variant="dim" style={{ fontSize: '0.56rem', letterSpacing: '0.16em' }}>
                        {missions.length} MISSIONS LOGGED · {missions.reduce((t) => t + 1, 0) * 2}+ YRS AGGREGATE
                    </HUDLabel>
                </div>
            </div>

            {/* ── Content ────────────────────────────────────────── */}
            <div ref={contentRef} className="career-section__content" style={{ maxWidth: 900, width: '100%' }}>
                {/* horizontal trajectory selector */}
                <TrajectorySelector active={activeIdx} onSelect={setActiveIdx} />

                {/* mission detail card */}
                <MissionPanel mission={mission} index={activeIdx} />

                {/* navigation controls */}
                <MissionNav
                    active={activeIdx}
                    total={missions.length}
                    onPrev={() => setActiveIdx((i) => Math.max(0, i - 1))}
                    onNext={() => setActiveIdx((i) => Math.min(missions.length - 1, i + 1))}
                />
            </div>

            {/* bottom HUD strip */}
            <div className="career-section__footer" style={{
                position: 'absolute', bottom: 28, left: 'clamp(100px,10vw,160px)', right: 'clamp(60px,8vw,120px)',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12,
                borderTop: '1px solid var(--color-border-subtle)', paddingTop: 14,
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <StatusIndicator status="online" showPing size="sm" label={`MISSION ${mission.missionCode} ACTIVE`} />
                    <GlowLine color="dim" direction="vertical" length="14px" />
                    <HUDLabel variant="dim">← → KEYBOARD NAVIGATE</HUDLabel>
                </div>
                <CoordinateLabel label={mission.location} variant="dim" />
            </div>
        </section>
    )
}
