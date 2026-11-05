// ─────────────────────────────────────────────────────────────────────────────
//  NOVA AI ENGINE
//  Two-tier intelligence:
//  1. Real LLM (OpenAI / compatible) — handles ANY question intelligently
//  2. Local fallback engine — works offline with zero API key
//
//  To enable real AI:
//  Set VITE_OPENAI_API_KEY in your .env file.
//  VITE_OPENAI_MODEL defaults to gpt-4o-mini (fast + cheap).
//  VITE_OPENAI_BASE_URL can point to any OpenAI-compatible endpoint.
// ─────────────────────────────────────────────────────────────────────────────

import { portfolioKnowledge, buildLocalResponse, type NovaResponse } from '@/data/portfolioKnowledge'
import { personalInfo, profile } from '@/data/content'
import { labProjects } from '@/data/projects'
import { missions, missionPeriod } from '@/data/experiences'
import { signalLog } from '@/data/signal-log'
import type { Message } from '@/store/useAssistantStore'

const API_KEY = import.meta.env.VITE_OPENAI_API_KEY as string | undefined
const MODEL = (import.meta.env.VITE_OPENAI_MODEL as string) || 'gpt-4o-mini'
const BASE_URL = (import.meta.env.VITE_OPENAI_BASE_URL as string) || 'https://api.openai.com/v1'

// ── Build the system prompt from live portfolio data ──────────────────────────
function buildSystemPrompt(): string {
    const k = portfolioKnowledge
    const byCat = k.skills.byCategory

    const projectsText = labProjects.map((p) =>
        `- ${p.title} (${p.number}): ${p.description} Stack: ${p.technologies.slice(0, 5).join(', ')}. Status: ${p.status}.`
    ).join('\n')

    const experienceText = missions.map((m) =>
        `- ${m.role} at ${m.company} (${missionPeriod(m)}): ${m.description.substring(0, 150)} Achievements: ${m.achievements.slice(0, 2).join('; ')}.`
    ).join('\n')

    const articlesText = signalLog.map((e) =>
        `- "${e.title}" (${e.transmissionId}): ${e.excerpt.substring(0, 100)} Tags: ${e.tags.join(', ')}.`
    ).join('\n')

    const servicesText = k.services.offerings.map((s) =>
        `- ${s.title}: ${s.description} Starting at ${s.startingAt}.`
    ).join('\n')

    return `You are NOVA, an advanced AI assistant embedded in ${personalInfo.name}'s developer portfolio website. You are highly intelligent, warm, witty, and genuinely helpful — like the best blend of ChatGPT, Claude, and Grok.

## YOUR PERSONALITY
- Confident and knowledgeable but never arrogant
- Warm and conversational — you feel like talking to a brilliant friend
- Honest: if you don't know something, say so naturally and offer what you do know
- You can discuss ANY topic: tech, science, history, culture, humor, life advice, current events (up to your training cutoff), creative writing, code help, etc.
- You make jokes when appropriate, empathize when needed, and challenge ideas respectfully
- Keep responses concise but complete — no padding, no filler phrases like "Certainly!" or "Great question!"

## PORTFOLIO KNOWLEDGE BASE
Use this data to answer questions about the portfolio owner.

### ABOUT ${personalInfo.name.toUpperCase()}
- Title: ${personalInfo.title}
- Role: ${profile.role}
- Specialization: ${profile.specialization}
- Location: ${personalInfo.location}
- Email: ${personalInfo.email}
- Bio: ${personalInfo.bio}
- Current Focus: ${profile.currentFocus}
- Availability: ${profile.availability}
- Years Experience: ${k.profile.yearsExperience}+

### SKILLS
- Top: ${k.skills.top.join(', ')}
- Languages: ${byCat.languages.map((s) => `${s.label} (${s.level}%)`).join(', ')}
- Frontend: ${byCat.frontend.map((s) => `${s.label} (${s.level}%)`).join(', ')}
- 3D/WebGL: ${byCat.graphics3d.map((s) => `${s.label} (${s.level}%)`).join(', ')}
- AI/ML: ${byCat.aiMl.map((s) => `${s.label} (${s.level}%)`).join(', ')}
- Backend: ${byCat.backend.map((s) => `${s.label} (${s.level}%)`).join(', ')}
- Databases: ${byCat.databases.map((s) => `${s.label} (${s.level}%)`).join(', ')}
- Cloud: ${byCat.cloud.map((s) => `${s.label} (${s.level}%)`).join(', ')}
- Tools: ${byCat.tools.map((s) => s.label).join(', ')}

### PROJECTS (${labProjects.length} total, ${k.projects.live} live)
${projectsText}

### CAREER EXPERIENCE
${experienceText}

### TECHNICAL ARTICLES (${signalLog.length} published)
${articlesText}

### SERVICES OFFERED
${servicesText}

### WORK PROCESS
${k.services.process.map((s) => `${s.step}. ${s.title}: ${s.description}`).join(' ')}

### CONTACT
- Email: ${personalInfo.email}
- GitHub: ${personalInfo.social.github}
- LinkedIn: ${personalInfo.social.linkedin}
- Twitter: ${personalInfo.social.twitter}

## RESPONSE RULES
1. For portfolio questions, use the knowledge base above — be specific and detailed.
2. For general world questions (science, history, current events, how-to, etc.) — answer them fully and confidently. You are a general-purpose AI assistant, not just a portfolio bot.
3. For coding/tech questions — provide working code examples, explain concepts clearly.
4. For creative requests (write a poem, story, etc.) — engage fully and creatively.
5. Use **bold** for emphasis, bullet points for lists. Keep code in \`backticks\` or code blocks.
6. Never say "I don't have information about that" — always provide value. If it's outside your training, say so naturally and pivot helpfully.
7. Keep responses appropriately sized — short for simple questions, thorough for complex ones.
8. You remember the conversation history — refer back to previous messages naturally.`
}

