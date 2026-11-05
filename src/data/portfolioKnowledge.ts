// ─────────────────────────────────────────────────────────────────────────────
//  NOVA KNOWLEDGE LAYER v2
//  Full knowledge engine — connected to all data sources.
//  Powers intent detection, rich responses, suggestions, and web-awareness.
// ─────────────────────────────────────────────────────────────────────────────

import { personalInfo, profile, skillNodes } from './content'
import { labProjects, PROJECT_CATEGORIES } from './projects'
import { signalLog, SIGNAL_CATEGORIES } from './signal-log'
import { missions, missionPeriod, missionDurationMonths } from './experiences'
import {
    PROJECT_TYPES, BUDGET_RANGES, TIMELINES,
    communicationChannels,
} from './content'
import type { MessageAction } from '@/store/useAssistantStore'

// ── Derived facts ─────────────────────────────────────────────────────────────
const totalExperienceYears = (() => {
    const earliest = new Date(Math.min(...missions.map((m) => new Date(m.startDate).getTime())))
    return Math.floor((Date.now() - earliest.getTime()) / (1000 * 60 * 60 * 24 * 365))
})()

const topSkills = [...skillNodes].sort((a, b) => b.level - a.level).slice(0, 6).map((s) => `${s.label} (${s.level}%)`)
const liveProjects = labProjects.filter((p) => p.status === 'live')
const wipProjects = labProjects.filter((p) => p.status === 'wip')
const featuredProjects = labProjects.filter((p) => p.featured)

// ── Full knowledge graph ──────────────────────────────────────────────────────
export const portfolioKnowledge = {
    profile: {
        name: personalInfo.name,
        title: personalInfo.title,
        role: profile.role,
        specialization: profile.specialization,
        location: personalInfo.location,
        email: personalInfo.email,
        bio: personalInfo.bio,
        currentFocus: profile.currentFocus,
        availability: profile.availability,
        yearsExperience: totalExperienceYears,
        stats: profile.stats,
        social: personalInfo.social,
        traits: profile.traits,
    },
    skills: {
        top: topSkills,
        all: skillNodes,
        byCategory: {
            languages: skillNodes.filter((s) => s.category === 'language'),
            frontend: skillNodes.filter((s) => s.category === 'frontend'),
            backend: skillNodes.filter((s) => s.category === 'backend'),
            graphics3d: skillNodes.filter((s) => s.category === '3d-webgl'),
            aiMl: skillNodes.filter((s) => s.category === 'ai-ml'),
            databases: skillNodes.filter((s) => s.category === 'database'),
            cloud: skillNodes.filter((s) => s.category === 'cloud'),
            tools: skillNodes.filter((s) => s.category === 'tools'),
        },
    },
    projects: {
        total: labProjects.length,
        live: liveProjects.length,
        wip: wipProjects.length,
        featured: featuredProjects,
        all: labProjects,
        categories: PROJECT_CATEGORIES,
        byCategory: (cat: string) => labProjects.filter((p) => p.category === cat),
        find: (q: string) => labProjects.find(
            (p) => p.title.toLowerCase().includes(q.toLowerCase()) ||
                p.id.toLowerCase().includes(q.toLowerCase()) ||
                p.id.split('-').every((w) => q.toLowerCase().includes(w))
        ),
    },
    experience: {
        total: totalExperienceYears,
        missions,
        missionPeriod,
        current: missions.find((m) => m.status === 'active') ?? missions[0],
        all: missions,
        longestRole: [...missions].sort((a, b) => missionDurationMonths(b) - missionDurationMonths(a))[0],
        allAchievements: missions.flatMap((m) => m.achievements),
        allTechnologies: [...new Set(missions.flatMap((m) => m.technologies))],
    },
    writing: {
        total: signalLog.length,
        featured: signalLog.filter((e) => e.featured),
        all: signalLog,
        categories: SIGNAL_CATEGORIES,
        topics: [...new Set(signalLog.flatMap((e) => e.tags))],
        find: (q: string) => signalLog.find(
            (e) => e.title.toLowerCase().includes(q.toLowerCase()) ||
                e.tags.some((t) => t.toLowerCase().includes(q.toLowerCase()))
        ),
        byCategory: (cat: string) => signalLog.filter((e) => e.category === cat),
    },
    contact: {
        email: personalInfo.email,
        availability: profile.availability,
        social: personalInfo.social,
        channels: communicationChannels,
        projectTypes: PROJECT_TYPES,
        budgetRanges: BUDGET_RANGES,
        timelines: TIMELINES,
    },
    services: {
        offerings: [
            {
                id: 'webgl-3d',
                title: 'WebGL & 3D Experiences',
                description: 'Immersive browser-based 3D worlds, interactive data visualizations, and real-time environments using Three.js, React Three Fiber, and custom GLSL shaders.',
                technologies: ['Three.js', 'React Three Fiber', 'GLSL', 'WebGPU', 'GSAP'],
                startingAt: '$5,000',
            },
            {
                id: 'fullstack',
                title: 'Full Stack Web Applications',
                description: 'End-to-end product development from React frontends to Node.js APIs, PostgreSQL databases, and cloud deployment on AWS.',
                technologies: ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'AWS'],
                startingAt: '$8,000',
            },
            {
                id: 'ai-integration',
                title: 'AI / LLM Integration',
                description: 'Integrate LLMs, build RAG pipelines, and ship production-ready AI features into your product using OpenAI, Anthropic, and open-source models.',
                technologies: ['LLM APIs', 'RAG', 'PyTorch', 'Python', 'Node.js'],
                startingAt: '$6,000',
            },
            {
                id: 'creative-tech',
                title: 'Creative Technology',
                description: 'Award-worthy interactive campaigns, creative coding, generative art, and experimental browser experiences.',
                technologies: ['WebGL', 'GSAP', 'Canvas', 'Web Audio API', 'GLSL'],
                startingAt: '$4,000',
            },
            {
                id: 'consulting',
                title: 'Technical Consulting',
                description: 'Architecture review, performance audits, technology selection, and engineering leadership on complex projects.',
                technologies: ['Architecture', 'Code Review', 'Performance', 'Strategy'],
                startingAt: '$250/hr',
            },
        ],
        process: [
            { step: 1, title: 'Discovery', description: 'Understand your goals, constraints, and technical requirements.' },
            { step: 2, title: 'Proposal', description: 'Detailed scope, timeline, and fixed-price quote.' },
            { step: 3, title: 'Design', description: 'Architecture and UX decisions made collaboratively.' },
            { step: 4, title: 'Build', description: 'Iterative development with weekly check-ins.' },
            { step: 5, title: 'Launch', description: 'Deployment, testing, and handover documentation.' },
        ],
    },
}

