import { useRef } from 'react'
import type { SectionId } from '@/store/useAppStore'

/**
 * Returns a typed ref for a section element.
 *
 * Section detection is handled by Navigation.tsx via GSAP ScrollTrigger
 * (scroller: '#main-scroll'). This hook simply provides the element ref
 * so GSAP animations in each section can attach a scrollTrigger trigger.
 */
export function useScrollSection(_id: SectionId) {
    const ref = useRef<HTMLElement>(null)
    return ref
}
