import { create } from 'zustand'

export interface Message {
    id: string
    role: 'user' | 'assistant'
    content: string
    timestamp: number
}

interface AssistantState {
    isOpen: boolean
    isTyping: boolean
    messages: Message[]

    setOpen: (v: boolean) => void
    setTyping: (v: boolean) => void
    addMessage: (msg: Omit<Message, 'id' | 'timestamp'>) => void
    clearMessages: () => void
}

export const useAssistantStore = create<AssistantState>((set) => ({
    isOpen: false,
    isTyping: false,
    messages: [],

    setOpen: (v) => set({ isOpen: v }),
    setTyping: (v) => set({ isTyping: v }),
    addMessage: (msg) =>
        set((state) => ({
            messages: [
                ...state.messages,
                { ...msg, id: crypto.randomUUID(), timestamp: Date.now() },
            ],
        })),
    clearMessages: () => set({ messages: [] }),
}))
