import { create } from 'zustand'

export type SectionId =
    | 'hero'
    | 'about'
    | 'skills'
    | 'experience'
    | 'projects'
    | 'blog'
    | 'contact'

export type CursorVariant = 'default' | 'hover' | 'active' | 'text' | 'drag'

export interface ModalConfig {
    type: 'project' | 'blog' | 'skill'
    id: string
}

interface AppState {
    activeSection: SectionId
    sectionProgress: number
    isNavigating: boolean
    cursorVariant: CursorVariant
    cursorLabel: string
    activeModal: ModalConfig | null
    menuOpen: boolean
    gpuTier: 0 | 1 | 2 | 3
    reducedMotion: boolean

    setActiveSection: (section: SectionId) => void
    setSectionProgress: (progress: number) => void
    setIsNavigating: (v: boolean) => void
    setCursor: (variant: CursorVariant, label?: string) => void
    openModal: (config: ModalConfig) => void
    closeModal: () => void
    setMenuOpen: (v: boolean) => void
    setGpuTier: (tier: 0 | 1 | 2 | 3) => void
    setReducedMotion: (v: boolean) => void
}

export const useAppStore = create<AppState>((set) => ({
    activeSection: 'hero',
    sectionProgress: 0,
    isNavigating: false,
    cursorVariant: 'default',
    cursorLabel: '',
    activeModal: null,
    menuOpen: false,
    gpuTier: 2,
    reducedMotion: false,

    setActiveSection: (section) => set({ activeSection: section }),
    setSectionProgress: (progress) => set({ sectionProgress: progress }),
    setIsNavigating: (v) => set({ isNavigating: v }),
    setCursor: (variant, label = '') => set({ cursorVariant: variant, cursorLabel: label }),
    openModal: (config) => set({ activeModal: config }),
    closeModal: () => set({ activeModal: null }),
    setMenuOpen: (v) => set({ menuOpen: v }),
    setGpuTier: (tier) => set({ gpuTier: tier }),
    setReducedMotion: (v) => set({ reducedMotion: v }),
}))