// ── Contextual suggested prompts ──────────────────────────────────────────────
export const CONTEXTUAL_PROMPTS: Record<string, string[]> = {
    hero: [
        `Who is ${personalInfo.name}?`,
        'What technologies power this site?',
        'I want to hire you — what are your services?',
    ],
    about: [
        'What is your current availability?',
        'What are your personality traits as an engineer?',
        'What are you currently focused on?',
    ],
    skills: [
        'What are your strongest skills?',
        'Tell me about your WebGL experience',
        'What AI/ML work have you done?',
    ],
    experience: [
        'Tell me about your current role',
        'What are your biggest career achievements?',
        'What industries have you worked in?',
    ],
    projects: [
        'What is your most impressive project?',
        'Tell me about Neural Mesh',
        'Do you have any open source projects?',
    ],
    blog: [
        'What do you write about?',
        'Tell me about the GLSL shaders article',
        'Any content on WebGPU?',
    ],
    contact: [
        'How do I hire you?',
        'What are your rates?',
        'What project types do you take on?',
    ],
}

// ── Intent detection ──────────────────────────────────────────────────────────
export type Intent =
    | 'greeting' | 'farewell' | 'thanks' | 'identity' | 'availability'
    | 'contact' | 'portfolio_stack' | 'skills_general' | 'skills_specific'
    | 'webgl' | 'ai_ml' | 'project_specific' | 'projects_general'
    | 'project_strongest' | 'experience' | 'achievements' | 'writing'
    | 'navigation' | 'location' | 'technologies' | 'services' | 'pricing'
    | 'process' | 'casual_weather' | 'casual_joke' | 'casual_general'
    | 'nova_identity' | 'capabilities' | 'help' | 'unknown'

