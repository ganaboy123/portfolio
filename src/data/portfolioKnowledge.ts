// ─────────────────────────────────────────────────────────────────────────────
//  NOVA KNOWLEDGE LAYER
//  Single source of truth for the AI assistant's understanding of the portfolio.
//  ─ Pull from the same data sources as UI components — no duplication.
//  ─ Expose structured facts + a flat FAQ the response engine queries.
//  ─ Swap `buildLocalResponse` for an API call without changing this file.
// ─────────────────────────────────────────────────────────────────────────────

import { personalInfo, profile, skillNodes } from './content'
import { labProjects } from './projects'
import { signalLog } from './signal-log'
import { missions, missionDurationMonths } from './experiences'

// ── Derived facts ─────────────────────────────────────────────────────────────

const totalExperienceYears = (() => {
    const earliest = new Date(Math.min(...missions.map((m) => new Date(m.startDate).getTime())))
    return Math.floor((Date.now() - earliest.getTime()) / (1000 * 60 * 60 * 24 * 365))
})()

const topSkills = [...skillNodes]
    .sort((a, b) => b.level - a.level)
    .slice(0, 6)
    .map((s) => `${s.label} (${s.level}%)`)

const liveProjects = labProjects.filter((p) => p.status === 'live')
const wipProjects = labProjects.filter((p) => p.status === 'wip')
const featuredProjects = labProjects.filter((p) => p.featured)

// ── Structured knowledge ──────────────────────────────────────────────────────

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
    },

    skills: {
        top: topSkills,
        all: skillNodes.map((s) => ({
            id: s.id,
            label: s.label,
            category: s.category,
            level: s.level,
            years: s.years,
            description: s.description,
        })),
        byCategory: {
            languages: skillNodes.filter((s) => s.category === 'language').map((s) => s.label),
            frontend: skillNodes.filter((s) => s.category === 'frontend').map((s) => s.label),
            backend: skillNodes.filter((s) => s.category === 'backend').map((s) => s.label),
            graphics3d: skillNodes.filter((s) => s.category === '3d-webgl').map((s) => s.label),
            aiMl: skillNodes.filter((s) => s.category === 'ai-ml').map((s) => s.label),
            databases: skillNodes.filter((s) => s.category === 'database').map((s) => s.label),
            cloud: skillNodes.filter((s) => s.category === 'cloud').map((s) => s.label),
            tools: skillNodes.filter((s) => s.category === 'tools').map((s) => s.label),
        },
    },

    projects: {
        total: labProjects.length,
        live: liveProjects.length,
        wip: wipProjects.length,
        featured: featuredProjects,
        all: labProjects,
        byCategory: (cat: string) => labProjects.filter((p) => p.category === cat),
        byId: (id: string) => labProjects.find((p) => p.id === id || p.title.toLowerCase().includes(id.toLowerCase())),
    },

    experience: {
        total: totalExperienceYears,
        missions,
        current: missions.find((m) => m.status === 'active') ?? missions[0],
        longestRole: [...missions].sort((a, b) => missionDurationMonths(b) - missionDurationMonths(a))[0],
    },

    writing: {
        total: signalLog.length,
        featured: signalLog.filter((e) => e.featured),
        all: signalLog,
        topics: [...new Set(signalLog.flatMap((e) => e.tags))].slice(0, 10),
    },

    contact: {
        email: personalInfo.email,
        availability: profile.availability,
        social: personalInfo.social,
        preferredMethod: 'email',
    },
}

// ── Section-contextual suggested prompts ──────────────────────────────────────

export const CONTEXTUAL_PROMPTS: Record<string, string[]> = {
    hero: [
        'What technologies power this site?',
        `Who is ${personalInfo.name}?`,
        'What can I explore here?',
    ],
    about: [
        'What is the current availability?',
        'What is the specialization?',
        'Where are they located?',
    ],
    skills: [
        'What are the strongest skills?',
        'Any WebGL experience?',
        'Is there AI/ML experience?',
    ],
    experience: [
        'Describe the most recent role',
        `How many years of experience?`,
        'What industries have been worked in?',
    ],
    projects: [
        'What is the most complex project?',
        'Show the AI/ML projects',
        'Any open source work?',
    ],
    blog: [
        'What topics are covered?',
        'What is the most-read article?',
        'Any WebGPU content?',
    ],
    contact: [
        'How do I get in touch?',
        'What is the email address?',
        'Are you available for hire?',
    ],
}

// ── Local response engine ─────────────────────────────────────────────────────
// Returns a structured response object — swap for an API call in production.

export interface NovaResponse {
    text: string
    /** Optional quick-reply chips to surface after the message */
    suggestions?: string[]
}

