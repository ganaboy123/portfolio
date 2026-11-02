/**
 * TechMarquee — two infinite scrolling rows of tech stack tiles.
 * Row 1 scrolls left, Row 2 scrolls right.
 * Pure CSS animation — zero JS on the scroll loop.
 * Keyframes and .tech-tile styles live in globals.css.
 */

interface TechItem {
    id: string
    label: string
    color: string   // icon accent color
    icon: React.ReactNode
}

// ── SVG icons (inline, no external deps) ──────────────────────────────────────

const Icon = ({ children, size = 32 }: { children: React.ReactNode; size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
        {children}
    </svg>
)

const TECH_ITEMS_ROW1: TechItem[] = [
    {
        id: 'typescript', label: 'TypeScript', color: '#3178c6',
        icon: <Icon><rect width="32" height="32" rx="3" fill="#3178c6" opacity="0.15" /><text x="4" y="23" fill="#3178c6" fontSize="15" fontWeight="700" fontFamily="monospace">TS</text></Icon>,
    },
    {
        id: 'react', label: 'React', color: '#61dafb',
        icon: <Icon><circle cx="16" cy="16" r="3" fill="#61dafb" /><ellipse cx="16" cy="16" rx="13" ry="5" stroke="#61dafb" strokeWidth="1.5" fill="none" /><ellipse cx="16" cy="16" rx="13" ry="5" stroke="#61dafb" strokeWidth="1.5" fill="none" transform="rotate(60 16 16)" /><ellipse cx="16" cy="16" rx="13" ry="5" stroke="#61dafb" strokeWidth="1.5" fill="none" transform="rotate(120 16 16)" /></Icon>,
    },
    {
        id: 'nodejs', label: 'Node.js', color: '#83cd29',
        icon: <Icon><polygon points="16,2 28,9 28,23 16,30 4,23 4,9" stroke="#83cd29" strokeWidth="1.5" fill="none" /><text x="9" y="21" fill="#83cd29" fontSize="10" fontWeight="700" fontFamily="monospace">JS</text></Icon>,
    },
    {
        id: 'python', label: 'Python', color: '#ffd845',
        icon: <Icon><path d="M16 4 C10 4 8 7 8 11 L8 14 L24 14 L24 16 L8 16 L8 21 C8 25 10 28 16 28 C22 28 24 25 24 21 L24 18 L8 18" stroke="#4b8bbe" strokeWidth="1.5" fill="none" /><circle cx="12" cy="11" r="1.5" fill="#ffd845" /><circle cx="20" cy="21" r="1.5" fill="#4b8bbe" /></Icon>,
    },
    {
        id: 'threejs', label: 'Three.js', color: '#ffffff',
        icon: <Icon><polygon points="16,3 29,26 3,26" stroke="rgba(255,255,255,0.9)" strokeWidth="1.5" fill="none" /><polygon points="16,9 24,22 8,22" stroke="rgba(255,255,255,0.5)" strokeWidth="1" fill="none" /></Icon>,
    },
    {
        id: 'webgl', label: 'WebGL', color: '#990000',
        icon: <Icon><rect x="3" y="3" width="26" height="26" rx="3" stroke="#cc3333" strokeWidth="1.5" fill="none" /><text x="4" y="22" fill="#cc3333" fontSize="9" fontWeight="700" fontFamily="monospace">WebGL</text></Icon>,
    },
    {
        id: 'gsap', label: 'GSAP', color: '#88ce02',
        icon: <Icon><circle cx="16" cy="16" r="12" stroke="#88ce02" strokeWidth="1.5" fill="none" /><path d="M10 16 L16 10 L22 16 L16 22 Z" stroke="#88ce02" strokeWidth="1.5" fill="none" /></Icon>,
    },
    {
        id: 'postgresql', label: 'PostgreSQL', color: '#336791',
        icon: <Icon><ellipse cx="16" cy="10" rx="10" ry="6" stroke="#336791" strokeWidth="1.5" fill="none" /><path d="M6 10 L6 22 C6 25.3 10.5 28 16 28 C21.5 28 26 25.3 26 22 L26 10" stroke="#336791" strokeWidth="1.5" fill="none" /><path d="M6 16 C6 19.3 10.5 22 16 22 C21.5 22 26 19.3 26 16" stroke="#336791" strokeWidth="1" fill="none" /></Icon>,
    },
    {
        id: 'docker', label: 'Docker', color: '#2496ed',
        icon: <Icon><rect x="3" y="14" width="26" height="10" rx="2" stroke="#2496ed" strokeWidth="1.5" fill="none" /><rect x="6" y="10" width="5" height="4" stroke="#2496ed" strokeWidth="1" fill="none" /><rect x="13" y="10" width="5" height="4" stroke="#2496ed" strokeWidth="1" fill="none" /><rect x="13" y="4" width="5" height="5" stroke="#2496ed" strokeWidth="1" fill="none" /><path d="M26 17 C28 15 30 16 29 19" stroke="#2496ed" strokeWidth="1" fill="none" /></Icon>,
    },
    {
        id: 'aws', label: 'AWS', color: '#ff9900',
        icon: <Icon><path d="M8 20 C6 14 8 8 16 8 C21 8 24 11 24 15" stroke="#ff9900" strokeWidth="1.5" fill="none" /><path d="M6 22 L26 22" stroke="#ff9900" strokeWidth="1.5" strokeLinecap="round" /><path d="M4 26 L28 26" stroke="#ff9900" strokeWidth="1" strokeLinecap="round" opacity="0.5" /><text x="10" y="19" fill="#ff9900" fontSize="8" fontWeight="700" fontFamily="monospace">AWS</text></Icon>,
    },
    {
        id: 'rust', label: 'Rust', color: '#ce412b',
        icon: <Icon><circle cx="16" cy="16" r="12" stroke="#ce412b" strokeWidth="1.5" fill="none" /><circle cx="16" cy="16" r="4" stroke="#ce412b" strokeWidth="1.5" fill="none" /><path d="M16 4 L16 8 M28 16 L24 16 M16 28 L16 24 M4 16 L8 16" stroke="#ce412b" strokeWidth="2" strokeLinecap="round" /></Icon>,
    },
]

const TECH_ITEMS_ROW2: TechItem[] = [
    {
        id: 'glsl', label: 'GLSL', color: '#9b5cf6',
        icon: <Icon><text x="3" y="13" fill="#9b5cf6" fontSize="9" fontWeight="700" fontFamily="monospace">GLSL</text><path d="M4 18 L28 18 M4 22 L20 22 M4 26 L16 26" stroke="#9b5cf6" strokeWidth="1" strokeLinecap="round" opacity="0.6" /></Icon>,
    },
    {
        id: 'git', label: 'Git', color: '#f05032',
        icon: <Icon><circle cx="24" cy="8" r="3" stroke="#f05032" strokeWidth="1.5" fill="none" /><circle cx="8" cy="8" r="3" stroke="#f05032" strokeWidth="1.5" fill="none" /><circle cx="8" cy="24" r="3" stroke="#f05032" strokeWidth="1.5" fill="none" /><path d="M8 11 L8 21 M11 8 L21 8 M11 22 C16 22 18 18 21 11" stroke="#f05032" strokeWidth="1.5" fill="none" /></Icon>,
    },
    {
        id: 'redis', label: 'Redis', color: '#dc382d',
        icon: <Icon><ellipse cx="16" cy="10" rx="11" ry="5" stroke="#dc382d" strokeWidth="1.5" fill="none" /><path d="M5 10 L5 17 C5 19.8 10 22 16 22 C22 22 27 19.8 27 17 L27 10" stroke="#dc382d" strokeWidth="1.5" fill="none" /><path d="M5 17 C5 19.8 10 22 16 22 C22 22 27 19.8 27 17" stroke="#dc382d" strokeWidth="1" fill="none" /></Icon>,
    },
    {
        id: 'mongodb', label: 'MongoDB', color: '#47a248',
        icon: <Icon><path d="M16 3 C16 3 22 9 22 17 C22 22 19 26 16 28 C13 26 10 22 10 17 C10 9 16 3 16 3Z" stroke="#47a248" strokeWidth="1.5" fill="none" /><path d="M16 28 L16 20" stroke="#47a248" strokeWidth="2" strokeLinecap="round" /></Icon>,
    },
    {
        id: 'figma', label: 'Figma', color: '#f24e1e',
        icon: <Icon><rect x="9" y="3" width="7" height="7" rx="3.5" fill="none" stroke="#f24e1e" strokeWidth="1.5" /><rect x="9" y="12.5" width="7" height="7" rx="3.5" fill="none" stroke="#a259ff" strokeWidth="1.5" /><rect x="9" y="22" width="7" height="7" rx="3.5" fill="none" stroke="#0acf83" strokeWidth="1.5" /><rect x="17" y="3" width="7" height="7" rx="3.5" fill="none" stroke="#ff7262" strokeWidth="1.5" /><circle cx="20.5" cy="16" r="3.5" fill="none" stroke="#1abcfe" strokeWidth="1.5" /></Icon>,
    },
    {
        id: 'pytorch', label: 'PyTorch', color: '#ee4c2c',
        icon: <Icon><path d="M16 4 L16 16 A8 8 0 1 1 8 16" stroke="#ee4c2c" strokeWidth="1.5" fill="none" strokeLinecap="round" /><circle cx="16" cy="8" r="2" fill="#ee4c2c" /></Icon>,
    },
    {
        id: 'llm', label: 'LLM / AI', color: '#00c8e8',
        icon: <Icon><circle cx="16" cy="16" r="10" stroke="#00c8e8" strokeWidth="1.5" fill="none" /><circle cx="16" cy="16" r="4" fill="#00c8e8" opacity="0.3" /><path d="M16 6 L16 12 M24 16 L20 16 M16 26 L16 20 M8 16 L12 16" stroke="#00c8e8" strokeWidth="1.5" strokeLinecap="round" /></Icon>,
    },
    {
        id: 'webgpu', label: 'WebGPU', color: '#6de8f8',
        icon: <Icon><polygon points="16,4 26,10 26,22 16,28 6,22 6,10" stroke="#6de8f8" strokeWidth="1.5" fill="none" /><polygon points="16,9 22,13 22,21 16,25 10,21 10,13" stroke="#6de8f8" strokeWidth="1" fill="none" opacity="0.5" /></Icon>,
    },
    {
        id: 'css', label: 'CSS', color: '#264de4',
        icon: <Icon><polygon points="4,3 6,27 16,30 26,27 28,3" stroke="#264de4" strokeWidth="1.5" fill="none" /><path d="M10 12 L22 12 M11 17 L21 17 M10 22 L16 23.5" stroke="#264de4" strokeWidth="1" strokeLinecap="round" /></Icon>,
    },
    {
        id: 'nextjs', label: 'Next.js', color: '#ffffff',
        icon: <Icon><circle cx="16" cy="16" r="12" stroke="rgba(255,255,255,0.8)" strokeWidth="1.5" fill="none" /><text x="9" y="21" fill="rgba(255,255,255,0.9)" fontSize="10" fontWeight="700" fontFamily="monospace">N</text></Icon>,
    },
    {
        id: 'fastapi', label: 'FastAPI', color: '#009688',
        icon: <Icon><circle cx="16" cy="16" r="12" stroke="#009688" strokeWidth="1.5" fill="none" /><path d="M12 10 L21 16 L12 22 Z" fill="#009688" opacity="0.7" /></Icon>,
    },
]

// ── Tile component ─────────────────────────────────────────────────────────────

function TechTile({ item }: { item: TechItem }) {
    return (
        <div className="tech-tile">
            <div style={{ width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', filter: `drop-shadow(0 0 5px ${item.color}44)` }}>
                {item.icon}
            </div>
            <span style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.55rem',
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: 'rgba(168, 180, 216, 0.75)',
                whiteSpace: 'nowrap',
            }}>
                {item.label}
            </span>
        </div>
    )
}

// ── Marquee row ────────────────────────────────────────────────────────────────

function MarqueeRow({ items, direction, speed }: { items: TechItem[]; direction: 'left' | 'right'; speed: number }) {
    // Duplicate for seamless loop
    const doubled = [...items, ...items]
    const animName = direction === 'left' ? 'marquee-left' : 'marquee-right'

    return (
        <div style={{ overflow: 'hidden', position: 'relative', width: '100%' }}>
            {/* left fade */}
            <div aria-hidden style={{
                position: 'absolute', left: 0, top: 0, bottom: 0, width: 80, zIndex: 2,
                background: 'linear-gradient(to right, rgba(2,15,24,1) 0%, transparent 100%)',
                pointerEvents: 'none',
            }} />
            {/* right fade */}
            <div aria-hidden style={{
                position: 'absolute', right: 0, top: 0, bottom: 0, width: 80, zIndex: 2,
                background: 'linear-gradient(to left, rgba(4,20,32,1) 0%, transparent 100%)',
                pointerEvents: 'none',
            }} />

            <div
                style={{
                    display: 'flex',
                    gap: 12,
                    width: 'max-content',
                    animation: `${animName} ${speed}s linear infinite`,
                    willChange: 'transform',
                }}
            >
                {doubled.map((item, i) => (
                    <TechTile key={`${item.id}-${i}`} item={item} />
                ))}
            </div>
        </div>
    )
}

// ── Main export ────────────────────────────────────────────────────────────────

export function TechMarquee() {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <MarqueeRow items={TECH_ITEMS_ROW1} direction="left" speed={38} />
            <MarqueeRow items={TECH_ITEMS_ROW2} direction="right" speed={44} />
        </div>
    )
}
