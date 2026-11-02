// ─────────────────────────────────────────────────────────────────────────────
//  CINEMATIC TRANSITION SYSTEM
//
//  Architecture:
//  ─ One ScrollTrigger per section-boundary, all scrubbed.
//  ─ Each trigger animates shared "environment layer" elements:
//    atmospheric overlay, HUD accent, vignette, scan-line, glyph watermark.
//  ─ Section content enters via its own light fade-up (handled per-section).
//  ─ Respects prefers-reduced-motion: skips all transitions, elements stay static.
//  ─ All targets are CSS custom properties on :root or dedicated DOM nodes
//    injected by the TransitionEnvironment component.
// ─────────────────────────────────────────────────────────────────────────────

import { gsap, ScrollTrigger } from './animation'
import type { SectionId } from '@/store/useAppStore'

// ── Section environment config ────────────────────────────────────────────────

export interface SectionEnv {
    /** Primary accent color for this section */
    accent: string
    /** Secondary/complementary color */
    accent2: string
    /** Background atmosphere radial tint (CSS color) */
    atmoColor: string
    /** Vignette intensity 0-1 */
    vignette: number
    /** Grid opacity 0-1 */
    grid: number
    /** Scan-line glyph text shown as watermark */
    glyph: string
    /** Short descriptor shown in bottom-left env label */
    envLabel: string
}

export const SECTION_ENVS: Record<SectionId, SectionEnv> = {
    hero: {
        accent: '#38bdf8',
        accent2: '#7dd3fc',
        atmoColor: 'rgba(56,189,248,0.06)',
        vignette: 0.65,
        grid: 0.04,
        glyph: '// ENTRY',
        envLabel: 'VOID INTERFACE v1.0',
    },
    about: {
        accent: '#a78bfa',
        accent2: '#c4b5fd',
        atmoColor: 'rgba(167,139,250,0.05)',
        vignette: 0.55,
        grid: 0.03,
        glyph: '// IDENTITY',
        envLabel: 'PROFILE MODULE',
    },
    skills: {
        accent: '#38bdf8',
        accent2: '#34d399',
        atmoColor: 'rgba(56,189,248,0.04)',
        vignette: 0.45,
        grid: 0.06,
        glyph: '// CONSTELLATION',
        envLabel: 'SKILL MATRIX',
    },
    experience: {
        accent: '#a78bfa',
        accent2: '#f472b6',
        atmoColor: 'rgba(167,139,250,0.04)',
        vignette: 0.55,
        grid: 0.03,
        glyph: '// TRAJECTORY',
        envLabel: 'MISSION LOG',
    },
    projects: {
        accent: '#38bdf8',
        accent2: '#e879f9',
        atmoColor: 'rgba(56,189,248,0.05)',
        vignette: 0.50,
        grid: 0.07,
        glyph: '// LAB',
        envLabel: 'DIGITAL LAB',
    },
    blog: {
        accent: '#a78bfa',
        accent2: '#94a3b8',
        atmoColor: 'rgba(167,139,250,0.04)',
        vignette: 0.60,
        grid: 0.03,
        glyph: '// TRANSMISSION',
        envLabel: 'KNOWLEDGE SYSTEM',
    },
    contact: {
        accent: '#34d399',
        accent2: '#38bdf8',
        atmoColor: 'rgba(52,211,153,0.03)',
        vignette: 0.70,
        grid: 0.025,
        glyph: '// CHANNEL',
        envLabel: 'OPEN CHANNEL',
    },
}

// ── Transition narrative per boundary ─────────────────────────────────────────
// Each boundary describes what visually happens as the user crosses from A → B.

export interface TransitionBoundary {
    from: SectionId
    to: SectionId
    /**
     * Narrative description (used for comments / future accessibility).
     * "The particle field reorganizes into a network"
     */
    narrative: string
    /** CSS filter blur applied to content during the transition peak (px) */
    peakBlur: number
    /** Scale applied at the transition midpoint */
    peakScale: number
    /** Opacity of atmospheric overlay at peak */
    peakAtmoOpacity: number
    /** Duration of the scrub ease — lower = snappier */
    scrubFactor: number
}

