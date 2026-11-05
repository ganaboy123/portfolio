import { useEffect, useRef, useState } from 'react'
import { gsap } from '@/lib/animation'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useAppStore, type SectionId } from '@/store/useAppStore'
import { useCursor } from '@/hooks/useCursor'
import { useIsTouch } from '@/hooks/useIsTouch'
import { useAudioFeedback } from '@/store/useAudioStore'
import { BrandLogo } from '@/components/ui/BrandLogo'

const NAV_ITEMS: { id: SectionId; label: string; index: string; color: string }[] = [
    { id: 'hero', label: 'HOME', index: '00', color: '#00c8e8' },
    { id: 'about', label: 'ABOUT', index: '01', color: '#6bb8f5' },
    { id: 'skills', label: 'SKILLS', index: '02', color: '#9b5cf6' },
    { id: 'experience', label: 'EXPERIENCE', index: '03', color: '#00e5c8' },
    { id: 'projects', label: 'PROJECTS', index: '04', color: '#c4a4fb' },
    { id: 'blog', label: 'BLOG', index: '05', color: '#6de8f8' },
    { id: 'contact', label: 'CONTACT', index: '06', color: '#00c8e8' },
]

// ── scroll helper — works with the #main-scroll container ────────────────────
function scrollToSection(id: SectionId) {
    const scroller = document.getElementById('main-scroll')
    const target = document.getElementById(id)
    if (!scroller || !target) return
    const top = target.offsetTop
    scroller.scrollTo({ top, behavior: 'smooth' })
}

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

// ── Desktop right-panel nav ───────────────────────────────────────────────────
function DesktopNav({
    activeSection,
    onSelect,
}: {
    activeSection: SectionId
    onSelect: (id: SectionId) => void
}) {
    const cursor = useCursor()
    const audio = useAudioFeedback()
    const panelRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (!panelRef.current) return
        gsap.fromTo(panelRef.current,
            { opacity: 0, x: 20 },
            { opacity: 1, x: 0, duration: 0.7, ease: 'expo.out', delay: 0.3 }
        )
    }, [])

    return (
        <nav
            ref={panelRef}
            className="continuity-nav"
            aria-label="Section navigation"
            style={{
                position: 'fixed',
                top: 20,
                left: '50%',
                transform: 'translateX(-50%)',
                zIndex: 30,
                display: 'flex',
                flexDirection: 'row',
                gap: 2,
                padding: '7px 9px',
                background: 'rgba(11, 16, 34, 0.8)',
                border: '1px solid rgba(197, 208, 255, 0.2)',
                borderRadius: 999,
                backdropFilter: 'blur(18px)',
                WebkitBackdropFilter: 'blur(18px)',
                boxShadow: '0 12px 32px rgba(2, 5, 18, 0.22), inset 0 1px 0 rgba(220, 228, 255, 0.1)',
                minWidth: 'max-content',
            }}
        >
            {/* top shimmer */}
            <div aria-hidden style={{
                position: 'absolute', top: 0, left: '20%', right: '20%', height: 1,
                background: 'linear-gradient(90deg, transparent, rgba(0,200,232,0.5), transparent)',
                borderRadius: 1,
            }} />

            {NAV_ITEMS.map((item) => {
                const isActive = item.id === activeSection
                return (
                    <button
                        key={item.id}
                        onClick={() => { audio.click(); onSelect(item.id) }}
                        onMouseEnter={() => { cursor.setLabel(item.label); audio.hover() }}
                        onMouseLeave={() => cursor.reset()}
                        aria-label={`Go to ${item.label}`}
                        aria-current={isActive ? 'page' : undefined}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 6,
                            padding: '7px 9px',
                            borderRadius: 999,
                            border: `1px solid ${isActive ? item.color + '55' : 'transparent'}`,
                            background: isActive
                                ? `linear-gradient(135deg, ${item.color}18 0%, ${item.color}06 100%)`
                                : 'transparent',
                            cursor: 'none',
                            textAlign: 'left',
                            transition: 'all 200ms',
                            boxShadow: isActive ? `0 0 12px ${item.color}18` : 'none',
                            position: 'relative',
                        }}
                    >
                        {/* active underline */}
                        <div style={{
                            position: 'absolute', right: '20%', bottom: 1, left: '20%',
                            height: 1, borderRadius: 2,
                            background: isActive ? item.color : 'transparent',
                            boxShadow: isActive ? `0 0 6px ${item.color}` : 'none',
                            transition: 'all 220ms',
                        }} />

                        {/* index */}
                        <span style={{
                            fontFamily: 'var(--font-mono)',
                            fontSize: '0.50rem',
                            letterSpacing: '0.12em',
                            color: isActive ? item.color : 'rgba(255,255,255,0.30)',
                            minWidth: 16,
                            fontWeight: 700,
                            transition: 'color 200ms',
                        }}>
                            {item.index}
                        </span>

                        {/* label */}
                        <span style={{
                            fontFamily: 'var(--font-mono)',
                            fontSize: '0.54rem',
                            letterSpacing: '0.1em',
                            fontWeight: isActive ? 700 : 500,
                            color: isActive ? '#ffffff' : 'rgba(255,255,255,0.55)',
                            transition: 'color 200ms, font-weight 200ms',
                            textTransform: 'uppercase',
                        }}>
                            {item.label}
                        </span>

                        {/* active dot */}
                        {isActive && (
                            <div style={{
                                marginLeft: 'auto',
                                width: 4, height: 4,
                                borderRadius: '50%',
                                background: item.color,
                                boxShadow: `0 0 6px ${item.color}`,
                                flexShrink: 0,
                            }} />
                        )}
                    </button>
                )
            })}

        </nav>
    )
}

