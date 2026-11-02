/**
 * ConstellationCanvas — upgraded with:
 *  1. ShaderMaterial glow nodes (soft radial halo per node)
 *  2. Animated signal pulses travelling along edges
 *  3. Scan-state HUD ("SCANNING…" → "NODE LOCKED")
 *  4. Corner bracket reticle overlays
 */
import { useRef, useMemo, useCallback, useState, useEffect } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { gsap } from '@/lib/animation'
import { skillNodes, type SkillNode, type SkillCategory } from '@/data/content'

// ── Category colour map ───────────────────────────────────────────────────────

const CAT_COLOR: Record<SkillCategory, THREE.Color> = {
    'language': new THREE.Color('#00c8e8'),
    'frontend': new THREE.Color('#6bb8f5'),
    'backend': new THREE.Color('#00e5c8'),
    'ai-ml': new THREE.Color('#c4a4fb'),
    'database': new THREE.Color('#9b5cf6'),
    'cloud': new THREE.Color('#6de8f8'),
    '3d-webgl': new THREE.Color('#b48afb'),
    'tools': new THREE.Color('#8aa8d8'),
}

// ── Layout ────────────────────────────────────────────────────────────────────

function buildLayout(nodes: SkillNode[]): Map<string, THREE.Vector3> {
    const clusterCenters: Record<SkillCategory, [number, number, number]> = {
        'language': [-3.2, 1.5, 0.5],
        'frontend': [-1.0, 2.2, -0.5],
        'backend': [1.8, 1.2, 0.8],
        'ai-ml': [2.8, -0.8, 0.5],
        'database': [0.5, -2.2, 1.0],
        'cloud': [3.0, 0.4, -1.0],
        '3d-webgl': [-2.5, -1.5, -1.0],
        'tools': [0.2, 0.5, 2.2],
    }
    const map = new Map<string, THREE.Vector3>()
    const countPerCat: Record<string, number> = {}
    nodes.forEach((node) => {
        const c = clusterCenters[node.category]
        const idx = countPerCat[node.category] ?? 0
        countPerCat[node.category] = idx + 1
        const phi = Math.acos(1 - (2 * (idx + 0.5)) / 6)
        const theta = Math.PI * (1 + Math.sqrt(5)) * idx
        const r = 0.55 + (node.level / 100) * 0.3
        map.set(node.id, new THREE.Vector3(
            c[0] + r * Math.sin(phi) * Math.cos(theta),
            c[1] + r * Math.cos(phi),
            c[2] + r * Math.sin(phi) * Math.sin(theta),
        ))
    })
    return map
}

// ── Edge geometry + colour updater ────────────────────────────────────────────

function buildEdges(nodes: SkillNode[], layout: Map<string, THREE.Vector3>) {
    const positions: number[] = []
    const pairs: [number, number][] = []
    const seen = new Set<string>()
    const idxMap = new Map(nodes.map((n, i) => [n.id, i]))

    nodes.forEach((node, i) => {
        node.connections.forEach((cid) => {
            const j = idxMap.get(cid)
            if (j === undefined) return
            const key = [Math.min(i, j), Math.max(i, j)].join('-')
            if (seen.has(key)) return
            seen.add(key)
            const a = layout.get(node.id)!
            const b = layout.get(cid)!
            if (!a || !b) return
            positions.push(a.x, a.y, a.z, b.x, b.y, b.z)
            pairs.push([i, j])
        })
    })

    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
    return { geo, pairs }
}

function updateEdgeColors(
    geo: THREE.BufferGeometry,
    pairs: [number, number][],
    hoveredIdx: number | null,
    connectedSet: Set<number>,
) {
    const colors: number[] = []
    pairs.forEach(([a, b]) => {
        const isAdj = hoveredIdx !== null && (a === hoveredIdx || b === hoveredIdx)
        const isCon = hoveredIdx !== null && (connectedSet.has(a) || connectedSet.has(b))
        const alpha = hoveredIdx === null ? 0.25 : isAdj ? 0.70 : isCon ? 0.35 : 0.04
        const r = isAdj ? 0.22 : 0.15
        const g = isAdj ? 0.74 : 0.15
        const bv = isAdj ? 0.97 : 0.20
        colors.push(r * alpha * 4, g * alpha * 4, bv * alpha * 4)
        colors.push(r * alpha * 4, g * alpha * 4, bv * alpha * 4)
    })
    geo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3))
    geo.attributes.color.needsUpdate = true
}

