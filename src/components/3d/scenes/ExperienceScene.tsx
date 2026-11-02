import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { missions } from '@/data/experiences'

// ── Mission node positions — spread across a gentle arc ──────────────────────
const NODE_POSITIONS: [number, number, number][] = [
    [-4.2, 0.8, -1.5],
    [0.0, -0.4, -2.0],
    [4.0, 0.6, -1.5],
]

// ── Trajectory spline between nodes ──────────────────────────────────────────
function TrajectoryLine() {
    const progress = useRef(0)

    const { curve, staticLine, dashLine } = useMemo(() => {
        const pts = NODE_POSITIONS.map((p) => new THREE.Vector3(...p))
        const c = new THREE.CatmullRomCurve3(pts)
        const staticGeo = new THREE.BufferGeometry().setFromPoints(c.getPoints(120))
        const staticMat = new THREE.LineBasicMaterial({ color: '#38bdf8', transparent: true, opacity: 0.07, depthWrite: false, blending: THREE.AdditiveBlending })
        const dashGeo = new THREE.BufferGeometry()
        const dashMat = new THREE.LineBasicMaterial({ color: '#38bdf8', transparent: true, opacity: 0.45, depthWrite: false, blending: THREE.AdditiveBlending })
        return {
            curve: c,
            staticLine: new THREE.Line(staticGeo, staticMat),
            dashLine: new THREE.Line(dashGeo, dashMat),
        }
    }, [])

    useFrame((_, delta) => {
        progress.current = Math.min(progress.current + delta * 0.18, 1)
        const pts = curve.getPoints(Math.floor(120 * progress.current))
        dashLine.geometry.setFromPoints(pts)
    })

    return (
        <group>
            <primitive object={staticLine} />
            <primitive object={dashLine} />
        </group>
    )
}

// ── Single mission node ───────────────────────────────────────────────────────
function MissionNode({
    position,
    active,
    accent,
    index,
}: {
    position: [number, number, number]
    active: boolean
    accent: 'cyan' | 'violet'
    index: number
}) {
    const coreRef = useRef<THREE.Mesh>(null)
    const glowRef = useRef<THREE.Mesh>(null)
    const ring1Ref = useRef<THREE.Mesh>(null)
    const ring2Ref = useRef<THREE.Mesh>(null)

    const color = accent === 'cyan' ? '#38bdf8' : '#a78bfa'
    const c = new THREE.Color(color)

    useFrame(({ clock }) => {
        const t = clock.elapsedTime + index * 1.4

        if (coreRef.current) {
            const s = active ? 1 + Math.sin(t * 2.0) * 0.08 : 1 + Math.sin(t * 1.2) * 0.04
            coreRef.current.scale.setScalar(s)
        }
        if (glowRef.current) {
            const mat = glowRef.current.material as THREE.MeshBasicMaterial
            mat.opacity = active ? 0.25 + Math.sin(t * 1.8) * 0.08 : 0.08
        }
        if (ring1Ref.current) ring1Ref.current.rotation.z = t * (active ? 0.9 : 0.4)
        if (ring2Ref.current) ring2Ref.current.rotation.x = t * (active ? -0.6 : -0.25)
    })

    const coreScale = active ? 0.12 : 0.07

    return (
        <group position={position}>
            {/* outer glow sphere */}
            <mesh ref={glowRef} scale={active ? 2.8 : 2.0}>
                <sphereGeometry args={[coreScale, 16, 16]} />
                <meshBasicMaterial color={c} transparent opacity={0.08} side={THREE.BackSide} depthWrite={false} blending={THREE.AdditiveBlending} />
            </mesh>

            {/* core sphere */}
            <mesh ref={coreRef} scale={1}>
                <sphereGeometry args={[coreScale, 16, 16]} />
                <meshBasicMaterial color={c} transparent opacity={active ? 0.95 : 0.55} depthWrite={false} blending={THREE.AdditiveBlending} />
            </mesh>

            {/* orbital rings — only on active node */}
            <mesh ref={ring1Ref} rotation={[Math.PI / 2, 0, 0]}>
                <torusGeometry args={[coreScale * 2.2, active ? 0.006 : 0.003, 4, 60]} />
                <meshBasicMaterial color={c} transparent opacity={active ? 0.60 : 0.20} depthWrite={false} blending={THREE.AdditiveBlending} />
            </mesh>
            <mesh ref={ring2Ref} rotation={[Math.PI / 3, 0.3, 0]}>
                <torusGeometry args={[coreScale * 3.0, active ? 0.004 : 0.002, 4, 60]} />
                <meshBasicMaterial color={c} transparent opacity={active ? 0.35 : 0.10} depthWrite={false} blending={THREE.AdditiveBlending} />
            </mesh>

            {/* point light on active */}
            {active && <pointLight color={color} intensity={0.6} distance={5} />}
        </group>
    )
}

