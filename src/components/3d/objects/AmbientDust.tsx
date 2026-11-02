import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { dustVertexShader, dustFragmentShader } from '../shaders/dust.glsl'

export interface DustLayerConfig {
    count: number
    spread: [number, number, number]   // x, y, z extent
    sizeMin: number
    sizeMax: number
    color: THREE.ColorRepresentation
    opacity: number
    /** additional slow rotation */
    rotationSpeed: number
}

export const DEFAULT_DUST_LAYERS: DustLayerConfig[] = [
    // micro-particles — cyan tinted, close
    {
        count: 220,
        spread: [18, 12, 10],
        sizeMin: 1.5,
        sizeMax: 4.0,
        color: '#38bdf8',
        opacity: 0.07,
        rotationSpeed: 0.002,
    },
    // violet atmospheric haze — wider, barely visible
    {
        count: 120,
        spread: [28, 18, 14],
        sizeMin: 3.0,
        sizeMax: 8.0,
        color: '#a78bfa',
        opacity: 0.04,
        rotationSpeed: -0.0015,
    },
    // neutral distant haze
    {
        count: 80,
        spread: [36, 24, 20],
        sizeMin: 2.0,
        sizeMax: 6.0,
        color: '#d0e4ff',
        opacity: 0.035,
        rotationSpeed: 0.001,
    },
]

interface DustLayerProps {
    config: DustLayerConfig
    reducedMotion: boolean
}

function DustLayer({ config, reducedMotion }: DustLayerProps) {
    const pointsRef = useRef<THREE.Points>(null)

    const { geometry, material } = useMemo(() => {
        const { count, spread, sizeMin, sizeMax, color, opacity } = config

        const positions = new Float32Array(count * 3)
        const sizes = new Float32Array(count)
        const phases = new Float32Array(count)

        for (let i = 0; i < count; i++) {
            positions[i * 3] = (Math.random() - 0.5) * spread[0]
            positions[i * 3 + 1] = (Math.random() - 0.5) * spread[1]
            positions[i * 3 + 2] = (Math.random() - 0.5) * spread[2]
            sizes[i] = sizeMin + Math.random() * (sizeMax - sizeMin)
            phases[i] = Math.random() * Math.PI * 2
        }

        const geo = new THREE.BufferGeometry()
        geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
        geo.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1))
        geo.setAttribute('aPhase', new THREE.BufferAttribute(phases, 1))

        const col = new THREE.Color(color)
        const mat = new THREE.ShaderMaterial({
            vertexShader: dustVertexShader,
            fragmentShader: dustFragmentShader,
            uniforms: {
                uTime: { value: 0 },
                uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) },
                uColor: { value: new THREE.Vector3(col.r, col.g, col.b) },
                uOpacity: { value: opacity },
            },
            transparent: true,
            depthWrite: false,
            blending: THREE.AdditiveBlending,
        })

        return { geometry: geo, material: mat }
    }, [config])

    useFrame((_, delta) => {
        if (!pointsRef.current) return
        const mat = material as THREE.ShaderMaterial
        mat.uniforms.uTime.value += delta
        if (reducedMotion) return
        pointsRef.current.rotation.y += delta * config.rotationSpeed
    })

    return <points ref={pointsRef} geometry={geometry} material={material} />
}

// ─────────────────────────────────────────────────────────────────────────────

interface AmbientDustProps {
    layers?: DustLayerConfig[]
    reducedMotion?: boolean
}

/**
 * Soft additive dust / atmospheric haze layers.
 * Cyan, violet, and neutral — very low opacity.
 */
export function AmbientDust({
    layers = DEFAULT_DUST_LAYERS,
    reducedMotion = false,
}: AmbientDustProps) {
    return (
        <>
            {layers.map((cfg, i) => (
                <DustLayer key={i} config={cfg} reducedMotion={reducedMotion} />
            ))}
        </>
    )
}
