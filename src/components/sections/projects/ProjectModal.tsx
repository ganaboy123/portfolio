import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { gsap } from '@/lib/animation'
import type { Project } from '@/data/projects'
import { PROJECT_CATEGORIES } from '@/data/projects'
import { HUDLabel } from '@/components/ui/primitives/HUDLabel'
import { GlowLine } from '@/components/ui/primitives/GlowLine'
import { StatusIndicator } from '@/components/ui/primitives/StatusIndicator'
import { CommandButton } from '@/components/ui/primitives/CommandButton'
import { ProjectCaseStudy } from './ProjectCaseStudy'
import { useCursor } from '@/hooks/useCursor'
import { useAudioFeedback } from '@/store/useAudioStore'
import { useFocusTrap } from '@/hooks/useFocusTrap'

interface ProjectModalProps {
    project: Project
    onClose: () => void
}

function Corners({ color }: { color: string }) {
    const s = 22
    return (
        <>
            {([
                { style: { top: 0, left: 0 } as React.CSSProperties, d: `M0 ${s} L0 0 L${s} 0` },
                { style: { top: 0, right: 0 } as React.CSSProperties, d: `M0 0 L${s} 0 L${s} ${s}` },
                { style: { bottom: 0, left: 0 } as React.CSSProperties, d: `M0 0 L0 ${s} L${s} ${s}` },
                { style: { bottom: 0, right: 0 } as React.CSSProperties, d: `M${s} 0 L${s} ${s} L0 ${s}` },
            ]).map(({ style, d }, i) => (
                <svg key={i} aria-hidden width={s} height={s} style={{ position: 'absolute', ...style }}>
                    <path d={d} stroke={`${color}60`} strokeWidth={1.2} fill="none" />
                </svg>
            ))}
        </>
    )
}

function MediaBanner({ project }: { project: Project }) {
    const firstMedia = project.media?.[0]
    const hasMedia = firstMedia && firstMedia.url
    const color = project.accent === 'cyan' ? '#38bdf8' : '#a78bfa'
    const catMeta = PROJECT_CATEGORIES[project.category]

    return (
        <div style={{
            position: 'relative', width: '100%',
            height: hasMedia ? 260 : 180,
            overflow: 'hidden', flexShrink: 0,
            background: hasMedia ? '#000' : `radial-gradient(ellipse at 50% 60%, ${color}12 0%, transparent 70%)`,
        }}>
            <div aria-hidden style={{
                position: 'absolute', inset: 0,
                backgroundImage: `linear-gradient(${color}07 1px, transparent 1px), linear-gradient(90deg, ${color}07 1px, transparent 1px)`,
                backgroundSize: '32px 32px', zIndex: 1,
            }} />
            {hasMedia ? (
                firstMedia.type === 'video' ? (
                    <video src={firstMedia.url} poster={firstMedia.thumbnail} autoPlay muted loop playsInline
                        style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.7, position: 'relative', zIndex: 2 }} />
                ) : (
                    <img src={firstMedia.url} alt={firstMedia.caption || project.title}
                        style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.7, position: 'relative', zIndex: 2 }} />
                )
            ) : (
                <div style={{
                    position: 'absolute', inset: 0, zIndex: 2,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                    <div style={{
                        fontFamily: 'var(--font-display)', fontSize: 'clamp(3rem, 8vw, 5rem)',
                        fontWeight: 200, letterSpacing: '-0.04em', color: `${color}15`, userSelect: 'none',
                    }}>
                        {project.number}
                    </div>
                </div>
            )}
            <div aria-hidden style={{
                position: 'absolute', inset: 0, zIndex: 3,
                background: 'linear-gradient(to bottom, transparent 40%, rgba(7,9,20,0.96) 100%)',
            }} />
            <div style={{
                position: 'absolute', top: 14, left: 18, zIndex: 4,
                fontFamily: 'var(--font-mono)', fontSize: '0.52rem',
                letterSpacing: '0.20em', color: `${color}99`, textTransform: 'uppercase',
            }}>
                {catMeta.label}
            </div>
            <div style={{
                position: 'absolute', top: 14, right: 18, zIndex: 4,
                fontFamily: 'var(--font-mono)', fontSize: '0.52rem',
                letterSpacing: '0.14em', color: `${color}55`,
            }}>
                {project.year}
            </div>
            <div aria-hidden style={{
                position: 'absolute', left: 0, right: 0, height: 1, top: '55%',
                background: `linear-gradient(90deg, transparent, ${color}40, transparent)`,
                zIndex: 4, animation: 'scan-sweep 3s ease-in-out infinite',
            }} />
        </div>
    )
}

