/**
 * Navigation — no box, no panel.
 *
 * LEFT EDGE  — vertical section label, rotated 90°, glows on hover
 * RIGHT EDGE — index counter + tick progress bar
 *
 * Only the ACTIVE section label is shown. On section change both edges
 * animate out (slide + fade) then the new label animates in.
 * Hover emits an ambient radial glow bloom behind the text.
 */
import {
    useEffect, useRef, useState,
} from 'react'
import { gsap } from '@/lib/animation'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useAppStore, type SectionId } from '@/store/useAppStore'
import { useCursor } from '@/hooks/useCursor'
import { useIsTouch } from '@/hooks/useIsTouch'
import { useAudioFeedback } from '@/store/useAudioStore'
import { BrandLogo } from '@/components/ui/BrandLogo'

// ── Section manifest ──────────────────────────────────────────────────────────

const NAV_ITEMS: { id: SectionId; label: string; index: string; color: string; colorLight: string }[] = [
    { id: 'hero', label: 'HOME', index: '00', color: '#00c8e8', colorLight: '#006890' },
    { id: 'about', label: 'ABOUT', index: '01', color: '#6bb8f5', colorLight: '#1a4fa0' },
    { id: 'skills', label: 'SKILLS', index: '02', color: '#9b5cf6', colorLight: '#5b2eb8' },
    { id: 'experience', label: 'EXPERIENCE', index: '03', color: '#00e5c8', colorLight: '#007060' },
    { id: 'projects', label: 'PROJECTS', index: '04', color: '#c4a4fb', colorLight: '#6a3fcc' },
    { id: 'blog', label: 'BLOG', index: '05', color: '#6de8f8', colorLight: '#005f80' },
    { id: 'contact', label: 'CONTACT', index: '06', color: '#00c8e8', colorLight: '#006890' },
]

// ── ScrollTrigger wiring ──────────────────────────────────────────────────────

function useScrollTriggers(scrollEl: HTMLElement | null) {
    const setActiveSection = useAppStore((s) => s.setActiveSection)
    const setSectionProgress = useAppStore((s) => s.setSectionProgress)

    useEffect(() => {
        if (!scrollEl) return
        ScrollTrigger.defaults({ scroller: scrollEl })

        const triggers = NAV_ITEMS.map(({ id }) => {
            const el = document.getElementById(id)
            if (!el) return null
            return ScrollTrigger.create({
                trigger: el,
                scroller: scrollEl,
                start: 'top center',
                end: 'bottom center',
                onEnter: () => { setActiveSection(id); history.replaceState(null, '', `#${id}`) },
                onEnterBack: () => { setActiveSection(id); history.replaceState(null, '', `#${id}`) },
                onUpdate: (self) => setSectionProgress(self.progress),
            })
        })

        return () => {
            triggers.forEach((t) => t?.kill())
            ScrollTrigger.defaults({ scroller: undefined })
        }
    }, [scrollEl, setActiveSection, setSectionProgress])
}

// ── Left edge — vertical section label ───────────────────────────────────────

function LeftEdge({ item, color }: { item: typeof NAV_ITEMS[number]; color: string }) {
    const wrapRef = useRef<HTMLDivElement>(null)
    const glowRef = useRef<HTMLDivElement>(null)
    const [hovered, setHovered] = useState(false)
    const cursor = useCursor()
    const audio = useAudioFeedback()

    // glow is always visible (active state), intensifies on hover
    useEffect(() => {
        if (!glowRef.current) return
        gsap.to(glowRef.current, {
            opacity: hovered ? 1.0 : 0.72,
            scale: hovered ? 1.2 : 1.0,
            duration: 0.4,
            ease: 'expo.out',
        })
    }, [hovered])

    // mount: animate glow in
    useEffect(() => {
        if (!glowRef.current) return
        gsap.fromTo(glowRef.current, { opacity: 0, scale: 0.5 }, { opacity: 0.72, scale: 1.0, duration: 0.6, ease: 'expo.out' })
    }, [])

    return (
        <div
            ref={wrapRef}
            onMouseEnter={() => { setHovered(true); audio.hover(); cursor.setLabel(item.label) }}
            onMouseLeave={() => { setHovered(false); cursor.reset() }}
            style={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'none',
            }}
        >
            {/* ambient glow bloom — always visible */}
            <div
                ref={glowRef}
                aria-hidden
                style={{
                    position: 'absolute',
                    width: 140,
                    height: 140,
                    borderRadius: '50%',
                    background: `radial-gradient(circle, ${color}38 0%, ${color}10 50%, transparent 70%)`,
                    pointerEvents: 'none',
                    opacity: 0,
                    willChange: 'opacity, transform',
                }}
            />

            {/* vertical label */}
            <div style={{
                writingMode: 'vertical-rl',
                textOrientation: 'mixed',
                transform: 'rotate(180deg)',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.58rem',
                letterSpacing: '0.28em',
                textTransform: 'uppercase',
                color: color,
                transition: 'text-shadow 250ms',
                userSelect: 'none',
                position: 'relative',
                zIndex: 1,
                textShadow: hovered
                    ? `0 0 10px ${color}, 0 0 24px ${color}99, 0 0 48px ${color}44`
                    : `0 0 8px ${color}bb, 0 0 20px ${color}44`,
            }}>
                {item.label}
            </div>

            {/* bottom tick mark */}
            <div style={{
                position: 'absolute',
                bottom: -16,
                left: '50%',
                transform: 'translateX(-50%)',
                width: 1,
                height: 10,
                background: color,
                boxShadow: `0 0 6px ${color}`,
                transition: 'opacity 250ms',
                opacity: hovered ? 1 : 0.6,
            }} />
        </div>
    )
}

