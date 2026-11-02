import { useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

export interface CameraRigConfig {
    /** how strongly mouse moves the camera, 0 = disabled */
    parallaxStrength: number
    /** smoothing factor — lower = more lag, higher = snappier */
    lerpFactor: number
    /** cinematic drift amplitude in radians */
    driftAmplitude: number
    /** drift cycle period in seconds */
    driftPeriod: number
    /** base camera position */
    basePosition: [number, number, number]
}

export const DEFAULT_RIG_CONFIG: CameraRigConfig = {
    parallaxStrength: 0.25,
    lerpFactor: 0.8,
    driftAmplitude: 0.008,
    driftPeriod: 18,
    basePosition: [0, 0, 6],
}

interface CameraRigProps {
    mouseRef: React.RefObject<THREE.Vector2>
    config?: Partial<CameraRigConfig>
    reducedMotion?: boolean
}

/**
 * Camera controller — never mounts any visible geometry.
 * Reads mouse position from shared ref and applies:
 *   - smooth lagged parallax offset
 *   - gentle cinematic drift
 *   - target lerp
 */
export function CameraRig({
    mouseRef,
    config: configOverride = {},
    reducedMotion = false,
}: CameraRigProps) {
    const config: CameraRigConfig = { ...DEFAULT_RIG_CONFIG, ...configOverride }
    const { camera } = useThree()

    // current smoothed offsets
    const smoothMouse = useRef(new THREE.Vector2(0, 0))
    const targetPos = useRef(new THREE.Vector3(...config.basePosition))
    const currentPos = useRef(new THREE.Vector3(...config.basePosition))

    useFrame((state, delta) => {
        if (reducedMotion) return

        const t = state.clock.elapsedTime
        const str = config.parallaxStrength

        // lerp smoothed mouse toward raw mouse
        if (mouseRef.current) {
            smoothMouse.current.lerp(mouseRef.current, delta * config.lerpFactor)
        }

        // cinematic drift
        const driftX = Math.sin(t / config.driftPeriod * Math.PI * 2) * config.driftAmplitude
        const driftY = Math.sin(t / config.driftPeriod * Math.PI * 2 * 0.7) * config.driftAmplitude * 0.6

        // target from mouse parallax + drift
        targetPos.current.set(
            config.basePosition[0] + smoothMouse.current.x * str + driftX,
            config.basePosition[1] - smoothMouse.current.y * str * 0.6 + driftY,
            config.basePosition[2],
        )

        // smooth position interpolation — prevent jarring camera cuts
        const lerpAmt = Math.min(delta * 1.6, 1)
        currentPos.current.lerp(targetPos.current, lerpAmt)

        camera.position.copy(currentPos.current)
        // always look at origin so the star sphere fills the screen correctly
        camera.lookAt(0, 0, 0)
    })

    return null
}
