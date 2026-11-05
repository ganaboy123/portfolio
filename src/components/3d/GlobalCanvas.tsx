import { Canvas } from '@react-three/fiber'
import { Suspense } from 'react'
import { CosmicScene } from './scenes/CosmicScene'
import { HeroScene } from './scenes/HeroScene'
import { AboutScene } from './scenes/AboutScene'
import { ExperienceScene } from './scenes/ExperienceScene'
import { useAppStore } from '@/store/useAppStore'
import { useSceneStore } from '@/store/useSceneStore'
import { DEFAULT_LAYERS } from './objects/StarField'
import type { SceneMode } from '@/hooks/useDevice'

interface GlobalCanvasProps {
  /** When true, reduces particle density, disables parallax + dust */
  isMobile?: boolean
  isTablet?: boolean
  sceneMode?: SceneMode
}

export function GlobalCanvas({ isMobile = false, isTablet = false, sceneMode = 'full' }: GlobalCanvasProps) {
  const gpuTier = useAppStore((s) => s.gpuTier)
  const reducedMotion = useAppStore((s) => s.reducedMotion)
  const activeSection = useAppStore((s) => s.activeSection)
  const activeMissionIndex = useSceneStore((s) => s.activeMissionIndex)

  // Mobile star config — reduced counts, no parallax, no foreground layer
  const isLite = sceneMode === 'lite'
  const compactViewport = isMobile || isTablet
  const mobileStarLayers = [
    { ...DEFAULT_LAYERS[0], count: 520, parallaxFactor: 0 },
    { ...DEFAULT_LAYERS[1], count: 180, parallaxFactor: 0 },
  ]

  const mobileCamera = {
    parallaxStrength: 0,      // disable mouse parallax on touch
    lerpFactor: 0.5,
    driftAmplitude: 0.0015,
    driftPeriod: 36,
  }

  // Effective GPU tier — cap to 1 on low-power mobile
  const effectiveTier = (isLite ? Math.min(gpuTier, 1) : gpuTier) as 0 | 1 | 2 | 3

  // Keep high-density displays crisp without letting the background dominate GPU time.
  const maxDpr = compactViewport ? 1.25 : 1.5
  const dprRange: [number, number] = [1, effectiveTier >= 2 ? Math.min(window.devicePixelRatio, maxDpr) : 1]

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 'var(--z-canvas)' as unknown as number,
        pointerEvents: 'none',
        background: 'transparent',
      }}
    >
      <Canvas
        camera={{ position: [0, 0, 6], fov: compactViewport ? 70 : 60, near: 0.1, far: 200 }}
        gl={{
          antialias: effectiveTier >= 2 && !compactViewport,
          alpha: false,
          powerPreference: compactViewport ? 'low-power' : 'high-performance',
          stencil: false,
          depth: true,
        }}
        dpr={dprRange}
        frameloop={reducedMotion ? "demand" : "always"}
        style={{ background: 'transparent' }}
      >
        <Suspense fallback={null}>
          <CosmicScene
            gpuTier={effectiveTier}
            reducedMotion={reducedMotion || isLite}
            atmosphere={compactViewport ? 0.28 : 0.46}
            starLayers={compactViewport ? mobileStarLayers : undefined}
            showDust={!compactViewport && effectiveTier === 3}
            simplifiedBackground
            camera={compactViewport ? mobileCamera : {
              parallaxStrength: 0.22,
              lerpFactor: 0.9,
              driftAmplitude: 0.008,
              driftPeriod: 20,
            }}
          />
          {/* Hero scene simplified on mobile — no distant objects */}
          <HeroScene
            visible={activeSection === 'hero'}
            detail={isLite ? 'lite' : 'full'}
          />
          {!compactViewport && <AboutScene visible={activeSection === 'about'} gpuTier={effectiveTier} />}
          {!compactViewport && <ExperienceScene
            visible={activeSection === 'experience'}
            activeMissionIndex={activeMissionIndex}
            gpuTier={effectiveTier}
          />}
        </Suspense>
      </Canvas>
    </div>
  )
}
