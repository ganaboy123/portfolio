import { useRef, useEffect } from 'react'
import { gsap } from '@/lib/animation'
import type { Project, ProjectCategory } from '@/data/projects'
import { PROJECT_CATEGORIES } from '@/data/projects'

// ── Category glyphs — richer SVG schematics ───────────────────────────────────
const CATEGORY_GLYPH: Record<ProjectCategory, React.ReactNode> = {
    webgl: (
        <svg viewBox="0 0 100 100" fill="none" style={{ width: 56, height: 56 }}>
            <circle cx="50" cy="50" r="38" stroke="currentColor" strokeWidth="0.6" strokeDasharray="6 4" />
            <circle cx="50" cy="50" r="26" stroke="currentColor" strokeWidth="0.5" />
            <circle cx="50" cy="50" r="12" stroke="currentColor" strokeWidth="0.8" />
            <circle cx="50" cy="50" r="4" fill="currentColor" opacity="0.9" />
            {[0, 45, 90, 135].map((deg, i) => {
                const r = (deg * Math.PI) / 180
                const x1 = 50 + Math.cos(r) * 14
                const y1 = 50 + Math.sin(r) * 14
                const x2 = 50 + Math.cos(r) * 38
                const y2 = 50 + Math.sin(r) * 38
                return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="currentColor" strokeWidth="0.5" opacity="0.5" />
            })}
            <circle cx="50" cy="12" r="2.5" fill="currentColor" opacity="0.6" />
            <circle cx="88" cy="50" r="2.5" fill="currentColor" opacity="0.6" />
            <circle cx="50" cy="88" r="2.5" fill="currentColor" opacity="0.6" />
            <circle cx="12" cy="50" r="2.5" fill="currentColor" opacity="0.6" />
        </svg>
    ),
    systems: (
        <svg viewBox="0 0 100 100" fill="none" style={{ width: 56, height: 56 }}>
            <rect x="24" y="24" width="52" height="52" rx="3" stroke="currentColor" strokeWidth="0.6" />
            <rect x="36" y="36" width="28" height="28" rx="2" stroke="currentColor" strokeWidth="0.7" />
            <rect x="44" y="44" width="12" height="12" rx="1" fill="currentColor" opacity="0.3" />
            <line x1="24" y1="40" x2="10" y2="40" stroke="currentColor" strokeWidth="0.7" />
            <line x1="24" y1="60" x2="10" y2="60" stroke="currentColor" strokeWidth="0.7" />
            <line x1="76" y1="40" x2="90" y2="40" stroke="currentColor" strokeWidth="0.7" />
            <line x1="76" y1="60" x2="90" y2="60" stroke="currentColor" strokeWidth="0.7" />
            <line x1="40" y1="24" x2="40" y2="10" stroke="currentColor" strokeWidth="0.7" />
            <line x1="60" y1="24" x2="60" y2="10" stroke="currentColor" strokeWidth="0.7" />
            <circle cx="10" cy="40" r="2" fill="currentColor" opacity="0.7" />
            <circle cx="10" cy="60" r="2" fill="currentColor" opacity="0.7" />
            <circle cx="90" cy="40" r="2" fill="currentColor" opacity="0.7" />
            <circle cx="90" cy="60" r="2" fill="currentColor" opacity="0.7" />
        </svg>
    ),
    'ai-ml': (
        <svg viewBox="0 0 100 100" fill="none" style={{ width: 56, height: 56 }}>
            {/* hidden layer nodes */}
            {[18, 50, 82].map((x, i) => (
                <circle key={`h-${i}`} cx={x} cy={50} r={6} stroke="currentColor" strokeWidth="0.7" />
            ))}
            {/* input/output nodes */}
            {[18, 18, 82, 82].map((x, i) => (
                <circle key={`io-${i}`} cx={x} cy={i < 2 ? 24 + i * 26 : 24 + (i - 2) * 26} r={4} fill="currentColor" opacity={0.5} />
            ))}
            {/* connections */}
            {[[18, 24, 18, 44], [18, 50, 18, 50], [18, 76, 18, 56], [18, 50, 44, 50], [56, 50, 82, 50], [82, 44, 82, 24], [82, 56, 82, 76]].map(([x1, y1, x2, y2], i) => (
                <line key={`c-${i}`} x1={x1} y1={y1} x2={x2} y2={y2} stroke="currentColor" strokeWidth="0.4" opacity="0.5" />
            ))}
            <circle cx="50" cy="50" r="4" fill="currentColor" opacity="0.8" />
        </svg>
    ),
    tools: (
        <svg viewBox="0 0 100 100" fill="none" style={{ width: 56, height: 56 }}>
            <rect x="22" y="22" width="56" height="56" rx="3" stroke="currentColor" strokeWidth="0.6" />
            <line x1="22" y1="36" x2="78" y2="36" stroke="currentColor" strokeWidth="0.5" />
            <line x1="22" y1="56" x2="78" y2="56" stroke="currentColor" strokeWidth="0.5" />
            <line x1="42" y1="22" x2="42" y2="78" stroke="currentColor" strokeWidth="0.5" />
            <line x1="62" y1="22" x2="62" y2="78" stroke="currentColor" strokeWidth="0.5" />
            <rect x="46" y="40" width="12" height="12" rx="1" fill="currentColor" opacity="0.4" />
            <circle cx="32" cy="29" r="2" fill="currentColor" opacity="0.6" />
            <circle cx="52" cy="29" r="2" fill="currentColor" opacity="0.6" />
            <circle cx="72" cy="29" r="2" fill="currentColor" opacity="0.6" />
        </svg>
    ),
    fullstack: (
        <svg viewBox="0 0 100 100" fill="none" style={{ width: 56, height: 56 }}>
            <rect x="16" y="14" width="68" height="18" rx="2" stroke="currentColor" strokeWidth="0.7" />
            <rect x="16" y="39" width="68" height="18" rx="2" stroke="currentColor" strokeWidth="0.6" />
            <rect x="16" y="64" width="68" height="22" rx="2" stroke="currentColor" strokeWidth="0.5" />
            <circle cx="26" cy="23" r="3" fill="currentColor" opacity="0.7" />
            <circle cx="36" cy="23" r="3" fill="currentColor" opacity="0.4" />
            <circle cx="46" cy="23" r="3" fill="currentColor" opacity="0.25" />
            <line x1="26" y1="48" x2="74" y2="48" stroke="currentColor" strokeWidth="0.4" strokeDasharray="4 3" />
            <rect x="26" y="70" width="20" height="10" rx="1" fill="currentColor" opacity="0.2" />
            <rect x="52" y="70" width="10" height="10" rx="1" fill="currentColor" opacity="0.15" />
        </svg>
    ),
    creative: (
        <svg viewBox="0 0 100 100" fill="none" style={{ width: 56, height: 56 }}>
            <circle cx="50" cy="50" r="32" stroke="currentColor" strokeWidth="0.6" />
            <circle cx="50" cy="50" r="18" stroke="currentColor" strokeWidth="0.5" />
            <circle cx="50" cy="50" r="5" fill="currentColor" opacity="0.9" />
            {[0, 60, 120, 180, 240, 300].map((deg, i) => {
                const r = (deg * Math.PI) / 180
                return (
                    <g key={i}>
                        <circle cx={50 + Math.cos(r) * 18} cy={50 + Math.sin(r) * 18} r={2.5} fill="currentColor" opacity={0.5} />
                        <circle cx={50 + Math.cos(r) * 32} cy={50 + Math.sin(r) * 32} r={2} fill="currentColor" opacity={0.3} />
                        <line x1={50 + Math.cos(r) * 20} y1={50 + Math.sin(r) * 20} x2={50 + Math.cos(r) * 30} y2={50 + Math.sin(r) * 30} stroke="currentColor" strokeWidth="0.4" opacity="0.4" />
                    </g>
                )
            })}
        </svg>
    ),
}

