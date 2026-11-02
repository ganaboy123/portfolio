import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export { gsap, ScrollTrigger }

// ── Shared GSAP eases ──────────────────────────
export const EASE_OUT_EXPO = 'expo.out'
export const EASE_IN_OUT = 'power3.inOut'
export const EASE_OUT_QUART = 'power4.out'

// ── Entrance animation presets ─────────────────
export function fadeUpIn(
    targets: gsap.TweenTarget,
    opts: gsap.TweenVars = {}
) {
    return gsap.fromTo(
        targets,
        { y: 32, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, ease: EASE_OUT_EXPO, ...opts }
    )
}

export function fadeIn(
    targets: gsap.TweenTarget,
    opts: gsap.TweenVars = {}
) {
    return gsap.fromTo(
        targets,
        { opacity: 0 },
        { opacity: 1, duration: 0.6, ease: 'power2.out', ...opts }
    )
}

export function revealClip(
    targets: gsap.TweenTarget,
    opts: gsap.TweenVars = {}
) {
    return gsap.fromTo(
        targets,
        { clipPath: 'inset(0 100% 0 0)' },
        { clipPath: 'inset(0 0% 0 0)', duration: 1.0, ease: EASE_OUT_EXPO, ...opts }
    )
}

export function staggerFadeUp(
    targets: gsap.TweenTarget,
    opts: gsap.TweenVars = {}
) {
    return gsap.fromTo(
        targets,
        { y: 24, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.7, ease: EASE_OUT_EXPO, stagger: 0.08, ...opts }
    )
}
