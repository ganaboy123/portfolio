// ─────────────────────────────────────────────
//  PLACEHOLDER CONTENT  –  replace with real data
// ─────────────────────────────────────────────

export const personalInfo = {
    name: 'Harrison Appiah',
    title: 'Computer Scientist & Software Engineer',
    location: 'Earth, Solar System',
    email: 'hello@harrisonappiah.dev',
    bio: 'I build thoughtful digital systems where software engineering, artificial intelligence, and creative technology meet.',
    avatar: null as string | null,
    social: {
        github: 'https://github.com',
        linkedin: 'https://linkedin.com',
        twitter: 'https://twitter.com',
    },
}

// ── About / Profile data ──────────────────────
export const profile = {
    role: 'Senior Software Engineer',
    specialization: 'Creative Technology / WebGL',
    location: 'Earth, Solar System',
    currentFocus: 'Immersive Web Interfaces',
    availability: 'open' as 'open' | 'limited' | 'unavailable',
    // Displayed statistics
    stats: [
        { id: 'exp', label: 'Years Experience', value: '6+', unit: 'YRS' },
        { id: 'proj', label: 'Projects Shipped', value: '40+', unit: 'PRJ' },
        { id: 'tech', label: 'Technologies', value: '24', unit: 'TEC' },
        { id: 'collab', label: 'Collaborations', value: '18+', unit: 'CLB' },
    ],
    traits: [
        { label: 'Systems Thinker', code: 'ARCH', desc: 'Designs for scale and longevity' },
        { label: 'Creative Engineer', code: 'BUILD', desc: 'Bridges code and visual craft' },
        { label: 'Detail Oriented', code: 'CRAFT', desc: 'Quality at every abstraction' },
        { label: 'Open Source Native', code: 'OPEN', desc: 'Ships with the community' },
    ],
}

export const skills = [
    { id: 'ts', label: 'TypeScript', category: 'language', level: 95 },
    { id: 'react', label: 'React', category: 'frontend', level: 92 },
    { id: 'threejs', label: 'Three.js / WebGL', category: 'graphics', level: 85 },
    { id: 'node', label: 'Node.js', category: 'backend', level: 88 },
    { id: 'rust', label: 'Rust', category: 'language', level: 70 },
    { id: 'glsl', label: 'GLSL Shaders', category: 'graphics', level: 78 },
    { id: 'postgres', label: 'PostgreSQL', category: 'data', level: 82 },
    { id: 'docker', label: 'Docker / K8s', category: 'devops', level: 76 },
    { id: 'gsap', label: 'GSAP / Animation', category: 'frontend', level: 88 },
    { id: 'aws', label: 'AWS / Cloud', category: 'devops', level: 80 },
]

// ── Skill Constellation — rich node data ──────────
export type SkillCategory =
    | 'language' | 'frontend' | 'backend'
    | 'ai-ml' | 'database' | 'cloud'
    | '3d-webgl' | 'tools'

export interface SkillNode {
    id: string
    label: string
    category: SkillCategory
    level: number          // 0–100 proficiency
    years: number          // years used
    description: string
    connections: string[]  // ids of related nodes
}

