import { useEffect, useState } from 'react'
import { LoadingScreen } from '@/components/ui/LoadingScreen'
import { ParallaxStarsBackground } from '@/components/ui/ParallaxStarsBackground'
import { CommunicationFooter } from '@/components/ui/CommunicationFooter'
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

export default function App() {
  const setGpuTier = useAppStore((state) => state.setGpuTier)
  const setReducedMotion = useAppStore((state) => state.setReducedMotion)
  const device = useDevice()
  const [revealed, setRevealed] = useState(false)

  useEffect(() => {
    document.documentElement.dataset.theme = 'dark'
    try { localStorage.removeItem('void_theme') } catch { /* ignore */ }
    setGpuTier(detectGpuTier())
    setReducedMotion(window.matchMedia('(prefers-reduced-motion: reduce)').matches)

    const hash = window.location.hash.replace('#', '')
    if (hash) {
      window.setTimeout(() => {
        document.getElementById(hash)?.scrollIntoView({ behavior: 'smooth' })
      }, 800)
    }
  }, [setGpuTier, setReducedMotion])

  return (
    <>
      <a className="skip-link" href="#main-scroll">Skip to main content</a>
      {!revealed && (
        <LoadingScreen
          onComplete={() => setRevealed(true)}
          reducedMotion={device.reducedMotion}
          isLowPower={device.isLowPower}
        />
      )}

      <ParallaxStarsBackground reducedMotion={device.reducedMotion} />
      <TransitionEnvironment />
      <Navigation />

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
        <BrandLogo onClick={() => document.getElementById('hero')?.scrollIntoView({ behavior: 'smooth' })} />
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