interface ProjectPreviewProps {
    project: Project
    active?: boolean
    height?: number
}

/**
 * Generative procedural preview — animated on hover.
 * Supports real media (image/video) when project.media[0] is set.
 * Falls back to a category-based SVG schematic.
 */
export function ProjectPreview({ project, active = false, height = 180 }: ProjectPreviewProps) {
    const wrapRef = useRef<HTMLDivElement>(null)
    const glyphRef = useRef<HTMLDivElement>(null)
    const scanRef = useRef<HTMLDivElement>(null)
    const particleRef = useRef<HTMLDivElement>(null)

    const catMeta = PROJECT_CATEGORIES[project.category]
    const color = project.accent === 'cyan' ? '#38bdf8' : '#a78bfa'
    const firstMedia = project.media?.[0]
    const hasMedia = firstMedia && firstMedia.url

    useEffect(() => {
        if (!glyphRef.current) return
        if (active) {
            gsap.to(glyphRef.current, { rotation: 8, scale: 1.15, duration: 0.6, ease: 'expo.out' })
            gsap.to(scanRef.current, { opacity: 1, duration: 0.3 })
            gsap.to(particleRef.current, { opacity: 1, duration: 0.4 })
            // Pulse glyph
            gsap.to(glyphRef.current, {
                opacity: 0.95,
                filter: `drop-shadow(0 0 8px ${color}80)`,
                duration: 0.4,
            })
        } else {
            gsap.to(glyphRef.current, {
                rotation: 0, scale: 1.0, opacity: 0.45,
                filter: 'drop-shadow(0 0 0px transparent)',
                duration: 0.5, ease: 'expo.out',
            })
            gsap.to(scanRef.current, { opacity: 0, duration: 0.2 })
            gsap.to(particleRef.current, { opacity: 0, duration: 0.3 })
        }
    }, [active, color])

    return (
        <div
            ref={wrapRef}
            style={{
                position: 'relative',
                width: '100%',
                height,
                overflow: 'hidden',
                background: hasMedia
                    ? 'transparent'
                    : `radial-gradient(ellipse at 50% 60%, ${color}12 0%, transparent 70%)`,
                borderBottom: `1px solid ${color}20`,
            }}
        >
            {/* ── Media layer ────────────────────────── */}
            {hasMedia ? (
                firstMedia.type === 'video' ? (
                    <video
                        src={firstMedia.url}
                        poster={firstMedia.thumbnail}
                        autoPlay={active}
                        muted loop playsInline
                        style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: active ? 0.85 : 0.55, transition: 'opacity 0.4s' }}
                    />
                ) : (
                    <img
                        src={firstMedia.url}
                        alt={firstMedia.caption || project.title}
                        style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: active ? 0.85 : 0.55, transition: 'opacity 0.4s' }}
                    />
                )
            ) : null}

            {/* ── Grid background (always) ────────────── */}
            <div aria-hidden style={{
                position: 'absolute', inset: 0, pointerEvents: 'none',
                backgroundImage: `linear-gradient(${color}09 1px, transparent 1px), linear-gradient(90deg, ${color}09 1px, transparent 1px)`,
                backgroundSize: '28px 28px',
            }} />

            {/* ── Corner markers ──────────────────────── */}
            {[
                { top: 8, left: 8, d: 'M0 12 L0 0 L12 0' },
                { top: 8, right: 8, d: 'M0 0 L12 0 L12 12' },
                { bottom: 8, left: 8, d: 'M0 0 L0 12 L12 12' },
                { bottom: 8, right: 8, d: 'M12 0 L12 12 L0 12' },
            ].map(({ d, ...pos }, i) => (
                <svg key={i} aria-hidden width={12} height={12} style={{ position: 'absolute', ...pos as React.CSSProperties, transition: 'opacity 0.3s', opacity: active ? 0.8 : 0.3 }}>
                    <path d={d} stroke={color} strokeWidth={1} fill="none" />
                </svg>
            ))}

            {/* ── Category label ──────────────────────── */}
            <div style={{
                position: 'absolute', top: 10, left: 14,
                fontFamily: 'var(--font-mono)', fontSize: '0.50rem',
                letterSpacing: '0.20em', color: `${color}88`,
                textTransform: 'uppercase',
            }}>
                {catMeta.label}
            </div>

            {/* ── Project number ──────────────────────── */}
            <div style={{
                position: 'absolute', top: 10, right: 14,
                fontFamily: 'var(--font-mono)', fontSize: '0.50rem',
                letterSpacing: '0.16em', color: `${color}55`,
            }}>
                {project.number}
            </div>

            {/* ── Central glyph (only if no media) ────── */}
            {!hasMedia && (
                <div
                    ref={glyphRef}
                    style={{
                        position: 'absolute', top: '50%', left: '50%',
                        transform: 'translate(-50%,-50%)',
                        color, opacity: 0.45,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}
                >
                    {CATEGORY_GLYPH[project.category]}
                </div>
            )}

            {/* ── Scan line sweep ──────────────────────── */}
            <div
                ref={scanRef}
                aria-hidden
                style={{
                    position: 'absolute', left: 0, right: 0, height: 2,
                    top: '30%', opacity: 0, pointerEvents: 'none',
                    background: `linear-gradient(90deg, transparent, ${color}55, transparent)`,
                    animation: active ? 'scan-sweep 2.2s ease-in-out infinite' : 'none',
                }}
            />

            {/* ── Dot particle clusters (no media) ────── */}
            {!hasMedia && (
                <div ref={particleRef} aria-hidden style={{ opacity: 0 }}>
                    {[
                        { top: '20%', left: '15%' }, { top: '70%', left: '25%' },
                        { top: '30%', right: '18%' }, { top: '75%', right: '12%' },
                    ].map((pos, i) => (
                        <div key={i} style={{
                            position: 'absolute', ...pos,
                            width: 3, height: 3, borderRadius: '50%',
                            background: color, opacity: 0.35 + i * 0.1,
                            boxShadow: `0 0 6px ${color}`,
                        }} />
                    ))}
                </div>
            )}

            {/* ── Status pill ─────────────────────────── */}
            <div style={{
                position: 'absolute', bottom: 10, right: 14,
                fontFamily: 'var(--font-mono)', fontSize: '0.48rem',
                letterSpacing: '0.18em',
                color: project.status === 'live' ? '#38bdf8' : project.status === 'wip' ? '#a78bfa' : '#4a5370',
                display: 'flex', alignItems: 'center', gap: 5,
            }}>
                <span style={{
                    width: 4, height: 4, borderRadius: '50%',
                    background: 'currentColor',
                    boxShadow: project.status === 'live' ? '0 0 5px currentColor' : 'none',
                }} />
                {project.status.toUpperCase()}
            </div>

            {/* ── Year bottom-left ────────────────────── */}
            <div style={{
                position: 'absolute', bottom: 10, left: 14,
                fontFamily: 'var(--font-mono)', fontSize: '0.48rem',
                letterSpacing: '0.14em', color: `${color}44`,
            }}>
                {project.year}
            </div>

            {/* ── Hover vignette overlay ───────────────── */}
            <div aria-hidden style={{
                position: 'absolute', inset: 0, pointerEvents: 'none',
                background: active
                    ? `radial-gradient(ellipse at 50% 50%, ${color}10 0%, transparent 70%)`
                    : 'transparent',
                transition: 'background 0.4s',
            }} />
        </div>
    )
}
