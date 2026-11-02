import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

// ── Violet particle field ─────────────────────────────────────────────────────

function IdentityParticles() {
    const ref = useRef<THREE.Points>(null)

    const { geo, mat } = useMemo(() => {
        const COUNT = 380
        const pos = new Float32Array(COUNT * 3)
        const sizes = new Float32Array(COUNT)
        const phases = new Float32Array(COUNT)

        for (let i = 0; i < COUNT; i++) {
            const theta = Math.random() * Math.PI * 2
            const phi = Math.acos(2 * Math.random() - 1)
            const r = 1.6 + Math.random() * 3.4

            pos[i * 3] = r * Math.sin(phi) * Math.cos(theta) - 1.0
            pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta)
            pos[i * 3 + 2] = r * Math.cos(phi) - 2.5

            sizes[i] = 0.7 + Math.random() * 1.8
            phases[i] = Math.random() * Math.PI * 2
        }

        const g = new THREE.BufferGeometry()
        g.setAttribute('position', new THREE.BufferAttribute(pos, 3))
        g.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1))
        g.setAttribute('aPhase', new THREE.BufferAttribute(phases, 1))

        const m = new THREE.ShaderMaterial({
            uniforms: {
                uTime: { value: 0 },
                uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) },
            },
            vertexShader: /* glsl */`
        attribute float aSize;
        attribute float aPhase;
        uniform float uTime;
        uniform float uPixelRatio;
        varying float vAlpha;
        void main() {
          vec3 p = position;
          p.y += sin(uTime * 0.22 + aPhase) * 0.10;
          p.x += cos(uTime * 0.16 + aPhase * 1.3) * 0.07;
          vec4 mv = modelViewMatrix * vec4(p, 1.0);
          gl_Position = projectionMatrix * mv;
          float d = -mv.z;
          gl_PointSize = aSize * uPixelRatio * clamp(1.0 / (0.008 * d * d), 0.4, 3.5);
          vAlpha = smoothstep(0.0, 2.0, d) * (1.0 - smoothstep(12.0, 22.0, d));
        }
      `,
            fragmentShader: /* glsl */`
        precision mediump float;
        varying float vAlpha;
        void main() {
          vec2 uv = gl_PointCoord - 0.5;
          float a = exp(-dot(uv,uv) * 9.0) * vAlpha * 0.5;
          if (a < 0.003) discard;
          gl_FragColor = vec4(0.42, 0.35, 0.98, a);
        }
      `,
            transparent: true,
            depthWrite: false,
            blending: THREE.AdditiveBlending,
        })

        return { geo: g, mat: m }
    }, [])

    useFrame((_, delta) => {
        if (!ref.current) return
        mat.uniforms.uTime.value += delta
        ref.current.rotation.y += delta * 0.012
    })

    return <points ref={ref} geometry={geo} material={mat} />
}

// ── Portrait sphere ───────────────────────────────────────────────────────────

