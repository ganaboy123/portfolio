/**
 * BIG-HKA — Brand wordmark only.
 * "BIG-" in white, "HKA" in cyan→violet gradient.
 */

interface BrandLogoProps {
    onClick?: () => void
}

export function BrandLogo({ onClick }: BrandLogoProps) {
    return (
        <button
            onClick={onClick}
            aria-label="BIG-HKA — go to home"
            style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 3,
                background: 'none',
                border: 'none',
                padding: 0,
                cursor: 'pointer',
                userSelect: 'none',
                lineHeight: 1,
            }}
        >
            {/* Wordmark */}
            <div style={{ display: 'flex', alignItems: 'baseline' }}>
                <span style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '1.25rem',
                    fontWeight: 700,
                    letterSpacing: '-0.02em',
                    color: '#eef2ff',
                }}>
                    BIG-
                </span>
                <span style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '1.25rem',
                    fontWeight: 700,
                    letterSpacing: '-0.02em',
                    background: 'linear-gradient(90deg, #00c8e8 0%, #9b5cf6 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                }}>
                    HKA
                </span>
            </div>

            {/* Sub-rule */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <div style={{ flex: 1, height: 1, background: 'linear-gradient(to right, rgba(0,200,232,0.7), rgba(155,92,246,0.5))' }} />
                <span style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.42rem',
                    letterSpacing: '0.26em',
                    textTransform: 'uppercase',
                    color: 'rgba(109,232,248,0.55)',
                    whiteSpace: 'nowrap',
                }}>
                    SYSTEMS · CRAFT
                </span>
                <div style={{ flex: 1, height: 1, background: 'linear-gradient(to left, rgba(0,200,232,0.7), rgba(155,92,246,0.5))' }} />
            </div>
        </button>
    )
}
