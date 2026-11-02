import { useEffect, useRef } from 'react'
import { useAppStore } from '@/store/useAppStore'

/**
 * A fixed SVG journey line whose draw progress mirrors the portfolio's scroll position.
 * It is decorative: all section navigation remains available without it.
 */
export function ScrollJourneyLine() {
    const pathRef = useRef<SVGPathElement>(null)
    const reducedMotion = useAppStore((state) => state.reducedMotion)

    useEffect(() => {
        const path = pathRef.current
        const scroller = document.getElementById('main-scroll')
        if (!path || !scroller) return

        const length = path.getTotalLength()
        path.style.strokeDasharray = String(length)

        let frame = 0
        const update = () => {
            frame = 0
            const maxScroll = Math.max(1, scroller.scrollHeight - scroller.clientHeight)
            const progress = Math.min(1, Math.max(0, scroller.scrollTop / maxScroll))
            path.style.strokeDashoffset = String(length * (1 - progress))
        }

        const requestUpdate = () => {
            if (!frame) frame = window.requestAnimationFrame(update)
        }

        update()
        scroller.addEventListener('scroll', requestUpdate, { passive: true })
        window.addEventListener('resize', requestUpdate)

        return () => {
            scroller.removeEventListener('scroll', requestUpdate)
            window.removeEventListener('resize', requestUpdate)
            if (frame) window.cancelAnimationFrame(frame)
        }
    }, [])

    return (
        <div className={'scroll-journey' + (reducedMotion ? ' scroll-journey--static' : '')} aria-hidden="true">
            <svg viewBox="0 0 80 1000" preserveAspectRatio="none" focusable="false">
                <path className="scroll-journey__track" d="M40 0 C14 130 66 220 40 335 S15 540 40 670 S67 850 40 1000" />
                <path ref={pathRef} className="scroll-journey__progress" d="M40 0 C14 130 66 220 40 335 S15 540 40 670 S67 850 40 1000" />
                {[90, 250, 425, 590, 760, 920].map((y) => (
                    <circle key={y} className="scroll-journey__node" cx="40" cy={y} r="3.4" />
                ))}
            </svg>
        </div>
    )
}
