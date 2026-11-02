// ─────────────────────────────────────────────────────────────────────────────
//  AUDIO STORE
//  Persists sound preference in localStorage.
//  The AudioEngine singleton is controlled through this store's actions.
// ─────────────────────────────────────────────────────────────────────────────

import { create } from 'zustand'
import { useShallow } from 'zustand/shallow'
import { audioEngine } from '@/lib/audioEngine'

const STORAGE_KEY = 'void_audio_enabled'
const VOLUME_KEY = 'void_audio_volume'

function readStoredEnabled(): boolean {
    try { return localStorage.getItem(STORAGE_KEY) === 'true' } catch { return false }
}
function readStoredVolume(): number {
    try {
        const v = parseFloat(localStorage.getItem(VOLUME_KEY) ?? '')
        return isNaN(v) ? 0.35 : Math.max(0, Math.min(1, v))
    } catch { return 0.35 }
}

interface AudioState {
    /** Whether the user has opted in to audio */
    enabled: boolean
    /** Master volume 0–1 */
    volume: number
    /** True while the AudioContext is warming up */
    loading: boolean

    toggle: () => Promise<void>
    setVolume: (v: number) => void
    playClick: () => void
    playHover: () => void
    playTransition: () => void
    playConfirm: () => void
    playError: () => void
    playOpen: () => void
}

export const useAudioStore = create<AudioState>((set, get) => ({
    enabled: readStoredEnabled(),
    volume: readStoredVolume(),
    loading: false,

    toggle: async () => {
        const { enabled } = get()
        if (!enabled) {
            set({ loading: true })
            try {
                await audioEngine.enable()
                audioEngine.setVolume(get().volume)
                set({ enabled: true, loading: false })
                try { localStorage.setItem(STORAGE_KEY, 'true') } catch { /* ignore */ }
            } catch {
                set({ loading: false })
            }
        } else {
            audioEngine.disable()
            set({ enabled: false })
            try { localStorage.setItem(STORAGE_KEY, 'false') } catch { /* ignore */ }
        }
    },

    setVolume: (v: number) => {
        const clamped = Math.max(0, Math.min(1, v))
        audioEngine.setVolume(clamped)
        set({ volume: clamped })
        try { localStorage.setItem(VOLUME_KEY, String(clamped)) } catch { /* ignore */ }
    },

    playClick: () => audioEngine.playClick(),
    playHover: () => audioEngine.playHover(),
    playTransition: () => audioEngine.playTransition(),
    playConfirm: () => audioEngine.playConfirm(),
    playError: () => audioEngine.playError(),
    playOpen: () => audioEngine.playOpen(),
}))

// ── Convenience hook for interaction sounds only ──────────────────────────────
export function useAudioFeedback() {
    return useAudioStore(useShallow((s) => ({
        click: s.playClick,
        hover: s.playHover,
        confirm: s.playConfirm,
        error: s.playError,
        open: s.playOpen,
        transition: s.playTransition,
    })))
}
