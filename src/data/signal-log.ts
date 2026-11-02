// ─────────────────────────────────────────────────────────────────────────────
//  SIGNAL LOG — Knowledge System / Transmissions data
//
//  Content architecture:
//  ─ This file is the single source of truth for article metadata.
//  ─ `body` holds inline markdown for static builds.
//  ─ `externalUrl` / `slug` enable future CMS or API loading.
//  ─ The reader component consumes this interface; swap the data source
//    without touching any UI component.
// ─────────────────────────────────────────────────────────────────────────────

export type SignalCategory =
    | 'engineering'
    | 'creative'
    | 'architecture'
    | 'performance'
    | 'ai-ml'
    | 'tools'
    | 'research'

export type SignalType = 'deep-dive' | 'guide' | 'case-study' | 'research' | 'opinion'

export interface TableOfContentsEntry {
    id: string
    label: string
    level: 1 | 2 | 3
}

export interface SignalEntry {
    id: string
    /** Transmission ID — e.g. "SIG-001" */
    transmissionId: string
    title: string
    subtitle: string
    excerpt: string
    /**
     * Full article body in Markdown.
     * Replace with a CMS fetch, MDX import, or API call in production.
     * Leave null to show the "external" state.
     */
    body: string | null
    /** Manually defined table of contents — generated at build time in production */
    toc: TableOfContentsEntry[]
    /** ISO date string */
    date: string
    readTime: number
    category: SignalCategory
    type: SignalType
    tags: string[]
    /** Whether to feature prominently in the archive */
    featured: boolean
    /**
     * Optional cover / featured image URL.
     * Can be a local asset path or an external URL.
     */
    coverImage: string | null
    /** External URL if published elsewhere, null = internal reader */
    externalUrl: string | null
    /** Related article IDs for "See Also" section */
    relatedIds: string[]
}

// ── Category metadata ─────────────────────────────────────────────────────────
export const SIGNAL_CATEGORIES: Record<SignalCategory, { label: string; color: string }> = {
    engineering: { label: 'ENGINEERING', color: '#38bdf8' },
    creative: { label: 'CREATIVE CODE', color: '#e879f9' },
    architecture: { label: 'ARCHITECTURE', color: '#a78bfa' },
    performance: { label: 'PERFORMANCE', color: '#34d399' },
    'ai-ml': { label: 'AI / ML', color: '#f472b6' },
    tools: { label: 'TOOLS', color: '#94a3b8' },
    research: { label: 'RESEARCH', color: '#fb923c' },
}

export const SIGNAL_TYPES: Record<SignalType, string> = {
    'deep-dive': 'DEEP DIVE',
    'guide': 'GUIDE',
    'case-study': 'CASE STUDY',
    'research': 'RESEARCH',
    'opinion': 'OPINION',
}