// ── Hamburger icon ────────────────────────────────────────────────────────────
function HamburgerIcon({ open }: { open: boolean }) {
    return (
        <div style={{ width: 22, height: 16, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <span style={{
                display: 'block', height: 2, borderRadius: 2, width: '100%',
                background: 'var(--color-accent-cyan)',
                boxShadow: '0 0 6px var(--color-accent-cyan)',
                transformOrigin: 'center',
                transform: open ? 'translateY(7px) rotate(45deg)' : 'none',
                transition: 'transform 300ms',
            }} />
            <span style={{
                display: 'block', height: 2, borderRadius: 2, width: '70%',
                background: 'var(--color-accent-cyan)',
                opacity: open ? 0 : 1,
                transition: 'opacity 200ms',
            }} />
            <span style={{
                display: 'block', height: 2, borderRadius: 2, width: '85%',
                background: 'var(--color-accent-cyan)',
                boxShadow: '0 0 6px var(--color-accent-cyan)',
                transformOrigin: 'center',
                transform: open ? 'translateY(-7px) rotate(-45deg)' : 'none',
                transition: 'transform 300ms',
            }} />
        </div>
    )
}

// ── Mobile nav ────────────────────────────────────────────────────────────────
function MobileNav({
    activeSection,
}: {
    activeSection: SectionId
}) {
    const [open, setOpen] = useState(false)
    // Dark-only portfolio: retained only inside an unreachable legacy branch.
    const theme = 'dark'
    const onToggleTheme = () => undefined
    const overlayRef = useRef<HTMLDivElement>(null)
    const listRef = useRef<HTMLDivElement>(null)

    // navigate: close menu first, then scroll after a short delay so the
    // overlay unmounts and the scroller is scrollable again
    const navigate = (id: SectionId) => {
        setOpen(false)
        setTimeout(() => scrollToSection(id), 80)
    }

    // animate overlay
    useEffect(() => {
        if (!overlayRef.current) return
        if (open) {
            gsap.fromTo(overlayRef.current,
                { opacity: 0, y: -16 },
                { opacity: 1, y: 0, duration: 0.38, ease: 'expo.out' }
            )
            if (listRef.current) {
                gsap.fromTo(
                    Array.from(listRef.current.children),
                    { opacity: 0, y: 20, scale: 0.97 },
                    { opacity: 1, y: 0, scale: 1, duration: 0.38, ease: 'expo.out', stagger: 0.05, delay: 0.08 }
                )
            }
        }
    }, [open])

    // lock body scroll
    useEffect(() => {
        const el = document.getElementById('main-scroll')
        if (el) el.style.overflow = open ? 'hidden' : 'scroll'
        return () => { if (el) el.style.overflow = 'scroll' }
    }, [open])

    const activeItem = NAV_ITEMS.find(n => n.id === activeSection) ?? NAV_ITEMS[0]

    return (
        <>
            {/* ── Top bar ───────────────────────────── */}
            <div style={{
                position: 'fixed',
                top: 0, left: 0, right: 0,
                zIndex: 31,
                padding: 'max(10px, env(safe-area-inset-top)) 14px 10px',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                background: 'var(--color-glass-bg)',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                borderBottom: '1px solid var(--color-border-accent)',
            }}>
                <BrandLogo onClick={() => navigate('hero')} />

                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    {false && (
                        <button
                            onClick={onToggleTheme}
                            aria-label="Toggle theme"
                            style={{
                                width: 38, height: 38,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                background: 'var(--color-glass-bg)',
                                border: '1px solid var(--color-border-accent)',
                                borderRadius: 6, cursor: 'pointer',
                                fontSize: '1rem', color: 'var(--color-accent-cyan)',
                                flexShrink: 0,
                            }}
                        >
                            {theme === 'dark' ? '☀' : '◑'}
                        </button>
                    )}
                    <button
                        onClick={() => setOpen(v => !v)}
                        aria-expanded={open}
                        aria-label={open ? 'Close menu' : 'Open menu'}
                        style={{
                            width: 44, height: 38,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            background: open ? 'rgba(0,200,232,0.12)' : 'var(--color-glass-bg)',
                            border: `1px solid ${open ? 'var(--color-accent-cyan)' : 'var(--color-border-accent)'}`,
                            borderRadius: 6, cursor: 'pointer',
                            boxShadow: open ? '0 0 14px rgba(0,200,232,0.18)' : 'none',
                            transition: 'all 200ms', flexShrink: 0,
                        }}
                    >
                        <HamburgerIcon open={open} />
                    </button>
                </div>
            </div>

            {/* ── Full-screen overlay ───────────────── */}
            {open && (
                <div
                    ref={overlayRef}
                    style={{
                        position: 'fixed', inset: 0, zIndex: 30,
                        background: 'rgba(4,5,18,0.97)',
                        backdropFilter: 'blur(24px)',
                        WebkitBackdropFilter: 'blur(24px)',
                        display: 'flex', flexDirection: 'column',
                        paddingTop: 'max(80px, calc(env(safe-area-inset-top) + 70px))',
                        paddingBottom: 'max(32px, env(safe-area-inset-bottom))',
                        paddingLeft: 24, paddingRight: 24,
                        overflowY: 'auto',
                    }}
                >
                    {/* current section */}
                    <div style={{
                        display: 'flex', alignItems: 'center', gap: 10,
                        marginBottom: 28, paddingBottom: 18,
                        borderBottom: '1px solid rgba(0,200,232,0.12)',
                    }}>
                        <div style={{
                            width: 6, height: 6, borderRadius: '50%',
                            background: activeItem.color,
                            boxShadow: `0 0 8px ${activeItem.color}`,
                            animation: 'pulse 2s ease-in-out infinite',
                        }} />
                        <span style={{
                            fontFamily: 'var(--font-mono)', fontSize: '0.55rem',
                            letterSpacing: '0.22em', color: activeItem.color, textTransform: 'uppercase',
                        }}>
                            NOW VIEWING · {activeItem.label}
                        </span>
                    </div>

                    {/* nav items */}
                    <div ref={listRef} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {NAV_ITEMS.map(({ id, label, index, color }) => {
                            const isActive = activeSection === id
                            return (
                                <button
                                    key={id}
                                    onClick={() => navigate(id)}
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: 16,
                                        padding: '18px 20px',
                                        background: isActive
                                            ? `linear-gradient(135deg, ${color}18 0%, ${color}08 100%)`
                                            : 'rgba(255,255,255,0.025)',
                                        border: `1px solid ${isActive ? color + '55' : 'rgba(255,255,255,0.07)'}`,
                                        borderRadius: 8, cursor: 'pointer', textAlign: 'left',
                                        boxShadow: isActive ? `0 0 20px ${color}14` : 'none',
                                        position: 'relative', overflow: 'hidden',
                                        transition: 'all 200ms',
                                    }}
                                >
                                    <div style={{
                                        position: 'absolute', left: 0, top: 0, bottom: 0, width: 3,
                                        borderRadius: '8px 0 0 8px',
                                        background: isActive ? color : 'transparent',
                                        boxShadow: isActive ? `0 0 8px ${color}` : 'none',
                                        transition: 'all 200ms',
                                    }} />
                                    <span style={{
                                        fontFamily: 'var(--font-mono)', fontSize: '0.65rem',
                                        letterSpacing: '0.14em', minWidth: 28, fontWeight: 700,
                                        color: isActive ? color : 'rgba(255,255,255,0.22)',
                                        transition: 'color 200ms',
                                    }}>
                                        {index}
                                    </span>
                                    <span style={{
                                        fontFamily: 'var(--font-display)', fontSize: '1.4rem',
                                        fontWeight: 700, letterSpacing: '-0.02em', flex: 1,
                                        color: isActive ? '#ffffff' : 'rgba(255,255,255,0.70)',
                                        transition: 'color 200ms',
                                    }}>
                                        {label}
                                    </span>
                                    <span style={{
                                        fontFamily: 'var(--font-mono)', fontSize: '0.9rem',
                                        color: isActive ? color : 'rgba(255,255,255,0.18)',
                                        transform: isActive ? 'translateX(4px)' : 'none',
                                        transition: 'color 200ms, transform 200ms',
                                    }}>→</span>
                                </button>
                            )
                        })}
                    </div>

                    {/* status bar */}
                    <div style={{
                        marginTop: 24, paddingTop: 16,
                        borderTop: '1px solid rgba(255,255,255,0.06)',
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    }}>
                        <span style={{
                            fontFamily: 'var(--font-mono)', fontSize: '0.50rem',
                            letterSpacing: '0.16em', color: 'rgba(255,255,255,0.25)',
                        }}>
                            BIG-HKA · PORTFOLIO NODE
                        </span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <div style={{ width: 4, height: 4, borderRadius: '50%', background: '#34d399', animation: 'pulse 2s ease-in-out infinite' }} />
                            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.50rem', letterSpacing: '0.14em', color: '#34d399' }}>
                                ONLINE
                            </span>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}

// ── Main Navigation ───────────────────────────────────────────────────────────
export function Navigation() {
    const activeSection = useAppStore((s) => s.activeSection)
    const isTouch = useIsTouch()
    const audio = useAudioFeedback()

    const [scrollEl, setScrollEl] = useState<HTMLElement | null>(null)
    useEffect(() => { setScrollEl(document.getElementById('main-scroll')) }, [])
    useScrollTriggers(scrollEl)

    // keyboard nav
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            const idx = NAV_ITEMS.findIndex((n) => n.id === activeSection)
            if (e.key === 'ArrowDown' && idx < NAV_ITEMS.length - 1) {
                audio.click(); scrollToSection(NAV_ITEMS[idx + 1].id)
            } else if (e.key === 'ArrowUp' && idx > 0) {
                audio.click(); scrollToSection(NAV_ITEMS[idx - 1].id)
            }
        }
        window.addEventListener('keydown', onKey)
        return () => window.removeEventListener('keydown', onKey)
    }, [activeSection, audio])

    if (isTouch) {
        return <MobileNav activeSection={activeSection} />
    }

    return (
        <>
            <DesktopNav activeSection={activeSection} onSelect={scrollToSection} />

            {/* ARIA live region */}
            <div role="status" aria-live="polite" aria-atomic="true"
                style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0,0,0,0)' }}>
                {NAV_ITEMS.find(n => n.id === activeSection)?.label}
            </div>
        </>
    )
}
