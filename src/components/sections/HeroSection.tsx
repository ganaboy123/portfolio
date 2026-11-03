import { useEffect, useRef, useState } from 'react'
import { gsap } from '@/lib/animation'
import { useScrollSection } from '@/hooks/useScrollSection'
import { personalInfo } from '@/data/content'
import { CommandButton } from '@/components/ui/primitives/CommandButton'
import { useAppStore } from '@/store/useAppStore'
import { useDevice } from '@/hooks/useDevice'

interface HeroSectionProps {
    revealed?: boolean
}

const EXPERTISE = [
    'TypeScript', 'JavaScript', 'React', 'Next.js', 'Node.js',
    'Python', 'AI systems', 'WebGL / Three.js', 'GLSL shaders',
    'Creative coding', 'FastAPI', 'WebSocket', 'PostgreSQL',
    'REST APIs', 'Docker', 'AWS / Cloud', 'GitHub Actions',
    'GSAP', 'Vite', 'Rust / WASM', 'Web Audio API', 'D3.js',
    'System design', 'Accessibility',
]

// ── Continuous expertise typewriter ──────────────────────────────────────────
function ExpertiseTypewriter({ active }: { active: boolean }) {
    const [display, setDisplay] = useState('')
    const [showCursor, setShowCursor] = useState(true)
    const stateRef = useRef({
        skillIdx: 0,
        charIdx: 0,
        deleting: false,
        paused: false,
    })
    const timerRef = useRef<number | undefined>(undefined)

    useEffect(() => {
        if (!active) return

        const tick = () => {
            const s = stateRef.current
            const skill = EXPERTISE[s.skillIdx]

            if (s.paused) {
                s.paused = false
                // after pause: start deleting
                s.deleting = true
                timerRef.current = window.setTimeout(tick, 60)
                return
            }

            if (!s.deleting) {
                // typing
                s.charIdx += 1
                setDisplay(skill.slice(0, s.charIdx))
                if (s.charIdx >= skill.length) {
                    // finished typing — pause before deleting
                    s.paused = true
                    timerRef.current = window.setTimeout(tick, 1100)
                } else {
                    timerRef.current = window.setTimeout(tick, 68)
                }
            } else {
                // deleting
                s.charIdx -= 1
                setDisplay(skill.slice(0, s.charIdx))
                if (s.charIdx <= 0) {
                    // move to next skill
                    s.deleting = false
                    s.skillIdx = (s.skillIdx + 1) % EXPERTISE.length
                    timerRef.current = window.setTimeout(tick, 320)
                } else {
                    timerRef.current = window.setTimeout(tick, 38)
                }
            }
        }

        timerRef.current = window.setTimeout(tick, 400)

        // blink cursor
        const blinkInterval = window.setInterval(() => {
            setShowCursor(v => !v)
        }, 530)

        return () => {
            window.clearTimeout(timerRef.current)
            window.clearInterval(blinkInterval)
        }
    }, [active])

    return (
        <div className="hero-console__manifest">
            <div className="hero-console__manifest-label">expertise: [</div>
            <div style={{ padding: '4px 0 4px 18px', minHeight: '1.6em' }} aria-live="polite" aria-label="Current expertise">
                <span style={{ color: '#00f0d0', fontWeight: 700 }}>
                    &quot;{display}&quot;
                </span>
                <span
                    aria-hidden
                    style={{
                        display: 'inline-block',
                        width: '0.08em', height: '0.85em',
                        marginLeft: '0.06em',
                        verticalAlign: '-0.06em',
                        background: 'var(--color-accent-cyan-bright)',
                        boxShadow: '0 0 8px rgba(0,200,232,0.7)',
                        opacity: showCursor ? 1 : 0,
                        transition: 'opacity 80ms',
                    }}
                />
            </div>
            <div className="hero-console__manifest-label">]</div>
            {/* sr-only full list for accessibility */}
            <ul className="sr-only" aria-label="Full expertise list">
                {EXPERTISE.map(s => <li key={s}>{s}</li>)}
            </ul>
        </div>
    )
}