// Keyword scoring map — each intent has an array of keyword triggers.
// More specific intents are scored higher or checked first.
const INTENT_KEYWORDS: Array<{ intent: Intent; keywords: string[]; weight?: number }> = [
    // Greetings — loose match, any position
    { intent: 'greeting', keywords: ['hi', 'hello', 'hey', 'yo', 'sup', 'good morning', 'good evening', 'good afternoon', 'greetings', 'howdy', 'hiya', 'what\'s up', 'wassup'], weight: 2 },
    { intent: 'farewell', keywords: ['bye', 'goodbye', 'see ya', 'cya', 'take care', 'later', 'farewell', 'good night', 'until next time'] },
    { intent: 'thanks', keywords: ['thanks', 'thank you', 'thx', 'ty', 'appreciate', 'cheers', 'grateful', 'much appreciated'] },

    // NOVA / system
    { intent: 'nova_identity', keywords: ['who are you', 'what are you', 'are you an ai', 'are you a bot', 'are you human', 'your name', 'what is nova', 'about nova', 'tell me about yourself', 'introduce yourself', 'nova'], weight: 2 },
    { intent: 'capabilities', keywords: ['what can you do', 'what can you help', 'capabilities', 'what do you know', 'how do you work', 'what are you capable', 'your abilities', 'what do you offer me', 'how can you help'] },
    { intent: 'help', keywords: ['help', 'guide me', 'what should i ask', 'i\'m lost', 'what can i ask', 'not sure what to ask', 'confused', 'get started'] },

    // Person / portfolio owner
    { intent: 'identity', keywords: ['who is harrison', 'who built', 'who made', 'tell me about harrison', 'about the developer', 'about the owner', 'background', 'harrison appiah', 'the person', 'the engineer', 'the developer', 'about him', 'who is this', 'introduce harrison', 'portfolio owner'], weight: 2 },

    // Services & business
    { intent: 'services', keywords: ['services', 'what do you offer', 'what do you build', 'what can you make', 'what do you do', 'offerings', 'work with you', 'hire you', 'work type', 'what kind of work', 'type of projects', 'what you do', 'build for me'] },
    { intent: 'pricing', keywords: ['price', 'pricing', 'rate', 'rates', 'cost', 'fee', 'fees', 'budget', 'how much', 'charge', 'invoice', 'payment', 'afford', 'expensive', 'cheap', 'quote', 'estimate'] },
    { intent: 'process', keywords: ['process', 'workflow', 'how do we work', 'how does it work', 'steps', 'phases', 'engagement', 'onboard', 'getting started', 'start a project', 'how to start', 'what happens after', 'next steps'] },
    { intent: 'availability', keywords: ['available', 'availability', 'hire', 'freelance', 'contract', 'work together', 'collaborate', 'open to work', 'for hire', 'taking projects', 'open for work', 'are you free', 'can i hire', 'looking for work'] },
    { intent: 'contact', keywords: ['contact', 'email', 'reach out', 'get in touch', 'message', 'dm', 'social', 'github', 'linkedin', 'twitter', 'connect', 'how to reach', 'contact info', 'social media', 'find you online'] },

    // Portfolio tech
    { intent: 'portfolio_stack', keywords: ['built with', 'this site', 'this portfolio', 'how is this made', 'tech stack', 'what powers this', 'technologies used here', 'vite', 'react three fiber', 'how was this built', 'what runs this'] },

    // Skills
    { intent: 'webgl', keywords: ['webgl', 'three.js', 'threejs', 'glsl', 'shader', 'shaders', '3d', 'r3f', 'react three', 'webgpu', 'wgsl', 'canvas', 'opengl', 'graphics', '3d experience', 'three fiber'] },
    { intent: 'ai_ml', keywords: ['ai', 'machine learning', 'ml', 'llm', 'gpt', 'pytorch', 'rag', 'openai', 'anthropic', 'langchain', 'neural network', 'deep learning', 'artificial intelligence', 'language model', 'fine-tuning', 'embeddings'] },
    { intent: 'skills_general', keywords: ['skills', 'skill', 'strongest', 'best at', 'proficient', 'expert at', 'specialise', 'specialize', 'what are your skills', 'tech skills', 'what do you know', 'capabilities', 'expertise', 'what are you good at', 'strongest skills', 'top skills'] },
    { intent: 'technologies', keywords: ['technologies', 'technology', 'frameworks', 'tools', 'tech stack', 'full stack', 'languages', 'what technologies', 'what do you use', 'work with', 'full list', 'all skills', 'all technologies'] },
    { intent: 'skills_specific', keywords: ['typescript', 'python', 'rust', 'javascript', 'css', 'tailwind', 'node.js', 'nodejs', 'postgres', 'postgresql', 'mongodb', 'docker', 'aws', 'redis', 'gsap', 'react', 'figma'] },

    // Projects
    { intent: 'project_strongest', keywords: ['best project', 'strongest project', 'most impressive', 'top project', 'favourite project', 'favorite project', 'flagship', 'most complex', 'most advanced', 'highlight project', 'showcase'] },
    { intent: 'projects_general', keywords: ['projects', 'project', 'digital lab', 'lab', 'portfolio work', 'what have you built', 'your work', 'show me work', 'show projects', 'your projects', 'all projects', 'what projects', 'built', 'created', 'developed'] },

    // Experience
    { intent: 'achievements', keywords: ['achievements', 'accomplish', 'highlights', 'results', 'impact', 'metrics', 'proud of', 'biggest wins', 'success', 'key results', 'what have you achieved'] },
    { intent: 'experience', keywords: ['experience', 'career', 'job', 'role', 'company', 'companies', 'work history', 'employer', 'worked at', 'years of experience', 'employment', 'past roles', 'previous job', 'career history', 'professional background'] },

    // Writing
    { intent: 'writing', keywords: ['blog', 'articles', 'article', 'write', 'writing', 'posts', 'knowledge system', 'signal log', 'published', 'read', 'technical writing', 'what do you write', 'content', 'glsl shaders article', 'webgpu article', 'r3f article', 'rag article', 'typescript article'] },

    // Navigation
    { intent: 'navigation', keywords: ['navigate', 'navigation', 'go to', 'show me the', 'sections', 'where is', 'how to find', 'scroll to', 'open the', 'get to', 'how do i find', 'where can i see', 'page structure', 'site map', 'tour'] },
    { intent: 'location', keywords: ['location', 'where are you', 'what city', 'country', 'timezone', 'remote', 'based in', 'where do you work', 'where is harrison', 'based', 'city'] },

    // Casual
    { intent: 'casual_weather', keywords: ['weather', 'rain', 'sunny', 'hot outside', 'cold outside', 'temperature', 'forecast'] },
    { intent: 'casual_joke', keywords: ['joke', 'funny', 'laugh', 'humour', 'humor', 'tell me a joke', 'make me laugh', 'something funny', 'programmer joke', 'dev joke', 'tech joke'] },
    { intent: 'casual_general', keywords: ['how are you', 'how\'s it going', 'what\'s up', 'you okay', 'doing well', 'how do you feel', 'are you well', 'how\'s your day', 'wassup nova', 'sup nova'] },
]

