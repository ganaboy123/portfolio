import { useRef, useEffect } from 'react'
import * as THREE from 'three'
import { NebulaBackground } from '../objects/NebulaBackground'
import { StarField, DEFAULT_LAYERS } from '../objects/StarField'
import { AmbientDust, DEFAULT_DUST_LAYERS } from '../objects/AmbientDust'
import { CameraRig, DEFAULT_RIG_CONFIG } from '../objects/CameraRig'
import type { StarLayerConfig } from '../objects/StarField'
import type { DustLayerConfig } from '../objects/AmbientDust'
import type { CameraRigConfig } from '../objects/CameraRig'

export interface CosmicSceneConfig {
    // ── Stars ───────────────────────────────
    starLayers?: StarLayerConfig[]

    // ── Dust ────────────────────────────────
    dustLayers?: DustLayerConfig[]
    showDust?: boolean

    // ── Nebula ──────────────────────────────
    atmosphere?: number    // 0-1

    // ── Camera ──────────────────────────────
    camera?: Partial<CameraRigConfig>

    // ── Global ──────────────────────────────
    reducedMotion?: boolean
    /** gpuTier 0-3 — gates expensive effects */
    gpuTier?: 0 | 1 | 2 | 3
    /** Replaces the animated fragment shader on limited devices. */
    simplifiedBackground?: boolean
}

interface CosmicSceneProps extends CosmicSceneConfig {
    /** optional external mouse ref — if not provided, scene creates its own */
    mouseRef?: React.RefObject<THREE.Vector2>
}

/**
 * CosmicScene — the complete deep-space environment.
 *
 * Layers (back to front):
 *   1. NebulaBackground   — fullscreen GLSL shader quad
 *   2. StarField          — 3 depth layers, custom shader, mouse parallax
 *   3. AmbientDust        — soft additive dust/haze
 *   4. CameraRig          — mouse parallax + cinematic drift
 *
 * GPU tier gating:
 *   tier 0 — nebula only (static)
 *   tier 1 — nebula + background stars (no dust)
 *   tier 2 — full scene, reduced dust
 *   tier 3 — full scene
 */
export function CosmicScene({
    starLayers,
    dustLayers,
    showDust = true,
    atmosphere = 0.7,
    camera,
    reducedMotion = false,
    gpuTier = 2,
    simplifiedBackground = false,
    mouseRef: externalMouseRef,
}: CosmicSceneProps) {
    // shared mouse position — normalized -1..1
    const internalMouseRef = useRef<THREE.Vector2>(new THREE.Vector2(0, 0))
    const mouseRef = externalMouseRef ?? internalMouseRef

    // resolve star layers based on GPU tier
    const resolvedStarLayers: StarLayerConfig[] = starLayers ?? (() => {
        if (gpuTier === 0) return []
        if (gpuTier === 1) return [DEFAULT_LAYERS[0]]                    // bg only
        if (gpuTier === 2) return [DEFAULT_LAYERS[0], DEFAULT_LAYERS[1]] // bg + mid
        return DEFAULT_LAYERS                                             // all 3
    })()

    // resolve dust layers
    const resolvedDustLayers: DustLayerConfig[] = dustLayers ?? (() => {
        if (gpuTier < 2) return []
        if (gpuTier === 2) return [DEFAULT_DUST_LAYERS[0]]               // cyan only
        return DEFAULT_DUST_LAYERS                                        // all
    })()

    const cameraConfig = { ...DEFAULT_RIG_CONFIG, ...camera }

    return (
        <>
            {/* Mouse tracker — only if not reduced motion */}
            {!reducedMotion && (
                <MouseTracker mouseRef={mouseRef} />
            )}

            {/* 1. Deep-space background */}
            <NebulaBackground
                atmosphere={gpuTier === 0 ? atmosphere * 0.4 : atmosphere}
                simplified={simplifiedBackground}
            />

            {/* 2. Star layers */}
            {resolvedStarLayers.length > 0 && (
                <StarField
                    layers={resolvedStarLayers}
                    mouseRef={mouseRef}
                    reducedMotion={reducedMotion}
                />
            )}

            {/* 3. Dust and atmospheric haze */}
            {showDust && resolvedDustLayers.length > 0 && (
                <AmbientDust
                    layers={resolvedDustLayers}
                    reducedMotion={reducedMotion}
                />
            )}

            {/* 4. Camera controller */}
            <CameraRig
                mouseRef={mouseRef}
                config={cameraConfig}
                reducedMotion={reducedMotion}
            />
        </>
    )
}

// ─── Mouse tracker helper component ──────────────────────────────────────────

/**
 * Attaches a window mousemove listener and writes normalized coords into the ref.
 */
function MouseTracker({ mouseRef }: { mouseRef: React.RefObject<THREE.Vector2> }) {
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (!mouseRef.current) return
            mouseRef.current.set(
                (e.clientX / window.innerWidth) * 2 - 1,
                (e.clientY / window.innerHeight) * 2 - 1,
            )
        }
        window.addEventListener('mousemove', handler, { passive: true })
        return () => window.removeEventListener('mousemove', handler)
    }, [mouseRef])

    return null
}