export const skillNodes: SkillNode[] = [
    // ── Languages ─────────────────────────────────
    {
        id: 'typescript', label: 'TypeScript', category: 'language', level: 95, years: 5,
        description: 'Primary language. Type-safe application architecture at scale.',
        connections: ['react', 'node', 'rust', 'threejs'],
    },
    {
        id: 'python', label: 'Python', category: 'language', level: 82, years: 6,
        description: 'Data pipelines, ML tooling, scripting, and backend services.',
        connections: ['pytorch', 'postgres', 'docker'],
    },
    {
        id: 'rust', label: 'Rust', category: 'language', level: 68, years: 2,
        description: 'Systems programming, WASM compilation, performance-critical modules.',
        connections: ['typescript', 'docker'],
    },
    {
        id: 'glsl', label: 'GLSL', category: 'language', level: 80, years: 3,
        description: 'Custom vertex and fragment shaders. Domain-warped noise, post-processing.',
        connections: ['threejs', 'webgpu'],
    },
    // ── Frontend ──────────────────────────────────
    {
        id: 'react', label: 'React', category: 'frontend', level: 94, years: 6,
        description: 'Component architecture, concurrent features, server components.',
        connections: ['typescript', 'threejs', 'gsap', 'node'],
    },
    {
        id: 'gsap', label: 'GSAP', category: 'frontend', level: 90, years: 4,
        description: 'Professional animation toolkit. Timeline, ScrollTrigger, morphing.',
        connections: ['react', 'threejs'],
    },
    {
        id: 'css', label: 'CSS / Tailwind', category: 'frontend', level: 88, years: 7,
        description: 'Advanced layout, custom properties, animation, responsive design.',
        connections: ['react', 'gsap'],
    },
    // ── Backend ───────────────────────────────────
    {
        id: 'node', label: 'Node.js', category: 'backend', level: 88, years: 6,
        description: 'REST & GraphQL APIs, real-time systems, streaming, microservices.',
        connections: ['typescript', 'postgres', 'redis', 'docker'],
    },
    {
        id: 'redis', label: 'Redis', category: 'backend', level: 75, years: 3,
        description: 'Caching layer, pub/sub messaging, session management.',
        connections: ['node', 'postgres'],
    },
    // ── AI / ML ───────────────────────────────────
    {
        id: 'pytorch', label: 'PyTorch', category: 'ai-ml', level: 70, years: 2,
        description: 'Model training, fine-tuning, inference pipelines.',
        connections: ['python', 'postgres'],
    },
    {
        id: 'llm-apis', label: 'LLM APIs', category: 'ai-ml', level: 85, years: 2,
        description: 'OpenAI, Anthropic, HuggingFace integrations. RAG pipelines.',
        connections: ['node', 'python', 'postgres'],
    },
    // ── Databases ─────────────────────────────────
    {
        id: 'postgres', label: 'PostgreSQL', category: 'database', level: 84, years: 5,
        description: 'Complex queries, indexing strategies, migrations, pg extensions.',
        connections: ['node', 'python', 'redis', 'docker'],
    },
    {
        id: 'mongodb', label: 'MongoDB', category: 'database', level: 72, years: 3,
        description: 'Document modeling, aggregation pipelines, Atlas search.',
        connections: ['node', 'docker'],
    },
    // ── Cloud ─────────────────────────────────────
    {
        id: 'aws', label: 'AWS', category: 'cloud', level: 80, years: 4,
        description: 'EC2, Lambda, S3, RDS, CloudFront, CDK infrastructure as code.',
        connections: ['docker', 'node', 'postgres'],
    },
    {
        id: 'docker', label: 'Docker / K8s', category: 'cloud', level: 78, years: 4,
        description: 'Containerization, orchestration, CI/CD pipeline integration.',
        connections: ['node', 'postgres', 'aws', 'rust'],
    },
    // ── 3D / WebGL ────────────────────────────────
    {
        id: 'threejs', label: 'Three.js', category: '3d-webgl', level: 87, years: 4,
        description: 'Scene graphs, custom geometries, PBR materials, post-processing.',
        connections: ['glsl', 'react', 'gsap', 'webgpu'],
    },
    {
        id: 'webgpu', label: 'WebGPU', category: '3d-webgl', level: 62, years: 1,
        description: 'Compute shaders, modern GPU pipeline access in the browser.',
        connections: ['glsl', 'threejs', 'rust'],
    },
    // ── Tools ─────────────────────────────────────
    {
        id: 'git', label: 'Git / GitHub', category: 'tools', level: 92, years: 8,
        description: 'Branching strategies, code review, CI/CD, GitHub Actions.',
        connections: ['docker', 'aws'],
    },
    {
        id: 'figma', label: 'Figma', category: 'tools', level: 78, years: 3,
        description: 'UI design, prototyping, design system maintenance.',
        connections: ['react', 'css'],
    },
]

export const experience = [
    {
        id: 'exp-1',
        role: 'Senior Software Engineer',
        company: 'Placeholder Corp',
        period: '2022 – Present',
        location: 'Remote',
        summary: 'Led development of high-performance web applications serving millions of users. Architected real-time data pipelines and interactive visualization systems.',
        tags: ['TypeScript', 'React', 'Node.js', 'PostgreSQL'],
    },
    {
        id: 'exp-2',
        role: 'Frontend Engineer',
        company: 'Creative Studio XYZ',
        period: '2020 – 2022',
        location: 'New York, NY',
        summary: 'Built immersive web experiences for global brands using Three.js, WebGL, and advanced CSS techniques. Delivered award-winning interactive campaigns.',
        tags: ['Three.js', 'GSAP', 'React', 'WebGL'],
    },
    {
        id: 'exp-3',
        role: 'Software Developer',
        company: 'Startup ABC',
        period: '2018 – 2020',
        location: 'San Francisco, CA',
        summary: 'Full-stack development across web and mobile products. Shipped features used by 50k+ daily active users.',
        tags: ['React', 'Python', 'AWS', 'Docker'],
    },
]