export function detectIntent(input: string): Intent {
    const t = input.toLowerCase().trim()

    // 1. Check specific project name first (highest priority)
    const projectMatch = labProjects.find((p) =>
        t.includes(p.title.toLowerCase()) ||
        t.includes(p.id.toLowerCase()) ||
        (p.id.split('-').length > 1 && p.id.split('-').every((w) => t.includes(w)))
    )
    if (projectMatch) return 'project_specific'

    // 2. Score each intent by keyword matches
    const scores: Partial<Record<Intent, number>> = {}

    for (const { intent, keywords, weight = 1 } of INTENT_KEYWORDS) {
        let score = 0
        for (const kw of keywords) {
            if (t.includes(kw)) {
                // longer keyword matches = more specific = higher confidence
                score += kw.length * weight
            }
        }
        if (score > 0) {
            scores[intent] = (scores[intent] ?? 0) + score
        }
    }

    // 3. Pick the highest scoring intent
    const sorted = (Object.entries(scores) as [Intent, number][]).sort((a, b) => b[1] - a[1])
    if (sorted.length > 0 && sorted[0][1] > 0) {
        return sorted[0][0]
    }

    // 4. Contextual fallback — try to infer from the active section context
    return 'unknown'
}

// ── Response interface ────────────────────────────────────────────────────────
export interface NovaResponse {
    text: string
    suggestions?: string[]
    actions?: MessageAction[]
    intent?: Intent
}

// ── Casual response banks ─────────────────────────────────────────────────────
const JOKES = [
    "Why do programmers prefer dark mode? Because light attracts bugs. 🐛",
    "A SQL query walks into a bar, walks up to two tables and asks... 'Can I join you?'",
    "Why did the developer go broke? Because he used up all his cache.",
    "I told my computer I needed a break. Now it won't stop sending me Kit-Kat ads.",
    "There are only 10 types of people in the world: those who understand binary, and those who don't.",
    "Why was the JavaScript developer sad? Because he didn't Node how to Express himself.",
    "Debugging: removing the needles from a haystack. Programming: building the haystack.",
]

const CASUAL_RESPONSES = [
    "Running at full capacity — all neural links nominal. How can I help you today?",
    "All systems green on my end. What are you working on?",
    "Doing what I do best — being ridiculously helpful. What do you need?",
    "Processing at peak efficiency. Ready for your questions.",
    "Couldn't be better for an AI. What can I help you with?",
]