// ── Entries ───────────────────────────────────────────────────────────────────
export const signalLog: SignalEntry[] = [
    {
        id: 'glsl-shaders-alive',
        transmissionId: 'SIG-001',
        title: 'Writing GLSL Shaders That Feel Alive',
        subtitle: 'Domain-warped noise and organic motion in fragment shaders',
        excerpt: 'A deep dive into domain-warped FBM noise, how to build organic motion into your fragment shaders, and why the difference between "animated" and "alive" lives entirely in your warp chain.',
        date: '2025-03-14',
        readTime: 8,
        category: 'creative',
        type: 'deep-dive',
        tags: ['GLSL', 'WebGL', 'Noise', 'Creative Coding'],
        featured: true,
        coverImage: '/signal-glsl-shaders.svg',
        externalUrl: null,
        relatedIds: ['r3f-architecture', 'webgpu-terrain'],
        toc: [
            { id: 'intro', label: 'Introduction', level: 1 },
            { id: 'fbm', label: 'Fractional Brownian Motion', level: 2 },
            { id: 'domain-warp', label: 'Domain Warping', level: 2 },
            { id: 'time', label: 'Introducing Time', level: 2 },
            { id: 'conclusion', label: 'Putting It Together', level: 1 },
        ],
        body: `## Introduction

Every shader that just *moves* has the same problem: you can see the algorithm. The noise tiles, the motion repeats, and your eye locks onto the pattern in seconds. The solution isn't more complexity — it's **domain warping**.

This post covers the specific chain of techniques that turns procedural noise from a technical exercise into something that looks genuinely organic.

## Fractional Brownian Motion

FBM is the foundation. You layer the same noise function at different frequencies and amplitudes, each octave adding smaller, finer detail:

\`\`\`glsl
float fbm(vec2 p) {
    float value = 0.0;
    float amplitude = 0.5;
    for (int i = 0; i < 6; i++) {
        value += amplitude * noise(p);
        p *= 2.0;
        amplitude *= 0.5;
    }
    return value;
}
\`\`\`

The key parameters are the **lacunarity** (frequency multiplier, typically ~2.0) and **gain** (amplitude multiplier, typically ~0.5). Tweaking these away from the defaults immediately distinguishes your noise from everyone else's.

## Domain Warping

This is where things get interesting. Instead of evaluating FBM at position \`p\`, you first displace \`p\` by another FBM evaluation:

\`\`\`glsl
vec2 warpedPos = p + vec2(
    fbm(p + vec2(0.0, 0.0)),
    fbm(p + vec2(5.2, 1.3))
);
float value = fbm(warpedPos);
\`\`\`

The offset vectors (\`vec2(0.0, 0.0)\` and \`vec2(5.2, 1.3)\`) break the symmetry. Without them, the warp folds back on itself. With carefully chosen offsets, you get the swirling, folded quality that reads as biological.

You can chain this twice for a second level of warping — the cost doubles, but the organic quality compounds non-linearly.

## Introducing Time

Static warp looks good. Animated warp looks alive. The key is **differential animation**: don't move every layer at the same rate.

\`\`\`glsl
uniform float uTime;

vec2 warpedPos = p + vec2(
    fbm(p + 0.12 * uTime),
    fbm(p + vec2(1.7, 9.2) + 0.08 * uTime)
);
\`\`\`

The 0.12 and 0.08 multipliers create a velocity differential between the two warp axes. This prevents the motion from feeling translated — it feels like the material itself is flowing.

Keep time multipliers under 0.2. Faster motion breaks the illusion; slow drift reads as breathing.

## Putting It Together

The full stack — FBM + double domain warp + differential time animation — runs comfortably at 60fps on mid-range hardware for a 1080p fullscreen quad. For performance-critical contexts, cap FBM at 4 octaves and skip the second warp pass.

The psychological reason this works is that our visual system evolved to detect repetition as a threat signal. Domain warping breaks global periodicity while preserving local structure, which is exactly what organic materials do.`,
    },
    {
        id: 'r3f-architecture',
        transmissionId: 'SIG-002',
        title: 'Architecture Patterns for Large R3F Applications',
        subtitle: 'Scaling React Three Fiber without performance or maintainability collapse',
        excerpt: 'How to structure React Three Fiber apps that stay performant and maintainable as they scale past a few scenes. Covers scene graph management, ref patterns, store architecture, and GPU-tier gating.',
        date: '2025-01-22',
        readTime: 12,
        category: 'architecture',
        type: 'guide',
        tags: ['React', 'Three.js', 'R3F', 'Architecture'],
        featured: true,
        coverImage: '/signal-r3f-architecture.svg',
        externalUrl: null,
        relatedIds: ['glsl-shaders-alive', 'webgpu-terrain'],
        toc: [
            { id: 'the-problem', label: 'The Scaling Problem', level: 1 },
            { id: 'store', label: 'Store Architecture', level: 2 },
            { id: 'scene-graph', label: 'Scene Graph Ownership', level: 2 },
            { id: 'gpu-gating', label: 'GPU-Tier Gating', level: 2 },
            { id: 'refs', label: 'Ref Patterns', level: 2 },
        ],
        body: `## The Scaling Problem

React Three Fiber solves the component model for Three.js. It does not solve the state management problem. As your scene grows, you will encounter a predictable set of problems: excessive re-renders rippling into the Three.js scene, unclear ownership of Three.js objects, and performance that degrades silently.

This guide covers the patterns that prevent those problems at scale.

## Store Architecture

The most important decision: **keep render-loop state out of React state**.

Anything that changes every frame (uniforms, object positions driven by animation, audio analysis data) must live in refs or a non-reactive store. React's reconciler is not designed to run at 60fps.

\`\`\`ts
// ✗ This will hammer the reconciler
const [rotation, setRotation] = useState(0)
useFrame(() => setRotation(r => r + 0.01))

// ✓ This is free
const rotationRef = useRef(0)
useFrame((_, delta) => {
  rotationRef.current += delta
  meshRef.current.rotation.y = rotationRef.current
})
\`\`\`

For shared scene state that does need to be reactive (GPU tier, active camera, loaded assets), use Zustand with shallow equality. Avoid React Context for high-frequency values.

## Scene Graph Ownership

R3F blurs the line between React component tree and Three.js scene graph. This becomes a problem when you need to imperatively manipulate objects (GSAP animations, physics integration, direct Three.js API calls).

The pattern that works: **React owns creation and cleanup; imperative code owns animation**.

\`\`\`tsx
function AnimatedMesh() {
  const ref = useRef<THREE.Mesh>(null)

  useEffect(() => {
    if (!ref.current) return
    // GSAP owns this object's animation from here
    const tl = gsap.timeline({ repeat: -1 })
    tl.to(ref.current.rotation, { y: Math.PI * 2, duration: 4 })
    return () => tl.kill()
  }, [])

  return <mesh ref={ref}><boxGeometry /><meshStandardMaterial /></mesh>
}
\`\`\`

## GPU-Tier Gating

Not all users have the same GPU. Detect capability early and use it to gate effect complexity:

\`\`\`ts
type GpuTier = 'high' | 'medium' | 'low'

function detectTier(): GpuTier {
  const gl = document.createElement('canvas').getContext('webgl2')
  if (!gl) return 'low'
  const renderer = gl.getParameter(gl.RENDERER)
  if (/Apple M[2-9]|RTX 4[0-9]|RX 7[0-9]/.test(renderer)) return 'high'
  if (/Apple M1|RTX 3[0-9]|RX 6[0-9]/.test(renderer)) return 'medium'
  return 'low'
}
\`\`\`

Gate post-processing passes, particle counts, and shadow map resolution behind this tier value.

## Ref Patterns

When multiple components need access to the same Three.js object, pass the ref down — don't reach for context. Context re-renders every consumer on update; ref mutation is free.

For deeply nested access, consider a scene registry: a plain object (not React state) that components write their refs into on mount. The render loop reads from it directly.`,
    },
    {
        id: 'webgpu-terrain',
        transmissionId: 'SIG-003',
        title: 'Procedural Terrain With WebGPU Compute',
        subtitle: 'Moving heightfield generation entirely to the GPU',
        excerpt: 'Using compute shaders in the browser to generate and mesh terrain in real time without touching the CPU. WGSL dispatch groups, workgroup sizing, and the surprising edge cases of buffer synchronisation.',
        date: '2024-11-08',
        readTime: 15,
        category: 'performance',
        type: 'research',
        tags: ['WebGPU', 'WGSL', 'Procedural', 'Performance'],
        featured: true,
        coverImage: '/signal-webgpu-terrain.svg',
        externalUrl: null,
        relatedIds: ['glsl-shaders-alive', 'r3f-architecture'],
        toc: [
            { id: 'why-compute', label: 'Why Compute Shaders', level: 1 },
            { id: 'wgsl-pipeline', label: 'The WGSL Pipeline', level: 2 },
            { id: 'workgroups', label: 'Workgroup Sizing', level: 2 },
            { id: 'sync', label: 'Buffer Synchronisation', level: 2 },
            { id: 'results', label: 'Benchmark Results', level: 1 },
        ],
        body: `## Why Compute Shaders

JavaScript terrain generation is bounded by the single-threaded CPU. A 512×512 heightfield with 6 octaves of FBM noise takes roughly 80ms in optimised JS — too slow for real-time editing. The same computation in a WebGPU compute shader takes under 4ms.

This is the compute shader opportunity: embarrassingly parallel work that maps naturally to GPU threads.

## The WGSL Pipeline

WebGPU compute uses WGSL (WebGPU Shading Language), which looks like a stricter Rust-flavoured GLSL. The basic structure for terrain generation:

\`\`\`wgsl
@group(0) @binding(0) var<storage, read_write> heightfield: array<f32>;

@compute @workgroup_size(16, 16)
fn main(@builtin(global_invocation_id) id: vec3<u32>) {
    let x = id.x;
    let y = id.y;
    let index = y * TERRAIN_SIZE + x;
    let uv = vec2<f32>(f32(x), f32(y)) / f32(TERRAIN_SIZE);
    heightfield[index] = fbm(uv * 4.0);
}
\`\`\`

The \`@workgroup_size(16, 16)\` means each workgroup processes a 16×16 tile of the heightfield. For a 512×512 grid, you dispatch 32×32 workgroups.

## Workgroup Sizing

The right workgroup size depends on your target GPU's warp/wavefront size. 16×16 (256 threads) is a safe default that maps well to both NVIDIA (32-thread warps) and AMD (64-thread wavefronts). Avoid 8×8 — too much dispatch overhead relative to work. Avoid 32×32 — may exceed per-workgroup shared memory limits.

## Buffer Synchronisation

The subtle gotcha: reading results back from GPU to CPU requires an explicit readback pipeline. WebGPU's async model means you cannot just read the buffer immediately after dispatch:

\`\`\`ts
// After dispatch, copy to a mappable buffer
commandEncoder.copyBufferToBuffer(computeBuffer, 0, readbackBuffer, 0, byteSize)
device.queue.submit([commandEncoder.finish()])

// Async readback — do not block
await readbackBuffer.mapAsync(GPUMapMode.READ)
const data = new Float32Array(readbackBuffer.getMappedRange())
\`\`\`

In practice, for a render-loop workflow, you pipeline the readback: use frame N's GPU results while dispatching frame N+1's compute. This eliminates the stall.

## Benchmark Results

| Resolution | JS (ms) | WebGPU Compute (ms) | Speedup |
|------------|---------|---------------------|---------|
| 256×256    | 22      | 1.1                 | 20×     |
| 512×512    | 88      | 3.8                 | 23×     |
| 1024×1024  | 350     | 14.2                | 24.6×   |

The speedup is consistent because the problem scales with resolution squared — exactly the kind of work GPUs are built for.`,
    },
    {
        id: 'gsap-scrolltrigger-patterns',
        transmissionId: 'SIG-004',
        title: 'GSAP ScrollTrigger in Scroll-Jacked SPAs',
        subtitle: 'Making ScrollTrigger work with custom scroll containers',
        excerpt: 'ScrollTrigger assumes it owns the window scroll. When you have a custom scroll engine or virtual scroller, you need to rethink every default. Here is how to make them cooperate cleanly.',
        date: '2024-09-03',
        readTime: 7,
        category: 'engineering',
        type: 'guide',
        tags: ['GSAP', 'Animation', 'ScrollTrigger', 'React'],
        featured: false,
        coverImage: '/signal-scrolltrigger.svg',
        externalUrl: null,
        relatedIds: ['r3f-architecture'],
        toc: [
            { id: 'problem', label: 'The Default Assumption', level: 1 },
            { id: 'scroller', label: 'Custom Scroller Setup', level: 2 },
            { id: 'cleanup', label: 'React Cleanup', level: 2 },
        ],
        body: `## The Default Assumption

GSAP ScrollTrigger defaults to \`window\` as the scroll target. In a single-page app with a scroll-jacked main container, every trigger fires at the wrong time or not at all.

The fix is the \`scroller\` option — but it requires consistent usage across your entire codebase.

## Custom Scroller Setup

Pass the scroller container element to every ScrollTrigger instance:

\`\`\`ts
gsap.fromTo(element, { opacity: 0 }, {
  opacity: 1,
  scrollTrigger: {
    trigger: element,
    scroller: '#main-scroll',   // your custom scroll container
    start: 'top 75%',
    once: true,
  }
})
\`\`\`

You can also set a default scroller globally to avoid repeating it:

\`\`\`ts
ScrollTrigger.defaults({ scroller: '#main-scroll' })
\`\`\`

## React Cleanup

The most common bug: ScrollTrigger instances that outlive their components.

Always use \`gsap.context()\` and return its \`revert()\` from the \`useEffect\` cleanup:

\`\`\`ts
useEffect(() => {
  const ctx = gsap.context(() => {
    // All ScrollTriggers created here are automatically cleaned up
    gsap.fromTo(ref.current, { y: 24 }, { y: 0, scrollTrigger: { ... } })
  })
  return () => ctx.revert()
}, [])
\`\`\`

Without this, unmounting and remounting components (hot reload, route changes) accumulates orphaned triggers that fire on ghost elements.`,
    },
    {
        id: 'llm-context-window',
        transmissionId: 'SIG-005',
        title: 'Context Window Engineering for Production RAG',
        subtitle: 'What actually matters when chunks meet retrieval',
        excerpt: 'Most RAG guides focus on embedding models. The real gains are in context window management: chunk sizing, overlap strategies, reranking, and compression. A practical breakdown from production systems.',
        date: '2024-07-19',
        readTime: 11,
        category: 'ai-ml',
        type: 'case-study',
        tags: ['LLM', 'RAG', 'AI Engineering', 'Production'],
        featured: false,
        coverImage: '/signal-rag-context.svg',
        externalUrl: null,
        relatedIds: ['typescript-satisfies'],
        toc: [
            { id: 'chunking', label: 'Chunk Sizing Strategy', level: 1 },
            { id: 'reranking', label: 'Reranking', level: 2 },
            { id: 'compression', label: 'Context Compression', level: 2 },
        ],
        body: `## Chunk Sizing Strategy

The standard advice is 512 tokens with 10% overlap. This is wrong for most corpora.

Optimal chunk size depends on your document structure and query type. For technical documentation with code blocks, 256 tokens preserves context better. For narrative prose, 1024 tokens with aggressive overlap captures semantic coherence that smaller chunks lose.

**Practical heuristic**: measure recall@5 on a held-out query set at 256, 512, and 1024. Use the size that wins. Rebuild the index if your document corpus changes significantly.

## Reranking

Embedding similarity retrieves candidates but doesn't rank them well for answer relevance. A cross-encoder reranker (Cohere Rerank, BGE reranker) applied to the top-20 retrieved chunks before passing to the LLM consistently improves answer quality by 15-30% in benchmarks.

The cost is one extra model call per query. At production scale, cache reranked results for identical queries.

## Context Compression

At 128k+ context windows, the temptation is to pass everything. Don't. LLM attention degrades at long contexts — the "lost in the middle" problem is real.

Compress retrieved context before packing the prompt: strip boilerplate, deduplicate similar chunks, and summarise low-relevance sections. A 4k compressed context often outperforms a 32k uncompressed one.`,
    },
    {
        id: 'typescript-satisfies',
        transmissionId: 'SIG-006',
        title: 'TypeScript satisfies Is More Useful Than You Think',
        subtitle: 'The operator that bridges inference and constraints',
        excerpt: 'satisfies lets you validate that an expression matches a type without widening it. The implications for config objects, discriminated unions, and data pipelines are significant and underutilised.',
        date: '2024-05-30',
        readTime: 6,
        category: 'engineering',
        type: 'opinion',
        tags: ['TypeScript', 'Type System', 'Engineering'],
        featured: false,
        coverImage: '/signal-typescript-satisfies.svg',
        externalUrl: null,
        relatedIds: ['r3f-architecture', 'llm-context-window'],
        toc: [
            { id: 'the-gap', label: 'The Gap it Fills', level: 1 },
            { id: 'config', label: 'Config Objects', level: 2 },
            { id: 'unions', label: 'Discriminated Unions', level: 2 },
        ],
        body: `## The Gap it Fills

Before \`satisfies\`, you had two options when typing a value: annotate it (widens, loses literal inference) or don't (gets the type you want, but no validation).

\`\`\`ts
// Annotated — loses literal type of 'color' values
const config: Record<string, { color: string }> = {
  primary: { color: 'blue' }
}
config.primary.color  // string — too wide

// Unannotated — no validation, typos slip through
const config = {
  primary: { color: 'blue' }
}
\`\`\`

\`satisfies\` gives you both:

\`\`\`ts
const config = {
  primary: { color: 'blue' },
  secondary: { color: 'red' },
} satisfies Record<string, { color: string }>

config.primary.color  // 'blue' — literal preserved
\`\`\`

## Config Objects

The most common use case: route config, theme tokens, feature flags. Anything where you want both the constraint (the shape is correct) and the inference (the specific values are knowable downstream).

## Discriminated Unions

\`satisfies\` is particularly useful for validating discriminated union members without losing the narrow type:

\`\`\`ts
type Action = { type: 'SET'; value: string } | { type: 'CLEAR' }

const action = { type: 'SET', value: 'hello' } satisfies Action
action.type  // 'SET' — not 'SET' | 'CLEAR'
\`\`\`

This makes exhaustive switch statements safer and enables narrowing at the call site without additional type guards.`,
    },
]

/** Derive a formatted date string */
export function formatSignalDate(iso: string): string {
    const [y, m, d] = iso.split('-').map(Number)
    const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']
    return `${String(d).padStart(2, '0')} ${months[m - 1]} ${y}`
}

/** Get related entries by ID */
export function getRelated(entry: SignalEntry, all: SignalEntry[]): SignalEntry[] {
    return entry.relatedIds
        .map((id) => all.find((e) => e.id === id))
        .filter((e): e is SignalEntry => e !== undefined)
}
