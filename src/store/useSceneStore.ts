import { create } from 'zustand'
import * as THREE from 'three'

interface SceneState {
    cameraTarget: THREE.Vector3
    cameraPosition: THREE.Vector3
    sceneBlend: number[]   // blend weights per section [0..6]
    frameloopActive: boolean
    activeMissionIndex: number

    setCameraTarget: (v: THREE.Vector3) => void
    setCameraPosition: (v: THREE.Vector3) => void
    setSceneBlend: (blends: number[]) => void
    setFrameloopActive: (v: boolean) => void
    setActiveMissionIndex: (i: number) => void
}

export const useSceneStore = create<SceneState>((set) => ({
    cameraTarget: new THREE.Vector3(0, 0, 0),
    cameraPosition: new THREE.Vector3(0, 0, 6),
    sceneBlend: [1, 0, 0, 0, 0, 0, 0],
    frameloopActive: true,
    activeMissionIndex: 0,

    setCameraTarget: (v) => set({ cameraTarget: v }),
    setCameraPosition: (v) => set({ cameraPosition: v }),
    setSceneBlend: (blends) => set({ sceneBlend: blends }),
    setFrameloopActive: (v) => set({ frameloopActive: v }),
    setActiveMissionIndex: (i) => set({ activeMissionIndex: i }),
}))