export const TRANSITION_BOUNDARIES: TransitionBoundary[] = [
    {
        from: 'hero', to: 'about',
        narrative: 'The entry environment softens. Stars drift. Identity surfaces.',
        peakBlur: 1.5, peakScale: 1.002, peakAtmoOpacity: 0.12, scrubFactor: 1.2,
    },
    {
        from: 'about', to: 'skills',
        narrative: 'Profile dissolves into a constellation. The particle field reorganizes into a network.',
        peakBlur: 2, peakScale: 1.003, peakAtmoOpacity: 0.10, scrubFactor: 1.0,
    },
    {
        from: 'skills', to: 'experience',
        narrative: 'The network contracts into a trajectory. Data points become milestones.',
        peakBlur: 2, peakScale: 1.002, peakAtmoOpacity: 0.12, scrubFactor: 1.1,
    },
    {
        from: 'experience', to: 'projects',
        narrative: 'The trajectory evolves into the Digital Laboratory. Modules initialize.',
        peakBlur: 1.8, peakScale: 1.003, peakAtmoOpacity: 0.11, scrubFactor: 1.0,
    },
    {
        from: 'projects', to: 'blog',
        narrative: 'The lab interface shifts into a transmission archive. Signal detected.',
        peakBlur: 1.5, peakScale: 1.002, peakAtmoOpacity: 0.10, scrubFactor: 1.1,
    },
    {
        from: 'blog', to: 'contact',
        narrative: 'The environment quiets. One channel remains open.',
        peakBlur: 1.2, peakScale: 1.001, peakAtmoOpacity: 0.08, scrubFactor: 1.3,
    },
]

// ── DOM element IDs for the environment layer ─────────────────────────────────
// These are injected by the TransitionEnvironment React component.

export const ENV_IDS = {
    atmoOverlay: 'env-atmo-overlay',
    vignetteOverlay: 'env-vignette',
    gridOverlay: 'env-grid',
    scanLine: 'env-scan-line',
    glyphWatermark: 'env-glyph',
    envLabel: 'env-label',
    transitionFlash: 'env-flash',
    hudAccentTop: 'env-hud-top',
    hudAccentBottom: 'env-hud-bottom',
} as const

// ── Core setup function ───────────────────────────────────────────────────────

