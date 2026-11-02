import { useEffect, useRef } from 'react'
import { gsap } from '@/lib/animation'
import { useScrollSection } from '@/hooks/useScrollSection'
import { skillNodes } from '@/data/content'
import { HUDLabel } from '@/components/ui/primitives/HUDLabel'
import { GlowLine } from '@/components/ui/primitives/GlowLine'
import { SectionMarker } from '@/components/ui/primitives/SectionMarker'
import { StatusIndicator } from '@/components/ui/primitives/StatusIndicator'
import { TechMarquee } from '@/components/ui/TechMarquee'

const TOTAL = skillNodes.length
const TOP_CAT = 'FRONTEND / 3D'
const AVG_LVL = Math.round(skillNodes.reduce((s, n) => s + n.level, 0) / TOTAL)

export function SkillsSection() {
    const sectionRef = useScrollSection('skills')
    const headRef = useRef<HTMLDivElement>(null)
    const marqueeRef = useRef<HTMLDivElement>(null)
    const footRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.fromTo(headRef.current,
                { y: 28, opacity: 0 },
                {
                    y: 0, opacity: 1, duration: 0.9, ease: 'expo.out',
                    scrollTrigger: { trigger: headRef.current, scroller: '#main-scroll', start: 'top 68%', once: true },
                })
            gsap.fromTo(marqueeRef.current,
                { opacity: 0, y: 20 },
                {
                    opacity: 1, y: 0, duration: 0.9, ease: 'expo.out', delay: 0.15,
                    scrollTrigger: { trigger: marqueeRef.current, scroller: '#main-scroll', start: 'top 75%', once: true },
                })
            gsap.fromTo(footRef.current,
                { opacity: 0 },
                {
                    opacity: 1, duration: 0.7,
                    scrollTrigger: { trigger: footRef.current, scroller: '#main-scroll', start: 'top 90%', once: true },
                })
        })
        return () => ctx.revert()
    }, [])

    return (
        <section
            ref={sectionRef as React.RefObject<HTMLElement>}
            id="skills"
            style={{
                minHeight: '100vh',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                padding: 'clamp(80px,8vw,100px) 0 clamp(80px,8vw,100px)',
                position: 'relative',
                zIndex: 'var(--z-sections)' as unknown as number,
                background: 'radial-gradient(ellipse 70% 55% at 15% 30%, rgba(0,200,232,0.16) 0%, transparent 55%), radial-gradient(ellipse 55% 45% at 85% 70%, rgba(0,160,180,0.10) 0%, transparent 55%), linear-gradient(180deg, #020f18 0%, #041420 100%)',
            }}
        >
            {/* ── Header ────────────────────────────────────── */}
            <div
                ref={headRef}
                style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    flexWrap: 'wrap',
                    gap: 24,
                    marginBottom: 48,
                    padding: '0 clamp(60px,8vw,120px) 0 clamp(100px,10vw,160px)',
                }}
            >
                <div>
                    <GlowLine color="cyan" animated length="120px" style={{ marginBottom: 20 }} />
                    <SectionMarker index="02" label="SKILLS" sublabel="TECHNOLOGY STACK" active />
                    <h2
                        style={{
                            fontFamily: 'var(--font-display)',
                            fontSize: 'clamp(1.875rem, 4vw, 3rem)',
                            fontWeight: 300,
                            letterSpacing: '-0.03em',
                            color: 'var(--color-text-primary)',
                            marginTop: 24,
                        }}
                    >
                        Technologies & Craft
                    </h2>
                    <p style={{
                        fontFamily: 'var(--font-sans)',
                        fontSize: '0.875rem',
                        color: 'var(--color-text-secondary)',
                        lineHeight: 1.65,
                        maxWidth: 460,
                        marginTop: 12,
                    }}>
                        {TOTAL} technologies across the full stack — from shader code to cloud infrastructure.
                    </p>
                </div>

                {/* stats */}
                <div style={{ display: 'flex', gap: 32, alignItems: 'flex-start', flexShrink: 0 }}>
                    <div style={{ textAlign: 'right' }}>
                        <div style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', fontWeight: 300, letterSpacing: '-0.04em', color: 'var(--color-text-primary)', lineHeight: 1 }}>
                            {TOTAL}
                        </div>
                        <HUDLabel variant="dim" style={{ fontSize: '0.56rem' }}>TECHNOLOGIES</HUDLabel>
                    </div>
                    <GlowLine direction="vertical" color="dim" length="40px" />
                    <div style={{ textAlign: 'right' }}>
                        <div style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', fontWeight: 300, letterSpacing: '-0.04em', color: 'var(--color-accent-cyan)', lineHeight: 1 }}>
                            {AVG_LVL}%
                        </div>
                        <HUDLabel variant="dim" style={{ fontSize: '0.56rem' }}>AVG PROFICIENCY</HUDLabel>
                    </div>
                </div>
            </div>

            {/* ── Marquee ───────────────────────────────────── */}
            <div ref={marqueeRef} style={{ width: '100%' }}>
                <TechMarquee />
            </div>

            {/* ── Accessible tech list (screen readers) ─────── */}
            <div className="sr-only" aria-label="Technology list">
                <ul>
                    {skillNodes.map((skill) => (
                        <li key={skill.id}>{skill.label}: {skill.level}% proficiency</li>
                    ))}
                </ul>
            </div>

            {/* ── Footer strip ──────────────────────────────── */}
            <div
                ref={footRef}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: 16,
                    marginTop: 40,
                    paddingTop: 18,
                    padding: '18px clamp(60px,8vw,120px) 0 clamp(100px,10vw,160px)',
                    borderTop: '1px solid var(--color-border-subtle)',
                }}
            >
                <StatusIndicator status="online" showPing size="sm" label="STACK ONLINE" />
                <HUDLabel variant="dim" style={{ fontSize: '0.54rem' }}>
                    PRIMARY STACK: {TOP_CAT}
                </HUDLabel>
            </div>
        </section>
    )
}