// ── Right edge — mirrors left: vertical label + index below ──────────────────

function RightEdge({
    item,
    progress,
    color,
}: {
    item: typeof NAV_ITEMS[number]
    progress: number
    color: string
}) {
    const glowRef = useRef<HTMLDivElement>(null)
    const [hovered, setHovered] = useState(false)
    const cursor = useCursor()
    const audio = useAudioFeedback()

    // glow always visible, intensifies on hover
    useEffect(() => {
        if (!glowRef.current) return
        gsap.to(glowRef.current, {
            opacity: hovered ? 1.0 : 0.72,
            scale: hovered ? 1.2 : 1.0,
            duration: 0.4,
            ease: 'expo.out',
        })
    }, [hovered])

    // mount: animate glow in
    useEffect(() => {
        if (!glowRef.current) return
        gsap.fromTo(glowRef.current, { opacity: 0, scale: 0.5 }, { opacity: 0.72, scale: 1.0, duration: 0.6, ease: 'expo.out' })
    }, [])

    return (
        <div
            onMouseEnter={() => { setHovered(true); audio.hover(); cursor.setLabel(item.label) }}
            onMouseLeave={() => { setHovered(false); cursor.reset() }}
            style={{
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 10,
                cursor: 'none',
            }}
        >
            {/* ambient glow bloom — always visible */}
            <div
                ref={glowRef}
                aria-hidden
                style={{
                    position: 'absolute',
                    width: 140,
                    height: 140,
                    borderRadius: '50%',
                    background: `radial-gradient(circle, ${color}38 0%, ${color}10 50%, transparent 70%)`,
                    pointerEvents: 'none',
                    opacity: 0,
                    willChange: 'opacity, transform',
                }}
            />

            {/* vertical label — same as left but rotated the other way */}
            <div style={{
                writingMode: 'vertical-rl',
                textOrientation: 'mixed',
                transform: 'rotate(0deg)', // natural top-to-bottom on right side
                fontFamily: 'var(--font-mono)',
                fontSize: '0.58rem',
                letterSpacing: '0.28em',
                textTransform: 'uppercase',
                color: color,
                transition: 'text-shadow 250ms',
                userSelect: 'none',
                position: 'relative',
                zIndex: 1,
                textShadow: hovered
                    ? `0 0 10px ${color}, 0 0 24px ${color}99, 0 0 48px ${color}44`
                    : `0 0 8px ${color}bb, 0 0 20px ${color}44`,
            }}>
                {item.label}
            </div>

            {/* index + progress — compact row below label */}
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 4,
                position: 'relative',
                zIndex: 1,
            }}>
                {/* thin progress bar */}
                <div style={{
                    width: 1,
                    height: 32,
                    background: 'rgba(255,255,255,0.08)',
                    borderRadius: 1,
                    overflow: 'hidden',
                }}>
                    <div style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        height: `${progress * 100}%`,
                        background: `linear-gradient(to bottom, ${color}, ${color}44)`,
                        boxShadow: `0 0 5px ${color}`,
                        transition: 'height 80ms linear',
                        borderRadius: 1,
                    }} />
                </div>

                {/* index */}
                <span style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.52rem',
                    letterSpacing: '0.12em',
                    color: color,
                    textShadow: `0 0 6px ${color}99`,
                    opacity: 0.85,
                }}>
                    {item.index}
                </span>
            </div>

            {/* top tick mark */}
            <div style={{
                position: 'absolute',
                top: -16,
                left: '50%',
                transform: 'translateX(-50%)',
                width: 1,
                height: 10,
                background: color,
                boxShadow: `0 0 6px ${color}`,
                transition: 'opacity 250ms',
                opacity: hovered ? 1 : 0.6,
            }} />
        </div>
    )
}