// ── Reactive particle burst around active node ────────────────────────────────
function MissionParticles({ activeMissionIndex }: { activeMissionIndex: number }) {
    const ref = useRef<THREE.Points>(null)
    const basePos = NODE_POSITIONS[activeMissionIndex] ?? NODE_POSITIONS[0]

    const { geo, mat } = useMemo(() => {
        const COUNT = 180
        const pos = new Float32Array(COUNT * 3)
        const phases = new Float32Array(COUNT)

        for (let i = 0; i < COUNT; i++) {
            const theta = Math.random() * Math.PI * 2
            const phi = Math.acos(2 * Math.random() - 1)
            const r = 0.3 + Math.random() * 1.2
            pos[i * 3] = basePos[0] + r * Math.sin(phi) * Math.cos(theta)
            pos[i * 3 + 1] = basePos[1] + r * Math.cos(phi)
            pos[i * 3 + 2] = basePos[2] + r * Math.sin(phi) * Math.sin(theta)
            phases[i] = Math.random() * Math.PI * 2
        }

        const g = new THREE.BufferGeometry()
        g.setAttribute('position', new THREE.BufferAttribute(pos, 3))
        g.setAttribute('aPhase', new THREE.BufferAttribute(phases, 1))

        const m = new THREE.ShaderMaterial({
            uniforms: { uTime: { value: 0 }, uColor: { value: new THREE.Color(activeMissionIndex % 2 === 0 ? '#38bdf8' : '#a78bfa') } },
            vertexShader: /* glsl */`
        attribute float aPhase;
        uniform float uTime;
        varying float vA;
        void main() {
          vec3 p = position;
          p.y += sin(uTime * 0.5 + aPhase) * 0.04;
          p.x += cos(uTime * 0.4 + aPhase * 1.3) * 0.03;
          vec4 mv = modelViewMatrix * vec4(p, 1.0);
          gl_Position = projectionMatrix * mv;
          float d = -mv.z;
          gl_PointSize = (1.5 + sin(aPhase) * 0.8) * (1.0 / (0.01 * d * d));
          vA = 0.3 + 0.2 * sin(uTime * 0.8 + aPhase);
        }
      `,
            fragmentShader: /* glsl */`
        precision mediump float;
        uniform vec3 uColor;
        varying float vA;
        void main() {
          vec2 uv = gl_PointCoord - 0.5;
          float a = exp(-dot(uv,uv) * 10.0) * vA;
          if (a < 0.003) discard;
          gl_FragColor = vec4(uColor, a);
        }
      `,
            transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
        })
        return { geo: g, mat: m }
    }, [activeMissionIndex, basePos])

    useFrame((_, delta) => {
        mat.uniforms.uTime.value += delta
    })

    return <points ref={ref} geometry={geo} material={mat} />
}

// ── ExperienceScene compositor ────────────────────────────────────────────────
interface ExperienceSceneProps {
    visible?: boolean
    activeMissionIndex: number
    gpuTier?: number
}

export function ExperienceScene({
    visible = true,
    activeMissionIndex,
    gpuTier = 2,
}: ExperienceSceneProps) {
    const groupRef = useRef<THREE.Group>(null)

    useFrame(({ clock }) => {
        if (!groupRef.current) return
        groupRef.current.rotation.y = Math.sin(clock.elapsedTime * 0.04) * 0.03
        groupRef.current.position.y = Math.sin(clock.elapsedTime * 0.06) * 0.04
    })

    if (!visible) return null

    return (
        <group ref={groupRef}>
            <TrajectoryLine />
            {missions.map((m, i) => (
                <MissionNode
                    key={m.id}
                    position={NODE_POSITIONS[i] ?? [0, 0, 0]}
                    active={activeMissionIndex === i}
                    accent={m.accent}
                    index={i}
                />
            ))}
            {gpuTier >= 2 && (
                <MissionParticles activeMissionIndex={activeMissionIndex} />
            )}
            <ambientLight color="#040812" intensity={1} />
        </group>
    )
}
