import { useEffect, useRef } from 'react'
import { gsap } from '@/lib/animation'
import type { Project } from '@/data/projects'
import { HUDLabel } from '@/components/ui/primitives/HUDLabel'
import { GlowLine } from '@/components/ui/primitives/GlowLine'
import { ProjectTechnology } from './ProjectTechnology'

// ── Section block ─────────────────────────────────────────────────────────────
function SectionBlock({
    label,
    accent = 'cyan',
    delay = 0,
    children,
}: {
    label: string
    accent?: 'cyan' | 'violet'
    delay?: number
    children: React.ReactNode
}) {
    const ref = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (!ref.current) return
        gsap.fromTo(ref.current,
            { y: 18, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.55, ease: 'expo.out', delay },
        )
    }, [delay])

    const color = accent === 'cyan' ? '#38bdf8' : '#a78bfa'

    return (
        <div ref={ref} style={{ marginBottom: 30 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                {/* vertical accent bar */}
                <div style={{ width: 2, height: 14, background: color, borderRadius: 1, flexShrink: 0 }} />
                <HUDLabel
                    variant={accent === 'cyan' ? 'cyan' : 'violet'}
                    style={{ fontSize: '0.58rem', letterSpacing: '0.22em' }}
                >
                    {label}
                </HUDLabel>
                <GlowLine color={accent} style={{ flex: 1 }} intensity="subtle" />
            </div>
            {children}
        </div>
    )
}

// ── List item ─────────────────────────────────────────────────────────────────
function ListItem({ text, color, highlighted = false }: { text: string; color: string; highlighted?: boolean }) {
    return (
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 10 }}>
            <div style={{
                width: 4, height: 4, borderRadius: '50%',
                background: color, marginTop: 8, flexShrink: 0,
                boxShadow: `0 0 4px ${color}`,
            }} />
            <span style={{
                fontSize: '0.85rem',
                color: highlighted ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
                lineHeight: 1.75,
            }}>
                {text}
            </span>
        </div>
    )
}

// ── Media grid ────────────────────────────────────────────────────────────────
function MediaGrid({ project }: { project: Project }) {
    if (!project.media || project.media.length === 0) return null

    const validMedia = project.media.filter((m) => m.url)
    if (validMedia.length === 0) return null

    const color = project.accent === 'cyan' ? '#38bdf8' : '#a78bfa'

    return (
        <SectionBlock label="SCREENSHOTS / MEDIA" accent={project.accent} delay={0.45}>
            <div style={{
                display: 'grid',
                gridTemplateColumns: validMedia.length === 1 ? '1fr' : 'repeat(auto-fill, minmax(220px, 1fr))',
                gap: 12,
            }}>
                {validMedia.map((m, i) => (
                    <div key={i} style={{
                        position: 'relative',
                        border: `1px solid ${color}22`,
                        borderRadius: 'var(--radius-sm)',
                        overflow: 'hidden',
                        background: `${color}06`,
                    }}>
                        {m.type === 'video' ? (
                            <video
                                src={m.url}
                                poster={m.thumbnail}
                                controls muted loop playsInline
                                style={{ width: '100%', display: 'block', maxHeight: 280, objectFit: 'cover' }}
                            />
                        ) : (
                            <img
                                src={m.url} alt={m.caption || `${project.title} screenshot ${i + 1}`}
                                style={{ width: '100%', display: 'block', maxHeight: 280, objectFit: 'cover' }}
                            />
                        )}
                        {m.caption && (
                            <div style={{
                                padding: '6px 10px',
                                fontFamily: 'var(--font-mono)', fontSize: '0.54rem',
                                letterSpacing: '0.10em', color: `${color}80`,
                            }}>
                                {m.caption}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </SectionBlock>
    )
}

// ── Main ──────────────────────────────────────────────────────────────────────
interface ProjectCaseStudyProps {
    project: Project
}

/**
 * Full case study body — rendered inside the project modal.
 * Each section animates in with staggered GSAP on mount.
 */
export function ProjectCaseStudy({ project }: ProjectCaseStudyProps) {
    const accent = project.accent
    const color = accent === 'cyan' ? '#38bdf8' : '#a78bfa'
    const altColor = accent === 'cyan' ? '#a78bfa' : '#38bdf8'

    const bodyStyle: React.CSSProperties = {
        fontSize: '0.875rem',
        color: 'var(--color-text-secondary)',
        lineHeight: 1.78,
    }

    return (
        <div>
            {/* Overview */}
            <SectionBlock label="PROJECT OVERVIEW" accent={accent} delay={0.05}>
                <p style={bodyStyle}>{project.overview}</p>
            </SectionBlock>

            {/* Problem / Solution */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                gap: 20, marginBottom: 30,
            }}>
                <SectionBlock label="PROBLEM" accent={accent} delay={0.10}>
                    <p style={bodyStyle}>{project.problem}</p>
                </SectionBlock>
                <SectionBlock label="SOLUTION" accent={accent} delay={0.14}>
                    <p style={bodyStyle}>{project.solution}</p>
                </SectionBlock>
            </div>

            {/* Architecture */}
            <SectionBlock label="ARCHITECTURE" accent={accent} delay={0.18}>
                <div style={{
                    background: `${color}06`,
                    border: `1px solid ${color}16`,
                    borderLeft: `2px solid ${color}40`,
                    borderRadius: 'var(--radius-sm)',
                    padding: '14px 16px',
                }}>
                    <p style={{ ...bodyStyle, fontFamily: 'var(--font-mono)', fontSize: '0.78rem', lineHeight: 1.7 }}>
                        {project.architecture}
                    </p>
                </div>
            </SectionBlock>

            {/* Technologies */}
            <SectionBlock label="TECHNOLOGY STACK" accent={accent} delay={0.22}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
                    {project.technologies.map((t, i) => (
                        <ProjectTechnology key={t} tech={t} accent={i % 2 === 0 ? accent : (accent === 'cyan' ? 'violet' : 'cyan')} size="md" />
                    ))}
                </div>
            </SectionBlock>

            {/* Key Features */}
            <SectionBlock label="KEY FEATURES" accent={accent} delay={0.28}>
                {project.keyFeatures.map((f, i) => (
                    <ListItem key={i} text={f} color={color} />
                ))}
            </SectionBlock>

            {/* Challenges */}
            <SectionBlock label="ENGINEERING CHALLENGES" accent={accent} delay={0.33}>
                {project.challenges.map((c, i) => (
                    <ListItem key={i} text={c} color={altColor} />
                ))}
            </SectionBlock>

            {/* Results */}
            <SectionBlock label="RESULTS & IMPACT" accent={accent} delay={0.38}>
                {project.results.map((r, i) => (
                    <ListItem key={i} text={r} color={color} highlighted />
                ))}
            </SectionBlock>

            {/* Media */}
            <MediaGrid project={project} />
        </div>
    )
}
