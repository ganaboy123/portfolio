// ─────────────────────────────────────────────────────────────────────────────
//  MISSION HISTORY — replace placeholder data with real information
// ─────────────────────────────────────────────────────────────────────────────

export interface Mission {
    id: string
    missionCode: string        // e.g. "MSN-001"
    index: string              // zero-padded "01", "02", etc.
    startDate: string          // ISO date  "2022-03-01"
    endDate: string | null     // null = present
    role: string
    company: string
    division: string           // team / division / department
    location: string
    locationCode: string       // short code e.g. "RMT" / "NYC"
    type: 'full-time' | 'contract' | 'freelance' | 'internship'
    status: 'active' | 'completed'
    description: string
    achievements: string[]
    technologies: string[]
    /** highlight color driving visual accent — cyan or violet */
    accent: 'cyan' | 'violet'
}

export const missions: Mission[] = [
    {
        id: 'msnA',
        missionCode: 'MSN-003',
        index: '01',
        startDate: '2022-03-01',
        endDate: null,
        role: 'Senior Software Engineer',
        company: 'Placeholder Corp',
        division: 'Platform Engineering',
        location: 'Remote',
        locationCode: 'RMT',
        type: 'full-time',
        status: 'active',
        description:
            'Leading development of a high-performance real-time data platform serving millions of daily users. Architected the event-streaming backbone and interactive visualization layer. Introduced WebGL-based dashboards that reduced time-to-insight by 60%.',
        achievements: [
            'Reduced p99 API latency from 840ms to 120ms via query optimisation',
            'Shipped WebGL data viz system used by 2M+ monthly users',
            'Led team of 6 engineers across 3 time zones',
            'Introduced typed event schema registry — zero breaking changes in 18 months',
        ],
        technologies: ['TypeScript', 'React', 'Node.js', 'PostgreSQL', 'Three.js', 'GSAP', 'AWS', 'Docker'],
        accent: 'cyan',
    },
    {
        id: 'msnB',
        missionCode: 'MSN-002',
        index: '02',
        startDate: '2020-06-01',
        endDate: '2022-02-28',
        role: 'Frontend Engineer',
        company: 'Creative Studio XYZ',
        division: 'Interactive Experiences',
        location: 'New York, NY',
        locationCode: 'NYC',
        type: 'full-time',
        status: 'completed',
        description:
            'Built immersive web experiences for Fortune 500 brands using WebGL, custom GLSL shaders, and advanced animation engineering. Delivered campaigns that consistently achieved top-tier industry recognition.',
        achievements: [
            'Delivered 12 award-winning interactive campaigns',
            'Built reusable WebGL framework adopted across all studio projects',
            'Mentored 3 junior engineers into mid-level roles',
            'Cut average build time by 40% via toolchain refactor',
        ],
        technologies: ['Three.js', 'GLSL', 'GSAP', 'React', 'WebGL', 'Webpack', 'Blender'],
        accent: 'violet',
    },
    {
        id: 'msnC',
        missionCode: 'MSN-001',
        index: '03',
        startDate: '2018-09-01',
        endDate: '2020-05-31',
        role: 'Software Developer',
        company: 'Startup ABC',
        division: 'Product',
        location: 'San Francisco, CA',
        locationCode: 'SFO',
        type: 'full-time',
        status: 'completed',
        description:
            'Full-stack product development across web and mobile for a B2C SaaS product. Owned the notification and engagement systems, and contributed to the core data model. Shipped features to 50k+ daily active users.',
        achievements: [
            'Grew DAU by 28% through redesigned onboarding flow',
            'Reduced churn by 15% via in-app engagement system',
            'Migrated legacy REST API to GraphQL — 35% fewer network requests',
        ],
        technologies: ['React', 'Python', 'Django', 'AWS', 'Docker', 'PostgreSQL', 'Redis'],
        accent: 'cyan',
    },
]

/** Derive display date range from mission */
export function missionPeriod(m: Mission): string {
    const fmt = (d: string) => {
        const [y, mo] = d.split('-')
        const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']
        return `${months[parseInt(mo, 10) - 1]} ${y}`
    }
    return m.endDate ? `${fmt(m.startDate)} – ${fmt(m.endDate)}` : `${fmt(m.startDate)} – PRESENT`
}

/** Duration in months */
export function missionDurationMonths(m: Mission): number {
    const start = new Date(m.startDate)
    const end = m.endDate ? new Date(m.endDate) : new Date()
    return (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth())
}