export const projects = [
    {
        id: 'neural-mesh',
        title: 'Neural Mesh',
        subtitle: 'Real-time neural network visualizer',
        description: 'An interactive WebGL visualization of neural network training in real time. Watch weights update, activations fire, and loss curves evolve — all rendered as a living 3D graph.',
        tags: ['Three.js', 'WebGL', 'GLSL', 'React'],
        status: 'live' as const,
        year: 2024,
        featured: true,
    },
    {
        id: 'orbit-db',
        title: 'OrbitDB Client',
        subtitle: 'Distributed database interface',
        description: 'A sleek GUI for OrbitDB built with React and Electron. Supports real-time sync visualization across peers with a graph-based data explorer.',
        tags: ['React', 'Electron', 'TypeScript', 'P2P'],
        status: 'live' as const,
        year: 2024,
        featured: true,
    },
    {
        id: 'void-engine',
        title: 'Void Engine',
        subtitle: 'Procedural world generator',
        description: 'A browser-based procedural terrain and atmosphere generator using compute shaders via WebGPU. Generates alien planets in real time.',
        tags: ['WebGPU', 'GLSL', 'TypeScript', 'Rust WASM'],
        status: 'wip' as const,
        year: 2025,
        featured: true,
    },
    {
        id: 'signal',
        title: 'Signal',
        subtitle: 'Real-time audio visualizer',
        description: 'A high-fidelity audio visualizer using the Web Audio API and Three.js. Analyzes frequency data to drive reactive 3D particle systems.',
        tags: ['Web Audio API', 'Three.js', 'React'],
        status: 'live' as const,
        year: 2023,
        featured: false,
    },
]

export const blogPosts = [
    {
        id: 'writing-glsl-shaders',
        title: 'Writing GLSL Shaders That Feel Alive',
        excerpt: 'A deep dive into domain-warped noise, fbm functions, and how to build organic motion into your fragment shaders.',
        date: '2025-03-14',
        readTime: 8,
        tags: ['GLSL', 'WebGL', 'Creative Coding'],
    },
    {
        id: 'react-three-fiber-patterns',
        title: 'Architecture Patterns for Large R3F Applications',
        excerpt: 'How to structure React Three Fiber apps that stay performant and maintainable as they scale.',
        date: '2025-01-22',
        readTime: 12,
        tags: ['React', 'Three.js', 'Architecture'],
    },
    {
        id: 'webgpu-terrain',
        title: 'Procedural Terrain With WebGPU Compute',
        excerpt: 'Using compute shaders in the browser to generate and mesh terrain in real time without touching the CPU.',
        date: '2024-11-08',
        readTime: 15,
        tags: ['WebGPU', 'Procedural', 'Performance'],
    },
]

export const SECTION_IDS = ['hero', 'about', 'skills', 'experience', 'projects', 'blog', 'contact'] as const

// ── Contact / communication channels ─────────────────────────────────────────

export type ProjectType =
    | 'web-app'
    | 'creative-tech'
    | 'webgl-3d'
    | 'ai-ml'
    | 'fullstack'
    | 'consulting'
    | 'other'

export type BudgetRange =
    | 'under-5k'
    | '5k-15k'
    | '15k-50k'
    | '50k-plus'
    | 'discuss'

export type Timeline =
    | 'asap'
    | '1-3-months'
    | '3-6-months'
    | '6-plus-months'
    | 'ongoing'

export const PROJECT_TYPES: Record<ProjectType, string> = {
    'web-app': 'Web Application',
    'creative-tech': 'Creative Technology',
    'webgl-3d': 'WebGL / 3D Experience',
    'ai-ml': 'AI / ML Integration',
    'fullstack': 'Full Stack System',
    'consulting': 'Consulting / Advisory',
    'other': 'Other',
}

export const BUDGET_RANGES: Record<BudgetRange, string> = {
    'under-5k': '< $5,000',
    '5k-15k': '$5,000 – $15,000',
    '15k-50k': '$15,000 – $50,000',
    '50k-plus': '$50,000+',
    'discuss': 'Let\'s discuss',
}

export const TIMELINES: Record<Timeline, string> = {
    'asap': 'As soon as possible',
    '1-3-months': '1–3 months',
    '3-6-months': '3–6 months',
    '6-plus-months': '6+ months',
    'ongoing': 'Ongoing / retainer',
}

export const communicationChannels = [
    {
        id: 'github',
        label: 'GitHub',
        handle: '@yourhandle',
        url: personalInfo.social.github,
        description: 'Open source work & repositories',
        color: '#e2e8f0',
    },
    {
        id: 'linkedin',
        label: 'LinkedIn',
        handle: 'in/yourprofile',
        url: personalInfo.social.linkedin,
        description: 'Professional network & CV',
        color: '#38bdf8',
    },
    {
        id: 'twitter',
        label: 'X / Twitter',
        handle: '@yourhandle',
        url: personalInfo.social.twitter,
        description: 'Thoughts & updates',
        color: '#e2e8f0',
    },
    {
        id: 'email',
        label: 'Email',
        handle: personalInfo.email,
        url: `mailto:${personalInfo.email}`,
        description: 'Direct channel — fastest response',
        color: '#34d399',
    },
] as const
