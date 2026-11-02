/**
 * NOVA — AI Portfolio Assistant
 *
 * Orchestrates the AIButton (HUD trigger) and AIAssistant (panel).
 * Both are independently importable; this file just co-locates them.
 *
 * To swap the response engine for a real AI API:
 *   → Edit `buildLocalResponse` in src/data/portfolioKnowledge.ts
 *   → Or replace the setTimeout block in AIAssistant.tsx with a fetch to /api/nova
 *   → Never expose keys here — proxy through a server-side endpoint
 */

import { AIButton } from './AIButton'
import { AIAssistant } from './AIAssistant'

export function AssistantOrb() {
    return (
        <>
            <AIAssistant />
            <AIButton />
        </>
    )
}