// ── Glow node ShaderMaterial ──────────────────────────────────────────────────
// Billboard sprite: a screen-facing quad with radial soft glow
const GLOW_VERT = /* glsl */`
varying vec2 vUv;
void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`
const GLOW_FRAG = /* glsl */`
uniform vec3  uColor;
uniform float uIntensity;
uniform float uTime;
varying vec2 vUv;

void main() {
    vec2  c    = vUv - 0.5;
    float dist = length(c);

    // hard core
    float core  = smoothstep(0.08, 0.0, dist);
    // soft halo
    float halo  = pow(max(0.0, 1.0 - dist * 2.2), 2.8);
    // outer shimmer ring
    float ring  = smoothstep(0.38, 0.35, dist) * smoothstep(0.48, 0.45, dist);
    float pulse = 0.5 + 0.5 * sin(uTime * 2.8);
    ring *= 0.35 + 0.25 * pulse;

    float alpha = clamp(core * 1.8 + halo * 0.7 + ring * 0.4, 0.0, 1.0) * uIntensity;
    gl_FragColor = vec4(uColor * (core * 2.2 + halo + ring), alpha);
}
`

// ── Signal pulse travelling along an edge ────────────────────────────────────

interface PulseState {
    from: THREE.Vector3
    to: THREE.Vector3
    t: number          // 0→1 progress
    speed: number
    color: THREE.Color
}

// ── Scene inner component ─────────────────────────────────────────────────────

interface SceneProps {
    onHover: (node: SkillNode | null, screenPos: { x: number; y: number } | null) => void
    onScanState: (state: 'idle' | 'scanning' | 'locked') => void
    reducedMotion: boolean
}

