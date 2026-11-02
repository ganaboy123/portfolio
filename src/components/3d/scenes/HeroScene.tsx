import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

// ── Distant Planet ────────────────────────────────────────────────────────────

function DistantPlanet() {
    const meshRef = useRef<THREE.Mesh>(null)
    const glowRef = useRef<THREE.Mesh>(null)
    const ringRef = useRef<THREE.Mesh>(null)

    // procedural surface texture via canvas
    const texture = useMemo(() => {
        const size = 256
        const canvas = document.createElement('canvas')
        canvas.width = size
        canvas.height = size
        const ctx = canvas.getContext('2d')!

        // deep base — dark teal/slate
        ctx.fillStyle = '#0a1628'
        ctx.fillRect(0, 0, size, size)

        // continent-like patches
        const patches = [
            { x: 80, y: 60, r: 55, color: 'rgba(22,45,80,0.8)' },
            { x: 170, y: 140, r: 45, color: 'rgba(18,38,68,0.7)' },
            { x: 50, y: 170, r: 38, color: 'rgba(16,32,60,0.6)' },
            { x: 210, y: 80, r: 30, color: 'rgba(24,50,88,0.5)' },
        ]
        patches.forEach(({ x, y, r, color }) => {
            const g = ctx.createRadialGradient(x, y, 0, x, y, r)
            g.addColorStop(0, color)
            g.addColorStop(1, 'rgba(0,0,0,0)')
            ctx.fillStyle = g
            ctx.fillRect(0, 0, size, size)
        })

        // polar ice cap
        const iceGrad = ctx.createRadialGradient(128, 10, 0, 128, 10, 60)
        iceGrad.addColorStop(0, 'rgba(160,200,240,0.35)')
        iceGrad.addColorStop(1, 'rgba(0,0,0,0)')
        ctx.fillStyle = iceGrad
        ctx.fillRect(0, 0, size, size)

        // atmospheric limb glow — top-left light
        const limbGrad = ctx.createRadialGradient(60, 60, size * 0.3, 128, 128, size * 0.8)
        limbGrad.addColorStop(0, 'rgba(56,100,180,0.20)')
        limbGrad.addColorStop(1, 'rgba(0,0,0,0)')
        ctx.fillStyle = limbGrad
        ctx.fillRect(0, 0, size, size)

        return new THREE.CanvasTexture(canvas)
    }, [])

    useFrame(({ clock }) => {
        const t = clock.elapsedTime
        if (meshRef.current) meshRef.current.rotation.y = t * 0.018
        if (ringRef.current) ringRef.current.rotation.z = t * 0.004
    })

    return (
        <group position={[3.8, 0.6, -8]}>
            {/* atmospheric outer glow — large additive sphere */}
            <mesh ref={glowRef} scale={1.18}>
                <sphereGeometry args={[1, 32, 32]} />
                <meshBasicMaterial
                    color="#1a3a6a"
                    transparent
                    opacity={0.18}
                    side={THREE.BackSide}
                    depthWrite={false}
                    blending={THREE.AdditiveBlending}
                />
            </mesh>

            {/* planet surface */}
            <mesh ref={meshRef}>
                <sphereGeometry args={[1, 48, 48]} />
                <meshStandardMaterial
                    map={texture}
                    roughness={0.95}
                    metalness={0.0}
                    emissive={new THREE.Color(0x06101e)}
                    emissiveIntensity={0.4}
                />
            </mesh>

            {/* thin ring */}
            <mesh
                ref={ringRef}
                rotation={[Math.PI / 2.4, 0, 0.2]}
            >
                <torusGeometry args={[1.55, 0.055, 4, 80]} />
                <meshBasicMaterial
                    color="#2a5080"
                    transparent
                    opacity={0.35}
                    depthWrite={false}
                    blending={THREE.AdditiveBlending}
                />
            </mesh>

            {/* rim light */}
            <pointLight position={[-3, 2, 2]} color="#2060b0" intensity={0.8} distance={12} />
        </group>
    )
}

// ── Holographic HUD Rings ─────────────────────────────────────────────────────