// ── Animated wrapper — swaps content on section change ───────────────────────

function EdgeSlot({
    activeItem,
    side,
    progress,
    color,
}: {
    activeItem: typeof NAV_ITEMS[number]
    side: 'left' | 'right'
    progress: number
    color: string
}) {
    const wrapRef = useRef<HTMLDivElement>(null)
    const prevId = useRef<string>('')

    useEffect(() => {
        if (!wrapRef.current || prevId.current === activeItem.id) return
        prevId.current = activeItem.id

        const xOut = side === 'left' ? -10 : 10
        const xIn = side === 'left' ? 10 : -10

        gsap.fromTo(wrapRef.current,
            { opacity: 0, x: xIn, y: 6 },
            { opacity: 1, x: 0, y: 0, duration: 0.5, ease: 'expo.out' },
        )

        gsap.fromTo(wrapRef.current,
            { filter: `drop-shadow(0 0 8px ${color}88)` },
            { filter: 'drop-shadow(0 0 0px transparent)', duration: 0.8, ease: 'expo.out', delay: 0.1 },
        )

        void xOut
    }, [activeItem.id, side, color])

    return (
        <div ref={wrapRef} style={{ opacity: 0 }}>
            {side === 'left'
                ? <LeftEdge key={activeItem.id} item={activeItem} color={color} />
                : <RightEdge key={activeItem.id} item={activeItem} progress={progress} color={color} />
            }
        </div>
    )
}

// ── Main Navigation ───────────────────────────────────────────────────────────

export function Navigation() {
    const activeSection = useAppStore((s) => s.activeSection)
    const sectionProgress = useAppStore((s) => s.sectionProgress)
    const isTouch = useIsTouch()
    const audio = useAudioFeedback()

    const [scrollEl, setScrollEl] = useState<HTMLElement | null>(null)
    useEffect(() => { setScrollEl(document.getElementById('main-scroll')) }, [])
    useScrollTriggers(scrollEl)

    const scrollElRef = useRef<HTMLElement | null>(null)
    useEffect(() => { scrollElRef.current = scrollEl }, [scrollEl])

    const scrollTo = (id: SectionId) => {
        const el = document.getElementById(id)
        if (!el || !scrollElRef.current) return
        audio.click()
        el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }

    // keyboard nav
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            const idx = NAV_ITEMS.findIndex((n) => n.id === activeSection)
            if (e.key === 'ArrowDown' && idx < NAV_ITEMS.length - 1) scrollTo(NAV_ITEMS[idx + 1].id)
            else if (e.key === 'ArrowUp' && idx > 0) scrollTo(NAV_ITEMS[idx - 1].id)
        }
        window.addEventListener('keydown', onKey)
        return () => window.removeEventListener('keydown', onKey)
    }, [activeSection]) // eslint-disable-line react-hooks/exhaustive-deps

    const activeItem = NAV_ITEMS.find((n) => n.id === activeSection) ?? NAV_ITEMS[0]
    const resolvedColor = activeItem.color

    if (isTouch) return <MobileNav activeSection={activeSection} scrollTo={scrollTo} />

    return (
        <>
            {/* ── LEFT EDGE ──────────────────────────────────────── */}
            <div
                aria-hidden
                style={{
                    position: 'fixed',
                    left: 20,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    zIndex: 'var(--z-nav)' as unknown as number,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 12,
                    pointerEvents: 'none',
                }}
            >
                <div style={{ width: 1, height: 40, background: `linear-gradient(to bottom, transparent, ${resolvedColor}55)` }} />
                <div style={{ pointerEvents: 'all' }}>
                    <EdgeSlot activeItem={activeItem} side="left" progress={sectionProgress} color={resolvedColor} />
                </div>
                <div style={{ width: 1, height: 40, background: `linear-gradient(to bottom, ${resolvedColor}55, transparent)` }} />
            </div>

            {/* ── RIGHT EDGE ─────────────────────────────────────── */}
            <div
                style={{
                    position: 'fixed',
                    right: 20,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    zIndex: 'var(--z-nav)' as unknown as number,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 12,
                }}
            >
                <div style={{ width: 1, height: 40, background: `linear-gradient(to bottom, transparent, ${resolvedColor}55)` }} />
                <EdgeSlot activeItem={activeItem} side="right" progress={sectionProgress} color={resolvedColor} />
                <div style={{ width: 1, height: 40, background: `linear-gradient(to bottom, ${resolvedColor}55, transparent)` }} />
            </div>

            {/* dot-nav — bottom center */}
            <DotNav items={NAV_ITEMS} activeId={activeSection} onSelect={scrollTo} color={resolvedColor} />

            {/* ARIA live */}
            <div role="status" aria-live="polite" aria-atomic="true"
                style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0,0,0,0)' }}>
                {activeItem.label}
            </div>
        </>
    )
}