export function setupTransitions(
    scrollEl: HTMLElement,
    reducedMotion: boolean,
): () => void {
    if (reducedMotion) return () => { }

    const triggers: ScrollTrigger[] = []
    const SCROLLER = scrollEl

    const getEl = (id: string) => document.getElementById(id)

    // ── Per-boundary scrubbed transition ─────────────────────────────────────
    TRANSITION_BOUNDARIES.forEach((boundary) => {
        const fromEl = document.getElementById(boundary.from)
        const toEl = document.getElementById(boundary.to)
        if (!fromEl || !toEl) return

        const toEnv = SECTION_ENVS[boundary.to]
        const fromEnv = SECTION_ENVS[boundary.from]

        // 1. Atmospheric overlay color transition
        const atmoEl = getEl(ENV_IDS.atmoOverlay)
        if (atmoEl) {
            const tl = gsap.timeline({
                scrollTrigger: {
                    trigger: toEl,
                    scroller: SCROLLER,
                    start: 'top 80%',
                    end: 'top 20%',
                    scrub: boundary.scrubFactor,
                    onEnter: () => {
                        gsap.to(atmoEl, { background: toEnv.atmoColor, duration: 0.8, ease: 'power2.out' })
                    },
                    onLeaveBack: () => {
                        gsap.to(atmoEl, { background: fromEnv.atmoColor, duration: 0.6, ease: 'power2.out' })
                    },
                },
            })
            triggers.push(tl.scrollTrigger!)
        }

        // 2. Vignette intensity shift
        const vigEl = getEl(ENV_IDS.vignetteOverlay)
        if (vigEl) {
            const st = ScrollTrigger.create({
                trigger: toEl,
                scroller: SCROLLER,
                start: 'top 70%',
                end: 'top 30%',
                scrub: boundary.scrubFactor * 1.5,
                onUpdate: (self) => {
                    const progress = self.progress
                    const vigStrength = gsap.utils.interpolate(fromEnv.vignette, toEnv.vignette, progress)
                    vigEl.style.opacity = String(vigStrength)
                },
            })
            triggers.push(st)
        }

        // 3. Grid opacity shift
        const gridEl = getEl(ENV_IDS.gridOverlay)
        if (gridEl) {
            const st = ScrollTrigger.create({
                trigger: toEl,
                scroller: SCROLLER,
                start: 'top 75%',
                end: 'top 25%',
                scrub: boundary.scrubFactor * 1.2,
                onUpdate: (self) => {
                    const opacity = gsap.utils.interpolate(fromEnv.grid, toEnv.grid, self.progress)
                    gridEl.style.opacity = String(opacity)
                },
            })
            triggers.push(st)
        }
    })

    // ── Glyph watermark update per section ────────────────────────────────────
    Object.entries(SECTION_ENVS).forEach(([sectionId, env]) => {
        const sEl = document.getElementById(sectionId)
        if (!sEl) return
        const glyphEl = getEl(ENV_IDS.glyphWatermark)
        const labelEl = getEl(ENV_IDS.envLabel)

        const st = ScrollTrigger.create({
            trigger: sEl,
            scroller: SCROLLER,
            start: 'top center',
            onEnter: () => {
                if (glyphEl) {
                    gsap.to(glyphEl, {
                        opacity: 0, duration: 0.2, ease: 'power1.in',
                        onComplete: () => {
                            glyphEl.textContent = env.glyph
                            gsap.to(glyphEl, { opacity: 0.03, duration: 0.8, ease: 'power2.out' })
                        },
                    })
                }
                if (labelEl) {
                    gsap.to(labelEl, {
                        opacity: 0, duration: 0.15, ease: 'power1.in',
                        onComplete: () => {
                            labelEl.textContent = env.envLabel
                            gsap.to(labelEl, { opacity: 1, duration: 0.4, ease: 'power2.out' })
                        },
                    })
                }
            },
            onEnterBack: () => {
                if (glyphEl) {
                    gsap.to(glyphEl, {
                        opacity: 0, duration: 0.2,
                        onComplete: () => {
                            glyphEl.textContent = env.glyph
                            gsap.to(glyphEl, { opacity: 0.03, duration: 0.6 })
                        },
                    })
                }
                if (labelEl) {
                    gsap.to(labelEl, {
                        opacity: 0, duration: 0.12,
                        onComplete: () => {
                            labelEl.textContent = env.envLabel
                            gsap.to(labelEl, { opacity: 1, duration: 0.35 })
                        },
                    })
                }
            },
        })
        triggers.push(st)
    })

    // ── HUD accent line transitions ───────────────────────────────────────────
    Object.entries(SECTION_ENVS).forEach(([sectionId, env]) => {
        const sEl = document.getElementById(sectionId)
        if (!sEl) return
        const topEl = getEl(ENV_IDS.hudAccentTop)
        const botEl = getEl(ENV_IDS.hudAccentBottom)

        const st = ScrollTrigger.create({
            trigger: sEl,
            scroller: SCROLLER,
            start: 'top 55%',
            onEnter: () => {
                if (topEl) gsap.to(topEl, { background: env.accent, duration: 0.9, ease: 'power2.out' })
                if (botEl) gsap.to(botEl, { background: env.accent2, duration: 0.9, ease: 'power2.out' })
            },
            onEnterBack: () => {
                if (topEl) gsap.to(topEl, { background: env.accent, duration: 0.7, ease: 'power2.out' })
                if (botEl) gsap.to(botEl, { background: env.accent2, duration: 0.7, ease: 'power2.out' })
            },
        })
        triggers.push(st)
    })

    // ── Scan line — periodic sweep that continues always ─────────────────────
    const scanEl = getEl(ENV_IDS.scanLine)
    if (scanEl) {
        gsap.to(scanEl, {
            top: '110%',
            duration: 8,
            ease: 'none',
            repeat: -1,
            onRepeat: () => {
                gsap.set(scanEl, { top: '-2%' })
            },
        })
    }

    return () => {
        triggers.forEach((t) => t?.kill())
    }
}
