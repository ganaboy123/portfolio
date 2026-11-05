import { useEffect, useRef } from 'react'
import { useAppStore } from '@/store/useAppStore'
import { setupTransitions, SECTION_ENVS, ENV_IDS } from '@/lib/transitions'

/**
 * A quiet spatial transition layer. It carries only atmosphere and depth so the
 * work itself, rather than decorative HUD elements, remains the focal point.
 */
export function TransitionEnvironment() {
    const reducedMotion = useAppStore((s) => s.reducedMotion)
    const hasSetup = useRef(false)
    const cleanupRef = useRef<(() => void) | null>(null)
    const activeSection = useAppStore((s) => s.activeSection)
    const environment = SECTION_ENVS[activeSection]

    useEffect(() => {
        const scrollEl = document.getElementById('main-scroll')
        if (!scrollEl || hasSetup.current) return
        hasSetup.current = true
        cleanupRef.current = setupTransitions(scrollEl, reducedMotion)
        return () => {
            cleanupRef.current?.()
            cleanupRef.current = null
            hasSetup.current = false
        }
    }, [reducedMotion])

    return (
        <div aria-hidden style={{ position: 'fixed', inset: 0, zIndex: 5, pointerEvents: 'none' }}>
            <div
                id={ENV_IDS.atmoOverlay}
                style={{ position: 'absolute', inset: 0, background: environment.atmoColor, transition: reducedMotion ? 'none' : 'background 1150ms cubic-bezier(0.16, 1, 0.3, 1)' }}
            />
            <div
                id={ENV_IDS.vignetteOverlay}
                style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 45%, transparent 40%, rgba(3, 5, 17, 0.72) 100%)', opacity: environment.vignette, transition: reducedMotion ? 'none' : 'opacity 1150ms cubic-bezier(0.16, 1, 0.3, 1)' }}
            />
        </div>
    )
}
