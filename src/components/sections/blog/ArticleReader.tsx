import { useEffect, useRef, useState, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { gsap } from '@/lib/animation'
import {
    type SignalEntry,
    SIGNAL_CATEGORIES,
    SIGNAL_TYPES,
    formatSignalDate,
    getRelated,
    signalLog,
} from '@/data/signal-log'
import { HUDLabel } from '@/components/ui/primitives/HUDLabel'
import { GlowLine } from '@/components/ui/primitives/GlowLine'
import { CommandButton } from '@/components/ui/primitives/CommandButton'
import { useCursor } from '@/hooks/useCursor'
import { useAudioFeedback } from '@/store/useAudioStore'

// ── Simple markdown-to-JSX renderer ──────────────────────────────────────────
// Handles: headings, code blocks, inline code, bold, paragraphs, tables, lists.
// Replace with remark/rehype in production for full MDX support.
function renderMarkdown(md: string, accentColor: string): React.ReactNode[] {
    const lines = md.split('\n')
    const nodes: React.ReactNode[] = []
    let i = 0

    const textStyles: React.CSSProperties = {
        fontSize: 'clamp(1rem, 1.2vw, 1.0625rem)',
        color: 'var(--color-text-secondary)',
        lineHeight: 1.85,
        marginBottom: '1.25em',
        fontFamily: 'var(--font-sans)',
    }

    while (i < lines.length) {
        const line = lines[i]

        // Fenced code block
        if (line.startsWith('```')) {
            const lang = line.slice(3).trim()
            const codeLines: string[] = []
            i++
            while (i < lines.length && !lines[i].startsWith('```')) {
                codeLines.push(lines[i])
                i++
            }
            nodes.push(
                <div key={`code-${i}`} style={{ marginBottom: '1.5em' }}>
                    {lang && (
                        <div style={{
                            fontFamily: 'var(--font-mono)', fontSize: '0.58rem',
                            letterSpacing: '0.18em', color: `${accentColor}88`,
                            textTransform: 'uppercase', marginBottom: 6,
                        }}>
                            {lang}
                        </div>
                    )}
                    <pre style={{
                        fontFamily: 'var(--font-mono)', fontSize: '0.82rem',
                        lineHeight: 1.65, overflowX: 'auto',
                        background: 'rgba(0,0,0,0.45)',
                        border: `1px solid ${accentColor}18`,
                        borderLeft: `2px solid ${accentColor}55`,
                        borderRadius: 'var(--radius-sm)',
                        padding: '16px 20px',
                        color: 'var(--color-text-primary)',
                        margin: 0,
                    }}>
                        <code>{codeLines.join('\n')}</code>
                    </pre>
                </div>
            )
            i++
            continue
        }

        // Table (starts with |)
        if (line.startsWith('|')) {
            const tableLines: string[] = []
            while (i < lines.length && lines[i].startsWith('|')) {
                tableLines.push(lines[i])
                i++
            }
            const rows = tableLines
                .filter((r) => !r.match(/^\|[-| ]+\|$/))
                .map((r) => r.split('|').filter((_, ci) => ci > 0 && ci < r.split('|').length - 1).map((c) => c.trim()))

            nodes.push(
                <div key={`table-${i}`} style={{ overflowX: 'auto', marginBottom: '1.5em' }}>
                    <table style={{
                        width: '100%', borderCollapse: 'collapse',
                        fontFamily: 'var(--font-mono)', fontSize: '0.78rem',
                    }}>
                        <thead>
                            <tr>
                                {rows[0]?.map((cell, ci) => (
                                    <th key={ci} style={{
                                        padding: '8px 12px', textAlign: 'left',
                                        borderBottom: `1px solid ${accentColor}30`,
                                        color: accentColor, letterSpacing: '0.10em',
                                        fontWeight: 400, fontSize: '0.64rem',
                                        textTransform: 'uppercase',
                                    }}>
                                        {cell}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {rows.slice(1).map((row, ri) => (
                                <tr key={ri} style={{ borderBottom: `1px solid rgba(255,255,255,0.04)` }}>
                                    {row.map((cell, ci) => (
                                        <td key={ci} style={{
                                            padding: '8px 12px',
                                            color: 'var(--color-text-secondary)',
                                        }}>
                                            {cell}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )
            continue
        }

        // Headings
        const h3 = line.match(/^### (.+)/)
        const h2 = line.match(/^## (.+)/)
        const h1 = line.match(/^# (.+)/)

        if (h1 || h2 || h3) {
            const level = h1 ? 1 : h2 ? 2 : 3
            const text = (h1 || h2 || h3)![1]
            const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-')
            nodes.push(
                <div key={`h-${i}`} id={id} style={{ marginBottom: '0.75em', marginTop: level === 1 ? '2.5em' : '1.75em' }}>
                    {level === 2 && <GlowLine color="dim" intensity="subtle" style={{ marginBottom: 12 }} />}
                    <h3 style={{
                        fontFamily: 'var(--font-display)',
                        fontSize: level === 1 ? 'clamp(1.375rem, 2vw, 1.625rem)' : level === 2 ? 'clamp(1.125rem, 1.6vw, 1.25rem)' : '1rem',
                        fontWeight: 300,
                        letterSpacing: '-0.025em',
                        color: 'var(--color-text-primary)',
                        lineHeight: 1.25,
                    }}>
                        {text}
                    </h3>
                </div>
            )
            i++
            continue
        }

        // Unordered list
        if (line.match(/^[*\-] .+/)) {
            const items: string[] = []
            while (i < lines.length && lines[i].match(/^[*\-] .+/)) {
                items.push(lines[i].replace(/^[*\-] /, ''))
                i++
            }
            nodes.push(
                <ul key={`ul-${i}`} style={{ margin: '0 0 1.25em 0', padding: 0, listStyle: 'none' }}>
                    {items.map((item, ii) => (
                        <li key={ii} style={{
                            display: 'flex', alignItems: 'flex-start', gap: 10,
                            marginBottom: 6,
                        }}>
                            <span style={{ width: 4, height: 4, borderRadius: '50%', background: accentColor, marginTop: 10, flexShrink: 0 }} />
                            <span style={{ ...textStyles, marginBottom: 0 }} dangerouslySetInnerHTML={{ __html: inlineFormat(item) }} />
                        </li>
                    ))}
                </ul>
            )
            continue
        }

        // Empty line
        if (line.trim() === '') { i++; continue }

        // Paragraph
        nodes.push(
            <p key={`p-${i}`} style={textStyles}
                dangerouslySetInnerHTML={{ __html: inlineFormat(line) }}
            />
        )
        i++
    }

    return nodes
}

function inlineFormat(text: string): string {
    return text
        .replace(/\*\*(.+?)\*\*/g, '<strong style="color:var(--color-text-primary);font-weight:500">$1</strong>')
        .replace(/`(.+?)`/g, '<code style="font-family:var(--font-mono);font-size:0.85em;background:rgba(255,255,255,0.07);padding:1px 5px;border-radius:3px">$1</code>')
}

// ── Table of contents ─────────────────────────────────────────────────────────
function TableOfContents({
    entry,
    activeId,
    accentColor,
    onSelect,
}: {
    entry: SignalEntry
    activeId: string
    accentColor: string
    onSelect: (id: string) => void
}) {
    const cursor = useCursor()

    if (!entry.toc || entry.toc.length === 0) return null

    return (
        <div>
            <HUDLabel variant="dim" style={{ display: 'block', marginBottom: 12, fontSize: '0.52rem', letterSpacing: '0.22em' }}>
                CONTENTS
            </HUDLabel>
            <nav aria-label="Table of contents">
                {entry.toc.map((item) => {
                    const isActive = activeId === item.id
                    return (
                        <button
                            key={item.id}
                            onClick={() => onSelect(item.id)}
                            onMouseEnter={() => cursor.set('hover', item.label)}
                            onMouseLeave={cursor.reset}
                            style={{
                                display: 'block', width: '100%', textAlign: 'left',
                                background: 'none', border: 'none', cursor: 'none',
                                paddingLeft: item.level === 1 ? 0 : item.level === 2 ? 12 : 20,
                                paddingTop: 5, paddingBottom: 5,
                                fontFamily: 'var(--font-mono)',
                                fontSize: item.level === 1 ? '0.60rem' : '0.57rem',
                                letterSpacing: '0.08em',
                                color: isActive ? accentColor : 'var(--color-text-tertiary)',
                                transition: 'color 180ms',
                                lineHeight: 1.4,
                                borderLeft: `1px solid ${isActive ? accentColor + '55' : 'rgba(255,255,255,0.06)'}`,
                                paddingRight: 8,
                                marginBottom: 1,
                            }}
                        >
                            {isActive && (
                                <span style={{ color: accentColor, marginRight: 5, fontSize: '0.55rem' }}>›</span>
                            )}
                            {item.label}
                        </button>
                    )
                })}
            </nav>
        </div>
    )
}

// ── Progress bar ──────────────────────────────────────────────────────────────
function ReadingProgress({ progress, color }: { progress: number; color: string }) {
    return (
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, zIndex: 10 }}>
            <div style={{
                height: '100%', background: `${color}60`,
                width: `${progress * 100}%`, transition: 'width 60ms linear',
            }} />
            <div style={{
                position: 'absolute', right: 0, top: 0,
                height: 2, width: 4, background: color,
                boxShadow: `0 0 6px ${color}`,
                transform: `translateX(${(1 - progress) * 100}%)`,
                opacity: progress > 0.02 ? 1 : 0, transition: 'opacity 0.3s',
            }} />
        </div>
    )
}

// ── Related articles ──────────────────────────────────────────────────────────
function RelatedArticles({
    entry,
    onOpen,
    accentColor,
}: {
    entry: SignalEntry
    onOpen: (e: SignalEntry) => void
    accentColor: string
}) {
    const related = getRelated(entry, signalLog)
    const cursor = useCursor()
    if (related.length === 0) return null

    return (
        <div style={{ marginTop: 48, paddingTop: 28, borderTop: `1px solid ${accentColor}14` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                <HUDLabel variant="dim" style={{ fontSize: '0.56rem', letterSpacing: '0.22em' }}>RELATED TRANSMISSIONS</HUDLabel>
                <GlowLine color="dim" style={{ flex: 1 }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {related.map((r) => {
                    const cat = SIGNAL_CATEGORIES[r.category]
                    return (
                        <button
                            key={r.id}
                            onClick={() => onOpen(r)}
                            onMouseEnter={() => cursor.set('hover', 'READ')}
                            onMouseLeave={cursor.reset}
                            style={{
                                background: 'rgba(255,255,255,0.02)',
                                border: `1px solid rgba(255,255,255,0.06)`,
                                borderRadius: 'var(--radius-sm)',
                                padding: '12px 16px',
                                textAlign: 'left', cursor: 'none',
                                display: 'flex', alignItems: 'center', gap: 14,
                                transition: 'border-color 180ms, background 180ms',
                            }}
                        >
                            <div style={{ flexShrink: 0 }}>
                                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.52rem', letterSpacing: '0.18em', color: cat.color + '80', marginBottom: 2 }}>
                                    {r.transmissionId}
                                </div>
                                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.50rem', color: 'var(--color-text-tertiary)', letterSpacing: '0.10em' }}>
                                    {r.readTime}m
                                </div>
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.9rem', color: 'var(--color-text-secondary)', letterSpacing: '-0.01em', marginBottom: 2, lineHeight: 1.3 }}>
                                    {r.title}
                                </div>
                                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.52rem', color: cat.color, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                                    {cat.label}
                                </div>
                            </div>
                            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.58rem', color: cat.color, flexShrink: 0 }}>→</span>
                        </button>
                    )
                })}
            </div>
        </div>
    )
}

// ── Main ArticleReader ────────────────────────────────────────────────────────
interface ArticleReaderProps {
    entry: SignalEntry
    onClose: () => void
    onNavigate: (e: SignalEntry) => void
}

function ReaderInner({ entry, onClose, onNavigate }: ArticleReaderProps) {
    const backdropRef = useRef<HTMLDivElement>(null)
    const panelRef = useRef<HTMLDivElement>(null)
    const headerRef = useRef<HTMLDivElement>(null)
    const articleRef = useRef<HTMLDivElement>(null)
    const bodyRef = useRef<HTMLDivElement>(null)
    const cursor = useCursor()
    const audio = useAudioFeedback()

    const [readProgress, setReadProgress] = useState(0)
    const [activeTocId, setActiveTocId] = useState(entry.toc[0]?.id ?? '')
    const [showToc, setShowToc] = useState(true)

    const catMeta = SIGNAL_CATEGORIES[entry.category]
    const color = catMeta.color

    // ── Entrance animation ────────────────────────
    useEffect(() => {
        audio.open()
        const ctx = gsap.context(() => {
            const tl = gsap.timeline()
            tl.fromTo(backdropRef.current, { opacity: 0 }, { opacity: 1, duration: 0.3, ease: 'power2.out' })
            tl.fromTo(panelRef.current,
                { x: '100%' },
                { x: '0%', duration: 0.6, ease: 'expo.out' }, '-=0.1')
            tl.fromTo(headerRef.current,
                { y: -16, opacity: 0 },
                { y: 0, opacity: 1, duration: 0.5, ease: 'expo.out' }, '-=0.35')
            tl.fromTo(articleRef.current,
                { opacity: 0, y: 20 },
                { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }, '-=0.25')
        })
        return () => ctx.revert()
    }, [entry.id])

    const handleClose = useCallback(() => {
        audio.click()
        const tl = gsap.timeline({ onComplete: onClose })
        tl.to(panelRef.current, { x: '100%', duration: 0.4, ease: 'power2.in' })
        tl.to(backdropRef.current, { opacity: 0, duration: 0.25 }, '<+=0.1')
    }, [onClose])

    useEffect(() => {
        const h = (e: KeyboardEvent) => { if (e.key === 'Escape') handleClose() }
        window.addEventListener('keydown', h)
        return () => window.removeEventListener('keydown', h)
    }, [handleClose])

    useEffect(() => {
        document.body.style.overflow = 'hidden'
        return () => { document.body.style.overflow = '' }
    }, [])

    // Reading progress
    const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
        const el = e.currentTarget
        const progress = el.scrollTop / (el.scrollHeight - el.clientHeight)
        setReadProgress(isNaN(progress) ? 0 : Math.min(1, progress))

        // Update active ToC section
        if (entry.toc.length > 0 && bodyRef.current) {
            for (let i = entry.toc.length - 1; i >= 0; i--) {
                const sectionEl = bodyRef.current.querySelector(`#${entry.toc[i].id}`)
                if (sectionEl) {
                    const rect = sectionEl.getBoundingClientRect()
                    if (rect.top < 200) {
                        setActiveTocId(entry.toc[i].id)
                        break
                    }
                }
            }
        }
    }, [entry.toc])

    const scrollToSection = (id: string) => {
        audio.click()
        const el = bodyRef.current?.querySelector(`#${id}`) as HTMLElement | null
        if (!el || !bodyRef.current?.parentElement) return
        const container = bodyRef.current.parentElement
        const offset = el.offsetTop - 80
        container.scrollTo({ top: offset, behavior: 'smooth' })
    }

    const handleNavigate = (next: SignalEntry) => {
        gsap.to(articleRef.current, {
            opacity: 0, y: -20, duration: 0.25, ease: 'power2.in',
            onComplete: () => onNavigate(next),
        })
    }

    return (
        <>
            {/* Backdrop */}
            <div
                ref={backdropRef}
                onClick={handleClose}
                aria-hidden
                style={{
                    position: 'fixed', inset: 0,
                    background: 'rgba(3,4,10,0.75)',
                    backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)',
                    zIndex: 40,
                }}
            />

            {/* Panel — slides in from right */}
            <div
                ref={panelRef}
                role="dialog"
                aria-modal="true"
                aria-label={`${entry.title} — Article Reader`}
                style={{
                    position: 'fixed', top: 0, right: 0, bottom: 0,
                    width: 'min(920px, 100vw)',
                    zIndex: 41,
                    background: 'rgba(6,8,18,0.99)',
                    borderLeft: `1px solid ${color}22`,
                    display: 'flex', flexDirection: 'column',
                    overflow: 'hidden',
                }}
            >
                <ReadingProgress progress={readProgress} color={color} />

                {/* ── Header ────────────────────────── */}
                <div
                    ref={headerRef}
                    style={{
                        flexShrink: 0,
                        padding: '14px 28px',
                        borderBottom: '1px solid rgba(255,255,255,0.05)',
                        display: 'flex', alignItems: 'center',
                        justifyContent: 'space-between', gap: 16,
                        background: `linear-gradient(to bottom, ${color}06 0%, transparent 100%)`,
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                        <div style={{
                            fontFamily: 'var(--font-mono)', fontSize: '0.54rem',
                            letterSpacing: '0.22em', color: color, textTransform: 'uppercase',
                        }}>
                            KNOWLEDGE SYSTEM
                        </div>
                        <div style={{ width: 1, height: 14, background: 'rgba(255,255,255,0.08)' }} />
                        <div style={{
                            fontFamily: 'var(--font-mono)', fontSize: '0.52rem',
                            letterSpacing: '0.14em', color: 'var(--color-text-tertiary)',
                        }}>
                            {entry.transmissionId}
                        </div>
                        <div style={{
                            fontFamily: 'var(--font-mono)', fontSize: '0.52rem',
                            letterSpacing: '0.10em', color: color + '66',
                        }}>
                            {entry.readTime} MIN READ
                        </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        {/* Reading progress % */}
                        <span style={{
                            fontFamily: 'var(--font-mono)', fontSize: '0.54rem',
                            color: readProgress > 0.95 ? color : 'var(--color-text-tertiary)',
                            letterSpacing: '0.12em', transition: 'color 0.3s',
                        }}>
                            {Math.round(readProgress * 100)}%
                        </span>

                        {/* ToC toggle */}
                        <button
                            onClick={() => setShowToc((v) => !v)}
                            onMouseEnter={() => cursor.set('hover', 'CONTENTS')}
                            onMouseLeave={cursor.reset}
                            style={{
                                width: 28, height: 28, borderRadius: 'var(--radius-sm)',
                                background: showToc ? `${color}18` : 'none',
                                border: `1px solid ${showToc ? color + '44' : 'rgba(255,255,255,0.08)'}`,
                                color: showToc ? color : 'var(--color-text-tertiary)',
                                cursor: 'none', fontFamily: 'var(--font-mono)', fontSize: '0.65rem',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                transition: 'all 150ms',
                            }}
                            aria-label="Toggle table of contents"
                        >
                            ☰
                        </button>

                        {/* External link */}
                        {entry.externalUrl && (
                            <CommandButton
                                variant="ghost" size="sm"
                                onClick={() => window.open(entry.externalUrl!, '_blank', 'noopener')}
                                onMouseEnter={() => cursor.set('hover', 'OPEN ORIGINAL')}
                                onMouseLeave={cursor.reset}
                            >
                                ↗ ORIGINAL
                            </CommandButton>
                        )}

                        <button
                            onClick={handleClose}
                            onMouseEnter={() => cursor.set('hover')}
                            onMouseLeave={cursor.reset}
                            aria-label="Close reader"
                            style={{
                                width: 28, height: 28, borderRadius: 'var(--radius-sm)',
                                background: 'none', border: '1px solid rgba(255,255,255,0.10)',
                                color: 'var(--color-text-tertiary)', cursor: 'none',
                                fontFamily: 'var(--font-mono)', fontSize: '0.7rem',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}
                        >
                            ✕
                        </button>
                    </div>
                </div>

                {/* ── Body ──────────────────────────── */}
                <div
                    style={{ flex: 1, overflowY: 'auto', display: 'flex' }}
                    onScroll={handleScroll}
                >
                    {/* ToC sidebar */}
                    {showToc && entry.toc.length > 0 && (
                        <div style={{
                            width: 220, flexShrink: 0,
                            padding: '32px 20px 32px 28px',
                            borderRight: '1px solid rgba(255,255,255,0.04)',
                            position: 'sticky', top: 0, alignSelf: 'flex-start',
                            maxHeight: 'calc(100vh - 57px)', overflowY: 'auto',
                        }}>
                            <TableOfContents
                                entry={entry}
                                activeId={activeTocId}
                                accentColor={color}
                                onSelect={scrollToSection}
                            />
                        </div>
                    )}

                    {/* Article content */}
                    <div
                        ref={articleRef}
                        style={{
                            flex: 1, minWidth: 0,
                            padding: 'clamp(32px, 4vw, 56px) clamp(28px, 5vw, 64px) 80px',
                        }}
                    >
                        {/* Article header */}
                        <div style={{ marginBottom: 36 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
                                <span style={{
                                    fontFamily: 'var(--font-mono)', fontSize: '0.56rem',
                                    letterSpacing: '0.22em', color: color,
                                    background: `${color}14`,
                                    border: `1px solid ${color}30`,
                                    borderRadius: 2, padding: '3px 8px',
                                    textTransform: 'uppercase',
                                }}>
                                    {SIGNAL_TYPES[entry.type]}
                                </span>
                                <HUDLabel variant="dim" style={{ fontSize: '0.52rem' }}>
                                    {catMeta.label}
                                </HUDLabel>
                                <HUDLabel variant="dim" style={{ fontSize: '0.52rem' }}>
                                    {formatSignalDate(entry.date)}
                                </HUDLabel>
                            </div>

                            <h1 style={{
                                fontFamily: 'var(--font-display)',
                                fontSize: 'clamp(1.75rem, 3.5vw, 2.5rem)',
                                fontWeight: 300, letterSpacing: '-0.03em',
                                color: 'var(--color-text-primary)', lineHeight: 1.15,
                                marginBottom: 12,
                            }}>
                                {entry.title}
                            </h1>

                            <p style={{
                                fontFamily: 'var(--font-mono)', fontSize: '0.72rem',
                                letterSpacing: '0.08em', color: color,
                                textTransform: 'uppercase', marginBottom: 20,
                            }}>
                                {entry.subtitle}
                            </p>

                            {/* Tags */}
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 24 }}>
                                {entry.tags.map((tag) => (
                                    <span key={tag} style={{
                                        fontFamily: 'var(--font-mono)', fontSize: '0.56rem',
                                        letterSpacing: '0.10em', textTransform: 'uppercase',
                                        color: `${color}bb`, background: `${color}0e`,
                                        border: `1px solid ${color}25`, borderRadius: 2,
                                        padding: '3px 8px',
                                    }}>
                                        {tag}
                                    </span>
                                ))}
                            </div>

                            <GlowLine color="dim" style={{ marginBottom: 28 }} />

                            {/* Cover image */}
                            {entry.coverImage && (
                                <div style={{
                                    marginBottom: 32, borderRadius: 'var(--radius-md)',
                                    overflow: 'hidden', border: `1px solid ${color}18`,
                                }}>
                                    <img
                                        src={entry.coverImage}
                                        alt={entry.title}
                                        style={{ width: '100%', display: 'block', maxHeight: 360, objectFit: 'cover' }}
                                    />
                                </div>
                            )}
                        </div>

                        {/* Article body */}
                        <div ref={bodyRef}>
                            {entry.body
                                ? renderMarkdown(entry.body, color)
                                : (
                                    <div style={{
                                        padding: '24px 28px',
                                        background: `${color}06`,
                                        border: `1px solid ${color}18`,
                                        borderLeft: `2px solid ${color}55`,
                                        borderRadius: 'var(--radius-sm)',
                                        marginBottom: 24,
                                    }}>
                                        <HUDLabel variant="dim" style={{ display: 'block', marginBottom: 10, fontSize: '0.56rem' }}>
                                            CONTENT PLACEHOLDER
                                        </HUDLabel>
                                        <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', lineHeight: 1.7 }}>
                                            Full article body loads here. Connect a Markdown file, MDX import, CMS fetch, or API endpoint — the reader renders any string content.
                                        </p>
                                    </div>
                                )
                            }
                        </div>

                        {/* Related articles */}
                        <RelatedArticles entry={entry} onOpen={handleNavigate} accentColor={color} />
                    </div>
                </div>
            </div>
        </>
    )
}

export function ArticleReader({ entry, onClose, onNavigate }: ArticleReaderProps) {
    return createPortal(
        <ReaderInner entry={entry} onClose={onClose} onNavigate={onNavigate} />,
        document.body,
    )
}
