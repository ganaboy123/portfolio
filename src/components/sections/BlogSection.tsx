import { useEffect, useRef, useState } from 'react'
import { gsap } from '@/lib/animation'
import { useScrollSection } from '@/hooks/useScrollSection'
import {
    signalLog,
    type SignalEntry,
    type SignalCategory,
    SIGNAL_CATEGORIES,
    formatSignalDate,
} from '@/data/signal-log'
import { HUDLabel } from '@/components/ui/primitives/HUDLabel'
import { GlowLine } from '@/components/ui/primitives/GlowLine'
import { SectionMarker } from '@/components/ui/primitives/SectionMarker'
import { StatusIndicator } from '@/components/ui/primitives/StatusIndicator'
import { CommandButton } from '@/components/ui/primitives/CommandButton'
import { TransmissionCard } from './blog/TransmissionCard'
import { ArticleReader } from './blog/ArticleReader'
import { useCursor } from '@/hooks/useCursor'

type FilterState = 'all' | SignalCategory

// ── Category filter bar ───────────────────────────────────────────────────────
function SignalFilterBar({ active, onSelect }: { active: FilterState; onSelect: (f: FilterState) => void }) {
    const cursor = useCursor()
    const present = (Object.keys(SIGNAL_CATEGORIES) as SignalCategory[]).filter(
        (c) => signalLog.some((e) => e.category === c),
    )

    const items: { id: FilterState; label: string; color: string }[] = [
        { id: 'all', label: 'ALL SIGNALS', color: '#a78bfa' },
        ...present.map((c) => ({ id: c, label: SIGNAL_CATEGORIES[c].label, color: SIGNAL_CATEGORIES[c].color })),
    ]

    return (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 28 }}>
            {items.map(({ id, label, color }) => {
                const isActive = active === id
                return (
                    <button
                        key={id}
                        onClick={() => onSelect(id)}
                        onMouseEnter={() => cursor.set('hover', label)}
                        onMouseLeave={cursor.reset}
                        style={{
                            fontFamily: 'var(--font-mono)', fontSize: '0.57rem',
                            letterSpacing: '0.16em', textTransform: 'uppercase',
                            padding: '5px 13px', cursor: 'none',
                            background: isActive ? `${color}14` : 'rgba(255,255,255,0.02)',
                            border: `1px solid ${isActive ? color + '44' : 'rgba(255,255,255,0.07)'}`,
                            borderRadius: 2,
                            color: isActive ? color : 'var(--color-text-tertiary)',
                            transition: 'all 180ms',
                            display: 'flex', alignItems: 'center', gap: 6,
                            boxShadow: isActive ? `0 0 12px ${color}12` : 'none',
                        }}
                    >
                        <span style={{
                            width: 4, height: 4, borderRadius: '50%',
                            background: isActive ? color : 'rgba(255,255,255,0.12)',
                            transition: 'all 180ms',
                            boxShadow: isActive ? `0 0 4px ${color}` : 'none',
                        }} />
                        {label}
                    </button>
                )
            })}
        </div>
    )
}

