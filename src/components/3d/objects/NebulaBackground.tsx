import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { nebulaVertexShader, nebulaFragmentShader } from '../shaders/nebula.glsl'

interface NebulaBackgroundProps {
    atmosphere?: number   // 0-1 glow intensity
    simplified?: boolean
}

/**
 * Fullscreen clip-space quad rendered at z=far.
 * Uses double-domain-warped FBM for deep-space color.
 */
export function NebulaBackground({ atmosphere = 0.7, simplified = false }: NebulaBackgroundProps) {
    const matRef = useRef<THREE.ShaderMaterial>(null)

    const uniforms = useRef({
        uTime: { value: 0 },
        uAtmosphere: { value: atmosphere },
        uNebulaColorA: { value: new THREE.Vector3(0.04, 0.03, 0.08) },  // deep violet
        uNebulaColorB: { value: new THREE.Vector3(0.03, 0.04, 0.10) },  // deep blue
        uNebulaColorC: { value: new THREE.Vector3(0.05, 0.12, 0.22) },  // cyan bloom
        uNebulaColorD: { value: new THREE.Vector3(0.10, 0.05, 0.18) },  // violet bloom
    })

    useFrame((_, delta) => {
        if (!matRef.current || simplified) return
        matRef.current.uniforms.uTime.value += delta
        // smoothly track atmosphere prop changes
        const cur = matRef.current.uniforms.uAtmosphere.value as number
        matRef.current.uniforms.uAtmosphere.value = THREE.MathUtils.lerp(cur, atmosphere, delta * 2)
    })

    return (
        // renderOrder -1 ensures it's behind everything
        <mesh renderOrder={-1}>
            <planeGeometry args={[2, 2]} />
            {simplified ? (
                <meshBasicMaterial color="#071427" />
            ) : (
                <shaderMaterial
                    ref={matRef}
                    vertexShader={nebulaVertexShader}
                    fragmentShader={nebulaFragmentShader}
                    uniforms={uniforms.current}
                    depthTest={false}
                    depthWrite={false}
                />
            )}
        </mesh>
    )
}
