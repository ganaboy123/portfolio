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
    'TypeScript',
    'JavaScript',
    'React',
    'Next.js',
    'Node.js',
    'Python',
    'AI systems',
    'WebGL / Three.js',
    'GLSL shaders',
    'Creative coding',
    'FastAPI',
    'WebSocket',
    'PostgreSQL',
    'REST APIs',
    'Docker',
    'AWS / Cloud',
    'GitHub Actions',
    'GSAP',
    'Vite',
    'Rust / WASM',
    'Web Audio API',
    'D3.js',
    'System design',
    'Accessibility',
]

export function HeroSection({ revealed = false }: HeroSectionProps) {
    const sectionRef = useScrollSection('hero')
    const reducedMotion = useAppStore((s) => s.reducedMotion)
    const { isMobile } = useDevice()
    const [typedName, setTypedName] = useState('')

    const containerRef = useRef<HTMLDivElement>(null)
    const declarationRef = useRef<HTMLDivElement>(null)
    const nameRef = useRef<HTMLHeadingElement>(null)
    const roleRef = useRef<HTMLParagraphElement>(null)
    const codeRef = useRef<HTMLDivElement>(null)
    const ctaRef = useRef<HTMLDivElement>(null)
    const visualRef = useRef<HTMLElement>(null)

    useEffect(() => {
        if (!revealed) return
        if (reducedMotion) {
            setTypedName(personalInfo.name)
            return
        }

        setTypedName('')
        let index = 0
        let interval: number | undefined
        const startTimer = window.setTimeout(() => {
            interval = window.setInterval(() => {
                index += 1
                setTypedName(personalInfo.name.slice(0, index))
                if (index >= personalInfo.name.length && interval) window.clearInterval(interval)
            }, 135)
        }, isMobile ? 420 : 720)

        return () => {
            window.clearTimeout(startTimer)
            if (interval) window.clearInterval(interval)
        }
    }, [isMobile, reducedMotion, revealed])

    useEffect(() => {
        if (!revealed) return
        const targets = [declarationRef.current, nameRef.current, roleRef.current, codeRef.current, ctaRef.current, visualRef.current]
            .filter((element): element is HTMLElement => element !== null)

        const ctx = gsap.context(() => {
            if (reducedMotion) {
                gsap.set(targets, { opacity: 1, y: 0, scale: 1 })
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

    const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })

    return (
        <section ref={sectionRef as React.RefObject<HTMLElement>} id="hero" className="hero-console">
            <div className="hero-console__grid" aria-hidden="true" />
            <div ref={containerRef} className="hero-console__layout">
                <div className="hero-console__copy">
                    <div ref={declarationRef} className="hero-console__declaration">
                        <span>const</span> developer <i>=</i> <b>{'{'}</b>
                    </div>

                    <h1 ref={nameRef} className="hero-console__name hero-name--typing" aria-label={personalInfo.name}>
                        <span aria-hidden="true">{typedName}</span>
                        {typedName.length < personalInfo.name.length && <span className="hero-name__cursor" aria-hidden="true" />}
                    </h1>

                    <p ref={roleRef} className="hero-console__role">{personalInfo.title}</p>

                    <div ref={codeRef} className="hero-console__manifest">
                        <div className="hero-console__manifest-label">expertise: [</div>
                        <ul aria-label="Areas of expertise">
                            {EXPERTISE.map((skill) => <li key={skill}>&quot;{skill}&quot;,</li>)}
                        </ul>
                        <div className="hero-console__manifest-label">]</div>
                    </div>

                    <div ref={ctaRef} className="hero-console__actions">
                        <CommandButton variant="primary" size={isMobile ? 'md' : 'lg'} onClick={() => scrollTo('projects')}>
                            VIEW SELECTED WORK
                        </CommandButton>
                        <CommandButton variant="ghost" size={isMobile ? 'md' : 'lg'} onClick={() => scrollTo('about')}>
                            ABOUT HARRISON
                        </CommandButton>
                    </div>
                </div>

                <aside ref={visualRef} className="hero-console__mark" aria-label="Harrison Appiah: systems, intelligence, craft">
                    {/* Video — fills the visual column, blends left edge into section bg */}
                    <video
                        className="hero-console__video"
                        src="/grok-video-548e7e33-2b3b-4801-8912-fe626550927f.mp4"
                        autoPlay
                        loop
                        muted
                        playsInline
                        preload="metadata"
                    />
                    {/* Gradient overlay — fades left/top/bottom edges into the background */}
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
