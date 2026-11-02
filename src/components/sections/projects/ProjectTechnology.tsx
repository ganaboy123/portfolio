import { useState } from 'react'
import type { CSSProperties } from 'react'
import { useCursor } from '@/hooks/useCursor'

interface ProjectTechnologyProps {
    tech: string
    accent?: 'cyan' | 'violet'
    size?: 'sm' | 'md' | 'lg'
    showTooltip?: boolean
    style?: CSSProperties
}

/**
 * Technology chip — used in project cards and case study modals.
 * Larger "lg" size with hover glow used in the full-screen case study.
 */
export function ProjectTechnology({ tech, accent = 'cyan', size = 'sm', style }: ProjectTechnologyProps) {
    const [hovered, setHovered] = useState(false)
    const cursor = useCursor()
    const color = accent === 'cyan' ? '#38bdf8' : '#a78bfa'

    const fontSize = size === 'sm' ? '0.58rem' : size === 'md' ? '0.65rem' : '0.72rem'
    const px = size === 'sm' ? '7px' : size === 'md' ? '10px' : '12px'
    const py = size === 'sm' ? '3px' : size === 'md' ? '5px' : '6px'
    const dotSize = size === 'sm' ? 3 : 4

    return (
        <span
            onMouseEnter={() => { setHovered(true); cursor.set('hover', tech) }}
            onMouseLeave={() => { setHovered(false); cursor.reset() }}
            style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
                fontFamily: 'var(--font-mono)',
                fontSize,
                letterSpacing: '0.10em',
                textTransform: 'uppercase',
                color: hovered ? color : `${color}bb`,
                background: hovered ? `${color}18` : `${color}0e`,
                border: `1px solid ${hovered ? color + '50' : color + '28'}`,
                borderRadius: 2,
                padding: `${py} ${px}`,
                lineHeight: 1,
                whiteSpace: 'nowrap',
                cursor: 'none',
                transition: 'all 160ms ease',
                boxShadow: hovered ? `0 0 8px ${color}20` : 'none',
                ...style,
            }}
        >
            <span style={{
                width: dotSize, height: dotSize, borderRadius: '50%',
                background: hovered ? color : `${color}80`,
                flexShrink: 0,
                boxShadow: hovered ? `0 0 4px ${color}` : 'none',
                transition: 'all 160ms ease',
            }} />
            {tech}
        </span>
    )
}