// ── Main HeroSection ──────────────────────────────────────────────────────────
export function HeroSection({ revealed = false }: HeroSectionProps) {
    const sectionRef = useScrollSection('hero')
    const reducedMotion = useAppStore((s) => s.reducedMotion)
    const { isMobile } = useDevice()
    const [typedName, setTypedName] = useState('')
    const [nameComplete, setNameComplete] = useState(false)

    const containerRef = useRef<HTMLDivElement>(null)
    const declarationRef = useRef<HTMLDivElement>(null)
    const nameRef = useRef<HTMLHeadingElement>(null)
    const roleRef = useRef<HTMLParagraphElement>(null)
    const codeRef = useRef<HTMLDivElement>(null)
    const ctaRef = useRef<HTMLDivElement>(null)
    const visualRef = useRef<HTMLElement>(null)
    const floatCtxRef = useRef<gsap.Context | null>(null)

    // ── Name typewriter (runs once) ───────────────
    useEffect(() => {
        if (!revealed) return
        if (reducedMotion) {
            setTypedName(personalInfo.name)
            setNameComplete(true)
            return
        }

        setTypedName('')
        setNameComplete(false)
        let index = 0
        let interval: number | undefined
        const startTimer = window.setTimeout(() => {
            interval = window.setInterval(() => {
                index += 1
                setTypedName(personalInfo.name.slice(0, index))
                if (index >= personalInfo.name.length) {
                    window.clearInterval(interval)
                    setNameComplete(true)
                }
            }, 120)
        }, isMobile ? 420 : 720)

        return () => {
            window.clearTimeout(startTimer)
            if (interval) window.clearInterval(interval)
        }
    }, [isMobile, reducedMotion, revealed])

    // ── Float animation — starts after name is fully typed ───────────────────
    useEffect(() => {
        if (!nameComplete || reducedMotion || !nameRef.current) return

        floatCtxRef.current?.revert()
        floatCtxRef.current = gsap.context(() => {
            gsap.to(nameRef.current, {
                y: -12,
                duration: 2.8,
                ease: 'sine.inOut',
                repeat: -1,
                yoyo: true,
            })
        })

        return () => { floatCtxRef.current?.revert() }
    }, [nameComplete, reducedMotion])

    // ── Entrance animations ───────────────────────
    useEffect(() => {
        if (!revealed) return

        const ctx = gsap.context(() => {
            if (reducedMotion) {
                gsap.set([declarationRef.current, nameRef.current, roleRef.current,
                codeRef.current, ctaRef.current, visualRef.current],
                    { opacity: 1, y: 0, scale: 1 })
                return
            }

            gsap.timeline()
                .fromTo(declarationRef.current, { opacity: 0, x: -14 }, { opacity: 1, x: 0, duration: 0.45, ease: 'power3.out' })
                .fromTo(nameRef.current, { opacity: 0, y: 26 }, { opacity: 1, y: 0, duration: 0.7, ease: 'expo.out' }, '-=0.15')
                .fromTo(roleRef.current, { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.45, ease: 'power3.out' }, '-=0.4')
                .fromTo(codeRef.current, { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out' }, '-=0.25')
                .fromTo(ctaRef.current, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.4, ease: 'power3.out' }, '-=0.25')
                .fromTo(visualRef.current, { opacity: 0, scale: 0.94 }, { opacity: 1, scale: 1, duration: 0.8, ease: 'expo.out' }, '-=0.7')
        }, containerRef)

        return () => ctx.revert()
    }, [reducedMotion, revealed])

    const scrollTo = (id: string) => {
        const scroller = document.getElementById('main-scroll')
        const target = document.getElementById(id)
        if (scroller && target) scroller.scrollTo({ top: target.offsetTop, behavior: 'smooth' })
    }

    return (
        <section ref={sectionRef as React.RefObject<HTMLElement>} id="hero" className="hero-console">
            <div className="hero-console__grid" aria-hidden="true" />
            <div ref={containerRef} className="hero-console__layout">
                <div className="hero-console__copy">

                    <div ref={declarationRef} className="hero-console__declaration">
                        <span>const</span> developer <i>=</i> <b>{'{'}</b>
                    </div>

                    {/* Floating name */}
                    <h1
                        ref={nameRef}
                        className="hero-console__name hero-name--typing"
                        aria-label={personalInfo.name}
                        style={{ display: 'inline-block' }}
                    >
                        <span aria-hidden="true">{typedName}</span>
                        {!nameComplete && (
                            <span className="hero-name__cursor" aria-hidden="true" />
                        )}
                    </h1>

                    <p ref={roleRef} className="hero-console__role">{personalInfo.title}</p>

                    {/* Continuous expertise typewriter */}
                    <div ref={codeRef}>
                        <ExpertiseTypewriter active={revealed} />
                    </div>

                    <div ref={ctaRef} className="hero-console__actions">
                        <CommandButton
                            variant="primary"
                            size={isMobile ? 'md' : 'lg'}
                            onClick={() => scrollTo('projects')}
                        >
                            VIEW SELECTED WORK
                        </CommandButton>
                        <CommandButton
                            variant="ghost"
                            size={isMobile ? 'md' : 'lg'}
                            onClick={() => scrollTo('about')}
                        >
                            ABOUT HARRISON
                        </CommandButton>
                    </div>
                </div>

                <aside
                    ref={visualRef}
                    className="hero-console__mark"
                    aria-label="Harrison Appiah: systems, intelligence, craft"
                >
                    <video
                        className="hero-console__video"
                        src="/grok-video-548e7e33-2b3b-4801-8912-fe626550927f.mp4"
                        autoPlay loop muted playsInline preload="auto"
                    />
                    <div className="hero-console__video-overlay" aria-hidden="true" />
                </aside>
            </div>

            <div className="hero-console__footer" aria-hidden="true">
                <span><i /> AVAILABLE FOR COLLABORATION</span>
                <span>01 / 05</span>
                <span>SCROLL TO EXPLORE</span>
            </div>
        </section>
    )
}