function PortraitSphere() {
    const meshRef = useRef<THREE.Mesh>(null)
    const glowRef = useRef<THREE.Mesh>(null)
    const r1Ref = useRef<THREE.Mesh>(null)
    const r2Ref = useRef<THREE.Mesh>(null)
    const r3Ref = useRef<THREE.Mesh>(null)
    const dotsRef = useRef<THREE.Group>(null)

    const texture = useMemo(() => {
        const S = 256
        const c = document.createElement('canvas')
        c.width = c.height = S
        const ctx = c.getContext('2d')!

        // dark base
        const bg = ctx.createRadialGradient(128, 128, 20, 128, 128, 128)
        bg.addColorStop(0, '#0e1828')
        bg.addColorStop(1, '#060a14')
        ctx.fillStyle = bg
        ctx.fillRect(0, 0, S, S)

        // scan lines
        ctx.strokeStyle = 'rgba(56,189,248,0.07)'
        ctx.lineWidth = 0.5
        for (let y = 0; y < S; y += 14) {
            ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(S, y); ctx.stroke()
        }

        // body silhouette
        const body = ctx.createRadialGradient(128, 168, 8, 128, 168, 90)
        body.addColorStop(0, 'rgba(26,50,100,0.55)')
        body.addColorStop(1, 'rgba(0,0,0,0)')
        ctx.fillStyle = body; ctx.fillRect(0, 0, S, S)

        // head silhouette
        const head = ctx.createRadialGradient(128, 95, 0, 128, 95, 50)
        head.addColorStop(0, 'rgba(36,65,125,0.65)')
        head.addColorStop(1, 'rgba(0,0,0,0)')
        ctx.fillStyle = head; ctx.fillRect(0, 0, S, S)

        // cyan rim light
        const rim = ctx.createRadialGradient(55, 60, 20, 128, 128, 148)
        rim.addColorStop(0, 'rgba(56,189,248,0.25)')
        rim.addColorStop(1, 'rgba(0,0,0,0)')
        ctx.fillStyle = rim; ctx.fillRect(0, 0, S, S)

        // placeholder label
        ctx.fillStyle = 'rgba(56,189,248,0.28)'
        ctx.font = '700 10px monospace'
        ctx.textAlign = 'center'
        ctx.fillText('[ IDENTITY ]', 128, 200)
        ctx.fillStyle = 'rgba(56,189,248,0.15)'
        ctx.font = '400 7px monospace'
        ctx.fillText('INSERT PORTRAIT', 128, 213)

        return new THREE.CanvasTexture(c)
    }, [])

    const dotPositions = useMemo(
        () => Array.from({ length: 8 }, (_, i) => {
            const a = (i / 8) * Math.PI * 2
            const r = 1.55
            return new THREE.Vector3(Math.cos(a) * r, 0, Math.sin(a) * r)
        }),
        [],
    )

    useFrame(({ clock }) => {
        const t = clock.elapsedTime
        if (meshRef.current) meshRef.current.rotation.y = t * 0.055
        if (glowRef.current) glowRef.current.rotation.y = -t * 0.035
        if (r1Ref.current) r1Ref.current.rotation.z = t * 0.26
        if (r2Ref.current) r2Ref.current.rotation.z = -t * 0.17
        if (r3Ref.current) {
            r3Ref.current.rotation.y = t * 0.13
            r3Ref.current.rotation.x = Math.sin(t * 0.07) * 0.28
        }
        if (dotsRef.current) {
            dotsRef.current.rotation.y = t * 0.21
            dotsRef.current.rotation.x = Math.sin(t * 0.09) * 0.11
        }
    })

    return (
        <group position={[-1.5, 0.1, -0.8]}>
            {/* outer atmospheric glow */}
            <mesh ref={glowRef} scale={1.6}>
                <sphereGeometry args={[1, 24, 24]} />
                <meshBasicMaterial color="#16084a" transparent opacity={0.12} side={THREE.BackSide} depthWrite={false} blending={THREE.AdditiveBlending} />
            </mesh>
            {/* inner violet halo */}
            <mesh scale={1.24}>
                <sphereGeometry args={[1, 24, 24]} />
                <meshBasicMaterial color="#2a1060" transparent opacity={0.20} side={THREE.BackSide} depthWrite={false} blending={THREE.AdditiveBlending} />
            </mesh>

            {/* portrait sphere */}
            <mesh ref={meshRef}>
                <sphereGeometry args={[1, 64, 64]} />
                <meshStandardMaterial map={texture} roughness={0.9} metalness={0.0} emissive={new THREE.Color(0x050c1c)} emissiveIntensity={0.5} />
            </mesh>

            {/* equatorial ring */}
            <mesh ref={r1Ref} rotation={[Math.PI / 2, 0, 0]}>
                <torusGeometry args={[1.42, 0.005, 4, 100]} />
                <meshBasicMaterial color="#38bdf8" transparent opacity={0.50} depthWrite={false} blending={THREE.AdditiveBlending} />
            </mesh>
            {/* tilted ring */}
            <mesh ref={r2Ref} rotation={[Math.PI / 2.8, 0.4, 0]}>
                <torusGeometry args={[1.66, 0.004, 4, 100]} />
                <meshBasicMaterial color="#a78bfa" transparent opacity={0.32} depthWrite={false} blending={THREE.AdditiveBlending} />
            </mesh>
            {/* outer dashed ring */}
            <mesh ref={r3Ref} rotation={[Math.PI / 3.2, -0.5, 0]}>
                <torusGeometry args={[1.90, 0.003, 4, 30]} />
                <meshBasicMaterial color="#38bdf8" transparent opacity={0.18} depthWrite={false} blending={THREE.AdditiveBlending} />
            </mesh>

            {/* orbiting data dots */}
            <group ref={dotsRef} rotation={[0.38, 0, 0]}>
                {dotPositions.map((pos, i) => (
                    <mesh key={i} position={pos}>
                        <sphereGeometry args={[i % 3 === 0 ? 0.03 : 0.017, 6, 6]} />
                        <meshBasicMaterial
                            color={i % 3 === 0 ? '#38bdf8' : '#a78bfa'}
                            transparent
                            opacity={i % 3 === 0 ? 0.90 : 0.55}
                            depthWrite={false}
                            blending={THREE.AdditiveBlending}
                        />
                    </mesh>
                ))}
            </group>

            {/* rim lighting */}
            <pointLight position={[-2.8, 1.2, 1.5]} color="#38bdf8" intensity={0.75} distance={9} />
            <pointLight position={[2.2, -1, -1.2]} color="#a78bfa" intensity={0.40} distance={9} />
        </group>
    )
}

