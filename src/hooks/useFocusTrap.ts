import { useEffect, useRef } from 'react'

const FOCUSABLE = [
    'a[href]', 'button:not([disabled])', 'input:not([disabled])',
    'select:not([disabled])', 'textarea:not([disabled])', '[tabindex]:not([tabindex="-1"])',
].join(', ')

/** Keeps keyboard focus inside an open dialog and restores it on close. */
export function useFocusTrap(
    containerRef: React.RefObject<HTMLElement | null>,
    active: boolean,
    onEscape: () => void,
) {
    const returnFocusRef = useRef<HTMLElement | null>(null)

    useEffect(() => {
        if (!active || !containerRef.current) return

        const container = containerRef.current
        returnFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null
        const getFocusable = () => Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE))
        const focusable = getFocusable()
        const initialFocus = focusable[0] ?? container
        requestAnimationFrame(() => initialFocus.focus())

        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                event.preventDefault()
                onEscape()
                return
            }
            if (event.key !== 'Tab') return

            const items = getFocusable()
            if (items.length === 0) {
                event.preventDefault()
                container.focus()
                return
            }
            const first = items[0]
            const last = items[items.length - 1]
            if (event.shiftKey && document.activeElement === first) {
                event.preventDefault()
                last.focus()
            } else if (!event.shiftKey && document.activeElement === last) {
                event.preventDefault()
                first.focus()
            }
        }

        document.addEventListener('keydown', onKeyDown)
        return () => {
            document.removeEventListener('keydown', onKeyDown)
            returnFocusRef.current?.focus()
        }
    }, [active, containerRef, onEscape])
}
