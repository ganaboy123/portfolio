import { useRef, useState } from 'react'
import { gsap } from '@/lib/animation'
import type { Project } from '@/data/projects'
import { PROJECT_CATEGORIES } from '@/data/projects'
import { HUDLabel } from '@/components/ui/primitives/HUDLabel'
import { GlowLine } from '@/components/ui/primitives/GlowLine'
import { ProjectPreview } from './ProjectPreview'
import { ProjectTechnology } from './ProjectTechnology'
import { useCursor } from '@/hooks/useCursor'
import { useIsTouch } from '@/hooks/useIsTouch'

interface ProjectCardProps {
    project: Project
    index: number
    onOpen: (project: Project) => void
}

/**
 * Interactive project module — the core "lab terminal" card.
 * Hover: illumination, metadata reveal, environment pulse.
 * Click: opens full-screen case study modal.
 */
export function ProjectCard({ project, index, onOpen }: ProjectCardProps) {
    const cardRef = useRef<HTMLDivElement>(null)
    const metaRevealRef = useRef<HTMLDivElement>(null)
    const glowEdgeRef = useRef<HTMLDivElement>(null)
    const indexLabelRef = useRef<HTMLDivElement>(null)
    const [active, setActive] = useState(false)
    const cursor = useCursor()
    const isTouch = useIsTouch()

    const color = project.accent === 'cyan' ? '#38bdf8' : '#a78bfa'
    const catMeta = PROJECT_CATEGORIES[project.category]

    const handleEnter = () => {
        setActive(true)
        cursor.set('hover', 'EXPLORE')

        gsap.to(cardRef.current, {
            y: -3, duration: 0.3, ease: 'power2.out',
            boxShadow: `0 12px 28px rgba(0,0,0,0.22), 0 0 0 1px ${color}24`,
        })
        gsap.to(glowEdgeRef.current, { scaleX: 1, opacity: 1, duration: 0.4, ease: 'expo.out', transformOrigin: 'left center' })
        gsap.to(metaRevealRef.current, { opacity: 1, y: 0, duration: 0.35, ease: 'expo.out' })
        gsap.to(indexLabelRef.current, { color, duration: 0.3 })
    }

    const handleLeave = () => {
        setActive(false)
        cursor.reset()

        gsap.to(cardRef.current, {
            y: 0, duration: 0.3, ease: 'power2.out',
            boxShadow: 'none',
        })
        gsap.to(glowEdgeRef.current, { scaleX: 0, opacity: 0, duration: 0.3 })
        gsap.to(metaRevealRef.current, { opacity: 0, y: 6, duration: 0.25 })
        gsap.to(indexLabelRef.current, { color: 'rgba(74,83,112,0.6)', duration: 0.3 })
    }

    const detailsVisible = active || isTouch
    const statusColor = project.status === 'live' ? '#38bdf8'
        : project.status === 'wip' ? '#a78bfa' : '#4a5370'

    return (
        <div
            ref={cardRef}
            className="surface-hover digital-lab__card"
            onClick={() => onOpen(project)}
            onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault()
                    onOpen(project)
                }
            }}
            onMouseEnter={handleEnter}
            onMouseLeave={handleLeave}
            role="button"
            tabIndex={0}
            aria-label={`Open case study for ${project.title}`}
            style={{
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
                background: 'var(--color-bg-surface)',
                border: `1px solid ${detailsVisible ? color + '24' : 'var(--color-border-subtle)'}`,
                borderRadius: 'var(--radius-md)',
                overflow: 'hidden',
                cursor: 'pointer',
                transition: 'border-color 0.3s',
                willChange: 'transform',
            }}
        >
            {/* ── Top glow edge (scans in on hover) ─── */}
            <div
                ref={glowEdgeRef}
                aria-hidden
                style={{
                    position: 'absolute', top: 0, left: 0, right: 0, height: 1,
                    background: `linear-gradient(90deg, transparent, ${color}70, transparent)`,
                    transform: 'scaleX(0)', transformOrigin: 'left center', opacity: 0,
                    zIndex: 2, pointerEvents: 'none',
                }}
            />

            {/* ── Corner brackets ─────────────────────── */}
            {[
                { top: 0, left: 0, d: 'M0 10 L0 0 L10 0' },
                { top: 0, right: 0, d: 'M0 0 L10 0 L10 10' },
                { bottom: 0, left: 0, d: 'M0 0 L0 10 L10 10' },
                { bottom: 0, right: 0, d: 'M10 0 L10 10 L0 10' },
            ].map(({ d, ...pos }, i) => (
                <svg key={i} aria-hidden width={10} height={10} style={{
                    position: 'absolute', ...pos as React.CSSProperties,
                    opacity: 0, transition: 'opacity 0.3s', zIndex: 2,
                }}>
                    <path d={d} stroke={color} strokeWidth={1} fill="none" />
                </svg>
            ))}

            {/* ── Preview area ────────────────────────── */}
            <ProjectPreview project={project} active={detailsVisible} height={170} />

            {/* ── Card body ───────────────────────────── */}
            <div style={{ padding: '16px 20px 20px', flex: 1, display: 'flex', flexDirection: 'column', gap: 10 }}>

                {/* header row: number + year + category */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div ref={indexLabelRef} style={{
                        fontFamily: 'var(--font-mono)', fontSize: '0.56rem',
                        letterSpacing: '0.22em', textTransform: 'uppercase',
                        color: 'rgba(74,83,112,0.6)',
                    }}>
                        {project.number}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{
                            fontFamily: 'var(--font-mono)', fontSize: '0.52rem',
                            letterSpacing: '0.12em', color: catMeta.color + '88',
                        }}>
                            {catMeta.label}
                        </span>
                        <div style={{
                            display: 'flex', alignItems: 'center', gap: 4,
                        }}>
                            <span style={{ width: 4, height: 4, borderRadius: '50%', background: statusColor, boxShadow: project.status === 'live' ? `0 0 4px ${statusColor}` : 'none' }} />
                        </div>
                    </div>
                </div>

                {/* title */}
                <h3 style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: 'clamp(0.95rem, 1.4vw, 1.1rem)',
                    fontWeight: 400,
                    letterSpacing: '-0.02em',
                    color: 'var(--color-text-primary)',
                    lineHeight: 1.2,
                    marginTop: 2,
                }}>
                    {project.title}
                </h3>

                {/* subtitle */}
                <p style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.60rem',
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    color,
                    lineHeight: 1,
                    opacity: 0.85,
                }}>
                    {project.subtitle}
                </p>

                <GlowLine color={project.accent} intensity="subtle" />

                {/* description */}
                <p style={{
                    fontSize: '0.78rem',
                    color: 'var(--color-text-secondary)',
                    lineHeight: 1.7,
                    flex: 1,
                }}>
                    {project.description}
                </p>

                {/* technologies */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginTop: 2 }}>
                    {project.technologies.slice(0, 4).map((t) => (
                        <ProjectTechnology key={t} tech={t} accent={project.accent} size="sm" />
                    ))}
                    {project.technologies.length > 4 && (
                        <span style={{
                            fontFamily: 'var(--font-mono)', fontSize: '0.54rem',
                            color: 'var(--color-text-tertiary)', letterSpacing: '0.10em',
                            alignSelf: 'center',
                        }}>
                            +{project.technologies.length - 4} MORE
                        </span>
                    )}
                </div>

                {/* ── Hover metadata reveal ────────────── */}
                <div
                    ref={metaRevealRef}
                    style={{ opacity: detailsVisible ? 1 : 0, transform: detailsVisible ? 'translateY(0)' : 'translateY(6px)', marginTop: 4 }}
                >
                    <div style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        paddingTop: 10, borderTop: `1px solid ${color}18`,
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            {project.links.find((l) => l.type === 'live') && (
                                <HUDLabel variant="cyan" style={{ fontSize: '0.52rem' }}>⬡ LIVE DEPLOYMENT</HUDLabel>
                            )}
                            {project.links.find((l) => l.type === 'github') && (
                                <HUDLabel variant="dim" style={{ fontSize: '0.52rem' }}>⬡ SRC</HUDLabel>
                            )}
                        </div>
                        <span style={{
                            fontFamily: 'var(--font-mono)', fontSize: '0.58rem',
                            color, letterSpacing: '0.12em',
                            display: 'flex', alignItems: 'center', gap: 4,
                        }}>
                            OPEN ENTRY →
                        </span>
                    </div>
                </div>
            </div>

            {/* ── Index number watermark ─────────────── */}
            <div aria-hidden style={{
                position: 'absolute', bottom: 12, right: 16,
                fontFamily: 'var(--font-display)',
                fontSize: '3rem', fontWeight: 300,
                color: `${color}06`,
                lineHeight: 1,
                userSelect: 'none',
                pointerEvents: 'none',
            }}>
                {String(index + 1).padStart(2, '0')}
            </div>
        </div>
    )
}
