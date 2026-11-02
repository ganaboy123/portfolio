// ─────────────────────────────────────────────────────────────────────────────
//  DIGITAL LAB — Project data
//  Replace placeholder content with real project information.
// ─────────────────────────────────────────────────────────────────────────────

export type ProjectStatus = 'live' | 'wip' | 'archived' | 'concept'
export type ProjectCategory = 'webgl' | 'systems' | 'ai-ml' | 'tools' | 'fullstack' | 'creative'

export interface ProjectMedia {
    type: 'image' | 'video'
    url: string              // path or external URL
    caption?: string
    thumbnail?: string       // poster frame for video
}

export interface ProjectLink {
    label: string
    url: string
    type: 'live' | 'github' | 'docs' | 'demo'
}

export interface Project {
    id: string
    number: string           // e.g. "LAB-001"
    title: string
    subtitle: string
    category: ProjectCategory
    status: ProjectStatus
    year: number
    featured: boolean
    /** Short description shown on card */
    description: string
    /** Full overview for modal */
    overview: string
    problem: string
    solution: string
    architecture: string
    technologies: string[]
    keyFeatures: string[]
    challenges: string[]
    results: string[]
    media: ProjectMedia[]
    links: ProjectLink[]
    /** Accent — drives colour theme */
    accent: 'cyan' | 'violet'
}

// ── Category metadata ─────────────────────────────────────────────────────────
export const PROJECT_CATEGORIES: Record<ProjectCategory, { label: string; color: string }> = {
    webgl: { label: '3D / WEBGL', color: '#e879f9' },
    systems: { label: 'SYSTEMS', color: '#38bdf8' },
    'ai-ml': { label: 'AI / ML', color: '#f472b6' },
    tools: { label: 'TOOLS', color: '#94a3b8' },
    fullstack: { label: 'FULL STACK', color: '#34d399' },
    creative: { label: 'CREATIVE', color: '#a78bfa' },
}

