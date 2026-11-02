import { useEffect, useRef, useState } from 'react'
import { gsap } from '@/lib/animation'
import { useScrollSection } from '@/hooks/useScrollSection'
import { labProjects, type Project, type ProjectCategory, PROJECT_CATEGORIES } from '@/data/projects'
import { HUDLabel } from '@/components/ui/primitives/HUDLabel'
import { GlowLine } from '@/components/ui/primitives/GlowLine'
import { SectionMarker } from '@/components/ui/primitives/SectionMarker'
import { StatusIndicator } from '@/components/ui/primitives/StatusIndicator'
import { CommandButton } from '@/components/ui/primitives/CommandButton'
import { ProjectCard } from './projects/ProjectCard'
import { ProjectModal } from './projects/ProjectModal'
import { useCursor } from '@/hooks/useCursor'

type FilterState = 'all' | ProjectCategory

const FILTERS: { id: FilterState; label: string }[] = [
    { id: 'all', label: 'ALL EXPERIMENTS' },
    { id: 'webgl', label: '3D / WEBGL' },
    { id: 'systems', label: 'SYSTEMS' },
    { id: 'fullstack', label: 'FULL STACK' },
    { id: 'ai-ml', label: 'AI / ML' },
    { id: 'creative', label: 'CREATIVE' },
    { id: 'tools', label: 'TOOLS' },
]

// ── Filter bar ────────────────────────────────────────────────────────────────
function LabFilterBar({
    active,
    onSelect,
}: {
    active: FilterState
    onSelect: (f: FilterState) => void
}) {
    const cursor = useCursor()
    const available = FILTERS.filter(
        (f) => f.id === 'all' || labProjects.some((p) => p.category === f.id),
    )

    return (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 28 }}>
            {available.map((f) => {
                const isActive = active === f.id
                const catColor = f.id !== 'all'
                    ? PROJECT_CATEGORIES[f.id as ProjectCategory].color
                    : '#38bdf8'

                return (
                    <button
                        key={f.id}
                        onClick={() => onSelect(f.id)}
                        onMouseEnter={() => cursor.set('hover', f.label)}
                        onMouseLeave={cursor.reset}
                        style={{
                            fontFamily: 'var(--font-mono)', fontSize: '0.57rem',
                            letterSpacing: '0.16em', textTransform: 'uppercase',
                            padding: '5px 13px',
                            background: isActive ? `${catColor}14` : 'rgba(255,255,255,0.02)',
                            border: `1px solid ${isActive ? catColor + '44' : 'rgba(255,255,255,0.07)'}`,
                            borderRadius: 2,
                            color: isActive ? catColor : 'var(--color-text-tertiary)',
                            cursor: 'none', transition: 'all 180ms',
                            display: 'flex', alignItems: 'center', gap: 6,
                            boxShadow: isActive ? `0 0 12px ${catColor}12` : 'none',
                        }}
                    >
                        <span style={{
                            width: 4, height: 4, borderRadius: '50%',
                            background: isActive ? catColor : 'rgba(255,255,255,0.12)',
                            transition: 'background 180ms',
                            flexShrink: 0,
                            boxShadow: isActive ? `0 0 4px ${catColor}` : 'none',
                        }} />
                        {f.label}
                    </button>
                )
            })}
        </div>
    )
}

