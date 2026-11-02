import { useEffect, useState } from 'react'

/**
 * Returns true if the primary input is touch-based.
 * Re-evaluates on pointer capability change (e.g. stylus connection).
 */
export function useIsTouch(): boolean {
    const [isTouch, setIsTouch] = useState<boolean>(() => {
        if (typeof window === 'undefined') return false
        return window.matchMedia('(pointer: coarse)').matches
    })

    useEffect(() => {
        const mq = window.matchMedia('(pointer: coarse)')
        const handler = (e: MediaQueryListEvent) => setIsTouch(e.matches)
        mq.addEventListener('change', handler)
        return () => mq.removeEventListener('change', handler)
    }, [])

    return isTouch
}