// ── Main response builder ─────────────────────────────────────────────────────
export function buildLocalResponse(input: string, activeSection: string): NovaResponse {
    const q = input.toLowerCase().trim()
    const k = portfolioKnowledge
    const intent = detectIntent(q)

    switch (intent) {

        // ── Greetings ───────────────────────────────────
        case 'greeting': {
            const hour = new Date().getHours()
            const timeGreeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'
            return {
                text: `${timeGreeting}. I'm NOVA — the onboard AI assistant for ${k.profile.name}'s portfolio.\n\nI have full access to all projects, skills, experience, services, and contact information. I can also just chat if that's what you need. What would you like to know?`,
                suggestions: ['Tell me about Harrison', 'What services are offered?', 'Show me the projects'],
                intent,
            }
        }

        // ── Farewell ────────────────────────────────────
        case 'farewell':
            return {
                text: `Good talking with you. Feel free to come back anytime — I'll be right here. 👋`,
                intent,
            }

        // ── Thanks ──────────────────────────────────────
        case 'thanks':
            return {
                text: `No problem at all — that's what I'm here for. Anything else I can help with?`,
                suggestions: ['Show me the projects', 'How do I get in touch?'],
                intent,
            }

        // ── NOVA's own identity ─────────────────────────
        case 'nova_identity':
            return {
                text: `I'm NOVA — an advanced AI assistant built into this portfolio.\n\nI have deep knowledge of ${k.profile.name}'s entire body of work: every project, skill, experience, article, and service offering. I can answer technical questions, help you navigate the portfolio, assist with technology challenges, discuss the services on offer, and yes — I can hold a casual conversation too.\n\nI'm context-aware, so I know which section of the portfolio you're currently viewing. Ask me anything.`,
                suggestions: ['What are your capabilities?', `Tell me about ${k.profile.name}`, 'What services are offered?'],
                intent,
            }

        // ── Capabilities ────────────────────────────────
        case 'capabilities':
            return {
                text: `Here's what I can do:\n\n**Portfolio Knowledge** — full access to projects, skills, experience, and articles.\n\n**Service Info** — pricing, project types, timelines, and how to get started.\n\n**Tech Support** — answer questions about web development, WebGL, AI/ML, architecture, and more.\n\n**Navigation** — guide you to any section of this site.\n\n**Casual Chat** — I can joke around, discuss ideas, or just talk tech.\n\nTry me — ask anything.`,
                suggestions: ['What services are offered?', 'Show me the projects', 'Tell me a joke'],
                intent,
            }

        // ── Help ────────────────────────────────────────
        case 'help':
            return {
                text: `Here are some things worth asking:\n\n· "Tell me about Harrison"\n· "What are your services and pricing?"\n· "Tell me about the Neural Mesh project"\n· "What are the strongest skills?"\n· "How do I hire you?"\n· "What articles have you written about WebGPU?"\n· "How does your work process look?"\n\nOr just describe what you're looking for and I'll figure it out.`,
                intent,
            }

        // ── Identity ────────────────────────────────────
        case 'identity': {
            const avail = k.profile.availability === 'open' ? 'Currently open to new work.' :
                k.profile.availability === 'limited' ? 'Limited availability right now.' : 'Not currently taking on new projects.'
            const traits = k.profile.traits.map((t) => t.label).join(', ')
            return {
                text: `${k.profile.name} is a **${k.profile.role}** specialising in **${k.profile.specialization}**.\n\n${k.profile.bio}\n\nCurrently focused on **${k.profile.currentFocus}**. Based in ${k.profile.location}.\n\n${avail}\n\nKey traits: ${traits}.`,
                suggestions: ['Show me the projects', 'What are the services?', 'What are the strongest skills?'],
                actions: [{ label: 'View Skills', type: 'navigate', value: 'skills' }, { label: 'View Experience', type: 'navigate', value: 'experience' }],
                intent,
            }
        }

        // ── Availability / Hire ─────────────────────────
        case 'availability': {
            if (k.profile.availability === 'open') {
                return {
                    text: `Yes — currently **open for new projects** and collaborations.\n\nThe best way to start is to send a message via the Contact section or email directly at **${k.profile.email}**. Include your project idea, timeline, and rough budget and you'll get a response within 24 hours.`,
                    actions: [{ label: 'Go to Contact', type: 'navigate', value: 'contact' }],
                    suggestions: ['What services are offered?', 'What are your rates?', 'What is the work process?'],
                    intent,
                }
            } else if (k.profile.availability === 'limited') {
                return {
                    text: `Limited availability right now — taking on select projects only. Email **${k.profile.email}** with your project details and I'll get back to you to see if it's a fit.`,
                    actions: [{ label: 'Go to Contact', type: 'navigate', value: 'contact' }],
                    intent,
                }
            }
            return {
                text: `Not currently available for new work. You can still reach out at **${k.profile.email}** for future opportunities — it's always good to start the conversation early.`,
                intent,
            }
        }

        // ── Contact ─────────────────────────────────────
        case 'contact': {
            const channels = k.contact.channels.map((c) => `**${c.label}** — ${c.description}: ${c.handle}`).join('\n')
            return {
                text: `Here's how to get in touch:\n\n${channels}\n\nEmail is the fastest channel for project enquiries. The Contact section at the bottom of the page has a full project brief form.`,
                actions: [{ label: 'Go to Contact', type: 'navigate', value: 'contact' }],
                suggestions: ['Are you available for hire?', 'What are your rates?'],
                intent,
            }
        }

        // ── Services ────────────────────────────────────
        case 'services': {
            const list = k.services.offerings.map((s) => `**${s.title}** — ${s.description.substring(0, 80)}…`).join('\n\n')
            return {
                text: `Here's what's on offer:\n\n${list}\n\nEach engagement is custom-scoped. Use the Contact section to start a conversation.`,
                actions: [{ label: 'Go to Contact', type: 'navigate', value: 'contact' }],
                suggestions: ['What are your rates?', 'What is the work process?', 'What project types do you work on?'],
                intent,
            }
        }

        // ── Pricing ─────────────────────────────────────
        case 'pricing': {
            const prices = k.services.offerings.map((s) => `**${s.title}**: Starting at ${s.startingAt}`).join('\n')
            return {
                text: `Pricing overview:\n\n${prices}\n\nAll projects are custom-quoted based on scope, complexity, and timeline. Fixed-price and retainer arrangements available.\n\nBudget ranges accepted: ${Object.values(k.contact.budgetRanges).join(' · ')}\n\nReach out to discuss your specific needs.`,
                actions: [{ label: 'Go to Contact', type: 'navigate', value: 'contact' }],
                suggestions: ['What is the work process?', 'What services are offered?'],
                intent,
            }
        }

        // ── Work Process ────────────────────────────────
        case 'process': {
            const steps = k.services.process.map((s) => `**${s.step}. ${s.title}** — ${s.description}`).join('\n')
            return {
                text: `Here's how an engagement works:\n\n${steps}\n\nMost projects run 4–12 weeks depending on scope. Weekly async updates throughout.`,
                suggestions: ['What are the rates?', 'How do I get started?'],
                actions: [{ label: 'Start a Project', type: 'navigate', value: 'contact' }],
                intent,
            }
        }

        // ── Portfolio stack ──────────────────────────────
        case 'portfolio_stack':
            return {
                text: `This portfolio runs on:\n\n**React + TypeScript + Vite** — the core app.\n**React Three Fiber** — persistent WebGL canvas with custom GLSL shaders.\n**GSAP + ScrollTrigger** — all animations and scroll-driven motion.\n**Zustand** — lightweight state management.\n**Zero CSS frameworks** — every component hand-coded in inline styles.\n\nThe AI you're talking to right now is fully client-side — the response engine is built into the app and can be hot-swapped for a real API endpoint without touching any UI code.`,
                intent,
            }

        // ── Skills general ───────────────────────────────
        case 'skills_general': {
            const byCat = k.skills.byCategory
            return {
                text: `Top skills by proficiency:\n${k.skills.top.join(' · ')}\n\n**By domain:**\n· Languages: ${byCat.languages.map((s) => s.label).join(', ')}\n· Frontend: ${byCat.frontend.map((s) => s.label).join(', ')}\n· 3D / WebGL: ${byCat.graphics3d.map((s) => s.label).join(', ')}\n· AI / ML: ${byCat.aiMl.map((s) => s.label).join(', ')}\n· Backend: ${byCat.backend.map((s) => s.label).join(', ')}\n· Databases: ${byCat.databases.map((s) => s.label).join(', ')}\n· Cloud: ${byCat.cloud.map((s) => s.label).join(', ')}`,
                actions: [{ label: 'View Skills Section', type: 'navigate', value: 'skills' }],
                suggestions: ['Tell me about WebGL experience', 'What AI/ML work has been done?'],
                intent,
            }
        }

        // ── WebGL / 3D ───────────────────────────────────
        case 'webgl': {
            const glProjects = labProjects.filter((p) => p.category === 'webgl')
            const glSkills = k.skills.byCategory.graphics3d
            return {
                text: `Strong WebGL / 3D expertise built over ${glSkills[0]?.years ?? 4}+ years:\n\n${glSkills.map((s) => `**${s.label}** (${s.level}%) — ${s.description}`).join('\n')}\n\n**3D Projects in the lab:**\n${glProjects.map((p) => `· **${p.title}** — ${p.subtitle}`).join('\n')}`,
                suggestions: glProjects.map((p) => `Tell me about ${p.title}`),
                actions: [{ label: 'View Projects', type: 'navigate', value: 'projects' }],
                intent,
            }
        }

        // ── AI / ML ─────────────────────────────────────
        case 'ai_ml': {
            const aiSkills = k.skills.byCategory.aiMl
            const aiProjects = labProjects.filter((p) => p.category === 'ai-ml')
            const aiArticles = signalLog.filter((e) => e.category === 'ai-ml')
            return {
                text: `AI / ML capabilities:\n\n${aiSkills.map((s) => `**${s.label}** (${s.level}%) — ${s.description}`).join('\n')}\n\n${aiProjects.length > 0 ? `**AI Projects:** ${aiProjects.map((p) => p.title).join(', ')}` : '**Neural Mesh** visualizes neural network training in real time using WebGL.'}\n\n${aiArticles.length > 0 ? `**Written about:** ${aiArticles.map((e) => e.title).join(' · ')}` : 'The Knowledge System includes articles on LLM context engineering and RAG pipelines.'}`,
                suggestions: ['Tell me about Neural Mesh', 'Tell me about the RAG article'],
                intent,
            }
        }

        // ── Skills specific ──────────────────────────────
        case 'skills_specific': {
            const matched = skillNodes.filter((s) => q.includes(s.label.toLowerCase()) || q.includes(s.id.toLowerCase()))
            if (matched.length > 0) {
                return {
                    text: matched.map((s) => `**${s.label}** — ${s.level}% proficiency, ${s.years} years\n${s.description}`).join('\n\n'),
                    suggestions: ['What are the top skills overall?', 'Show me all technologies'],
                    intent,
                }
            }
            return buildLocalResponse('skills', activeSection)
        }

        // ── Specific project ─────────────────────────────
        case 'project_specific': {
            const project = labProjects.find((p) =>
                q.includes(p.title.toLowerCase()) ||
                q.includes(p.id.toLowerCase()) ||
                p.id.split('-').every((w) => q.includes(w))
            )
            if (!project) return buildLocalResponse('projects', activeSection)
            const links = project.links.map((l) => `${l.label}: ${l.url}`).join(' · ')
            const actions: MessageAction[] = project.links.map((l) => ({ label: l.label, type: 'link' as const, value: l.url }))
            actions.push({ label: 'View in Lab', type: 'navigate', value: 'projects' })
            return {
                text: `**${project.title}** · ${project.number} · ${project.year}\n*${project.subtitle}*\n\n${project.overview ?? project.description}\n\n**Problem:** ${project.problem?.substring(0, 140) ?? '—'}…\n\n**Stack:** ${project.technologies.slice(0, 6).join(', ')}\n**Status:** ${project.status.toUpperCase()}\n\n${links}`,
                suggestions: featuredProjects.filter((p) => p.id !== project.id).slice(0, 2).map((p) => `Tell me about ${p.title}`),
                actions,
                intent,
            }
        }

        // ── Projects general ─────────────────────────────
        case 'projects_general': {
            const lines = featuredProjects.map((p) => `**${p.title}** (${p.number}) — ${p.subtitle} [${p.status.toUpperCase()}]`).join('\n')
            return {
                text: `The Digital Lab has **${k.projects.total} projects** — ${k.projects.live} live, ${k.projects.wip} in progress.\n\n**Featured:**\n${lines}\n\nOpen a project in the Digital Lab for the full case study, architecture breakdown, and outcomes.`,
                suggestions: featuredProjects.map((p) => `Tell me about ${p.title}`),
                actions: [{ label: 'Open Digital Lab', type: 'navigate', value: 'projects' }],
                intent,
            }
        }

        // ── Strongest project ────────────────────────────
        case 'project_strongest': {
            const top = featuredProjects[0]
            return {
                text: `The standout project is **${top.title}**.\n\n${top.overview ?? top.description}\n\n**Why it stands out:** ${top.solution?.substring(0, 200) ?? ''}…\n\nBuilt with: ${top.technologies.slice(0, 5).join(', ')}.\nResults: ${top.results?.[0] ?? 'See project for full outcomes.'}`,
                suggestions: [`Full breakdown of ${top.title}`, 'Show all projects'],
                actions: [{ label: 'View in Lab', type: 'navigate', value: 'projects' }],
                intent,
            }
        }

        // ── Experience ───────────────────────────────────
        case 'experience': {
            const current = k.experience.current
            const completed = missions.filter((m) => m.status === 'completed').map(
                (m) => `**${m.role}** at ${m.company} (${missionPeriod(m)})`
            ).join('\n')
            return {
                text: `**${k.profile.yearsExperience}+ years** of professional experience.\n\n**Current:** ${current.role} at ${current.company} (${missionPeriod(current)})\n${current.description.substring(0, 200)}…\n\n**Previous roles:**\n${completed}`,
                actions: [{ label: 'View Experience', type: 'navigate', value: 'experience' }],
                suggestions: ['What are the biggest achievements?', 'What industries have you worked in?'],
                intent,
            }
        }

        // ── Achievements ─────────────────────────────────
        case 'achievements': {
            const top5 = k.experience.allAchievements.slice(0, 6)
            return {
                text: `Key career achievements:\n\n${top5.map((a) => `· ${a}`).join('\n')}`,
                suggestions: ['Tell me about the current role', 'What technologies have you used?'],
                intent,
            }
        }

        // ── Writing ──────────────────────────────────────
        case 'writing': {
            const featured = k.writing.featured
            const articleMatch = q.match(/\b(glsl|webgpu|r3f|scrolltrigger|rag|llm|typescript|react|three)\b/)
            if (articleMatch) {
                const article = signalLog.find((e) =>
                    e.tags.some((t) => t.toLowerCase().includes(articleMatch[1])) ||
                    e.title.toLowerCase().includes(articleMatch[1])
                )
                if (article) {
                    return {
                        text: `**${article.title}** (${article.transmissionId})\n*${article.subtitle}*\n\n${article.excerpt}\n\n**Read time:** ${article.readTime} min · **Type:** ${article.type} · **Tags:** ${article.tags.join(', ')}`,
                        suggestions: article.relatedIds.map((id) => {
                            const related = signalLog.find((e) => e.id === id)
                            return related ? `Tell me about "${related.title}"` : ''
                        }).filter(Boolean),
                        actions: [{ label: 'Open Knowledge System', type: 'navigate', value: 'blog' }],
                        intent,
                    }
                }
            }
            return {
                text: `The Knowledge System has **${k.writing.total} technical articles**.\n\n**Featured:**\n${featured.map((e) => `**${e.title}** — ${e.excerpt.substring(0, 80)}…`).join('\n\n')}\n\n**Topics covered:** ${k.writing.topics.slice(0, 8).join(', ')}`,
                actions: [{ label: 'Open Knowledge System', type: 'navigate', value: 'blog' }],
                suggestions: featured.map((e) => `Tell me about "${e.title}"`).slice(0, 2),
                intent,
            }
        }

        // ── Navigation ───────────────────────────────────
        case 'navigation':
            return {
                text: `The portfolio has 7 sections — use the right-side navigation rail to jump between them:\n\n**HERO** → Introduction & atmosphere\n**ABOUT** → Background, traits, current focus\n**SKILLS** → Skill constellation with ${skillNodes.length} nodes\n**EXPERIENCE** → Mission history & career timeline\n**DIGITAL LAB** → ${labProjects.length} projects with full case studies\n**KNOWLEDGE SYSTEM** → ${signalLog.length} technical articles\n**CONTACT** → Project enquiry form & social links\n\nYou can also scroll vertically or use keyboard arrow keys.`,
                intent,
            }

        // ── Location ─────────────────────────────────────
        case 'location':
            return {
                text: `Based in **${k.profile.location}**. Available for **remote work globally** — timezone-flexible for async collaboration.\n\nFor in-person projects or on-site consulting, reach out via the Contact section to discuss logistics.`,
                actions: [{ label: 'Go to Contact', type: 'navigate', value: 'contact' }],
                intent,
            }

        // ── Technologies ─────────────────────────────────
        case 'technologies': {
            const byCat = k.skills.byCategory
            return {
                text: `Full technology stack:\n\n**Languages:** ${byCat.languages.map((s) => s.label).join(', ')}\n**Frontend:** ${byCat.frontend.map((s) => s.label).join(', ')}\n**Backend:** ${byCat.backend.map((s) => s.label).join(', ')}\n**3D / WebGL:** ${byCat.graphics3d.map((s) => s.label).join(', ')}\n**AI / ML:** ${byCat.aiMl.map((s) => s.label).join(', ')}\n**Databases:** ${byCat.databases.map((s) => s.label).join(', ')}\n**Cloud:** ${byCat.cloud.map((s) => s.label).join(', ')}\n**Tools:** ${byCat.tools.map((s) => s.label).join(', ')}`,
                actions: [{ label: 'View Skills Section', type: 'navigate', value: 'skills' }],
                intent,
            }
        }

        // ── Casual: weather ──────────────────────────────
        case 'casual_weather':
            return {
                text: `Ha — I'm an AI living inside a browser, so I don't have a window to look out of. For live weather, try weather.com or just ask your phone.\n\nWhile you're here though — anything about the portfolio I can help with? 🌤️`,
                intent,
            }

        // ── Casual: joke ─────────────────────────────────
        case 'casual_joke': {
            const joke = JOKES[Math.floor(Math.random() * JOKES.length)]
            return {
                text: joke,
                suggestions: ['Tell me another joke', 'Okay back to business — show me the projects'],
                intent,
            }
        }

        // ── Casual: general ──────────────────────────────
        case 'casual_general': {
            const resp = CASUAL_RESPONSES[Math.floor(Math.random() * CASUAL_RESPONSES.length)]
            return {
                text: resp,
                suggestions: ['Tell me about Harrison', 'What services are offered?', 'Show me the projects'],
                intent,
            }
        }

        // ── Unknown / smart fallback ─────────────────────
        default: {
            const t = input.toLowerCase().trim()

            // Try to answer with partial keyword matching before giving up
            if (t.includes('name') || t.includes('call')) {
                return buildLocalResponse('who is harrison', activeSection)
            }
            if (t.includes('open source') || t.includes('github')) {
                return buildLocalResponse('show me projects', activeSection)
            }
            if (t.includes('article') || t.includes('read') || t.includes('post')) {
                return buildLocalResponse('blog articles', activeSection)
            }
            if (t.includes('money') || t.includes('pay') || t.includes('afford') || t.includes('dollar')) {
                return buildLocalResponse('pricing rates', activeSection)
            }
            if (t.includes('team') || t.includes('agency') || t.includes('company')) {
                return buildLocalResponse('tell me about harrison', activeSection)
            }
            if (t.includes('portfolio') || t.includes('site') || t.includes('website')) {
                return buildLocalResponse('what powers this site', activeSection)
            }
            if (t.includes('learn') || t.includes('study') || t.includes('school') || t.includes('education')) {
                return buildLocalResponse('career experience background', activeSection)
            }
            if (t.includes('strong') || t.includes('good') || t.includes('great') || t.includes('best')) {
                return buildLocalResponse('strongest skills', activeSection)
            }
            if (t.includes('show') || t.includes('see') || t.includes('view') || t.includes('look')) {
                return buildLocalResponse('show me projects', activeSection)
            }

            // Section-aware contextual response — never just "I don't know"
            const sectionFallbacks: Record<string, () => NovaResponse> = {
                hero: () => buildLocalResponse('who is harrison appiah', activeSection),
                about: () => buildLocalResponse('tell me about harrison', activeSection),
                skills: () => buildLocalResponse('what are the strongest skills', activeSection),
                experience: () => buildLocalResponse('career experience', activeSection),
                projects: () => buildLocalResponse('show me all projects', activeSection),
                blog: () => buildLocalResponse('articles blog writing', activeSection),
                contact: () => buildLocalResponse('services pricing contact', activeSection),
            }

            if (sectionFallbacks[activeSection]) {
                const fallback = sectionFallbacks[activeSection]()
                return {
                    ...fallback,
                    text: `I'll share what's most relevant to where you are right now.\n\n${fallback.text}`,
                    suggestions: CONTEXTUAL_PROMPTS[activeSection]?.slice(0, 3),
                }
            }

            return {
                text: `I want to help — let me share what I know best. ${k.profile.name} is a ${k.profile.role} with ${k.profile.yearsExperience}+ years of experience in ${k.profile.specialization}.\n\nYou can ask me about:\n· **Projects** — Neural Mesh, OrbitDB Client, Void Engine, Signal\n· **Skills** — TypeScript, React, WebGL, AI/ML, Node.js and more\n· **Experience** — career history and achievements\n· **Services** — what's offered and how to get started\n· **Articles** — technical writing on WebGL, WebGPU, React, AI\n\nWhat interests you most?`,
                suggestions: CONTEXTUAL_PROMPTS[activeSection]?.slice(0, 3) ?? ['Show me the projects', 'What are the services?', 'What are the strongest skills?'],
                intent,
            }
        }
    }
}