function ConstellationScene({ onHover, onScanState, reducedMotion }: SceneProps) {
    const { camera, size } = useThree()

    const layout = useMemo(() => buildLayout(skillNodes), [])
    const { geo: edgeGeo, pairs } = useMemo(() => buildEdges(skillNodes, layout), [layout])

    // ── instanced glow quads ──────────────────────────────────────────────────
    const glowMesh = useRef<THREE.InstancedMesh>(null)
    void glowMesh // referenced via linesRef/groupRef below
    const linesRef = useRef<THREE.LineSegments>(null)
    const groupRef = useRef<THREE.Group>(null)
    const pulseGrp = useRef<THREE.Group>(null)

    // glow shader uniforms per-instance are not possible with InstancedMesh +
    // ShaderMaterial directly, so we use one shared material and encode color
    // via instance color, then read it in the shader via vColor.
    // We use a separate InstancedMesh of PlaneGeometry billboards.
    const glowMat = useMemo(() => new THREE.ShaderMaterial({
        vertexShader: GLOW_VERT,
        fragmentShader: GLOW_FRAG,
        uniforms: {
            uColor: { value: new THREE.Color(1, 1, 1) },
            uIntensity: { value: 1.0 },
            uTime: { value: 0 },
        },
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide,
    }), [])

    // Per-node we create individual meshes so each gets its own uniform clone.
    // Stored as refs so we can mutate uniforms without re-render.
    const nodeRefs = useRef<THREE.Mesh[]>([])
    const nodeMats = useRef<THREE.ShaderMaterial[]>([])

    const glowGeo = useMemo(() => new THREE.PlaneGeometry(1, 1), [])

    // ── pulses ────────────────────────────────────────────────────────────────
    const pulses = useRef<PulseState[]>([])
    const pulseMeshPool = useRef<THREE.Mesh[]>([])
    const PULSE_COUNT = 12

    const pulseMat = useMemo(() => new THREE.MeshBasicMaterial({
        color: new THREE.Color(0.3, 0.9, 1.0),
        transparent: true,
        opacity: 0,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
    }), [])
    const pulseGeo = useMemo(() => new THREE.SphereGeometry(0.032, 6, 6), [])

    // ── raycasting ────────────────────────────────────────────────────────────
    const raycaster = useMemo(() => new THREE.Raycaster(), [])
    const pointer = useRef(new THREE.Vector2(-999, -999))
    const hoveredIdx = useRef<number | null>(null)
    const dummy = useMemo(() => new THREE.Object3D(), [])
    void dummy // used for instance matrix calculations

    // ── camera ────────────────────────────────────────────────────────────────
    const autoAngle = useRef(0)
    const targetTilt = useRef(new THREE.Vector2(0, 0))
    const currentTilt = useRef(new THREE.Vector2(0, 0))

    // ── scan timer for spontaneous pulses ─────────────────────────────────────
    const nextPulseAt = useRef(0)
    const clock = useRef(0)

    // ── init ──────────────────────────────────────────────────────────────────
    useEffect(() => {
        // build per-node glow meshes
        if (!groupRef.current) return
        nodeRefs.current = []
        nodeMats.current = []

        skillNodes.forEach((node, i) => {
            const mat = glowMat.clone()
            mat.uniforms.uColor.value = CAT_COLOR[node.category].clone()
            mat.uniforms.uIntensity.value = 0.85

            const mesh = new THREE.Mesh(glowGeo, mat)
            const pos = layout.get(node.id)!
            const scale = (0.22 + (node.level / 100) * 0.28)
            mesh.position.copy(pos)
            mesh.scale.setScalar(scale)
            mesh.renderOrder = 2

            groupRef.current!.add(mesh)
            nodeRefs.current[i] = mesh
            nodeMats.current[i] = mat
        })

        // init edge colours
        updateEdgeColors(edgeGeo, pairs, null, new Set())

        // build pulse mesh pool
        if (pulseGrp.current) {
            for (let i = 0; i < PULSE_COUNT; i++) {
                const m = new THREE.Mesh(pulseGeo, pulseMat.clone())
                m.visible = false
                pulseGrp.current.add(m)
                pulseMeshPool.current[i] = m
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    // ── pointer ───────────────────────────────────────────────────────────────
    useEffect(() => {
        const onMove = (e: MouseEvent) => {
            pointer.current.set(
                (e.clientX / window.innerWidth) * 2 - 1,
                -(e.clientY / window.innerHeight) * 2 + 1,
            )
            if (!reducedMotion) {
                targetTilt.current.set(
                    (e.clientX / window.innerWidth - 0.5) * 0.4,
                    (e.clientY / window.innerHeight - 0.5) * 0.25,
                )
            }
        }
        window.addEventListener('mousemove', onMove, { passive: true })
        return () => window.removeEventListener('mousemove', onMove)
    }, [reducedMotion])

    // ── spawn a pulse on a random edge ────────────────────────────────────────
    function spawnPulse(fromIdx?: number) {
        // pick a random edge (or from hovered node)
        let pairIdx = Math.floor(Math.random() * pairs.length)
        if (fromIdx !== undefined) {
            const adj = pairs
                .map((p, i) => ({ p, i }))
                .filter(({ p }) => p[0] === fromIdx || p[1] === fromIdx)
            if (adj.length) pairIdx = adj[Math.floor(Math.random() * adj.length)].i
        }
        const [a, b] = pairs[pairIdx]
        const nodeA = skillNodes[a]
        const nodeB = skillNodes[b]
        const from = layout.get(nodeA.id)!.clone()
        const to = layout.get(nodeB.id)!.clone()
        const color = CAT_COLOR[nodeA.category].clone().lerp(CAT_COLOR[nodeB.category], 0.5)

        // find a free slot
        const slot = pulseMeshPool.current.find((m) => !m.visible)
        if (!slot) return

        pulses.current.push({ from, to, t: 0, speed: 0.35 + Math.random() * 0.45, color })
        const mat = (slot.material as THREE.MeshBasicMaterial)
        mat.color.copy(color)
        mat.opacity = 0
        slot.visible = true
        slot.userData.pulseIdx = pulses.current.length - 1
    }

    // ── frame ─────────────────────────────────────────────────────────────────
    useFrame((_state, delta) => {
        clock.current += delta
        glowMat.uniforms.uTime.value = clock.current
        nodeMats.current.forEach((m) => { m.uniforms.uTime.value = clock.current })

        // billboard: keep glow quads facing camera
        const camQuat = camera.quaternion
        nodeRefs.current.forEach((mesh) => {
            mesh.quaternion.copy(camQuat)
        })

        // auto-rotate
        if (!reducedMotion && groupRef.current) {
            autoAngle.current += delta * 0.04
            currentTilt.current.lerp(targetTilt.current, delta * 1.2)
            groupRef.current.rotation.y = autoAngle.current + currentTilt.current.x
            groupRef.current.rotation.x = currentTilt.current.y * 0.5
        }

        // spontaneous pulses
        if (clock.current > nextPulseAt.current) {
            spawnPulse(hoveredIdx.current ?? undefined)
            nextPulseAt.current = clock.current + 0.55 + Math.random() * 0.9
        }

        // advance pulses
        pulses.current.forEach((pulse, pi) => {
            pulse.t += delta * pulse.speed
            const mesh = pulseMeshPool.current.find((m) => m.userData.pulseIdx === pi)
            if (!mesh) return

            if (pulse.t >= 1.0) {
                mesh.visible = false
                pulses.current[pi].t = 2 // mark done
                return
            }

            // transform to world via group
            const localPos = pulse.from.clone().lerp(pulse.to, pulse.t)
            const worldPos = localPos.applyMatrix4(groupRef.current!.matrixWorld)
            mesh.position.copy(worldPos)
            const mat = mesh.material as THREE.MeshBasicMaterial
            // fade in/out
            const fade = Math.sin(pulse.t * Math.PI)
            mat.opacity = fade * 0.95
        })
        // clean done pulses
        pulses.current = pulses.current.filter((p) => p.t < 1.5)
        pulseMeshPool.current.forEach((m) => {
            if (!pulses.current.some((_, pi) => m.userData.pulseIdx === pi)) {
                m.visible = false
            }
        })

        // ── raycast ───────────────────────────────────────────────────────────
        raycaster.setFromCamera(pointer.current, camera)
        let hitIdx: number | null = null
        let hitDist = Infinity

        skillNodes.forEach((node, i) => {
            const worldPos = layout.get(node.id)!.clone()
                .applyMatrix4(groupRef.current!.matrixWorld)
            const dist = raycaster.ray.distanceToPoint(worldPos)
            const nodeR = 0.035 + (node.level / 100) * 0.045 + 0.1
            if (dist < nodeR && worldPos.distanceTo(raycaster.ray.origin) < hitDist) {
                hitDist = worldPos.distanceTo(raycaster.ray.origin)
                hitIdx = i
            }
        })

        if (hitIdx !== hoveredIdx.current) {
            hoveredIdx.current = hitIdx

            const connectedIds = hitIdx !== null
                ? new Set(skillNodes[hitIdx].connections
                    .map((cid) => skillNodes.findIndex((n) => n.id === cid))
                    .filter((x) => x >= 0))
                : new Set<number>()

            updateEdgeColors(edgeGeo, pairs, hitIdx, connectedIds)
            if (linesRef.current) linesRef.current.geometry.attributes.color.needsUpdate = true

            // update node glow intensity + color
            nodeMats.current.forEach((mat, i) => {
                const base = CAT_COLOR[skillNodes[i].category]
                if (hitIdx === null) {
                    mat.uniforms.uColor.value.copy(base)
                    mat.uniforms.uIntensity.value = 0.85
                    nodeRefs.current[i].scale.setScalar(0.22 + (skillNodes[i].level / 100) * 0.28)
                } else if (i === hitIdx) {
                    mat.uniforms.uColor.value.copy(base).multiplyScalar(1.8)
                    mat.uniforms.uIntensity.value = 1.5
                    nodeRefs.current[i].scale.setScalar((0.22 + (skillNodes[i].level / 100) * 0.28) * 1.55)
                } else if (connectedIds.has(i)) {
                    mat.uniforms.uColor.value.copy(base).multiplyScalar(1.2)
                    mat.uniforms.uIntensity.value = 1.0
                    nodeRefs.current[i].scale.setScalar(0.22 + (skillNodes[i].level / 100) * 0.28)
                } else {
                    mat.uniforms.uColor.value.copy(base)
                    mat.uniforms.uIntensity.value = 0.2
                    nodeRefs.current[i].scale.setScalar(0.22 + (skillNodes[i].level / 100) * 0.28)
                }
            })

            onScanState(hitIdx !== null ? 'locked' : 'scanning')

            if (hitIdx !== null) {
                // spawn burst pulses on hover
                for (let i = 0; i < 3; i++) spawnPulse(hitIdx)

                const worldPos = layout.get(skillNodes[hitIdx].id)!.clone()
                    .applyMatrix4(groupRef.current!.matrixWorld)
                worldPos.project(camera)
                const x = (worldPos.x * 0.5 + 0.5) * size.width
                const y = (-worldPos.y * 0.5 + 0.5) * size.height
                onHover(skillNodes[hitIdx], { x, y })
            } else {
                onHover(null, null)
            }
        }

        // sync pulse mesh group to world space (pulses are placed in world directly)
        if (pulseGrp.current) pulseGrp.current.position.set(0, 0, 0)
    })

    const lineMat = useMemo(() => new THREE.LineBasicMaterial({
        vertexColors: true,
        transparent: true,
        opacity: 1,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
    }), [])

    return (
        <>
            <group ref={groupRef}>
                <lineSegments ref={linesRef} geometry={edgeGeo} material={lineMat} />
                {/* node glow meshes are added imperatively in useEffect */}
            </group>
            {/* pulses live in world space, not rotated group */}
            <group ref={pulseGrp} />
            <ambientLight color="#060816" intensity={1} />
        </>
    )
}

// ── Node info panel ───────────────────────────────────────────────────────────

const CAT_LABEL: Record<SkillCategory, string> = {
    'language': 'LANGUAGE',
    'frontend': 'FRONTEND',
    'backend': 'BACKEND',
    'ai-ml': 'AI / ML',
    'database': 'DATABASE',
    'cloud': 'CLOUD',
    '3d-webgl': '3D / WEBGL',
    'tools': 'TOOLS',
}

function NodeInfoPanel({ node, screenPos }: { node: SkillNode | null; screenPos: { x: number; y: number } | null }) {
    const panelRef = useRef<HTMLDivElement>(null)
    const coordX = node ? (Math.random() * 99).toFixed(4) : '00.0000'
    const coordY = node ? (Math.random() * 99).toFixed(4) : '00.0000'
    const coordZ = node ? (Math.random() * 99).toFixed(4) : '00.0000'

    useEffect(() => {
        if (!panelRef.current) return
        if (node) {
            gsap.fromTo(panelRef.current,
                { opacity: 0, y: 8, scale: 0.96 },
                { opacity: 1, y: 0, scale: 1, duration: 0.24, ease: 'expo.out' },
            )
        } else {
            gsap.to(panelRef.current, { opacity: 0, duration: 0.15 })
        }
    }, [node])

    if (!node || !screenPos) return null

    const catColor = `#${CAT_COLOR[node.category].getHexString()}`
    const connectedLabels = node.connections
        .map((cid) => skillNodes.find((n) => n.id === cid)?.label)
        .filter(Boolean)

    const panelW = 230
    const left = Math.min(screenPos.x + 16, window.innerWidth - panelW - 20)
    const top = Math.max(screenPos.y - 80, 60)

    return (
        <div ref={panelRef} style={{
            position: 'absolute', left, top, width: panelW,
            pointerEvents: 'none', zIndex: 10,
            background: 'rgba(4,7,18,0.94)',
            border: `1px solid ${catColor}55`,
            borderRadius: 'var(--radius-md)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            padding: '14px 16px', opacity: 0,
        }}>
            {/* shimmer top edge */}
            <div aria-hidden style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: `linear-gradient(90deg, transparent, ${catColor}88, transparent)` }} />
            {/* corner brackets */}
            {[
                { top: 4, left: 4, borderTop: `1px solid ${catColor}`, borderLeft: `1px solid ${catColor}` },
                { top: 4, right: 4, borderTop: `1px solid ${catColor}`, borderRight: `1px solid ${catColor}` },
                { bottom: 4, left: 4, borderBottom: `1px solid ${catColor}`, borderLeft: `1px solid ${catColor}` },
                { bottom: 4, right: 4, borderBottom: `1px solid ${catColor}`, borderRight: `1px solid ${catColor}` },
            ].map((s, i) => (
                <div key={i} aria-hidden style={{ position: 'absolute', width: 8, height: 8, ...s }} />
            ))}

            {/* category */}
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.52rem', letterSpacing: '0.22em', color: catColor, marginBottom: 6, textTransform: 'uppercase' }}>
                {CAT_LABEL[node.category]}
            </div>

            {/* name */}
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 500, color: 'var(--color-text-primary)', marginBottom: 6, lineHeight: 1.2 }}>
                {node.label}
            </div>

            {/* proficiency bar */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <div style={{ flex: 1, height: 2, background: 'rgba(255,255,255,0.07)', borderRadius: 1, overflow: 'hidden', position: 'relative' }}>
                    <div style={{ height: '100%', width: `${node.level}%`, background: `linear-gradient(90deg, ${catColor}88, ${catColor})`, boxShadow: `0 0 8px ${catColor}` }} />
                </div>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.58rem', color: catColor }}>{node.level}%</span>
            </div>

            {/* description */}
            <p style={{ fontFamily: 'var(--font-sans)', fontSize: '0.71rem', color: 'var(--color-text-secondary)', lineHeight: 1.55, marginBottom: 10 }}>
                {node.description}
            </p>

            {/* coords readout */}
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.50rem', letterSpacing: '0.10em', color: `${catColor}66`, marginBottom: 8 }}>
                X {coordX} · Y {coordY} · Z {coordZ}
            </div>

            {/* metadata row */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: connectedLabels.length ? 8 : 0 }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.54rem', color: 'rgba(255,255,255,0.22)', letterSpacing: '0.10em' }}>
                    {node.years}Y EXPERIENCE
                </span>
            </div>

            {/* connections */}
            {connectedLabels.length > 0 && (
                <div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.50rem', letterSpacing: '0.15em', color: 'rgba(255,255,255,0.18)', marginBottom: 4 }}>LINKED NODES</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                        {connectedLabels.slice(0, 5).map((l) => (
                            <span key={l} style={{ fontFamily: 'var(--font-mono)', fontSize: '0.56rem', padding: '2px 6px', background: `${catColor}14`, border: `1px solid ${catColor}33`, borderRadius: 2, color: catColor, letterSpacing: '0.06em' }}>
                                {l}
                            </span>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}

// ── Category legend ───────────────────────────────────────────────────────────

function CategoryLegend({ active, onFilter }: { active: SkillCategory | null; onFilter: (c: SkillCategory | null) => void }) {
    const cats = Object.keys(CAT_LABEL) as SkillCategory[]
    return (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, position: 'absolute', bottom: 16, left: 16, zIndex: 10 }}>
            <button onClick={() => onFilter(null)} style={{
                fontFamily: 'var(--font-mono)', fontSize: '0.52rem', letterSpacing: '0.14em',
                textTransform: 'uppercase', padding: '4px 8px',
                background: active === null ? 'rgba(56,189,248,0.12)' : 'transparent',
                border: `1px solid ${active === null ? 'rgba(56,189,248,0.38)' : 'rgba(255,255,255,0.07)'}`,
                borderRadius: 2, color: active === null ? 'var(--color-accent-cyan)' : 'var(--color-text-tertiary)',
                cursor: 'none', transition: 'all 150ms',
            }}>ALL</button>

            {cats.map((cat) => {
                const color = `#${CAT_COLOR[cat].getHexString()}`
                const isActive = active === cat
                return (
                    <button key={cat} onClick={() => onFilter(isActive ? null : cat)} style={{
                        fontFamily: 'var(--font-mono)', fontSize: '0.52rem', letterSpacing: '0.11em',
                        textTransform: 'uppercase', padding: '4px 8px',
                        background: isActive ? `${color}1a` : 'transparent',
                        border: `1px solid ${isActive ? color + '50' : 'rgba(255,255,255,0.06)'}`,
                        borderRadius: 2, color: isActive ? color : 'var(--color-text-tertiary)',
                        cursor: 'none', transition: 'all 150ms',
                        display: 'flex', alignItems: 'center', gap: 4,
                    }}>
                        <span style={{ width: 5, height: 5, borderRadius: '50%', background: color, display: 'inline-block', flexShrink: 0, boxShadow: isActive ? `0 0 6px ${color}` : 'none' }} />
                        {CAT_LABEL[cat]}
                    </button>
                )
            })}
        </div>
    )
}

// ── Accessible fallback ───────────────────────────────────────────────────────

function AccessibleFallback() {
    const cats = Object.keys(CAT_LABEL) as SkillCategory[]
    return (
        <div role="list" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {cats.map((cat) => {
                const catSkills = skillNodes.filter((n) => n.category === cat)
                if (!catSkills.length) return null
                return (
                    <div key={cat} role="listitem">
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.60rem', letterSpacing: '0.18em', color: `#${CAT_COLOR[cat].getHexString()}`, textTransform: 'uppercase', marginBottom: 8 }}>
                            {CAT_LABEL[cat]}
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                            {catSkills.map((skill) => (
                                <div key={skill.id} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 10px', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 3, background: 'rgba(255,255,255,0.03)' }}>
                                    <span style={{ fontFamily: 'var(--font-sans)', fontSize: '0.8125rem', color: 'var(--color-text-secondary)' }}>{skill.label}</span>
                                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.56rem', color: `#${CAT_COLOR[cat].getHexString()}` }}>{skill.level}%</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )
            })}
        </div>
    )
}

// ── Scan-state HUD ────────────────────────────────────────────────────────────

function ScanHUD({ state }: { state: 'idle' | 'scanning' | 'locked' }) {
    const ref = useRef<HTMLDivElement>(null)
    const prev = useRef(state)

    useEffect(() => {
        if (!ref.current || state === prev.current) return
        prev.current = state
        gsap.fromTo(ref.current,
            { opacity: 0, y: -4 },
            { opacity: 1, y: 0, duration: 0.2, ease: 'expo.out' },
        )
    }, [state])

    const color = state === 'locked' ? '#38bdf8' : state === 'scanning' ? '#e879f9' : 'rgba(255,255,255,0.22)'
    const label = state === 'locked' ? 'NODE LOCKED' : state === 'scanning' ? 'SCANNING…' : 'HOVER NODES TO EXPLORE'
    const dot = state !== 'idle'

    return (
        <div ref={ref} style={{
            position: 'absolute', top: 12, right: 16,
            display: 'flex', alignItems: 'center', gap: 6,
            fontFamily: 'var(--font-mono)', fontSize: '0.52rem',
            letterSpacing: '0.16em', color, textTransform: 'uppercase',
            pointerEvents: 'none', transition: 'color 200ms',
        }}>
            {dot && (
                <span style={{
                    width: 5, height: 5, borderRadius: '50%',
                    background: color, display: 'inline-block', flexShrink: 0,
                    boxShadow: `0 0 6px ${color}`,
                    animation: state === 'scanning' ? 'hudPing 1s ease-in-out infinite' : 'none',
                }} />
            )}
            {label}
        </div>
    )
}

// ── Corner bracket overlay ────────────────────────────────────────────────────

function CornerBrackets() {
    const s = 18
    const t = 1
    const c = 'rgba(56,189,248,0.22)'
    const corners = [
        { top: 10, left: 10, borderTop: `${t}px solid ${c}`, borderLeft: `${t}px solid ${c}` },
        { top: 10, right: 10, borderTop: `${t}px solid ${c}`, borderRight: `${t}px solid ${c}` },
        { bottom: 10, left: 10, borderBottom: `${t}px solid ${c}`, borderLeft: `${t}px solid ${c}` },
        { bottom: 10, right: 10, borderBottom: `${t}px solid ${c}`, borderRight: `${t}px solid ${c}` },
    ]
    return (
        <>
            {corners.map((style, i) => (
                <div key={i} aria-hidden style={{ position: 'absolute', width: s, height: s, pointerEvents: 'none', zIndex: 6, ...style }} />
            ))}
        </>
    )
}

// ── Main export ───────────────────────────────────────────────────────────────

interface ConstellationCanvasProps {
    reducedMotion?: boolean
    gpuTier?: number
    height?: number | string
}

export function ConstellationCanvas({ reducedMotion = false, gpuTier = 2, height = 520 }: ConstellationCanvasProps) {
    const [hoveredNode, setHoveredNode] = useState<SkillNode | null>(null)
    const [screenPos, setScreenPos] = useState<{ x: number; y: number } | null>(null)
    const [filterCat, setFilterCat] = useState<SkillCategory | null>(null)
    const [scanState, setScanState] = useState<'idle' | 'scanning' | 'locked'>('idle')

    const handleHover = useCallback((node: SkillNode | null, pos: { x: number; y: number } | null) => {
        setHoveredNode(node)
        setScreenPos(pos)
    }, [])

    if (gpuTier === 0 || reducedMotion) return <AccessibleFallback />

    return (
        <div
            style={{ position: 'relative', width: '100%', height, borderRadius: 'var(--radius-md)', overflow: 'hidden' }}
            aria-label="Interactive skill constellation. Hover nodes to explore technologies."
        >
            {/* CSS for ping animation */}
            <style>{`@keyframes hudPing { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.4;transform:scale(1.5)} }`}</style>

            <Canvas
                camera={{ position: [0, 0, 9], fov: 55, near: 0.1, far: 100 }}
                gl={{ antialias: gpuTier >= 2, alpha: true, powerPreference: 'high-performance', depth: true }}
                dpr={[1, Math.min(window.devicePixelRatio, 1.5)]}
                style={{ background: 'transparent' }}
                frameloop="always"
            >
                <ConstellationScene
                    onHover={handleHover}
                    onScanState={setScanState}
                    reducedMotion={reducedMotion}
                />
            </Canvas>

            <CornerBrackets />
            <ScanHUD state={scanState} />
            <NodeInfoPanel node={hoveredNode} screenPos={screenPos} />
            <CategoryLegend active={filterCat} onFilter={setFilterCat} />

            {/* accessible fallback toggle */}
            <details style={{ position: 'absolute', bottom: 56, right: 16, zIndex: 10 }}>
                <summary style={{ fontFamily: 'var(--font-mono)', fontSize: '0.50rem', letterSpacing: '0.12em', color: 'rgba(255,255,255,0.18)', cursor: 'pointer', userSelect: 'none', textTransform: 'uppercase', listStyle: 'none' }}>
                    TEXT LIST ↓
                </summary>
                <div style={{ position: 'absolute', bottom: '100%', right: 0, width: 340, maxHeight: 300, overflowY: 'auto', background: 'rgba(6,8,16,0.96)', border: '1px solid var(--color-border-default)', borderRadius: 'var(--radius-md)', padding: 16, backdropFilter: 'blur(12px)' }}>
                    <AccessibleFallback />
                </div>
            </details>

            <div className="sr-only" aria-label="Technology list">
                <h3>Technology list</h3>
                <ul>
                    {skillNodes.map((skill) => (
                        <li key={skill.id}>{skill.label}: {skill.category}, {skill.level}% proficiency, {skill.years} years. {skill.description}</li>
                    ))}
                </ul>
            </div>
        </div>
    )
}