function HolographicRings({ segments = 64 }: { segments?: number }) {
    const groupRef = useRef<THREE.Group>(null)

    const ringMats = useMemo(() => [
        { r: 2.95, tube: 0.004, color: '#52c2dc', opacity: 0.18, speedMult: 0.22 },
        { r: 4.15, tube: 0.003, color: '#9d95c6', opacity: 0.08, speedMult: -0.12 },
    ], [])

    useFrame(({ clock }) => {
        if (!groupRef.current) return
        const t = clock.elapsedTime
        groupRef.current.children.forEach((child, i) => {
            const cfg = ringMats[i]
            if (cfg) {
                child.rotation.z = t * cfg.speedMult * 0.3
                child.rotation.x = Math.sin(t * 0.05 + i) * 0.035
            }
        })
    })

    return (
        <group ref={groupRef} position={[-1.5, 0, -2]}>
            {ringMats.map((cfg, i) => (
                <mesh key={i} rotation={[Math.PI / 2 + i * 0.3, 0, i * 0.8]}>
                    <torusGeometry args={[cfg.r, cfg.tube, 4, segments]} />
                    <meshBasicMaterial
                        color={cfg.color}
                        transparent
                        opacity={cfg.opacity}
                        depthWrite={false}
                        blending={THREE.AdditiveBlending}
                    />
                </mesh>
            ))}
        </group>
    )
}

// ── Distant Moving Objects (debris / craft silhouettes) ───────────────────────

function DistantObjects() {
    const groupRef = useRef<THREE.Group>(null)

    const objects = useMemo(() => (
        Array.from({ length: 6 }, (_, i) => ({
            id: i,
            pos: new THREE.Vector3(
                (Math.random() - 0.5) * 16,
                (Math.random() - 0.5) * 8,
                -12 - Math.random() * 10,
            ),
            speed: 0.015 + Math.random() * 0.025,
            size: 0.02 + Math.random() * 0.05,
            phase: Math.random() * Math.PI * 2,
        }))
    ), [])

    useFrame(({ clock }) => {
        if (!groupRef.current) return
        const t = clock.elapsedTime
        groupRef.current.children.forEach((child, i) => {
            const obj = objects[i]
            if (!obj) return
            // drift slowly left to right, cycling
            child.position.x = obj.pos.x + Math.sin(t * obj.speed + obj.phase) * 4
            child.position.y = obj.pos.y + Math.cos(t * obj.speed * 0.6 + obj.phase) * 1.5
        })
    })

    return (
        <group ref={groupRef}>
            {objects.map((obj) => (
                <mesh key={obj.id} position={obj.pos}>
                    <octahedronGeometry args={[obj.size, 0]} />
                    <meshBasicMaterial
                        color="#38bdf8"
                        transparent
                        opacity={0.25}
                        depthWrite={false}
                        blending={THREE.AdditiveBlending}
                    />
                </mesh>
            ))}
        </group>
    )
}

// ── Atmospheric volumetric light shafts (additive planes) ────────────────────

function AtmosphericLight() {
    return (
        <group position={[0, 0, -4]} rotation={[0, 0, 0.15]}>
            {[0, 1, 2].map((i) => (
                <mesh
                    key={i}
                    position={[(i - 1) * 3.5, 1.5, 0]}
                    rotation={[0, 0, -0.08 + i * 0.04]}
                >
                    <planeGeometry args={[0.6, 18]} />
                    <meshBasicMaterial
                        color={i === 1 ? '#38bdf8' : '#1a3a80'}
                        transparent
                        opacity={0.018 - i * 0.003}
                        depthWrite={false}
                        blending={THREE.AdditiveBlending}
                        side={THREE.DoubleSide}
                    />
                </mesh>
            ))}
        </group>
    )
}

// ── HeroScene compositor ──────────────────────────────────────────────────────

interface HeroSceneProps {
    visible?: boolean
    detail?: 'full' | 'lite'
}

/**
 * Additional scene elements layered on top of CosmicScene for the hero section.
 * Includes: distant planet, holographic rings, debris, light shafts.
 */
export function HeroScene({ visible = true, detail = 'full' }: HeroSceneProps) {
    const groupRef = useRef<THREE.Group>(null)
    const showDecorativeObjects = false

    useFrame(({ clock }) => {
        if (!groupRef.current) return
        // subtle breathing scale
        const s = 1 + Math.sin(clock.elapsedTime * 0.3) * 0.003
        groupRef.current.scale.setScalar(s)
    })

    if (!visible) return null

    return (
        <group ref={groupRef}>
            <HolographicRings segments={detail === 'lite' ? 40 : 64} />
            {showDecorativeObjects && detail === 'full' && <DistantPlanet />}
            {showDecorativeObjects && detail === 'full' && <AtmosphericLight />}
            {showDecorativeObjects && detail === 'full' && <DistantObjects />}

            {/* ambient fill light — cool blue */}
            <ambientLight color="#0a1628" intensity={0.6} />
            <directionalLight
                position={[-4, 3, 2]}
                color="#1a4080"
                intensity={0.4}
            />
        </group>
    )
}
