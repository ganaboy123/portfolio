// ── Class merging helper ───────────────────────
export function cn(...classes: (string | undefined | null | false)[]): string {
    return classes.filter(Boolean).join(' ')
}

// ── Number utils ───────────────────────────────
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t
export const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v))
export const map = (v: number, a: number, b: number, c: number, d: number) =>
    c + ((v - a) / (b - a)) * (d - c)
export const degToRad = (deg: number) => (deg * Math.PI) / 180

// ── Format helpers ─────────────────────────────
export const padZero = (n: number, len = 2) => String(n).padStart(len, '0')

export function formatDate(dateStr: string): string {
    return new Intl.DateTimeFormat('en-US', {
        year: 'numeric', month: 'long', day: 'numeric',
    }).format(new Date(dateStr))
}

// ── GPU detection (simple) ─────────────────────
export function detectGpuTier(): 0 | 1 | 2 | 3 {
    try {
        const canvas = document.createElement('canvas')
        const gl = canvas.getContext('webgl2') || canvas.getContext('webgl')
        if (!gl) return 0
        const ext = (gl as WebGLRenderingContext).getExtension('WEBGL_debug_renderer_info')
        if (!ext) return 2
        const renderer = (gl as WebGLRenderingContext)
            .getParameter(ext.UNMASKED_RENDERER_WEBGL) as string
        const r = renderer.toLowerCase()
        if (r.includes('swiftshader') || r.includes('llvmpipe') || r.includes('software')) return 0
        if (r.includes('intel') && !r.includes('iris')) return 1
        if (r.includes('nvidia') || r.includes('amd') || r.includes('apple m') || r.includes('iris')) return 3
        return 2
    } catch {
        return 1
    }
}