// ── Project grid ──────────────────────────────────────────────────────────────
function LabGrid({
    projects,
    onOpen,
    gridRef,
}: {
    projects: Project[]
    onOpen: (p: Project) => void
    gridRef: React.RefObject<HTMLDivElement | null>
}) {
    const cursor = useCursor()
    const featured = projects.filter((p) => p.featured)
    const rest = projects.filter((p) => !p.featured)

    return (
        <div ref={gridRef}>
            {featured.length > 0 && (
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(270px, 1fr))',
                    gap: 16,
                    marginBottom: rest.length ? 24 : 0,
                }}>
                    {featured.map((p, i) => (
                        <ProjectCard key={p.id} project={p} index={i} onOpen={onOpen} />
                    ))}
                </div>
            )}

            {rest.length > 0 && (
                <>
                    <div style={{
                        display: 'flex', alignItems: 'center', gap: 10,
                        marginBottom: 12, marginTop: 4,
                    }}>
                        <HUDLabel variant="dim" style={{ fontSize: '0.54rem', letterSpacing: '0.20em' }}>
                            ADDITIONAL EXPERIMENTS
                        </HUDLabel>
                        <GlowLine color="dim" style={{ flex: 1 }} />
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                        {rest.map((p) => {
                            const color = p.accent === 'cyan' ? '#38bdf8' : '#a78bfa'
                            return (
                                <button
                                    key={p.id}
                                    onClick={() => onOpen(p)}
                                    onMouseEnter={() => cursor.set('hover', 'EXPLORE')}
                                    onMouseLeave={cursor.reset}
                                    style={{
                                        fontFamily: 'var(--font-mono)', fontSize: '0.60rem',
                                        letterSpacing: '0.10em', textTransform: 'uppercase',
                                        padding: '8px 16px', cursor: 'none',
                                        background: 'rgba(255,255,255,0.025)',
                                        border: `1px solid rgba(255,255,255,0.07)`,
                                        borderRadius: 2, color: 'var(--color-text-secondary)',
                                        transition: 'all 180ms',
                                        display: 'flex', alignItems: 'center', gap: 8,
                                    }}
                                >
                                    <span style={{
                                        width: 4, height: 4, borderRadius: '50%',
                                        background: color, boxShadow: `0 0 4px ${color}`,
                                    }} />
                                    {p.title}
                                    <HUDLabel variant="dim" style={{ fontSize: '0.52rem' }}>{p.year}</HUDLabel>
                                </button>
                            )
                        })}
                    </div>
                </>
            )}
        </div>
    )
}

