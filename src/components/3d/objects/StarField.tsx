import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { starsVertexShader, starsFragmentShader } from '../shaders/stars.glsl'

export interface StarLayerConfig {
    count: number
    /** inner radius of the spherical shell */
    radiusMin: number
    /** outer radius of the spherical shell */
    radiusMax: number
    sizeMin: number
    sizeMax: number
    /** base rotation speed multiplier */
    rotationSpeed: number
    /** dominant color – slight per-star variation applied on top */
    color: THREE.ColorRepresentation
    colorVariance: number   // 0-1 hue shift range
    opacity: number
    /** parallax depth multiplier for mouse movement (0 = none) */
    parallaxFactor: number
}

export const DEFAULT_LAYERS: StarLayerConfig[] = [
    // background — dense, tiny, slow
    {
        count: 1500,
        radiusMin: 45, radiusMax: 90,
        sizeMin: 0.6, sizeMax: 1.4,
        rotationSpeed: 0.003,
        color: '#c8ddf5',
        colorVariance: 0.08,
        opacity: 0.42,
        parallaxFactor: 0.0,
    },
    // midground — medium
    {
        count: 650,
        radiusMin: 20, radiusMax: 45,
        sizeMin: 1.0, sizeMax: 2.2,
        rotationSpeed: 0.005,
        color: '#a8c8f0',
        colorVariance: 0.12,
        opacity: 0.58,
        parallaxFactor: 0.3,
    },
    // foreground — sparse, larger, faster
    {
        count: 120,
        radiusMin: 8, radiusMax: 20,
        sizeMin: 1.5, sizeMax: 3.5,
        rotationSpeed: 0.008,
        color: '#ffffff',
        colorVariance: 0.15,
        opacity: 0.72,
        parallaxFactor: 0.8,
    },
]

interface StarLayerProps {
    config: StarLayerConfig
    mouseRef: React.RefObject<THREE.Vector2>
    reducedMotion: boolean
}

function StarLayer({ config, mouseRef, reducedMotion }: StarLayerProps) {
    const pointsRef = useRef<THREE.Points>(null)

    const { geometry, material } = useMemo(() => {
        const {
            count, radiusMin, radiusMax,
            sizeMin, sizeMax, color, colorVariance, opacity,
        } = config

        const positions = new Float32Array(count * 3)
        const sizes = new Float32Array(count)
        const twinkles = new Float32Array(count)
        const colors = new Float32Array(count * 3)

        const baseColor = new THREE.Color(color)

        for (let i = 0; i < count; i++) {
            // uniform sphere distribution
            const theta = Math.random() * Math.PI * 2
            const phi = Math.acos(2 * Math.random() - 1)
            const r = radiusMin + Math.random() * (radiusMax - radiusMin)

            positions[i * 3] = r * Math.sin(phi) * Math.cos(theta)
            positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta)
            positions[i * 3 + 2] = r * Math.cos(phi)

            sizes[i] = sizeMin + Math.random() * (sizeMax - sizeMin)
            twinkles[i] = Math.random() * Math.PI * 2

            // subtle per-star color variation
            const c = baseColor.clone()
            c.offsetHSL(
                (Math.random() - 0.5) * colorVariance,
                (Math.random() - 0.5) * 0.15,
                (Math.random() - 0.5) * 0.08,
            )
            colors[i * 3] = c.r
            colors[i * 3 + 1] = c.g
            colors[i * 3 + 2] = c.b
        }

        const geo = new THREE.BufferGeometry()
        geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
        geo.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1))
        geo.setAttribute('aTwinkle', new THREE.BufferAttribute(twinkles, 1))
        geo.setAttribute('aColor', new THREE.BufferAttribute(colors, 3))

        const mat = new THREE.ShaderMaterial({
            vertexShader: starsVertexShader,
            fragmentShader: starsFragmentShader,
            uniforms: {
                uTime: { value: 0 },
                uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) },
                uSizeScale: { value: 1.0 },
                uOpacity: { value: opacity },
            },
            transparent: true,
            depthWrite: false,
            blending: THREE.AdditiveBlending,
            vertexColors: true,
        })

        return { geometry: geo, material: mat }
    }, [config])

    // rotation offset for mouse parallax — per-layer in world space
    const parallaxTarget = useRef(new THREE.Vector2(0, 0))
    const parallaxCurrent = useRef(new THREE.Vector2(0, 0))

    useFrame((state, delta) => {
        if (!pointsRef.current) return
        const mat = material as THREE.ShaderMaterial

        // time
        mat.uniforms.uTime.value += delta

        if (reducedMotion) return

        // cinematic drift rotation
        pointsRef.current.rotation.y += delta * config.rotationSpeed
        pointsRef.current.rotation.x =
            Math.sin(state.clock.elapsedTime * 0.004 + config.rotationSpeed) * 0.015

        // mouse parallax
        if (config.parallaxFactor > 0 && mouseRef.current) {
            parallaxTarget.current.set(
                mouseRef.current.x * config.parallaxFactor * 0.06,
                mouseRef.current.y * config.parallaxFactor * 0.04,
            )
            // lerp factor — far layers lag more
            const lerpSpeed = 1.5 - config.parallaxFactor * 0.8
            parallaxCurrent.current.lerp(parallaxTarget.current, delta * lerpSpeed)

            pointsRef.current.rotation.y += parallaxCurrent.current.x * delta
            pointsRef.current.rotation.x += parallaxCurrent.current.y * delta
        }
    })

    return <points ref={pointsRef} geometry={geometry} material={material} />
}

// ─────────────────────────────────────────────────────────────────────────────

interface StarFieldProps {
    layers?: StarLayerConfig[]
    mouseRef: React.RefObject<THREE.Vector2>
    reducedMotion?: boolean
}

/**
 * Multi-layer star field.
 * Background / Midground / Foreground with per-layer parallax depth.
 */
export function StarField({
    layers = DEFAULT_LAYERS,
    mouseRef,
    reducedMotion = false,
}: StarFieldProps) {
    return (
        <>
            {layers.map((cfg, i) => (
                <StarLayer
                    key={i}
                    config={cfg}
                    mouseRef={mouseRef}
                    reducedMotion={reducedMotion}
                />
            ))}
        </>
    )
}