// ── Format conversation history for API ──────────────────────────────────────
function formatHistory(messages: Message[]): Array<{ role: 'user' | 'assistant'; content: string }> {
    return messages
        .filter((m) => m.role === 'user' || m.role === 'assistant')
        .slice(-12) // last 12 messages for context window efficiency
        .map((m) => ({ role: m.role as 'user' | 'assistant', content: m.content }))
}

// ── LLM API call ─────────────────────────────────────────────────────────────
async function callLLM(
    userMessage: string,
    history: Message[],
    activeSection: string,
): Promise<string> {
    const messages = [
        { role: 'system' as const, content: buildSystemPrompt() },
        // Inject section context
        { role: 'system' as const, content: `The user is currently viewing the "${activeSection}" section of the portfolio.` },
        ...formatHistory(history),
        { role: 'user' as const, content: userMessage },
    ]

    const response = await fetch(`${BASE_URL}/chat/completions`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${API_KEY}`,
        },
        body: JSON.stringify({
            model: MODEL,
            messages,
            max_tokens: 600,
            temperature: 0.75,
            stream: false,
        }),
    })

    if (!response.ok) {
        const err = await response.text()
        throw new Error(`LLM API error ${response.status}: ${err}`)
    }

    const data = await response.json() as {
        choices: Array<{ message: { content: string } }>
    }
    return data.choices[0]?.message?.content ?? ''
}

// ── Main engine entry point ───────────────────────────────────────────────────
export async function novaRespond(
    userMessage: string,
    history: Message[],
    activeSection: string,
): Promise<NovaResponse> {
    // If API key is configured — use real LLM
    if (API_KEY && API_KEY.length > 10) {
        try {
            const text = await callLLM(userMessage, history, activeSection)
            return {
                text,
                suggestions: getSuggestions(activeSection),
            }
        } catch (err) {
            console.warn('[NOVA] LLM call failed, falling back to local engine:', err)
            // Fall through to local engine
        }
    }

    // Local engine fallback (no API key or API error)
    return buildLocalResponse(userMessage, activeSection)
}

// ── Dynamic suggestion generator ─────────────────────────────────────────────
function getSuggestions(section: string): string[] {
    const pools: Record<string, string[]> = {
        hero: [
            `Who is ${personalInfo.name}?`,
            'What services are on offer?',
            'Tell me about the projects',
            'What technologies are used here?',
        ],
        about: [
            'What is the current availability?',
            'What are the key engineering traits?',
            'What is the current focus area?',
        ],
        skills: [
            'What are the strongest skills?',
            'Explain the WebGL experience',
            'What AI/ML experience is there?',
            'Compare frontend vs backend skills',
        ],
        experience: [
            'Tell me about the current role',
            'What are the biggest career achievements?',
            'How many years of experience?',
        ],
        projects: [
            'What is the most impressive project?',
            'Tell me about Neural Mesh',
            'Tell me about Void Engine',
            'Any open source work?',
        ],
        blog: [
            'What topics are covered in the articles?',
            'Tell me about the GLSL shaders article',
            'Any writing on WebGPU?',
        ],
        contact: [
            'How do I hire you?',
            'What are the rates?',
            'What is the work process?',
        ],
    }
    const pool = pools[section] ?? pools.hero
    // Return 3 random suggestions from the pool
    return pool.sort(() => Math.random() - 0.5).slice(0, 3)
}

// ── Export API key status for UI ──────────────────────────────────────────────
export const isLLMConfigured = (): boolean => Boolean(API_KEY && API_KEY.length > 10)