// ── Projects ──────────────────────────────────────────────────────────────────
export const labProjects: Project[] = [
    {
        id: 'neural-mesh',
        number: 'LAB-001',
        title: 'Neural Mesh',
        subtitle: 'Real-time neural network visualizer',
        category: 'webgl',
        status: 'live',
        year: 2024,
        featured: true,
        accent: 'cyan',
        description: 'Interactive WebGL visualization of neural network training in real time. Watch weights update, activations fire, and loss curves evolve — rendered as a living 3D graph.',
        overview: 'Neural Mesh bridges the gap between machine learning opacity and visual intuition. By rendering an entire neural network as a live, interactive 3D graph, it makes the abstract mechanics of deep learning tangible. Users can observe weight magnitudes, activation patterns, and gradient flow simultaneously — creating a new vocabulary for understanding model behavior.',
        problem: 'Neural networks are notoriously difficult to interpret. Training logs, accuracy curves, and static weight histograms tell an incomplete story. Researchers and engineers lack an immediate, spatial sense of what is happening inside a model during training.',
        solution: 'A WebGL rendering engine built on Three.js and custom GLSL shaders translates model state directly into 3D visual primitives. Nodes represent neurons; edge widths encode weight magnitudes; color encodes sign; particle flow visualizes activation propagation. The renderer syncs with a lightweight Python training harness via WebSocket.',
        architecture: 'React frontend with R3F for the scene graph. Custom instanced mesh renderer for up to 100k nodes at 60fps. GLSL vertex shaders perform weight-to-scale mapping on the GPU. Python bridge via FastAPI WebSocket streams model state deltas at configurable frequency. State managed with Zustand.',
        technologies: ['Three.js', 'React Three Fiber', 'GLSL', 'React', 'TypeScript', 'FastAPI', 'WebSocket', 'Python', 'PyTorch'],
        keyFeatures: [
            'Live training visualization at 60fps with up to 50 layers',
            'GPU-side instanced rendering for 100k+ nodes',
            'Configurable color maps: weight magnitude, gradient, activation',
            'Interactive node inspection with per-neuron stats',
            'Screenshot + video export',
            'Python SDK for custom model integration',
        ],
        challenges: [
            'Maintaining 60fps with dynamic geometry updates every training step required moving all weight-to-visual mapping into GLSL vertex shaders',
            'WebSocket streaming at model-training frequency without UI jank — solved with double-buffered state and decoupled React render cycle',
            'Spatially laying out arbitrary-depth networks in a readable 3D arrangement required a custom force-directed layout algorithm',
        ],
        results: [
            'Adopted internally by 3 research teams for model debugging',
            'Open-sourced with 1.2k GitHub stars in first month',
            'Featured in two ML engineering newsletters',
            'Zero UI-thread frame drops in benchmarks up to 12-layer networks',
        ],
        media: [
            { type: 'image', url: '/project-neural-mesh.svg', caption: 'Neural Mesh project visual' },
        ],
        links: [
            { label: 'LIVE DEMO', url: 'https://example.com', type: 'live' },
            { label: 'SOURCE CODE', url: 'https://github.com', type: 'github' },
        ],
    },
    {
        id: 'orbit-db-client',
        number: 'LAB-002',
        title: 'OrbitDB Client',
        subtitle: 'Distributed database interface',
        category: 'systems',
        status: 'live',
        year: 2024,
        featured: true,
        accent: 'violet',
        description: 'A sleek GUI for OrbitDB built with React and Electron. Real-time sync visualization across peers with a graph-based data explorer.',
        overview: 'OrbitDB Client gives developers a first-class GUI for the distributed, peer-to-peer OrbitDB database. It visualizes the replication graph, exposes the append-only log, and provides a live query explorer — removing the barrier to entry for P2P database development.',
        problem: 'OrbitDB is powerful but nearly unusable without deep CLI knowledge. Developers have no visibility into replication state, peer connections, or the underlying IPFS DAG structure — making debugging extremely difficult.',
        solution: 'Electron app wrapping a React UI with real-time WebSocket connection to a local OrbitDB node. The interface renders the replication graph using D3 force simulation, exposes all stores with live document counts, and provides a query REPL with syntax highlighting.',
        architecture: 'Electron shell + React renderer process. Main process manages OrbitDB/IPFS node lifecycle via Node.js. IPC bridge streams events to renderer. D3.js + custom SVG for the graph view. Monaco Editor for query REPL. SQLite for local preferences.',
        technologies: ['Electron', 'React', 'TypeScript', 'Node.js', 'OrbitDB', 'IPFS', 'D3.js', 'Monaco Editor', 'SQLite'],
        keyFeatures: [
            'Live replication graph with peer count and sync status',
            'All OrbitDB store types supported: feed, log, keyvalue, docstore, counter',
            'Built-in query REPL with autocompletion',
            'Export/import snapshots as IPLD car files',
            'Dark UI optimised for extended developer sessions',
        ],
        challenges: [
            'Electron security constraints required careful IPC surface design to avoid exposing Node.js APIs to the renderer',
            'D3 force simulation with hundreds of nodes required canvas fallback for performance',
            'IPFS daemon lifecycle management across OS platforms required platform-specific subprocess handling',
        ],
        results: [
            '2,400+ downloads on GitHub Releases',
            '4.7★ average rating across issue tracker feedback',
            'Mentioned in OrbitDB official documentation',
        ],
        media: [
            { type: 'image', url: '/project-orbit-db-client.svg', caption: 'OrbitDB Client project visual' },
        ],
        links: [
            { label: 'SOURCE CODE', url: 'https://github.com', type: 'github' },
            { label: 'DOCS', url: 'https://example.com', type: 'docs' },
        ],
    },
    {
        id: 'void-engine',
        number: 'LAB-003',
        title: 'Void Engine',
        subtitle: 'Procedural world generator',
        category: 'webgl',
        status: 'wip',
        year: 2025,
        featured: true,
        accent: 'violet',
        description: 'Browser-based procedural terrain and atmosphere generator using WebGPU compute shaders. Generates alien planets in real time with no server.',
        overview: 'Void Engine is a research project exploring the limits of real-time procedural generation in the browser. Using WebGPU compute shaders and a custom noise library compiled from Rust to WASM, it generates, meshes, and renders full planetary surfaces at interactive frame rates — entirely client-side.',
        problem: 'Procedural world generation typically requires server-side compute or pre-baked assets. Bringing this capability entirely to the browser, with real-time editing and cinematic rendering, was considered impractical before WebGPU.',
        solution: 'A multi-pass WebGPU compute pipeline evaluates layered noise functions across terrain heightfields in parallel. Rust-compiled WASM handles the CPU-side mesh topology. Three.js renders the output with custom atmosphere scattering shaders.',
        architecture: 'WebGPU compute pipelines written in WGSL for noise evaluation and heightfield generation. Rust + wasm-bindgen for mesh topology computation. Three.js post-processing stack with custom atmosphere and cloud shaders. React UI controls via dat.GUI-inspired system.',
        technologies: ['WebGPU', 'WGSL', 'Three.js', 'Rust WASM', 'GLSL', 'TypeScript', 'React'],
        keyFeatures: [
            'Real-time terrain generation via 4-pass WebGPU compute',
            'Procedural atmosphere with Rayleigh scattering approximation',
            'Biome system: 8 planet archetypes',
            'Shareable planet seeds via URL hash',
            'Export to GLTF for use in other 3D tools',
        ],
        challenges: [
            'WebGPU browser support required a fallback path to WebGL2 via custom shader transpilation',
            'WASM memory model required careful arena allocation to avoid GC pauses during generation',
            'Atmosphere shader needed physically-based approximation that ran under 2ms per frame',
        ],
        results: [
            'Generates a full 4096×4096 heightfield in under 180ms on mid-range hardware',
            'Accepted as a demo at [Conference Placeholder]',
            'Actively used as a test bench for WebGPU compute research',
        ],
        media: [
            { type: 'image', url: '/project-void-engine.svg', caption: 'Void Engine project visual' },
        ],
        links: [
            { label: 'SOURCE CODE', url: 'https://github.com', type: 'github' },
        ],
    },
    {
        id: 'signal',
        number: 'LAB-004',
        title: 'Signal',
        subtitle: 'Real-time audio visualizer',
        category: 'creative',
        status: 'live',
        year: 2023,
        featured: false,
        accent: 'cyan',
        description: 'High-fidelity audio visualizer using the Web Audio API and Three.js. Analyzes frequency data to drive reactive 3D particle systems.',
        overview: 'Signal turns any audio source — microphone, file, or stream — into a live 3D reactive sculpture. Frequency bands are mapped to particle system parameters, creating organic visual responses that feel compositionally tied to the music.',
        problem: 'Most web audio visualizers are flat canvas bars or simple circles. The challenge was creating a 3D system that felt musically intentional rather than algorithmically random.',
        solution: 'Web Audio API AnalyserNode feeds 1024-bin FFT data per frame. Custom frequency-band extractor maps ranges to visual parameters. Three.js particle system with custom GLSL shaders responds to bass, mid, and treble independently.',
        architecture: 'Web Audio API for capture and analysis. Custom frequency analyzer extracts 8 perceptual bands. Three.js InstancedMesh particle system. GSAP for smooth parameter interpolation. React UI for source selection and visual preset management.',
        technologies: ['Web Audio API', 'Three.js', 'GLSL', 'React', 'GSAP', 'TypeScript'],
        keyFeatures: [
            'Supports microphone, audio file, and URL stream sources',
            'Perceptual frequency band separation',
            '6 built-in visual presets',
            'Custom preset creator and export',
            'BPM detection with beat-sync mode',
        ],
        challenges: [
            'Microphone latency compensation required adaptive buffer sizing',
            'Mobile GPU instancing limits required a progressive quality system',
        ],
        results: [
            '8,000+ unique visitors in first week after HN submission',
            'Featured on Product Hunt front page',
        ],
        media: [
            { type: 'image', url: '/project-signal.svg', caption: 'Signal project visual' },
        ],
        links: [
            { label: 'LIVE DEMO', url: 'https://example.com', type: 'live' },
            { label: 'SOURCE CODE', url: 'https://github.com', type: 'github' },
        ],
    },
]