// ── Floating data nodes (stat billboards) ────────────────────────────────────

function FloatingNodes() {
    const groupRef = useRef<THREE.Group>(null)

    const nodes = useMemo(() => [
        { pos: [1.8, 1.2, -1.5] as const, phase: 0.0, color: new THREE.Color('#38bdf8') },
        { pos: [2.4, -0.4, -2.0] as const, phase: 1.3, color: new THREE.Color('#a78bfa') },
        { pos: [1.2, -1.4, -1.2] as const, phase: 2.6, color: new THREE.Color('#38bdf8') },
        { pos: [-0.2, 1.8, -2.2] as const, phase: 0.8, color: new THREE.Color('#7dd3fc') },
        { pos: [0.6, -1.8, -1.8] as const, phase: 2.1, color: new THREE.Color('#c4b5fd') },
        { pos: [3.0, 0.4, -2.5] as const, phase: 1.7, color: new THREE.Color('#38bdf8') },
    ], [])

    // Build instanced mesh for dots
    const dotGeo = useMemo(() => new THREE.SphereGeometry(0.025, 6, 6), [])

    useFrame(({ clock }) => {
        if (!groupRef.current) return
        const t = clock.elapsedTime
        groupRef.current.children.forEach((child, i) => {
            const node = nodes[i]
            if (!node) return
            child.position.y = node.pos[1] + Math.sin(t * 0.38 + node.phase) * 0.08
        })
    })

    return (
        <group ref={groupRef}>
            {nodes.map((node, i) => (
                <group key={i} position={node.pos}>
                    <mesh geometry={dotGeo}>
                        <meshBasicMaterial
                            color={node.color}
                            transparent
                            opacity={0.85}
                            depthWrite={false}
                            blending={THREE.AdditiveBlending}
                        />
                    </mesh>
                    {/* glow halo around dot */}
                    <mesh scale={3.5}>
                        <sphereGeometry args={[0.025, 6, 6]} />
                        <meshBasicMaterial
                            color={node.color}
                            transparent
                            opacity={0.10}
                            depthWrite={false}
                            blending={THREE.AdditiveBlending}
                        />
                    </mesh>
                </group>
            ))}
        </group>
    )
}

// ── Scan line plane — horizontal sweep ───────────────────────────────────────

function ScanSweep() {
    const ref = useRef<THREE.Mesh>(null)

    useFrame(({ clock }) => {
        if (!ref.current) return
        // sweep vertically in a cycle, staying near portrait
        const t = clock.elapsedTime
        const y = Math.sin(t * 0.35) * 1.8
        ref.current.position.y = y
            ; (ref.current.material as THREE.MeshBasicMaterial).opacity =
                (0.5 - Math.abs(Math.sin(t * 0.35)) * 0.4) * 0.08
    })

    return (
        <mesh ref={ref} position={[-1.5, 0, -0.8]}>
            <planeGeometry args={[3.2, 0.008]} />
            <meshBasicMaterial
                color="#38bdf8"
                transparent
                opacity={0.06}
                depthWrite={false}
                side={THREE.DoubleSide}
                blending={THREE.AdditiveBlending}
            />
        </mesh>
    )
}

// ── AboutScene compositor ─────────────────────────────────────────────────────

interface AboutSceneProps {
    visible?: boolean
    gpuTier?: number
}

export function AboutScene({ visible = true, gpuTier = 2 }: AboutSceneProps) {
    const groupRef = useRef<THREE.Group>(null)

    useFrame(({ clock }) => {
        if (!groupRef.current) return
        groupRef.current.rotation.y = Math.sin(clock.elapsedTime * 0.05) * 0.02
    })

    if (!visible) return null

    return (
        <group ref={groupRef}>
            <PortraitSphere />
            {gpuTier >= 1 && <IdentityParticles />}
            {gpuTier >= 2 && <FloatingNodes />}
            {gpuTier >= 2 && <ScanSweep />}
            <ambientLight color="#0a0820" intensity={0.8} />
        </group>
    )
}