function ModalInner({ project, onClose }: ProjectModalProps) {
    const backdropRef = useRef<HTMLDivElement>(null)
    const panelRef = useRef<HTMLDivElement>(null)
    const headerRef = useRef<HTMLDivElement>(null)
    const bodyRef = useRef<HTMLDivElement>(null)
    const cursor = useCursor()
    const audio = useAudioFeedback()

    const color = project.accent === 'cyan' ? '#38bdf8' : '#a78bfa'
    const accentVar = project.accent === 'cyan' ? 'var(--color-accent-cyan)' : 'var(--color-accent-violet)'

    useEffect(() => {
        audio.open()
        const ctx = gsap.context(() => {
            const tl = gsap.timeline()
            tl.fromTo(backdropRef.current, { opacity: 0 }, { opacity: 1, duration: 0.35, ease: 'power2.out' })
            tl.fromTo(panelRef.current,
                { y: 50, opacity: 0, scale: 0.96 },
                { y: 0, opacity: 1, scale: 1, duration: 0.6, ease: 'expo.out' }, '-=0.15')
            tl.fromTo(headerRef.current,
                { x: -24, opacity: 0 },
                { x: 0, opacity: 1, duration: 0.5, ease: 'expo.out' }, '-=0.35')
            tl.fromTo(bodyRef.current,
                { opacity: 0, y: 16 },
                { opacity: 1, y: 0, duration: 0.45, ease: 'power2.out' }, '-=0.25')
        })
        return () => ctx.revert()
    }, [])

    const handleClose = () => {
        const tl = gsap.timeline({ onComplete: onClose })
        tl.to(panelRef.current, { y: 24, opacity: 0, scale: 0.97, duration: 0.28, ease: 'power2.in' })
        tl.to(backdropRef.current, { opacity: 0, duration: 0.2 }, '<+=0.05')
    }

    useFocusTrap(panelRef, true, handleClose)

    useEffect(() => {
        document.body.style.overflow = 'hidden'
        return () => { document.body.style.overflow = '' }
    }, [])

    const liveLink = project.links.find((l) => l.type === 'live')
    const githubLink = project.links.find((l) => l.type === 'github')
    const otherLinks = project.links.filter((l) => l.type !== 'live' && l.type !== 'github')

    return (
        <>
            <div ref={backdropRef} onClick={handleClose} aria-hidden style={{
                position: 'fixed', inset: 0,
                background: 'rgba(3,4,10,0.90)',
                backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)',
                zIndex: 40,
            }} />

            <div
                ref={panelRef}
                role="dialog" aria-modal="true"
                aria-labelledby="project-modal-title"
                tabIndex={-1}
                style={{
                    position: 'fixed', top: '50%', left: '50%',
                    transform: 'translate(-50%,-50%)',
                    width: 'min(860px, 96vw)', maxHeight: '92vh',
                    zIndex: 41,
                    background: 'rgba(7,9,20,0.98)',
                    border: `1px solid ${color}28`,
                    borderRadius: 'var(--radius-lg)',
                    backdropFilter: 'blur(28px)', WebkitBackdropFilter: 'blur(28px)',
                    boxShadow: `0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px ${color}10, inset 0 1px 0 ${color}14`,
                    display: 'flex', flexDirection: 'column', overflow: 'hidden',
                }}
            >
                <div aria-hidden style={{
                    position: 'absolute', top: 0, left: 0, right: 0, height: 1,
                    background: `linear-gradient(90deg, transparent 0%, ${color}60 40%, ${color}60 60%, transparent 100%)`,
                    zIndex: 2,
                }} />
                <Corners color={color} />

                {/* Header */}
                <div ref={headerRef} style={{
                    padding: '18px 26px 16px',
                    borderBottom: '1px solid rgba(255,255,255,0.05)',
                    display: 'flex', alignItems: 'flex-start',
                    justifyContent: 'space-between', gap: 16, flexShrink: 0,
                    background: `linear-gradient(to bottom, ${color}06 0%, transparent 100%)`,
                }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8, flexWrap: 'wrap' }}>
                            <HUDLabel
                                variant={project.accent === 'cyan' ? 'cyan' : 'violet'}
                                style={{ fontSize: '0.56rem', letterSpacing: '0.24em' }}
                            >
                                DIGITAL LAB / {project.number}
                            </HUDLabel>
                            <StatusIndicator
                                status={project.status === 'live' ? 'online' : project.status === 'wip' ? 'processing' : 'offline'}
                                showPing={project.status === 'live'} size="sm"
                                label={project.status.toUpperCase()}
                            />
                            <HUDLabel variant="dim" style={{ fontSize: '0.52rem' }}>{project.year}</HUDLabel>
                        </div>
                        <h2 id="project-modal-title" style={{
                            fontFamily: 'var(--font-display)',
                            fontSize: 'clamp(1.35rem, 2.8vw, 1.75rem)',
                            fontWeight: 300, letterSpacing: '-0.03em',
                            color: 'var(--color-text-primary)', lineHeight: 1.1, marginBottom: 6,
                        }}>
                            {project.title}
                        </h2>
                        <p style={{
                            fontFamily: 'var(--font-mono)', fontSize: '0.65rem',
                            letterSpacing: '0.10em', textTransform: 'uppercase', color: accentVar,
                        }}>
                            {project.subtitle}
                        </p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0, marginTop: 4 }}>
                        {liveLink && (
                            <CommandButton variant="primary" size="sm"
                                onClick={() => window.open(liveLink.url, '_blank', 'noopener')}
                                onMouseEnter={() => cursor.set('hover', 'LIVE')}
                                onMouseLeave={cursor.reset}>
                                ↗ LIVE
                            </CommandButton>
                        )}
                        {githubLink && (
                            <CommandButton variant="ghost" size="sm"
                                onClick={() => window.open(githubLink.url, '_blank', 'noopener')}
                                onMouseEnter={() => cursor.set('hover', 'SOURCE')}
                                onMouseLeave={cursor.reset}>
                                ↗ CODE
                            </CommandButton>
                        )}
                        {otherLinks.map((link) => (
                            <CommandButton key={link.label} variant="ghost" size="sm"
                                onClick={() => window.open(link.url, '_blank', 'noopener')}
                                onMouseEnter={() => cursor.set('hover', link.label)}
                                onMouseLeave={cursor.reset}>
                                ↗ {link.label}
                            </CommandButton>
                        ))}
                        <button onClick={handleClose}
                            onMouseEnter={() => cursor.set('hover')} onMouseLeave={cursor.reset}
                            aria-label="Close modal"
                            style={{
                                width: 30, height: 30, borderRadius: 'var(--radius-sm)',
                                background: 'none', border: '1px solid rgba(255,255,255,0.10)',
                                color: 'var(--color-text-tertiary)', cursor: 'none',
                                fontFamily: 'var(--font-mono)', fontSize: '0.75rem',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                transition: 'border-color 150ms, color 150ms', flexShrink: 0,
                            }}>
                            ✕
                        </button>
                    </div>
                </div>

                {/* Scrollable body */}
                <div ref={bodyRef} style={{ overflowY: 'auto', flex: 1 }}>
                    <MediaBanner project={project} />
                    <div style={{ padding: '28px 30px 40px' }}>
                        <GlowLine color={project.accent} style={{ marginBottom: 28 }} />
                        <ProjectCaseStudy project={project} />
                        {project.links.length > 0 && (
                            <div style={{ marginTop: 36, paddingTop: 24, borderTop: `1px solid ${color}14` }}>
                                <HUDLabel variant="dim" style={{ display: 'block', marginBottom: 14, fontSize: '0.56rem', letterSpacing: '0.20em' }}>
                                    PROJECT LINKS
                                </HUDLabel>
                                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                                    {project.links.map((link) => (
                                        <CommandButton key={link.label}
                                            variant={link.type === 'live' ? 'primary' : 'secondary'} size="md"
                                            onClick={() => window.open(link.url, '_blank', 'noopener')}
                                            onMouseEnter={() => cursor.set('hover', link.label)}
                                            onMouseLeave={cursor.reset}>
                                            ↗ {link.label}
                                        </CommandButton>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    )
}

export function ProjectModal({ project, onClose }: ProjectModalProps) {
    return createPortal(<ModalInner project={project} onClose={onClose} />, document.body)
}