// ── Archive stats strip ───────────────────────────────────────────────────────
function ArchiveStats() {
    const totalReadTime = signalLog.reduce((s, e) => s + e.readTime, 0)
    const categories = new Set(signalLog.map((e) => e.category)).size
    const latest = signalLog.reduce((a, b) => a.date > b.date ? a : b)

    return (
        <div style={{
            display: 'flex', alignItems: 'center', gap: 20, flexShrink: 0,
            padding: '14px 20px',
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: 'var(--radius-sm)',
        }}>
            <div style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', fontWeight: 300, letterSpacing: '-0.04em', color: 'var(--color-text-primary)', lineHeight: 1 }}>
                    {signalLog.length}
                </div>
                <HUDLabel variant="dim" style={{ fontSize: '0.52rem' }}>ENTRIES</HUDLabel>
            </div>
            <GlowLine direction="vertical" color="dim" length="30px" />
            <div style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', fontWeight: 300, letterSpacing: '-0.04em', color: 'var(--color-accent-violet)', lineHeight: 1 }}>
                    {totalReadTime}
                </div>
                <HUDLabel variant="violet" style={{ fontSize: '0.52rem' }}>MIN TOTAL</HUDLabel>
            </div>
            <GlowLine direction="vertical" color="dim" length="30px" />
            <div style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', fontWeight: 300, letterSpacing: '-0.04em', color: 'var(--color-accent-cyan)', lineHeight: 1 }}>
                    {categories}
                </div>
                <HUDLabel variant="cyan" style={{ fontSize: '0.52rem' }}>DOMAINS</HUDLabel>
            </div>
            <GlowLine direction="vertical" color="dim" length="30px" />
            <div style={{ textAlign: 'right' }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.60rem', letterSpacing: '0.08em', color: 'var(--color-text-secondary)', lineHeight: 1 }}>
                    {formatSignalDate(latest.date)}
                </div>
                <HUDLabel variant="dim" style={{ fontSize: '0.52rem' }}>LATEST</HUDLabel>
            </div>
        </div>
    )
}

// ── Main BlogSection ──────────────────────────────────────────────────────────
export function BlogSection() {
    const sectionRef = useScrollSection('blog')
    const headRef = useRef<HTMLDivElement>(null)
    const filterRef = useRef<HTMLDivElement>(null)
    const featuredRef = useRef<HTMLDivElement>(null)
    const listRef = useRef<HTMLDivElement>(null)

    const [filter, setFilter] = useState<FilterState>('all')
    const [activeEntry, setActiveEntry] = useState<SignalEntry | null>(null)

    const featured = signalLog.filter((e) => e.featured)
    const filtered = filter === 'all' ? signalLog : signalLog.filter((e) => e.category === filter)
    const archiveList = filter === 'all' ? filtered.filter((e) => !e.featured) : filtered
    const showFeatured = filter === 'all' && featured.length > 0

    // ── Entrance animations ───────────────────────
    useEffect(() => {
        const ctx = gsap.context(() => {
            const tl = gsap.timeline({
                scrollTrigger: { trigger: headRef.current, scroller: '#main-scroll', start: 'top 68%', once: true },
            })
            tl.fromTo(headRef.current, { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.9, ease: 'expo.out' })
            tl.fromTo(filterRef.current, { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.6, ease: 'expo.out' }, '-=0.5')
            tl.fromTo(featuredRef.current, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.7, ease: 'expo.out' }, '-=0.4')
            tl.fromTo(
                listRef.current ? Array.from(listRef.current.children) : [],
                { x: -12, opacity: 0 },
                { x: 0, opacity: 1, duration: 0.45, stagger: 0.07, ease: 'expo.out' },
                '-=0.3',
            )
        })
        return () => ctx.revert()
    }, [])

    // ── Filter change animation ───────────────────
    useEffect(() => {
        if (featuredRef.current) {
            gsap.fromTo(Array.from(featuredRef.current.children),
                { y: 10, opacity: 0 },
                { y: 0, opacity: 1, duration: 0.35, stagger: 0.06, ease: 'expo.out' })
        }
        if (listRef.current) {
            gsap.fromTo(Array.from(listRef.current.children),
                { x: -8, opacity: 0 },
                { x: 0, opacity: 1, duration: 0.3, stagger: 0.04, ease: 'expo.out' })
        }
    }, [filter])

    const handleNavigate = (next: SignalEntry) => {
        setActiveEntry(next)
    }

    return (
        <section
            ref={sectionRef as React.RefObject<HTMLElement>}
            id="blog"
            className="knowledge-system"
            style={{
                minHeight: '100vh',
                display: 'flex', flexDirection: 'column', justifyContent: 'center',
                padding: 'clamp(80px,8vw,100px) clamp(60px,8vw,120px) clamp(80px,8vw,100px) clamp(100px,10vw,160px)',
                position: 'relative',
                zIndex: 'var(--z-sections)' as unknown as number,
                background: 'radial-gradient(ellipse 80% 60% at 85% 25%, rgba(190,60,255,0.18) 0%, transparent 55%), radial-gradient(ellipse 60% 45% at 20% 75%, rgba(155,92,246,0.12) 0%, transparent 55%), linear-gradient(180deg, #0f0520 0%, #130826 100%)',
            }}
        >
            {/* ── Header ────────────────────────── */}
            <div ref={headRef} className="knowledge-system__header" style={{ marginBottom: 32 }}>
                <GlowLine color="violet" animated length="120px" style={{ marginBottom: 20 }} />
                <SectionMarker
                    index="05"
                    label="KNOWLEDGE SYSTEM"
                    sublabel="TRANSMISSIONS / RESEARCH / ENGINEERING"
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
                            Knowledge System
                        </h2>
                        <p style={{
                            fontFamily: 'var(--font-sans)', fontSize: '0.875rem',
                            color: 'var(--color-text-secondary)',
                            maxWidth: 460, lineHeight: 1.65,
                        }}>
                            Technical transmissions on engineering, creative technology, systems thinking, and the frontier where code meets craft.
                        </p>
                    </div>
                    <ArchiveStats />
                </div>
            </div>

            {/* ── Filter bar ────────────────────── */}
            <div ref={filterRef} className="knowledge-system__filters">
                <SignalFilterBar active={filter} onSelect={setFilter} />
            </div>

            {/* ── Featured transmissions ────────── */}
            {showFeatured && (
                <>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                        <HUDLabel variant="violet" style={{ fontSize: '0.56rem', letterSpacing: '0.20em' }}>
                            FEATURED TRANSMISSIONS
                        </HUDLabel>
                        <GlowLine color="violet" intensity="subtle" style={{ flex: 1 }} />
                        <HUDLabel variant="dim" style={{ fontSize: '0.52rem' }}>{featured.length} ENTRIES</HUDLabel>
                    </div>
                    <div
                        ref={featuredRef}
                        className="knowledge-system__grid"
                        style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                            gap: 14, marginBottom: 36,
                        }}
                    >
                        {featured.map((e) => (
                            <TransmissionCard
                                key={e.id}
                                entry={e}
                                variant="featured"
                                onOpen={() => setActiveEntry(e)}
                            />
                        ))}
                    </div>
                </>
            )}

            {/* ── Archive list ──────────────────── */}
            {archiveList.length > 0 && (
                <div className="knowledge-system__archive">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                        <HUDLabel variant="dim" style={{ fontSize: '0.56rem', letterSpacing: '0.20em' }}>
                            {filter === 'all' ? 'FULL ARCHIVE' : SIGNAL_CATEGORIES[filter].label}
                        </HUDLabel>
                        <GlowLine color="dim" style={{ flex: 1 }} />
                        <HUDLabel variant="dim" style={{ fontSize: '0.52rem' }}>{archiveList.length} ENTRIES</HUDLabel>
                    </div>

                    {/* Column headers */}
                    <div style={{
                        display: 'grid', gridTemplateColumns: '68px 1fr auto',
                        gap: 16, padding: '6px 0',
                        borderBottom: '1px solid rgba(255,255,255,0.07)',
                        marginBottom: 2,
                    }}>
                        <HUDLabel variant="dim" style={{ fontSize: '0.48rem', letterSpacing: '0.20em' }}>ID</HUDLabel>
                        <HUDLabel variant="dim" style={{ fontSize: '0.48rem', letterSpacing: '0.20em' }}>TRANSMISSION</HUDLabel>
                        <HUDLabel variant="dim" style={{ fontSize: '0.48rem', letterSpacing: '0.20em', textAlign: 'right' }}>DATE / TIME</HUDLabel>
                    </div>

                    <div ref={listRef}>
                        {archiveList.map((e) => (
                            <TransmissionCard
                                key={e.id}
                                entry={e}
                                variant="compact"
                                onOpen={() => setActiveEntry(e)}
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* ── Footer strip ──────────────────── */}
            <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                flexWrap: 'wrap', gap: 12, marginTop: 24,
                paddingTop: 18, borderTop: '1px solid var(--color-border-subtle)',
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <StatusIndicator status="online" showPing size="sm" label="SIGNAL LOG ACTIVE" />
                    <GlowLine color="dim" direction="vertical" length="14px" />
                    <HUDLabel variant="dim" style={{ fontSize: '0.54rem' }}>
                        CLICK ANY ENTRY TO OPEN READER
                    </HUDLabel>
                </div>
                <CommandButton
                    variant="ghost" size="sm"
                    onClick={() => window.open('https://github.com', '_blank', 'noopener')}
                >
                    VIEW ALL WRITING →
                </CommandButton>
            </div>

            {/* ── Article reader ────────────────── */}
            {activeEntry && (
                <ArticleReader
                    entry={activeEntry}
                    onClose={() => setActiveEntry(null)}
                    onNavigate={handleNavigate}
                />
            )}
        </section>
    )
}
