import { useEffect, useState } from 'react'

export type Breakpoint = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl'
export type SceneMode = 'full' | 'lite' | 'fallback'

// Matches the responsive scale in globals.css
const BREAKPOINTS: Record<Breakpoint, number> = {
    xs: 360,
    sm: 375,
    md: 390,
    lg: 414,
    xl: 768,
    '2xl': 1024,
    '3xl': 1280,
    '4xl': 1440,
    '5xl': 1920,
}

function getBreakpoint(w: number): Breakpoint {
    if (w >= 1920) return '5xl'
    if (w >= 1440) return '4xl'
    if (w >= 1280) return '3xl'
    if (w >= 1024) return '2xl'
    if (w >= 768) return 'xl'
    if (w >= 414) return 'lg'
    if (w >= 390) return 'md'
    if (w >= 375) return 'sm'
    return 'xs'
}

function detectWebGL(): boolean {
    try {
        const canvas = document.createElement('canvas')
        const gl =
            canvas.getContext('webgl2') ||
            canvas.getContext('webgl') ||
            canvas.getContext('experimental-webgl')
        return !!gl
    } catch {
        return false
    }
}

export interface DeviceState {
    /** Primary pointer is coarse (touch) */
    isTouch: boolean
    /** Viewport width in px */
    width: number
    /** Current named breakpoint */
    breakpoint: Breakpoint
    /** True when width < 768 */
    isMobile: boolean
    /** True when 768 ≤ width < 1024 */
    isTablet: boolean
    /** True when width ≥ 1024 */
    isDesktop: boolean
    /** WebGL supported */
    hasWebGL: boolean
    /** User prefers reduced motion */
    reducedMotion: boolean
    /**
     * Low-power hint — true when:
     * - GPU tier 0 or 1 (from app store)
     * - OR navigator.hardwareConcurrency ≤ 4
     * - OR devicePixelRatio > 2.5 (high-DPR cheap phone)
     */
    isLowPower: boolean
    /** Device pixel ratio */
    dpr: number
    sceneMode: SceneMode
}

type ConnectionHints = Navigator & {
    connection?: { saveData?: boolean; effectiveType?: string }
    deviceMemory?: number
}

function getDeviceState(): DeviceState {
    const w = window.innerWidth
    const isTouch = window.matchMedia('(pointer: coarse)').matches
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const dpr = window.devicePixelRatio ?? 1
    const hints = navigator as ConnectionHints
    const cores = hints.hardwareConcurrency ?? 8
    const memory = hints.deviceMemory ?? 8
    const saveData = hints.connection?.saveData === true
    const slowConnection = ['slow-2g', '2g'].includes(hints.connection?.effectiveType ?? '')
    const isLowPower = saveData || slowConnection || memory <= 2 || (isTouch && (cores <= 4 || dpr > 2.5))
    const hasWebGL = detectWebGL()
    const sceneMode: SceneMode = !hasWebGL || isLowPower || reducedMotion
        ? 'fallback'
        : isTouch || w < 1024 ? 'lite' : 'full'

    return {
        isTouch,
        width: w,
        breakpoint: getBreakpoint(w),
        isMobile: w < 768,
        isTablet: w >= 768 && w < 1024,
        isDesktop: w >= 1024,
        hasWebGL,
        reducedMotion,
        isLowPower,
        dpr,
        sceneMode,
    }
}

export function useDevice(): DeviceState {
    const [state, setState] = useState<DeviceState>(() => {
        if (typeof window === 'undefined') {
            return {
                isTouch: false,
                width: 1280,
                breakpoint: 'xl',
                isMobile: false,
                isTablet: false,
                isDesktop: true,
                hasWebGL: false,
                reducedMotion: false,
                isLowPower: false,
                dpr: 1,
                sceneMode: 'fallback',
            }
        }
        return getDeviceState()
    })

    useEffect(() => {
        const touchMQ = window.matchMedia('(pointer: coarse)')
        const motionMQ = window.matchMedia('(prefers-reduced-motion: reduce)')

        const update = () => {
            setState(getDeviceState())
        }

        window.addEventListener('resize', update, { passive: true })
        touchMQ.addEventListener('change', update)
        motionMQ.addEventListener('change', update)

        return () => {
            window.removeEventListener('resize', update)
            touchMQ.removeEventListener('change', update)
            motionMQ.removeEventListener('change', update)
        }
    }, [])

    return state
}

// Breakpoint helpers — re-exported for convenience
export { BREAKPOINTS }
export const bp = (current: Breakpoint, min: Breakpoint): boolean =>
    BREAKPOINTS[current] >= BREAKPOINTS[min]
