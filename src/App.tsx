import { useEffect, useState } from 'react'
import { LoadingScreen } from '@/components/ui/LoadingScreen'
import { ParallaxStarsBackground } from '@/components/ui/ParallaxStarsBackground'
import { CommunicationFooter } from '@/components/ui/CommunicationFooter'
import { ScrollJourneyLine } from '@/components/ui/ScrollJourneyLine'
import { TransitionEnvironment } from '@/components/ui/TransitionEnvironment'
import { Navigation } from '@/components/navigation/Navigation'
import { ModalPortal } from '@/components/modals/ModalPortal'
import { BrandLogo } from '@/components/ui/BrandLogo'
import { HeroSection } from '@/components/sections/HeroSection'
import { AboutSection } from '@/components/sections/AboutSection'
import { SkillsSection } from '@/components/sections/SkillsSection'
import { ExperienceSection } from '@/components/sections/ExperienceSection'
import { ProjectsSection } from '@/components/sections/ProjectsSection'
import { BlogSection } from '@/components/sections/BlogSection'
import { ContactSection } from '@/components/sections/ContactSection'
import { AssistantOrb } from '@/components/assistant/AssistantOrb'
import { useAppStore } from '@/store/useAppStore'
import { useDevice } from '@/hooks/useDevice'
import { detectGpuTier } from '@/lib/utils'

const THEME_KEY = 'void_theme'

export default function App() {
  const setGpuTier = useAppStore((state) => state.setGpuTier)
  const setReducedMotion = useAppStore((state) => state.setReducedMotion)
  const device = useDevice()

  const [revealed, setRevealed] = useState(false)
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    try { return (localStorage.getItem(THEME_KEY) as 'dark' | 'light') || 'dark' } catch { return 'dark' }
  })

  useEffect(() => {
    setGpuTier(detectGpuTier())
    setReducedMotion(window.matchMedia('(prefers-reduced-motion: reduce)').matches)

    const hash = window.location.hash.replace('#', '')
    if (hash) {
      setTimeout(() => {
        document.getElementById(hash)?.scrollIntoView({ behavior: 'smooth' })
      }, 800)
    }
  }, [setGpuTier, setReducedMotion])

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    try { localStorage.setItem(THEME_KEY, theme) } catch { /* ignore */ }
  }, [theme])

  const toggleTheme = () => setTheme((t) => t === 'dark' ? 'light' : 'dark')
  const handleLoadComplete = () => { setRevealed(true) }

  return (
    <>
      <a className="skip-link" href="#main-scroll">Skip to main content</a>
      {!revealed && (
        <LoadingScreen
          onComplete={handleLoadComplete}
          reducedMotion={device.reducedMotion}
          isLowPower={device.isLowPower}
        />
      )}

      <ParallaxStarsBackground reducedMotion={device.reducedMotion} />
      <TransitionEnvironment />
      <ScrollJourneyLine />
      <Navigation />

      {/* Theme toggle — fixed top right */}
      <button
        onClick={toggleTheme}
        aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
        style={{
          position: 'fixed',
          top: 'max(16px, env(safe-area-inset-top))',
          right: device.isMobile ? 72 : 56,
          zIndex: 'var(--z-nav)' as unknown as number,
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          padding: '6px 12px',
          background: 'var(--color-glass-bg)',
          border: '1px solid var(--color-border-accent)',
          borderRadius: 'var(--radius-sm)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          cursor: 'pointer',
          fontFamily: 'var(--font-mono)',
          fontSize: '0.55rem',
          letterSpacing: '0.16em',
          color: 'var(--color-accent-cyan)',
          minHeight: 32,
          transition: 'background 200ms, border-color 200ms',
        }}
      >
        <span style={{ fontSize: '0.85rem', lineHeight: 1 }}>
          {theme === 'dark' ? '☀' : '◑'}
        </span>
        {!device.isMobile && (theme === 'dark' ? 'LIGHT' : 'DARK')}
      </button>

      {/* Brand logo — desktop only */}
      <div
        style={{
          position: 'fixed',
          top: 'max(16px, env(safe-area-inset-top))',
          left: 'clamp(52px, 5vw, 72px)',
          zIndex: 'var(--z-nav)' as unknown as number,
          pointerEvents: 'all',
          display: device.isMobile ? 'none' : 'block',
        }}
      >
        <BrandLogo
          onClick={() => {
            document.getElementById('hero')?.scrollIntoView({ behavior: 'smooth' })
          }}
        />
      </div>

      <AssistantOrb />
      <ModalPortal />

      <main
        id="main-scroll"
        className="portfolio-content"
        tabIndex={-1}
        aria-label="Portfolio content"
        style={{
          position: 'relative',
          zIndex: 'var(--z-sections)' as unknown as number,
          overflowY: 'scroll',
          overflowX: 'hidden',
          height: '100vh',
          scrollSnapType: 'none',
        }}
      >
        <HeroSection revealed={revealed} />
        <AboutSection />
        <SkillsSection />
        <ExperienceSection />
        <ProjectsSection />
        <BlogSection />
        <ContactSection />
        <CommunicationFooter />
      </main>
    </>
  )
}
