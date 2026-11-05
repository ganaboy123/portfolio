import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type MessageRole = 'user' | 'assistant' | 'system'
export type NovaMode = 'assistant' | 'casual' | 'technical' | 'creative'
export type NovaStatus = 'online' | 'thinking' | 'searching' | 'idle'

export interface MessageAction {
    label: string
    type: 'navigate' | 'link' | 'copy' | 'prompt'
    value: string
}

export interface Message {
    id: string
    role: MessageRole
    content: string
    timestamp: number
    isStreaming?: boolean
    actions?: MessageAction[]
    suggestions?: string[]
    metadata?: {
        intent?: string
        confidence?: number
        sources?: string[]
        isWeb?: boolean
    }
}

interface AssistantState {
    isOpen: boolean
    isTyping: boolean
    status: NovaStatus
    mode: NovaMode
    messages: Message[]
    inputDraft: string
    streamedText: string
    sessionStart: number

    setOpen: (v: boolean) => void
    setTyping: (v: boolean) => void
    setStatus: (s: NovaStatus) => void
    setMode: (m: NovaMode) => void
    addMessage: (msg: Omit<Message, 'id' | 'timestamp'>) => void
    updateLastMessage: (content: string) => void
    clearMessages: () => void
    setInputDraft: (v: string) => void
    setStreamedText: (v: string) => void
}

export const useAssistantStore = create<AssistantState>()(
    persist(
        (set) => ({
            isOpen: false,
            isTyping: false,
            status: 'online',
            mode: 'assistant',
            messages: [],
            inputDraft: '',
            streamedText: '',
            sessionStart: Date.now(),

            setOpen: (v) => set({ isOpen: v }),
            setTyping: (v) => set({ isTyping: v }),
            setStatus: (s) => set({ status: s }),
            setMode: (m) => set({ mode: m }),
            addMessage: (msg) =>
                set((state) => ({
                    messages: [
                        ...state.messages,
                        { ...msg, id: crypto.randomUUID(), timestamp: Date.now() },
                    ],
                })),
            updateLastMessage: (content) =>
                set((state) => {
                    const msgs = [...state.messages]
                    if (msgs.length > 0) msgs[msgs.length - 1] = { ...msgs[msgs.length - 1], content }
                    return { messages: msgs }
                }),
            clearMessages: () => set({ messages: [], sessionStart: Date.now() }),
            setInputDraft: (v) => set({ inputDraft: v }),
            setStreamedText: (v) => set({ streamedText: v }),
        }),
        {
            name: 'nova-conversation',
            partialize: (state) => ({ messages: state.messages.slice(-20), mode: state.mode }),
        },
    ),
)