// ── Dot navigation — bottom center, clickable ─────────────────────────────────

function DotNav({
    items,
    activeId,
    onSelect,
    color,
}: {
    items: typeof NAV_ITEMS
    activeId: SectionId
    onSelect: (id: SectionId) => void
    color: string
}) {
    const audio = useAudioFeedback()
    const cursor = useCursor()

    return (
        <nav
            aria-label="Section navigation"
            style={{
                position: 'fixed',
                bottom: 24,
                left: '50%',
                transform: 'translateX(-50%)',
                zIndex: 'var(--z-nav)' as unknown as number,
                display: 'flex',
                alignItems: 'center',
                gap: 10,
            }}
        >
            {items.map((item) => {
                const isActive = item.id === activeId
                return (
                    <button
                        key={item.id}
                        onClick={() => { audio.click(); onSelect(item.id) }}
                        onMouseEnter={() => cursor.setLabel(item.label)}
                        onMouseLeave={cursor.reset}
                        aria-label={`Go to ${item.label}`}
                        aria-current={isActive ? 'page' : undefined}
                        style={{
                            width: isActive ? 20 : 5,
                            height: 5,
                            borderRadius: isActive ? 3 : '50%',
                            border: 'none',
                            padding: 0,
                            background: isActive ? color : 'rgba(255,255,255,0.18)',
                            boxShadow: isActive ? `0 0 8px ${color}` : 'none',
                            cursor: 'none',
                            transition: 'width 300ms cubic-bezier(0.34,1.56,0.64,1), background 300ms, box-shadow 300ms',
                            flexShrink: 0,
                        }}
                    />
                )
            })}
        </nav>
    )
}

// ── Mobile nav ────────────────────────────────────────────────────────────────

function MobileNav({
    activeSection,
    scrollTo,
}: {
    activeSection: SectionId
    scrollTo: (id: SectionId) => void
}) {
    const [open, setOpen] = useState(false)
    const navigate = (id: SectionId) => { scrollTo(id); setOpen(false) }

    return (
        <nav
            aria-label="Site navigation"
            style={{
                position: 'fixed',
                top: 'max(12px, env(safe-area-inset-top))',
                left: 12,
                right: 12,
                zIndex: 'var(--z-nav)' as unknown as number,
                background: 'var(--color-glass-bg)',
                border: '1px solid var(--color-border-accent)',
                borderRadius: 6,
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                padding: 6,
            }}
        >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                <BrandLogo onClick={() => navigate('hero')} />
                <button
                    onClick={() => setOpen((v) => !v)}
                    aria-expanded={open}
                    style={{ minHeight: 40, padding: '0 12px', border: '1px solid rgba(56,189,248,0.16)', borderRadius: 4, background: 'transparent', color: 'var(--color-text-primary)', fontFamily: 'var(--font-mono)', fontSize: '0.68rem', letterSpacing: '0.14em', cursor: 'pointer' }}
                >{open ? 'CLOSE' : 'MENU'}</button>
            </div>
            {open && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,minmax(0,1fr))', gap: 4, paddingTop: 6 }}>
                    {NAV_ITEMS.filter(({ id }) => id !== 'hero').map(({ id, label, index, color }) => (
                        <button
                            key={id}
                            onClick={() => navigate(id)}
                            style={{ minHeight: 44, padding: '0 10px', border: `1px solid ${activeSection === id ? color + '55' : 'rgba(255,255,255,0.07)'}`, borderRadius: 4, background: activeSection === id ? color + '18' : 'rgba(255,255,255,0.02)', color: activeSection === id ? color : 'var(--color-text-secondary)', display: 'flex', alignItems: 'center', gap: 8, textAlign: 'left', fontFamily: 'var(--font-mono)', fontSize: '0.64rem', letterSpacing: '0.1em', cursor: 'pointer' }}
                        >
                            <span style={{ color: 'var(--color-text-tertiary)', fontSize: '0.56rem' }}>{index}</span>
                            {label}
                        </button>
                    ))}
                </div>
            )}
        </nav>
    )
}
