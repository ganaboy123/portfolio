import { useAppStore, type CursorVariant } from '@/store/useAppStore'

export function useCursor() {
    const setCursor = useAppStore((s) => s.setCursor)

    return {
        onHover: () => setCursor('hover'),
        onLeave: () => setCursor('default'),
        onActive: () => setCursor('active'),
        onText: () => setCursor('text'),
        setLabel: (label: string) => setCursor('hover', label),
        reset: () => setCursor('default', ''),
        set: (v: CursorVariant, label?: string) => setCursor(v, label),
    }
}