export function buildLocalResponse(input: string, activeSection: string): NovaResponse {
    const q = input.toLowerCase().trim()
    const k = portfolioKnowledge

    // ── Greetings ─────────────────────────────────
    if (/^(hi|hello|hey|yo|sup|greetings)[\s!.]*$/.test(q)) {
        return {
            text: `Hello. I'm NOVA, the onboard assistant for ${k.profile.name}'s portfolio. I have full access to the knowledge base — projects, skills, experience, and contact information. What would you like to know?`,
            suggestions: ['Show me all projects', 'What are the top skills?', 'How do I get in touch?'],
        }
    }

    // ── Identity — who is this person ────────────
    if (/\b(who (is|are|built|made)|about (you|this|him|her|them)|tell me about|background)\b/.test(q)) {
        const avail = k.profile.availability === 'open' ? 'Currently open to new work.' : k.profile.availability === 'limited' ? 'Limited availability.' : 'Not currently available.'
        return {
            text: `${k.profile.name} is a ${k.profile.role} specialising in ${k.profile.specialization}. ${k.profile.bio} Currently focused on ${k.profile.currentFocus}. ${avail}`,
            suggestions: ['Show me the projects', 'What skills are strongest?'],
        }
    }

    // ── Availability / hire ───────────────────────
    if (/\b(availab|hire|freelanc|contract|work together|collaborat|open to)\b/.test(q)) {
        if (k.profile.availability === 'open') {
            return { text: `Yes — currently open for new projects and collaborations. Best to reach out directly at ${k.profile.email} or use the Contact section at the bottom of the page.` }
        } else if (k.profile.availability === 'limited') {
            return { text: `Limited availability right now — taking on select projects. Email ${k.profile.email} with details and I'll get back to you.` }
        } else {
            return { text: `Not currently available for new work. You can still reach out at ${k.profile.email} for future opportunities.` }
        }
    }

    // ── Contact ───────────────────────────────────
    if (/\b(contact|email|reach|get in touch|message|dm|social|github|linkedin|twitter)\b/.test(q)) {
        const socials = Object.entries(k.contact.social).map(([k, v]) => `${k}: ${v}`).join(' · ')
        return {
            text: `Email: ${k.contact.email}\n\nSocial: ${socials}\n\nOr scroll to the Contact section for the full form.`,
            suggestions: ['Are you available for hire?'],
        }
    }

    // ── Portfolio stack ───────────────────────────
    if (/\b(stack|tech(nolog)?|built with|portfolio (use|run)|this site|how is this)\b/.test(q)) {
        return {
            text: `This portfolio runs on React + TypeScript + Vite. The 3D environment uses React Three Fiber with custom GLSL shaders on a persistent WebGL canvas. Animation is handled by GSAP with ScrollTrigger. State via Zustand. Zero CSS framework — every component is hand-coded. The AI layer you're talking to right now is fully client-side and swappable with a real API endpoint.`,
        }
    }

    // ── Skills (general) ─────────────────────────
    if (/\b(skill|strongest|best at|proficien|expert|speciali)\b/.test(q)) {
        return {
            text: `Top skills by proficiency: ${k.skills.top.join(', ')}.\n\nFull domains: Languages (${k.skills.byCategory.languages.join(', ')}), Frontend (${k.skills.byCategory.frontend.join(', ')}), 3D/WebGL (${k.skills.byCategory.graphics3d.join(', ')}), AI/ML (${k.skills.byCategory.aiMl.join(', ')}).`,
            suggestions: ['Any Three.js work?', 'What AI/ML experience is there?'],
        }
    }

    // ── WebGL / 3D ────────────────────────────────
    if (/\b(webgl|three\.?js|glsl|shader|3d|r3f|react.?three|canvas|gpu|webgpu)\b/.test(q)) {
        const glProjects = labProjects.filter((p) => p.category === 'webgl')
        const names = glProjects.map((p) => p.title).join(', ')
        return {
            text: `Strong WebGL/3D expertise: Three.js (87%), GLSL shaders (80%), React Three Fiber, and WebGPU (62%). WebGL projects in the lab: ${names}. The Void Engine uses WebGPU compute shaders to generate planetary terrain in real time — no CPU involved.`,
            suggestions: ['Tell me about Void Engine', 'Tell me about Neural Mesh'],
        }
    }

    // ── AI/ML ─────────────────────────────────────
    if (/\b(ai|ml|machine.?learn|llm|gpt|neural|pytorch|model)\b/.test(q)) {
        const aiProjects = labProjects.filter((p) => p.category === 'ai-ml')
        return {
            text: `AI/ML skills: ${k.skills.byCategory.aiMl.join(', ')}. ${aiProjects.length > 0 ? `AI projects: ${aiProjects.map((p) => p.title).join(', ')}.` : 'No dedicated AI/ML projects in the current lab — though Neural Mesh visualizes neural network training in real time.'} Also writes about LLM context engineering and RAG pipelines in the Knowledge System.`,
        }
    }

    // ── Specific project lookup ───────────────────
    const matchedProject = labProjects.find((p) =>
        q.includes(p.title.toLowerCase()) ||
        q.includes(p.id.toLowerCase()) ||
        p.id.split('-').every((w) => q.includes(w))
    )
    if (matchedProject) {
        const links = matchedProject.links.map((l) => `${l.label}: ${l.url}`).join(' · ')
        return {
            text: `**${matchedProject.title}** (${matchedProject.number})\n\n${matchedProject.description}\n\nStack: ${matchedProject.technologies.slice(0, 5).join(', ')}.\nStatus: ${matchedProject.status.toUpperCase()} · ${matchedProject.year}.\n\n${links || 'No external links available yet.'}`,
            suggestions: ['Show all projects', 'What is the strongest project?'],
        }
    }

    // ── Projects (general) ────────────────────────
    if (/\b(project|lab|work|build|system|experiment)\b/.test(q)) {
        const titles = featuredProjects.map((p) => `${p.title} — ${p.subtitle}`).join('\n· ')
        return {
            text: `The Digital Lab has ${k.projects.total} projects: ${k.projects.live} live, ${k.projects.wip} in progress.\n\nFeatured:\n· ${titles}\n\nOpen the Projects section and click any module for the full case study.`,
            suggestions: ['Tell me about Neural Mesh', 'Tell me about Void Engine'],
        }
    }

    // ── Strongest / best project ──────────────────
    if (/\b(strongest|best|impressive|complex|flagship|highlight)\b/.test(q)) {
        const top = featuredProjects[0]
        return {
            text: `The standout project is **${top.title}** — ${top.description} Built with ${top.technologies.slice(0, 4).join(', ')}. Open the Digital Lab to see the full case study.`,
            suggestions: [`Tell me more about ${top.title}`, 'Show all projects'],
        }
    }

    // ── Experience ────────────────────────────────
    if (/\b(experience|career|job|role|compan|history|work(ed)?|employer)\b/.test(q)) {
        const current = k.experience.current
        const prev = missions.filter((m) => m.status === 'completed').map((m) => `${m.role} at ${m.company}`).join(', ')
        return {
            text: `${k.profile.yearsExperience}+ years professional experience.\n\nCurrent: ${current.role} at ${current.company} (${new Date(current.startDate).getFullYear()}–present) — ${current.description.slice(0, 140)}…\n\nPrevious: ${prev}.`,
            suggestions: ['What are the achievements?', 'What technologies have been used?'],
        }
    }

    // ── Achievements ──────────────────────────────
    if (/\b(achiev|accomplish|highlight|result|impact|metric)\b/.test(q)) {
        const allAchievements = missions.flatMap((m) => m.achievements).slice(0, 5)
        return {
            text: `Key achievements across career:\n· ${allAchievements.join('\n· ')}`,
        }
    }

    // ── Writing / blog ────────────────────────────
    if (/\b(blog|write|writ|article|post|signal|knowledge|publish)\b/.test(q)) {
        const featured = k.writing.featured
        return {
            text: `The Knowledge System has ${k.writing.total} technical articles. Featured: "${featured[0]?.title}" and "${featured[1]?.title}". Topics covered: ${k.writing.topics.slice(0, 6).join(', ')}. Open the Knowledge System section to browse the full archive.`,
            suggestions: ['What is the GLSL shaders article about?'],
        }
    }

    // ── Navigation help ───────────────────────────
    if (/\b(navigate|go to|how to|section|where|find|open|scroll)\b/.test(q)) {
        return {
            text: `Use the right-side navigation rail to jump between sections: HERO → ABOUT → SKILLS → EXPERIENCE → DIGITAL LAB → KNOWLEDGE SYSTEM → CONTACT. You can also scroll vertically or use the keyboard arrow keys.`,
        }
    }

    // ── Location ──────────────────────────────────
    if (/\b(locat|where|city|country|timezone|remote|based)\b/.test(q)) {
        return { text: `Based in ${k.profile.location}. Available for remote work globally. The Contact section has the full location details.` }
    }

    // ── Technologies list ─────────────────────────
    if (/\b(technolog|language|framework|tool|what.*(use|work with))\b/.test(q)) {
        return {
            text: `Full technology domains:\n· Languages: ${k.skills.byCategory.languages.join(', ')}\n· Frontend: ${k.skills.byCategory.frontend.join(', ')}\n· Backend: ${k.skills.byCategory.backend.join(', ')}\n· 3D/WebGL: ${k.skills.byCategory.graphics3d.join(', ')}\n· AI/ML: ${k.skills.byCategory.aiMl.join(', ')}\n· Databases: ${k.skills.byCategory.databases.join(', ')}\n· Cloud: ${k.skills.byCategory.cloud.join(', ')}`,
        }
    }

    // ── Unknown / fallback ────────────────────────
    const sectionHints: Record<string, string> = {
        hero: 'Try asking about the portfolio, the tech stack, or who built it.',
        about: 'Try asking about background, location, or current availability.',
        skills: 'Try asking about specific technologies, strongest skills, or WebGL experience.',
        experience: 'Try asking about work history, current role, or career highlights.',
        projects: 'Try asking about a specific project, the Digital Lab, or open source work.',
        blog: 'Try asking about the Knowledge System, writing topics, or a specific article.',
        contact: 'Try asking for the email address, social links, or availability status.',
    }

    const hint = sectionHints[activeSection] ?? 'Ask about projects, skills, experience, writing, or how to get in touch.'
    return {
        text: `I don't have specific information about that. ${hint}`,
        suggestions: CONTEXTUAL_PROMPTS[activeSection]?.slice(0, 2),
    }
}