// ── Main section ──────────────────────────────────────────────────────────────
export function ProjectsSection() {
    const sectionRef = useScrollSection('projects')
    const headRef = useRef<HTMLDivElement>(null)
    const filterRef = useRef<HTMLDivElement>(null)
    const gridRef = useRef<HTMLDivElement>(null)

    const [filter, setFilter] = useState<FilterState>('all')
    const [activeProject, setActiveProject] = useState<Project | null>(null)

    const filtered = filter === 'all'
        ? labProjects
        : labProjects.filter((p) => p.category === filter)

    const liveCount = labProjects.filter((p) => p.status === 'live').length
    const wipCount = labProjects.filter((p) => p.status === 'wip').length

    // ── Entrance animation ────────────────────────
    useEffect(() => {
        const ctx = gsap.context(() => {
            const tl = gsap.timeline({
                scrollTrigger: {
                    trigger: headRef.current,
                    scroller: '#main-scroll',
                    start: 'top 68%',
                    once: true,
                },
            })
            tl.fromTo(headRef.current, { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.9, ease: 'expo.out' })
            tl.fromTo(filterRef.current, { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.6, ease: 'expo.out' }, '-=0.5')
            tl.fromTo(gridRef.current, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.7, ease: 'expo.out' }, '-=0.4')
        })
        return () => ctx.revert()
    }, [])

    // ── Filter change animation ───────────────────
    useEffect(() => {
        if (!gridRef.current) return
        gsap.fromTo(
            Array.from(gridRef.current.children),
            { y: 10, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.35, ease: 'expo.out', stagger: 0.05 },
        )
    }, [filter])

    return (
        <section
            ref={sectionRef as React.RefObject<HTMLElement>}
            id="projects"
            style={{
                minHeight: '100vh',
                display: 'flex', flexDirection: 'column', justifyContent: 'center',
                padding: 'clamp(80px,8vw,100px) clamp(60px,8vw,120px) clamp(80px,8vw,100px) clamp(100px,10vw,160px)',
                position: 'relative',
                zIndex: 'var(--z-sections)' as unknown as number,
                background: 'radial-gradient(ellipse 75% 55% at 50% 15%, rgba(56,100,255,0.16) 0%, transparent 55%), radial-gradient(ellipse 55% 45% at 80% 85%, rgba(80,60,240,0.12) 0%, transparent 55%), linear-gradient(180deg, #04081a 0%, #050b22 100%)',
            }}
        >
            {/* ── Header ────────────────────────── */}
            <div ref={headRef} style={{ marginBottom: 32 }}>
                <GlowLine color="cyan" animated length="120px" style={{ marginBottom: 20 }} />
                <SectionMarker
                    index="04"
                    label="DIGITAL LAB"
                    sublabel="SELECTED EXPERIMENTS / BUILDS / SYSTEMS"
                    active
                />

                <div style={{
                    display: 'flex', justifyContent: 'space-between',
                    alignItems: 'flex-end', flexWrap: 'wrap', gap: 20,
                    marginTop: 24, marginBottom: 10,
                }}>
                    <div>
                        <h2 style={{
                            fontFamily: 'var(--font-display)',
                            fontSize: 'clamp(1.875rem, 4vw, 3rem)',
                            fontWeight: 300, letterSpacing: '-0.03em',
                            color: 'var(--color-text-primary)', marginBottom: 8, lineHeight: 1.1,
                        }}>
                            Digital Lab
                        </h2>
                        <p style={{
                            fontFamily: 'var(--font-sans)', fontSize: '0.875rem',
                            color: 'var(--color-text-secondary)',
                            maxWidth: 480, lineHeight: 1.65,
                        }}>
                            A research archive of experiments, systems, and interfaces built at the intersection of engineering and creative technology.
                        </p>
                    </div>

                    {/* Live stats */}
                    <div style={{
                        display: 'flex', alignItems: 'center', gap: 20,
                        flexShrink: 0,
                        padding: '14px 20px',
                        background: 'rgba(255,255,255,0.02)',
                        border: '1px solid rgba(255,255,255,0.06)',
                        borderRadius: 'var(--radius-sm)',
                    }}>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', fontWeight: 300, letterSpacing: '-0.04em', color: 'var(--color-text-primary)', lineHeight: 1 }}>
                                {labProjects.length}
                            </div>
                            <HUDLabel variant="dim" style={{ fontSize: '0.52rem' }}>TOTAL</HUDLabel>
                        </div>
                        <GlowLine direction="vertical" color="dim" length="30px" />
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', fontWeight: 300, letterSpacing: '-0.04em', color: 'var(--color-accent-cyan)', lineHeight: 1 }}>
                                {liveCount}
                            </div>
                            <HUDLabel variant="cyan" style={{ fontSize: '0.52rem' }}>LIVE</HUDLabel>
                        </div>
                        <GlowLine direction="vertical" color="dim" length="30px" />
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', fontWeight: 300, letterSpacing: '-0.04em', color: 'var(--color-accent-violet)', lineHeight: 1 }}>
                                {wipCount}
                            </div>
                            <HUDLabel variant="violet" style={{ fontSize: '0.52rem' }}>WIP</HUDLabel>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Filter tabs ───────────────────── */}
            <div ref={filterRef}>
                <LabFilterBar active={filter} onSelect={setFilter} />
            </div>

            {/* ── Project grid ──────────────────── */}
            <LabGrid projects={filtered} onOpen={setActiveProject} gridRef={gridRef} />

            {/* ── Footer strip ──────────────────── */}
            <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                flexWrap: 'wrap', gap: 12, marginTop: 28,
                paddingTop: 18, borderTop: '1px solid var(--color-border-subtle)',
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <StatusIndicator status="online" showPing size="sm" label="LAB SYSTEMS ONLINE" />
                    <GlowLine color="dim" direction="vertical" length="14px" />
                    <HUDLabel variant="dim" style={{ fontSize: '0.54rem' }}>
                        HOVER MODULES · CLICK TO OPEN CASE STUDY
                    </HUDLabel>
                </div>
                <CommandButton
                    variant="ghost" size="sm"
                    onClick={() => window.open('https://github.com', '_blank', 'noopener')}
                >
                    VIEW ALL REPOSITORIES →
                </CommandButton>
            </div>

            {/* ── Modal ─────────────────────────── */}
            {activeProject && (
                <ProjectModal
                    project={activeProject}
                    onClose={() => setActiveProject(null)}
                />
            )}
        </section>
    )
}
